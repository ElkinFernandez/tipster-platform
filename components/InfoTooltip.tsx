'use client'

import { useState, useRef, useEffect } from 'react'

interface InfoTooltipProps {
  text: string
}

export function InfoTooltip(props: InfoTooltipProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(function () {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return function () {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <span ref={wrapperRef} className="relative inline-block ml-1 align-middle">
      <button
        onClick={function (e) { e.stopPropagation(); setOpen(!open) }}
        onMouseEnter={function () { setOpen(true) }}
        onMouseLeave={function () { setOpen(false) }}
        className="w-3.5 h-3.5 rounded-full bg-[#9CA3AF]/30 text-[#4B5563] text-[9px] font-bold flex items-center justify-center leading-none"
        type="button"
        aria-label="Mas informacion"
      >
        i
      </button>
      {open && (
        <span className="absolute z-30 bottom-full left-1/2 -translate-x-1/2 mb-2 w-44 rounded-xl bg-[#1F2937] text-white text-[11px] leading-snug px-3 py-2 shadow-lg">
          {props.text}
        </span>
      )}
    </span>
  )
}