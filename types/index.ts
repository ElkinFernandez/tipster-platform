// Tipster
export interface Tipster {
  id: string
  username: string
  email: string
  name: string
  bio: string
  telegram_url: string
  instagram_url: string
  created_at: string
}

// Bet Types
export type BetType = 'SINGLE' | 'DOUBLE' | 'TRIPLE' | '4X' | '5X' | '6X' | '7X' | '8X' | '9X' | '10X'
export type BetTiming = 'LIVE' | 'PRE_MATCH'
export type AnalysisType = 'SOFTWARE' | 'MANUAL'
export type BetStatus = 'WIN' | 'LOSS' | 'PARTIAL_WIN' | 'VOID' | 'PENDING'

export interface Bet {
  id: string
  tipster_id: string
  type: BetType
  timing: BetTiming
  analysis_type: AnalysisType
  total_legs: number
  odds_combined: number
  stake: number
  profit: number
  status: BetStatus
  published_at: string
  result_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// Bet Leg Types
export type Sport = 'FOOTBALL' | 'TENNIS' | 'BASKETBALL'
export type BetLegStatus = 'WIN' | 'LOSS' | 'VOID'

export interface BetLeg {
  id: string
  bet_id: string
  sport: Sport
  league: string
  competitor_1: string
  competitor_2: string
  market: string
  selection: string
  odds: number
  status: BetLegStatus
  evidence_url: string | null
  created_at: string
}

// User / Admin
export interface User {
  id: string
  email: string
  tipster_id: string
  role: 'admin' | 'viewer'
  created_at: string
}

// Statistics
export interface BetStats {
  total_bets: number
  win_rate: number
  roi: number
  total_profit: number
  average_odds: number
}

export interface BetTypeStats {
  type: BetType
  count: number
  win_rate: number
  profit: number
}