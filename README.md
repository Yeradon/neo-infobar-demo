# Stream Deck Neo Infobar Demo Plugin

A clean, standalone demo plugin demonstrating dynamic layouts and feedback on the **Stream Deck Neo Infobar** (232×50 px display) for OpenDeck and Elgato Stream Deck (SDK 7+).

## Features

- **Native Neo Infobar Layout**: Specifically styled for the 232×50 px display.
- **Dynamic Updates**: Demonstrates `setFeedbackLayout` and `setFeedback` updates in real-time.
- **Zero Overhead**: Simple Node.js script using WebSocket to communicate with the Stream Deck / OpenDeck host.

## Layout Specification (`layout.json`)

- Resolution: 232×50 px
- Items:
  - `title`: Header label
  - `value`: Dynamic counter / status string
  - `indicator`: Right-aligned status pill (`OK`, `LIVE`, `SYNC`)
