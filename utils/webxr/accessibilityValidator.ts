'use client';

/**
 * Accessibility validation utility for WebXR components.
 * Provides methods to check WCAG AA compliance including color contrast,
 * ARIA labels, keyboard navigability, and font sizes.
 */

/**
 * WCAG AA contrast ratio thresholds
 */
export const WCAG_AA_THRESHOLD = 4.5;
export const WCAG_AA_LARGE_TEXT = 3;

/**
 * Minimum font size for VR text (in points, approximately)
 */
export const MIN_VR_FONT_SIZE_PT = 16;
export const MAX_VR_FONT_SIZE_PT = 20;

/**
 * RGB color interface
 */
export interface RgbColor {
  red: number;
  green: number;
  blue: number;
}

/**
 * Contrast check result
 */
export interface ContrastResult {
  ratio: number;
  passes: boolean;
  level: 'AAA' | 'AA' | 'fail';
}

/**
 * ARIA label check result
 */
export interface AriaResult {
  passes: boolean;
  label: string | null;
  description: string;
}

/**
 * Font size check result
 */
export interface FontSizeResult {
  size: number;
  unit: string;
  passes: boolean;
  description: string;
}

/**
 * Keyboard navigability check result
 */
export interface KeyboardResult {
  passes: boolean;
  tabNavigable: boolean;
  focusVisible: boolean;
  description: string;
}

/**
 * Comprehensive accessibility report
 */
export interface AccessibilityReport {
  contrastResults: Array<{
    selector: string;
    result: ContrastResult;
  }>;
  ariaResults: Array<{
    selector: string;
    result: AriaResult;
  }>;
  fontSizeResults: Array<{
    selector: string;
    result: FontSizeResult;
  }>;
  keyboardResults: Array<{
    selector: string;
    result: KeyboardResult;
  }>;
  reducedMotionResults: Array<{
    selector: string;
    respects: boolean;
    description: string;
  }>;
  overallPasses: boolean;
  timestamp: string;
}

/**
 * Parse hex color to RGB
 */
export function hexToRgb(hex: string): RgbColor | null {
  const cleanHex = hex.replace(/^#/, '');

  if (cleanHex.length === 3) {
    const expanded = cleanHex
      .split('')
      .map((char) => `${char}${char}`)
      .join('');
    return hexToRgb(`#${expanded}`);
  }

  if (cleanHex.length !== 6) {
    return null;
  }

  const red = Number.parseInt(cleanHex.substring(0, 2), 16);
  const green = Number.parseInt(cleanHex.substring(2, 4), 16);
  const blue = Number.parseInt(cleanHex.substring(4, 6), 16);

  return { red, green, blue };
}

/**
 * Parse RGB string to RGB color
 */
export function rgbStringToRgb(rgbString: string): RgbColor | null {
  const match = rgbString.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)$/);

  if (!match) {
    return null;
  }

  return {
    red: Number.parseInt(match[1], 10),
    green: Number.parseInt(match[2], 10),
    blue: Number.parseInt(match[3], 10),
  };
}

/**
 * Calculate relative luminance of a color
 * Based on WCAG 2.0 specification
 */
export function calculateLuminance(color: RgbColor): number {
  const normalizeChannel = (channel: number): number => {
    const sRGB = channel / 255;
    return sRGB <= 0.03928 ? sRGB / 12.92 : ((sRGB + 0.055) / 1.055) ** 2.4;
  };

  const normalizedRed = normalizeChannel(color.red);
  const normalizedGreen = normalizeChannel(color.green);
  const normalizedBlue = normalizeChannel(color.blue);

  return 0.2126 * normalizedRed + 0.7152 * normalizedGreen + 0.0722 * normalizedBlue;
}

/**
 * Calculate contrast ratio between two colors
 */
export function calculateContrastRatio(foreground: RgbColor, background: RgbColor): number {
  const luminance1 = calculateLuminance(foreground);
  const luminance2 = calculateLuminance(background);

  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if color contrast meets WCAG AA standards
 */
export function checkContrast(
  foreground: string,
  background: string,
  isLargeText = false,
): ContrastResult {
  const fgColor = hexToRgb(foreground) || rgbStringToRgb(foreground);
  const bgColor = hexToRgb(background) || rgbStringToRgb(background);

  if (!fgColor || !bgColor) {
    return {
      ratio: 0,
      passes: false,
      level: 'fail',
    };
  }

  const ratio = calculateContrastRatio(fgColor, bgColor);
  const threshold = isLargeText ? WCAG_AA_LARGE_TEXT : WCAG_AA_THRESHOLD;

  let level: 'AAA' | 'AA' | 'fail';
  if (ratio >= 7) {
    level = 'AAA';
  } else if (ratio >= threshold) {
    level = 'AA';
  } else {
    level = 'fail';
  }

  return {
    ratio: Number.parseFloat(ratio.toFixed(2)),
    passes: ratio >= threshold,
    level,
  };
}

/**
 * Check ARIA label presence and quality
 */
export function checkAriaLabel(element: Element, requiredLabelPattern?: RegExp): AriaResult {
  const ariaLabel = element.getAttribute('aria-label');
  const ariaLabelledBy = element.getAttribute('aria-labelledby');

  let label: string | null = ariaLabel || ariaLabelledBy || null;

  // Check for alternative sources if no ARIA label
  if (!label) {
    const id = element.getAttribute('id');
    if (id) {
      const labelElement = document.querySelector(`[for="${id}"], [aria-labelledby="${id}"]`);
      if (labelElement) {
        label = labelElement.textContent?.trim() || null;
      }
    }
  }

  // Check against required pattern if provided
  if (requiredLabelPattern && label) {
    const matchesPattern = requiredLabelPattern.test(label);
    return {
      passes: matchesPattern,
      label,
      description: matchesPattern
        ? 'ARIA label matches required pattern'
        : `ARIA label does not match pattern: ${requiredLabelPattern.source}`,
    };
  }

  return {
    passes: label !== null && label.length > 0,
    label,
    description: label ? 'ARIA label present' : 'No ARIA label found',
  };
}

/**
 * Check font size meets VR readability requirements
 */
export function checkFontSize(computedStyle: CSSStyleDeclaration): FontSizeResult {
  const fontSize = computedStyle.fontSize;
  const match = fontSize.match(/^([\d.]+)(px|pt|em|rem)$/);

  if (!match) {
    return {
      size: 0,
      unit: 'unknown',
      passes: false,
      description: 'Unable to parse font size',
    };
  }

  const value = Number.parseFloat(match[1]);
  const unit = match[2];

  // Convert to points for comparison
  let sizeInPt = value;
  switch (unit) {
    case 'px':
      sizeInPt = value * 0.75;
      break;
    case 'rem':
    case 'em':
      sizeInPt = value * 16 * 0.75; // Assuming 16px base
      break;
    default:
      sizeInPt = value;
      break;
  }

  const passes = sizeInPt >= MIN_VR_FONT_SIZE_PT && sizeInPt <= MAX_VR_FONT_SIZE_PT;

  return {
    size: value,
    unit,
    passes,
    description: passes
      ? `Font size ${fontSize} meets VR readability requirements`
      : `Font size ${fontSize} does not meet VR readability requirements (${MIN_VR_FONT_SIZE_PT}-${MAX_VR_FONT_SIZE_PT}pt)`,
  };
}

/**
 * Check keyboard navigability of an element
 */
export function checkKeyboardNavigability(element: Element): KeyboardResult {
  const tabNavigable = matchesFocusableElement(element);

  if (!tabNavigable) {
    return {
      passes: false,
      tabNavigable: false,
      focusVisible: false,
      description: 'Element is not keyboard navigable',
    };
  }

  const computedStyle = window.getComputedStyle(element);
  const focusVisible =
    computedStyle.outline !== 'none' ||
    computedStyle.boxShadow !== 'none' ||
    element.hasAttribute('data-focus-visible');

  return {
    passes: tabNavigable && focusVisible,
    tabNavigable,
    focusVisible,
    description: focusVisible
      ? 'Element is keyboard navigable with visible focus indicator'
      : 'Element is keyboard navigable but lacks visible focus indicator',
  };
}

/**
 * Check if an element matches focusable selectors
 */
export function matchesFocusableElement(element: Element): boolean {
  const focusableSelectors = [
    'button',
    'a[href]',
    'input:not([disabled])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ];

  return focusableSelectors.some((selector) => {
    try {
      return element.matches(selector);
    } catch {
      return false;
    }
  });
}

/**
 * Check if element respects reduced motion preference
 */
export function checkReducedMotion(element: Element): boolean {
  const computedStyle = window.getComputedStyle(element);

  // Check for transition/animation
  const transition = computedStyle.transition;
  const hasTransition = transition !== 'none' && transition !== '';
  const hasAnimation = computedStyle.animationName !== 'none';

  if (!hasTransition && !hasAnimation) {
    return true; // No motion to respect
  }

  // Check if reduced motion is enabled
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!prefersReducedMotion) {
    return true; // Motion is allowed
  }

  // Check if transitions/animations are linear when reduced motion is on
  const transitionTiming = computedStyle.transitionTimingFunction;
  const animationTiming = computedStyle.animationTimingFunction;

  // Parse transition timing from the transition property if transitionTimingFunction is empty
  let parsedTransitionTiming = transitionTiming;
  if (transitionTiming === '' && hasTransition) {
    const timingMatch = transition.match(/[^,]+(?:ease|linear|step)(?:-|$)/);
    if (timingMatch) {
      parsedTransitionTiming = timingMatch[0];
    }
  }

  const hasLinearTiming =
    parsedTransitionTiming.includes('linear') || animationTiming.includes('linear');

  return hasLinearTiming;
}

/**
 * Generate comprehensive accessibility report
 */
export function generateAccessibilityReport(
  selectors: Record<
    string,
    {
      contrast?: { foreground: string; background: string; isLargeText?: boolean };
      ariaPattern?: RegExp;
      checkFontSize?: boolean;
      checkKeyboard?: boolean;
    }
  >,
): AccessibilityReport {
  const report: AccessibilityReport = {
    contrastResults: [],
    ariaResults: [],
    fontSizeResults: [],
    keyboardResults: [],
    reducedMotionResults: [],
    overallPasses: true,
    timestamp: new Date().toISOString(),
  };

  for (const [selector, checks] of Object.entries(selectors)) {
    const elements = Array.from(document.querySelectorAll(selector));

    for (const element of elements) {
      if (checks.contrast) {
        const contrastResult = checkContrast(
          checks.contrast.foreground,
          checks.contrast.background,
          checks.contrast.isLargeText,
        );
        report.contrastResults.push({
          selector,
          result: contrastResult,
        });
        if (!contrastResult.passes) {
          report.overallPasses = false;
        }
      }

      if (checks.ariaPattern) {
        const ariaResult = checkAriaLabel(element, checks.ariaPattern);
        report.ariaResults.push({
          selector,
          result: ariaResult,
        });
        if (!ariaResult.passes) {
          report.overallPasses = false;
        }
      }

      if (checks.checkFontSize) {
        const computedStyle = window.getComputedStyle(element);
        const fontSizeResult = checkFontSize(computedStyle);
        report.fontSizeResults.push({
          selector,
          result: fontSizeResult,
        });
        if (!fontSizeResult.passes) {
          report.overallPasses = false;
        }
      }

      if (checks.checkKeyboard) {
        const keyboardResult = checkKeyboardNavigability(element);
        report.keyboardResults.push({
          selector,
          result: keyboardResult,
        });
        if (!keyboardResult.passes) {
          report.overallPasses = false;
        }
      }

      const reducedMotion = checkReducedMotion(element);
      report.reducedMotionResults.push({
        selector,
        respects: reducedMotion,
        description: reducedMotion
          ? 'Element respects reduced motion preference'
          : 'Element does not respect reduced motion preference',
      });
      if (!reducedMotion) {
        report.overallPasses = false;
      }
    }
  }

  return report;
}

/**
 * Get specific ARIA label patterns for WebXR components
 */
export const WEBXR_ARIA_PATTERNS = {
  workCard: /^(.+\s*-\s*.+)$/,
  navigationButton: /^Navigate to (work|home) view$/,
  externalLink: /^External link to .+$/,
};

/**
 * Get common WebXR colors for contrast checking
 */
export const WEBXR_COLORS = {
  white: '#ffffff',
  black: '#000000',
  gray400: '#9ca3af',
  gray500: '#d1d5db',
  yellow500: '#eab308',
  yellow600: '#ca8a04',
  blue400: '#60a5fa',
} as const;
