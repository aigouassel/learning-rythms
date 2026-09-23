import { measureLength, toNumber, type Meter } from '@rythmes/core'
import type { EngravedVoice, Written } from '@rythmes/notation'
import { useEffect, useRef } from 'react'
import {
  BarNote,
  Beam,
  Dot,
  Formatter,
  Renderer,
  Stave,
  StaveNote,
  StaveTie,
  Tuplet,
  Voice,
} from 'vexflow'
import { isBeamable, span, vexDuration, vexKeys } from './vex'

export type StaffViewProps = {
  readonly voice: EngravedVoice
  readonly meter: Meter
  /** Cinq lignes et des hauteurs, ou la ligne unique du rythme pur. */
  readonly pitched?: boolean
  /** Une syllabe par événement écrit, dans l'ordre. `null` : rien à dire. */
  readonly syllables?: readonly (string | null)[]
  /** La position lue, en rondes. `null` quand rien ne joue. */
  readonly position?: number | null
}

type Rendu = {
  readonly start: number
  readonly end: number
  readonly element: SVGElement
}

/**
 * La notation d'une voix, dessinée par VexFlow.
 *
 * Deux effets séparés, et la séparation compte : le dessin est coûteux et ne
 * dépend que de la musique ; le surlignage change soixante fois par seconde et
 * ne touche qu'un attribut de style. Les mêler ferait redessiner la portée à
 * chaque image.
 */
export function StaffView({ voice, meter, pitched, syllables, position }: StaffViewProps) {
  const hote = useRef<HTMLDivElement>(null)
  const rendus = useRef<Rendu[]>([])
  const allume = useRef<SVGElement | null>(null)

  useEffect(() => {
    const div = hote.current
    if (!div) return
    div.innerHTML = ''
    rendus.current = []

    const evenements = voice.beats.flatMap((b) => b.events)
    if (evenements.length === 0) return

    const mesures = Math.max(1, Math.ceil(toNumber(voice.beats.at(-1)!.at) + 0.001))
    const largeur = 120 + mesures * 260
    const hauteur = (pitched ? 130 : 110) + (syllables ? 30 : 0)

    const renderer = new Renderer(div, Renderer.Backends.SVG)
    renderer.resize(largeur, hauteur)
    const ctx = renderer.getContext()

    const portee = new Stave(10, pitched ? 10 : 30, largeur - 30)
    if (!pitched) portee.setNumLines(1)
    portee.addTimeSignature(`${meter.beats}/${meter.unit}`)
    portee.setContext(ctx).draw()

    const notes = evenements.map((e) => {
      const note = new StaveNote({
        keys: vexKeys(e),
        duration: vexDuration(e.figure, e.kind === 'rest'),
        ...(pitched ? {} : { clef: 'percussion' }),
      })
      if (e.figure.dots > 0) Dot.buildAndAttach([note], { all: true })
      return note
    })

    const voix = new Voice({ numBeats: meter.beats, beatValue: meter.unit })
    voix.setMode(Voice.Mode.SOFT)
    voix.addTickables(avecBarres(evenements, notes, measureLength(meter)))

    const ligatures = beamsParTemps(voice, evenements, notes)
    const liaisons = liaisonsDeProlongation(evenements, notes)
    const decoupages = tuplets(evenements, notes)

    new Formatter().joinVoices([voix]).format([voix], largeur - 160)
    voix.draw(ctx, portee)
    for (const b of ligatures) b.setContext(ctx).draw()
    for (const t of decoupages) t.setContext(ctx).draw()
    for (const l of liaisons) l.setContext(ctx).draw()

    rendus.current = evenements.flatMap((e, i) => {
      const element = notes[i]!.getSVGElement()
      return element ? [{ ...span(e), element }] : []
    })

    if (syllables) dessinerSyllabes(div, notes, syllables, hauteur)
  }, [voice, meter, pitched, syllables])

  useEffect(() => {
    const courant =
      position === null || position === undefined
        ? null
        : (rendus.current.find((r) => position >= r.start && position < r.end)?.element ?? null)

    if (courant === allume.current) return
    allume.current?.classList.remove('sonne')
    courant?.classList.add('sonne')
    allume.current = courant
  }, [position])

  return <div className="portee" ref={hote} />
}

/**
 * Les ligatures, une par suite de figures à crochet **à l'intérieur d'un temps**.
 *
 * C'est le geste qui rend la pulsation lisible : des croches se relient dans le
 * temps et se séparent d'un temps à l'autre. Un silence rompt la suite — on ne
 * ligature pas par-dessus un trou.
 */
function beamsParTemps(
  voice: EngravedVoice,
  evenements: readonly Written[],
  notes: readonly StaveNote[],
): Beam[] {
  const beams: Beam[] = []
  let curseur = 0

  for (const temps of voice.beats) {
    let suite: StaveNote[] = []

    const fermer = () => {
      if (suite.length > 1) beams.push(new Beam(suite))
      suite = []
    }

    for (const e of temps.events) {
      const note = notes[curseur++]!
      if (e.kind === 'note' && isBeamable(e.figure)) suite.push(note)
      else fermer()
    }
    fermer()
  }
  void evenements
  return beams
}

/** Les liaisons de prolongation : une seule attaque, plusieurs signes. */
function liaisonsDeProlongation(
  evenements: readonly Written[],
  notes: readonly StaveNote[],
): StaveTie[] {
  const liaisons: StaveTie[] = []

  evenements.forEach((e, i) => {
    const suivante = notes[i + 1]
    if (e.kind === 'note' && e.tied && suivante) {
      liaisons.push(new StaveTie({ firstNote: notes[i]!, lastNote: suivante }))
    }
  })
  return liaisons
}

/**
 * Les découpages irréguliers — le triolet et son crochet chiffré.
 *
 * Le regroupement se fait sur toute la voix, **pas temps par temps** : une
 * noire de triolet dure un sixième de ronde et chevauche un temps par nature.
 * Chercher les triolets à l'intérieur des temps les couperait en deux.
 */
function tuplets(evenements: readonly Written[], notes: readonly StaveNote[]): Tuplet[] {
  const res: Tuplet[] = []
  let suite: StaveNote[] = []
  let courant: { count: number; inSpaceOf: number } | null = null

  const fermer = () => {
    if (courant && suite.length > 1) {
      res.push(new Tuplet(suite, { numNotes: courant.count, notesOccupied: courant.inSpaceOf }))
    }
    suite = []
    courant = null
  }

  evenements.forEach((e, i) => {
    const t = e.figure.tuplet
    if (!t) {
      fermer()
      return
    }
    if (courant && (courant.count !== t.count || courant.inSpaceOf !== t.inSpaceOf)) fermer()
    courant = { count: t.count, inSpaceOf: t.inSpaceOf }
    suite.push(notes[i]!)
  })
  fermer()
  return res
}

/**
 * Glisser une barre de mesure à chaque nouvelle mesure.
 *
 * Un motif de deux mesures — une clave, par exemple — sans barre au milieu
 * serait illisible : on ne verrait plus le cycle, qui est justement ce que la
 * clave organise.
 */
function avecBarres(
  evenements: readonly Written[],
  notes: readonly StaveNote[],
  mesure: ReturnType<typeof measureLength>,
): (StaveNote | BarNote)[] {
  const longueurMesure = toNumber(mesure)
  const tickables: (StaveNote | BarNote)[] = []
  let mesureCourante = 0

  evenements.forEach((e, i) => {
    const numero = Math.floor(toNumber(e.at) / longueurMesure + 1e-9)
    if (numero > mesureCourante) {
      tickables.push(new BarNote())
      mesureCourante = numero
    }
    tickables.push(notes[i]!)
  })
  return tickables
}

/**
 * Les syllabes, posées sous chaque note.
 *
 * En HTML plutôt qu'en SVG : c'est du texte de lecture, pas de la notation, et
 * le distinguer visuellement est voulu — la syllabe est un tremplin, pas un
 * signe musical de plus.
 */
function dessinerSyllabes(
  hote: HTMLDivElement,
  notes: readonly StaveNote[],
  syllables: readonly (string | null)[],
  hauteur: number,
): void {
  const calque = document.createElement('div')
  calque.className = 'syllabes'

  syllables.forEach((s, i) => {
    const note = notes[i]
    if (!s || !note) return
    const bulle = document.createElement('span')
    bulle.textContent = s
    bulle.style.left = `${note.getAbsoluteX()}px`
    bulle.style.top = `${hauteur - 22}px`
    calque.appendChild(bulle)
  })

  hote.appendChild(calque)
}
