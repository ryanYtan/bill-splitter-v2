import { Box, Skeleton, Stack } from '@mui/material'
import FlexBox from './FlexBox'
import Section from './Section/Section'
import SectionContainer from './Section/SectionContainer'

const ChipSkeleton = ({ width }: { width: number }) => <Skeleton variant='rounded' width={width} height={24} sx={{ borderRadius: 4 }} />

/** Placeholder shown while a shared bill is loading. It follows the layout of the read-only bill, so the page does not jump when the bill arrives. */
const BillSkeleton = () => {
  return (
    <Stack spacing={1} role='status' aria-busy='true' aria-label='Loading shared bill'>
      {/* The "viewing a shared bill" banner */}
      <Skeleton variant='rounded' height={48} />
      {/* Users */}
      <SectionContainer>
        <Section sx={{ p: 2 }}>
          <FlexBox sx={{ gap: 0.5 }}>
            {[64, 80, 56].map((width, i) => (
              <ChipSkeleton key={i} width={width} />
            ))}
          </FlexBox>
        </Section>
      </SectionContainer>
      {/* Items */}
      <SectionContainer>
        {[140, 100, 120].map((nameWidth, i) => (
          <Section key={i} sx={{ p: 2 }}>
            <FlexBox>
              <Box sx={{ width: 200 }}>
                <Skeleton width={nameWidth} />
                <Skeleton width={70} />
                <Skeleton width={50} />
              </Box>
              <FlexBox sx={{ flex: 1, gap: 0.5 }}>
                <ChipSkeleton width={64} />
                <ChipSkeleton width={80} />
              </FlexBox>
            </FlexBox>
          </Section>
        ))}
      </SectionContainer>
      {/* Discount, service charge and GST */}
      <SectionContainer>
        {[160, 220, 130].map((width, i) => (
          <Section key={i} sx={{ py: 2, px: 2 }}>
            <Skeleton width={width} />
          </Section>
        ))}
      </SectionContainer>
      {/* Price breakdown */}
      <SectionContainer>
        {[90, 130, 50, 70].map((labelWidth, i) => (
          <Section key={i} sx={{ px: 2, py: 1 }}>
            <FlexBox sx={{ justifyContent: 'flex-end' }}>
              <Skeleton width={labelWidth} />
              <FlexBox sx={{ justifyContent: 'flex-end', width: 80 }}>
                <Skeleton width={56} />
              </FlexBox>
            </FlexBox>
          </Section>
        ))}
      </SectionContainer>
      {/* Who paid */}
      <SectionContainer>
        <Section sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Skeleton width={60} />
            <FlexBox sx={{ gap: 0.5, justifyContent: 'center' }}>
              <ChipSkeleton width={64} />
            </FlexBox>
          </Stack>
        </Section>
      </SectionContainer>
      {/* Report */}
      <SectionContainer>
        <Section sx={{ p: 2 }}>
          <Stack spacing={1}>
            <Skeleton width={110} />
            <Skeleton width='90%' />
            <Skeleton width='70%' />
            <Skeleton width='80%' />
          </Stack>
        </Section>
      </SectionContainer>
    </Stack>
  )
}

export default BillSkeleton
