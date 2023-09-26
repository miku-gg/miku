type TrackableEvent = 'bot_interact' | 'bot_regenerate'; 

export const trackEvent = (event: TrackableEvent, data: any) => {
  // @ts-ignore
  const dataLayer = window.dataLayer || [];

  dataLayer.push({
    event,
    ...data
  });
}