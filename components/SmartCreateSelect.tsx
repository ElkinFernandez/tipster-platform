'use client'

import { useState, useEffect, useRef } from 'react'
import { CatalogItem } from '@/hooks/useMarketsCatalog'

const inputClass = 'w-full rounded-xl border border-black/20 bg-white p-3 text-sm text-[#1F2937] placeholder-[#6B7280]'
const labelClass = 'text-xs font-bold uppercase tracking-wider text-[#4B5563] mb-1.5 block'

interface SmartCreateSelectProps {
  label: string
  selectedId: string
  selectedName: string
  onPick: (id: string, name: string) => void
  onCreate: (name: string) => Promise<CatalogItem | null>
  items: CatalogItem[]
  loading: boolean
  placeholder: string
  disabled?: boolean
}

export function SmartCreateSelect(props: SmartCreateSelectProps) {
  const { label, selectedId, selectedName, onPick, onCreate, items, loading, placeholder, disabled } = props
  const [inputText, setInputText] = useState(selectedName)
  const [showDropdown, setShowDropdown] = useState(false)
  const [creating, setCreating] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(function () {
    setInputText(selectedName)
  }, [selectedName])

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
    ? items.filter(function (i) { return i.name.toLowerCase().indexOf(searchTerm) !== -1 })
    : items.slice(0, 8)

  const exactMatch = items.some(function (i) { return i.name.toLowerCase() === searchTerm })

  function handleInputChange(text: string) {
    setInputText(text)
    setShowDropdown(true)
  }

  function handlePick(item: CatalogItem) {
    setInputText(item.name)
    onPick(item.id, item.name)
    setShowDropdown(false)
  }

  async function handleCreateNew() {
    if (!inputText.trim()) return
    setCreating(true)
    const created = await onCreate(inputText.trim())
    setCreating(false)
    if (created) {
      setInputText(created.name)
      onPick(created.id, created.name)
      setShowDropdown(false)
    }
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
        disabled={disabled}
      />

      {showDropdown && !loading && !disabled && (
        <div className="absolute z-20 mt-1 w-full rounded-xl border border-black/15 bg-white shadow-lg max-h-52 overflow-y-auto">
          {filtered.map(function (item) {
            return (
              <button
                key={item.id}
                onClick={function () { handlePick(item) }}
                className="block w-full text-left px-3 py-2.5 text-sm text-[#1F2937] hover:bg-[#F3F1EA] transition"
              >
                {item.name}
              </button>
            )
          })}

          {searchTerm.length >= 2 && !exactMatch && (
            <button
              onClick={handleCreateNew}
              disabled={creating}
              className="block w-full text-left px-3 py-2.5 text-sm font-semibold text-[#FFA94D] hover:bg-[#F3F1EA] transition border-t border-black/10"
            >
              {creating ? 'Creando...' : '+ Crear "' + inputText.trim() + '"'}
            </button>
          )}

          {filtered.length === 0 && searchTerm.length < 2 && (
            <div className="px-3 py-2.5 text-xs text-[#4B5563]">Escribe al menos 2 letras para buscar o crear.</div>
          )}
        </div>
      )}
    </div>
  )
}