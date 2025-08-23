// Mock data for when database is not available
export const mockTestTypes = [
  {
    id: 'vct',
    name: 'Video Creative Test',
    short_name: 'VCT',
    shortName: 'VCT',
    description: 'Testing video creative performance',
    color: '#A78BFA',
    icon_name: 'Video',
    display_order: 1,
    is_active: true,
    allowed_platforms: [
      { platform_id: 'meta', is_default: true },
      { platform_id: 'google', is_default: true },
      { platform_id: 'tiktok', is_default: true }
    ]
  },
  {
    id: 'sct',
    name: 'Static Creative Test',
    short_name: 'SCT',
    shortName: 'SCT',
    description: 'Testing static image creative performance',
    color: '#60A5FA',
    icon_name: 'Image',
    display_order: 2,
    is_active: true,
    allowed_platforms: [
      { platform_id: 'meta', is_default: true },
      { platform_id: 'google', is_default: true },
      { platform_id: 'pinterest', is_default: false }
    ]
  },
  {
    id: 'act',
    name: 'Ad Copy Test',
    short_name: 'ACT',
    shortName: 'ACT',
    description: 'Testing ad copy effectiveness',
    color: '#34D399',
    icon_name: 'FileText',
    display_order: 3,
    is_active: true,
    allowed_platforms: [
      { platform_id: 'meta', is_default: true },
      { platform_id: 'google', is_default: true },
      { platform_id: 'linkedin', is_default: false }
    ]
  }
];

export const mockPlatforms = [
  {
    id: 'meta',
    name: 'Meta',
    description: 'Facebook and Instagram Ads',
    icon_name: 'Facebook',
    color: 'blue',
    display_order: 1,
    is_active: true
  },
  {
    id: 'google',
    name: 'Google',
    description: 'Google Ads and YouTube',
    icon_name: 'Chrome',
    color: 'yellow',
    display_order: 2,
    is_active: true
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'TikTok Ads',
    icon_name: 'Music',
    color: 'pink',
    display_order: 3,
    is_active: true
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    description: 'Pinterest Ads',
    icon_name: 'Image',
    color: 'red',
    display_order: 4,
    is_active: true
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'LinkedIn Ads',
    icon_name: 'Linkedin',
    color: 'blue',
    display_order: 5,
    is_active: true
  }
];