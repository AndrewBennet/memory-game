import { useState, useEffect } from 'react'
import './App.css'

interface Card {
  id: number
  value: number
  isFlipped: boolean
  isMatched: boolean
}

// Shuffle array using Fisher-Yates algorithm
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Create initial cards with pairs of numbers
const createCards = (numCards: number = 16): Card[] => {
  const numPairs = Math.floor(numCards / 2)
  const hasOddCard = numCards % 2 === 1
  const numbers = Array.from({ length: numPairs }, (_, i) => i + 1)
  
  // Create pairs of each number
  const cards = numbers.flatMap((num, index) => [
    { id: index * 2, value: num, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, value: num, isFlipped: false, isMatched: false }
  ])
  
  // Add one odd card if needed
  if (hasOddCard) {
    cards.push({ 
      id: cards.length, 
      value: numbers.length + 1, 
      isFlipped: false, 
      isMatched: false 
    })
  }
  
  return shuffleArray(cards)
}

interface CardProps {
  card: Card
  onFlip: (id: number) => void
  disabled: boolean
}

function CardComponent({ card, onFlip, disabled }: CardProps) {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onFlip(card.id)
    }
  }

  return (
    <div 
      className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''}`}
      onClick={handleClick}
      style={{ cursor: disabled || card.isMatched ? 'default' : 'pointer' }}
    >
      <div className="card-inner">
        <div className="card-front"></div>
        <div className="card-back">{card.value}</div>
      </div>
    </div>
  )
}

interface GridOption {
  rows: number
  cols: number
  label: string
}

const GRID_OPTIONS: GridOption[] = [
  { rows: 2, cols: 3, label: '2×3 (Easy)' },
  { rows: 3, cols: 4, label: '3×4 (Medium)' },
  { rows: 4, cols: 4, label: '4×4 (Hard)' }
]

function App() {
  const [gridOption, setGridOption] = useState<GridOption>(GRID_OPTIONS[1])
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [goes, setGoes] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)

  const numCards = gridOption.rows * gridOption.cols

  useEffect(() => {
    // Create cards first, then trigger shuffle animation
    setCards(createCards(numCards))
    setIsShuffling(true)
    setTimeout(() => {
      setIsShuffling(false)
    }, 600)
  }, [numCards])

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true)
      setGoes(prev => prev + 1) // Increment goes when two cards are flipped
      const [firstId, secondId] = flippedCards
      const firstCard = cards.find(card => card.id === firstId)
      const secondCard = cards.find(card => card.id === secondId)

      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found!
        setTimeout(() => {
          setCards(cards.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isMatched: true }
              : card
          ))
          setMatchedPairs(prev => prev + 1)
          setFlippedCards([])
          setIsChecking(false)
        }, 600)
      } else {
        // No match - flip back after delay
        setTimeout(() => {
          setCards(cards.map(card =>
            card.id === firstId || card.id === secondId
              ? { ...card, isFlipped: false }
              : card
          ))
          setFlippedCards([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }, [flippedCards, cards])

  const handleFlip = (id: number) => {
    if (flippedCards.length < 2 && !flippedCards.includes(id)) {
      setCards(cards.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      ))
      setFlippedCards([...flippedCards, id])
    }
  }

  const handleReset = () => {
    setIsShuffling(true)
    
    // Wait for shuffle animation to complete before resetting
    setTimeout(() => {
      setCards(createCards(numCards))
      setFlippedCards([])
      setGoes(0)
      setMatchedPairs(0)
      setIsChecking(false)
      setIsShuffling(false)
    }, 600)
  }

  const handleGridSizeChange = (option: GridOption) => {
    setGridOption(option)
    setCards(createCards(option.rows * option.cols))
    setFlippedCards([])
    setGoes(0)
    setMatchedPairs(0)
    setIsChecking(false)
  }

  const totalPairs = numCards / 2
  const isGameComplete = matchedPairs === totalPairs

  return (
    <div className="app">
      <h1>Memory Card Game</h1>
      <div className="grid-size-selector">
        {GRID_OPTIONS.map(option => (
          <button
            key={option.label}
            className={`size-button ${gridOption === option ? 'active' : ''}`}
            onClick={() => handleGridSizeChange(option)}
          >
            {option.label}
          </button>
        ))}
      </div>
      <div className="game-info">
        <p>Goes: {goes}</p>
        {isGameComplete && (
          <p className="win-message">
            🎉 You won in {goes} {goes === 1 ? 'go' : 'goes'}! 🎉
          </p>
        )}
      </div>
      <button className="reset-button" onClick={handleReset} disabled={isShuffling}>
        {isShuffling ? 'Shuffling...' : 'Reset Game'}
      </button>
      <div className={`card-grid ${isShuffling ? 'shuffling' : ''}`} style={{ gridTemplateColumns: `repeat(${gridOption.cols}, 1fr)` }}>
        {cards.map(card => (
          <CardComponent 
            key={card.id} 
            card={card} 
            onFlip={handleFlip}
            disabled={isChecking || flippedCards.length >= 2}
          />
        ))}
      </div>
    </div>
  )
}

export default App
