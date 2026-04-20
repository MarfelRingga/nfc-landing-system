import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://rifelo.id',
      lastModified: new Date(),
    },
    {
      url: 'https://rifelo.id/what-is-rifelo',
      lastModified: new Date(),
    },
    {
      url: 'https://rifelo.id/rifelo-features',
      lastModified: new Date(),
    },
    {
      url: 'https://rifelo.id/join-rifelo',
      lastModified: new Date(),
    },
  ]
}
