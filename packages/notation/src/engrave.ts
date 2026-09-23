import {
  ZERO,
  add,
  compare,
  equals,
  fraction,
  isCompound,
  lessThan,
  measureLength,
  onsetsOf,
  sub,
  type Fraction,
  type Meter,
  type Onset,
  type Pattern,
  type Voice,
} from '@rythmes/core'
import { FIGURE_NAMES, figure, figureDuration, figureFor, type Figure } from './figure'

/**
 * La durée de chaque temps de la mesure, dans l'ordre.
 *
 * Trois cas, et c'est le même tableau qui les couvre tous :
 *  - une mesure simple a des temps égaux — 4/4 donne quatre quarts ;
 *  - une mesure composée groupe ses unités par trois — 6/8 donne deux temps
 *    de trois croches, et non six temps ;
 *  - une mesure asymétrique suit son groupement — 7/8 en 2+2+3 donne trois
 *    temps inégaux, ce qui est exactement ce qu'on y entend.
 */
export function beatDivisions(m: Meter): readonly Fraction[] {
  if (m.grouping) return m.grouping.map((g) => fraction(g, m.unit))
  if (isCompound(m)) return Array.from({ length: m.beats / 3 }, () => fraction(3, m.unit))
  return Array.from({ length: m.beats }, () => fraction(1, m.unit))
}

/** Les instants où un temps commence, du début du motif jusqu'à sa fin incluse. */
export function beatStarts(p: Pattern): readonly Fraction[] {
  const divisions = beatDivisions(p.meter)
  const starts: Fraction[] = []
  let t: Fraction = ZERO

  for (let i = 0; lessThan(t, p.length); i++) {
    starts.push(t)
    t = add(t, divisions[i % divisions.length]!)
  }
  starts.push(p.length)
  return starts
}

export type Written =
  | {
      readonly kind: 'note'
      readonly figure: Figure
      readonly at: Fraction
      readonly duration: Fraction
      /** Une liaison de prolongation vers l'événement suivant. */
      readonly tied: boolean
      readonly accent?: boolean
      readonly pitch?: string
    }
  | {
      readonly kind: 'rest'
      readonly figure: Figure
      readonly at: Fraction
      readonly duration: Fraction
    }

/** Un temps et ce qu'il contient — l'unité de ligature. */
export type Beat = {
  readonly at: Fraction
  readonly duration: Fraction
  readonly events: readonly Written[]
}

export type EngravedVoice = {
  readonly voice: Voice
  readonly beats: readonly Beat[]
}

const contains = (bornes: readonly Fraction[], t: Fraction): boolean =>
  bornes.some((b) => equals(b, t))

/** La plus longue figure qui tienne dans la durée restante. */
function largestFitting(duration: Fraction): Figure | null {
  let best: Figure | null = null

  for (const name of FIGURE_NAMES) {
    for (const dots of [0, 1, 2] as const) {
      const candidate = figure(name, dots)
      const d = figureDuration(candidate)
      if (compare(d, duration) > 0) continue
      if (!best || compare(d, figureDuration(best)) > 0) best = candidate
    }
  }
  return best
}

/**
 * Exprimer une durée en figures successives, liées entre elles.
 *
 * Une seule figure suffit le plus souvent. Quand aucune ne convient — cinq
 * doubles, par exemple — on prend la plus longue qui tienne et on recommence
 * sur le reste. Les morceaux sont reliés par une liaison de prolongation :
 * une seule attaque, plusieurs signes.
 */
function decompose(duration: Fraction): readonly { figure: Figure; duration: Fraction }[] {
  const pieces: { figure: Figure; duration: Fraction }[] = []
  let reste = duration

  while (compare(reste, ZERO) > 0) {
    const exacte = figureFor(reste)
    if (exacte) {
      pieces.push({ figure: exacte, duration: reste })
      break
    }

    const plusGrande = largestFitting(reste)
    if (!plusGrande) {
      throw new RangeError(
        `Aucune figure ne tient dans ${reste.num}/${reste.den} de ronde : ` +
          'la durée est plus brève que la triple croche',
      )
    }
    pieces.push({ figure: plusGrande, duration: figureDuration(plusGrande) })
    reste = sub(reste, figureDuration(plusGrande))
  }

  return pieces
}

/**
 * Découper une **note** aux frontières de temps qu'elle traverse.
 *
 * C'est ici que vit la règle du module 4 : **la notation doit rendre les temps
 * visibles à l'œil**. Une note qui chevauche un temps sans le montrer force le
 * lecteur à compter au lieu de voir.
 *
 * Avec une exception, et elle est nécessaire : une note qui **commence sur un
 * temps et s'achève sur un temps** ne cache rien — une blanche au premier temps
 * d'un 4/4 se lit sans effort, et la découper en deux noires liées serait
 * illisible. Seules les notes qui entrent dans un temps par le milieu sont
 * découpées ; c'est ainsi que naît l'écriture de la syncope, liaison comprise.
 *
 * Cette tolérance ne vaut que pour les notes. Un silence, lui, se découpe à
 * chaque temps (voir `splitRest`) : trois temps de silence écrits d'un seul
 * signe cacheraient précisément ce que la notation doit montrer.
 *
 * Seconde exception, celle des découpages irréguliers : une noire de triolet
 * dure un sixième de ronde et **traverse le temps par construction** — c'est
 * sa définition même, trois notes dans la place de deux. La découper la
 * détruirait. Dès qu'une figure unique existe et qu'elle porte un tuplet, on
 * la garde entière.
 *
 * Simplification assumée : la hiérarchie interne de la mesure n'est pas
 * modélisée. Une blanche pointée commençant au deuxième temps d'un 4/4 passe
 * ici, alors qu'une gravure stricte préférerait montrer le troisième temps.
 * Le cours n'écrit pas ce cas ; le durcir maintenant serait spéculatif.
 */
function splitOnBeats(
  at: Fraction,
  duration: Fraction,
  bornes: readonly Fraction[],
  mesure: Fraction,
): readonly { at: Fraction; duration: Fraction }[] {
  const fin = add(at, duration)

  // La barre de mesure passe avant tout le reste.
  //
  // La tolérance ci-dessous — une note qui part d'un temps et retombe sur un
  // temps garde un seul signe — vaut à l'intérieur d'une mesure et nulle part
  // ailleurs. Une note qui part du quatrième temps et finit au premier de la
  // mesure suivante commence et finit bien sur des temps : sans cette
  // coupure, elle s'écrivait d'une seule blanche à cheval sur la barre, une
  // figure qui n'existe pas. C'est exactement le cas où la liaison de
  // prolongation est obligatoire, et non décorative.
  const barres: Fraction[] = []
  for (let b = mesure; compare(b, fin) < 0; b = add(b, mesure)) {
    if (compare(b, at) > 0) barres.push(b)
  }

  if (barres.length > 0) {
    const morceaux: { at: Fraction; duration: Fraction }[] = []
    let curseur = at
    for (const coupure of [...barres, fin]) {
      morceaux.push(...splitOnBeats(curseur, sub(coupure, curseur), bornes, mesure))
      curseur = coupure
    }
    return morceaux
  }

  if (contains(bornes, at) && contains(bornes, fin)) return [{ at, duration }]
  if (figureFor(duration)?.tuplet) return [{ at, duration }]

  const coupures = bornes.filter((b) => compare(b, at) > 0 && compare(b, fin) < 0)
  const morceaux: { at: Fraction; duration: Fraction }[] = []
  let curseur = at

  for (const c of [...coupures, fin]) {
    morceaux.push({ at: curseur, duration: sub(c, curseur) })
    curseur = c
  }
  return morceaux
}

/**
 * Découper un **silence**, qui n'a pas droit à la tolérance des notes.
 *
 * Deux règles, dans cet ordre :
 *
 *  1. une mesure entièrement vide s'écrit d'une seule pause — la figure de la
 *     ronde — quel que soit le chiffrage. C'est la convention : le signe ne dit
 *     alors plus une durée mais « cette mesure ne se joue pas », et un 3/4 vide
 *     porte donc une pause bien qu'il ne dure pas une ronde ;
 *  2. partout ailleurs, on coupe à chaque temps, pour que la pulsation reste
 *     lisible à travers le silence.
 */
function splitRest(
  at: Fraction,
  duration: Fraction,
  bornes: readonly Fraction[],
  mesure: Fraction,
): readonly { at: Fraction; duration: Fraction; wholeMeasure: boolean }[] {
  const morceaux: { at: Fraction; duration: Fraction; wholeMeasure: boolean }[] = []
  const fin = add(at, duration)
  let t = at

  const surDebutDeMesure = (x: Fraction): boolean => {
    const mesures = fraction(x.num * mesure.den, x.den * mesure.num)
    return mesures.den === 1
  }

  while (compare(t, fin) < 0) {
    if (surDebutDeMesure(t) && compare(add(t, mesure), fin) <= 0) {
      morceaux.push({ at: t, duration: mesure, wholeMeasure: true })
      t = add(t, mesure)
      continue
    }

    const prochaine = bornes.find((b) => compare(b, t) > 0) ?? fin
    const stop = compare(prochaine, fin) < 0 ? prochaine : fin
    morceaux.push({ at: t, duration: sub(stop, t), wholeMeasure: false })
    t = stop
  }

  return morceaux
}

/** Les intervalles couverts par une voix, notes et silences en alternance. */
function spans(p: Pattern, voice: Voice): readonly { onset: Onset | null; at: Fraction; duration: Fraction }[] {
  const res: { onset: Onset | null; at: Fraction; duration: Fraction }[] = []
  let curseur: Fraction = ZERO

  for (const o of onsetsOf(p, voice)) {
    if (compare(o.at, curseur) > 0) {
      res.push({ onset: null, at: curseur, duration: sub(o.at, curseur) })
    }
    res.push({ onset: o, at: o.at, duration: o.duration })
    curseur = add(o.at, o.duration)
  }

  if (compare(p.length, curseur) > 0) {
    res.push({ onset: null, at: curseur, duration: sub(p.length, curseur) })
  }
  return res
}

/**
 * Graver une voix : ce qu'il faut écrire, temps par temps.
 *
 * Le découpage en temps n'est pas cosmétique — c'est l'unité de ligature. Des
 * croches se relient à l'intérieur d'un temps et se séparent d'un temps à
 * l'autre, ce qui est précisément ce qui rend la pulsation lisible.
 */
export function engraveVoice(p: Pattern, voice: Voice): EngravedVoice {
  const bornes = beatStarts(p)
  const mesure = measureLength(p.meter)
  const ecrits: Written[] = []

  for (const span of spans(p, voice)) {
    if (!span.onset) {
      for (const morceau of splitRest(span.at, span.duration, bornes, mesure)) {
        // Une mesure vide porte une pause, quelle que soit sa durée réelle.
        const pieces = morceau.wholeMeasure
          ? [{ figure: figure('ronde'), duration: morceau.duration }]
          : decompose(morceau.duration)
        let t = morceau.at
        for (const piece of pieces) {
          ecrits.push({ kind: 'rest', figure: piece.figure, at: t, duration: piece.duration })
          t = add(t, piece.duration)
        }
      }
      continue
    }

    const morceaux = splitOnBeats(span.at, span.duration, bornes, mesure)

    morceaux.forEach((morceau, indexMorceau) => {
      const pieces = decompose(morceau.duration)
      let t = morceau.at

      pieces.forEach((piece, indexPiece) => {
        const dernierDuMorceau = indexPiece === pieces.length - 1
        const dernierDuSpan = indexMorceau === morceaux.length - 1

        ecrits.push({
          kind: 'note',
          figure: piece.figure,
          at: t,
          duration: piece.duration,
          tied: !(dernierDuMorceau && dernierDuSpan),
          ...(span.onset!.accent !== undefined ? { accent: span.onset!.accent } : {}),
          ...(span.onset!.pitch !== undefined ? { pitch: span.onset!.pitch } : {}),
        })
        t = add(t, piece.duration)
      })
    })
  }

  return { voice, beats: groupByBeat(ecrits, bornes) }
}

function groupByBeat(ecrits: readonly Written[], bornes: readonly Fraction[]): readonly Beat[] {
  const beats: Beat[] = []

  for (let i = 0; i < bornes.length - 1; i++) {
    const debut = bornes[i]!
    const fin = bornes[i + 1]!
    beats.push({
      at: debut,
      duration: sub(fin, debut),
      events: ecrits.filter((e) => compare(e.at, debut) >= 0 && compare(e.at, fin) < 0),
    })
  }
  return beats
}

/** Graver toutes les voix d'un motif. */
export const engrave = (p: Pattern): readonly EngravedVoice[] =>
  [...new Set(p.onsets.map((o) => o.voice))].map((v) => engraveVoice(p, v))
