import {
  div,
  fraction,
  measureLength,
  mul,
  toNumber,
  type Fraction,
  type Pattern,
  type Voice,
} from '@rythmes/core'
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
  /**
   * Les mesures de décompte avant que le motif ne commence.
   *
   * Un exercice de frappe sans décompte est injouable : la première attaque
   * tombe pendant qu'on lâche encore la souris, et rien n'a donné la pulsation
   * sur laquelle se placer. Le décompte bat au tempo — une frappe par figure de
   * référence, donc deux en 6/8 quand le tempo est en noires pointées, et non
   * six.
   *
   * Il déplace `origin`, qui reste l'instant où le motif commence : la
   * correction n'a pas à savoir qu'un décompte a eu lieu.
   */
  readonly countIn?: number
  readonly countInVoice?: Voice
  /**
   * Le motif est placé sur l'horloge mais ne sonne pas.
   *
   * C'est le déchiffrage : on lit, on frappe, et rien ne souffle la réponse.
   * Le transport doit malgré tout connaître les attaques, puisque c'est lui qui
   * dit où elles étaient attendues — vider le motif de ses attaques le
   * rendrait muet *et* amnésique. Le décompte, lui, sonne toujours : c'est ce
   * qui donne le tempo qu'on va devoir tenir seule.
   */
  readonly silent?: boolean
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
    countIn = 0,
    countInVoice = 'rimshot',
    silent = false,
    onCycle,
    onStop,
  } = options

  const dureeCycle = secondsFor(pattern.length, tempo)
  const dates = pattern.onsets.map((o) => secondsFor(o.at, tempo))

  const mesure = measureLength(pattern.meter)
  const dureeMesure = secondsFor(mesure, tempo)
  const dureeBattement = secondsFor(tempo.per, tempo)
  // Combien de fois la figure du tempo entre dans une mesure. Arrondi parce
  // qu'un chiffrage inhabituel peut ne pas tomber juste — mieux vaut un
  // décompte d'un battement de trop qu'une boucle sur une fraction.
  const battements = Math.max(1, Math.round(toNumber(div(mesure, tempo.per))))

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

      // En déchiffrage on avance sans faire sonner : la progression des cycles
      // et l'arrêt en fin de motif restent identiques, seul le son manque.
      if (!silent) {
        output.schedule({
          at,
          voice: onset.voice,
          accent: onset.accent ?? false,
          ...(onset.pitch !== undefined ? { pitch: onset.pitch } : {}),
          position: onset.at,
          cycle,
        })
      }
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
      const depart = clock.now() + leadMs / 1000
      origine = depart + countIn * dureeMesure
      index = 0
      cycle = 0

      // Le décompte est placé d'un coup, sans passer par l'horizon glissant.
      // Il dure une ou deux secondes et sa dernière date est connue dès le
      // départ : lui appliquer le lookahead ne protégerait de rien, puisqu'il
      // n'y a pas de suite à approvisionner.
      for (let m = 0; m < countIn; m += 1) {
        for (let b = 0; b < battements; b += 1) {
          output.schedule({
            at: depart + m * dureeMesure + b * dureeBattement,
            voice: countInVoice,
            // Le premier battement de chaque mesure porte l'appui : c'est ce
            // qui fait entendre le cycle, et pas seulement la vitesse.
            accent: b === 0,
            position: mul(tempo.per, fraction(b)),
            // Négatif : le décompte est en amont du motif, et `positionAt` le
            // laisse déjà hors du curseur en refusant les instants d'avant
            // l'origine.
            cycle: m - countIn,
          })
        }
      }

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
