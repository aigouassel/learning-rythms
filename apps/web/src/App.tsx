import { MDXProvider } from '@mdx-js/react'
import { exercisesOf, moduleByNumber } from '@rythmes/content'
import Lecon from '@rythmes/content/modules/03-les-durees/lesson.mdx'
import { useState } from 'react'
import { Exemple } from './components/Exemple'
import { Exercices } from './components/Exercices'

const MODULE = moduleByNumber(3)!
const EXERCISES = exercisesOf(3)

/**
 * Le module 3, dans ses deux onglets.
 *
 * Le cours installe : sensation, puis mot, puis symbole. Les exercices
 * retournent le mouvement — ils partent du symbole pour remonter vers le son.
 * C'est ce demi-tour qui construit la lecture, et c'est pour ça que les deux
 * sont séparés au lieu d'être entrelacés.
 */
export function App() {
  const [onglet, setOnglet] = useState<'cours' | 'exercices'>('cours')

  return (
    <main>
      <header>
        <p className="fil">Module {MODULE.number}</p>
        <h1>{MODULE.title}</h1>
        <p className="resume">{MODULE.summary}</p>

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
          >
            Exercices <span className="compte">{EXERCISES.length}</span>
          </button>
        </nav>
      </header>

      {onglet === 'cours' ? (
        <article className="lecon">
          <MDXProvider components={{ Exemple }}>
            <Lecon />
          </MDXProvider>
        </article>
      ) : (
        <Exercices exercises={EXERCISES} />
      )}
    </main>
  )
}
