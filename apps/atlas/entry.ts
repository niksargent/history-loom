// Preserve the original application's bookmarked analytics routes.
if (window.location.hash.startsWith('#insights')) {
  window.location.replace(`${import.meta.env.BASE_URL}classic/${window.location.search}${window.location.hash}`)
} else {
  void import('./src/main')
}
