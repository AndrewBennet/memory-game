import { useState, useEffect } from 'react'
import './App.css'

interface Card {
  id: number
  value: number
  isFlipped: boolean
  isMatched: boolean
  type?: 'text' | 'image'
  content?: string
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

// Import AI images
import astronautBakingCake from './assets/ai_images/astronaut-baking-cake.png'
import bookAsBoat from './assets/ai_images/book-as-boat.png'
import catRidingSkateboard from './assets/ai_images/cat-riding-skateboard.png'
import coffeeCupSpaceship from './assets/ai_images/coffee-cup-spaceship.png'
import desertIceCreamTruck from './assets/ai_images/desert-ice-cream-truck.png'
import dragonDrinkingTea from './assets/ai_images/dragon-drinking-tea.png'
import floatingIslandCity from './assets/ai_images/floating-island-city.png'
import pizzaSliceUmbrella from './assets/ai_images/pizza-slice-umbrella.png'
import robotReadingBook from './assets/ai_images/robot-reading-book.png'
import treehouseInSpace from './assets/ai_images/treehouse-in-space.png'
import underwaterBicycle from './assets/ai_images/underwater-bicycle.png'

// AI image prompts for the game
const AI_PROMPTS = [
  { prompt: "Astronaut baking a cake", image: astronautBakingCake },
  { prompt: "Book as a boat", image: bookAsBoat },
  { prompt: "Cat riding a skateboard", image: catRidingSkateboard },
  { prompt: "Coffee cup spaceship", image: coffeeCupSpaceship },
  { prompt: "Desert ice cream truck", image: desertIceCreamTruck },
  { prompt: "Dragon drinking tea", image: dragonDrinkingTea },
  { prompt: "Floating island city", image: floatingIslandCity },
  { prompt: "Pizza slice umbrella", image: pizzaSliceUmbrella },
  { prompt: "Robot reading a book", image: robotReadingBook },
  { prompt: "Treehouse in space", image: treehouseInSpace },
  { prompt: "Underwater bicycle", image: underwaterBicycle },
]

// Create initial cards with prompt-image pairs
const createCards = (numCards: number = 16): Card[] => {
  const numPairs = Math.floor(numCards / 2)
  const hasOddCard = numCards % 2 === 1
  
  // Randomly select prompts from available prompts
  const shuffledPrompts = shuffleArray([...AI_PROMPTS])
  const selectedPrompts = shuffledPrompts.slice(0, numPairs)
  
  // Create prompt-image pairs
  const cards = selectedPrompts.flatMap((item, index) => [
    { 
      id: index * 2, 
      value: index + 1, 
      isFlipped: false, 
      isMatched: false,
      type: 'text' as const,
      content: item.prompt
    },
    { 
      id: index * 2 + 1, 
      value: index + 1, 
      isFlipped: false, 
      isMatched: false,
      type: 'image' as const,
      content: item.image
    }
  ])
  
  // Add one odd card if needed (shouldn't happen with our even grids)
  if (hasOddCard) {
    cards.push({ 
      id: cards.length, 
      value: cards.length + 1, 
      isFlipped: false, 
      isMatched: false,
      type: 'text' as const,
      content: '?'
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
      className={`card ${card.isFlipped ? 'flipped' : ''} ${card.isMatched ? 'matched' : ''} ${card.type ? `card-${card.type}` : ''}`}
      onClick={handleClick}
      style={{ cursor: disabled || card.isMatched ? 'default' : 'pointer' }}
    >
      <div className="card-inner">
        <div className="card-front">
          {card.type === 'text' && <div className="card-type-indicator">Prompt</div>}
          {card.type === 'image' && <div className="card-type-indicator">Image</div>}
        </div>
        <div className="card-back">
          {card.type === 'text' ? (
            <div className="card-prompt">{card.content}</div>
          ) : card.type === 'image' ? (
            <div className="card-image">
              <img src={card.content} alt="AI generated" />
            </div>
          ) : (
            card.value
          )}
        </div>
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
    // Don't create cards here - let the useEffect handle it
    setFlippedCards([])
    setGoes(0)
    setMatchedPairs(0)
    setIsChecking(false)
  }

  const totalPairs = numCards / 2
  const isGameComplete = matchedPairs === totalPairs

  return (
    <div className="app">
      <img src="/icon.svg" alt="Logo" className="app-logo" />
      <h1>PromptMatch</h1>
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
      <footer>
        By Andrew Bennet
      </footer>
    </div>
  )
}

export default App
