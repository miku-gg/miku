import { Button, CheckBox, Loader, Modal, Tooltip } from '@mikugg/ui-kit';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { downloadRenPyProject, exportToRenPy } from '../../libs/exportToRenpy';
import { RootState } from '../../state/store';
import './ExportToRenpy.scss';
import { useAppContext } from '../../App.context';

interface RenPyExportButtonProps {
  state: RootState;
}

export const RenPyExportButton = ({ state }: RenPyExportButtonProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [linearStory, setLinearStory] = useState<boolean>(false);
  const { assetLinkLoader } = useAppContext();
  const handleButtonClick = async () => {
    setIsLoading(true);
    try {
      const script = exportToRenPy(state, linearStory);
      await downloadRenPyProject(script, state, assetLinkLoader);
    } catch (error) {
      toast.error('An error occurred while generating the script, please try again.');
    }
    setIsLoading(false);
    setIsModalOpen(false);
  };

  return (
    <>
      <Tooltip id="renpy-export-tooltip" place="bottom" />
      <button
        className="RenPyExportButton"
        onClick={() => setIsModalOpen(true)}
        data-tooltip-id="renpy-export-tooltip"
        data-tooltip-content="Generate a Ren'Py project from the current narration."
        disabled={isLoading}
      >
        <img src="/images/renpy.png" alt="Ren'Py" height={16} />
        Export as Ren'Py
      </button>
      <Modal
        className="RenPyExportButton__modal"
        opened={isModalOpen}
        onCloseModal={() => setIsModalOpen(false)}
        title={`Export as a Ren'Py project`}
      >
        {isLoading ? (
          <p className="RenPyExportButton__modal__loading">
            <Loader />
            Generating project, this might take a while...
          </p>
        ) : (
          <div className="RenPyExportButton__modal__button">
            <Button theme="gradient" onClick={handleButtonClick} disabled={isLoading}>
              Download Project
            </Button>
          </div>
        )}
        <div className="RenPyExportButton__modal__linear-story">
          <CheckBox
            label="Only current narration branch (linear story with no options)"
            value={linearStory}
            onChange={(e) => setLinearStory(e.target.checked)}
          />
        </div>
      </Modal>
    </>
  );
};
