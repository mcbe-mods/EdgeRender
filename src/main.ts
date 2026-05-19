import type { Player, Vector3 } from '@minecraft/server'
import { IPC } from '@mcbe-mods/ipc'
import { system, world } from '@minecraft/server'

const ENTITY_ID = 'edge_render:selected'

function removeOutline(player: Player) {
  const entities = player.dimension.getEntities({
    type: ENTITY_ID,
    tags: [`edge_render_owner:${player.id}`],
  })
  for (const entity of entities) {
    entity.remove()
  }
}

function fv(d1e: boolean, d2e: boolean, de: boolean) {
  return (d1e && d2e) || (d1e && !d2e && de) || (!d1e && d2e && de) ? 1 : 0
}

function showOutline(player: Player, locations: Vector3[]) {
  removeOutline(player)

  const locationSet = new Set(locations.map(l => `${l.x},${l.y},${l.z}`))
  const i = (x: number, y: number, z: number) => locationSet.has(`${x},${y},${z}`)

  for (const loc of locations) {
    const { x, y, z } = loc
    const n = i(x, y, z - 1)
    const s = i(x, y, z + 1)
    const e = i(x + 1, y, z)
    const w = i(x - 1, y, z)
    const u = i(x, y + 1, z)
    const d = i(x, y - 1, z)

    let expr = 'v.show=true;'
    expr += `v.visible_ne=${fv(!n, !e, i(x + 1, y, z - 1))};`
    expr += `v.visible_nw=${fv(!n, !w, i(x - 1, y, z - 1))};`
    expr += `v.visible_se=${fv(!s, !e, i(x + 1, y, z + 1))};`
    expr += `v.visible_sw=${fv(!s, !w, i(x - 1, y, z + 1))};`
    expr += `v.visible_bn=${fv(!n, !d, i(x, y - 1, z - 1))};`
    expr += `v.visible_tn=${fv(!n, !u, i(x, y + 1, z - 1))};`
    expr += `v.visible_bs=${fv(!s, !d, i(x, y - 1, z + 1))};`
    expr += `v.visible_ts=${fv(!s, !u, i(x, y + 1, z + 1))};`
    expr += `v.visible_be=${fv(!e, !d, i(x + 1, y - 1, z))};`
    expr += `v.visible_bw=${fv(!w, !d, i(x - 1, y - 1, z))};`
    expr += `v.visible_te=${fv(!e, !u, i(x + 1, y + 1, z))};`
    expr += `v.visible_tw=${fv(!w, !u, i(x - 1, y + 1, z))};`

    const entity = player.dimension.spawnEntity(ENTITY_ID, {
      x: x + 0.5,
      y: y + 0.5,
      z: z + 0.5,
    })
    entity.addTag(`edge_render_owner:${player.id}`)

    system.runTimeout(() => {
      // Compatible with versions 1.18.x - 2.x.x
      const isValidMethod = typeof entity.isValid === 'function'
      const isValid = isValidMethod
        ? (entity as any).isValid()
        : entity.isValid
      const players: any[] = isValidMethod
        ? [player.name]
        : [player]

      if (isValid) {
        entity.playAnimation('animation.edge_render.selected.edges', {
          players,
          nextState: 'none',
          stopExpression: expr,
        })
      }
    }, 2)
  }
}

function forEachPlayer(playerIds: string[], fn: (player: Player) => void): Promise<void>[] {
  const playerMap = new Map(world.getPlayers().map(p => [p.id, p]))
  return playerIds.map(playerId => {
    const player = playerMap.get(playerId)
    if (!player) return Promise.reject(new Error(`Player not found: ${playerId}`))
    try {
      fn(player)
      return Promise.resolve()
    } catch (e) {
      return Promise.reject(e)
    }
  })
}

const ipc = new IPC({ namespace: 'edge_render' })

ipc.handle('create', (data: { playerIds: string[], locations: Vector3[] }) => {
  return Promise.allSettled(forEachPlayer(data.playerIds, player => showOutline(player, data.locations)))
})

ipc.handle('remove', (data: { playerIds: string[] }) => {
  return Promise.allSettled(forEachPlayer(data.playerIds, player => removeOutline(player)))
})
