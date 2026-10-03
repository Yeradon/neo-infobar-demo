/**
 * Stream Deck Neo Sample Plugin
 *
 * Implements the official Elgato SDK v2/v3 protocol:
 * - Registers plugin via WebSocket on launch: { event: registerEvent, uuid: pluginUUID }
 * - Listens for 'willAppear'
 * - Calls setFeedbackLayout with layout JSON
 * - Updates layout items dynamically via setFeedback
 * - Responds to touchTap / dialDown
 */

const WebSocket = require("ws");

// 1. Parse CLI arguments passed by OpenDeck / Stream Deck host
const args = {};
for (let i = 2; i < process.argv.length; i += 2) {
  const key = process.argv[i].replace(/^-/, "");
  args[key] = process.argv[i + 1];
}

const port = args.port;
const pluginUUID = args.pluginUUID;
const registerEvent = args.registerEvent;

if (!port || !pluginUUID || !registerEvent) {
  console.error("Missing required launch arguments (-port, -pluginUUID, -registerEvent)");
  process.exit(1);
}

// 2. Connect to OpenDeck WebSocket server
const ws = new WebSocket(`ws://localhost:${port}`);

function send(event, context, payload) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ event, context, payload }));
  }
}

let counter = 0;
let updateInterval = null;

ws.on("open", () => {
  console.log(`[NeoDemo] Connected. Registering plugin ${pluginUUID}`);
  ws.send(JSON.stringify({ event: registerEvent, uuid: pluginUUID }));
});

ws.on("message", (raw) => {
  let msg;
  try {
    msg = JSON.parse(raw);
  } catch (err) {
    return;
  }

  const { event, context, payload } = msg;

  switch (event) {
    case "willAppear": {
      console.log(`[NeoDemo] willAppear received for context: ${context}`);

      // 1. Elgato API: Set dynamic layout for Neo Infobar
      send("setFeedbackLayout", context, {
        layout: "layout.json"
      });

      // 2. Elgato API: Set initial feedback items
      send("setFeedback", context, {
        title: "Neo Infobar Demo",
        value: `Counter: ${counter}`,
        indicator: "ACTIVE"
      });

      // Update feedback at 30 FPS (~33ms)
      if (updateInterval) clearInterval(updateInterval);
      let lastTime = Date.now();
      let frames = 0;
      let currentFps = 30;

      updateInterval = setInterval(() => {
        counter++;
        frames++;
        const now = Date.now();
        if (now - lastTime >= 1000) {
          currentFps = frames;
          frames = 0;
          lastTime = now;
        }

        const pct = counter % 100;
        send("setFeedback", context, {
          title: `Neo @ 30 FPS (${currentFps} fps)`,
          value: `Frame: ${counter} [${pct}%]`,
          indicator: counter % 2 === 0 ? "LIVE" : "SYNC"
        });
      }, 33);

      break;
    }

    case "willDisappear": {
      console.log(`[NeoDemo] willDisappear received for context: ${context}`);
      if (updateInterval) {
        clearInterval(updateInterval);
        updateInterval = null;
      }
      break;
    }
  }
});

ws.on("close", () => {
  if (updateInterval) clearInterval(updateInterval);
  process.exit(0);
});
