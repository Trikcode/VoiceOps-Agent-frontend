import { useState } from 'react'
import { Mic, ClipboardList, Ticket, BarChart3, Database } from 'lucide-react'
import { useAgent } from './hooks/useAgent'
import { Header } from './components/Header'
import { VoiceInput } from './components/VoiceInput'
import { PipelineView } from './components/PipelineView'
import { ConfirmationModal } from './components/ConfirmationModel'
import { AuditLog } from './components/AuditLog'
import { TicketList } from './components/TicketList'
import { Analytics } from './components/Analytics'
import { ImpactCard } from './components/ImpactCard'
import { ESQLExplorer } from './components/ESQLExplorer'
import { colors, radius } from './styles/theme'

type Tab = 'agent' | 'audit' | 'tickets' | 'analytics' | 'esql'

const SAMPLE_COMMANDS = [
  'Create a ticket for the login page freezing after 3 wrong passwords on Safari, high priority',
  'Find similar tickets to the database connection issue',
  'Close ticket AUTH-204 and notify the backend team on Slack',
  'Reassign ticket CORE-150 to james.wu',
]

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('agent')
  const agent = useAgent()

  const tabs: {
    id: Tab
    label: string
    icon: React.ReactNode
    count?: number
  }[] = [
    { id: 'agent', label: 'Agent', icon: <Mic size={16} /> },
    {
      id: 'audit',
      label: 'Audit Log',
      icon: <ClipboardList size={16} />,
      count: agent.auditLog.length,
    },
    {
      id: 'tickets',
      label: 'Tickets',
      icon: <Ticket size={16} />,
      count: agent.tickets.length,
    },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    { id: 'esql', label: 'ES|QL', icon: <Database size={16} /> },
  ]

  const showModal =
    agent.result &&
    (agent.result.status === 'pending_confirmation' ||
      agent.result.status === 'needs_clarification' ||
      agent.executionResult)

  return (
    <div style={styles.app}>
      <Header health={agent.health} />

      <nav style={styles.tabs}>
        <div style={styles.tabsInner}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tab,
                ...(activeTab === tab.id ? styles.tabActive : {}),
              }}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count != null && tab.count > 0 && (
                <span style={styles.badge}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>
      </nav>

      <main style={styles.main}>
        {activeTab === 'agent' && (
          <div style={styles.agentLayout}>
            <VoiceInput
              isProcessing={agent.isProcessing}
              onCommand={(t) => t && agent.processCommand(t)}
            />

            {agent.error && (
              <div style={styles.error}>
                <span>Error:</span> {agent.error}
              </div>
            )}

            {agent.result && (
              <PipelineView
                pipeline={agent.result.pipeline}
                transcript={agent.result.transcript}
              />
            )}

            {!agent.result && !agent.isProcessing && (
              <div style={styles.samples}>
                <h3 style={styles.samplesTitle}>Try these commands</h3>
                <div style={styles.samplesGrid}>
                  {SAMPLE_COMMANDS.map((cmd, i) => (
                    <button
                      key={i}
                      onClick={() => agent.processCommand(cmd)}
                      style={styles.sampleBtn}
                    >
                      {cmd}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <ImpactCard data={agent.impact} />
          </div>
        )}

        {activeTab === 'audit' && <AuditLog actions={agent.auditLog} />}
        {activeTab === 'tickets' && <TicketList tickets={agent.tickets} />}
        {activeTab === 'analytics' && <Analytics data={agent.analytics} />}
        {activeTab === 'esql' && <ESQLExplorer />}
      </main>

      {showModal && agent.result && (
        <ConfirmationModal
          result={agent.result}
          executionResult={agent.executionResult}
          isProcessing={agent.isProcessing}
          onConfirm={agent.confirmAction}
          onClear={agent.clearResult}
        />
      )}

      <footer style={styles.footer}>
        <span>VoiceOps Agent</span>
        <span style={styles.footerDot}>·</span>
        <span>Powered by Elasticsearch Agent Builder</span>
        <span style={styles.footerDot}>·</span>
        <span>Hackathon 2026</span>
      </footer>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: colors.bgPrimary,
  },
  tabs: {
    background: colors.bgSecondary,
    borderBottom: `1px solid ${colors.borderSubtle}`,
    padding: '0 32px',
  },
  tabsInner: {
    display: 'flex',
    gap: 4,
    maxWidth: 1200,
    margin: '0 auto',
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '14px 16px',
    border: 'none',
    background: 'transparent',
    color: colors.textMuted,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    borderBottom: '2px solid transparent',
    marginBottom: -1,
    transition: 'all 150ms ease',
  },
  tabActive: {
    color: colors.textPrimary,
    borderBottomColor: colors.primary,
  },
  badge: {
    fontSize: 11,
    fontWeight: 600,
    background: colors.primary,
    color: '#fff',
    padding: '2px 6px',
    borderRadius: '10px',
    minWidth: 20,
    textAlign: 'center',
  },
  main: {
    flex: 1,
    padding: '32px',
    maxWidth: 1200,
    margin: '0 auto',
    width: '100%',
  },
  agentLayout: {
    display: 'flex',
    flexDirection: 'column',
    gap: 24,
  },
  error: {
    padding: '14px 18px',
    background: colors.errorBg,
    border: `1px solid ${colors.error}`,
    borderRadius: radius.md,
    color: colors.error,
    fontSize: 14,
  },
  samples: {
    padding: 24,
    background: colors.bgCard,
    borderRadius: radius.lg,
    border: `1px solid ${colors.borderSubtle}`,
  },
  samplesTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: colors.textSecondary,
    margin: '0 0 16px',
  },
  samplesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: 10,
  },
  sampleBtn: {
    padding: '14px 16px',
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: radius.md,
    background: colors.bgElevated,
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: 13,
    textAlign: 'left',
    lineHeight: 1.5,
    transition: 'all 150ms ease',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '16px 32px',
    borderTop: `1px solid ${colors.borderSubtle}`,
    fontSize: 12,
    color: colors.textMuted,
  },
  footerDot: {
    color: colors.borderDefault,
  },
}
