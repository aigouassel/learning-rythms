import type { Voice } from '@rythmes/core'
import type { Output, PlannedEvent } from '@rythmes/engine'
import { DrumMachine, Soundfont } from 'smplr'

/**
 * Les **groupes** d'échantillons à chercher pour chaque voix, par préférence.
 *
 * Une boîte à rythmes range ses sons par famille, et chaque famille contient
 * des variantes : le kit TR-808 propose vingt-cinq grosses caisses, de
 * `kick/bd0000` à `kick/bd7575`, qui diffèrent par la tenue et la couleur. Le
 * nom qu'on cherche est donc celui du **groupe** — `kick` —, jamais celui d'un
 * échantillon.
 *
 * C'est l'erreur que j'avais commise : chercher `kick` parmi les noms complets
 * ne donnait rien, et toutes les voix restaient silencieuses. Les kits ne
 * nomment pas leurs familles de la même façon non plus, d'où cette liste de
 * candidats — mais on interroge l'instrument au lieu de parier.
 */
const CANDIDATS: Record<Voice, readonly string[]> = {
  kick: ['kick', 'bassdrum', 'bass-drum', 'bd'],
  snare: ['snare', 'snaredrum', 'sd'],
  hihat: ['hihat-close', 'hihat-closed', 'closed-hihat', 'hihat', 'hh'],
  clave: ['clave', 'claves', 'stick', 'rimshot', 'rim'],
  cowbell: ['cowbell', 'bell', 'cow-bell'],
  rimshot: ['rimshot', 'rim', 'stick', 'clave'],
  melody: [],
}

/**
 * On joue le **groupe**, jamais une variante précise.
 *
 * J'avais d'abord choisi la variante du milieu, en me disant que les extrêmes
 * d'un kit sont caricaturaux. Mauvaise idée : sur le TR-808, `snare/sd2525`
 * est déclarée par l'instrument mais ne produit aucun son, et toute la caisse
 * claire du cours était muette — alors que `snare/sd0000` et le groupe `snare`
 * fonctionnent.
 *
 * Désigner le groupe laisse l'instrument choisir lui-même sa variante par
 * défaut. C'est plus simple, et surtout ça ne parie sur rien : une liste de
 * variantes n'est pas une promesse que chacune sonne.
 */

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
    const groupes = new Set(drums.getGroupNames())
    const index = new Set(drums.getSampleNames())

    for (const [voice, candidats] of Object.entries(CANDIDATS) as [Voice, string[]][]) {
      if (voice === 'melody') continue

      // D'abord par groupe, ce qui est la façon dont un kit s'organise ; à
      // défaut par nom complet, au cas où un kit n'aurait pas de familles.
      const trouve = candidats.find((c) => groupes.has(c)) ?? candidats.find((c) => index.has(c))

      if (trouve) resolues.set(voice, trouve)
      else manquantes.push(voice)
    }

    // Une voix sans correspondance reste muette — ce qui vaut mieux que de
    // sonner faux, mais devient invisible si on n'en dit rien. Le silence est
    // un échec plus difficile à diagnostiquer qu'une erreur.
    if (manquantes.length > 0) {
      console.warn(
        `[rythmes] Voix sans échantillon : ${manquantes.join(', ')}.\n` +
          `Le kit « ${options.kit ?? 'TR-808'} » propose les groupes : ` +
          drums.getGroupNames().join(', '),
      )
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
