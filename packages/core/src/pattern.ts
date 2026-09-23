import { ZERO, add, compare, equals, fraction, lessThan, type Fraction } from './fraction'
import { measureLength, type Meter } from './meter'

/**
 * Les voix disponibles — le kit de percussions du cours, plus une voix
 * mélodique.
 *
 * Sans variété de timbre, le reggae et la house sonnent pareil : le timbre
 * porte une part de l'information stylistique (cadrage §5.3). `melody` est la
 * voix des exemples qui portent des hauteurs, quand un style ne se reconnaît
 * pas sans mélodie — une valse, une gigue.
 */
export type Voice = 'kick' | 'snare' | 'hihat' | 'clave' | 'cowbell' | 'rimshot' | 'melody'

/**
 * Le répertoire dont un motif est issu.
 *
 * C'est une donnée, pas une mention dans la prose (cadrage §4.3) : on peut
 * ainsi demander tous les motifs d'un style et parcourir le cours par
 * répertoire plutôt que par concept. `neutre` désigne les motifs fabriqués pour
 * la démonstration, qui ne prétendent à aucun style.
 */
export type Style =
  | 'neutre'
  | 'house'
  | 'marche'
  | 'valse'
  | 'pop'
  | 'rock'
  | 'reggae'
  | 'funk'
  | 'ska'
  | 'jazz'
  | 'blues-shuffle'
  | 'gigue'
  | 'clave'
  | 'afrobeat'
  | 'balkan'
  | 'hip-hop'

/**
 * Une attaque : un événement sonore placé dans le motif.
 *
 * `at` et `duration` sont mesurés **en rondes**, comme `measureLength`, et
 * comptés depuis le début du motif.
 *
 * La durée est explicite plutôt que déduite de l'attaque suivante. Jouer un
 * motif n'en aurait pas besoin — une percussion n'a pas de durée audible —
 * mais l'écrire l'exige : rien ne distingue une noire d'une croche suivie d'un
 * silence si l'on ne connaît que les points d'attaque. Et la déduction laisse
 * de toute façon la dernière attaque sans durée.
 *
 * Les silences n'ont pas de représentation ici. Puisque chaque attaque déclare
 * sa durée, tout intervalle non couvert **est** un silence, sans ambiguïté :
 * `notation` les reconstitue et leur donne leur figure. Le lexique dit qu'un
 * silence est une durée à part entière, et il le reste — il est simplement
 * calculé plutôt que saisi, ce qui évite d'avoir à maintenir la cohérence entre
 * des sons et des trous qui doivent pouvoir se contredire.
 */
export type Onset = {
  readonly at: Fraction
  readonly duration: Fraction
  readonly voice: Voice
  /**
   * L'appui. Nécessaire dès le module 2 pour marquer les temps forts, et
   * encore au module 5 pour le backbeat.
   *
   * Volontairement booléen : une échelle de nuances servirait la production
   * musicale, pas la pédagogie du rythme. Ce cours enseigne où l'on frappe, pas
   * avec quelle force exacte.
   */
  readonly accent?: boolean
  /**
   * La hauteur, décorative et optionnelle (cadrage §5.2).
   *
   * Une chaîne en notation scientifique — `'C4'`, `'Eb4'` — et non un numéro
   * MIDI, parce qu'un numéro impose ensuite de choisir une orthographe
   * enharmonique pour l'écrire. Ce serait modéliser les hauteurs, ce que ce
   * cours refuse de faire : ici la hauteur traverse le système sans être
   * interprétée, de la donnée vers VexFlow et smplr.
   *
   * Toujours en **son réel**, jamais en notation saxophone.
   */
  readonly pitch?: string
}

/**
 * Un motif rythmique.
 *
 * Les attaques forment **une liste plate**, chacune portant sa voix, plutôt
 * qu'une structure imbriquée par voix. Un motif est donc polyphonique par
 * construction, sans que le cas monophonique — l'immense majorité du cours —
 * ait à traverser deux niveaux.
 *
 * C'est aussi la forme dont le scheduler a besoin : il veut les événements dans
 * l'ordre du temps. Une structure par voix l'obligerait à fusionner. La vue par
 * voix, elle, n'est utile qu'à l'écriture et se calcule à la demande
 * (`onsetsOf`).
 *
 * `length` est explicite et non déduite de la dernière attaque, pour deux
 * raisons : un motif peut s'achever sur un silence, et une clave occupe deux
 * mesures sans qu'on ait à le deviner.
 */
export type Pattern = {
  readonly meter: Meter
  readonly length: Fraction
  readonly style: Style
  readonly onsets: readonly Onset[]
}

const fin = (o: Onset): Fraction => add(o.at, o.duration)

/**
 * Construit un motif en vérifiant ses invariants.
 *
 * Les attaques sont triées à la construction : le scheduler peut ensuite les
 * parcourir sans se poser de question, et deux motifs équivalents écrits dans
 * un ordre différent restent comparables.
 *
 * Une seule règle mérite d'être expliquée : **deux attaques ne peuvent pas se
 * chevaucher dans la même voix, mais le peuvent entre voix.** C'est la vérité
 * physique — on ne frappe pas deux fois la même peau au même instant — et c'est
 * aussi ce qui autorise la polyrythmie du module 7, où deux voix se
 * superposent précisément parce qu'elles ne partagent pas la même division.
 */
export function pattern(spec: {
  meter: Meter
  onsets: readonly Onset[]
  length?: Fraction
  style?: Style
}): Pattern {
  const { meter, onsets } = spec
  const length = spec.length ?? measureLength(meter)

  if (!lessThan(ZERO, length)) {
    throw new RangeError('Un motif a une longueur strictement positive')
  }

  for (const o of onsets) {
    if (!lessThan(ZERO, o.duration)) {
      throw new RangeError(`Une attaque a une durée strictement positive (voix ${o.voice})`)
    }
    if (compare(o.at, ZERO) < 0 || !lessThan(o.at, length)) {
      throw new RangeError(`Une attaque tombe hors du motif (voix ${o.voice})`)
    }
    if (compare(fin(o), length) > 0) {
      throw new RangeError(`Une attaque dépasse la fin du motif (voix ${o.voice})`)
    }
  }

  const triees = [...onsets].sort(
    (a, b) => compare(a.at, b.at) || a.voice.localeCompare(b.voice),
  )

  for (let i = 1; i < triees.length; i++) {
    const precedente = triees[i - 1]!
    const courante = triees[i]!
    if (precedente.voice === courante.voice && compare(fin(precedente), courante.at) > 0) {
      throw new RangeError(
        `Deux attaques se chevauchent dans la voix ${courante.voice} ; ` +
          'le chevauchement n’est légitime qu’entre voix différentes',
      )
    }
  }

  return { meter, length, style: spec.style ?? 'neutre', onsets: triees }
}

/** Les attaques d'une seule voix, dans l'ordre. Vue d'écriture. */
export const onsetsOf = (p: Pattern, voice: Voice): readonly Onset[] =>
  p.onsets.filter((o) => o.voice === voice)

/**
 * Les voix effectivement employées, dans l'ordre de leur première attaque —
 * les égalités étant départagées par ordre alphabétique, comme au tri.
 */
export const voicesOf = (p: Pattern): readonly Voice[] => [
  ...new Set(p.onsets.map((o) => o.voice)),
]

/**
 * Combien de mesures le motif occupe.
 *
 * Renvoie une fraction, et non un entier : un motif peut s'arrêter au milieu
 * d'une mesure, et l'arrondir masquerait une erreur de saisie.
 */
export const measureCount = (p: Pattern): Fraction =>
  fraction(p.length.num * measureLength(p.meter).den, p.length.den * measureLength(p.meter).num)

/** Le motif remplit-il un nombre entier de mesures ? */
export const isWellFormed = (p: Pattern): boolean => measureCount(p).den === 1

/**
 * Deux motifs sont-ils le même ?
 *
 * Comparaison structurelle, possible seulement parce que les positions sont des
 * fractions normalisées et que les attaques sont triées à la construction.
 * C'est la base de la correction symbolique : corriger une dictée, c'est
 * répondre à cette question.
 */
export function sameRhythm(a: Pattern, b: Pattern): boolean {
  if (!equals(a.length, b.length)) return false
  if (a.onsets.length !== b.onsets.length) return false

  return a.onsets.every((o, i) => {
    const autre = b.onsets[i]!
    return (
      equals(o.at, autre.at) &&
      equals(o.duration, autre.duration) &&
      o.voice === autre.voice &&
      (o.accent ?? false) === (autre.accent ?? false)
    )
  })
}
