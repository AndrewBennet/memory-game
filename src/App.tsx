import { useState, useEffect } from 'react'
import './App.css'
import MultiplayerLobby from './MultiplayerLobby'
import WaitingRoom from './WaitingRoom'
import type { GameState } from './multiplayer'
import type { Card } from './types'

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
  // Game mode state
  const [gameMode, setGameMode] = useState<'menu' | 'single' | 'multiplayer'>('menu')
  const [multiplayerState, setMultiplayerState] = useState<'lobby' | 'waiting' | 'playing' | null>(null)
  
  // Multiplayer game state
  const [gameId, setGameId] = useState<string | null>(null)
  const [playerName, setPlayerName] = useState<string>('')
  const [isHost, setIsHost] = useState(false)
  const [gameState, setGameState] = useState<GameState | null>(null)
  
  // Single player state
  const [gridOption, setGridOption] = useState<GridOption>(GRID_OPTIONS[1])
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [goes, setGoes] = useState(0)
  const [matchedPairs, setMatchedPairs] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [isShuffling, setIsShuffling] = useState(false)

  const numCards = gridOption.rows * gridOption.cols

  useEffect(() => {
    // Only create cards in single player mode
    if (gameMode === 'single') {
      setCards(createCards(numCards))
      setIsShuffling(true)
      setTimeout(() => {
        setIsShuffling(false)
      }, 600)
    }
  }, [numCards, gameMode])

  // Sync cards and game state from Firebase in multiplayer mode
  useEffect(() => {
    if (gameMode === 'multiplayer' && gameState && gameState.cards) {
      setCards(gameState.cards)
      setIsChecking(gameState.flippedCards?.length === 2)
    }
  }, [gameMode, gameState])

  useEffect(() => {
    // Only handle single player game logic here
    if (gameMode === 'single' && flippedCards.length === 2) {
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
  }, [flippedCards, cards, gameMode])

  const handleFlip = async (id: number) => {
    if (gameMode === 'multiplayer' && gameId && gameState) {
      // Multiplayer mode - check if it's player's turn
      const playerId = localStorage.getItem('playerId')
      if (gameState.currentTurn !== playerId) {
        return // Not your turn
      }
      
      if (gameState.flippedCards && gameState.flippedCards.length >= 2) {
        return // Already two cards flipped
      }
      
      // Call multiplayer flip function
      const { flipCard } = await import('./multiplayer')
      await flipCard(gameId, id)
    } else {
      // Single player mode
      if (flippedCards.length < 2 && !flippedCards.includes(id)) {
        setCards(cards.map(card =>
          card.id === id ? { ...card, isFlipped: true } : card
        ))
        setFlippedCards([...flippedCards, id])
      }
    }
  }

  // Multiplayer handlers
  const handleCreateGame = async (name: string) => {
    try {
      const { createGame } = await import('./multiplayer')
      const newGameId = await createGame(name)
      setGameId(newGameId)
      setPlayerName(name)
      setIsHost(true)
      setMultiplayerState('waiting')
      
      // Subscribe to game updates
      const { subscribeToGame: subscribe } = await import('./multiplayer')
      subscribe(newGameId, (state) => {
        setGameState(state)
        // Check if both players are ready and game started
        if (state.gameStarted && state.cards) {
          setCards(state.cards)
          setMultiplayerState('playing')
        }
      })
    } catch (error) {
      console.error('Error creating game:', error)
      alert('Failed to create game. Please try again.')
    }
  }

  const handleJoinGame = async (code: string, name: string) => {
    try {
      const { joinGame } = await import('./multiplayer')
      await joinGame(code, name)
      setGameId(code)
      setPlayerName(name)
      setIsHost(false)
      setMultiplayerState('waiting')
      
      // Subscribe to game updates
      const { subscribeToGame: subscribe } = await import('./multiplayer')
      subscribe(code, (state) => {
        setGameState(state)
        // Check if game started
        if (state.gameStarted && state.cards) {
          setCards(state.cards)
          setMultiplayerState('playing')
        }
      })
    } catch (error) {
      console.error('Error joining game:', error)
      alert('Failed to join game. Please check the code and try again.')
    }
  }

  const handleStartMultiplayerGame = async () => {
    if (gameId && isHost) {
      try {
        const { startGame } = await import('./multiplayer')
        const numCards = gridOption.rows * gridOption.cols
        const newCards = createCards(numCards)
        await startGame(gameId, newCards)
      } catch (error) {
        console.error('Error starting game:', error)
        alert('Failed to start game. Please try again.')
      }
    }
  }

  const handleLeaveRoom = () => {
    setGameId(null)
    setPlayerName('')
    setIsHost(false)
    setGameState(null)
    setMultiplayerState(null)
    setGameMode('menu')
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

  // Menu screen
  if (gameMode === 'menu') {
    return (
      <div className="app">
        <img src="/icon.svg" alt="Logo" className="app-logo" />
        <h1>PromptMatch</h1>
        <p style={{ fontSize: '1.2rem', marginBottom: '2rem' }}>
          Match AI prompts with their generated images!
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '300px', margin: '0 auto' }}>
          <button 
            className="mode-button"
            onClick={() => setGameMode('single')}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Single Player
          </button>
          <button 
            className="mode-button"
            onClick={() => {
              setGameMode('multiplayer')
              setMultiplayerState('lobby')
            }}
            style={{
              padding: '1rem 2rem',
              fontSize: '1.2rem',
              fontWeight: '600',
              border: 'none',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              cursor: 'pointer',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            Multiplayer
          </button>
        </div>
        <footer>
          By Andrew Bennet
        </footer>
      </div>
    )
  }

  // Multiplayer lobby
  if (gameMode === 'multiplayer' && multiplayerState === 'lobby') {
    return (
      <>
        <div className="app">
          <img src="/icon.svg" alt="Logo" className="app-logo" />
          <h1>PromptMatch</h1>
        </div>
        <MultiplayerLobby
          onCreateGame={handleCreateGame}
          onJoinGame={handleJoinGame}
          onCancel={() => {
            setMultiplayerState(null)
            setGameMode('menu')
          }}
        />
      </>
    )
  }

  // Waiting room
  if (gameMode === 'multiplayer' && multiplayerState === 'waiting' && gameId && gameState) {
    const opponentName = Object.values(gameState.players).find(p => p.name !== playerName)?.name
    
    return (
      <>
        <div className="app">
          <img src="/icon.svg" alt="Logo" className="app-logo" />
          <h1>PromptMatch</h1>
        </div>
        <WaitingRoom
          gameCode={gameId}
          playerName={playerName}
          isHost={isHost}
          opponentName={opponentName}
          onStartGame={isHost ? handleStartMultiplayerGame : undefined}
          onLeave={handleLeaveRoom}
        />
      </>
    )
  }

  // Single player or multiplayer game in progress
  return (
    <div className="app">
      <img src="/icon.svg" alt="Logo" className="app-logo" />
      <h1>PromptMatch</h1>
      {gameMode === 'multiplayer' && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={handleLeaveRoom}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              border: '2px solid #f5576c',
              borderRadius: '8px',
              background: 'transparent',
              color: '#f5576c',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ← Back to Menu
          </button>
        </div>
      )}
      {gameMode === 'single' && (
        <div style={{ marginBottom: '1rem' }}>
          <button
            onClick={() => setGameMode('menu')}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.9rem',
              border: '2px solid #667eea',
              borderRadius: '8px',
              background: 'transparent',
              color: '#667eea',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            ← Back to Menu
          </button>
        </div>
      )}
      {gameMode === 'single' && (
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
      )}
      
      {gameMode === 'multiplayer' && gameState && (
        <div className="multiplayer-info" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '2rem', justifyContent: 'center', marginBottom: '1rem' }}>
            {Object.entries(gameState.players).map(([playerId, player]) => {
              const isCurrentPlayer = playerId === localStorage.getItem('playerId')
              const isTheirTurn = gameState.currentTurn === playerId
              return (
                <div
                  key={playerId}
                  style={{
                    padding: '1rem',
                    borderRadius: '12px',
                    background: isTheirTurn ? `linear-gradient(135deg, ${player.color}40, ${player.color}20)` : 'rgba(255,255,255,0.05)',
                    border: `2px solid ${isTheirTurn ? player.color : 'transparent'}`,
                    minWidth: '120px',
                    transition: 'all 0.3s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <div
                      style={{
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        background: player.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '1rem',
                      }}
                    >
                      {player.name[0].toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: '600' }}>
                        {player.name} {isCurrentPlayer && '(You)'}
                      </div>
                      {isTheirTurn && (
                        <div style={{ fontSize: '0.8rem', color: player.color, fontWeight: '600' }}>
                          ▶ Your turn!
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {player.score} matches
                  </div>
                </div>
              )
            })}
          </div>
          {gameState.winner && (
            <div className="win-message" style={{ marginTop: '1rem' }}>
              {gameState.winner === 'tie' 
                ? "🎉 It's a tie! 🎉"
                : `🎉 ${gameState.players[gameState.winner]?.name} wins! 🎉`
              }
            </div>
          )}
        </div>
      )}
      
      {gameMode === 'single' && (
        <>
          <div className="game-info">
            <div className="stats-row">
              <p>Goes: {goes}</p>
              <p className="matched-count">
                Matched: <span className="matched-number" key={matchedPairs}>{matchedPairs}</span> / {totalPairs}
              </p>
            </div>
            {isGameComplete && (
              <p className="win-message">
                🎉 You won in {goes} {goes === 1 ? 'go' : 'goes'}! 🎉
              </p>
            )}
          </div>
          <button className="reset-button" onClick={handleReset} disabled={isShuffling}>
            {isShuffling ? 'Shuffling...' : 'Reset Game'}
          </button>
        </>
      )}
      <div className={`card-grid ${isShuffling ? 'shuffling' : ''}`} style={{ gridTemplateColumns: `repeat(${gridOption.cols}, 1fr)` }}>
        {cards.map(card => {
          const isDisabled = gameMode === 'multiplayer' && gameState
            ? gameState.currentTurn !== localStorage.getItem('playerId') || (gameState.flippedCards?.length || 0) >= 2
            : isChecking || flippedCards.length >= 2
          
          return (
            <CardComponent 
              key={card.id} 
              card={card} 
              onFlip={handleFlip}
              disabled={isDisabled}
            />
          )
        })}
      </div>
      <footer>
        By Andrew Bennet
      </footer>
    </div>
  )
}

export default App
