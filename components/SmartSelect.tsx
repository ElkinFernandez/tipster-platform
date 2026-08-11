'use client'

import { useState, useEffect, useRef } from 'react'
import { KnownEntity } from '@/hooks/useKnownEntities'

const inputClass = 'w-full rounded-xl border border-black/20 bg-white p-3 text-sm text-[#1F2937] placeholder-[#6B7280]'
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1.5 block'

interface SmartSelectProps {
  label: string
  value: string
  onChange: (value: string) => void
  entities: KnownEntity[]
  loading: boolean
  placeholder: string
  newLabel: string
}

export function SmartSelect(props: SmartSelectProps) {
  const { label, value, onChange, entities, loading, placeholder } = props
  const [inputText, setInputText] = useState(value)
  const [showDropdown, setShowDropdown] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(function () {
    setInputText(value)
  }, [value])

  useEffect(function () {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return function () {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const searchTerm = inputText.trim().toLowerCase()
  const filtered = searchTerm.length >= 2
    ? entities.filter(function (e) { return e.name.toLowerCase().indexOf(searchTerm) !== -1 })
    : entities.slice(0, 8)

  function handleInputChange(text: string) {
    setInputText(text)
    onChange(text)
    setShowDropdown(true)
  }

  function handlePick(name: string) {
    setInputText(name)
    onChange(name)
    setShowDropdown(false)
  }

  return (
    <div ref={wrapperRef} className="relative">
      <label className={labelClass}>{label}</label>
      <input
        value={inputText}
        onChange={function (e) { handleInputChange(e.target.value) }}
        onFocus={function () { setShowDropdown(true) }}
        placeholder={placeholder}
        className={inputClass}
        autoComplete="off"
      />

      {showDropdown && !loading && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-black/15 bg-white shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 && (
            <div className="px-3 py-2.5 text-xs text-[#4B5563]">
              {searchTerm.length > 0 ? 'Sin coincidencias. Se guardara como nuevo.' : 'Escribe para buscar o crear uno nuevo.'}
            </div>
          )}
          {filtered.map(function (e) {
            return (
              <button
                key={e.id}
                onClick={function () { handlePick(e.name) }}
                className="block w-full text-left px-3 py-2.5 text-sm text-[#1F2937] hover:bg-[#F3F1EA] transition"
              >
                {e.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}