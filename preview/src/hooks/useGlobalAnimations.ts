import { useEffect } from 'react'

const animationSheet = `
@keyframes glowPulse {
  0% { box-shadow: 0 0 40px rgba(99,102,241,0.35); }
  50% { box-shadow: 0 0 90px rgba(14,165,233,0.55); }
  100% { box-shadow: 0 0 40px rgba(99,102,241,0.35); }
}

@keyframes floatY {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-12px); }
  100% { transform: translateY(0px); }
}

@keyframes shimmerSweep {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

@keyframes dashFlow {
  0% { stroke-dashoffset: 180; }
  100% { stroke-dashoffset: 0; }
}
`

export const useGlobalAnimations = (): void => {
  useEffect(() => {
    const existing = document.querySelector<HTMLStyleElement>('style[data-preview-animations]')
    if (existing) {
      return
    }
    const styleEl = document.createElement('style')
    styleEl.dataset.previewAnimations = 'true'
    styleEl.innerHTML = animationSheet
    document.head.appendChild(styleEl)
    return () => {
      document.head.removeChild(styleEl)
    }
  }, [])
}
