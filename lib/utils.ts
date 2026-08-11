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

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getStatusColor(status: BetStatus): string {
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

export function getStatusLabel(status: BetStatus): string {
  const labels: Record<BetStatus, string> = {
    WIN: 'Ganada',
    LOSS: 'Perdida',
    PARTIAL_WIN: 'Ganancia Parcial',
    VOID: 'Anulada',
    PENDING: 'Pendiente',
  }
  return labels[status]
}

export function formatBetType(type: string): string {
  const typeLabels: Record<string, string> = {
    SINGLE: 'Simple',
    DOUBLE: 'Doble',
    TRIPLE: 'Triple',
    '4X': '4 Vías',
    '5X': '5 Vías',
  }
  return typeLabels[type] || type
}

export function cn(...classes: (string | false | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ')
}