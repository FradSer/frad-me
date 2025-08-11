// Grid layout calculation for 3D space - single row of 3 cards
export const calculateCardPosition = (
  index: number,
  isFullScreen: boolean,
): [number, number, number] => {
  const baseX = -6        // Start further left for 3 cards
  const baseY = 0.5       // Slightly lower position
  const baseZ = -8        // Push cards much further away for visionOS
  const spacingX = 6      // Increased spacing for larger cards
  const spacingY = 4      // Spacing for any future vertical layout

  if (index === 0) {
    // Title position - also push back
    return [0, 4, -6]
  }

  const workIndex = index - 1
  if (isFullScreen) {
    // For fullscreen cards, center them
    return [0, baseY - workIndex * spacingY, baseZ]
  } else {
    // Single row layout: 3 cards horizontally
    const col = workIndex % 3  // Changed from 2 to 3 for single row
    const row = Math.floor(workIndex / 3)  // Changed from 2 to 3 for single row
    return [baseX + col * spacingX, baseY - row * spacingY, baseZ]
  }
}