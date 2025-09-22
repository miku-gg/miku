import { FaHammer, FaPencil } from 'react-icons/fa6';
import { IoInformationCircleOutline } from 'react-icons/io5';
import config from '../../../config';
import './CustomPersona.scss';
import { Blocks, Tooltip } from '@mikugg/ui-kit';
import { AssetDisplayPrefix } from '@mikugg/bot-utils';
import { openModal } from '../../../state/slices/inputSlice';
import { useAppDispatch, useAppSelector } from '../../../state/store';

export default function CustomPersona({
  selected,
  onSelect,
  showNone,
  tooltipText,
}: {
  selected?: string;
  onSelect?: (id: string) => void;
  showNone?: boolean;
  tooltipText?: string;
}) {
  const customPersona = useAppSelector((state) => state.novel.customPersona);
  const dispatch = useAppDispatch();

  const handleCreatePersona = () => {
    dispatch(openModal({ modalType: 'customPersona'}));
  };

  const handleEditPersona = () => {
    dispatch(openModal({ modalType: 'customPersona'}));
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
  }[] = [];

  // Add the custom persona if it exists
  if (customPersona) {
    blocks.push({
      id: 'custom-persona',
      tooltip: customPersona.name,
      highlighted: selected === 'custom-persona',
      content: {
        image: config.genAssetLink(customPersona.profilePic || 'empty_char.png', AssetDisplayPrefix.PROFILE_PIC),
      },
      onEditClick: handleEditPersona,
      editIcon: <FaPencil />,
      onClick: () => {
        if (onSelect) onSelect('custom-persona');
      },
    });
  }

  // Add create button only if no persona exists
  if (!customPersona) {
    blocks.push({
      id: 'create',
      highlighted: false,
      content: {
        icon: <FaHammer />,
        text: 'Create',
      },
      onClick: handleCreatePersona,
    });
  }

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
    <div className="CustomPersona group">
      <div className="CustomPersona__header">
        <div className="CustomPersona__header__title">
          <h2>Custom Persona</h2>
          {tooltipText && (
            <>
              <IoInformationCircleOutline
                className="CustomPersona__header__title__infoIcon"
                data-tooltip-id="custom-persona-info"
                data-tooltip-content={tooltipText}
              />
              <Tooltip id="custom-persona-info" place="top" />
            </>
          )}
        </div>
      </div>
      <div className="CustomPersona__list">
        <Blocks tooltipId="custom-personas" items={blocks} />
      </div>
    </div>
  );
}
