// Grid layout calculation for 3D space - 3 cards per row with smart centering
export const calculateCardPosition = (
  index: number,
  isFullScreen: boolean,
  totalCards = 5, // Allow passing total cards count
): [number, number, number] => {
  const baseX = -6; // Start further left for 3 cards
  const baseY = 0.5; // Slightly lower position
  const baseZ = -8; // Push cards much further away for visionOS
  const spacingX = 6; // Increased spacing for larger cards
  const spacingY = 5; // Increased vertical spacing for better separation
  const cardsPerRow = 3; // 3 cards per row

  if (index === 0) {
    // Title position - also push back
    return [0, 4, -6];
  }

  const workIndex = index - 1;
  if (isFullScreen) {
    // For fullscreen cards, center them
    return [0, baseY - workIndex * spacingY, baseZ];
  } else {
    const col = workIndex % cardsPerRow;
    const row = Math.floor(workIndex / cardsPerRow);

    // Special handling for the last row if it has fewer cards
    const cardsInCurrentRow =
      row === Math.floor((totalCards - 1) / cardsPerRow)
        ? ((totalCards - 1) % cardsPerRow) + 1 // Cards in last row
        : cardsPerRow; // Cards in full rows

    // Center the row if it has fewer than cardsPerRow cards
    let xOffset = 0;
    if (cardsInCurrentRow < cardsPerRow) {
      xOffset = ((cardsPerRow - cardsInCurrentRow) * spacingX) / 2;
    }

    return [baseX + col * spacingX + xOffset, baseY - row * spacingY, baseZ];
  }
};
