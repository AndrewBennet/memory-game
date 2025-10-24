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
  const numPairs = numCards / 2
  const numbers = Array.from({ length: numPairs }, (_, i) => i + 1)
  
  // Create pairs of each number
  const cards = numbers.flatMap((num, index) => [
    { id: index * 2, value: num, isFlipped: false, isMatched: false },
    { id: index * 2 + 1, value: num, isFlipped: false, isMatched: false }
  ])
  
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

function App() {
  const [numCards] = useState(16)
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [score, setScore] = useState(0)
  const [isChecking, setIsChecking] = useState(false)

  useEffect(() => {
    setCards(createCards(numCards))
  }, [numCards])

  useEffect(() => {
    if (flippedCards.length === 2) {
      setIsChecking(true)
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
          setScore(score + 1)
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
  }, [flippedCards, cards, score])

  const handleFlip = (id: number) => {
    if (flippedCards.length < 2 && !flippedCards.includes(id)) {
      setCards(cards.map(card =>
        card.id === id ? { ...card, isFlipped: true } : card
      ))
      setFlippedCards([...flippedCards, id])
    }
  }

  const handleReset = () => {
    setCards(createCards(numCards))
    setFlippedCards([])
    setScore(0)
    setIsChecking(false)
  }

  const totalPairs = numCards / 2
  const isGameComplete = score === totalPairs

  return (
    <div className="app">
      <h1>Memory Card Game</h1>
      <div className="game-info">
        <p>Score: {score} / {totalPairs}</p>
        {isGameComplete && <p className="win-message">🎉 You won! 🎉</p>}
      </div>
      <button className="reset-button" onClick={handleReset}>
        Reset Game
      </button>
      <div className="card-grid">
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
