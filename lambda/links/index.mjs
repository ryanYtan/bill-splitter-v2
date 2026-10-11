// Short share links for Bill Splitter: stores a share token (the same compressed text a `?share=` link
// carries) under a short id for 30 days. Runs as a Lambda function URL behind the CloudFront behaviour
// `/a/billsplit/api/*`; deployed by hand (see CLAUDE.md). The AWS SDK comes with the Node.js runtime.
import { createHash } from 'node:crypto'
import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb'

const TABLE_NAME = process.env.TABLE_NAME
const TTL_SECONDS = 30 * 24 * 60 * 60
// A token is a few hundred characters for an ordinary bill; anything larger keeps using the long link
const MAX_TOKEN_LENGTH = 20_000
const ID_LENGTH = 10
const TOKEN_PATTERN = /^[A-Za-z0-9_-]+$/
const LINK_PATH = new RegExp(`/api/links/([A-Za-z0-9_-]{${ID_LENGTH}})$`)

const db = new DynamoDBClient({})

const respond = (statusCode, body) => ({
  statusCode,
  headers: { 'content-type': 'application/json', 'cache-control': 'no-store' },
  body: JSON.stringify(body),
})

const nowSeconds = () => Math.floor(Date.now() / 1000)

// The id is derived from the token, so sharing the same bill twice gives the same link instead of a second row
const idFor = token => createHash('sha256').update(token).digest('base64url').slice(0, ID_LENGTH)

const createLink = async event => {
  const token = event.isBase64Encoded ? Buffer.from(event.body ?? '', 'base64').toString('utf8') : (event.body ?? '')
  if (token.length > MAX_TOKEN_LENGTH) {
    return respond(413, { error: 'Bill is too large for a short link' })
  }
  if (!TOKEN_PATTERN.test(token)) {
    return respond(400, { error: 'Invalid token' })
  }
  const id = idFor(token)
  try {
    await db.send(
      new PutItemCommand({
        TableName: TABLE_NAME,
        Item: { id: { S: id }, token: { S: token }, expiresAt: { N: String(nowSeconds() + TTL_SECONDS) } },
        // Refuses to replace a different bill that happens to share the id; the app falls back to the long link
        ConditionExpression: 'attribute_not_exists(id) OR #token = :token',
        ExpressionAttributeNames: { '#token': 'token' },
        ExpressionAttributeValues: { ':token': { S: token } },
      })
    )
  } catch (e) {
    if (e.name === 'ConditionalCheckFailedException') {
      return respond(409, { error: 'Id already in use' })
    }
    throw e
  }
  return respond(200, { id })
}

const readLink = async id => {
  const { Item } = await db.send(new GetItemCommand({ TableName: TABLE_NAME, Key: { id: { S: id } } }))
  // DynamoDB removes expired rows some time after they expire, so check the timestamp as well
  if (!Item || Number(Item.expiresAt.N) <= nowSeconds()) {
    return respond(404, { error: 'Link not found or expired' })
  }
  return respond(200, { token: Item.token.S })
}

export const handler = async event => {
  const method = event.requestContext?.http?.method
  const path = event.rawPath ?? ''
  try {
    if (method === 'POST' && path.endsWith('/api/links')) {
      return await createLink(event)
    }
    const match = method === 'GET' ? LINK_PATH.exec(path) : null
    if (match) {
      return await readLink(match[1])
    }
    return respond(404, { error: 'Not found' })
  } catch (e) {
    console.error(e)
    return respond(500, { error: 'Internal error' })
  }
}
