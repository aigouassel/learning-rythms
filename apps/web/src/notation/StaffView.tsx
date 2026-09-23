import { measureLength, toNumber, type Meter } from '@rythmes/core'
import type { EngravedVoice, Written } from '@rythmes/notation'
import { useEffect, useRef } from 'react'
import {
  BarNote,
  Beam,
  Dot,
  Formatter,
  Renderer,
  type RenderContext,
  Stave,
  StaveNote,
  StaveTie,
  Tuplet,
  Voice,
} from 'vexflow'
import { isBeamable, span, vexDuration, vexKeys } from './vex'

export type StaffViewProps = {
  /** Toutes les voix du motif, gravées ensemble. */
  readonly voices: readonly EngravedVoice[]
  readonly meter: Meter
  /** Cinq lignes et des hauteurs, ou la ligne unique du rythme pur. */
  readonly pitched?: boolean
  /** Par voix, une syllabe par événement écrit. `null` : rien à dire. */
  readonly syllables?: readonly (readonly (string | null)[])[]
  /** La position lue, en rondes. `null` quand rien ne joue. */
  readonly position?: number | null
}

type Rendu = {
  readonly start: number
  readonly end: number
  readonly element: SVGElement
}

/**
 * La notation d'un motif, dessinée par VexFlow.
 *
 * **Toutes les voix dans un seul dessin**, et c'est la raison d'être de ce
 * composant. Une portée par `<svg>` paraissait plus simple, jusqu'à ce que les
 * barres de mesure deviennent visibles : chaque voix était alors formatée pour
 * elle-même, et ses barres tombaient où son propre contenu le voulait. Une
 * grosse caisse qui joue deux notes et un charleston qui en joue seize se
 * retrouvaient avec des mesures de largeurs différentes, empilées — illisible
 * sur un cours dont le sujet est justement de lire.
 *
 * `joinVoices` règle la question : il aligne les voix sur leurs positions
 * communes, donc sur leurs barres.
 *
 * Deux effets séparés, et la séparation compte : le dessin est coûteux et ne
 * dépend que de la musique ; le surlignage change soixante fois par seconde et
 * ne touche qu'un attribut de style. Les mêler ferait redessiner la portée à
 * chaque image.
 */
export function StaffView({ voices, meter, pitched, syllables, position }: StaffViewProps) {
  const hote = useRef<HTMLDivElement>(null)
  const rendus = useRef<Rendu[]>([])
  const allumes = useRef<SVGElement[]>([])

  useEffect(() => {
    const div = hote.current
    if (!div) return
    div.innerHTML = ''
    rendus.current = []

    const parVoix = voices
      .map((v) => ({ voix: v, evenements: v.beats.flatMap((b) => b.events) }))
      .filter((v) => v.evenements.length > 0)
    if (parVoix.length === 0) return

    const mesures = Math.max(
      1,
      ...parVoix.map((v) => Math.ceil(toNumber(v.voix.beats.at(-1)!.at) + 0.001)),
    )
    const largeur = 120 + mesures * 260
    const hauteurVoix = (pitched ? 130 : 110) + (syllables ? 30 : 0)
    const hauteur = hauteurVoix * parVoix.length

    const renderer = new Renderer(div, Renderer.Backends.SVG)
    renderer.resize(largeur, hauteur)
    const ctx = renderer.getContext()

    const dessins = parVoix.map(({ voix, evenements }, index) => {
      const portee = new Stave(10, (pitched ? 10 : 30) + index * hauteurVoix, largeur - 30)
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

      const vexVoix = new Voice({ numBeats: meter.beats, beatValue: meter.unit })
      vexVoix.setMode(Voice.Mode.SOFT)
      const tickables = avecBarres(evenements, notes, measureLength(meter))
      vexVoix.addTickables(tickables)

      return {
        voix,
        evenements,
        notes,
        portee,
        vexVoix,
        tickables,
        ligatures: beamsParTemps(voix, evenements, notes),
        liaisons: liaisonsDeProlongation(evenements, notes),
        decoupages: tuplets(evenements, notes),
      }
    })

    const vexVoix = dessins.map((d) => d.vexVoix)
    new Formatter().joinVoices(vexVoix).format(vexVoix, largeur - 160)

    for (const d of dessins) {
      d.vexVoix.draw(ctx, d.portee)
      dessinerBarres(ctx, d.portee, d.tickables, pitched === true)
      for (const b of d.ligatures) b.setContext(ctx).draw()
      for (const t of d.decoupages) t.setContext(ctx).draw()
      for (const l of d.liaisons) l.setContext(ctx).draw()
    }

    rendus.current = dessins.flatMap((d) =>
      d.evenements.flatMap((e, i) => {
        const element = d.notes[i]!.getSVGElement()
        return element ? [{ ...span(e), element }] : []
      }),
    )

    if (syllables) {
      dessins.forEach((d, index) => {
        const propres = syllables[index]
        if (propres) {
          dessinerSyllabes(div, d.notes, propres, (index + 1) * hauteurVoix)
        }
      })
    }
  }, [voices, meter, pitched, syllables])

  useEffect(() => {
    // Plusieurs voix sonnent en même temps : le surlignage porte donc sur un
    // ensemble, et non sur un signe unique comme quand chaque voix avait son
    // propre dessin.
    const courants =
      position === null || position === undefined
        ? []
        : rendus.current.filter((r) => position >= r.start && position < r.end).map((r) => r.element)

    const inchange =
      courants.length === allumes.current.length &&
      courants.every((e, i) => e === allumes.current[i])
    if (inchange) return

    for (const e of allumes.current) e.classList.remove('sonne')
    for (const e of courants) e.classList.add('sonne')
    allumes.current = courants
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
 * Tracer les barres de mesure à la main.
 *
 * VexFlow les dessine tout seul — mais il déduit leur hauteur du nombre de
 * lignes de la portée, et une portée rythmique n'en a qu'une. Ses barres
 * mesurent donc un pixel de haut : elles existent dans le SVG et ne se voient
 * nulle part. On reprend le tracé, en donnant à la barre la hauteur qu'elle a
 * sur une portée de percussion, c'est-à-dire un peu plus que la ligne.
 *
 * La barre finale est ajoutée au passage : un exemple qui s'arrête sans elle
 * a l'air interrompu plutôt que terminé.
 */
function dessinerBarres(
  ctx: RenderContext,
  portee: Stave,
  tickables: readonly (StaveNote | BarNote)[],
  pitched: boolean,
): void {
  const ligne = portee.getYForLine(0)
  const demi = pitched ? (portee.getYForLine(4) - ligne) / 2 : 14
  const haut = pitched ? portee.getYForLine(0) : ligne - demi
  const bas = pitched ? portee.getYForLine(4) : ligne + demi

  const trait = (x: number) => {
    ctx.beginPath()
    ctx.setLineWidth(1)
    ctx.moveTo(x, haut)
    ctx.lineTo(x, bas)
    ctx.stroke()
  }

  for (const t of tickables) {
    if (t instanceof BarNote) trait(t.getAbsoluteX())
  }
  trait(portee.getX() + portee.getWidth())
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
