import { useState } from 'react'
import {
  Mic,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Ticket,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import type { HealthStatus } from '../types'
import { colors, radius } from '../styles/theme'
import { Badge } from './ui/Badge'
import { api } from '../api/client'

interface Props {
  health: HealthStatus | null
  onHealthUpdate?: (health: HealthStatus) => void
}

export function Header({ health, onHealthUpdate }: Props) {
  const [isReconnecting, setIsReconnecting] = useState(false)
  const isHealthy = health?.status === 'healthy'

  async function handleReconnect() {
    setIsReconnecting(true)
    try {
      // This will wake up the Render backend
      const newHealth = await api.health()
      onHealthUpdate?.(newHealth)
    } catch (error) {
      console.error('Reconnect failed:', error)
      setTimeout(async () => {
        try {
          const newHealth = await api.health()
          onHealthUpdate?.(newHealth)
        } catch {
          // Still failed
        }
        setIsReconnecting(false)
      }, 3000)
      return
    }
    setIsReconnecting(false)
  }

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <div style={styles.logoContainer}>
          <Mic size={20} color={colors.primary} />
        </div>
        <div>
          <h1 style={styles.title}>VoiceOps</h1>
          <p style={styles.tagline}>Voice-powered agent</p>
        </div>
      </div>

      <div style={styles.status}>
        {/* Connection Status */}
        <div style={styles.statusItem}>
          {isReconnecting ? (
            <>
              <Loader2
                size={14}
                color={colors.warning}
                style={{ animation: 'spin 1s linear infinite' }}
              />
              <span style={{ color: colors.warning, fontSize: 12 }}>
                Connecting...
              </span>
            </>
          ) : isHealthy ? (
            <>
              <CheckCircle2 size={14} color={colors.success} />
              <span
                style={{ color: colors.success, fontSize: 12 }}
                className='status-text'
              >
                Connected
              </span>
            </>
          ) : (
            <>
              <XCircle size={14} color={colors.error} />
              <span
                style={{ color: colors.error, fontSize: 12 }}
                className='status-text'
              >
                Disconnected
              </span>
            </>
          )}
        </div>

        {/* Reconnect Button - Show when disconnected */}
        {!isHealthy && !isReconnecting && (
          <button
            onClick={handleReconnect}
            style={styles.reconnectBtn}
            title='Wake up backend server'
          >
            <RefreshCw size={12} />
            <span>Reconnect</span>
          </button>
        )}

        {/* Integration Badges - Only show when connected */}
        {isHealthy && (
          <>
            {health?.jira_configured && (
              <Badge variant='success'>
                <Ticket size={10} />
                <span style={styles.badgeText}>Jira</span>
              </Badge>
            )}

            {health?.slack_configured && (
              <Badge variant='info'>
                <MessageSquare size={10} />
                <span style={styles.badgeText}>Slack</span>
              </Badge>
            )}
          </>
        )}
      </div>

      <style>{`
        @media (min-width: 640px) {
          .status-text {
            display: inline !important;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: colors.bgSecondary,
    borderBottom: `1px solid ${colors.borderSubtle}`,
    gap: 12,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  logoContainer: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}44)`,
    borderRadius: radius.md,
    border: `1px solid ${colors.primary}44`,
    flexShrink: 0,
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  tagline: {
    fontSize: 11,
    color: colors.textMuted,
    margin: 0,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
  },
  reconnectBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 10px',
    background: colors.warningBg,
    border: `1px solid ${colors.warning}`,
    borderRadius: radius.md,
    color: colors.warning,
    fontSize: 11,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  badgeText: {
    display: 'none',
  },
}
