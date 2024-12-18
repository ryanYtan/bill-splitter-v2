import BigNumber from 'bignumber.js'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid'

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

export type ServiceTax = {
  enable: boolean
  percentage: BigNumber
}

export type GstTax = {
  enable: boolean
  percentage: BigNumber
}

export type BillData = {
  users: User[]
  items: Item[]
  payer: string | undefined
  serviceTax: ServiceTax
  gstTax: GstTax
  userItems: { userId: string; itemId: string }[]
}

export type BillMethods = {
  addUser: (name: string) => void
  removeUser: (id: string) => void
  addItem: (item: Omit<Item, 'id'>) => void
  removeItem: (id: string) => void
  setPayer: (id: string | undefined) => void
  addUserItem: (userId: string, itemId: string) => void
  removeUserItem: (userId: string, itemId: string) => void
  itemHasContributor: (userId: string, itemId: string) => boolean
  setServiceTaxEnabled: (enabled: boolean) => void
  setGstTaxEnabled: (enabled: boolean) => void
  setServiceTax: (tax: BigNumber) => void
  setGstTax: (tax: BigNumber) => void
  computeSubtotal: () => BigNumber
  computeServiceTax: () => BigNumber
  computeGstTax: () => BigNumber
  computeTotal: () => BigNumber
  computeUserShare: (userId: string) => BigNumber
}

const useBill = (): {
  data: BillData
  methods: BillMethods
} => {
  const [users, setUsers] = useState<User[]>([])
  const [items, setItems] = useState<Item[]>([])
  const [payer, setPayer] = useState<string>()
  const [serviceTax, setServiceTax] = useState<ServiceTax>({ enable: true, percentage: new BigNumber(10) })
  const [gstTax, setGstTax] = useState<GstTax>({ enable: true, percentage: new BigNumber(9) })
  const [userItems, setUserItems] = useState<{ userId: string; itemId: string }[]>([])

  const computeSubtotal = () => {
    let subtotal = new BigNumber(0)
    for (const item of items) {
      const itemTotal = item.quantity.multipliedBy(item.pricePerUnit)
      subtotal = subtotal.plus(itemTotal)
    }
    return subtotal
  }

  const computeServiceTax = () => {
    if (!serviceTax.enable) {
      return new BigNumber(0)
    }
    const subtotal = computeSubtotal()
    const rate = serviceTax.percentage.dividedBy(100)
    return subtotal.multipliedBy(rate).decimalPlaces(2, BigNumber.ROUND_UP)
  }

  const computeGstTax = () => {
    if (!gstTax.enable) {
      return new BigNumber(0)
    }
    const subtotal = computeSubtotal()
    const serviceTax = computeServiceTax()
    const rate = gstTax.percentage.dividedBy(100)
    return subtotal.plus(serviceTax).multipliedBy(rate).decimalPlaces(2, BigNumber.ROUND_UP)
  }

  const computeTotal = () => {
    const subtotal = computeSubtotal()
    const serviceTax = computeServiceTax()
    const gstTax = computeGstTax()
    return subtotal.plus(serviceTax).plus(gstTax).decimalPlaces(2, BigNumber.ROUND_UP)
  }

  const computeUserShare = (userId: string) => {
    const uis = userItems.filter(ui => ui.userId === userId)
    let share = new BigNumber(0)
    for (const ui of uis) {
      const item = items.find(i => i.id === ui.itemId)
      if (!item) {
        continue
      }
      const numOfContributorsForItem = userItems.filter(ui => ui.itemId === item.id)
      const subtotalOfItem = item.pricePerUnit.multipliedBy(item.quantity)
      const shareForItem = subtotalOfItem.dividedBy(numOfContributorsForItem.length)
      share = share.plus(shareForItem)
    }
    const shareAsProportion = share.dividedBy(computeSubtotal()) //a number between 0 and 1
    const shareOfServiceCharge = shareAsProportion.multipliedBy(computeServiceTax())
    const shareOfGst = shareAsProportion.multipliedBy(computeGstTax())
    return share.plus(shareOfServiceCharge).plus(shareOfGst).decimalPlaces(2, BigNumber.ROUND_UP)
  }

  return {
    data: {
      users,
      items,
      payer,
      serviceTax,
      gstTax,
      userItems,
    },
    methods: {
      addUser: (name: string) => {
        const id = uuidv4()
        setUsers(prev => [...prev, { id, name }])
      },
      removeUser: (id: string) => {
        setUsers(prev => prev.filter(u => u.id !== id))
        setUserItems(prev => prev.filter(ui => ui.userId !== id))
        if (!!payer && payer === id) {
          setPayer(undefined)
        }
      },
      addItem: (item: Omit<Item, 'id'>) => {
        const id = uuidv4()
        setItems(prev => [...prev, { id, ...item }])
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
      setServiceTaxEnabled: (enabled: boolean) => {
        setServiceTax(prev => ({ ...prev, enable: enabled }))
      },
      setGstTaxEnabled: (enabled: boolean) => {
        setGstTax(prev => ({ ...prev, enable: enabled }))
      },
      setServiceTax: (rate: BigNumber) => {
        setServiceTax(prev => ({ ...prev, percentage: rate }))
      },
      setGstTax: (rate: BigNumber) => {
        setGstTax(prev => ({ ...prev, percentage: rate }))
      },
      computeSubtotal,
      computeServiceTax,
      computeGstTax,
      computeTotal,
      computeUserShare,
    },
  }
}

export default useBill
