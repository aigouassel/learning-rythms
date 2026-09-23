import { moduleByNumber } from '@rythmes/content'
import { useEffect, useState } from 'react'
import { Carte } from './Carte'
import { Module } from './modules/Module'

/**
 * La navigation, portée par le fragment d'URL.
 *
 * Deux lignes de plus qu'un `useState`, et elles achètent le bouton Retour du
 * navigateur, le rechargement qui retombe au bon endroit, et un lien qu'on
 * peut mettre en favori sur un module précis. Pour une application d'une seule
 * page à neuf écrans, un routeur serait disproportionné.
 */
function moduleDuFragment(): number | null {
  const m = /^#module-(\d+)$/.exec(window.location.hash)
  return m ? Number(m[1]) : null
}

export function App() {
  const [numero, setNumero] = useState<number | null>(moduleDuFragment)

  useEffect(() => {
    const surChangement = () => setNumero(moduleDuFragment())
    window.addEventListener('hashchange', surChangement)
    return () => window.removeEventListener('hashchange', surChangement)
  }, [])

  const ouvrir = (n: number | null) => {
    window.location.hash = n === null ? '' : `module-${n}`
    setNumero(n)
  }

  const module = numero === null ? null : moduleByNumber(numero)

  return (
    <main>
      {module ? (
        <>
          <header>
            <button type="button" className="retour" onClick={() => ouvrir(null)}>
              ← tous les modules
            </button>
            <p className="fil">Module {module.number}</p>
            <h1>{module.title}</h1>
            <p className="resume">{module.summary}</p>
          </header>
          <Module module={module} />
        </>
      ) : (
        <>
          <header>
            <h1>Rythmes</h1>
            <p className="resume">
              Un cours de rythme en neuf étapes. Il part de ce que l’oreille sait
              déjà pour construire ce qui manque : les mots, puis la notation,
              puis de quoi écrire soi-même.
            </p>
          </header>
          <Carte onOuvrir={ouvrir} />
        </>
      )}
    </main>
  )
}
