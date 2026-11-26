import { IconButton, Stack, Tooltip, Typography } from '@mui/material'
import { AddButton, Empty, Panel, Rows, Section } from '@anmitsu/ui'
import { BillData, BillMethods } from './hooks/use-bill'
import { useState } from 'react'
import ItemForm from './components/ItemForm'
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined'
import UserItemSelector from './UserItemSelector'
import PersonChip from './components/PersonChip'
import ReceiptScanner from './components/ReceiptScanner'
import ItemSummary from './components/ItemSummary'
import { formatMoney } from './bill/money'

const Items = ({ data, methods, readOnly }: { data: BillData; methods: BillMethods; readOnly?: boolean }) => {
  const [open, setOpen] = useState(false)

  const actions = !readOnly && (
    <Stack direction='row' spacing={0.5} sx={{ alignItems: 'center' }}>
      <ReceiptScanner data={data} methods={methods} />
      <AddButton onClick={() => setOpen(true)}>Add item</AddButton>
    </Stack>
  )

  return (
    <Section title='Items' action={actions}>
      <Panel flush>
        {data.items.length === 0 ? (
          <Empty>{readOnly ? 'This bill has no items.' : 'No items yet. Add them one at a time, or scan the receipt.'}</Empty>
        ) : (
          <Rows>
            {data.items.map(item => {
              const contributors = data.users.filter(u => methods.itemHasContributor(u.id, item.id))
              return (
                <Stack key={item.id} spacing={1} sx={{ px: 2, py: 1.5 }}>
                  <Stack direction='row' spacing={1} sx={{ alignItems: 'flex-start' }}>
                    <ItemSummary item={item} sx={{ flexGrow: 1 }} />
                    <Typography sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>{formatMoney(item.pricePerUnit.times(item.quantity))}</Typography>
                    {!readOnly && (
                      <Tooltip title='Remove item'>
                        <IconButton size='small' aria-label={`Remove ${item.name}`} onClick={() => methods.removeItem(item.id)} sx={{ mt: -0.25, mr: -0.75 }}>
                          <DeleteOutlinedIcon fontSize='small' />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Stack>
                  {(contributors.length > 0 || !readOnly) && (
                    <Stack direction='row' useFlexGap sx={{ flexWrap: 'wrap', gap: 0.75 }}>
                      {contributors.map(user => (
                        <PersonChip key={user.id} color='primary' user={user} onDelete={readOnly ? undefined : () => methods.removeUserItem(user.id, item.id)} />
                      ))}
                      {!readOnly && <UserItemSelector data={data} methods={methods} item={item} empty={contributors.length === 0} />}
                    </Stack>
                  )}
                </Stack>
              )
            })}
          </Rows>
        )}
      </Panel>
      {!readOnly && open && <ItemForm data={data} methods={methods} onClose={() => setOpen(false)} />}
    </Section>
  )
}

export default Items
