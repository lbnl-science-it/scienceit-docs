export type CertPhase = 'idle' | 'requesting' | 'ok' | 'error'

export type CertView = {
  phase: CertPhase
  message: string
  /** Bumped after every request so the form's fields are drawn fresh (secrets cleared). */
  attempt: number
  /** ISO time the current certificate expires, or null when there is none. */
  expiresAt: string | null
  username: string
}

declare module 'claude-code' {
  interface PluginState {
    'lrc-cert': { view: CertView }
  }
}
