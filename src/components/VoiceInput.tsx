import { useState, type FormEvent } from 'react'
import { Mic, Square, Loader2, ArrowRight } from 'lucide-react'
import { useVoiceRecorder } from '../hooks/useVoiceRecorder'
import { api } from '../api/client'
import { colors, radius, shadows, transitions } from '../styles/theme'
import { Button } from './ui/Button'

interface Props {
  isProcessing: boolean
  onCommand: (transcript: string) => void
}

export function VoiceInput({ isProcessing, onCommand }: Props) {
  const [manualInput, setManualInput] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const {
    isRecording,
    startRecording,
    stopRecording,
    error: micError,
  } = useVoiceRecorder()

  const isBusy = isProcessing || isTranscribing

  async function handleMicClick() {
    if (isRecording) {
      const blob = await stopRecording()
      if (blob) {
        setIsTranscribing(true)
        try {
          const transcript = await api.transcribeAudio(blob)
          onCommand(transcript)
        } catch {
          onCommand('')
        } finally {
          setIsTranscribing(false)
        }
      }
    } else {
      startRecording()
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (manualInput.trim()) {
      onCommand(manualInput.trim())
      setManualInput('')
    }
  }

  const getMicState = () => {
    if (isTranscribing) return 'transcribing'
    if (isRecording) return 'recording'
    if (isProcessing) return 'processing'
    return 'idle'
  }

  const micState = getMicState()

  return (
    <div style={styles.container}>
      <div style={styles.micSection}>
        <button
          onClick={handleMicClick}
          disabled={isBusy && !isRecording}
          style={{
            ...styles.micButton,
            ...(micState === 'recording' ? styles.micRecording : {}),
            ...(micState === 'processing' || micState === 'transcribing'
              ? styles.micBusy
              : {}),
          }}
        >
          <div style={styles.micInner}>
            {micState === 'transcribing' && (
              <Loader2
                size={28}
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}
            {micState === 'recording' && <Square size={24} />}
            {micState === 'processing' && (
              <Loader2
                size={28}
                style={{ animation: 'spin 1s linear infinite' }}
              />
            )}
            {micState === 'idle' && <Mic size={28} />}
          </div>

          {micState === 'recording' && <div style={styles.pulseRing} />}
        </button>

        <p style={styles.micLabel}>
          {micState === 'transcribing' && 'Transcribing audio...'}
          {micState === 'recording' && 'Listening — click to stop'}
          {micState === 'processing' && 'Agent is thinking...'}
          {micState === 'idle' && 'Click to speak'}
        </p>
      </div>

      {micError && <p style={styles.error}>{micError}</p>}

      <div style={styles.divider}>
        <span style={styles.dividerLine} />
        <span style={styles.dividerText}>or type a command</span>
        <span style={styles.dividerLine} />
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type='text'
          value={manualInput}
          onChange={(e) => setManualInput(e.target.value)}
          placeholder='Create a ticket for the login bug...'
          style={styles.input}
          disabled={isBusy}
        />
        <Button
          onClick={() => {}}
          disabled={isBusy || !manualInput.trim()}
          icon={<ArrowRight size={16} />}
        >
          Execute
        </Button>
      </form>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 20,
    padding: 32,
    background: colors.bgCard,
    borderRadius: radius.xl,
    border: `1px solid ${colors.borderSubtle}`,
  },
  micSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16,
  },
  micButton: {
    position: 'relative',
    width: 88,
    height: 88,
    borderRadius: '50%',
    border: `2px solid ${colors.primary}`,
    background: `linear-gradient(180deg, ${colors.bgElevated}, ${colors.bgCard})`,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: transitions.default,
    color: colors.primary,
    boxShadow: shadows.glow(colors.primary),
  },
  micRecording: {
    border: `2px solid ${colors.error}`,
    color: colors.error,
    boxShadow: shadows.glow(colors.error),
  },
  micBusy: {
    border: `2px solid ${colors.warning}`,
    color: colors.warning,
    opacity: 0.8,
    cursor: 'wait',
  },
  micInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pulseRing: {
    position: 'absolute',
    inset: -8,
    borderRadius: '50%',
    border: `2px solid ${colors.error}`,
    animation: 'pulse 1.5s ease-out infinite',
  },
  micLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    margin: 0,
  },
  error: {
    fontSize: 13,
    color: colors.error,
    margin: 0,
    padding: '8px 16px',
    background: colors.errorBg,
    borderRadius: radius.md,
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    maxWidth: 500,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    background: colors.borderSubtle,
  },
  dividerText: {
    fontSize: 12,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  form: {
    display: 'flex',
    gap: 12,
    width: '100%',
    maxWidth: 600,
  },
  input: {
    flex: 1,
    padding: '12px 16px',
    border: `1px solid ${colors.borderDefault}`,
    borderRadius: radius.md,
    background: colors.bgInput,
    color: colors.textPrimary,
    fontSize: 14,
    outline: 'none',
    transition: transitions.fast,
  },
}
