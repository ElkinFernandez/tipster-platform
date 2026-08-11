import { BetStatus } from '@/types'

export function formatProfit(value: number): string {
  return `${value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}u`
}

export function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatOdds(value: number): string {
  return value.toFixed(2)
}

const monthShort = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export function formatDateFull(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = monthShort[date.getMonth()]
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return day + ' ' + month + ' ' + year + ' ' + hours + ':' + minutes
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const day = date.getDate()
  const month = monthShort[date.getMonth()]
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return day + ' ' + month + ' ' + hours + ':' + minutes
}

export function formatDateShort(dateString: string): string {
  const date = new Date(dateString)
  return date.getDate() + ' ' + monthShort[date.getMonth()]
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'WIN':
    case 'PARTIAL_WIN':
      return '#10B981'
    case 'LOSS':
      return '#FF7A8C'
    case 'VOID':
      return '#9CA3AF'
    case 'PENDING':
      return '#3FA9B7'
    default:
      return '#1F2937'
  }
}

export function getStatusAdj(status: string): string {
  const labels: Record<string, string> = {
    WIN: 'Ganada',
    LOSS: 'Perdida',
    PARTIAL_WIN: 'Ganada Parcial',
    VOID: 'Anulada',
    PENDING: 'Pendiente',
  }
  return labels[status] || status
}

export function getStatusVerb(status: string): string {
  const labels: Record<string, string> = {
    WIN: 'Gano',
    LOSS: 'Perdio',
    PARTIAL_WIN: 'Gano Parcial',
    VOID: 'Anulado',
    PENDING: 'Pendiente',
  }
  return labels[status] || status
}

export function getTimingLabel(timing: string): string {
  return timing === 'LIVE' ? 'En Vivo' : 'Pre-Partido'
}

export function getAnalysisLabel(analysis: string): string {
  return analysis === 'SOFTWARE' ? 'Software' : 'Manual'
}

export const betTypeLabel: Record<string, string> = {
  SINGLE: 'Sencilla',
  DOUBLE: 'Doble',
  TRIPLE: 'Triple',
  '4X': 'Cuadruple',
  '5X': 'Quintuple',
  '6X': 'Sextuple',
  '7X': 'Septuple',
  '8X': 'Octuple',
  '9X': 'Nonuple',
  '10X': 'Decuple',
}

export function formatBetType(type: string): string {
  return betTypeLabel[type] || type
}

export function formatSport(sport: string): string {
  const sportLabels: Record<string, string> = {
    FOOTBALL: 'Futbol',
    TENNIS: 'Tenis',
    BASKETBALL: 'Basquet',
  }
  return sportLabels[sport] || sport
}

export function isBetWon(status: BetStatus): boolean {
  return status === 'WIN' || status === 'PARTIAL_WIN'
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function toTitleCase(text: string): string {
  if (!text) return text
  return text
    .trim()
    .toLowerCase()
    .split(' ')
    .map(function (word) {
      if (word.length === 0) return word
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}