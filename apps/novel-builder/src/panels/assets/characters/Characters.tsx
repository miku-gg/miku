import { FaHammer, FaPencil } from 'react-icons/fa6';
import { MdSearch } from 'react-icons/md';
import config from '../../../config';
import { openModal } from '../../../state/slices/inputSlice';
import { useAppDispatch, useAppSelector } from '../../../state/store';
import './Characters.scss';
import { Blocks } from '@mikugg/ui-kit';
import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { v4 as randomUUID } from 'uuid';
import { createCharacter } from '../../../state/slices/novelFormSlice';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';

export default function Characters({
  selected,
  onSelect,
  showNone,
  ignoreIds,
}: {
  selected?: string;
  onSelect?: (id: string) => void;
  showNone?: boolean;
  ignoreIds?: string[];
}) {
  const characters = useAppSelector((state) => state.novel.characters);
  const dispatch = useAppDispatch();

  const handleCreateCharacter = () => {
    const id = randomUUID();
    dispatch(createCharacter(id));
    dispatch(openModal({ modalType: 'character', editId: id }));
  };

  const blocks: {
    id: string;
    highlighted?: boolean;
    tooltip?: string;
    loading?: boolean;
    disabled?: boolean;
    onEditClick?: () => void;
    editIcon?: React.ReactNode;
    content:
      | {
          image: string;
        }
      | {
          text: string;
          icon?: React.ReactNode;
        };
    onClick: () => void;
  }[] = [
    ...characters
      .filter((character) => !ignoreIds?.includes(character.id))
      .map((character) => ({
        id: `characters-${character.id}`,
        tooltip: character.name,
        highlighted: selected === character.id,
        content: {
          image: config.genAssetLink(character.profile_pic, AssetDisplayPrefix.PROFILE_PIC),
        },
        onEditClick: () =>
          dispatch(
            openModal({
              modalType: 'character',
              editId: character.id,
            }),
          ),
        editIcon: <FaPencil />,
        onClick: () => {
          if (onSelect) onSelect(character.id);
        },
      })),
    {
      id: 'create',
      highlighted: false,
      content: {
        icon: <FaHammer />,
        text: 'Create',
      },
      onClick: handleCreateCharacter,
    },
    // {
    //   id: "search",
    //   highlighted: false,
    //   content: {
    //     icon: <MdSearch />,
    //     text: "Search",
    //   },
    //   onClick: () => dispatch(openModal({ modalType: "characterSearch" })),
    // },
  ];

  if (showNone) {
    blocks.push({
      id: 'none',
      highlighted: !selected,
      content: {
        text: 'None',
      },
      onClick: () => onSelect && onSelect(''),
    });
  }

  return (
    <div className="Characters group">
      <div className="title-small">Characters</div>
      <div className="Characters__list">
        <Blocks tooltipId="characters" items={blocks} />
      </div>
    </div>
  );
}
