import { useState, useCallback, useEffect } from 'react'

export function useInView() {
  const [inView, setInView] = useState(false)
  const [node, setNode] = useState<HTMLDivElement | null>(null)

  const ref = useCallback(function (el: HTMLDivElement | null) {
    setNode(el)
  }, [])

  useEffect(function () {
    if (!node || inView) return
    const observer = new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) setInView(true)
      },
      { threshold: 0.2 }
    )
    observer.observe(node)
    return function () { observer.disconnect() }
  }, [node, inView])

  return { ref, inView }
}