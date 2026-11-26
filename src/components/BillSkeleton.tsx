import { Box, Skeleton, Stack } from '@mui/material'
import { ListRow, Panel, Rows, Stats } from '@anmitsu/ui'

const ChipSkeleton = ({ width }: { width: number }) => <Skeleton variant='rectangular' width={width} height={24} />

/** A section's heading, the size of the `Section` heading from @anmitsu/ui. */
const Heading = ({ width }: { width: number }) => (
  <Box sx={{ height: 32, mb: 1, display: 'flex', alignItems: 'center' }}>
    <Skeleton width={width} height={24} />
  </Box>
)

/**
 * Placeholder shown while a shared bill is loading. It follows the layout of the read-only bill (banner, People, Items,
 * Discount and taxes, Total, Summary), so the page does not jump when the bill arrives.
 */
const BillSkeleton = () => {
  return (
    <Stack spacing={3} role='status' aria-busy='true' aria-label='Loading shared bill'>
      {/* The "viewing a shared bill" banner */}
      <Skeleton variant='rectangular' height={48} />
      {/* People */}
      <Box>
        <Heading width={60} />
        <Panel>
          <Stack direction='row' spacing={0.75}>
            {[56, 48, 64].map((width, i) => (
              <ChipSkeleton key={i} width={width} />
            ))}
          </Stack>
        </Panel>
      </Box>
      {/* Items */}
      <Box>
        <Heading width={48} />
        <Panel flush>
          <Rows>
            {[140, 100, 120].map((nameWidth, i) => (
              <Stack key={i} spacing={1} sx={{ px: 2, py: 1.5 }}>
                <Stack direction='row' sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Skeleton width={nameWidth} />
                    <Skeleton width={70} />
                  </Box>
                  <Skeleton width={56} />
                </Stack>
                <Stack direction='row' spacing={0.75}>
                  <ChipSkeleton width={56} />
                  <ChipSkeleton width={48} />
                </Stack>
              </Stack>
            ))}
          </Rows>
        </Panel>
      </Box>
      {/* Discount, service charge and GST */}
      <Box>
        <Heading width={150} />
        <Panel flush>
          <Rows>
            {[110, 130, 90].map((width, i) => (
              <ListRow key={i} sx={{ justifyContent: 'space-between' }}>
                <Skeleton width={width} />
                <Skeleton width={40} />
              </ListRow>
            ))}
          </Rows>
        </Panel>
      </Box>
      {/* Total */}
      <Box>
        <Heading width={44} />
        <Panel flush sx={{ py: 1 }}>
          {[70, 130, 70, 50].map((labelWidth, i) => (
            <Stack key={i} direction='row' sx={{ justifyContent: 'space-between', px: 2, py: 0.75 }}>
              <Skeleton width={labelWidth} />
              <Skeleton width={56} />
            </Stack>
          ))}
        </Panel>
      </Box>
      {/* Summary */}
      <Box>
        <Heading width={80} />
        <Stack spacing={1.5}>
          <Stats>
            {[0, 1].map(i => (
              <Panel key={i} sx={{ flex: '1 1 0', p: 2 }}>
                <Skeleton width={50} />
                <Skeleton width={90} height={32} />
              </Panel>
            ))}
          </Stats>
          <Panel flush>
            <Rows>
              {[60, 50, 70].map((width, i) => (
                <ListRow key={i} sx={{ justifyContent: 'space-between' }}>
                  <Box>
                    <Skeleton width={width} />
                    <Skeleton width={80} />
                  </Box>
                  <Skeleton width={56} />
                </ListRow>
              ))}
            </Rows>
          </Panel>
        </Stack>
      </Box>
    </Stack>
  )
}

export default BillSkeleton
