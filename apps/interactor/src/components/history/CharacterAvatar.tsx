import React from 'react';
import { useAppContext } from '../../App.context';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import './CharacterAvatar.scss';
import classNames from 'classnames';

interface CharacterAvatarProps {
  character: {
    id: string;
    name: string;
    profilePic: string;
  };
  hoverable?: boolean;
  onClick?: () => void;
  selected?: boolean;
  theme?: 'vn';
}

const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ character, hoverable, onClick, selected, theme }) => {
  const { assetLinkLoader } = useAppContext();

  return (
    <div
      className={classNames({
        CharacterAvatar: true,
        'CharacterAvatar--hoverable': hoverable,
        'CharacterAvatar--selected': selected,
        'CharacterAvatar--clickable': onClick,
        'CharacterAvatar--vn-style': theme === 'vn',
      })}
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
