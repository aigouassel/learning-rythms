import type { Exercise } from '@rythmes/content'
import { fraction, type Fraction, type Pattern, type Voice } from '@rythmes/core'
import { secondsFor, tempo as tempoOf } from '@rythmes/engine'
import { analyseTiming, diagnose, type TimingAnalysis } from '@rythmes/scoring'
import { useEffect, useRef, useState } from 'react'
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
  /** L'instant où le motif commence — après le décompte. */
  const [origine, setOrigine] = useState<number | null>(null)
  /**
   * Le décompte court encore.
   *
   * Un état explicite plutôt que « le transport ne rend aucune position » :
   * cette dernière est également vraie une fois le son arrêté, et le message de
   * préparation reparaissait alors au milieu de l'exercice — précisément quand
   * le clic se retire et qu'il faut tenir seule. Elle dépend de surcroît de la
   * boucle d'animation, que l'arrière-plan gèle.
   */
  const [prepare, setPrepare] = useState(false)
  const minuterieRef = useRef<number | null>(null)
  const preparationRef = useRef<number | null>(null)

  // Le motif tourne — ou se tait, en déchiffrage. Dans les deux cas le
  // transport reste l'autorité du temps : c'est lui qui dit où les attaques
  // étaient attendues. En déchiffrage il les connaît sans les jouer, au lieu
  // de recevoir un motif vidé de ses attaques — qui le rendait muet, mais
  // aussi incapable de dire quoi que ce soit à la correction.
  const sonores = cyclesSonores ?? cycles

  const lecture = useLecture({
    pattern,
    bpm,
    parTemps,
    cycles: sonores,
    muet: !avecSon,
    countIn: 1,
  })

  useEffect(() => {
    if (phase !== 'en-cours') return
    const audio = lecture.audio()
    if (!audio) return
    return ecouter(audio.ctx)
  }, [phase, lecture.audio, ecouter])

  useEffect(
    () => () => {
      if (minuterieRef.current !== null) window.clearTimeout(minuterieRef.current)
      if (preparationRef.current !== null) window.clearTimeout(preparationRef.current)
    },
    [],
  )

  useEffect(() => {
    if (phase !== 'finie' || attendu.length === 0) return

    // Les frappes du décompte ne sont pas des fautes : on se cale, on ne joue
    // pas encore. Les compter les ferait toutes passer pour des attaques en
    // trop, et le verdict porterait sur l'échauffement.
    const jouees = origine === null ? taps : taps.filter((t) => t.at >= origine - MARGE)
    setAnalyse(analyseTiming(attendu, jouees, { calibrationMs: calibration() }))
  }, [phase, attendu, taps, origine])

  const commencer = async () => {
    // Une minuterie d'essai précédent terminerait celui-ci avant l'heure.
    if (minuterieRef.current !== null) window.clearTimeout(minuterieRef.current)
    if (preparationRef.current !== null) window.clearTimeout(preparationRef.current)
    vider()
    setAnalyse(null)
    const t = await lecture.demarrer()
    if (!t) return

    // Les attaques attendues sur tous les passages, y compris ceux que le son
    // n'accompagnera pas — et seulement celles de la voix demandée.
    const toutes = t.expectedTimes(cycles)
    const n = pattern.onsets.length
    setAttendu(
      voix && n > 0 ? toutes.filter((_, i) => pattern.onsets[i % n]!.voice === voix) : toutes,
    )
    setOrigine(t.origin)
    setPrepare(true)
    setPhase('en-cours')

    // La fin se compte depuis l'origine du motif, sur l'horloge audio — jamais
    // depuis l'instant du clic. Comptée depuis le clic, elle oubliait le
    // décompte et l'amorce du transport ; et quand le clic s'arrête en cours
    // de route, elle tombait au moment même où le son se taisait, coupant
    // l'exercice à l'endroit précis où il commençait vraiment.
    const parCycle = secondsFor(pattern.length, tempoOf(bpm, parTemps))
    const finie = t.origin + cycles * parCycle
    const ctx = lecture.audio()?.ctx
    const maintenant = ctx?.currentTime ?? 0
    const reste = Math.max(0, finie - maintenant)
    minuterieRef.current = window.setTimeout(() => setPhase('finie'), reste * 1000 + 250)

    const versOrigine = Math.max(0, t.origin - maintenant)
    preparationRef.current = window.setTimeout(() => setPrepare(false), versOrigine * 1000)
  }

  const decompte = phase === 'en-cours' && prepare

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

      {decompte && <p className="aide gros">Une mesure pour se préparer…</p>}

      {phase === 'en-cours' && !decompte && (
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

/**
 * Ce qu'on accorde avant l'origine, en secondes.
 *
 * Une frappe un peu en avance sur la première attaque est une frappe en
 * avance, pas une frappe du décompte : la même tolérance que l'appariement,
 * pour que les deux racontent la même histoire.
 */
const MARGE = 0.15

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
