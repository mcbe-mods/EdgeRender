# EdgeRender

A Minecraft Bedrock addon that renders glowing edge outlines around selected blocks. Designed for programmatic use by other addons via IPC — highlight blocks per-player with smart edge culling.

> Block highlighting logic inspired by [Utilities-Vein-Miner](https://github.com/Endermen76428/Utilities-Vein-Miner)

## Features

- **Per-player outlines** — each player sees only their own block selections
- **Smart edge culling** — inner edges between adjacent selected blocks are hidden automatically; only outer edges glow
- **Glow-through-walls** — edges remain visible behind blocks using `glow_in_walls` material
- **Lighting independent** — emissive texture with `ignore_lighting` for consistent brightness
- **Zero-collision entities** — outlines don't block movement or interaction
- **IPC-driven** — simple `create` / `remove` commands via `@mcbe-mods/ipc`

## How it works

EdgeRender spawns invisible entities at each selected block position, using a custom geometry model with 12 edge bones to render only the outward-facing edges. If two adjacent blocks are both selected, the shared edge is hidden automatically.

## Usage

### For addon developers

Install the IPC library:

```bash
pnpm add @mcbe-mods/ipc
```

Then call EdgeRender from your addon:

```typescript
import type { Vector3 } from '@minecraft/server'
import { IPC } from '@mcbe-mods/ipc'
import { world } from '@minecraft/server'

const ipc = new IPC({ namespace: 'edge_render' })

// Show outlines for one or more players
const createResult = await ipc.invoke<
  { playerIds: string[], locations: Vector3[] },
  PromiseSettledResult<void>[]
>('create', {
  playerIds: [player.id],
  locations: [
    { x: 10, y: 64, z: 10 },
    { x: 11, y: 64, z: 10 },
  ]
})
for (const result of createResult) {
  if (result.status === 'rejected') {
    console.warn(result.reason)
  }
}

// Remove outlines for one or more players
const removeResult = await ipc.invoke<
  { playerIds: string[] },
  PromiseSettledResult<void>[]
>('remove', {
  playerIds: [player.id]
})
for (const result of removeResult) {
  if (result.status === 'rejected') {
    console.warn(result.reason)
  }
}

// Clear all outlines (equivalent to the old clearAll)
const clearResult = await ipc.invoke<
  { playerIds: string[] },
  PromiseSettledResult<void>[]
>('remove', {
  playerIds: world.getPlayers().map(p => p.id)
})
```

## Development

### Prerequisites

- Node.js >= 18
- pnpm (enable via `corepack enable`)
- Minecraft Bedrock 1.21.80+
- `@minecraft/server` >= 1.18.0

### Setup

```bash
pnpm install    # Install deps & auto-generate manifest.json
```

### Dev mode

```bash
pnpm dev        # Build, watch, and sync to Minecraft dev folders
```

Changes are synced to `development_behavior_packs/edge_render` and `development_resource_packs/edge_render`.

### Build

```bash
pnpm build      # Package into .mcaddon
```

Output: `pack/edge_render-0.0.1.mcaddon`

## License

[MIT](LICENSE)
