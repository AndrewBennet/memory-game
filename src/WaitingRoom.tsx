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
  const [linkCopied, setLinkCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(gameCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleCopyLink = async () => {
    try {
      const gameUrl = `${window.location.origin}${window.location.pathname}?game=${gameCode}`
      await navigator.clipboard.writeText(gameUrl)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  return (
    <div className="waiting-room">
      <div className="waiting-card">
        <h2>Game Room</h2>
        
        {isHost && (
          <div className="game-code-display">
          <label>Share Game:</label>
          <div className="share-options">
            <div className="share-option">
              <label className="share-label">Code:</label>
              <div className="game-code-container">
                <div className="game-code">{gameCode}</div>
                <button 
                  className="copy-btn" 
                  onClick={handleCopy}
                  title="Copy code"
                >
                  {copied ? '✓' : '📋'}
                </button>
              </div>
            </div>
            <div className="share-divider">or</div>
            <div className="share-option">
              <button 
                className="share-link-btn" 
                onClick={handleCopyLink}
              >
                {linkCopied ? '✓ Link Copied!' : '� Copy Share Link'}
              </button>
            </div>
          </div>
          <p className="code-hint">Share with your friend to join!</p>
          </div>
        )}

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
