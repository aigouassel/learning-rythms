import { MODULES, exercisesOf, type Module } from '@rythmes/content'
import { LECONS } from './modules/lecons'

/**
 * Le sommaire du cours.
 *
 * Une liste, lue de haut en bas, comme la table des matières d'un livre : le
 * cours a un ordre, et la page doit le donner à voir sans que l'œil ait à le
 * reconstituer.
 *
 * Les prérequis y figurent quand même, à droite, parce que l'ordre n'est pas
 * une chaîne : les modules 5 et 6 travaillent deux choses indépendantes et se
 * font dans n'importe quel ordre. Rien n'est verrouillé pour autant — pour un
 * usage personnel, un logiciel n'a pas à autoriser qui que ce soit à avancer.
 */
export function Carte({ onOuvrir }: { onOuvrir(n: number): void }) {
  return (
    <nav className="sommaire" aria-label="Sommaire du cours">
      <ol>
        {MODULES.map((m) => (
          <li key={m.number}>
            <button type="button" className="module" onClick={() => onOuvrir(m.number)}>
              <span className="numero">{m.number}</span>
              <span className="corps">
                <span className="titre">{m.title}</span>
                <span className="resume">{m.summary}</span>
              </span>
              <span className="meta">
                <Etat module={m} />
                {m.requires.length > 0 && (
                  <span className="prerequis">après {m.requires.join(' · ')}</span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ol>
    </nav>
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
