// @ts-ignore fu
const dataLayer = window.dataLayer || [];

type TrackableEvent = 'bot_interact' | 'bot_regenerate'; 

export const trackEvent = (event: TrackableEvent, data: any) => {
  dataLayer.push({
    event,
    ...data
  });
}