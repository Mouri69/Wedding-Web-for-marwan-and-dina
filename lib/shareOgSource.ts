/** Upstream file for link previews; proxied at `/share-og` so crawlers get `image/png`. */
export function getShareOgUpstreamUrl(): string {
  return (
    process.env.NEXT_PUBLIC_OG_IMAGE_URL?.trim() ||
    'https://image2url.com/r2/default/images/1775927391222-378a178a-4777-4bd8-934a-cb9150edb80c.png'
  )
}
