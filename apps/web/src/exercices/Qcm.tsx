import type { Exercise } from '@rythmes/content'
import { fraction } from '@rythmes/core'
import { useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { Portee } from '../components/Portee'

type Qcm = Extract<Exercise, { kind: 'qcm' }>

/**
 * Reconnaître : on écoute, on désigne la notation qui correspond.
 *
 * Le plus accessible des quatre niveaux de nommage, et le point de départ
 * assumé — en pédagogie, reconnaître précède toujours restituer. Ce n'est pas
 * pour autant le point d'arrivée : quand on compose, personne ne propose
 * quatre options.
 *
 * L'écoute reste disponible après la réponse. Se tromper puis réécouter en
 * sachant ce qu'on cherche est le moment où l'on apprend vraiment.
 */
export function Qcm({ exercice }: { readonly exercice: Qcm }) {
  const [choisi, setChoisi] = useState<number | null>(null)
  const lecture = useLecture({
    pattern: exercice.joue,
    bpm: exercice.bpm ?? 80,
    parTemps: exercice.parTemps ?? fraction(1, 4),
  })

  const juste = choisi === exercice.bonne

  return (
    <div className="repondre">
      <button
        type="button"
        className="ecouter"
        onClick={lecture.basculer}
        disabled={lecture.chargement}
      >
        {lecture.chargement ? 'chargement…' : lecture.joue ? '⏸ pause' : '▶ écouter'}
      </button>

      <ol className="options">
        {exercice.options.map((option, i) => (
          <li key={i}>
            <button
              type="button"
              className={etat(i, choisi, exercice.bonne)}
              onClick={() => setChoisi(i)}
              aria-pressed={choisi === i}
            >
              <Portee pattern={option} />
            </button>
          </li>
        ))}
      </ol>

      {choisi !== null && (
        <p className={juste ? 'verdict juste' : 'verdict faux'}>
          {juste
            ? 'C’est ça.'
            : 'Non. Réécoute en regardant celle que tu as choisie : quelque chose ne tombe pas au même endroit.'}
        </p>
      )}
    </div>
  )
}

const etat = (i: number, choisi: number | null, bonne: number): string => {
  if (choisi === null) return 'option'
  if (i === bonne) return 'option juste'
  if (i === choisi) return 'option faux'
  return 'option'
}
