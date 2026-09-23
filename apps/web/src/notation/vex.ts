import { toNumber, type Fraction } from '@rythmes/core'
import type { Figure, FigureName, Written } from '@rythmes/notation'

/**
 * Les codes de durée de VexFlow.
 *
 * La bibliothèque parle en anglo-saxon — `w` pour *whole*, `q` pour *quarter* —
 * là où le cours parle en français. La traduction est confinée ici : nulle part
 * ailleurs dans l'application on ne voit passer un `'8'` pour dire une croche.
 */
const CODES: Record<FigureName, string> = {
  ronde: 'w',
  blanche: 'h',
  noire: 'q',
  croche: '8',
  double: '16',
  triple: '32',
}

/** Un silence porte le même code que la note, suffixé d'un `r`. */
export const vexDuration = (figure: Figure, rest: boolean): string =>
  CODES[figure.name] + (rest ? 'r' : '')

/** Seules les figures à crochet se ligaturent. */
export const isBeamable = (figure: Figure): boolean =>
  figure.name === 'croche' || figure.name === 'double' || figure.name === 'triple'

/** La hauteur à donner à VexFlow — la ligne unique pour la percussion. */
export const vexKeys = (event: Written): string[] =>
  event.kind === 'note' && event.pitch ? [toVexPitch(event.pitch)] : ['b/4']

/**
 * `'Eb4'` devient `'eb/4'`.
 *
 * Une simple transcription : la hauteur traverse le système sans être
 * interprétée, conformément au choix de ne pas modéliser les hauteurs.
 */
export function toVexPitch(pitch: string): string {
  const m = /^([A-Ga-g])([#b]*)(-?\d+)$/.exec(pitch)
  if (!m) throw new RangeError(`Hauteur illisible : ${pitch}`)
  return `${m[1]!.toLowerCase()}${m[2]}/${m[3]}`
}

/** La position d'un événement et sa fin, en rondes, pour le surlignage. */
export const span = (e: Written): { start: number; end: number } => ({
  start: toNumber(e.at),
  end: toNumber(e.at) + toNumber(e.duration),
})

/** Deux événements partagent-ils le même découpage irrégulier ? */
export const sameTuplet = (a: Fraction | undefined, b: Fraction | undefined): boolean =>
  a === undefined ? b === undefined : b !== undefined && a.num === b.num && a.den === b.den
