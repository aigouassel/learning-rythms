import type { Exercise } from '@rythmes/content'
import { fraction, measureCount, toNumber, type Fraction, type Pattern, type Voice } from '@rythmes/core'
import { secondsFor, tempo as tempoOf } from '@rythmes/engine'
import { analyseParLigne, diagnose, type TimingAnalysis } from '@rythmes/scoring'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { useTaps } from '../audio/useTaps'
import { Portee } from '../components/Portee'
import { calibration, calibrationFaite } from '../progression'
import { NOM_DE_LA_VOIX, nomDeLaTouche, touchesPour } from './touches'

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
  /** Les lignes à frapper, dans l'ordre des touches. */
  readonly voix?: readonly Voice[]
}) {
  const [phase, setPhase] = useState<'prete' | 'en-cours' | 'finie'>('prete')
  const [analyse, setAnalyse] = useState<TimingAnalysis | null>(null)
  const { taps, ecouter, vider } = useTaps()
  /** L'instant où le motif commence — après le décompte. */
  const [origine, setOrigine] = useState<number | null>(null)
  /** Les attaques attendues, ligne par ligne. */
  const [attendu, setAttendu] = useState<readonly { voix: Voice; temps: readonly number[] }[]>([])
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

  /**
   * Les lignes à jouer.
   *
   * Un motif à une seule voix n'a pas besoin de le déclarer : il n'y a pas
   * d'ambiguïté à lever. Au-delà, l'exercice doit désigner ses lignes, et un
   * contrôle de cohérence le vérifie — ce repli ne sert qu'à ne pas laisser
   * l'écran vide si une donnée passait au travers.
   */
  const voixAFrapper = useMemo<readonly Voice[]>(() => {
    if (voix && voix.length > 0) return voix
    const presentes = [...new Set(pattern.onsets.map((o) => o.voice))]
    return presentes.slice(0, 1)
  }, [voix, pattern])

  const touches = useMemo(
    () => touchesPour(voixAFrapper).map((code, i) => ({ code, voix: voixAFrapper[i]! })),
    [voixAFrapper],
  )

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
    return ecouter(audio.ctx, touches)
  }, [phase, lecture.audio, ecouter, touches])

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

    // Ligne par ligne : deux voix qui tombent sur le même temps se
    // disputeraient la même frappe si on les appariait ensemble.
    setAnalyse(
      analyseParLigne(
        attendu.map((a) => ({
          expected: a.temps,
          taps: jouees.filter((t) => t.voix === a.voix),
        })),
        { calibrationMs: calibration() },
      ),
    )
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
      voixAFrapper.map((v) => ({
        voix: v,
        temps: toutes.filter((_, i) => pattern.onsets[i % n]!.voice === v),
      })),
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
      <Consigne
        touches={touches}
        mesures={cycles * toNumber(measureCount(pattern))}
        tenirSeule={sonores < cycles}
      />

      <Portee pattern={pattern} position={lecture.position} aFrapper={voixAFrapper} touches={touches} />

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
          En place. {taps.length} frappe{taps.length > 1 ? 's' : ''}.
          {sonores < cycles && !lecture.joue && ' — à toi de tenir, maintenant.'}
        </p>
      )}

      {analyse && <Verdict analyse={analyse} />}
    </div>
  )
}

/**
 * Ce que l'exercice demande, avant qu'il ne commence.
 *
 * Trois choses qu'il fallait deviner : quelle ligne frapper quand la partition
 * en montre trois, avec quelle touche, et combien de temps ça dure. La
 * dernière compte autant que les autres — sans elle, on ne sait pas si
 * l'exercice s'est arrêté ou si l'on a perdu le fil.
 */
function Consigne({
  touches,
  mesures,
  tenirSeule,
}: {
  readonly touches: readonly { code: string; voix: Voice }[]
  readonly mesures: number
  readonly tenirSeule: boolean
}) {
  return (
    <p className="consigne-frappe">
      <span className="quoi">
        À frapper :{' '}
        {touches.map((t, i) => (
          <span key={t.code}>
            {i > 0 && (i === touches.length - 1 ? ' et ' : ', ')}
            {NOM_DE_LA_VOIX[t.voix]} <kbd>{nomDeLaTouche(t.code)}</kbd>
          </span>
        ))}
      </span>
      <span className="combien">
        {mesures} mesure{mesures > 1 ? 's' : ''}, après une mesure de décompte
        {tenirSeule && ' — le clic s’arrête à la moitié'}
      </span>
    </p>
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
      {...(exercice.voix ? { voix: exercice.voix } : {})}
    />
  )
}
