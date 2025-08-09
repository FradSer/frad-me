// Grid layout calculation for 3D space
export const calculateCardPosition = (
  index: number,
  isFullScreen: boolean,
): [number, number, number] => {
  const baseX = -4
  const baseY = 1
  const baseZ = -8  // Push cards much further away for visionOS
  const spacingX = 4
  const spacingY = 3

  if (index === 0) {
    // Title position - also push back
    return [0, 4, -6]
  }

  const workIndex = index - 1
  if (isFullScreen) {
    return [0, baseY - workIndex * spacingY, baseZ]
  } else {
    const col = workIndex % 2
    const row = Math.floor(workIndex / 2)
    return [baseX + col * spacingX, baseY - row * spacingY, baseZ]
  }
}