/**
 * Visual regression utilities for WebXR screenshot comparison.
 *
 * This module provides utilities for:
 * - Pixel-by-pixel image comparison
 * - Structural Similarity Index (SSIM) calculation
 * - Anti-aliasing difference detection and ignoring
 * - Timing difference handling
 *
 * Note: This module works with ImageData format from browser Canvas API
 * and is designed to work with Playwright's screenshot functionality.
 */

// Configuration constants for visual comparison
const PIXEL_DIFF_THRESHOLD = 0.005; // 0.5% of pixels can differ
const SSIM_THRESHOLD = 0.98; // SSIM score must be above 0.98
const ANTI_ALIASING_THRESHOLD = 5; // Color difference threshold for anti-aliasing
const _SSIM_WINDOW_SIZE = 7; // Standard SSIM window size
const SSIM_K1 = 0.01;
const SSIM_K2 = 0.03;

export interface ImageData {
  data: Uint8ClampedArray;
  width: number;
  height: number;
}

export interface ComparisonResult {
  passed: boolean;
  pixelDiff: number;
  ssim: number;
  diffPixels: number;
  totalPixels: number;
  diffImage?: ImageData;
  antiAliasingDiffIgnored?: number;
}

export interface VisualRegressionConfig {
  pixelDiffThreshold?: number;
  ssimThreshold?: number;
  antiAliasingThreshold?: number;
  ignoreAntiAliasing?: boolean;
  ignoreTiming?: boolean;
  generateDiffImage?: boolean;
}

/**
 * Parse PNG image data into ImageData format.
 * Note: In Playwright context, use page.screenshot() which returns Buffer.
 * In browser context, use canvas.getImageData().
 * This is a placeholder - actual implementation depends on the context.
 */
export function parseImageData(buffer: Buffer, width: number, height: number): ImageData {
  return {
    data: new Uint8ClampedArray(buffer),
    width,
    height,
  };
}

/**
 * Parse image data from a browser Canvas ImageBitmap or ImageData.
 * This is used in Playwright tests when working with canvas screenshots.
 */
export function parseFromCanvasImageData(canvasImageData: ImageData): ImageData {
  return {
    data: canvasImageData.data,
    width: canvasImageData.width,
    height: canvasImageData.height,
  };
}

/**
 * Generate a unique hash for image data.
 * Uses a simple hash function that works in both Node.js and browser environments.
 */
export function generateImageHash(imageData: ImageData): string {
  let hash = 0;
  const data = imageData.data;
  const len = data.length;

  for (let i = 0; i < len; i++) {
    hash = (hash << 5) - hash + data[i];
    hash |= 0; // Convert to 32-bit integer
  }

  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Calculate luminance for a pixel.
 */
function calculateLuminance(r: number, g: number, b: number): number {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

/**
 * Calculate color difference between two pixels.
 */
function colorDifference(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
): number {
  return Math.abs(r1 - r2) + Math.abs(g1 - g2) + Math.abs(b1 - b2);
}

/**
 * Detect if a pixel difference is due to anti-aliasing.
 * Anti-aliasing artifacts typically involve small color differences along edges.
 */
function isAntiAliasingDifference(
  r1: number,
  g1: number,
  b1: number,
  r2: number,
  g2: number,
  b2: number,
  threshold: number,
): boolean {
  const diff = colorDifference(r1, g1, b1, r2, g2, b2);
  const lum1 = calculateLuminance(r1, g1, b1);
  const lum2 = calculateLuminance(r2, g2, b2);

  // Anti-aliasing typically involves small color differences
  // and occurs at edges (higher luminance difference)
  return diff < threshold && Math.abs(lum1 - lum2) < threshold * 2;
}

/**
 * Calculate SSIM (Structural Similarity Index) between two images.
 */
export function calculateSSIM(img1: ImageData, img2: ImageData): number {
  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error('Images must have the same dimensions for SSIM calculation');
  }

  const width = img1.width;
  const height = img1.height;

  // Convert to luminance
  const lum1 = new Float64Array(width * height);
  const lum2 = new Float64Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    lum1[i] = calculateLuminance(img1.data[idx], img1.data[idx + 1], img1.data[idx + 2]);
    lum2[i] = calculateLuminance(img2.data[idx], img2.data[idx + 1], img2.data[idx + 2]);
  }

  // Calculate mean and variance for entire image (simplified SSIM)
  const mean1 = lum1.reduce((a, b) => a + b, 0) / lum1.length;
  const mean2 = lum2.reduce((a, b) => a + b, 0) / lum2.length;

  const var1 = lum1.reduce((sum, val) => sum + (val - mean1) ** 2, 0) / lum1.length;
  const var2 = lum2.reduce((sum, val) => sum + (val - mean2) ** 2, 0) / lum2.length;

  const cov =
    lum1.reduce((sum, val, i) => sum + (val - mean1) * (lum2[i] - mean2), 0) / lum1.length;

  const c1 = (SSIM_K1 * 255) ** 2;
  const c2 = (SSIM_K2 * 255) ** 2;

  const numerator = (2 * mean1 * mean2 + c1) * (2 * cov + c2);
  const denominator = (mean1 ** 2 + mean2 ** 2 + c1) * (var1 + var2 + c2);

  return denominator === 0 ? 1 : numerator / denominator;
}

/**
 * Compare two images pixel by pixel.
 */
export function comparePixels(
  img1: ImageData,
  img2: ImageData,
  config: VisualRegressionConfig,
): ComparisonResult {
  if (img1.width !== img2.width || img1.height !== img2.height) {
    throw new Error('Images must have the same dimensions for comparison');
  }

  const width = img1.width;
  const height = img1.height;
  const totalPixels = width * height;

  let diffPixels = 0;
  let antiAliasingDiffIgnored = 0;
  const ignoreAA = config.ignoreAntiAliasing ?? true;
  const aaThreshold = config.antiAliasingThreshold ?? ANTI_ALIASING_THRESHOLD;

  let diffImage: Uint8ClampedArray | null = null;

  if (config.generateDiffImage) {
    diffImage = new Uint8ClampedArray(img1.data.length);
  }

  for (let i = 0; i < totalPixels; i++) {
    const idx = i * 4;

    const r1 = img1.data[idx];
    const g1 = img1.data[idx + 1];
    const b1 = img1.data[idx + 2];
    // alpha = img1.data[idx + 3]

    const r2 = img2.data[idx];
    const g2 = img2.data[idx + 1];
    const b2 = img2.data[idx + 2];
    // alpha = img2.data[idx + 3]

    const isDifferent = r1 !== r2 || g1 !== g2 || b1 !== b2;

    if (isDifferent) {
      const isAA = ignoreAA && isAntiAliasingDifference(r1, g1, b1, r2, g2, b2, aaThreshold);

      if (!isAA) {
        diffPixels++;
      } else {
        antiAliasingDiffIgnored++;
      }

      if (diffImage) {
        // Highlight diff pixels in red
        diffImage[idx] = 255;
        diffImage[idx + 1] = 0;
        diffImage[idx + 2] = 0;
        diffImage[idx + 3] = 255;
      }
    } else if (diffImage) {
      // Copy original pixel
      diffImage[idx] = r1;
      diffImage[idx + 1] = g1;
      diffImage[idx + 2] = b1;
      diffImage[idx + 3] = img1.data[idx + 3];
    }
  }

  const pixelDiff = diffPixels / totalPixels;
  const ssim = calculateSSIM(img1, img2);
  const passed =
    pixelDiff <= (config.pixelDiffThreshold ?? PIXEL_DIFF_THRESHOLD) &&
    ssim >= (config.ssimThreshold ?? SSIM_THRESHOLD);

  const result: ComparisonResult = {
    passed,
    pixelDiff,
    ssim,
    diffPixels,
    totalPixels,
    antiAliasingDiffIgnored,
  };

  if (diffImage && config.generateDiffImage) {
    result.diffImage = {
      data: diffImage,
      width,
      height,
    };
  }

  return result;
}

/**
 * Compare two images with full visual regression analysis.
 */
export function compareImages(
  baseline: ImageData,
  current: ImageData,
  config: VisualRegressionConfig = {},
): ComparisonResult {
  const defaultConfig: VisualRegressionConfig = {
    pixelDiffThreshold: PIXEL_DIFF_THRESHOLD,
    ssimThreshold: SSIM_THRESHOLD,
    antiAliasingThreshold: ANTI_ALIASING_THRESHOLD,
    ignoreAntiAliasing: true,
    ignoreTiming: true,
    generateDiffImage: false,
    ...config,
  };

  return comparePixels(baseline, current, defaultConfig);
}

/**
 * Encode ImageData to PNG buffer.
 * Note: This is a simplified implementation. For full PNG encoding,
 * use a library like pngjs or canvas in Node.js, or canvas.toDataURL() in browser.
 */
export function encodeImageData(imageData: ImageData): Promise<Buffer> {
  // In Node.js context with Playwright, this would use pngjs
  // In browser context, this would use canvas.toDataURL()
  // For now, return a minimal implementation
  return Promise.resolve(Buffer.from(imageData.data.buffer));
}

/**
 * Create a baseline screenshot path based on test name and browser.
 */
export function getBaselinePath(testName: string, browser: string): string {
  const sanitizedName = testName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `/tests/e2e/webxr/screenshots/baseline/${browser}/${sanitizedName}.png`;
}

/**
 * Create a diff screenshot path based on test name.
 */
export function getDiffPath(testName: string): string {
  const sanitizedName = testName
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
  return `/tests/e2e/webxr/screenshots/diff/${sanitizedName}.png`;
}

/**
 * Format comparison result for reporting.
 */
export function formatComparisonResult(result: ComparisonResult): string {
  const percentage = (result.pixelDiff * 100).toFixed(2);
  const antiAliasing = result.antiAliasingDiffIgnored
    ? ` (${result.antiAliasingDiffIgnored} anti-aliasing differences ignored)`
    : '';

  return `Pixel difference: ${percentage}%${antiAliasing}, SSIM: ${result.ssim.toFixed(4)}, Status: ${result.passed ? 'PASS' : 'FAIL'}`;
}

/**
 * Check if images are effectively identical (considering thresholds).
 */
export function areImagesSimilar(
  img1: ImageData,
  img2: ImageData,
  config?: VisualRegressionConfig,
): boolean {
  return compareImages(img1, img2, config).passed;
}
