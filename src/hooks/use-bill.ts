import BigNumber from 'bignumber.js'
import { useMemo, useState } from 'react'
import { v4 as uuidv4 } from 'uuid'
import { computeBill } from '../bill/calc'
import type { BillData, Item, NewItem, TaxSetting, User, UserItem } from '../bill/types'
import { sanitizePercentage } from '../bill/validate'

export type { BillData, Item, NewItem, TaxSetting, User, UserItem } from '../bill/types'

export type TaxKind = 'serviceTax' | 'gstTax'

export type BillMethods = {
  addUser: (name: string) => void
  removeUser: (id: string) => void
  addItem: (item: NewItem) => string
  removeItem: (id: string) => void
  setPayer: (id: string | undefined) => void
  addUserItem: (userId: string, itemId: string) => void
  removeUserItem: (userId: string, itemId: string) => void
  itemHasContributor: (userId: string, itemId: string) => boolean
  setTax: (kind: TaxKind, patch: Partial<TaxSetting>) => void
  computeSubtotal: () => BigNumber
  computeServiceTax: () => BigNumber
  computeGstTax: () => BigNumber
  computeTotal: () => BigNumber
  computeUserShare: (userId: string) => BigNumber
}

const useBill = (
  initial?: BillData
): {
  data: BillData
  methods: BillMethods
} => {
  const [users, setUsers] = useState<User[]>(initial?.users ?? [])
  const [items, setItems] = useState<Item[]>(initial?.items ?? [])
  const [payer, setPayer] = useState<string | undefined>(initial?.payer)
  const [serviceTax, setServiceTax] = useState<TaxSetting>(initial?.serviceTax ?? { enable: true, percentage: new BigNumber(10) })
  const [gstTax, setGstTax] = useState<TaxSetting>(initial?.gstTax ?? { enable: true, percentage: new BigNumber(9) })
  const [userItems, setUserItems] = useState<UserItem[]>(initial?.userItems ?? [])

  const data: BillData = useMemo(() => ({ users, items, payer, serviceTax, gstTax, userItems }), [users, items, payer, serviceTax, gstTax, userItems])
  const totals = useMemo(() => computeBill(data), [data])

  return {
    data,
    methods: {
      addUser: (name: string) => {
        const id = uuidv4()
        setUsers(prev => [...prev, { id, name }])
      },
      removeUser: (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id))
        setUserItems(prev => prev.filter(ui => ui.userId !== id))
        setPayer(prev => (prev === id ? undefined : prev))
      },
      addItem: (item: NewItem) => {
        const id = uuidv4()
        setItems(prev => [...prev, { id, ...item }])
        return id
      },
      removeItem: (id: string) => {
        setItems(prev => prev.filter(i => i.id !== id))
        setUserItems(prev => prev.filter(ui => ui.itemId !== id))
      },
      setPayer,
      addUserItem: (userId: string, itemId: string) => {
        setUserItems(prev => {
          if (prev.find(ui => ui.userId === userId && ui.itemId === itemId)) {
            return prev
          }
          return [...prev, { userId, itemId }]
        })
      },
      removeUserItem: (userId: string, itemId: string) => {
        setUserItems(prev => prev.filter(ui => ui.userId !== userId || ui.itemId !== itemId))
      },
      itemHasContributor: (userId: string, itemId: string) => {
        return userItems.some(ui => ui.userId === userId && ui.itemId === itemId)
      },
      setTax: (kind: TaxKind, patch: Partial<TaxSetting>) => {
        const sanitized = patch.percentage ? { ...patch, percentage: sanitizePercentage(patch.percentage) } : patch
        const setTax = kind === 'serviceTax' ? setServiceTax : setGstTax
        setTax(prev => ({ ...prev, ...sanitized }))
      },
      computeSubtotal: () => totals.subtotal,
      computeServiceTax: () => totals.serviceCharge,
      computeGstTax: () => totals.gst,
      computeTotal: () => totals.total,
      computeUserShare: (userId: string) => totals.shares.get(userId) ?? new BigNumber(0),
    },
  }
}

export default useBill
