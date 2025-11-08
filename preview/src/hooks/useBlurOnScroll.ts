import { useLayoutEffect, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

export const useBlurOnScroll = (ref: RefObject<HTMLElement | null>) => {
  useLayoutEffect(() => {
    const node = ref.current
    if (!node) {
      return
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        node,
        { opacity: 0, y: 32, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: node,
            start: 'top 85%'
          }
        }
      )
    }, node)

    return () => ctx.revert()
  }, [ref])
}
