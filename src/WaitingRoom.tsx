import { useState } from 'react'
import './WaitingRoom.scss'

interface WaitingRoomProps {
  gameCode: string
  playerName: string
  isHost: boolean
  opponentName?: string
  onStartGame?: () => void
  onLeave: () => void
}

function WaitingRoom({ gameCode, playerName, isHost, opponentName, onStartGame, onLeave }: WaitingRoomProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="waiting-room">
      <div className="waiting-card">
        <h2>Game Room</h2>
        
        <div className="game-code-display">
          <label>Game Code:</label>
          <div className="game-code-container">
            <div className="game-code">{gameCode}</div>
            <button 
              className="copy-btn" 
              onClick={handleCopy}
              title="Copy to clipboard"
            >
              {copied ? '✓' : '📋'}
            </button>
          </div>
          <p className="code-hint">Share this code with your friend!</p>
        </div>

        <div className="players-list">
          <div className="player-item">
            <div className="player-avatar player-one">
              {playerName[0].toUpperCase()}
            </div>
            <div className="player-info">
              <div className="player-name">{playerName} {isHost && '(Host)'}</div>
              <div className="player-status ready">Ready</div>
            </div>
          </div>

          <div className="player-item">
            {opponentName ? (
              <>
                <div className="player-avatar player-two">
                  {opponentName[0].toUpperCase()}
                </div>
                <div className="player-info">
                  <div className="player-name">{opponentName}</div>
                  <div className="player-status ready">Ready</div>
                </div>
              </>
            ) : (
              <>
                <div className="player-avatar empty">?</div>
                <div className="player-info">
                  <div className="player-name">Waiting for opponent...</div>
                  <div className="player-status waiting">
                    <span className="dot-pulse"></span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="waiting-buttons">
          {isHost && opponentName && onStartGame && (
            <button className="waiting-btn start-btn" onClick={onStartGame}>
              Start Game
            </button>
          )}
          {!isHost && opponentName && (
            <p className="waiting-text">Waiting for host to start the game...</p>
          )}
          <button className="waiting-btn leave-btn" onClick={onLeave}>
            Leave Room
          </button>
        </div>
      </div>
    </div>
  )
}

export { WaitingRoom }
export default WaitingRoom
