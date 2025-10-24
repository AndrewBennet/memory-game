import { ref, set, onValue, update, push, get } from 'firebase/database'
import { database } from './firebase'
import type { Card } from './types'

export interface GameState {
  gameId: string
  cards: Card[]
  players: {
    [playerId: string]: {
      name: string
      score: number
      color: string
    }
  }
  currentTurn: string
  flippedCards: number[]
  gameStarted: boolean
  winner: string | null
}

export const createGame = async (playerName: string): Promise<string> => {
  const gamesRef = ref(database, 'games')
  const newGameRef = push(gamesRef)
  const gameId = newGameRef.key!
  
  const playerId = `player_${Date.now()}`
  
  const initialState: Partial<GameState> = {
    gameId,
    players: {
      [playerId]: {
        name: playerName,
        score: 0,
        color: '#667eea'
      }
    },
    currentTurn: playerId,
    flippedCards: [],
    gameStarted: false,
    winner: null
  }
  
  await set(newGameRef, initialState)
  
  // Store player ID in localStorage
  localStorage.setItem('playerId', playerId)
  
  return gameId
}

export const joinGame = async (gameId: string, playerName: string): Promise<string> => {
  const playerId = `player_${Date.now()}`
  const gameRef = ref(database, `games/${gameId}`)
  
  await update(gameRef, {
    [`players/${playerId}`]: {
      name: playerName,
      score: 0,
      color: '#f5576c'
    }
  })
  
  // Store player ID in localStorage
  localStorage.setItem('playerId', playerId)
  
  return playerId
}

export const startGame = async (gameId: string, cards: Card[]) => {
  const gameRef = ref(database, `games/${gameId}`)
  
  await update(gameRef, {
    cards,
    gameStarted: true
  })
}

export const updateGameState = async (gameId: string, updates: Partial<GameState>) => {
  const gameRef = ref(database, `games/${gameId}`)
  await update(gameRef, updates)
}

export const flipCard = async (gameId: string, cardId: number) => {
  const gameRef = ref(database, `games/${gameId}`)
  const playerId = localStorage.getItem('playerId')!
  
  // Get current state to check flippedCards
  const snapshot = await get(gameRef)
  const currentState = snapshot.val() as GameState
  
  if (!currentState.flippedCards) {
    currentState.flippedCards = []
  }
  
  // Add card to flippedCards array
  const newFlippedCards = [...currentState.flippedCards, cardId]
  
  // Update cards to flip the selected card
  const updatedCards = currentState.cards.map(card =>
    card.id === cardId ? { ...card, isFlipped: true } : card
  )
  
  await update(gameRef, {
    flippedCards: newFlippedCards,
    cards: updatedCards
  })
  
  // If two cards are flipped, check for match after delay
  if (newFlippedCards.length === 2) {
    const [firstId, secondId] = newFlippedCards
    const firstCard = updatedCards.find(c => c.id === firstId)
    const secondCard = updatedCards.find(c => c.id === secondId)
    
    setTimeout(async () => {
      if (firstCard && secondCard && firstCard.value === secondCard.value) {
        // Match found! Mark cards as matched and update score
        const finalCards = updatedCards.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isMatched: true }
            : card
        )
        
        const newScore = (currentState.players[playerId]?.score || 0) + 1
        
        // Check if all cards are matched (game over)
        const allMatched = finalCards.every(card => card.isMatched)
        let winner = null
        
        if (allMatched) {
          // Determine winner by comparing scores
          const players = Object.entries(currentState.players)
          const [player1Id, player1] = players[0]
          const [player2Id, player2] = players[1] || [null, null]
          
          const player1Score = player1Id === playerId ? newScore : player1.score
          const player2Score = player2Id === playerId ? newScore : player2?.score || 0
          
          if (player1Score > player2Score) {
            winner = player1Id
          } else if (player2Score > player1Score) {
            winner = player2Id
          } else {
            winner = 'tie'
          }
        }
        
        await update(gameRef, {
          cards: finalCards,
          flippedCards: [],
          [`players/${playerId}/score`]: newScore,
          ...(winner && { winner })
          // Turn stays with same player on match
        })
      } else {
        // No match - flip back and switch turn
        const finalCards = updatedCards.map(card =>
          card.id === firstId || card.id === secondId
            ? { ...card, isFlipped: false }
            : card
        )
        
        // Get other player's ID
        const otherPlayerId = Object.keys(currentState.players).find(id => id !== playerId)
        
        await update(gameRef, {
          cards: finalCards,
          flippedCards: [],
          currentTurn: otherPlayerId || playerId
        })
      }
    }, 1000)
  }
}

export const subscribeToGame = (gameId: string, callback: (state: GameState) => void) => {
  const gameRef = ref(database, `games/${gameId}`)
  
  return onValue(gameRef, (snapshot) => {
    const data = snapshot.val()
    if (data) {
      callback(data as GameState)
    }
  })
}
