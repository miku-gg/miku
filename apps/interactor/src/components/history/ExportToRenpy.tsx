import { Tooltip } from '@mikugg/ui-kit'
import { useState } from 'react'
import { SiRenpy } from 'react-icons/si'
import { downloadRenPyProject, exportToRenPy } from '../../libs/exportToRenpy'
import { RootState } from '../../state/store'
import './ExportToRenpy.scss'

interface RenPyExportButtonProps {
  state: RootState
}

export const RenPyExportButton = ({ state }: RenPyExportButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const handleButtonClick = async () => {
    setIsLoading(true)
    const script = exportToRenPy(state)
    await downloadRenPyProject(script, state)
    setIsLoading(false)
  }

  return (
    <>
      <Tooltip id="renpy-export-tooltip" place="bottom" />
      <button
        className="RenPyExportButton"
        onClick={handleButtonClick}
        data-tooltip-id="renpy-export-tooltip"
        data-tooltip-content="Export For Ren'Py"
        disabled={isLoading}
      >
        {isLoading ? 'Generating script...' : <SiRenpy />}
      </button>
    </>
  )
}
