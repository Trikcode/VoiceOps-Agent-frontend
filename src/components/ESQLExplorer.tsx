import { useState } from 'react'
import {
  Database,
  Code,
  ChevronDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import type { ESQLResult } from '../types'
import { api } from '../api/client'
import { colors, radius } from '../styles/theme'
import { Card } from './ui/Card'
import { Badge } from './ui/Badge'

const PRESET_QUERIES = [
  {
    id: 'recent-actions',
    name: 'Recent Actions',
    description: 'Get the latest agent actions with timing',
    endpoint: 'recent-actions',
  },
  {
    id: 'action-stats',
    name: 'Action Statistics',
    description: 'Aggregate stats including success rate',
    endpoint: 'action-stats',
  },
  {
    id: 'tickets-by-priority',
    name: 'Tickets by Priority',
    description: 'Distribution of tickets by priority level',
    endpoint: 'tickets-by-priority',
  },
  {
    id: 'slow-actions',
    name: 'Slow Actions',
    description: 'Actions that took longer than 2 seconds',
    endpoint: 'slow-actions',
  },
  {
    id: 'daily-summary',
    name: 'Daily Summary',
    description: 'Action counts and durations by day',
    endpoint: 'daily-summary',
  },
]

export function ESQLExplorer() {
  const [selectedQuery, setSelectedQuery] = useState<string | null>(null)
  const [result, setResult] = useState<ESQLResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [expandedQuery, setExpandedQuery] = useState(false)

  async function runQuery(endpoint: string) {
    setIsLoading(true)
    setSelectedQuery(endpoint)
    try {
      const data = await api.runESQLQuery(endpoint)
      setResult(data)
    } catch (error) {
      setResult({ query: '', columns: [], values: [], error: String(error) })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card padding='md'>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <div style={styles.iconContainer}>
            <Database size={20} color={colors.primary} />
          </div>
          <div>
            <h3 style={styles.title}>ES|QL Explorer</h3>
            <p style={styles.subtitle}>
              Run Elasticsearch Query Language queries
            </p>
          </div>
        </div>
        <Badge variant='info'>Live Queries</Badge>
      </div>

      <div style={styles.queryGrid}>
        {PRESET_QUERIES.map((query) => (
          <button
            key={query.id}
            onClick={() => runQuery(query.endpoint)}
            disabled={isLoading}
            style={{
              ...styles.queryCard,
              ...(selectedQuery === query.endpoint
                ? styles.queryCardActive
                : {}),
            }}
          >
            <div style={styles.queryCardHeader}>
              <Code size={16} color={colors.primary} />
              <span style={styles.queryName}>{query.name}</span>
              {isLoading && selectedQuery === query.endpoint && (
                <Loader2
                  size={14}
                  style={{ animation: 'spin 1s linear infinite' }}
                />
              )}
            </div>
            <p style={styles.queryDesc}>{query.description}</p>
          </button>
        ))}
      </div>

      {result && (
        <div style={styles.resultContainer}>
          <button
            onClick={() => setExpandedQuery(!expandedQuery)}
            style={styles.queryToggle}
          >
            {expandedQuery ? (
              <ChevronDown size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
            <span>View ES|QL Query</span>
          </button>

          {expandedQuery && result.query && (
            <pre style={styles.queryCode}>{result.query}</pre>
          )}

          {result.error ? (
            <div style={styles.error}>Error: {result.error}</div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    {result.columns.map((col, i) => (
                      <th key={i} style={styles.th}>
                        {col.name}
                        <span style={styles.colType}>{col.type}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {result.values.slice(0, 10).map((row, i) => (
                    <tr key={i}>
                      {row.map((cell, j) => (
                        <td key={j} style={styles.td}>
                          {formatCell(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              {result.values.length > 10 && (
                <p style={styles.moreRows}>
                  Showing 10 of {result.values.length} rows
                </p>
              )}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </Card>
  )
}

function formatCell(value: any): string {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? '✓' : '✗'
  if (typeof value === 'number') return value.toLocaleString()
  if (typeof value === 'string' && value.includes('T')) {
    // Likely a timestamp
    try {
      return new Date(value).toLocaleString()
    } catch {
      return value
    }
  }
  return String(value)
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  iconContainer: {
    width: 44,
    height: 44,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: `${colors.primary}15`,
    borderRadius: radius.lg,
  },
  title: {
    fontSize: 16,
    fontWeight: 600,
    color: colors.textPrimary,
    margin: 0,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMuted,
    margin: 0,
  },
  queryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
    marginBottom: 20,
  },
  queryCard: {
    padding: 14,
    background: colors.bgElevated,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: radius.md,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 150ms ease',
  },
  queryCardActive: {
    borderColor: colors.primary,
    background: `${colors.primary}11`,
  },
  queryCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  queryName: {
    flex: 1,
    fontSize: 13,
    fontWeight: 600,
    color: colors.textPrimary,
  },
  queryDesc: {
    fontSize: 12,
    color: colors.textMuted,
    margin: 0,
    lineHeight: 1.4,
  },
  resultContainer: {
    borderTop: `1px solid ${colors.borderSubtle}`,
    paddingTop: 20,
  },
  queryToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    background: colors.bgElevated,
    border: `1px solid ${colors.borderSubtle}`,
    borderRadius: radius.md,
    color: colors.textSecondary,
    fontSize: 13,
    cursor: 'pointer',
    marginBottom: 12,
  },
  queryCode: {
    padding: 16,
    background: '#0d1117',
    borderRadius: radius.md,
    color: '#7ee787',
    fontSize: 12,
    fontFamily: 'monospace',
    overflow: 'auto',
    marginBottom: 16,
    whiteSpace: 'pre-wrap',
    border: `1px solid ${colors.borderSubtle}`,
  },
  error: {
    padding: 16,
    background: colors.errorBg,
    border: `1px solid ${colors.error}`,
    borderRadius: radius.md,
    color: colors.error,
    fontSize: 13,
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '10px 12px',
    fontSize: 11,
    fontWeight: 600,
    color: colors.textMuted,
    textTransform: 'uppercase',
    borderBottom: `1px solid ${colors.borderSubtle}`,
    background: colors.bgElevated,
    whiteSpace: 'nowrap',
  },
  colType: {
    display: 'block',
    fontSize: 10,
    fontWeight: 400,
    color: colors.textMuted,
    opacity: 0.7,
  },
  td: {
    padding: '10px 12px',
    fontSize: 13,
    color: colors.textSecondary,
    borderBottom: `1px solid ${colors.borderSubtle}`,
    whiteSpace: 'nowrap',
  },
  moreRows: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    padding: '12px 0',
    margin: 0,
  },
}
