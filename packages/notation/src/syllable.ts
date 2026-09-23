import type { EngravedVoice, Written } from './engrave'
import type { FigureName } from './figure'

/**
 * Les syllabes rythmiques, troisième représentation d'un même objet.
 *
 * Entre le son et le symbole écrit, dire *ta ti-ti ta* est une marche
 * intermédiaire : plus abstraite que le son, plus accessible que la portée.
 * Elles ne servent qu'au **module 3**, celui où la notation apparaît, et
 * disparaissent ensuite — les maintenir en ferait une béquille qui dispenserait
 * de lire (cadrage §3.2).
 *
 * Plusieurs adaptations françaises de la méthode Kodály coexistent et divergent
 * au-delà du socle commun. Le cours en fixe une, arbitrairement mais
 * explicitement, et s'y tient : c'est la cohérence qui compte, pas le choix.
 */
const SYLLABES: Partial<Record<FigureName, string>> = {
  ronde: 'ta-a-a-a',
  blanche: 'ta-a',
  noire: 'ta',
  croche: 'ti',
  // La double croche dépend de son rang dans le temps : ti-ka-ti-ka.
}

export type Syllabized = {
  readonly event: Written
  /** `null` quand il n'y a rien à prononcer — voir `syllabize`. */
  readonly syllable: string | null
}

/**
 * Associer une syllabe à chaque événement écrit.
 *
 * `null` signifie « rien à prononcer », pour trois raisons qui se rejoignent :
 *
 *  - un **silence** ne se dit pas ; la méthode lui réserve un geste muet ;
 *  - la **suite d'une liaison** ne se redit pas : une seule attaque, donc une
 *    seule syllabe, portée par le premier signe ;
 *  - une figure **pointée ou en découpage irrégulier** sort du vocabulaire du
 *    module 3. Ce n'est pas une lacune : le point arrive au module 5 et le
 *    triolet au module 6, quand les syllabes ne sont plus là.
 */
export function syllabize(voice: EngravedVoice): readonly Syllabized[] {
  const out: Syllabized[] = []
  let precedentLie = false

  for (const beat of voice.beats) {
    let rangDouble = 0

    for (const event of beat.events) {
      const prononcable =
        event.kind === 'note' && !precedentLie && event.figure.dots === 0 && !event.figure.tuplet

      const syllable = !prononcable
        ? null
        : event.figure.name === 'double'
          ? rangDouble % 2 === 0
            ? 'ti'
            : 'ka'
          : (SYLLABES[event.figure.name] ?? null)

      if (event.kind === 'note' && event.figure.name === 'double') rangDouble++

      out.push({ event, syllable })
      precedentLie = event.kind === 'note' && event.tied
    }
  }

  return out
}

/** La lecture parlée d'une voix : « ta ti ti ta ». */
export const spoken = (voice: EngravedVoice): string =>
  syllabize(voice)
    .map((s) => s.syllable)
    .filter((s): s is string => s !== null)
    .join(' ')
