type TrackableEvent =
  | 'interaction_regenerate'
  | 'interaction_continue'
  | 'history-click'
  | 'scene-sidebar-open'
  | 'scene-select'
  | 'scene-create'
  | 'scene-create-successful'
  | 'scene-generate'
  | 'scene-generate-successful'
  | 'scene-advance-suggestion-click'
  | 'scene-generate-suggestion-click'
  | 'suggestion-click'
  | 'smart-toggle-click'
  | 'music-toggle-click'
  | 'settings-click'
  | 'voice-gen-click'
  | 'edit-click'
  | 'credits-buy-click'
  | 'download-history-click'

const sessionData: Record<string, string | boolean | number> = {}

export const registerTrackSessionData = (
  data: Record<string, string | boolean | number>
) => {
  Object.assign(sessionData, data)
}

// eslint-disable-next-line
export const trackEvent = (event: TrackableEvent, data: any = {}) => {
  try {
    // eslint-disable-next-line
    // @ts-ignore
    const dataLayer = window?.parent?.dataLayer || []

    dataLayer.push({
      ...sessionData,
      event,
      ...data,
    })
  } catch (e) {
    return
  }
}
