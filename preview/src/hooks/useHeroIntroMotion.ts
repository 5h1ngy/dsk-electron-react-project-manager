import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'

export const useHeroIntroMotion = (...refs: Array<RefObject<HTMLElement | null>>): void => {
  useLayoutEffect(() => {
    const elements = refs
      .map((ref) => ref.current)
      .filter((node): node is HTMLElement => Boolean(node))

    if (!elements.length) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12
        }
      )
    })

    return () => ctx.revert()
  }, [refs])
}
