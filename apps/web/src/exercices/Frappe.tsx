import type { Exercise } from '@rythmes/content'
import { fraction, type Fraction, type Pattern } from '@rythmes/core'
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
}: {
  readonly pattern: Pattern
  readonly bpm: number
  readonly parTemps: Fraction
  readonly cycles: number
  readonly avecSon: boolean
}) {
  const [phase, setPhase] = useState<'prete' | 'en-cours' | 'finie'>('prete')
  const [analyse, setAnalyse] = useState<TimingAnalysis | null>(null)
  const { taps, ecouter, vider } = useTaps()
  const [attendu, setAttendu] = useState<readonly number[]>([])

  // Le motif tourne — ou se tait, en déchiffrage. Dans les deux cas le
  // transport reste l'autorité du temps : c'est lui qui dit où les attaques
  // étaient attendues.
  const lecture = useLecture({
    pattern: avecSon ? pattern : silencieux(pattern),
    bpm,
    parTemps,
    cycles,
    onFin: () => setPhase('finie'),
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
    setAttendu(t?.expectedTimes(cycles) ?? [])
    setPhase('en-cours')
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
      avecSon={!exercice.clicSArrete}
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
