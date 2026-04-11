/** Upstream file for link previews; proxied at `/share-og` so crawlers get `image/png`. */
export function getShareOgUpstreamUrl(): string {
  return (
    process.env.NEXT_PUBLIC_OG_IMAGE_URL?.trim() ||
    'https://image2url.com/r2/default/images/1775931382341-9348e91c-4d68-4b02-bfb1-76549d827026.jpg'
  )
}
