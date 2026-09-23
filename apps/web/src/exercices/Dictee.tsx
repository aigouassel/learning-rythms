import type { Exercise } from '@rythmes/content'
import { fraction, toNumber, type Pattern } from '@rythmes/core'
import { quantize, type QuantizeCandidate } from '@rythmes/notation'
import { compareRhythms, explain } from '@rythmes/scoring'
import { useEffect, useMemo, useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { useTaps } from '../audio/useTaps'
import { GrilleDeSaisie, motifVide } from '../components/GrilleDeSaisie'
import { Portee } from '../components/Portee'
import { calibration } from '../progression'

type Dictee = Extract<Exercise, { kind: 'dictee' }>

const BPM = 72
const PAR_TEMPS = fraction(1, 4)

/**
 * Écouter et écrire.
 *
 * Deux saisies, et elles ne travaillent pas la même chose. La **palette**
 * demande d'analyser puis de nommer — le manque réel. La **frappe** part de
 * l'oreille, terrain fort, et risquerait de contourner le nommage : on lui
 * ajoute donc une étape obligatoire, le choix entre les lectures possibles.
 * L'oreille propose, le nommage tranche.
 */
export function Dictee({ exercice }: { readonly exercice: Dictee }) {
  return exercice.saisie === 'palette' ? (
    <Palette exercice={exercice} />
  ) : (
    <FrappePuisChoix exercice={exercice} />
  )
}

function Palette({ exercice }: { readonly exercice: Dictee }) {
  const [reponse, setReponse] = useState<Pattern>(() =>
    motifVide(exercice.attendu.meter, exercice.attendu.length, exercice.attendu.style),
  )
  const [verifie, setVerifie] = useState(false)
  const lecture = useLecture({ pattern: exercice.attendu, bpm: BPM, parTemps: PAR_TEMPS })
  const diff = compareRhythms(exercice.attendu, reponse)

  return (
    <div className="repondre">
      <button type="button" className="ecouter" onClick={lecture.basculer}>
        {lecture.joue ? '⏸ pause' : '▶ écouter'}
      </button>

      <Portee pattern={reponse} />
      <GrilleDeSaisie
        meter={exercice.attendu.meter}
        length={exercice.attendu.length}
        value={reponse}
        onChange={(p) => {
          setReponse(p)
          setVerifie(false)
        }}
      />

      <button type="button" onClick={() => setVerifie(true)}>
        vérifier
      </button>
      {verifie && (
        <p className={diff.identical ? 'verdict juste' : 'verdict faux'}>{explain(diff)}</p>
      )}
    </div>
  )
}

function FrappePuisChoix({ exercice }: { readonly exercice: Dictee }) {
  const [phase, setPhase] = useState<'ecoute' | 'frappe' | 'choix' | 'verdict'>('ecoute')
  const [choisi, setChoisi] = useState<QuantizeCandidate | null>(null)

  const lecture = useLecture({ pattern: exercice.attendu, bpm: BPM, parTemps: PAR_TEMPS })
  const { taps, ecouter, vider } = useTaps()
  const [origine, setOrigine] = useState<number | null>(null)

  // Les frappes sont datées sur l'horloge audio ; il faut donc que le contexte
  // existe avant d'écouter le clavier.
  useEffect(() => {
    if (phase !== 'frappe') return
    const audio = lecture.audio()
    if (!audio) return
    return ecouter(audio.ctx)
  }, [phase, lecture, ecouter])

  const candidats = useMemo(() => {
    if (origine === null || taps.length === 0) return []
    const secondeParRonde = (60 / BPM) / toNumber(PAR_TEMPS)
    return quantize({
      positions: taps.map((t) => (t.at - origine - calibration() / 1000) / secondeParRonde),
      meter: exercice.attendu.meter,
      length: exercice.attendu.length,
      voice: exercice.attendu.onsets[0]?.voice ?? 'kick',
    })
  }, [taps, origine, exercice.attendu])

  const commencer = async () => {
    vider()
    setChoisi(null)
    const t = await lecture.demarrer()
    setOrigine(t?.origin ?? null)
    setPhase('frappe')
  }

  return (
    <div className="repondre dictee">
      {phase === 'ecoute' && (
        <>
          <button type="button" className="ecouter" onClick={lecture.basculer}>
            {lecture.joue ? '⏸ pause' : '▶ écouter autant de fois qu’il faut'}
          </button>
          <p className="aide">
            Quand tu l’as en tête, rejoue-le à la barre d’espace. Le motif
            tournera pendant que tu frappes.
          </p>
          <button type="button" onClick={commencer}>
            je le rejoue
          </button>
        </>
      )}

      {phase === 'frappe' && (
        <>
          <p className="aide gros">
            Frappe la barre d’espace. {taps.length} frappe{taps.length > 1 ? 's' : ''}.
          </p>
          <button
            type="button"
            onClick={() => {
              lecture.arreter()
              setPhase('choix')
            }}
          >
            j’ai fini
          </button>
        </>
      )}

      {phase === 'choix' && (
        <>
          <p className="aide">
            Voilà ce que ta frappe peut vouloir dire. Ce n’est pas la machine
            qui décide : regarde les notations et choisis celle que tu as
            entendue.
          </p>
          <ol className="options">
            {candidats.map((c, i) => (
              <li key={i}>
                <button
                  type="button"
                  className={choisi === c ? 'option actif' : 'option'}
                  onClick={() => {
                    setChoisi(c)
                    setPhase('verdict')
                  }}
                >
                  <span className="etiquette">{c.label}</span>
                  <Portee pattern={c.pattern} />
                </button>
              </li>
            ))}
          </ol>
          {candidats.length === 0 && (
            <p className="aide">Aucune frappe n’a été relevée — recommence.</p>
          )}
          <button type="button" onClick={() => setPhase('ecoute')}>
            recommencer
          </button>
        </>
      )}

      {phase === 'verdict' && choisi && (
        <>
          <Portee pattern={choisi.pattern} />
          <p
            className={
              compareRhythms(exercice.attendu, choisi.pattern).identical
                ? 'verdict juste'
                : 'verdict faux'
            }
          >
            {explain(compareRhythms(exercice.attendu, choisi.pattern))}
          </p>
          <button type="button" onClick={() => setPhase('ecoute')}>
            recommencer
          </button>
        </>
      )}
    </div>
  )
}
