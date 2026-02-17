import {
  Target,
  Search,
  Brain,
  ChevronRight,
  AlertTriangle,
  Ticket,
} from 'lucide-react'
import type { PipelineData } from '../types'
import { colors, radius, priorityColors, statusColors } from '../styles/theme'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

interface Props {
  pipeline: PipelineData
  transcript: string
}

export function PipelineView({ pipeline, transcript }: Props) {
  const { step1_intent, step2_context, step3_plan } = pipeline

  return (
    <div style={styles.container}>
      {/* Transcript */}
      <Card padding='md'>
        <div style={styles.transcriptHeader}>
          <div style={styles.stepIndicator}>
            <span style={styles.stepDot} />
            INPUT
          </div>
        </div>
        <p style={styles.transcript}>"{transcript}"</p>
      </Card>

      <div style={styles.connector}>
        <ChevronRight size={16} color={colors.textMuted} />
      </div>

      {/* Step 1: Intent */}
      <Card padding='md'>
        <div style={styles.stepHeader}>
          <div style={styles.stepIcon}>
            <Target size={18} color={colors.primary} />
          </div>
          <div>
            <span style={styles.stepTitle}>Intent Extraction</span>
            <span style={styles.stepSubtitle}>Step 1 of 3</span>
          </div>
        </div>

        <div style={styles.entityGrid}>
          <EntityTag label='Intent' value={step1_intent.intent} highlight />
          {Object.entries(step1_intent.entities).map(([key, val]) =>
            val ? (
              <EntityTag key={key} label={key} value={String(val)} />
            ) : null,
          )}
        </div>
      </Card>

      <div style={styles.connector}>
        <ChevronRight size={16} color={colors.textMuted} />
      </div>

      {/* Step 2: Context */}
      <Card padding='md'>
        <div style={styles.stepHeader}>
          <div style={styles.stepIcon}>
            <Search size={18} color={colors.info} />
          </div>
          <div>
            <span style={styles.stepTitle}>Context Retrieval</span>
            <span style={styles.stepSubtitle}>Step 2 of 3 · Elasticsearch</span>
          </div>
        </div>

        <div style={styles.contextStats}>
          <Badge variant='info'>
            {step2_context.similar_tickets.length} similar tickets
          </Badge>
          <Badge variant='default'>
            {step2_context.past_commands_found} past commands
          </Badge>
          <Badge variant='default'>
            {step2_context.past_actions_found} past actions
          </Badge>
        </div>

        {step2_context.similar_tickets.slice(0, 2).map((ticket) => (
          <div key={ticket.ticket_id} style={styles.ticketCard}>
            <div style={styles.ticketHeader}>
              <Ticket size={14} color={colors.textMuted} />
              <code style={styles.ticketId}>{ticket.ticket_id}</code>
              <PriorityBadge priority={ticket.priority} />
              <StatusBadge status={ticket.status} />
              <span style={styles.score}>
                {(
                  ticket.relevance_score && ticket.relevance_score * 10
                )?.toFixed(1)}
                % match
              </span>
            </div>
            <p style={styles.ticketSummary}>{ticket.summary}</p>
          </div>
        ))}
      </Card>

      <div style={styles.connector}>
        <ChevronRight size={16} color={colors.textMuted} />
      </div>

      {/* Step 3: Reasoning */}
      <Card
        padding='md'
        highlight={
          step3_plan.confidence === 'high'
            ? 'success'
            : step3_plan.confidence === 'medium'
              ? 'warning'
              : 'error'
        }
      >
        <div style={styles.stepHeader}>
          <div style={styles.stepIcon}>
            <Brain size={18} color={colors.primary} />
          </div>
          <div>
            <span style={styles.stepTitle}>Reasoning & Planning</span>
            <span style={styles.stepSubtitle}>
              Step 3 of 3 · Agent Decision
            </span>
          </div>
          <Badge
            variant={
              step3_plan.confidence === 'high'
                ? 'success'
                : step3_plan.confidence === 'medium'
                  ? 'warning'
                  : 'error'
            }
          >
            {step3_plan.confidence} confidence
          </Badge>
        </div>

        <div style={styles.reasoningBox}>
          <p style={styles.reasoning}>{step3_plan.reasoning}</p>
        </div>

        {step3_plan.duplicate_warning && (
          <div style={styles.warning}>
            <AlertTriangle size={16} />
            {step3_plan.duplicate_warning}
          </div>
        )}

        <div style={styles.actionsHeader}>
          <span>{step3_plan.actions.length} action(s) planned</span>
        </div>

        {step3_plan.actions.map((action) => (
          <div key={action.step} style={styles.actionRow}>
            <span style={styles.actionStep}>{action.step}</span>
            <Badge variant='info'>{action.type}</Badge>
            <span style={styles.actionDesc}>{action.description}</span>
          </div>
        ))}
      </Card>
    </div>
  )
}

function EntityTag({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div
      style={{
        ...styles.entityTag,
        borderColor: highlight ? colors.primary : colors.borderSubtle,
        background: highlight ? `${colors.primary}11` : colors.bgElevated,
      }}
    >
      <span style={styles.entityLabel}>{label}</span>
      <span
        style={{
          ...styles.entityValue,
          color: highlight ? colors.primary : colors.textPrimary,
        }}
      >
        {value}
      </span>
    </div>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const style = priorityColors[priority] || priorityColors.medium
  return (
    <span
      style={{
        fontSize: 11,
        padding: '2px 6px',
        borderRadius: radius.sm,
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {priority}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const style = statusColors[status] || statusColors.open
  return (
    <span
      style={{
        fontSize: 11,
        padding: '2px 6px',
        borderRadius: radius.sm,
        background: style.bg,
        color: style.text,
        border: `1px solid ${style.border}`,
      }}
    >
      {status}
    </span>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  transcriptHeader: {
    marginBottom: 8,
  },
  stepIndicator: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    background: colors.success,
  },
  transcript: {
    fontSize: 16,
    color: colors.textPrimary,
    fontStyle: 'italic',
    margin: 0,
    lineHeight: 1.5,
  },
  connector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '4px 0',
  },
  stepHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  stepIcon: {
    width: 36,
    height: 36,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.bgElevated,
    borderRadius: radius.md,
  },
  stepTitle: {
    display: 'block',
    fontSize: 15,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  stepSubtitle: {
    display: 'block',
    fontSize: 12,
    color: colors.textMuted,
  },
  entityGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  entityTag: {
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 12px',
    background: colors.bgElevated,
    borderRadius: radius.md,
    border: `1px solid ${colors.borderSubtle}`,
    minWidth: 100,
  },
  entityLabel: {
    fontSize: 10,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 4,
  },
  entityValue: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  contextStats: {
    display: 'flex',
    gap: 8,
    marginBottom: 16,
  },
  ticketCard: {
    padding: 12,
    background: colors.bgElevated,
    borderRadius: radius.md,
    marginBottom: 8,
  },
  ticketHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  ticketId: {
    fontSize: 13,
    fontWeight: 600,
    color: colors.primary,
  },
  score: {
    marginLeft: 'auto',
    fontSize: 11,
    color: colors.textMuted,
  },
  ticketSummary: {
    fontSize: 13,
    color: colors.textSecondary,
    margin: 0,
    lineHeight: 1.4,
  },
  reasoningBox: {
    padding: 16,
    background: colors.bgElevated,
    borderRadius: radius.md,
    borderLeft: `3px solid ${colors.primary}`,
    marginBottom: 16,
  },
  reasoning: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },
  warning: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    background: colors.warningBg,
    border: `1px solid ${colors.warning}`,
    borderRadius: radius.md,
    color: colors.warning,
    fontSize: 13,
    marginBottom: 16,
  },
  actionsHeader: {
    fontSize: 12,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: 12,
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 0',
    borderBottom: `1px solid ${colors.borderSubtle}`,
  },
  actionStep: {
    width: 24,
    height: 24,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: colors.primary,
    color: '#fff',
    fontSize: 12,
    fontWeight: 700,
    borderRadius: radius.sm,
  },
  actionDesc: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
}
