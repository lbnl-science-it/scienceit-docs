import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { CertView } from '../types'
import {
  HOST_ALIAS,
  MSM_HOST,
  certPaths,
  hasHostEntry,
  hostEntry,
  isValidAt,
  localTime,
  parseCertResponse,
  requestBody,
  timeLeft,
  validUntil,
} from './cert'

const PANE = 'lrc-cert'
// The label column, so the three text boxes line up.
const LABEL_WIDTH = 10

const view = atom({ plugin: 'lrc-cert', key: 'view' } as const, {
  phase: 'idle',
  message: '',
  attempt: 0,
  expiresAt: null,
  username: '',
} satisfies CertView)

const openPane = ($: EngineInterface) =>
  $.ui.open({ id: PANE, title: 'Lawrencium SSH cert', focus: true, closeOnEscape: true, rows: 26 })

// The secrets live only here, in this module's memory, for one attempt:
// never in $.state, $.store, the transcript or the model's context.
let username = ''
let pin = ''
let otp = ''
let isBusy = false

function clearSecrets() {
  pin = ''
  otp = ''
}

async function home($: EngineInterface): Promise<string> {
  const value = await $.env.get('HOME')
  if (value === undefined) throw new Error('HOME is not set')

  return value
}

/** Writes `text` to `path` with `mode`, created under umask 077 so a key is never readable by others. */
async function writeFile($: EngineInterface, path: string, text: string, mode: string) {
  const { exitCode, stderr } = await $.process.run(
    ['/bin/sh', '-c', 'umask 077 && mkdir -p "$(dirname "$1")" && cat > "$1" && chmod "$2" "$1"', 'sh', path, mode],
    { stdin: text },
  )
  if (exitCode !== 0) throw new Error(`could not write ${path}: ${stderr.trim()}`)
}

/** The current cert's expiry from `ssh-keygen -L`, or null with no (readable) cert. */
async function readExpiry($: EngineInterface): Promise<string | null> {
  const { cert } = certPaths(await home($))
  if (!(await $.fs.exists(cert))) return null
  const { exitCode, stdout } = await $.process.run(['ssh-keygen', '-L', '-f', cert])

  return exitCode === 0 ? validUntil(stdout) : null
}

async function showStatus($: EngineInterface) {
  const { expiresAt } = await read($, view)
  const now = await $.clock.now()
  if (expiresAt === null) {
    $.ui.status(undefined)
  } else if (expiresAt === 'forever') {
    $.ui.status('LRC cert: valid')
  } else if (isValidAt(expiresAt, now)) {
    $.ui.status(`LRC cert: ${timeLeft(expiresAt, now)} left`)
  } else {
    $.ui.status('LRC cert: expired, /lrc-cert')
  }
}

async function refreshExpiry($: EngineInterface) {
  const expiresAt = await readExpiry($).catch(() => null)
  await update($, view, v => ({ ...v, expiresAt }))
  await showStatus($)
}

async function ensureSshConfig($: EngineInterface, user: string): Promise<boolean> {
  const config = `${await home($)}/.ssh/config`
  const text = (await $.fs.exists(config)) ? await $.fs.read(config) : ''
  if (hasHostEntry(text)) return false
  const { exitCode, stderr } = await $.process.run(
    ['/bin/sh', '-c', 'umask 077 && cat >> "$1"', 'sh', config],
    { stdin: hostEntry(user) },
  )
  if (exitCode !== 0) throw new Error(`could not update ${config}: ${stderr.trim()}`)

  return true
}

async function fail($: EngineInterface, message: string) {
  clearSecrets()
  await update($, view, v => ({ ...v, phase: 'error' as const, message, attempt: v.attempt + 1 }))
}

async function requestCert($: EngineInterface) {
  if (isBusy) return
  const user = username.trim()
  if (user === '' || pin === '' || otp.trim() === '') {
    await update($, view, v => ({
      ...v,
      phase: 'error' as const,
      message: 'Enter your username, PIN and OTP.',
    }))
    return
  }

  isBusy = true
  await update($, view, v => ({ ...v, phase: 'requesting' as const, message: 'Requesting cert…', username: user }))
  try {
    const response = await $.http.fetch(`${MSM_HOST}/v1/cert`, {
      method: 'POST',
      // The same request `curl -d` makes in request_cert.sh.
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: requestBody(user, pin, otp.trim()),
    })
    clearSecrets()

    if (response.status !== 201) {
      const detail = response.text.trim().slice(0, 300)
      await fail($, `Auth failed (status ${response.status})${detail ? `: ${detail}` : ''}`)
      return
    }

    const cert = parseCertResponse(response.text)
    const paths = certPaths(await home($))
    await $.process.run(['mkdir', '-p', paths.certDir])
    await $.process.run(['chmod', '700', paths.sshDir])
    await writeFile($, paths.key, `${cert.privateKey}\n`, '600')
    await writeFile($, paths.pub, `${cert.publicKey}\n`, '644')
    await writeFile($, paths.cert, `${cert.signedPublicKey}\n`, '644')
    const isConfigAdded = await ensureSshConfig($, user)
    await $.store.set('username', user)

    const expiresAt = (await readExpiry($).catch(() => null)) ?? cert.expiresAt
    await update($, view, v => ({
      ...v,
      phase: 'ok' as const,
      message:
        `Key ${cert.keyId} saved to ${paths.key}. Expires ${localTime(expiresAt)}.` +
        (isConfigAdded ? ` Added "Host ${HOST_ALIAS}" to ~/.ssh/config.` : ''),
      attempt: v.attempt + 1,
      expiresAt,
    }))
    await showStatus($)
    $.ui.toast(`LRC cert ready: ssh ${HOST_ALIAS}`)
  } catch (error) {
    await fail($, `Request failed: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    isBusy = false
  }
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'lrc-cert',
      description: 'Get a 12h Lawrencium SSH certificate for lrc-login (asks for PIN + OTP)',
      argumentHint: '[status]',
    })
    const saved = await $.store.get('username')
    if (typeof saved === 'string' && saved !== '') {
      username = saved
      await update($, view, v => ({ ...v, username: saved }))
    }
    await refreshExpiry($)
    $.clock.every(60_000, () => showStatus($))

    return next(e)
  })

  on('command.run', { command: 'lrc-cert' }, async ($, e) => {
    await refreshExpiry($)
    const { expiresAt } = await read($, view)
    const now = await $.clock.now()
    const summary = isValidAt(expiresAt, now)
      ? `Lawrencium cert is valid until ${localTime(expiresAt ?? '')}.`
      : expiresAt === null
        ? 'No Lawrencium cert yet.'
        : 'Lawrencium cert has expired.'

    if (e.args.trim() === 'status') return { text: summary }

    await openPane($)

    return { text: `${summary} Opened the certificate pane.` }
  })

  // The PIN field's keystrokes, posted from ./pin-field.tsx.
  on('ui.message', async ($, e, next) => {
    if (!e.element.startsWith('pin-')) return next(e)
    const data = e.data as { pin?: unknown; isSubmit?: unknown }
    if (typeof data.pin === 'string') pin = data.pin
    if (data.isSubmit === true) void requestCert($)

    return {}
  })

  on('ui.close', { id: PANE }, async ($, e, next) => {
    clearSecrets()

    return next(e)
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button, Markdown } = $.ui.resolve(e)
    const v = await read($, view)
    const now = await $.clock.now()
    const isRequesting = v.phase === 'requesting'
    const certLine = isValidAt(v.expiresAt, now)
      ? `Current cert valid until ${localTime(v.expiresAt ?? '')} (${v.expiresAt === 'forever' ? 'no expiry' : `${timeLeft(v.expiresAt ?? '', now)} left`}).`
      : v.expiresAt === null
        ? 'No certificate saved yet.'
        : 'Current certificate has expired.'
    const messageColor = v.phase === 'error' ? 'error' : v.phase === 'ok' ? 'success' : 'subtle'

    if (e.surface === 'mobile') {
      return (
        <Box flexDirection="column">
          <Text>{certLine}</Text>
          <Text dimColor>Open /lrc-cert on desktop or in a terminal to enter your PIN and OTP.</Text>
        </Box>
      )
    }

    const { Input } = $.ui.resolve(e)
    // Built-in text boxes for Username and OTP. They have no password mode, so
    // the PIN is a region of our own that draws `*`s (./pin-field.tsx); VS Code
    // draws no such region, so there the PIN is a built-in box shown as typed.
    // A new `attempt` draws fresh, empty boxes after every request.
    const pinBox =
      e.surface === 'vscode' ? (
        <Input
          key={`pin-${v.attempt}`}
          placeholder="PIN (shown as typed in VS Code)"
          value={pin}
          onInput={value => {
            pin = value
          }}
          onSubmit={value => {
            pin = value
          }}
        />
      ) : (
        (() => {
          const { Client } = $.ui.resolve(e)

          return <Client key={`pin-${v.attempt}`} module="./pin-field.tsx" props={null} height={1} flexGrow={1} />
        })()
      )
    const form = (
      <Box flexDirection="column" rowGap={1}>
        <Box alignItems="center">
          <Box width={LABEL_WIDTH} flexShrink={0}>
            <Text bold>Username</Text>
          </Box>
          <Box flexGrow={1}>
            <Input
              key={`user-${v.attempt}`}
              placeholder="LRC username"
              value={username || v.username}
              autoFocus
              onInput={value => {
                username = value
              }}
              onSubmit={value => {
                username = value
              }}
            />
          </Box>
        </Box>
        <Box alignItems="center">
          <Box width={LABEL_WIDTH} flexShrink={0}>
            <Text bold>PIN</Text>
          </Box>
          <Box flexGrow={1}>
            {pinBox}
          </Box>
        </Box>
        <Box alignItems="center">
          <Box width={LABEL_WIDTH} flexShrink={0}>
            <Text bold>OTP</Text>
          </Box>
          <Box flexGrow={1}>
            <Input
              key={`otp-${v.attempt}`}
              placeholder="one-time password"
              value={otp}
              submitLabel="get cert"
              onInput={value => {
                otp = value
              }}
              onSubmit={value => {
                otp = value
                void requestCert($)
              }}
            />
          </Box>
        </Box>
      </Box>
    )

    return (
      <Box flexDirection="column" rowGap={1} paddingX={1}>
        <Markdown text="## Lawrencium SSH certificate" />
        <Box flexDirection="column">
          <Text>12-hour certificate for {HOST_ALIAS}</Text>
          <Text dimColor>{certLine}</Text>
        </Box>
        {form}
        <Box columnGap={2}>
          <Button
            key="request"
            variant="primary"
            label={isRequesting ? 'Requesting…' : 'Get certificate'}
            onPress={() => requestCert($)}
          />
          <Button key="close" role="dismiss" label="Close" onPress={() => $.ui.close({ id: PANE })} />
        </Box>
        {v.message !== '' && (
          <Text color={messageColor} bold>
            {v.message}
          </Text>
        )}
        <Text dimColor>Then connect with: ssh {HOST_ALIAS}</Text>
      </Box>
    )
  })
}
