import { fraction, meter, pattern } from '@rythmes/core'
import { analyseTiming, calibrate, type Tap } from '@rythmes/scoring'
import { useEffect, useMemo, useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { useTaps } from '../audio/useTaps'
import { calibration, calibrationFaite, setCalibration } from '../progression'

const BPM = 84
const NOIRE = fraction(1, 4)
const CYCLES = 4

const CLIC = pattern({
  meter: meter(4, 4),
  onsets: [0, 1, 2, 3].map((i) => ({
    at: fraction(i, 4),
    duration: NOIRE,
    voice: 'clave' as const,
    ...(i === 0 ? { accent: true } : {}),
  })),
})

/**
 * Mesurer le décalage du matériel, une fois.
 *
 * Trois retards s'additionnent quand tu frappes : le son sort du navigateur
 * avec du retard, ta frappe met du temps à remonter jusqu'au code, et ton
 * propre temps de réaction s'ajoute aux deux. Vingt à quarante millisecondes,
 * facilement — assez pour qu'une exécution parfaite soit déclarée « toujours
 * en retard ».
 *
 * Ce biais est constant. On le mesure ici, et tous les exercices le
 * soustrairont ensuite, ce qui laisse apparaître les vraies fautes : la dérive
 * de tempo et l'irrégularité.
 *
 * On prend la **médiane** des seize frappes et non leur moyenne : une seule
 * distraction fausserait une moyenne de plusieurs dizaines de millisecondes,
 * et ce biais-là serait ensuite retiré de tous tes exercices.
 */
export function Calibration({ onFini }: { readonly onFini?: () => void }) {
  const [phase, setPhase] = useState<'prete' | 'en-cours' | 'finie'>('prete')
  const [attendu, setAttendu] = useState<readonly number[]>([])
  const { taps, ecouter, vider } = useTaps()

  const lecture = useLecture({
    pattern: CLIC,
    bpm: BPM,
    parTemps: NOIRE,
    cycles: CYCLES,
    onFin: () => setPhase('finie'),
  })

  useEffect(() => {
    if (phase !== 'en-cours') return
    const audio = lecture.audio()
    if (!audio) return
    return ecouter(audio.ctx)
  }, [phase, lecture, ecouter])

  const resultat = useMemo(() => {
    if (phase !== 'finie' || attendu.length === 0) return null
    const brut = calibrate(attendu, taps as readonly Tap[])
    const analyse = analyseTiming(attendu, taps as readonly Tap[])
    return { decalage: brut, analyse }
  }, [phase, attendu, taps])

  const commencer = async () => {
    vider()
    const t = await lecture.demarrer()
    setAttendu(t?.expectedTimes(CYCLES) ?? [])
    setPhase('en-cours')
  }

  return (
    <section className="calibration">
      <h2>Calibrer</h2>
      <p>
        Seize frappes sur un clic régulier. On en déduit le décalage de ton
        matériel, pour ne pas te le reprocher ensuite comme si c’était une faute
        de musicienne.
      </p>
      <p className="aide">
        Mets un casque si tu en as un, et garde-le pour le reste de la séance :
        le décalage dépend de la sortie audio, donc changer d’écouteurs change
        la mesure.
      </p>

      {phase !== 'en-cours' && (
        <button type="button" onClick={commencer} disabled={lecture.chargement}>
          {lecture.chargement ? 'chargement…' : resultat ? 'recommencer' : 'commencer'}
        </button>
      )}

      {phase === 'en-cours' && (
        <p className="aide gros">
          Barre d’espace, sur chaque clic. {taps.length} / {CYCLES * 4}
        </p>
      )}

      {resultat && (
        <div className="resultat">
          <dl className="grandeurs">
            <div>
              <dt>décalage médian</dt>
              <dd>
                {resultat.decalage > 0 ? '+' : ''}
                {resultat.decalage.toFixed(0)} ms
              </dd>
            </div>
            <div>
              <dt>frappes retenues</dt>
              <dd>{resultat.analyse.matched}</dd>
            </div>
          </dl>

          {resultat.analyse.matched < 8 ? (
            <p className="verdict faux">
              Trop peu de frappes ont été relevées pour en tirer quelque chose.
              Recommence en frappant sur chaque clic.
            </p>
          ) : (
            <>
              <p className="verdict juste">
                {Math.abs(resultat.decalage) < 10
                  ? 'Ton matériel est presque sans retard — rien à corriger, ou si peu.'
                  : `Tes frappes arrivent ${resultat.decalage > 0 ? 'après' : 'avant'} le clic de ${Math.abs(resultat.decalage).toFixed(0)} ms en général. Ce décalage sera retiré de tes exercices.`}
              </p>
              <button
                type="button"
                onClick={() => {
                  setCalibration(resultat.decalage)
                  onFini?.()
                }}
              >
                enregistrer
              </button>
            </>
          )}
        </div>
      )}

      {calibrationFaite() && (
        <p className="aide">
          Calibration enregistrée : {calibration() > 0 ? '+' : ''}
          {calibration()} ms.
        </p>
      )}
    </section>
  )
}
