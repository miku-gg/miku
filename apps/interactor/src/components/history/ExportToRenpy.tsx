import { Button, Loader, Modal, Tooltip } from '@mikugg/ui-kit'
import { useState } from 'react'
import { SiRenpy } from 'react-icons/si'
import { toast } from 'react-toastify'
import { downloadRenPyProject, exportToRenPy } from '../../libs/exportToRenpy'
import { RootState } from '../../state/store'
import './ExportToRenpy.scss'
import { useAppContext } from '../../App.context'

interface RenPyExportButtonProps {
  state: RootState
}

export const RenPyExportButton = ({ state }: RenPyExportButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const { assetLinkLoader } = useAppContext()
  const handleButtonClick = async () => {
    setIsLoading(true)
    try {
      const script = exportToRenPy(state)
      await downloadRenPyProject(script, state, assetLinkLoader)
    } catch (error) {
      toast.error(
        'An error occurred while generating the script, please try again.'
      )
    }
    setIsLoading(false)
    setIsModalOpen(false)
  }

  return (
    <>
      <Tooltip id="renpy-export-tooltip" place="bottom" />
      <button
        className="RenPyExportButton"
        onClick={() => setIsModalOpen(true)}
        data-tooltip-id="renpy-export-tooltip"
        data-tooltip-content="Export For Ren'Py"
        disabled={isLoading}
      >
        {isLoading ? 'Generating script...' : <SiRenpy />}
      </button>
      <Modal
        className="RenPyExportButton__modal"
        opened={isModalOpen}
        onCloseModal={() => setIsModalOpen(false)}
        title={`Export For Ren'Py`}
      >
        {isLoading ? (
          <p className="RenPyExportButton__modal__loading">
            <Loader />
            Generating script...
          </p>
        ) : (
          <div className="RenPyExportButton__modal__button">
            <Button
              theme="gradient"
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              Download Project
            </Button>
          </div>
        )}
      </Modal>
    </>
  )
}
