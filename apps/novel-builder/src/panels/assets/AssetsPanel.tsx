import './AssetsPanel.scss';
import Backgrounds from './backgrounds/Backgrounds';
import Characters from './characters/Characters';
import InventoryItems from './inventory/InventoryItems';
import Songs from './songs/Songs';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../state/store';
import { pollInferences, createVariableBank } from '../../state/slices/novelFormSlice';
import { selectVariableBanks } from '../../state/selectors';
import { Button } from '@mikugg/ui-kit';
import { FaPlus } from 'react-icons/fa';
import { openModal } from '../../state/slices/inputSlice';
import ButtonGroup from '../../components/ButtonGroup';
import { v4 as uuidv4 } from 'uuid';

export default function AssetsPanel() {
  const dispatch = useAppDispatch();
  const [selectedView, setSelectedView] = useState<'assets' | 'banks'>('assets');
  const banks = useAppSelector(selectVariableBanks);

  useEffect(() => {
    // Poll every 10 seconds as an example:
    const intervalId = setInterval(() => {
      dispatch(pollInferences());
    }, 10000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  const handleEditBank = (bankId: string) => {
    dispatch(openModal({ modalType: 'novelVariableEdit', bankId }));
  };

  const handleCreateBank = () => {
    const newBankId = uuidv4();
    dispatch(
      createVariableBank({
        id: newBankId,
        name: 'New Variable Bank',
        description: 'A new variable bank',
      }),
    );
  };

  return (
    <div className="AssetsPanel">
      <div className="AssetsPanel__header">
        <h1>Assets</h1>
        <ButtonGroup
          selected={selectedView}
          onButtonClick={(value) => setSelectedView(value)}
          buttons={[
            { content: 'Assets', value: 'assets' as const },
            { content: 'Variable Banks', value: 'banks' as const },
          ]}
        />
      </div>
      <div className="AssetsPanel__groups">
        {selectedView === 'assets' ? (
          <>
            <Characters />
            <Backgrounds />
            <Songs />
            <InventoryItems />
          </>
        ) : (
          <div className="AssetsPanel__banks">
            <div className="AssetsPanel__banks-header">
              <h3>Variable Banks</h3>
              <Button theme="secondary" onClick={handleCreateBank}>
                <FaPlus />
                Create Bank
              </Button>
            </div>
            <div className="AssetsPanel__banks-grid">
              {banks.map((bank) => (
                <div key={bank.id} className="AssetsPanel__bank-item" onClick={() => handleEditBank(bank.id)}>
                  <div className="AssetsPanel__bank-content">
                    <div className="AssetsPanel__bank-header">
                      <h4 className="AssetsPanel__bank-name">{bank.name}</h4>
                    </div>
                    <p className="AssetsPanel__bank-description">{bank.description}</p>
                    <div className="AssetsPanel__bank-meta">
                      <span className="AssetsPanel__bank-count">
                        {bank.variables.length} variable{bank.variables.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
