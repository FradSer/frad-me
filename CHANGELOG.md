# Changelog

## [0.16.0](https://github.com/FradSer/frad-me/compare/v0.15.1...v0.16.0) (2025-10-23)

### Features

- **header:** enhance header contrast with mix-blend-difference for better accessibility
  - Implement advanced CSS blend modes for improved text contrast against backgrounds
  - Add dynamic contrast adjustment based on content visibility
  - Improve header readability in various viewing conditions

### Refactoring

- **header:** restructure header positioning and layout system
  - Reorganize header component architecture for better maintainability
  - Improve layout calculations for responsive behavior
  - Optimize header positioning logic for WebXR and standard layouts

### Testing

- **test:** add header component test coverage for improved reliability
  - Implement comprehensive unit tests for header functionality
  - Add integration tests for header interactions
  - Ensure proper test coverage for header contrast features

### Documentation

- **docs:** document UI contrast patterns and header guidelines
  - Create comprehensive documentation for UI contrast implementation
  - Add header design guidelines and usage patterns
  - Document accessibility considerations for contrast design

- **docs:** add critical implementation patterns documentation
  - Document key architectural patterns used throughout the codebase
  - Provide implementation guidelines for WebXR components
  - Add performance optimization patterns and best practices

- **docs:** add contributors guide for project onboarding
  - Create comprehensive guide for new contributors
  - Document development workflow and coding standards
  - Add testing and quality assurance guidelines

### Testing Infrastructure

- **test:** add and update tests for header contrast and layout
  - Extend test coverage for header contrast functionality
  - Add layout validation tests for responsive behavior
  - Improve test reliability with better mocking infrastructure

- **test:** extend motion mocks for header and main elements
  - Enhance motion animation testing with improved mocks
  - Add comprehensive mocking for Framer Motion components
  - Improve test coverage for animation sequences

### Maintenance

- **chore:** extend motion mocks for more elements
  - Expand animation testing infrastructure
  - Improve test reliability for motion-based components
  - Add better mock coverage for complex animations

- **chore:** bump version to 0.16.0 for release
  - Update package.json version for release process
  - Prepare release with comprehensive documentation updates
  - Ensure all changes are properly documented and tested

## [0.15.1](https://github.com/FradSer/frad-me/compare/v0.15.0...v0.15.1) (2025-10-23)

### Features

- **theme:** implement theme switching functionality
  - Add theme toggle support for light/dark mode switching
  - Integrate next-themes for seamless theme management
  - Improve user experience with persistent theme preferences

## [0.15.0](https://github.com/FradSer/frad-me/compare/v0.14.3...v0.15.0) (2025-09-30)

### Maintenance

- **release:** version bump to 0.15.0 for release process
  - Update package.json version to 0.15.0
  - Prepare release with current state of the application
  - Maintain compatibility with existing WebXR and 3D features

## [0.14.3](https://github.com/FradSer/frad-me/compare/v0.14.2...v0.14.3) (2025-09-30)

### Bug Fixes

- **adsense:** complete adsense integration with real publisher configuration
  - Implement Next.js Script component for optimal AdSense loading and performance
  - Replace placeholder with real publisher ID (pub-6009006635541295) for production deployment
  - Update ads.txt file with production configuration for ad serving verification
  - Add AdSense account verification meta tag for domain ownership confirmation
  - Fix security and policy compliance issues for successful AdSense approval process

## [0.14.2](https://github.com/FradSer/frad-me/compare/v0.14.0...v0.14.2) (2025-09-30)

### Bug Fixes

- **adsense:** resolve policy violations and improve SEO compliance
  - Refactor page.tsx to use server-side rendering for better crawler access
  - Add selective client-side rendering for interactive components only
  - Create robots.ts configuration for proper search engine crawler behavior
  - Add ads.txt template file for AdSense compliance and ad serving verification
  - Fix "site down or unavailable" issues that were preventing AdSense approval
  - Improve crawler accessibility while maintaining interactive functionality

## [0.14.0](https://github.com/FradSer/frad-me/compare/v0.13.0...v0.14.0) (2025-09-25)

### Features

- **homepage:** add patent display section to homepage with comprehensive patent showcase
  - Create new Patents component displaying 8 granted patent numbers with clickable links
  - Add patent section below work section with proper typography matching hero styling
  - Implement white patent numbers with cursor hiding behavior similar to header links
  - Move patents section outside main container to match footer positioning structure

### Style Improvements

- **typography:** update patents title to match work title size with responsive scaling
- **animation:** make work text start scaling animation when entering viewport for better UX
- **spacing:** balance top and bottom spacing around work text for equal visual spacing
- **layout:** improve patent number separators with increased spacing and left alignment

## [0.13.0](https://github.com/FradSer/frad-me/compare/v0.12.0...v0.13.0) (2025-09-18)

### Features

- **resume:** add comprehensive resume page with linkedin integration
  - Create new resume page route (/resume) with Next.js metadata
  - Add complete resume component with animated sections and dynamic work duration calculation
  - Include comprehensive work experience from 2014-2023 with all major roles
  - Add skills categorization and notable projects showcase
  - Integrate hyperlinked bio showcasing expertise in Multi-Agent Systems, MCP servers, and spatial computing
  - Update header navigation to use internal resume route
  - Implement responsive design with 16-column grid system and Framer Motion animations

## [0.12.0](https://github.com/FradSer/frad-me/compare/v0.11.4...v0.12.0) (2025-09-17)

### Features

- **animation:** migrate from framer-motion to motion.dev for improved performance
- **styling:** upgrade tailwind css to v4.1.13 with enhanced features
- **portfolio:** add external link support to work cards for better navigation
- **portfolio:** add vivo vision xr case to showcase portfolio

### Bug Fixes

- **ui:** correct work card hover transparency effect for better visual feedback
- **webxr:** fix animation validation and test setup for proper testing
- **typescript:** correct return type for animation preset validation
- **links:** remove deprecated legacyBehavior and nested anchor tags
- **content:** complete missing work case content for portfolio completeness
- **styling:** revert tailwind css to v3 and fix associated styling issues

### Maintenance

- **deps:** remove release-it and related configuration to reduce bundle size
- **perf:** optimize bundle size by removing unused dependencies

## [0.11.4](https://github.com/FradSer/frad-me/compare/v0.11.3...v0.11.4) (2025-09-16)

### Features

- **webxr:** implement comprehensive WebXR test coverage with enhanced Playwright configuration

### Bug Fixes

- **typescript:** resolve typescript errors in errorlogger - add missing queueSize property and fix jest reference

### Refactoring

- **webxr:** simplify workgrid3d animation logic and improve structure
- **error-handling:** extract error handling constants and sanitization utilities
- **architecture:** remove redundant error boundaries and simplify architecture
- **animation:** consolidate animation utilities and improve code organization

### Documentation

- **docs:** improve claude.md with consolidated architecture info

### Maintenance

- **chore:** apply code formatting improvements and import ordering
- **tests:** update error boundary tests after component consolidation

## [0.11.3](https://github.com/FradSer/frad-me/compare/v0.11.2...v0.11.3) (2025-08-26)

### Features

- **webxr:** centralize animation constants into type-safe configuration system
- **webxr:** add animation performance monitoring hooks

### Bug Fixes

- **webxr:** improve work card and WIP badge visibility behavior
- **webxr:** add missing animation config properties for work cards
- **webxr:** resolve TypeScript type conversion issue in PositionManager
- **tests:** update validation tests to include required position schemas

### Changed

- **webxr:** simplify animation config system architecture
- **webxr:** complete migration of animation timing constants to centralized config
- **tests:** add comprehensive integration and unit tests for WebXR animation system

## [0.11.2](https://github.com/FradSer/frad-me/compare/v0.11.1...v0.11.2) (2025-08-25)

### Changed

- reorganize test structure to follow best practices
- replace eslint/prettier with biome code formatter

## [0.11.1](https://github.com/FradSer/frad-me/compare/v0.11.0...v0.11.1) (2025-08-22)

### Bug Fixes

- **webxr:** implement proper work cards transparency and rendering
- **webxr:** correct navigation positioning and route handling

## [0.11.0](https://github.com/FradSer/frad-me/compare/v0.10.0...v0.11.0) (2025-08-21)

### Features

- **webxr:** add animated spray effect for work cards - Cards animate from navigation button position to final grid positions creating a burst effect
- **webxr:** implement spray effect starting position - Change card entrance position to start from behind navigation button

### Bug Fixes

- **webxr:** enhance hover interaction and render layering - Add invisible hover detection area covering entire card including text, implement proper renderOrder system for layered hover effects, fix WIP badge z-fighting by adjusting position
- **webxr:** improve hover card positioning for forward movement - Change hover z position from 2 to -2 for forward movement toward camera
- **webxr:** stabilize card hover animations - Remove unstable spring object dependencies from useEffect to prevent animation resets, switch scale animation from bouncy to fast config for smoother transitions

### Maintenance

- **chore:** add packageManager field to package.json - Specify pnpm version for consistent package management

## [0.9.10](https://github.com/FradSer/frad-me/compare/v0.9.8...v0.9.10) (2025-04-27)

### Features

- add llms.txt ([70f62e4](https://github.com/FradSer/frad-me/commit/70f62e43b79b43344e6009ef661b6d84c4abde67))
- **cmpts:** add ad support ([4a4ed05](https://github.com/FradSer/frad-me/commit/4a4ed05593cff5a29ca3c2268843190c29f11efc))
- **cmpts:** update logo animation ([096d756](https://github.com/FradSer/frad-me/commit/096d756ca316c21b7540084b7ea51e7722567f94))
- **deps:** update deps and change to pnpm ([80f7f1f](https://github.com/FradSer/frad-me/commit/80f7f1f087e4b8d7ec66bb4d402bb2f68268dd8a))
- **landing:** integrate speech synthesis functionality ([1d4b2c4](https://github.com/FradSer/frad-me/commit/1d4b2c44a6352185169202a0175bc3b116ad17ba))

## [0.9.9](https://github.com/FradSer/frad-me/compare/v0.9.8...v0.9.9) (2024-11-03)

### Features

- **cmpts:** add ad support ([4a4ed05](https://github.com/FradSer/frad-me/commit/4a4ed05593cff5a29ca3c2268843190c29f11efc))
- **cmpts:** update logo animation ([096d756](https://github.com/FradSer/frad-me/commit/096d756ca316c21b7540084b7ea51e7722567f94))

## [0.9.8](https://github.com/FradSer/frad-me/compare/v0.9.7...v0.9.8) (2024-6-28)

### Bug Fixes

- **content:** correct terminology and typos ([0e69eca](https://github.com/FradSer/frad-me/commit/0e69eca75f3c3740b57054eaa91c0885ecc92a61))

## [0.9.7](https://github.com/FradSer/frad-me/compare/v0.9.6...v0.9.7) (2024-5-21)

### Bug Fixes

- **work:** fix typo in mdx components object ([35682ff](https://github.com/FradSer/frad-me/commit/35682ff30dec1f6374bfd790c90f881f6b1fac73))

## [0.9.6](https://github.com/FradSer/frad-me/compare/v0.9.5...v0.9.6) (2024-5-20)

## [0.9.5](https://github.com/FradSer/frad-me/compare/v0.9.4...v0.9.5) (2024-5-18)

### Features

- **cmpts:** add unoptimized prop to work image ([f2256b4](https://github.com/FradSer/frad-me/commit/f2256b427b4845eb9579ce33a60d8db54149bd87))

### Bug Fixes

- **cmpts:** typo ([40bc9fb](https://github.com/FradSer/frad-me/commit/40bc9fbd1baf4fbf22052cda78e574dc15df9a0f))
- **work:** adjust width of images ([f27ec46](https://github.com/FradSer/frad-me/commit/f27ec462f3daaa8d915689c88914b502b584e5e0))

## [0.9.4](https://github.com/FradSer/frad-me/compare/v0.9.3...v0.9.4) (2024-5-7)

### Features

- **landing:** update footer copyright year ([b2cfcac](https://github.com/FradSer/frad-me/commit/b2cfcacc1b14682c2ffd89ec335b19d5650e5597))

## [0.9.3](https://github.com/FradSer/frad-me/compare/v0.9.2...v0.9.3) (2024-4-14)

### Features

- **deps:** update deps ([6c80f1b](https://github.com/FradSer/frad-me/commit/6c80f1b7c0be9526a11001117e62b78f3aba3fb5))

## [0.9.2](https://github.com/FradSer/frad-me/compare/v0.9.1...v0.9.2) (2024-4-13)

### Features

- **deps:** update deps ([167f121](https://github.com/FradSer/frad-me/commit/167f121931e12e21bfa1e3e25b9c091291d8e6fe))
- **eslint:** add esLint configuration file ([468a8ae](https://github.com/FradSer/frad-me/commit/468a8ae8cf437d89aab6ad46ca53434558a6f8b5))

### Bug Fixes

- **landing:** dot circle animaiton ([cddac91](https://github.com/FradSer/frad-me/commit/cddac9184249d60934c82758b32c0366085aaa63))
- **landing:** improve dot circle animation ([fb14bed](https://github.com/FradSer/frad-me/commit/fb14bed07b6ef9aa4c3913ef7ca449f85c9cd56c))
- **prettier:** invalid configuration ([92f8c43](https://github.com/FradSer/frad-me/commit/92f8c43ba88c8429157290c3f0d45c9d0a33212e))
- **work:** improve title element ([8109d76](https://github.com/FradSer/frad-me/commit/8109d768f64dceadab83c861ed0034f63237e563))

## [0.9.1](https://github.com/FradSer/frad-me/compare/v0.9.0...v0.9.1) (2024-02-03)

### Features

- **deps:** update deps ([214cd3b](https://github.com/FradSer/frad-me/commit/214cd3b1ebe2b01e3562f9f7bffd440b6749efe7))

## [0.9.0](https://github.com/FradSer/frad-me/compare/v0.8.1...v0.9.0) (2024-01-28)

### Features

- **webxr:** add hero text in xr ([2b480e3](https://github.com/FradSer/frad-me/commit/2b480e35915096245361f85d7c8a43fb7e2c2f6b))

### Bug Fixes

- **webxr:** switch to planeGeometry for mesh ([3e64fa9](https://github.com/FradSer/frad-me/commit/3e64fa9092a5c568d83741b50ed36483b949aea1))

## [0.8.1](https://github.com/FradSer/frad-me/compare/v0.8.0...v0.8.1) (2024-01-05)

### Bug Fixes

- **cmpts:** add missing dependency to effect ([9176e9c](https://github.com/FradSer/frad-me/commit/9176e9c0a088ce4aa4fa1e8d2a7e371afeb1dd9e))
- **cmpts:** dot circle animation ([4f0a0ea](https://github.com/FradSer/frad-me/commit/4f0a0ea81b6e82cb639a05c8554bfa1bd50caa17))

## [0.8.0](https://github.com/FradSer/frad-me/compare/v0.7.0...v0.8.0) (2023-12-24)

### Features

- **deps:** add `million` ([8d2e0f8](https://github.com/FradSer/frad-me/commit/8d2e0f87748a75234db9d9f68effec0977221478))
- **deps:** integrate @vercel/speed-insights ([b3a1d48](https://github.com/FradSer/frad-me/commit/b3a1d486256ca93600050bff1600c8eef53b2afd))

### Bug Fixes

- **cmpts:** fix ts types ([4fbeea7](https://github.com/FradSer/frad-me/commit/4fbeea7efbb9fb83dfaddf66f4537641392a5515))
- **cmpts:** typo ([a5c9dc9](https://github.com/FradSer/frad-me/commit/a5c9dc9fb969acaeeb41adb820a4ea978e76b3eb))

## [0.7.0](https://github.com/FradSer/frad-me/compare/v0.6.2...v0.7.0) (2023-07-25)

### [0.6.2](https://github.com/FradSer/frad-me/compare/v0.6.1...v0.6.2) (2023-05-05)

### Bug Fixes

- **cmpts:** types error ([c614844](https://github.com/FradSer/frad-me/commit/c614844dd2f5b9dce2b2de2bf218faf9a26bfcb4))

### [0.6.1](https://github.com/FradSer/frad-me/compare/v0.6.0...v0.6.1) (2023-05-04)

### Bug Fixes

- **cmpts:** defining component during render ([1edddf7](https://github.com/FradSer/frad-me/commit/1edddf76abe25b83283cf398e8dd3c041fb420cd))
- **cmpts:** defining component during render ([f390254](https://github.com/FradSer/frad-me/commit/f390254547ed233262120eeec88c4689aaf2e69e))
- **cmpts:** remove comment ([f49963d](https://github.com/FradSer/frad-me/commit/f49963d98026c68417d684eb1a7e04c3faf163b3))
- **cmpts:** remove unused variables in hero ([4554a15](https://github.com/FradSer/frad-me/commit/4554a154d480976604f4065abef4a3f068a1cc51))
- **cmpts:** remove unused variables in webxr ([9bdecca](https://github.com/FradSer/frad-me/commit/9bdeccae459dc16665540f929c743bb175e84b0c))
- **mouse:** remove unused import ([f78228f](https://github.com/FradSer/frad-me/commit/f78228f5e6df292cbc4914a9eb66d2b835f740e3))
- **mouse:** wrap `value` in `useMemo` hook ([ca65957](https://github.com/FradSer/frad-me/commit/ca6595716c17d3d7212b121c24275da1c9ac1721))

## [0.6.0](https://github.com/FradSer/frad-me/compare/v0.5.0...v0.6.0) (2023-05-04)

### Features

- **git:** update git ignore ([365e77c](https://github.com/FradSer/frad-me/commit/365e77c801c3cf4387aabc7de549596f62020327))

## [0.5.0](https://github.com/FradSer/frad-me/compare/v0.4.0...v0.5.0) (2023-03-02)

### Features

- **deps:** update deps ([c98aad7](https://github.com/FradSer/frad-me/commit/c98aad792968f4238ff7cebab4b3175ab8c1a358))
- **yarn:** split configs, update prettier config ([d844d0b](https://github.com/FradSer/frad-me/commit/d844d0b55a8489d17621056c61a0dfe54014d2ca))
- **yarn:** update release-it config ([db31b40](https://github.com/FradSer/frad-me/commit/db31b40f7e501096007bcac04231d15431c471c7))
- **yarn:** update release-it config ([f1d0475](https://github.com/FradSer/frad-me/commit/f1d04753989aae482fb5cf8e40210a39239c5f83))

## [0.4.0](https://github.com/FradSer/frad-me/compare/v0.3.1...v0.4.0) (2023-01-10)

### Features

- **cmpts:** update general canvas ([bdc8f37](https://github.com/FradSer/frad-me/commit/bdc8f379014bfd9465b88923011be44d0535e21c))
- **deps:** add release-it ([93230ce](https://github.com/FradSer/frad-me/commit/93230ce1abc72233e75e6d7095336cae50cc0c52))
- **webxr:** update leva controls ([adc5fdd](https://github.com/FradSer/frad-me/commit/adc5fddb18ce38a1fbece9a15f58e26a6f257c4d))
