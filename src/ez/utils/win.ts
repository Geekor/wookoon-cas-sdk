export const openWindow = (url: string) => {
  const features = 'noopener,noreferrer'
  window.open(url, '_blank', features)
}
