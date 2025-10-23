import './AssetsPanel.scss';
import Backgrounds from './backgrounds/Backgrounds';
import Characters from './characters/Characters';
import InventoryItems from './inventory/InventoryItems';
import Songs from './songs/Songs';
import { useEffect } from 'react';
import { useAppDispatch } from '../../state/store';
import { pollInferences } from '../../state/slices/novelFormSlice';
import { Button } from '@mikugg/ui-kit';
import { AiOutlineGlobal } from 'react-icons/ai';
import { openModal } from '../../state/slices/inputSlice';

export default function AssetsPanel() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Poll every 10 seconds as an example:
    const intervalId = setInterval(() => {
      dispatch(pollInferences());
    }, 10000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  return (
    <div className="AssetsPanel">
      <div className="AssetsPanel__header">
        <h1>Assets</h1>
        <Button
          theme="secondary"
          onClick={() => dispatch(openModal({ modalType: 'novelVariableEdit', scope: 'global' }))}
        >
          <AiOutlineGlobal />
          Global Variables
        </Button>
      </div>
      <div className="AssetsPanel__groups">
        <Characters />
        <Backgrounds />
        <Songs />
        <InventoryItems />
      </div>
    </div>
  );
}
