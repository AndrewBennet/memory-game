export interface Card {
  id: number
  value: number
  isFlipped: boolean
  isMatched: boolean
  type?: 'text' | 'image'
  content?: string
}

export interface GridOption {
  rows: number
  cols: number
  label: string
}
