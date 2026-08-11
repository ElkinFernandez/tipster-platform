'use client'

import { useEffect, useRef, useState } from 'react'

interface TelegramEmbedProps {
  url: string
}

function extractPostPath(url: string): string | null {
  try {
    const clean = url.replace('https://t.me/', '').replace('http://t.me/', '').replace('https://telegram.me/', '')
    const parts = clean.split('/').filter(function (p) { return p.length > 0 })
    if (parts.length >= 2) {
      return parts[0] + '/' + parts[1]
    }
    return null
  } catch (err) {
    return null
  }
}

export function TelegramEmbed(props: TelegramEmbedProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [failed, setFailed] = useState(false)

  const postPath = extractPostPath(props.url)

  useEffect(function () {
    if (!postPath || !containerRef.current) {
      setFailed(true)
      return
    }

    containerRef.current.innerHTML = ''
    setLoaded(false)
    setFailed(false)

    const script = document.createElement('script')
    script.src = 'https://telegram.org/js/telegram-widget.js?22'
    script.async = true
    script.setAttribute('data-telegram-post', postPath)
    script.setAttribute('data-width', '100%')
    script.setAttribute('data-userpic', 'false')

    script.onload = function () {
      setLoaded(true)
    }
    script.onerror = function () {
      setFailed(true)
    }

    containerRef.current.appendChild(script)

    const timeout = setTimeout(function () {
      setLoaded(true)
    }, 2500)

    return function () {
      clearTimeout(timeout)
    }
  }, [postPath])

  if (!postPath || failed) {
    return (
      <a href={props.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-1.5 rounded-full border border-[#3FA9B7]/40 bg-[#3FA9B7]/10 px-3 py-2.5 text-xs font-bold text-[#3FA9B7] hover:bg-[#3FA9B7]/20 transition">
        Ver Evidencia en Telegram
      </a>
    )
  }

  return (
    <div className="rounded-3xl border border-black/15 bg-white overflow-hidden">
      <div className="px-4 py-3 border-b border-black/10 flex items-center justify-between">
        <p className="text-xs font-bold uppercase tracking-wider text-[#FFA94D]">Evidencia de Apuesta</p>
        <a href={props.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-semibold text-[#4B5563]">Abrir en Telegram</a>
      </div>
      <div className="p-3">
        {!loaded && <p className="text-xs text-[#4B5563] px-2 py-6 text-center">Cargando evidencia...</p>}
        <div ref={containerRef}></div>
      </div>
    </div>
  )
}