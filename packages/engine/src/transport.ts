import { toNumber, type Fraction, type Pattern, type Voice } from '@rythmes/core'
import type { Clock } from './clock'
import { secondsFor, type Tempo } from './tempo'

/**
 * Une attaque placée sur l'horloge, prête à sonner.
 *
 * `position` et `cycle` ne servent pas au son mais à l'écran : ils disent quel
 * signe allumer, et à quel passage de la boucle on en est.
 */
export type PlannedEvent = {
  readonly at: number
  readonly voice: Voice
  readonly accent: boolean
  readonly pitch?: string
  readonly position: Fraction
  readonly cycle: number
}

/** Ce qui fait sonner — une sortie audio, ou un simple espion dans un test. */
export type Output = {
  schedule(event: PlannedEvent): void
}

export type TransportOptions = {
  readonly clock: Clock
  readonly output: Output
  readonly pattern: Pattern
  readonly tempo: Tempo
  /**
   * De combien on prend de l'avance, en millisecondes.
   *
   * Le réveil est imprécis et peut être retardé par le thread principal ; il
   * faut donc avoir placé les sons d'un peu plus loin que l'intervalle entre
   * deux réveils, sans quoi un retard se traduirait par un trou audible.
   */
  readonly lookaheadMs?: number
  /** L'intervalle entre deux réveils. */
  readonly intervalMs?: number
  readonly loop?: boolean
  /** Le délai avant la première attaque, pour ne pas la placer dans le passé. */
  readonly leadMs?: number
  readonly onCycle?: (cycle: number) => void
  readonly onStop?: () => void
}

export type Transport = {
  start(): void
  stop(): void
  readonly running: boolean
  /**
   * L'instant, sur l'horloge, où le motif a commencé.
   *
   * C'est la référence dont la correction a besoin : sans elle, on ne peut pas
   * dire à quelle seconde une attaque était attendue, donc pas mesurer un
   * écart. Vaut zéro tant que rien n'a démarré.
   */
  readonly origin: number
  /** Les instants où les attaques tombent, sur `cycles` passages. */
  expectedTimes(cycles: number): readonly number[]
  /**
   * Où en est la lecture, en rondes depuis le début du motif.
   *
   * En flottant, et c'est voulu : cette valeur sert à déplacer un curseur à
   * l'écran, pas à décider d'une durée.
   */
  positionAt(seconds: number): { cycle: number; at: number } | null
}

/**
 * Le transport : un planificateur à horizon glissant.
 *
 * Le principe tient en une phrase — **un réveil imprécis place des sons sur une
 * horloge précise**. `setInterval` et consorts dérivent : ils dépendent du
 * thread principal, du ramasse-miettes, de l'onglet qui passe en arrière-plan.
 * Un dixième de seconde de retard sur un réveil est sans importance ; dix
 * millisecondes de décalage sur une attaque s'entendent.
 *
 * Alors on ne fait jamais sonner depuis le réveil. À chaque réveil, on regarde
 * un peu devant soi et on confie à l'horloge audio tout ce qui doit se produire
 * dans cet horizon. Le réveil peut trembler : les sons, eux, ont déjà une date.
 *
 * Voir « A Tale of Two Clocks » (Chris Wilson) :
 * https://web.dev/articles/audio-scheduling
 */
export function transport(options: TransportOptions): Transport {
  const {
    clock,
    output,
    pattern,
    tempo,
    lookaheadMs = 100,
    intervalMs = 25,
    loop = true,
    leadMs = 50,
    onCycle,
    onStop,
  } = options

  const dureeCycle = secondsFor(pattern.length, tempo)
  const dates = pattern.onsets.map((o) => secondsFor(o.at, tempo))

  let origine = 0
  let index = 0
  let cycle = 0
  let arreter: (() => void) | null = null

  const tick = (): void => {
    // Un motif sans attaque n'a rien à approvisionner, et le faire tourner
    // ferait avancer les cycles sans fin.
    if (pattern.onsets.length === 0) return

    const horizon = clock.now() + lookaheadMs / 1000

    for (;;) {
      if (index >= pattern.onsets.length) {
        if (!loop) {
          stop()
          return
        }
        cycle += 1
        index = 0
        onCycle?.(cycle)
      }

      const onset = pattern.onsets[index]!
      const at = origine + cycle * dureeCycle + dates[index]!
      if (at > horizon) return

      output.schedule({
        at,
        voice: onset.voice,
        accent: onset.accent ?? false,
        ...(onset.pitch !== undefined ? { pitch: onset.pitch } : {}),
        position: onset.at,
        cycle,
      })
      index += 1
    }
  }

  function stop(): void {
    if (!arreter) return
    arreter()
    arreter = null
    onStop?.()
  }

  return {
    start() {
      if (arreter) return
      origine = clock.now() + leadMs / 1000
      index = 0
      cycle = 0
      arreter = clock.every(intervalMs, tick)
      // Un premier approvisionnement immédiat : attendre le premier réveil
      // retarderait le début d'autant.
      tick()
    },

    stop,

    get running() {
      return arreter !== null
    },

    get origin() {
      return origine
    },

    expectedTimes(cycles) {
      return Array.from({ length: cycles }, (_, c) =>
        dates.map((d) => origine + c * dureeCycle + d),
      ).flat()
    },

    positionAt(seconds) {
      if (!arreter && seconds < origine) return null
      const ecoule = seconds - origine
      if (ecoule < 0) return null

      const c = Math.floor(ecoule / dureeCycle)
      const dansLeCycle = ecoule - c * dureeCycle
      const longueur = toNumber(pattern.length)
      return { cycle: c, at: (dansLeCycle / dureeCycle) * longueur }
    },
  }
}
