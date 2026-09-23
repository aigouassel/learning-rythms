import type { Voice } from '@rythmes/core'
import type { Output, PlannedEvent } from '@rythmes/engine'
import { DrumMachine, Soundfont } from 'smplr'

/**
 * Les noms d'échantillons à chercher pour chaque voix, par ordre de préférence.
 *
 * Les boîtes à rythmes de smplr ne nomment pas leurs sons de la même façon —
 * `kick` ici, `bassdrum` là. Plutôt que de parier sur un nom, on demande à
 * l'instrument ce qu'il contient et on prend le premier qui réponde. Une voix
 * sans correspondance reste muette plutôt que de sonner faux.
 */
const CANDIDATS: Record<Voice, readonly string[]> = {
  kick: ['kick', 'bassdrum', 'bass-drum', 'bd'],
  snare: ['snare', 'snaredrum', 'sd'],
  hihat: ['hihat-close', 'hihat-closed', 'closed-hihat', 'hihat', 'hh'],
  clave: ['clave', 'claves', 'rim', 'rimshot', 'stick'],
  cowbell: ['cowbell', 'bell', 'cow-bell'],
  rimshot: ['rim', 'rimshot', 'stick', 'clave'],
  melody: [],
}

export type AudioOutput = Output & {
  /** Résolue quand les échantillons sont chargés : jouer avant serait muet. */
  readonly ready: Promise<void>
  readonly unresolvedVoices: readonly Voice[]
}

/**
 * La sortie sonore : un kit de percussions, et un timbre mélodique en appoint.
 *
 * Elle ne décide de rien — elle reçoit des événements déjà datés par le
 * transport et les confie à l'instrument avec leur date. C'est ce qui permet
 * de changer de bibliothèque de son sans toucher au reste.
 */
export function audioOutput(
  ctx: AudioContext,
  options: { kit?: string; melodic?: string } = {},
): AudioOutput {
  const drums = DrumMachine(ctx, { instrument: options.kit ?? 'TR-808' })
  const melodic = Soundfont(ctx, { instrument: options.melodic ?? 'marimba' })

  const resolues = new Map<Voice, string>()
  const manquantes: Voice[] = []

  const ready = Promise.all([drums.ready, melodic.ready]).then(() => {
    const disponibles = new Set(drums.getSampleNames())
    for (const [voice, candidats] of Object.entries(CANDIDATS) as [Voice, string[]][]) {
      if (voice === 'melody') continue
      const trouve = candidats.find((c) => disponibles.has(c))
      if (trouve) resolues.set(voice, trouve)
      else manquantes.push(voice)
    }
  })

  return {
    ready,
    get unresolvedVoices() {
      return manquantes
    },

    schedule(event: PlannedEvent) {
      // L'accent est le seul écart de nuance du cours : ce qu'on enseigne, c'est
      // où l'on frappe, pas avec quelle force exacte.
      const velocity = event.accent ? 112 : 80

      if (event.voice === 'melody') {
        if (event.pitch) melodic.start({ note: event.pitch, time: event.at, velocity })
        return
      }

      const echantillon = resolues.get(event.voice)
      if (echantillon) drums.start({ note: echantillon, time: event.at, velocity })
    },
  }
}
