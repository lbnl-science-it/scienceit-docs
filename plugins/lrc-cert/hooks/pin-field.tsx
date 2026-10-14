import type { ClientModule } from 'claude-code'

// The PIN box. The built-in Input has no password mode, so this region takes
// the keys itself, draws one `*` per character, and posts the PIN to the
// hooks module (never to the model). It sits in the same label column as the
// built-in Username and OTP boxes, one row tall like them.

type PinState = { pin: string; isFocused: boolean }

// Printable text only: a typed character, or a pasted run of them. Multi-letter
// lowercase names (`tab`, `up`, `pageup`) are special keys, not text.
const isText = (key: string) =>
  key.length > 0 && !/[\u0000-\u001f\u007f]/.test(key) && !(key.length > 1 && /^[a-z]+$/.test(key))

const PinField: ClientModule<null, PinState> = (_props, surface) => {
  const { Text } = surface.elements

  if (surface.state === undefined) {
    surface.onKey(({ key, ctrl, meta }) => {
      const pin = surface.state?.pin ?? ''

      if (key === 'return') {
        surface.post({ pin, isSubmit: true })
        return
      }

      let next = pin
      if (key === 'backspace' || key === 'delete') {
        next = pin.slice(0, -1)
      } else if (ctrl === true && key === 'u') {
        next = ''
      } else if (ctrl !== true && meta !== true && isText(key)) {
        next = pin + key
      } else {
        return
      }

      surface.setState({ pin: next, isFocused: true })
      surface.post({ pin: next })
    })
    surface.onPointer(({ type }) => {
      if (type === 'down') surface.setState({ pin: surface.state?.pin ?? '', isFocused: true })
    })
    surface.setState({ pin: '', isFocused: false })
  }

  const pin = surface.state?.pin ?? ''
  const isFocused = surface.state?.isFocused === true
  const body = pin === '' && !isFocused ? 'click here, then type your PIN' : `${'*'.repeat(pin.length)}${isFocused ? '▏' : ''}`
  const width = Math.max(surface.columns, body.length)

  return (
    <Text underline color={isFocused ? 'claude' : pin === '' ? 'subtle' : undefined}>
      {body.padEnd(width)}
    </Text>
  )
}

export default PinField
