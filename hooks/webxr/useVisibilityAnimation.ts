import { useSpring } from '@react-spring/three'
import { springConfigs, SpringConfigKey } from '@/utils/webxr/springConfigs'

interface UseVisibilityAnimationProps {
  visible: boolean
  springConfig?: SpringConfigKey
  delay?: number
}

export function useVisibilityAnimation({ 
  visible, 
  springConfig = 'gentle',
  delay = 0 
}: UseVisibilityAnimationProps) {
  return useSpring({
    scale: visible ? 1 : 0,
    opacity: visible ? 1 : 0,
    position: visible ? [0, 0, 0] : [0, -3, 0],
    config: springConfigs[springConfig],
    delay,
  })
}

export default useVisibilityAnimation