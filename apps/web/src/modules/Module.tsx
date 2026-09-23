import { exercisesOf, type Module as ModuleDuCours } from '@rythmes/content'
import { MDXProvider } from '@mdx-js/react'
import { useState } from 'react'
import { Exemple } from '../components/Exemple'
import { Exercices } from '../components/Exercices'
import { LECONS } from './lecons'
import { PriseDeReperes } from './PriseDeReperes'

/**
 * Un module, dans ses deux onglets.
 *
 * Le cours installe : sensation, puis mot, puis symbole. Les exercices
 * retournent le mouvement — ils partent du symbole pour remonter vers le son.
 * C'est ce demi-tour qui construit la lecture, et c'est pour ça que les deux
 * sont séparés au lieu d'être entrelacés.
 */
export function Module({ module }: { readonly module: ModuleDuCours }) {
  const [onglet, setOnglet] = useState<'cours' | 'exercices'>('cours')
  const Lecon = LECONS[module.number]
  const exercices = exercisesOf(module.number)

  if (module.number === 0) return <PriseDeReperes />

  return (
    <>
      <nav className="onglets">
        <button
          type="button"
          className={onglet === 'cours' ? 'actif' : ''}
          onClick={() => setOnglet('cours')}
        >
          Cours
        </button>
        <button
          type="button"
          className={onglet === 'exercices' ? 'actif' : ''}
          onClick={() => setOnglet('exercices')}
          disabled={exercices.length === 0}
        >
          Exercices {exercices.length > 0 && <span className="compte">{exercices.length}</span>}
        </button>
      </nav>

      {onglet === 'cours' ? (
        Lecon ? (
          <article className="lecon">
            <MDXProvider components={{ Exemple }}>
              <Lecon />
            </MDXProvider>
          </article>
        ) : (
          <p className="aide">
            Le cours de ce module n’est pas encore écrit. Son plan est dans la
            carte ; les exercices, s’il y en a, sont dans l’autre onglet.
          </p>
        )
      ) : (
        <Exercices exercises={exercices} />
      )}
    </>
  )
}
