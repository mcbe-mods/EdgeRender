## ✨ EdgeRender — Block Outline Highlighting Library

> Glowing edge outlines for selected blocks — powered by RPC

EdgeRender is a library addon for Minecraft Bedrock that renders glowing wireframe outlines around selected blocks. Designed for other addons to use via RPC and Service Discovery, it provides per-player block highlighting with smart edge culling — inner edges between adjacent blocks are hidden automatically.

This addon does nothing by itself. It must be installed alongside other addons that support it (such as OrePop or ChopPop) to provide visual feedback.

---

### Features

- **Per-Player Outlines**: Each player sees only their own block selections
- **Smart Edge Culling**: Inner edges between adjacent selected blocks are hidden automatically — only outer edges glow
- **Glow-Through-Walls**: Edges remain visible behind blocks
- **Lighting Independent**: Emissive texture for consistent brightness in any lighting
- **Zero-Collision**: Outlines don't block movement or interaction
- **RPC-Driven**: Other addons communicate with EdgeRender via `@mcbe-mods/rpc`
- **Service Discovery**: Automatically discoverable via `@mcbe-mods/discover`

---

### Installation

1. Download the `.mcaddon` file
2. Open the file with Minecraft Bedrock Edition to import it
3. Create or edit a world, go to **Settings → Behavior Packs** and **Resource Packs**
4. Apply `EdgeRender` to both Behavior Packs and Resource Packs
5. Ensure at least one addon that supports EdgeRender (such as OrePop or ChopPop) is also installed
6. Enter the world — outlines will appear automatically when supported addons detect blocks

---

### Compatibility

- Minecraft **1.21.80** and above
- Uses stable `@minecraft/server@1.18.0`
- Requires both **Behavior Pack** and **Resource Pack** to be applied
- Achievements supported

---

### For Addon Developers

Addons can communicate with EdgeRender using `@mcbe-mods/rpc` and `@mcbe-mods/discover`:

```typescript
const rpc = new RPC({ namespace: 'edge_render' })

// Show outlines
await rpc.invoke('create', {
  playerIds: [player.id],
  locations: [{ x: 10, y: 64, z: 10 }]
})

// Remove outlines
await rpc.invoke('remove', { playerIds: [player.id] })
```

See the GitHub repository for detailed developer documentation.

---

### Related Addons

- **[OrePop](https://www.curseforge.com/minecraft-bedrock/scripts/orepop)** — Chain mine entire ore veins with outline preview
- **[ChopPop](https://www.curseforge.com/minecraft-bedrock/scripts/choppop)** — Instantly chop down entire trees with outline preview
