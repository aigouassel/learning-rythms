import type { Exercise } from '@rythmes/content'
import { equals, fraction, toNumber, type Fraction } from '@rythmes/core'
import { useMemo, useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { Portee } from '../components/Portee'

type Reperage = Extract<Exercise, { kind: 'reperage' }>

/**
 * Lecture active : la partition dit une chose, l'enregistrement en dit une
 * autre.
 *
 * C'est l'exercice le plus efficace pour apprendre à lire, et c'est parce
 * qu'il rend le survol impossible : on ne repère pas un écart sans avoir lu
 * chaque signe. Comparer, ici, oblige à ce que la lecture seule n'obtient pas.
 */
export function Reperage({ exercice }: { readonly exercice: Reperage }) {
  const [choisi, setChoisi] = useState<Fraction | null>(null)
  const lecture = useLecture({
    pattern: exercice.joue,
    bpm: exercice.bpm,
    parTemps: exercice.parTemps,
  })

  // L'écart : la position qui existe d'un côté et pas de l'autre.
  const ecart = useMemo(() => {
    const dans = (p: typeof exercice.ecrit, at: Fraction) =>
      p.onsets.some((o) => equals(o.at, at))
    const toutes = [...exercice.ecrit.onsets, ...exercice.joue.onsets].map((o) => o.at)
    return toutes.find((at) => dans(exercice.ecrit, at) !== dans(exercice.joue, at)) ?? null
  }, [exercice])

  const cases = useMemo(() => {
    const pas = fraction(1, 8)
    const total = Math.round(toNumber(exercice.ecrit.length) / toNumber(pas))
    return Array.from({ length: total }, (_, i) => fraction(i * pas.num, pas.den))
  }, [exercice.ecrit.length])

  const juste = choisi !== null && ecart !== null && equals(choisi, ecart)

  return (
    <div className="repondre">
      <button type="button" className="ecouter" onClick={lecture.basculer}>
        {lecture.joue ? '⏸ pause' : '▶ écouter l’enregistrement'}
      </button>

      <Portee pattern={exercice.ecrit} position={lecture.position} />

      <p className="aide">
        Voici ce qui est écrit. Écoute, puis désigne l’endroit où les deux ne
        disent pas la même chose.
      </p>

      <div className="grille">
        {cases.map((at) => (
          <button
            key={`${at.num}/${at.den}`}
            type="button"
            className={`case ${choisi && equals(choisi, at) ? (juste ? 'frappee' : 'figee') : ''}`}
            onClick={() => setChoisi(at)}
            aria-label={`Position ${at.num}/${at.den}`}
          />
        ))}
      </div>

      {choisi !== null && (
        <p className={juste ? 'verdict juste' : 'verdict faux'}>
          {juste
            ? 'C’est bien là que ça diffère.'
            : 'Pas là. Réécoute en suivant la partition du doigt, signe par signe.'}
        </p>
      )}
    </div>
  )
}
