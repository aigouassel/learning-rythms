import type { Clock } from '@rythmes/engine'

/**
 * L'horloge du transport, branchée sur le contexte audio.
 *
 * `ctx.currentTime` est la seule référence fiable pour placer un son : c'est
 * l'échelle sur laquelle le matériel audio raisonne. `setInterval`, lui, ne
 * sert qu'à réveiller le planificateur — son imprécision n'a aucune
 * conséquence, puisqu'il ne fait sonner personne.
 */
export const webAudioClock = (ctx: BaseAudioContext): Clock => ({
  now: () => ctx.currentTime,
  every(intervalMs, tick) {
    const id = window.setInterval(tick, intervalMs)
    return () => window.clearInterval(id)
  },
})

/**
 * Le pont entre l'horloge des événements du navigateur et celle de l'audio.
 *
 * Le `timeStamp` d'un `KeyboardEvent` est exprimé sur `performance.now()`, en
 * millisecondes depuis le chargement de la page. `ctx.currentTime` compte des
 * secondes depuis la création du contexte audio. Les deux avancent à la même
 * vitesse mais n'ont pas la même origine : comparer une frappe à une attaque
 * sans convertir donnerait un écart de plusieurs secondes, et personne ne
 * penserait à chercher l'erreur là.
 *
 * On relève les deux au même instant, une fois, et l'écart entre elles ne
 * bouge plus.
 */
export function clockBridge(ctx: BaseAudioContext): (performanceMs: number) => number {
  const ancreAudio = ctx.currentTime
  const ancrePerformance = performance.now()
  return (performanceMs) => ancreAudio + (performanceMs - ancrePerformance) / 1000
}

/**
 * La latence de sortie annoncée par le navigateur, en secondes.
 *
 * C'est une part du biais constant que la calibration de l'unité 0 mesurera —
 * la part que le navigateur sait nommer. Le reste (le trajet de la frappe, le
 * temps de réaction) ne se déduit pas : il se mesure.
 */
export const outputLatency = (ctx: AudioContext): number =>
  ctx.outputLatency || ctx.baseLatency || 0
