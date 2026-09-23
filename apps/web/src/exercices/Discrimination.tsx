import type { Exercise } from '@rythmes/content'
import { fraction } from '@rythmes/core'
import { useState } from 'react'
import { useLecture } from '../audio/useLecture'

type Discrimination = Extract<Exercise, { kind: 'discrimination' }>

/**
 * Catégoriser une sensation.
 *
 * Aucune notation ici, et c'est le point : on demande de nommer ce qu'on
 * ressent avant d'avoir un signe à quoi le rattacher. C'est l'exercice des
 * modules où la notation n'existe pas encore, et celui des faux amis — binaire
 * ou ternaire, 6/8 ou 3/4.
 */
export function Discrimination({ exercice }: { readonly exercice: Discrimination }) {
  const [choisi, setChoisi] = useState<number | null>(null)
  const lecture = useLecture({
    pattern: exercice.joue,
    bpm: exercice.bpm ?? 84,
    parTemps: exercice.parTemps ?? fraction(1, 4),
  })
  const juste = choisi === exercice.bonne

  return (
    <div className="repondre">
      <button type="button" className="ecouter" onClick={lecture.basculer}>
        {lecture.joue ? '⏸ pause' : '▶ écouter'}
      </button>

      <div className="choix-texte">
        {exercice.choix.map((c, i) => (
          <button
            key={i}
            type="button"
            className={
              choisi === null
                ? ''
                : i === exercice.bonne
                  ? 'juste'
                  : i === choisi
                    ? 'faux'
                    : ''
            }
            onClick={() => setChoisi(i)}
          >
            {c}
          </button>
        ))}
      </div>

      {choisi !== null && (
        <p className={juste ? 'verdict juste' : 'verdict faux'}>
          {/* Le verdict reste général : il s'affiche au module 1 comme au
              module 7, et nommer une subdivision devant quelqu'un qui n'a pas
              encore le mot serait exactement ce que le cours évite. */}
          {juste ? 'Oui.' : 'Non — réécoute avant de retenter, sans regarder les réponses.'}
        </p>
      )}
    </div>
  )
}
