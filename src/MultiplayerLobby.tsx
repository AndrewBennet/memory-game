import { useState } from 'react'
import './MultiplayerLobby.scss'

interface MultiplayerLobbyProps {
  onCreateGame: (playerName: string) => void
  onJoinGame: (gameId: string, playerName: string) => void
  onCancel: () => void
}

function MultiplayerLobby({ onCreateGame, onJoinGame, onCancel }: MultiplayerLobbyProps) {
  const [mode, setMode] = useState<'select' | 'create' | 'join'>('select')
  const [playerName, setPlayerName] = useState('')
  const [gameCode, setGameCode] = useState('')

  const handleCreateGame = () => {
    if (playerName.trim()) {
      onCreateGame(playerName.trim())
    }
  }

  const handleJoinGame = () => {
    if (playerName.trim() && gameCode.trim()) {
      onJoinGame(gameCode.trim(), playerName.trim())
    }
  }

  if (mode === 'select') {
    return (
      <div className="multiplayer-lobby">
        <div className="lobby-card">
          <h2>Multiplayer Mode</h2>
          <p className="lobby-description">Play with a friend in real-time!</p>
          <div className="lobby-buttons">
            <button className="lobby-btn create-btn" onClick={() => setMode('create')}>
              Create Game
            </button>
            <button className="lobby-btn join-btn" onClick={() => setMode('join')}>
              Join Game
            </button>
            <button className="lobby-btn cancel-btn" onClick={onCancel}>
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (mode === 'create') {
    return (
      <div className="multiplayer-lobby">
        <div className="lobby-card">
          <h2>Create Game</h2>
          <p className="lobby-description">Enter your name to create a game room</p>
          <input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleCreateGame()}
            className="lobby-input"
            maxLength={20}
            autoFocus
          />
          <div className="lobby-buttons">
            <button 
              className="lobby-btn create-btn" 
              onClick={handleCreateGame}
              disabled={!playerName.trim()}
            >
              Create Room
            </button>
            <button className="lobby-btn cancel-btn" onClick={() => setMode('select')}>
              Back
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="multiplayer-lobby">
      <div className="lobby-card">
        <h2>Join Game</h2>
        <p className="lobby-description">Enter the game code to join</p>
        <input
          type="text"
          placeholder="Your name"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          className="lobby-input"
          maxLength={20}
        />
        <input
          type="text"
          placeholder="Game Code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleJoinGame()}
          className="lobby-input"
          maxLength={30}
        />
        <div className="lobby-buttons">
          <button 
            className="lobby-btn join-btn" 
            onClick={handleJoinGame}
            disabled={!playerName.trim() || !gameCode.trim()}
          >
            Join Room
          </button>
          <button className="lobby-btn cancel-btn" onClick={() => setMode('select')}>
            Back
          </button>
        </div>
      </div>
    </div>
  )
}

export { MultiplayerLobby }
export default MultiplayerLobby
