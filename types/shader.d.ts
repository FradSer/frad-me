/**
 * TypeScript declarations for GLSL shader imports
 * Allows importing .vert and .frag files as strings
 */

declare module '*.vert' {
  const content: string;
  export default content;
}

declare module '*.frag' {
  const content: string;
  export default content;
}

declare module '*.glsl' {
  const content: string;
  export default content;
}
