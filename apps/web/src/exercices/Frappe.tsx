import type { Exercise } from '@rythmes/content'
import { fraction, type Fraction, type Pattern, type Voice } from '@rythmes/core'
import { secondsFor, tempo as tempoOf } from '@rythmes/engine'
import { analyseTiming, diagnose, type TimingAnalysis } from '@rythmes/scoring'
import { useEffect, useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { useTaps } from '../audio/useTaps'
import { Portee } from '../components/Portee'
import { calibration, calibrationFaite } from '../progression'

type Frappe = Extract<Exercise, { kind: 'frappe' }>
type Dechiffrage = Extract<Exercise, { kind: 'dechiffrage' }>

/**
 * Exécuter — et se faire dire **en quoi** l'on s'est trompée.
 *
 * Le même composant sert la frappe mesurée et le déchiffrage, parce que la
 * seule différence tient à ce qu'on entend : la frappe accompagne un motif qui
 * sonne, le déchiffrage se joue dans le silence, à partir de ce qui est écrit.
 * Le reste — capter les frappes, les apparier à la grille, décomposer l'erreur
 * — est identique.
 */
export function FrappeMesuree({
  pattern,
  bpm,
  parTemps,
  cycles,
  avecSon,
  cyclesSonores,
  voix,
}: {
  readonly pattern: Pattern
  readonly bpm: number
  readonly parTemps: Fraction
  readonly cycles: number
  readonly avecSon: boolean
  /** Après quoi le son se retire et la frappe continue sans lui. Tous, par défaut. */
  readonly cyclesSonores?: number
  /** La voix à frapper, si le motif en compte plusieurs. */
  readonly voix?: Voice
}) {
  const [phase, setPhase] = useState<'prete' | 'en-cours' | 'finie'>('prete')
  const [analyse, setAnalyse] = useState<TimingAnalysis | null>(null)
  const { taps, ecouter, vider } = useTaps()
  const [attendu, setAttendu] = useState<readonly number[]>([])

  // Le motif tourne — ou se tait, en déchiffrage. Dans les deux cas le
  // transport reste l'autorité du temps : c'est lui qui dit où les attaques
  // étaient attendues.
  const sonores = cyclesSonores ?? cycles

  const lecture = useLecture({
    pattern: avecSon ? pattern : silencieux(pattern),
    bpm,
    parTemps,
    cycles: sonores,
    // Quand le clic se retire avant la fin, ce n'est pas l'exercice qui
    // s'arrête : c'est là qu'il commence vraiment. On laisse donc la minuterie
    // ci-dessous décider de la fin.
    ...(sonores === cycles ? { onFin: () => setPhase('finie') } : {}),
  })

  useEffect(() => {
    if (phase !== 'en-cours') return
    const audio = lecture.audio()
    if (!audio) return
    return ecouter(audio.ctx)
  }, [phase, lecture, ecouter])

  useEffect(() => {
    if (phase !== 'finie' || attendu.length === 0) return
    setAnalyse(analyseTiming(attendu, taps, { calibrationMs: calibration() }))
  }, [phase, attendu, taps])

  const commencer = async () => {
    vider()
    setAnalyse(null)
    const t = await lecture.demarrer()

    // Les attaques attendues sur tous les passages, y compris ceux que le son
    // n'accompagnera pas — et seulement celles de la voix demandée.
    const toutes = t?.expectedTimes(cycles) ?? []
    const n = pattern.onsets.length
    setAttendu(
      voix && n > 0 ? toutes.filter((_, i) => pattern.onsets[i % n]!.voice === voix) : toutes,
    )
    setPhase('en-cours')

    if (sonores < cycles && t) {
      const parCycle = secondsFor(pattern.length, tempoOf(bpm, parTemps))
      const reste = (cycles - sonores) * parCycle
      window.setTimeout(() => setPhase('finie'), reste * 1000 + 200)
    }
  }

  return (
    <div className="repondre frappe">
      <Portee pattern={pattern} position={lecture.position} />

      {!calibrationFaite() && (
        <p className="aide">
          La calibration n’a pas été faite : un décalage constant de quelques
          dizaines de millisecondes viendra du matériel, pas de toi.
        </p>
      )}

      {phase !== 'en-cours' && (
        <button type="button" onClick={commencer} disabled={lecture.chargement}>
          {lecture.chargement ? 'chargement…' : analyse ? 'recommencer' : 'commencer'}
        </button>
      )}

      {phase === 'en-cours' && (
        <p className="aide gros">
          Barre d’espace, en place. {taps.length} frappe{taps.length > 1 ? 's' : ''}.
          {sonores < cycles && !lecture.joue && ' — à toi de tenir, maintenant.'}
        </p>
      )}

      {analyse && <Verdict analyse={analyse} />}
    </div>
  )
}

function Verdict({ analyse }: { readonly analyse: TimingAnalysis }) {
  const constats = diagnose(analyse)

  return (
    <div className="verdict-detaille">
      <dl className="grandeurs">
        <div>
          <dt>décalage</dt>
          <dd>{signe(analyse.offsetMs)} ms</dd>
        </div>
        <div>
          <dt>dérive</dt>
          <dd>{signe(analyse.driftMsPerSecond)} ms/s</dd>
        </div>
        <div>
          <dt>dispersion</dt>
          <dd>{analyse.dispersionMs.toFixed(0)} ms</dd>
        </div>
      </dl>

      <ul className="constats">
        {constats.map((c, i) => (
          <li key={i} className={c.severity}>
            {c.message}
          </li>
        ))}
      </ul>

      <p className="aide">
        {analyse.matched} attaque{analyse.matched > 1 ? 's' : ''} appariée
        {analyse.matched > 1 ? 's' : ''}
        {analyse.missed > 0 && `, ${analyse.missed} manquée${analyse.missed > 1 ? 's' : ''}`}
        {analyse.extra > 0 && `, ${analyse.extra} en trop`}.
      </p>
    </div>
  )
}

const signe = (ms: number): string => `${ms > 0 ? '+' : ''}${ms.toFixed(0)}`

/** Le même motif, sans voix : la grille existe, mais ne sonne pas. */
const silencieux = (p: Pattern): Pattern => ({ ...p, onsets: [] })

export function ExerciceFrappe({ exercice }: { readonly exercice: Frappe }) {
  return (
    <FrappeMesuree
      pattern={exercice.grille}
      bpm={exercice.bpm}
      parTemps={exercice.parTemps}
      cycles={exercice.cycles}
      avecSon
      {...(exercice.clicSArrete ? { cyclesSonores: Math.ceil(exercice.cycles / 2) } : {})}
      {...(exercice.voix ? { voix: exercice.voix } : {})}
    />
  )
}

export function ExerciceDechiffrage({ exercice }: { readonly exercice: Dechiffrage }) {
  return (
    <FrappeMesuree
      pattern={exercice.aLire}
      bpm={exercice.bpm}
      parTemps={exercice.parTemps ?? fraction(1, 4)}
      cycles={1}
      avecSon={false}
    />
  )
}
