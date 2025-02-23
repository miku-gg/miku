import { useAppSelector, useAppDispatch } from '../state/store';
import { fetchPrices, fetchUser } from '../state/slices/userSlice';
import { useEffect, useState } from 'react';
import { PiCoinsLight } from 'react-icons/pi';
import { IoCog } from 'react-icons/io5';
import './CreditsWidget.scss';

interface PendingInference {
  inferenceId: string;
  inferenceType: 'character' | 'emotion' | 'background' | 'item';
  prompt: string;
  characterId?: string;
  outfitId?: string;
  emotionId?: string;
  backgroundId?: string;
  itemId?: string;
}

export default function CreditsWidget() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user.user);
  const pendingInferences = useAppSelector((state) => state.novel.pendingInferences);
  const characters = useAppSelector((state) => state.novel.characters);
  const inventory = useAppSelector((state) => state.novel.inventory);
  const backgrounds = useAppSelector((state) => state.novel.backgrounds);

  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    dispatch(fetchUser());
    dispatch(fetchPrices());
  }, [dispatch]);

  useEffect(() => {
    if (!pendingInferences || pendingInferences.length === 0) {
      setShowDropdown(false);
    }
  }, [pendingInferences]);

  const renderInference = (inference: PendingInference) => {
    switch (inference.inferenceType) {
      case 'character': {
        const character = characters.find((c) => c.id === inference.characterId);
        let outfitName = '';
        if (character && character.card && character.card.data && character.card.data.extensions?.mikugg_v2?.outfits) {
          const outfit = character.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === inference.outfitId);
          outfitName = outfit ? outfit.name : inference.outfitId || '';
        }
        return (
          <div>
            {character ? character.name : inference.characterId} - {outfitName} outfit
          </div>
        );
      }
      case 'emotion': {
        const character = characters.find((c) => c.id === inference.characterId);
        let outfitName = '';
        if (character && character.card && character.card.data && character.card.data.extensions?.mikugg_v2?.outfits) {
          const outfit = character.card.data.extensions.mikugg_v2.outfits.find((o) => o.id === inference.outfitId);
          outfitName = outfit ? outfit.name : inference.outfitId || '';
        }
        return (
          <div>
            {character ? character.name : inference.characterId} - {outfitName}, {inference.emotionId}
          </div>
        );
      }
      case 'item': {
        const item = inventory?.find((i) => i.id === inference.itemId);
        return <div>{item ? item.name : inference.itemId} item</div>;
      }
      case 'background': {
        const bg = backgrounds.find((b) => b.id === inference.backgroundId);
        return <div>{bg ? bg.name : inference.backgroundId} background</div>;
      }
      default:
        return <div>Unknown inference</div>;
    }
  };

  return (
    <div className="CreditsWidget">
      <div className="CreditsWidget__credits">
        <PiCoinsLight /> {user?.credits || 0} credits
      </div>
      {pendingInferences?.length ? (
        <div
          className="CreditsWidget__pending"
          onClick={() => setShowDropdown((prev) => !prev)}
          title="View pending inferences"
        >
          <IoCog className="rotating-cog" />
        </div>
      ) : null}
      {showDropdown && pendingInferences?.length && (
        <div className="CreditsWidget__dropdown">
          <div className="CreditsWidget__dropdown-header">Pending Generations</div>
          <div className="CreditsWidget__dropdown-content scrollbar">
            {pendingInferences.map((inference: PendingInference) => (
              <div key={inference.inferenceId} className="CreditsWidget__inference">
                {renderInference(inference)}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
