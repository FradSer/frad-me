import { SpringScalar } from '@/hooks/useSpringAnimation'

describe('SpringScalar Physics System', () => {
  const DEFAULT_CONFIG = { tension: 170, friction: 26 }
  
  describe('Basic Functionality', () => {
    it('should initialize with correct values', () => {
      const spring = new SpringScalar(10, DEFAULT_CONFIG)
      expect(spring.value).toBe(10)
    })

    it('should set target value correctly', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(5)
      
      // After update, should move toward target
      const initialValue = spring.value
      spring.update()
      expect(spring.value).not.toBe(initialValue)
    })
  })

  describe('Spring Physics Accuracy', () => {
    it('should converge to target value over time', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(10)
      
      // Run multiple updates
      for (let i = 0; i < 1000; i++) {
        spring.update(1/60) // 60fps
      }
      
      // Should be very close to target (within convergence threshold)
      expect(Math.abs(spring.value - 10)).toBeLessThan(0.001)
    })

    it('should handle negative target values', () => {
      const spring = new SpringScalar(5, DEFAULT_CONFIG)
      spring.set(-5)
      
      for (let i = 0; i < 1000; i++) {
        spring.update(1/60)
      }
      
      expect(Math.abs(spring.value - (-5))).toBeLessThan(0.001)
    })

    it('should handle zero target from positive value', () => {
      const spring = new SpringScalar(10, DEFAULT_CONFIG)
      spring.set(0)
      
      for (let i = 0; i < 1000; i++) {
        spring.update(1/60)
      }
      
      expect(Math.abs(spring.value)).toBeLessThan(0.001)
    })
  })

  describe('Delta Time Clamping', () => {
    it('should clamp large delta times to prevent instability', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(10)
      
      // Update with extremely large delta time
      const valueAfterLargeDelta = spring.update(1) // 1 second
      
      // Should still be stable and not infinite
      expect(isFinite(valueAfterLargeDelta)).toBe(true)
      expect(Math.abs(valueAfterLargeDelta)).toBeLessThan(100) // Reasonable bounds
    })

    it('should handle zero delta time gracefully', () => {
      const spring = new SpringScalar(5, DEFAULT_CONFIG)
      spring.set(10)
      
      const initialValue = spring.value
      spring.update(0)
      
      // Should not change with zero delta
      expect(spring.value).toBe(initialValue)
    })

    it('should handle negative delta time', () => {
      const spring = new SpringScalar(5, DEFAULT_CONFIG)
      spring.set(10)
      
      const initialValue = spring.value
      expect(() => spring.update(-0.1)).not.toThrow()
      // Should treat as absolute value or clamp to zero
      expect(isFinite(spring.value)).toBe(true)
    })
  })

  describe('Animation Convergence and Damping', () => {
    it('should stop animating when close to target', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(1)
      
      // Animate until convergence
      let iterations = 0
      let lastValue = spring.value
      
      while (iterations < 1000) {
        spring.update(1/60)
        
        // Check if animation has effectively stopped
        if (Math.abs(spring.value - lastValue) < 0.0001) {
          break
        }
        
        lastValue = spring.value
        iterations++
      }
      
      expect(iterations).toBeLessThan(1000) // Should converge before timeout
      expect(Math.abs(spring.value - 1)).toBeLessThan(0.001)
    })

    it('should have different behavior with different configs', () => {
      const stiffSpring = new SpringScalar(0, { tension: 300, friction: 30 })
      const softSpring = new SpringScalar(0, { tension: 120, friction: 14 })
      
      stiffSpring.set(10)
      softSpring.set(10)
      
      // After same number of updates, stiff spring should be closer to target
      for (let i = 0; i < 30; i++) {
        stiffSpring.update(1/60)
        softSpring.update(1/60)
      }
      
      expect(Math.abs(stiffSpring.value - 10)).toBeLessThan(Math.abs(softSpring.value - 10))
    })

    it('should demonstrate proper damping behavior', () => {
      const underDamped = new SpringScalar(0, { tension: 200, friction: 10 })
      const overDamped = new SpringScalar(0, { tension: 200, friction: 50 })
      
      underDamped.set(10)
      overDamped.set(10)
      
      const underDampedValues: number[] = []
      const overDampedValues: number[] = []
      
      for (let i = 0; i < 100; i++) {
        underDampedValues.push(underDamped.update(1/60))
        overDampedValues.push(overDamped.update(1/60))
      }
      
      // Under-damped should overshoot target
      expect(Math.max(...underDampedValues)).toBeGreaterThan(10)
      
      // Over-damped should approach target monotonically
      expect(Math.max(...overDampedValues)).toBeLessThanOrEqual(10.1) // Small tolerance
    })
  })

  describe('Performance Under Various Frame Rates', () => {
    it('should maintain stability at 30fps', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(10)
      
      for (let i = 0; i < 300; i++) { // 10 seconds at 30fps
        spring.update(1/30)
        expect(isFinite(spring.value)).toBe(true)
      }
      
      expect(Math.abs(spring.value - 10)).toBeLessThan(0.001)
    })

    it('should maintain stability at 60fps', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(10)
      
      for (let i = 0; i < 600; i++) { // 10 seconds at 60fps
        spring.update(1/60)
        expect(isFinite(spring.value)).toBe(true)
      }
      
      expect(Math.abs(spring.value - 10)).toBeLessThan(0.001)
    })

    it('should handle irregular frame rates', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(10)
      
      const irregularDeltas = [1/60, 1/30, 1/120, 1/24, 1/90]
      
      for (let i = 0; i < 500; i++) {
        const delta = irregularDeltas[i % irregularDeltas.length]
        spring.update(delta)
        expect(isFinite(spring.value)).toBe(true)
        expect(Math.abs(spring.value)).toBeLessThan(50) // Reasonable bounds
      }
    })

    it('should perform efficiently with many updates', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(10)
      
      const startTime = performance.now()
      
      for (let i = 0; i < 10000; i++) {
        spring.update(1/60)
      }
      
      const endTime = performance.now()
      const duration = endTime - startTime
      
      // Should complete 10k updates in reasonable time (< 100ms)
      expect(duration).toBeLessThan(100)
    })
  })

  describe('Edge Cases', () => {
    it('should handle extreme spring configurations', () => {
      // Very stiff spring
      const stiffSpring = new SpringScalar(0, { tension: 1000, friction: 100 })
      stiffSpring.set(5)
      
      expect(() => {
        for (let i = 0; i < 100; i++) {
          stiffSpring.update(1/60)
        }
      }).not.toThrow()
      
      expect(isFinite(stiffSpring.value)).toBe(true)
    })

    it('should handle very small spring values', () => {
      const spring = new SpringScalar(0, { tension: 1, friction: 1 })
      spring.set(0.0001)
      
      for (let i = 0; i < 1000; i++) {
        spring.update(1/60)
      }
      
      expect(Math.abs(spring.value - 0.0001)).toBeLessThan(0.001)
    })

    it('should handle very large spring values', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(10000)
      
      for (let i = 0; i < 1000; i++) {
        spring.update(1/60)
      }
      
      expect(Math.abs(spring.value - 10000)).toBeLessThan(0.001)
    })

    it('should handle target changes during animation', () => {
      const spring = new SpringScalar(0, DEFAULT_CONFIG)
      spring.set(10)
      
      // Animate partially
      for (let i = 0; i < 30; i++) {
        spring.update(1/60)
      }
      
      const midValue = spring.value
      expect(midValue).toBeGreaterThan(0)
      expect(midValue).toBeLessThan(10)
      
      // Change target mid-animation
      spring.set(20)
      
      // Should smoothly transition to new target
      for (let i = 0; i < 1000; i++) {
        spring.update(1/60)
      }
      
      expect(Math.abs(spring.value - 20)).toBeLessThan(0.001)
    })
  })
})