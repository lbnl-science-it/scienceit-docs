// Pure helpers for the Lawrencium (LRC) certificate flow; the same logic as
// lrc-scripts/request_cert.sh with `-p lrc`.

export const MSM_HOST = 'https://msm.scs.lbl.gov'
export const LOGIN_NODE = 'lrc-login.lbl.gov'
export const HOST_ALIAS = 'lrc-login'
export const LIFETIME = '12h'
export const KEY_NAME = 'lrc_cert'

export type CertPaths = { sshDir: string; certDir: string; key: string; pub: string; cert: string }

export const certPaths = (home: string): CertPaths => {
  const sshDir = `${home}/.ssh`
  const certDir = `${sshDir}/ssh_certs`
  const key = `${certDir}/${KEY_NAME}`

  return { sshDir, certDir, key, pub: `${key}.pub`, cert: `${key}-cert.pub` }
}

export const requestBody = (username: string, pin: string, otp: string): string =>
  JSON.stringify({ username, password: pin, mfa: otp, lifetime: LIFETIME })

export type CertResponse = {
  keyId: string
  publicKey: string
  privateKey: string
  signedPublicKey: string
  expiresAt: string
}

/** Reads the MSM `/v1/cert` answer; throws naming the first field missing. */
export const parseCertResponse = (text: string): CertResponse => {
  const json = JSON.parse(text) as Record<string, unknown>
  const field = (name: string): string => {
    const value = json[name]
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`response has no ${name}`)
    }

    return value.trim()
  }

  return {
    keyId: field('key_id'),
    publicKey: field('public_key'),
    privateKey: field('private_key'),
    signedPublicKey: field('signed_public_key'),
    expiresAt: field('expires_at'),
  }
}

/**
 * The end of the `Valid:` range in `ssh-keygen -L` output, as an ISO time;
 * `forever` for an unbounded cert, null when there is no such line.
 */
export const validUntil = (sshKeygenOutput: string): string | null => {
  const match = /Valid:.*\bto\s+(\S+)/.exec(sshKeygenOutput)
  const end = match?.[1]
  if (end === undefined) return null
  if (end === 'forever') return 'forever'
  // ssh-keygen prints local time without a zone, which Date reads as local.
  const at = new Date(end)

  return Number.isNaN(at.getTime()) ? null : at.toISOString()
}

export const isValidAt = (expiresAt: string | null, now: number): boolean =>
  expiresAt === 'forever' || (expiresAt !== null && new Date(expiresAt).getTime() > now)

export const timeLeft = (expiresAt: string, now: number): string => {
  const minutes = Math.max(0, Math.floor((new Date(expiresAt).getTime() - now) / 60000))
  const hours = Math.floor(minutes / 60)

  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`
}

export const localTime = (iso: string): string => {
  const at = new Date(iso)

  return Number.isNaN(at.getTime()) ? iso : at.toLocaleString()
}

export const hasHostEntry = (sshConfig: string): boolean =>
  new RegExp(`^\\s*Host\\b.*\\b${HOST_ALIAS}\\b`, 'mi').test(sshConfig)

export const hostEntry = (username: string): string =>
  `\nHost ${HOST_ALIAS} ${LOGIN_NODE}\n` +
  `    User ${username}\n` +
  `    HostName ${LOGIN_NODE}\n` +
  `    IdentityFile ~/.ssh/ssh_certs/${KEY_NAME}\n` +
  `    IdentitiesOnly yes\n`
