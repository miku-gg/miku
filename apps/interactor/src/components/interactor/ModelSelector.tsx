import classNames from 'classnames'
import { useAppContext } from '../../App.context'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { ModelType } from '../../state/versioning'
import { Tooltip } from '@mikugg/ui-kit'
import { GiBrain } from 'react-icons/gi'
import { setModel } from '../../state/slices/settingsSlice'
import './ModelSelector.scss'

const ModelSelector = () => {
  const dispatch = useAppDispatch()
  const { isProduction } = useAppContext()
  const isPremium = useAppSelector((state) => state.settings.user.isPremium)
  const isSmart = useAppSelector(
    (state) => state.settings.model === ModelType.Smart
  )
  const isMobileWidth = document.body.clientWidth < 768

  if (!isProduction) return null

  return (
    <div
      className={classNames({
        ModelSelector: true,
        'ModelSelector--activated': isSmart && isPremium,
        'ModelSelector--disabled': !isPremium,
      })}
    >
      <Tooltip id="smart-tooltip" place={isMobileWidth ? 'bottom' : 'left'} />
      <button
        className="ModelSelector__icon icon-button"
        onClick={() =>
          dispatch(setModel(isSmart ? ModelType.Default : ModelType.Smart))
        }
        data-tooltip-id="smart-tooltip"
        data-tooltip-content={
          isPremium
            ? isSmart
              ? 'Deactivate 70B'
              : 'Activate 70B model. Makes the AI smarter.'
            : '70B model is only available for premium users.'
        }
      >
        <GiBrain />
      </button>
    </div>
  )
}

export default ModelSelector
