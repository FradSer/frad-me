// Grid layout calculation for 3D space
export const calculateCardPosition = (
  index: number,
  isFullScreen: boolean,
): [number, number, number] => {
  const baseX = -4
  const baseY = 2
  const spacingX = 4
  const spacingY = 3

  if (index === 0) {
    // Title position
    return [0, 5, 0]
  }

  const workIndex = index - 1
  if (isFullScreen) {
    return [0, baseY - workIndex * spacingY, 0]
  } else {
    const col = workIndex % 2
    const row = Math.floor(workIndex / 2)
    return [baseX + col * spacingX, baseY - row * spacingY, 0]
  }
}
