# EdgeRender

A Minecraft Bedrock addon that renders glowing edge outlines around selected blocks. Designed for programmatic use by other addons via RPC + Service Discovery — highlight blocks per-player with smart edge culling.

> Block highlighting logic inspired by [Utilities-Vein-Miner](https://github.com/Endermen76428/Utilities-Vein-Miner)

## Features

- **Per-player outlines** — each player sees only their own block selections
- **Smart edge culling** — inner edges between adjacent selected blocks are hidden automatically; only outer edges glow
- **Glow-through-walls** — edges remain visible behind blocks using `glow_in_walls` material
- **Lighting independent** — emissive texture with `ignore_lighting` for consistent brightness
- **Zero-collision entities** — outlines don't block movement or interaction
- **RPC-driven, optionally discoverable** — `create` / `remove` commands via `@mcbe-mods/rpc`, auto-discoverable via `@mcbe-mods/discover`

## How it works

EdgeRender spawns invisible entities at each selected block position, using a custom geometry model with 12 edge bones to render only the outward-facing edges. If two adjacent blocks are both selected, the shared edge is hidden automatically.

## Usage

### For addon developers

Install the required libraries:

```bash
pnpm add @mcbe-mods/rpc @mcbe-mods/discover
```

### Option A: Direct RPC call (quick but risky)

If you know EdgeRender is installed, just invoke directly:

```typescript
import type { Vector3 } from '@minecraft/server'
import { RPC } from '@mcbe-mods/rpc'

const rpc = new RPC({ namespace: 'edge_render' })

// Show outlines for one or more players
const result = await rpc.invoke<
  { playerIds: string[]; locations: Vector3[] },
  PromiseSettledResult<void>[]
>('create', {
  playerIds: [player.id],
  locations: [
    { x: 10, y: 64, z: 10 },
    { x: 11, y: 64, z: 10 },
  ]
})

// Remove outlines for one or more players
await rpc.invoke('remove', { playerIds: [player.id] })

// Clear all outlines
await rpc.invoke('remove', {
  playerIds: world.getPlayers().map(p => p.id)
})
```

> **Caveat**: If EdgeRender is not installed, `invoke` will time out — you can't tell whether the service is missing or just slow.

### Option B: Via service discovery (recommended)

Discover the service first, then invoke safely:

```typescript
import type { Vector3 } from '@minecraft/server'
import { RPC } from '@mcbe-mods/rpc'
import { Discover } from '@mcbe-mods/discover'
import { system, world } from '@minecraft/server'

const discover = new Discover()
const rpc = new RPC({ namespace: 'edge_render' })

// Wait for EdgeRender service to be available
const serviceReady = new Promise<void>((resolve, reject) => {
  const cancel = discover.query('edge_render.service', (event) => {
    if (event.type === 'service-resolved') {
      cancel()
      resolve()
    }
  })
  // Timeout after 10 seconds (200 ticks)
  system.runTimeout(() => {
    cancel()
    reject(new Error('EdgeRender service not found — is the addon installed?'))
  }, 200)
})

try {
  await serviceReady
  const result = await rpc.invoke('create', {
    playerIds: [player.id],
    locations: [{ x: 10, y: 64, z: 10 }]
  })
}
catch (e) {
  console.warn('EdgeRender unavailable, skipping outline:', e.message)
  // Graceful fallback — your addon can still work without outlines
}
```

> **Benefit**: Discovery confirms EdgeRender is actually running. If not found, you can show a user-friendly message or fall back gracefully, instead of waiting for a timeout.

## Development

### Prerequisites

- Node.js >= 18
- pnpm (enable via `corepack enable`)
- Minecraft Bedrock 1.21.80+
- `@minecraft/server` >= 1.18.0

### Setup

```bash
pnpm install
```

### Dev mode

```bash
pnpm dev        # Build, watch, and sync to Minecraft dev folders
```

### Dev mode with sync

```bash
pnpm devsync    # Dev mode with auto-sync to development packs
```

### Build

```bash
pnpm build      # Build addon package
```

## License

[MIT](LICENSE)
