import Lenis from 'lenis'
import { useEffect } from 'react'

export const useLenisScroll = (): void => {
  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined
    }
    const lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      smoothTouch: false
    })

    let frame = 0
    const raf = (time: number) => {
      frame = requestAnimationFrame(raf)
      lenis.raf(time)
    }

    frame = requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])
}
