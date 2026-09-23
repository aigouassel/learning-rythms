import { MODULES, moduleByNumber, type Module as ModuleDuCours } from '@rythmes/content'
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
  return lu().numero
}

/**
 * `#module-3` ouvre le module, `#module-3/le-faux-ami` ouvre sa section.
 *
 * La section est dans le même fragment, après une barre, et non dans une
 * ancre nue : `#le-faux-ami` remplacerait `#module-3` et le routeur, ne
 * reconnaissant plus rien, retomberait au sommaire. Le prix à payer est que
 * le navigateur ne fait plus défiler tout seul — c'est à nous de le faire.
 */
function lu(): { readonly numero: number | null; readonly section: string | null } {
  const m = /^#module-(\d+)(?:\/(.+))?$/.exec(window.location.hash)
  return m ? { numero: Number(m[1]), section: m[2] ?? null } : { numero: null, section: null }
}

/**
 * Le module qui précède et celui qui suit, dans l'ordre du sommaire.
 *
 * L'ordre de lecture n'est pas le graphe des prérequis : les modules 5 et 6
 * sont indépendants l'un de l'autre, mais un livre les imprime quand même
 * l'un après l'autre. `MODULES` porte déjà cet ordre — on s'y tient, plutôt
 * que d'inventer un parcours que le sommaire ne montrerait pas.
 */
function voisins(numero: number) {
  const i = MODULES.findIndex((m) => m.number === numero)
  return {
    precedent: (i > 0 ? MODULES[i - 1] : null) ?? null,
    suivant: (i >= 0 ? MODULES[i + 1] : null) ?? null,
  }
}

export function App() {
  const [numero, setNumero] = useState<number | null>(moduleDuFragment)

  useEffect(() => {
    const surChangement = () => {
      setNumero(moduleDuFragment())
      const { section } = lu()
      if (section === null) return
      // Un cadre d'attente : au premier affichage d'un module, la leçon n'est
      // pas encore dans le DOM quand le fragment est lu.
      requestAnimationFrame(() => {
        document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' })
      })
    }
    window.addEventListener('hashchange', surChangement)
    surChangement()
    return () => window.removeEventListener('hashchange', surChangement)
  }, [])

  const ouvrir = (n: number | null) => {
    window.location.hash = n === null ? '' : `module-${n}`
    setNumero(n)
    // Sans ça, on arrive au module suivant à la hauteur où on a quitté le
    // précédent — c'est-à-dire tout en bas, sur ses exercices.
    window.scrollTo({ top: 0 })
  }

  const module = numero === null ? null : moduleByNumber(numero)

  if (!module) {
    return (
      <main className="carte-page">
        <header>
          <h1>Rythmes</h1>
          <p className="resume">
            Un cours de rythme en neuf étapes. Il part de ce que l’oreille sait
            déjà pour construire ce qui manque : les mots, puis la notation,
            puis de quoi écrire soi-même.
          </p>
        </header>
        <Carte onOuvrir={ouvrir} />
      </main>
    )
  }

  const { precedent, suivant } = voisins(module.number)

  return (
    <main className="module-page">
      <nav className="barre" aria-label="Navigation du cours">
        <button type="button" className="retour" onClick={() => ouvrir(null)}>
          <span aria-hidden="true">←</span> Tous les modules
        </button>
        <span className="position">
          Module {module.number} sur {MODULES[MODULES.length - 1]!.number}
        </span>
        <span className="voisins">
          <Fleche sens="avant" module={precedent} onOuvrir={ouvrir} />
          <Fleche sens="apres" module={suivant} onOuvrir={ouvrir} />
        </span>
      </nav>

      <Passage place="haut" precedent={precedent} suivant={suivant} onOuvrir={ouvrir} />

      <header>
        <p className="fil">Module {module.number}</p>
        <h1>{module.title}</h1>
        <p className="resume">{module.summary}</p>
      </header>

      <Module module={module} />

      <Passage place="bas" precedent={precedent} suivant={suivant} onOuvrir={ouvrir} />
    </main>
  )
}

/**
 * Le passage d'un module à l'autre, en haut et en bas de la page.
 *
 * Deux fois le même bloc, et non deux dispositifs différents : on n'aborde
 * pas un module autrement qu'on le quitte, et une navigation qui change de
 * forme selon l'endroit demande à être réapprise à chaque fois.
 */
function Passage({
  place,
  precedent,
  suivant,
  onOuvrir,
}: {
  readonly place: 'haut' | 'bas'
  readonly precedent: ModuleDuCours | null
  readonly suivant: ModuleDuCours | null
  readonly onOuvrir: (n: number) => void
}) {
  return (
    <nav
      className={`suite ${place}`}
      aria-label={place === 'haut' ? 'Modules voisins' : 'Module suivant'}
    >
      <Voisin sens="avant" module={precedent} onOuvrir={onOuvrir} />
      <Voisin sens="apres" module={suivant} onOuvrir={onOuvrir} />
    </nav>
  )
}

/** La flèche compacte de la barre : elle nomme sa cible sans l'afficher. */
function Fleche({
  sens,
  module,
  onOuvrir,
}: {
  readonly sens: 'avant' | 'apres'
  readonly module: ModuleDuCours | null
  readonly onOuvrir: (n: number) => void
}) {
  const libelle = sens === 'avant' ? 'Module précédent' : 'Module suivant'
  return (
    <button
      type="button"
      className="fleche"
      disabled={module === null}
      title={module ? `${libelle} : ${module.title}` : libelle}
      aria-label={module ? `${libelle} : ${module.title}` : libelle}
      onClick={() => module && onOuvrir(module.number)}
    >
      {sens === 'avant' ? '←' : '→'}
    </button>
  )
}

/**
 * Le passage en pied de page.
 *
 * Il nomme sa cible, contrairement à la flèche de la barre : arrivée au bout
 * d'une leçon, la question n'est pas « où puis-je aller » mais « qu'est-ce qui
 * vient ensuite » — et le titre y répond mieux qu'un numéro.
 */
function Voisin({
  sens,
  module,
  onOuvrir,
}: {
  readonly sens: 'avant' | 'apres'
  readonly module: ModuleDuCours | null
  readonly onOuvrir: (n: number) => void
}) {
  // La case vide garde le suivant à droite quand il n'y a pas de précédent.
  if (!module) return <span className={`voisin vide ${sens}`} />

  return (
    <button type="button" className={`voisin ${sens}`} onClick={() => onOuvrir(module.number)}>
      <span className="sens">
        {sens === 'avant' ? '← Précédent' : 'Suivant →'}
      </span>
      <span className="titre">
        {module.number}. {module.title}
      </span>
    </button>
  )
}
