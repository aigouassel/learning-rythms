import type { Exercise } from '@rythmes/content'
import { Exercice, GENRES } from '../exercices/Exercice'

/**
 * Les exercices d'un module, dans l'ordre où ils ont été écrits.
 *
 * L'ordre est celui de la difficulté croissante : reconnaître, discriminer,
 * produire sous contrainte, produire. C'est une propriété du contenu, pas de
 * cette liste — elle se contente de ne pas le mélanger.
 */
export function Exercices({ exercises }: { readonly exercises: readonly Exercise[] }) {
  return (
    <section className="exercices">
      {exercises.map((e) => (
        <article key={e.id} className="exercice">
          <h3>
            <span className="genre">{GENRES[e.kind]}</span>
          </h3>
          <p>{e.consigne}</p>
          <Exercice exercice={e} />
        </article>
      ))}
    </section>
  )
}
