/**
 * Regression guard for commit 37f7098 (feat: add button hover for chat), which
 * deleted SPRING_CONFIG / TEXT_SPRING_CONFIG / BLEND_FACTOR but left the
 * references on lines 58, 59, 63, 64, 74 — causing every StandardLayout render
 * to throw `ReferenceError: SPRING_CONFIG is not defined`.
 *
 * If any of those identifiers go missing again the mere act of rendering will
 * throw, and this test will fail before the StandardLayout error surfaces in
 * production.
 */
import { render } from '@testing-library/react';

import DotRing from '../DotRing';

describe('DotRing', () => {
  it('mounts without ReferenceError (spring configs are defined)', () => {
    expect(() => render(<DotRing />)).not.toThrow();
  });
});
