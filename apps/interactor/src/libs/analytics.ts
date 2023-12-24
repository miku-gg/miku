type TrackableEvent = 'bot_interact' | 'bot_regenerate'

// eslint-disable-next-line
export const trackEvent = (event: TrackableEvent, data: any) => {
  // eslint-disable-next-line
  // @ts-ignore
  const dataLayer = window.dataLayer || []

  dataLayer.push({
    event,
    ...data,
  })
}
