import { ClickAwayListener, Tooltip } from '@mui/material'
import { useState } from 'react'
import InfoIcon from '@mui/icons-material/Info'

interface ClickTooltipIconProps {
  title: string
}

const ClickAwayTooltip = (props: ClickTooltipIconProps) => {
  const { title } = props
  const [showTooltip, setShowTooltip] = useState(false)

  return (
    <ClickAwayListener onClickAway={() => setShowTooltip(false)}>
      <Tooltip title={title} open={showTooltip} onClick={() => setShowTooltip(true)} onClose={() => setShowTooltip(false)}>
        <InfoIcon fontSize='small' />
      </Tooltip>
    </ClickAwayListener>
  )
}

export default ClickAwayTooltip
