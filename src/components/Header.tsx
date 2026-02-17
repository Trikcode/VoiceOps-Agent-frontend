import {
  Mic,
  Database,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Ticket,
} from 'lucide-react'
import type { HealthStatus } from '../types'
import { colors, radius } from '../styles/theme'
import { Badge } from './ui/Badge'

interface Props {
  health: HealthStatus | null
}

export function Header({ health }: Props) {
  const isHealthy = health?.status === 'healthy'

  return (
    <header style={styles.header}>
      <div style={styles.brand}>
        <div style={styles.logoContainer}>
          <Mic size={24} color={colors.primary} />
        </div>
        <div>
          <h1 style={styles.title}>VoiceOps</h1>
          <p style={styles.tagline}>Voice-powered operations agent</p>
        </div>
      </div>

      <div style={styles.status}>
        <div style={styles.statusItem}>
          {isHealthy ? (
            <CheckCircle2 size={16} color={colors.success} />
          ) : (
            <XCircle size={16} color={colors.error} />
          )}
          <span
            style={{
              color: isHealthy ? colors.success : colors.error,
              fontSize: 13,
            }}
          >
            {isHealthy ? 'Connected' : 'Disconnected'}
          </span>
        </div>

        {health?.jira_configured && (
          <Badge variant='success'>
            <Ticket size={12} />
            Jira
          </Badge>
        )}

        {health?.slack_configured && (
          <Badge variant='info'>
            <MessageSquare size={12} />
            Slack
          </Badge>
        )}

        {health?.indices && (
          <Badge variant='default'>
            <Database size={12} />
            {health.indices['voiceops-tickets']} tickets
          </Badge>
        )}
      </div>
    </header>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    background: colors.bgSecondary,
    borderBottom: `1px solid ${colors.borderSubtle}`,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoContainer: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `linear-gradient(135deg, ${colors.primary}22, ${colors.primary}44)`,
    borderRadius: radius.lg,
    border: `1px solid ${colors.primary}44`,
  },
  title: {
    fontSize: 20,
    fontWeight: 700,
    color: colors.textPrimary,
    margin: 0,
    letterSpacing: '-0.02em',
  },
  tagline: {
    fontSize: 13,
    color: colors.textMuted,
    margin: 0,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  statusItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
}
