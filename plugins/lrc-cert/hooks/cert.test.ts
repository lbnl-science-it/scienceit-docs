import { expect, mock, test } from 'claude-code/testing'

import {
  certPaths,
  hasHostEntry,
  hostEntry,
  isValidAt,
  parseCertResponse,
  requestBody,
  timeLeft,
  validUntil,
} from './cert'

const PANE = { component: 'Pane', requestId: 'lrc-cert' } as const
const PANE_PROPS = { title: 'Lawrencium SSH cert', isFocused: true, bodyColumns: 80, placement: 'inline', scroll: { offset: 0, bodyRows: 14 }, view: {} } as const

test('request body is the JSON request_cert.sh sends, safely escaped', async () => {
  expect(JSON.parse(requestBody('alice', 'p"in\\', '123456'))).toEqual({
    username: 'alice',
    password: 'p"in\\',
    mfa: '123456',
    lifetime: '12h',
  })
})

test('paths match the lrc preset', async () => {
  expect(certPaths('/Users/a')).toEqual({
    sshDir: '/Users/a/.ssh',
    certDir: '/Users/a/.ssh/ssh_certs',
    key: '/Users/a/.ssh/ssh_certs/lrc_cert',
    pub: '/Users/a/.ssh/ssh_certs/lrc_cert.pub',
    cert: '/Users/a/.ssh/ssh_certs/lrc_cert-cert.pub',
  })
})

test('parses the MSM answer and trims each field', async () => {
  const cert = parseCertResponse(
    JSON.stringify({
      key_id: ' abc ',
      public_key: 'ssh-ed25519 AAAA\n',
      private_key: '-----BEGIN OPENSSH PRIVATE KEY-----\nx\n-----END OPENSSH PRIVATE KEY-----\n',
      signed_public_key: 'ssh-ed25519-cert-v01@openssh.com AAAA',
      expires_at: '2026-10-14T09:00:00+00:00',
    }),
  )
  expect(cert.keyId).toBe('abc')
  expect(cert.publicKey).toBe('ssh-ed25519 AAAA')
  expect(() => parseCertResponse('{"key_id":"x"}')).toThrow()
})

test('reads the expiry from ssh-keygen -L and judges validity', async () => {
  const out = '        Valid: from 2026-10-13T09:00:00 to 2026-10-13T21:00:00\n'
  const until = validUntil(out)
  expect(until).toBe(new Date('2026-10-13T21:00:00').toISOString())
  expect(isValidAt(until, new Date('2026-10-13T20:00:00').getTime())).toBe(true)
  expect(isValidAt(until, new Date('2026-10-13T22:00:00').getTime())).toBe(false)
  expect(timeLeft(until ?? '', new Date('2026-10-13T08:30:00').getTime())).toBe('12h 30m')
  expect(validUntil('        Valid: forever')).toBe(null)
  expect(validUntil('        Valid: from 2026-10-13T09:00:00 to forever')).toBe('forever')
  expect(isValidAt(null, 0)).toBe(false)
})

test('ssh config entry is added once', async () => {
  expect(hasHostEntry('')).toBe(false)
  expect(hasHostEntry(hostEntry('alice'))).toBe(true)
  expect(hasHostEntry('Host lrc-login\n  User bob\n')).toBe(true)
  expect(hasHostEntry('Host other\n  HostName lrc-login.lbl.gov\n')).toBe(false)
  expect(hostEntry('alice')).toContain('IdentityFile ~/.ssh/ssh_certs/lrc_cert')
})

test('pane shows the form and refuses an empty request', async ($, on) => {
  mock.clock(on, { now: Date.parse('2026-10-13T12:00:00Z') })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'lrc-cert', surface, ...PANE, props: PANE_PROPS })
    expect(await ui.find({ key: 'user-0' })).toBeDefined()
    expect(await ui.find({ key: 'otp-0' })).toBeDefined()
    expect(await ui.find({ key: 'pin-0' })).toBeDefined()
    await ui.press({ key: 'request' })
    expect(await ui.find({ type: 'Text', text: /Enter your username, PIN and OTP/ })).toBeDefined()
    await ui.unmount()
  }
})

test('the PIN field shows only stars', async ($, on) => {
  mock.clock(on, { now: Date.parse('2026-10-13T12:00:00Z') })
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'lrc-cert', surface, ...PANE, props: PANE_PROPS })
    // Each request redraws the boxes empty under a new suffix (`pin-1`, ...).
    const pinKey = (await ui.find({ type: 'Client' }))?.key ?? 'pin-0'
    const suffix = pinKey.slice('pin-'.length)
    for (const key of ['1', '2', '3', '4']) await ui.key({ key, in: pinKey })
    await ui.key({ key: 'backspace', in: pinKey })
    expect(await ui.find({ in: pinKey, text: /^\*\*\*▏/ })).toBeDefined()
    expect(await ui.find({ in: pinKey, text: /[0-9]/ })).toBeUndefined()

    // The PIN reached the hooks module: with all three filled the pane goes
    // past its "enter your PIN" check (the kit has no network, so it fails there).
    await ui.input({ key: `user-${suffix}`, text: 'alice', kind: 'change' })
    await ui.input({ key: `otp-${suffix}`, text: '123456', kind: 'change' })
    await ui.press({ key: 'request' })
    expect(await ui.find({ type: 'Text', text: /Enter your username, PIN and OTP/ })).toBeUndefined()
    await ui.unmount()
  }
})
