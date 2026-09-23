import { MODULES, exercisesOf, type Module } from '@rythmes/content'
import { LECONS } from './modules/lecons'

/**
 * La carte du cours.
 *
 * Elle montre le graphe, pas une liste : les modules 5 et 6 travaillent deux
 * choses indépendantes et se font dans n'importe quel ordre. Afficher leurs
 * prérequis rend cette liberté visible au lieu de la cacher derrière une
 * numérotation qui suggère un chemin unique.
 *
 * Rien n'est verrouillé. Pour un usage personnel, un logiciel n'a pas à
 * autoriser qui que ce soit à avancer — il indique ce qui aide à comprendre la
 * suite, et laisse décider.
 */
export function Carte({ onOuvrir }: { onOuvrir(n: number): void }) {
  return (
    <section className="carte">
      <ol>
        {MODULES.map((m) => (
          <li key={m.number}>
            <button type="button" className="module" onClick={() => onOuvrir(m.number)}>
              <span className="numero">{m.number}</span>
              <span className="corps">
                <span className="titre">{m.title}</span>
                <span className="resume">{m.summary}</span>
                <span className="meta">
                  <Etat module={m} />
                  {m.requires.length > 0 && (
                    <span className="prerequis">après {m.requires.join(' · ')}</span>
                  )}
                  {m.styles.length > 0 && <span className="styles">{m.styles.join(' · ')}</span>}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </section>
  )
}

function Etat({ module }: { readonly module: Module }) {
  const cours = LECONS[module.number] !== undefined
  const exercices = exercisesOf(module.number).length

  if (module.number === 0) return <span className="etat pret">calibration</span>
  if (cours && exercices > 0) {
    return <span className="etat pret">cours · {exercices} exercices</span>
  }
  if (exercices > 0) return <span className="etat partiel">{exercices} exercices</span>
  if (cours) return <span className="etat partiel">cours seul</span>
  return <span className="etat vide">à écrire</span>
}
