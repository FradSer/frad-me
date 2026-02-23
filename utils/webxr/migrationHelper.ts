/**
 * Data migration helper utility for WebXR instancing system
 *
 * This utility provides functions to migrate WorkCard3D data to instanced
 * attributes for GPU-first rendering.
 */

import { ENTRANCE_POSITIONS } from './animationConstants';
import type { InstanceData, WorkLink } from './migrationHelper.types';
import { type AtlasConfig, getTileInfo } from './textureAtlas';
import { calculateCardPosition } from './workGridUtils';

const ENTRANCE_Y_OFFSET = 2;
const DEFAULT_ATLAS_CONFIG: AtlasConfig = {
  width: 2048,
  height: 2048,
  columns: 2,
  rows: 3,
  padding: 4,
  backgroundColor: '#1a1a1a',
};

/**
 * Set up instance data for a single work card
 * @param work - Work link data
 * @param index - Index of the work card (0-based)
 * @param totalCards - Total number of work cards
 * @param cardPosition - Pre-calculated 3D position for the card
 * @param basePosition - Entrance position (default: ENTRANCE_POSITIONS.workDefault)
 * @returns Instance data for the work card
 */
export function setupWorkCardInstanceData(
  work: WorkLink,
  index: number,
  totalCards: number,
  cardPosition: [number, number, number],
  basePosition: [number, number, number] = ENTRANCE_POSITIONS.workDefault,
): InstanceData {
  const [baseX, baseY, baseZ] = basePosition;

  // Position relative to entrance position
  const position: [number, number, number] = [
    cardPosition[0] - baseX,
    cardPosition[1] - baseY + ENTRANCE_Y_OFFSET,
    cardPosition[2] - baseZ,
  ];

  // Animation offset for staggering
  const animationOffset = (index / totalCards) * Math.PI * 2 * 0.5;

  // Get UV offset from texture atlas
  const tileInfo = getTileInfo(index, DEFAULT_ATLAS_CONFIG);
  const uvOffset: [number, number] = tileInfo?.uvOffset ?? [0, 0];

  // Base Y is the entrance Y (offset for entrance animation)
  const baseYPosition = position[1];
  // Hover Y is the final Y position (after entrance animation)
  const hoverYPosition = cardPosition[1] - baseY;

  // Scale down WIP cards
  const scale = work.isWIP ? 0.85 : 1;

  return {
    index,
    animationOffset,
    uvOffset,
    baseY: baseYPosition,
    hoverY: hoverYPosition,
    position,
    scale,
  };
}

/**
 * Create instance data for an array of works
 * @param works - Array of work link data
 * @param basePosition - Entrance position (default: ENTRANCE_POSITIONS.workDefault)
 * @returns Array of instance data for instanced mesh
 */
export function createInstanceDataForWorks(
  works: WorkLink[],
  basePosition: [number, number, number] = ENTRANCE_POSITIONS.workDefault,
): InstanceData[] {
  const instanceData: InstanceData[] = [];

  works.forEach((work, index) => {
    const workIndex = index + 1;
    const isFullScreen = work.isFullScreen || false;
    const totalCards = works.length;

    const cardPosition = calculateCardPosition(workIndex, isFullScreen, totalCards);

    const instance = setupWorkCardInstanceData(work, index, totalCards, cardPosition, basePosition);

    instanceData.push(instance);
  });

  return instanceData;
}
