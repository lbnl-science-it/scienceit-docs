# lrc-cert

A Claude Code plugin that gets a 12-hour SSH certificate for the Lawrencium
login node (`lrc-login.lbl.gov`). It does what `request_cert.sh -p lrc` does,
from a pane inside Claude Code.

## Install

In a terminal:

```
claude plugin marketplace add lbnl-science-it/scienceit-docs
claude plugin install lrc-cert@scienceit-docs
```

Already inside Claude Code? Run the same commands with `/plugin` in place of
`claude plugin`, then `/reload-plugins`.

## Use

- `/lrc-cert` opens the pane. Enter your username, PIN and OTP, then press
  Enter in the OTP box or click **Get certificate**.
- `/lrc-cert status` says whether your current certificate is still valid.
- The status line shows the time left on the certificate.
- Then connect with `ssh lrc-login`.

The pane needs an interactive session (the terminal, or the Claude desktop
app). The PIN box shows `*` for each character: click it before typing, since
Tab moves between the Username and OTP boxes only. In VS Code the PIN box is a
plain text box and the PIN is visible while you type it.

## What it changes on your machine

- Writes `~/.ssh/ssh_certs/lrc_cert` (private key, mode 600),
  `lrc_cert.pub` and `lrc_cert-cert.pub`, and sets `~/.ssh` to mode 700.
- Adds a `Host lrc-login lrc-login.lbl.gov` entry to `~/.ssh/config` if there
  is none.
- Remembers your username for next time.

Your PIN and OTP are sent only to `https://msm.scs.lbl.gov/v1/cert`. They are
kept in memory for that one request, never written to disk, and never shown to
Claude.

## Platforms

macOS and Linux. Native Windows is not supported yet: the plugin writes files
with `/bin/sh` and expects `HOME` to be set.

## Development

```
claude --plugin-dir plugins/lrc-cert
claude plugin validate plugins/lrc-cert
claude plugin test plugins/lrc-cert
```
