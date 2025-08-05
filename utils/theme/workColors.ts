// Work card background color mapping
export const workColorMap = {
  'eye-protection-design-handbook': 'bg-[#313131]',
  'usability-design-for-xigua-video': 'bg-blue-500',
  'pachino': 'bg-red-600',
  'bearychat': 'bg-green-600',
} as const

export const getWorkColor = (slug: string): string => {
  return workColorMap[slug as keyof typeof workColorMap] || 'bg-white'
}

export type WorkSlug = keyof typeof workColorMap