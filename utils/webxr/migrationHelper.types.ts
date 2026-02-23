/**
 * Type definitions for migration helper utility
 */

/**
 * Work link data from the portfolio
 */
export interface WorkLink {
  title: string;
  subTitle: string;
  slug: string;
  cover: string;
  isCenter?: boolean;
  isFullScreen?: boolean;
  isWIP?: boolean;
}

/**
 * Instance data for GPU-first instanced mesh
 */
export interface InstanceData {
  index: number;
  animationOffset: number;
  uvOffset: [number, number];
  baseY: number;
  hoverY: number;
  position: [number, number, number];
  scale: number;
}
