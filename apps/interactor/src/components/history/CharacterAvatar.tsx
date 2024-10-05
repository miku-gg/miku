import React from 'react';
import { useAppContext } from '../../App.context';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import './CharacterAvatar.scss';

interface CharacterAvatarProps {
  character: {
    id: string;
    name: string;
    profilePic: string;
  };
  hoverable?: boolean;
  onClick?: () => void;
  selected?: boolean;
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ character, hoverable, onClick, selected }) => {
  const { assetLinkLoader } = useAppContext();

  return (
    <div
      className={`CharacterAvatar ${hoverable ? 'CharacterAvatar--hoverable' : ''} ${
        selected ? 'CharacterAvatar--selected' : ''
      } ${onClick ? 'CharacterAvatar--clickable' : ''}`}
      onClick={onClick}
    >
      <img
        src={assetLinkLoader(character.profilePic, AssetDisplayPrefix.CHARACTER_PIC_SMALL)}
        alt={character.name}
        className="CharacterAvatar__image"
      />
      <span className="CharacterAvatar__name">{character.name}</span>
    </div>
  );
};

export default CharacterAvatar;
