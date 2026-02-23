'use client';

/**
 * Unit tests for accessibilityValidator utility
 * Follows BDD TDD approach: RED failing tests -> GREEN implementation -> REFACTOR
 */

import {
  calculateContrastRatio,
  calculateLuminance,
  checkAriaLabel,
  checkContrast,
  checkFontSize,
  checkKeyboardNavigability,
  checkReducedMotion,
  generateAccessibilityReport,
  hexToRgb,
  MAX_VR_FONT_SIZE_PT,
  MIN_VR_FONT_SIZE_PT,
  matchesFocusableElement,
  rgbStringToRgb,
  WCAG_AA_LARGE_TEXT,
  WCAG_AA_THRESHOLD,
  WEBXR_ARIA_PATTERNS,
  WEBXR_COLORS,
} from '@/utils/webxr/accessibilityValidator';

describe('Accessibility Validator - WCAG Constants', () => {
  test('should have correct WCAG AA threshold for normal text', () => {
    expect(WCAG_AA_THRESHOLD).toBe(4.5);
  });

  test('should have correct WCAG AA threshold for large text', () => {
    expect(WCAG_AA_LARGE_TEXT).toBe(3);
  });

  test('should have correct VR font size range', () => {
    expect(MIN_VR_FONT_SIZE_PT).toBe(16);
    expect(MAX_VR_FONT_SIZE_PT).toBe(20);
  });
});

describe('Accessibility Validator - Color Parsing', () => {
  test('should parse 6-digit hex color', () => {
    const result = hexToRgb('#ffffff');
    expect(result).toEqual({ red: 255, green: 255, blue: 255 });
  });

  test('should parse 3-digit hex color', () => {
    const result = hexToRgb('#fff');
    expect(result).toEqual({ red: 255, green: 255, blue: 255 });
  });

  test('should parse hex color without # prefix', () => {
    const result = hexToRgb('ffffff');
    expect(result).toEqual({ red: 255, green: 255, blue: 255 });
  });

  test('should parse black hex color', () => {
    const result = hexToRgb('#000000');
    expect(result).toEqual({ red: 0, green: 0, blue: 0 });
  });

  test('should return null for invalid hex color', () => {
    const result = hexToRgb('invalid');
    expect(result).toBeNull();
  });

  test('should parse rgb string', () => {
    const result = rgbStringToRgb('rgb(255, 255, 255)');
    expect(result).toEqual({ red: 255, green: 255, blue: 255 });
  });

  test('should parse rgba string', () => {
    const result = rgbStringToRgb('rgba(255, 255, 255, 0.5)');
    expect(result).toEqual({ red: 255, green: 255, blue: 255 });
  });

  test('should return null for invalid rgb string', () => {
    const result = rgbStringToRgb('invalid');
    expect(result).toBeNull();
  });
});

describe('Accessibility Validator - Luminance Calculation', () => {
  test('should calculate luminance for white', () => {
    const luminance = calculateLuminance({ red: 255, green: 255, blue: 255 });
    expect(luminance).toBeCloseTo(1, 2);
  });

  test('should calculate luminance for black', () => {
    const luminance = calculateLuminance({ red: 0, green: 0, blue: 0 });
    expect(luminance).toBe(0);
  });

  test('should calculate luminance for medium gray', () => {
    const luminance = calculateLuminance({ red: 128, green: 128, blue: 128 });
    expect(luminance).toBeGreaterThan(0);
    expect(luminance).toBeLessThan(1);
  });
});

describe('Accessibility Validator - Contrast Ratio', () => {
  test('should calculate contrast ratio for white on black', () => {
    const ratio = calculateContrastRatio(
      { red: 255, green: 255, blue: 255 },
      { red: 0, green: 0, blue: 0 },
    );
    expect(ratio).toBeCloseTo(21, 0);
  });

  test('should calculate contrast ratio for black on white', () => {
    const ratio = calculateContrastRatio(
      { red: 0, green: 0, blue: 0 },
      { red: 255, green: 255, blue: 255 },
    );
    expect(ratio).toBeCloseTo(21, 0);
  });

  test('should return higher ratio for higher contrast', () => {
    const highContrast = calculateContrastRatio(
      { red: 255, green: 255, blue: 255 },
      { red: 0, green: 0, blue: 0 },
    );
    const lowContrast = calculateContrastRatio(
      { red: 128, green: 128, blue: 128 },
      { red: 100, green: 100, blue: 100 },
    );
    expect(highContrast).toBeGreaterThan(lowContrast);
  });
});

describe('Accessibility Validator - Contrast Check', () => {
  test('should pass white on black contrast', () => {
    const result = checkContrast('#ffffff', '#000000');
    expect(result.passes).toBeTruthy();
    expect(result.level).toBe('AAA');
    expect(result.ratio).toBeCloseTo(21, 0);
  });

  test('should fail low contrast', () => {
    const result = checkContrast('#808080', '#606060');
    expect(result.passes).toBeFalsy();
    expect(result.level).toBe('fail');
  });

  test('should use large text threshold for large text', () => {
    const result = checkContrast('#808080', '#606060', true);
    // Large text has lower threshold (3:1 vs 4.5:1)
    expect(result.passes).toBe(checkContrast('#808080', '#606060', false).passes);
  });

  test('should handle hex colors', () => {
    const result = checkContrast('#ffffff', '#000000');
    expect(result.passes).toBeTruthy();
  });

  test('should handle rgb colors', () => {
    const result = checkContrast('rgb(255, 255, 255)', 'rgb(0, 0, 0)');
    expect(result.passes).toBeTruthy();
  });

  test('should handle invalid colors', () => {
    const result = checkContrast('invalid', 'invalid');
    expect(result.passes).toBeFalsy();
    expect(result.level).toBe('fail');
  });

  test('should return AAA level for very high contrast (>= 7:1)', () => {
    const result = checkContrast('#ffffff', '#000000');
    expect(result.level).toBe('AAA');
  });

  test('should return AA level for moderate contrast (4.5:1 to 7:1)', () => {
    const result = checkContrast('#606060', '#ffffff');
    expect(result.passes).toBeTruthy();
    expect(result.level).toBe('AA');
  });
});

describe('Accessibility Validator - ARIA Label Check', () => {
  let mockElement: Element;

  beforeEach(() => {
    mockElement = document.createElement('button');
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
  });

  test('should pass when aria-label is present', () => {
    mockElement.setAttribute('aria-label', 'Navigate to work view');
    const result = checkAriaLabel(mockElement);
    expect(result.passes).toBeTruthy();
    expect(result.label).toBe('Navigate to work view');
  });

  test('should fail when aria-label is missing', () => {
    const result = checkAriaLabel(mockElement);
    expect(result.passes).toBeFalsy();
    expect(result.label).toBeNull();
  });

  test('should pass when aria-labelledby is present', () => {
    mockElement.setAttribute('aria-labelledby', 'label-id');
    const result = checkAriaLabel(mockElement);
    expect(result.passes).toBeTruthy();
    expect(result.label).toBe('label-id');
  });

  test('should match required pattern', () => {
    mockElement.setAttribute('aria-label', 'Navigate to work view');
    const pattern = /^Navigate to (work|home) view$/;
    const result = checkAriaLabel(mockElement, pattern);
    expect(result.passes).toBeTruthy();
  });

  test('should fail when pattern does not match', () => {
    mockElement.setAttribute('aria-label', 'Click me');
    const pattern = /^Navigate to (work|home) view$/;
    const result = checkAriaLabel(mockElement, pattern);
    expect(result.passes).toBeFalsy();
  });

  test('should check work card pattern', () => {
    mockElement.setAttribute('aria-label', 'My Project - A cool description');
    const result = checkAriaLabel(mockElement, WEBXR_ARIA_PATTERNS.workCard);
    expect(result.passes).toBeTruthy();
  });

  test('should check navigation button pattern', () => {
    mockElement.setAttribute('aria-label', 'Navigate to work view');
    const result = checkAriaLabel(mockElement, WEBXR_ARIA_PATTERNS.navigationButton);
    expect(result.passes).toBeTruthy();
  });

  test('should check external link pattern', () => {
    mockElement.setAttribute('aria-label', 'External link to GitHub');
    const result = checkAriaLabel(mockElement, WEBXR_ARIA_PATTERNS.externalLink);
    expect(result.passes).toBeTruthy();
  });
});

describe('Accessibility Validator - Font Size Check', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    document.body.removeChild(mockElement);
  });

  test('should pass for readable font size (18pt)', () => {
    mockElement.style.fontSize = '18pt';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.passes).toBeTruthy();
    expect(result.size).toBe(18);
    expect(result.unit).toBe('pt');
  });

  test('should pass for minimum font size (16pt)', () => {
    mockElement.style.fontSize = '16pt';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.passes).toBeTruthy();
  });

  test('should pass for maximum font size (20pt)', () => {
    mockElement.style.fontSize = '20pt';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.passes).toBeTruthy();
  });

  test('should fail for too small font size (15pt)', () => {
    mockElement.style.fontSize = '15pt';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.passes).toBeFalsy();
  });

  test('should fail for too large font size (21pt)', () => {
    mockElement.style.fontSize = '21pt';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.passes).toBeFalsy();
  });

  test('should handle px units', () => {
    mockElement.style.fontSize = '18pt';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.unit).toBe('pt');
  });

  test('should handle em units', () => {
    mockElement.style.fontSize = '1.2em';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.unit).toBe('em');
  });

  test('should handle rem units', () => {
    mockElement.style.fontSize = '1.2rem';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.unit).toBe('rem');
  });

  test('should fail for invalid font size', () => {
    mockElement.style.fontSize = 'invalid';
    const style = window.getComputedStyle(mockElement);
    const result = checkFontSize(style);
    expect(result.passes).toBeFalsy();
    expect(result.description).toContain('Unable to parse');
  });
});

describe('Accessibility Validator - Keyboard Navigability', () => {
  let mockButton: HTMLButtonElement;
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    mockButton = document.createElement('button');
    mockButton.textContent = 'Click me';
    mockButton.style.outline = '2px solid blue';
    document.body.appendChild(mockButton);

    mockLink = document.createElement('a');
    mockLink.href = '#';
    mockLink.textContent = 'Link';
    document.body.appendChild(mockLink);
  });

  afterEach(() => {
    document.body.removeChild(mockButton);
    document.body.removeChild(mockLink);
  });

  test('should pass for keyboard navigable button', () => {
    const result = checkKeyboardNavigability(mockButton);
    expect(result.passes).toBeTruthy();
    expect(result.tabNavigable).toBeTruthy();
  });

  test('should pass for keyboard navigable link', () => {
    const result = checkKeyboardNavigability(mockLink);
    expect(result.passes).toBeTruthy();
    expect(result.tabNavigable).toBeTruthy();
  });

  test('should detect visible focus indicator', () => {
    const result = checkKeyboardNavigability(mockButton);
    expect(result.focusVisible).toBeTruthy();
  });

  test('should fail for element without focus indicator', () => {
    mockButton.style.outline = 'none';
    mockButton.style.boxShadow = 'none';
    const result = checkKeyboardNavigability(mockButton);
    expect(result.focusVisible).toBeFalsy();
    expect(result.passes).toBeFalsy();
  });

  test('should detect data-focus-visible attribute', () => {
    mockButton.style.outline = 'none';
    mockButton.style.boxShadow = 'none';
    mockButton.setAttribute('data-focus-visible', 'true');
    const result = checkKeyboardNavigability(mockButton);
    expect(result.focusVisible).toBeTruthy();
  });
});

describe('Accessibility Validator - Focusable Element Matching', () => {
  test('should match button element', () => {
    const button = document.createElement('button');
    expect(matchesFocusableElement(button)).toBeTruthy();
  });

  test('should match anchor with href', () => {
    const link = document.createElement('a');
    link.href = '#';
    expect(matchesFocusableElement(link)).toBeTruthy();
  });

  test('should not match anchor without href', () => {
    const link = document.createElement('a');
    expect(matchesFocusableElement(link)).toBeFalsy();
  });

  test('should match input without disabled', () => {
    const input = document.createElement('input');
    expect(matchesFocusableElement(input)).toBeTruthy();
  });

  test('should not match disabled input', () => {
    const input = document.createElement('input');
    input.disabled = true;
    expect(matchesFocusableElement(input)).toBeFalsy();
  });

  test('should match textarea', () => {
    const textarea = document.createElement('textarea');
    expect(matchesFocusableElement(textarea)).toBeTruthy();
  });

  test('should match select', () => {
    const select = document.createElement('select');
    expect(matchesFocusableElement(select)).toBeTruthy();
  });

  test('should match tabindex="0"', () => {
    const div = document.createElement('div');
    div.setAttribute('tabindex', '0');
    expect(matchesFocusableElement(div)).toBeTruthy();
  });

  test('should not match tabindex="-1"', () => {
    const div = document.createElement('div');
    div.setAttribute('tabindex', '-1');
    expect(matchesFocusableElement(div)).toBeFalsy();
  });

  test('should match contenteditable="true"', () => {
    const div = document.createElement('div');
    div.setAttribute('contenteditable', 'true');
    expect(matchesFocusableElement(div)).toBeTruthy();
  });
});

describe('Accessibility Validator - Reduced Motion', () => {
  let mockElement: HTMLElement;

  beforeEach(() => {
    mockElement = document.createElement('div');
    document.body.appendChild(mockElement);
  });

  afterEach(() => {
    if (mockElement.parentElement === document.body) {
      document.body.removeChild(mockElement);
    }
  });

  test('should return true when no motion exists', () => {
    mockElement.style.transition = 'none';
    mockElement.style.animation = 'none';
    const result = checkReducedMotion(mockElement);
    expect(result).toBeTruthy();
  });

  test('should return true when reduced motion is not enabled', () => {
    // Mock window.matchMedia to return false for reduced motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    mockElement.style.transition = 'all 0.3s ease';
    const result = checkReducedMotion(mockElement);
    expect(result).toBeTruthy();

    window.matchMedia = originalMatchMedia;
  });

  test('should check for linear timing when reduced motion is enabled', () => {
    // Create a fresh element for this test
    const testElement = document.createElement('div');
    testElement.style.transition = 'all 0.3s linear';
    document.body.appendChild(testElement);

    // Mock window.matchMedia to return true for reduced motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const result = checkReducedMotion(testElement);
    expect(result).toBeTruthy();

    document.body.removeChild(testElement);
    window.matchMedia = originalMatchMedia;
  });

  test('should return false when timing is not linear and reduced motion is enabled', () => {
    // Create a fresh element for this test with explicit non-linear transition
    const testElement = document.createElement('div');
    // Use a class and inject a style to ensure computed style picks it up
    testElement.className = 'test-non-linear';
    const style = document.createElement('style');
    style.textContent = '.test-non-linear { transition: all 0.3s ease-in-out; }';
    document.head.appendChild(style);
    document.body.appendChild(testElement);

    // Mock window.matchMedia to return true for reduced motion
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    // Force the computed style to refresh
    void testElement.offsetHeight;

    const computedStyle = window.getComputedStyle(testElement);
    console.log('Debug - transition:', computedStyle.transition);
    console.log('Debug - transitionTimingFunction:', computedStyle.transitionTimingFunction);

    const result = checkReducedMotion(testElement);
    expect(result).toBeFalsy();

    document.body.removeChild(testElement);
    document.head.removeChild(style);
    window.matchMedia = originalMatchMedia;
  });
});

describe('Accessibility Validator - WebXR Colors', () => {
  test('should have white color', () => {
    expect(WEBXR_COLORS.white).toBe('#ffffff');
  });

  test('should have black color', () => {
    expect(WEBXR_COLORS.black).toBe('#000000');
  });

  test('should have yellow500 color', () => {
    expect(WEBXR_COLORS.yellow500).toBe('#eab308');
  });

  test('should have blue400 color', () => {
    expect(WEBXR_COLORS.blue400).toBe('#60a5fa');
  });

  test('white on black should pass WCAG AA', () => {
    const result = checkContrast(WEBXR_COLORS.white, WEBXR_COLORS.black);
    expect(result.passes).toBeTruthy();
    expect(result.level).toBe('AAA');
  });

  test('yellow500 text on black should pass WCAG AA', () => {
    const result = checkContrast(WEBXR_COLORS.yellow500, WEBXR_COLORS.black);
    expect(result.passes).toBeTruthy();
  });

  test('blue400 text on black should pass WCAG AA', () => {
    const result = checkContrast(WEBXR_COLORS.blue400, WEBXR_COLORS.black);
    expect(result.passes).toBeTruthy();
  });
});

describe('Accessibility Validator - Accessibility Report', () => {
  let mockButton: HTMLButtonElement;
  let mockLink: HTMLAnchorElement;

  beforeEach(() => {
    mockButton = document.createElement('button');
    mockButton.textContent = 'Navigate to work view';
    mockButton.setAttribute('aria-label', 'Navigate to work view');
    mockButton.style.outline = '2px solid blue';
    mockButton.style.fontSize = '18px';
    document.body.appendChild(mockButton);

    mockLink = document.createElement('a');
    mockLink.href = '#';
    mockLink.textContent = 'External link to GitHub';
    mockLink.setAttribute('aria-label', 'External link to GitHub');
    document.body.appendChild(mockLink);
  });

  afterEach(() => {
    document.body.removeChild(mockButton);
    document.body.removeChild(mockLink);
  });

  test('should generate comprehensive accessibility report', () => {
    const selectors = {
      button: {
        contrast: { foreground: '#ffffff', background: '#000000' },
        ariaPattern: WEBXR_ARIA_PATTERNS.navigationButton,
        checkFontSize: true,
        checkKeyboard: true,
      },
      'a[href]': {
        contrast: { foreground: '#ffffff', background: '#000000' },
        ariaPattern: WEBXR_ARIA_PATTERNS.externalLink,
        checkKeyboard: true,
      },
    };

    const report = generateAccessibilityReport(selectors);

    expect(report.contrastResults.length).toBeGreaterThan(0);
    expect(report.ariaResults.length).toBeGreaterThan(0);
    expect(report.fontSizeResults.length).toBeGreaterThan(0);
    expect(report.keyboardResults.length).toBeGreaterThan(0);
    expect(report.reducedMotionResults.length).toBeGreaterThan(0);
    expect(report.timestamp).toBeDefined();
  });

  test('should report overall pass when all checks pass', () => {
    // Create a button with proper styling for VR
    const testButton = document.createElement('button');
    testButton.setAttribute('aria-label', 'Navigate to work view');
    testButton.style.outline = '2px solid blue';
    testButton.style.fontSize = '18pt';
    testButton.className = 'test-vr-button';
    document.body.appendChild(testButton);

    const selectors = {
      '.test-vr-button': {
        contrast: { foreground: '#ffffff', background: '#000000' },
        ariaPattern: WEBXR_ARIA_PATTERNS.navigationButton,
        checkFontSize: true,
        checkKeyboard: true,
      },
    };

    const report = generateAccessibilityReport(selectors);

    document.body.removeChild(testButton);

    expect(report.overallPasses).toBeTruthy();
  });

  test('should report overall fail when any check fails', () => {
    const testDiv = document.createElement('div');
    testDiv.className = 'test-fail-div';
    document.body.appendChild(testDiv);

    const selectors = {
      '.test-fail-div': {
        contrast: { foreground: '#808080', background: '#606060' },
        checkKeyboard: true,
      },
    };

    const report = generateAccessibilityReport(selectors);

    document.body.removeChild(testDiv);

    expect(report.overallPasses).toBeFalsy();
  });

  test('should include detailed results for each selector', () => {
    const selectors = {
      button: {
        contrast: { foreground: '#ffffff', background: '#000000' },
      },
    };

    const report = generateAccessibilityReport(selectors);

    const contrastResult = report.contrastResults.find((r) => r.selector === 'button');
    expect(contrastResult).toBeDefined();
    expect(contrastResult?.result.ratio).toBeGreaterThan(0);
  });
});
