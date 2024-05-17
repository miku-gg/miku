import classNames from 'classnames'
import { useAppContext } from '../../App.context'
import { useAppDispatch, useAppSelector } from '../../state/store'
import { ModelType } from '../../state/versioning'
import { Tooltip } from '@mikugg/ui-kit'
import { GiBrain } from 'react-icons/gi'
import { setModel } from '../../state/slices/settingsSlice'
import './ModelSelector.scss'
import { trackEvent } from '../../libs/analytics'
import { _i18n } from '../../libs/lang/i18n'

const ModelSelector = () => {
  const dispatch = useAppDispatch()
  const { isProduction, freeSmart } = useAppContext()
  const isPremium = useAppSelector((state) => state.settings.user.isPremium)
  const isSmart = useAppSelector(
    (state) => state.settings.model === ModelType.RP_SMART
  )
  const isMobileWidth = document.body.clientWidth < 768

  if (!isProduction) return null

  let tooltipMessage = ''

  if (!isPremium && !freeSmart) {
    tooltipMessage = _i18n(
      'SETTINGS__70B_MODEL_ONLY_AVAILABLE_FOR_PREMIUM_USERS'
    )
  } else if (freeSmart) {
    tooltipMessage = isSmart
      ? _i18n('SETTINGS__DEACTIVATE_70B_MODEL')
      : _i18n('SETTINGS__ACTIVATE_70B_MODEL_FREE_FOR_A_LIMITED_TIME')
  } else if (isPremium) {
    tooltipMessage = isSmart
      ? _i18n('SETTINGS__DEACTIVATE_70B_MODEL')
      : _i18n('SETTINGS__ACTIVATE_70B_MODEL')
  }

  return (
    <div
      className={classNames({
        ModelSelector: true,
        'ModelSelector--activated': isSmart && (isPremium || freeSmart),
        'ModelSelector--disabled': !isPremium && !freeSmart,
      })}
    >
      <Tooltip id="smart-tooltip" place={isMobileWidth ? 'bottom' : 'left'} />
      <button
        className="ModelSelector__icon icon-button"
        onClick={() => {
          dispatch(setModel(isSmart ? ModelType.RP : ModelType.RP_SMART))
          trackEvent('smart-toggle-click', {
            modelSet: isSmart ? 'RP' : 'RP_SMART',
          })
        }}
        data-tooltip-id="smart-tooltip"
        data-tooltip-content={tooltipMessage}
      >
        <GiBrain />
      </button>
    </div>
  )
}

export default ModelSelector
