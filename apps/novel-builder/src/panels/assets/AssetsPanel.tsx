import './AssetsPanel.scss';
import Backgrounds from './backgrounds/Backgrounds';
import Characters from './characters/Characters';
import InventoryItems from './inventory/InventoryItems';
import Songs from './songs/Songs';
import { useEffect } from 'react';
import { useAppDispatch } from '../../state/store';
import { pollInferences } from '../../state/slices/novelFormSlice';

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
