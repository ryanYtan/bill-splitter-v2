import { Box, InputAdornment, Switch, Typography } from '@mui/material'
import { ListRow, Panel, Rows, Section } from '@anmitsu/ui'
import { BillData, BillMethods, TaxSetting } from './hooks/use-bill'
import DecimalField from './components/DecimalField'
import { parseDiscount, parsePercentage } from './bill/validate'
import { MAX_PRICE } from './bill/limits'
import { formatMoney } from './bill/money'
import BigNumber from 'bignumber.js'

const valueSx = { fontWeight: 500, fontVariantNumeric: 'tabular-nums' } as const

const RowLabel = ({ label, hint }: { label: string; hint?: string }) => (
  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
    <Typography>{label}</Typography>
    {hint && (
      <Typography variant='caption' color='textSecondary' component='div'>
        {hint}
      </Typography>
    )}
  </Box>
)

interface TaxRowProps {
  label: string
  hint: string
  tax: TaxSetting
  readOnly?: boolean
  onChange: (patch: Partial<TaxSetting>) => void
}

const TaxRow = (props: TaxRowProps) => {
  const id = `tax-${props.label.replace(/\W+/g, '-').toLowerCase()}`
  return (
    <ListRow sx={{ py: 1 }}>
      <Box id={id} sx={{ flexGrow: 1, minWidth: 0, display: 'flex' }}>
        <RowLabel label={props.label} hint={props.hint} />
      </Box>
      {props.readOnly ? (
        <Typography color={props.tax.enable ? undefined : 'textSecondary'} sx={valueSx}>
          {props.tax.enable ? `${props.tax.percentage.toFixed()}%` : 'Off'}
        </Typography>
      ) : (
        <DecimalField
          isAllowed={values => {
            const { formattedValue, floatValue } = values
            return formattedValue === '' || (floatValue !== undefined && 0 <= floatValue && floatValue <= 100)
          }}
          decimalScale={2}
          allowNegative={false}
          allowLeadingZeros={false}
          value={props.tax.percentage}
          onChange={text => props.onChange({ percentage: parsePercentage(text) })}
          disabled={!props.tax.enable}
          fullWidth={false}
          slotProps={{
            input: { endAdornment: <InputAdornment position='end'>%</InputAdornment> },
            htmlInput: { inputMode: 'decimal', 'aria-label': `${props.label} percentage`, style: { textAlign: 'right' } },
          }}
          sx={{ width: 88, flexShrink: 0 }}
        />
      )}
      {!props.readOnly && <Switch checked={props.tax.enable} onChange={e => props.onChange({ enable: e.target.checked })} slotProps={{ input: { 'aria-labelledby': id } }} sx={{ mx: 0 }} />}
    </ListRow>
  )
}

interface DiscountRowProps {
  discount: BigNumber
  readOnly?: boolean
  onChange: (amount: BigNumber) => void
}

const DiscountRow = (props: DiscountRowProps) => {
  return (
    <ListRow sx={{ py: 1 }}>
      <RowLabel label='Discount' hint='Taken off before service charge and GST' />
      {props.readOnly ? (
        <Typography sx={valueSx}>{formatMoney(props.discount)}</Typography>
      ) : (
        <DecimalField
          isAllowed={values => {
            const { formattedValue, floatValue } = values
            return formattedValue === '' || (floatValue !== undefined && 0 <= floatValue && floatValue <= MAX_PRICE)
          }}
          decimalScale={2}
          allowNegative={false}
          allowLeadingZeros={false}
          value={props.discount}
          emptyWhenZero
          placeholder='0.00'
          onChange={text => props.onChange(parseDiscount(text))}
          fullWidth={false}
          slotProps={{
            input: { startAdornment: <InputAdornment position='start'>$</InputAdornment> },
            htmlInput: { inputMode: 'decimal', 'aria-label': 'Discount amount', style: { textAlign: 'right' } },
          }}
          sx={{ width: 112, flexShrink: 0 }}
        />
      )}
    </ListRow>
  )
}

interface TaxesProps {
  data: BillData
  methods: BillMethods
  readOnly?: boolean
}

const Taxes = ({ data, methods, readOnly }: TaxesProps) => {
  return (
    <Section title='Discount and taxes'>
      <Panel flush>
        <Rows>
          {(!readOnly || data.discount.isGreaterThan(0)) && <DiscountRow discount={data.discount} readOnly={readOnly} onChange={methods.setDiscount} />}
          <TaxRow label='Service charge' hint='On the subtotal' tax={data.serviceTax} readOnly={readOnly} onChange={patch => methods.setTax('serviceTax', patch)} />
          <TaxRow label='GST' hint='On the subtotal plus service charge' tax={data.gstTax} readOnly={readOnly} onChange={patch => methods.setTax('gstTax', patch)} />
        </Rows>
      </Panel>
    </Section>
  )
}

export default Taxes
