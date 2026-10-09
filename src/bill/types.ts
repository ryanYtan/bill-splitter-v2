import BigNumber from 'bignumber.js'

export type User = {
  id: string
  name: string
}

export type Item = {
  id: string
  name: string
  pricePerUnit: BigNumber
  quantity: BigNumber
}

export type NewItem = Omit<Item, 'id'>

export type UserItem = {
  userId: string
  itemId: string
}

export type TaxSetting = {
  enable: boolean
  percentage: BigNumber
}

export type BillData = {
  users: User[]
  items: Item[]
  payer: string | undefined
  serviceTax: TaxSetting
  gstTax: TaxSetting
  userItems: UserItem[]
}
