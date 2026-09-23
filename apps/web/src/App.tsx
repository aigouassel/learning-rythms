import {
  graineAleatoire,
  MODULES,
  moduleByNumber,
  type Module as ModuleDuCours,
} from '@rythmes/content'
import { useEffect, useState } from 'react'
import { Carte } from './Carte'
import { Examen } from './examen/Examen'
import { Module } from './modules/Module'

/**
 * La navigation, portée par le fragment d'URL.
 *
 * Deux lignes de plus qu'un `useState`, et elles achètent le bouton Retour du
 * navigateur, le rechargement qui retombe au bon endroit, et un lien qu'on
 * peut mettre en favori sur un module précis. Pour une application d'une seule
 * page à dix écrans, un routeur serait disproportionné.
 */
type Route =
  | { readonly page: 'sommaire' }
  | { readonly page: 'module'; readonly numero: number; readonly section: string | null }
  /** `graine` est nulle le temps d'un rendu : voir la réécriture dans `App`. */
  | { readonly page: 'examen'; readonly graine: string | null }

/**
 * `#module-3` ouvre le module, `#module-3/le-faux-ami` ouvre sa section,
 * `#examen/7a3f` ouvre ce tirage-là du contrôle.
 *
 * La section est dans le même fragment, après une barre, et non dans une
 * ancre nue : `#le-faux-ami` remplacerait `#module-3` et le routeur, ne
 * reconnaissant plus rien, retomberait au sommaire. Le prix à payer est que
 * le navigateur ne fait plus défiler tout seul — c'est à nous de le faire.
 *
 * La graine du contrôle suit la même forme, et pour la même raison : elle fait
 * partie de l'adresse, donc le lien se met en favori, se partage et se
 * recharge en redonnant exactement les mêmes vingt questions.
 */
function lu(): Route {
  const module = /^#module-(\d+)(?:\/(.+))?$/.exec(window.location.hash)
  if (module) return { page: 'module', numero: Number(module[1]), section: module[2] ?? null }

  const examen = /^#examen(?:\/([0-9a-z]+))?$/.exec(window.location.hash)
  if (examen) return { page: 'examen', graine: examen[1] ?? null }

  return { page: 'sommaire' }
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
  const [route, setRoute] = useState<Route>(lu)

  useEffect(() => {
    const surChangement = () => {
      const suivante = lu()
      setRoute(suivante)
      if (suivante.page !== 'module' || suivante.section === null) return
      const { section } = suivante
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

  /**
   * `#examen` sans graine s'en voit attribuer une, et l'adresse est réécrite.
   *
   * `replaceState` plutôt qu'une affectation au hash : la forme sans graine
   * n'est qu'une porte d'entrée, et la laisser dans l'historique ferait qu'un
   * retour arrière depuis le contrôle retomberait dessus — pour repartir
   * aussitôt sur un tirage encore différent. On la remplace donc au lieu de
   * l'empiler, et le bouton Retour ramène bien au sommaire.
   */
  useEffect(() => {
    if (route.page !== 'examen' || route.graine !== null) return
    const graine = graineAleatoire()
    window.history.replaceState(null, '', `#examen/${graine}`)
    setRoute({ page: 'examen', graine })
  }, [route])

  const ouvrir = (n: number | null) => {
    window.location.hash = n === null ? '' : `module-${n}`
    setRoute(n === null ? { page: 'sommaire' } : { page: 'module', numero: n, section: null })
    // Sans ça, on arrive au module suivant à la hauteur où on a quitté le
    // précédent — c'est-à-dire tout en bas, sur ses exercices.
    window.scrollTo({ top: 0 })
  }

  const ouvrirExamen = (graine = graineAleatoire()) => {
    window.location.hash = `examen/${graine}`
    setRoute({ page: 'examen', graine })
    window.scrollTo({ top: 0 })
  }

  if (route.page === 'examen') {
    // Rien à afficher le temps que la graine soit attribuée — un rendu, jamais
    // deux, et un écran vide vaut mieux qu'un contrôle tiré puis remplacé.
    if (route.graine === null) return null
    return (
      <Examen
        // La clé remonte le contrôle de zéro quand on change de tirage : sans
        // elle, « un autre tirage » renouvellerait les questions en laissant
        // l'avancement à vingt sur vingt.
        key={route.graine}
        graine={route.graine}
        onRejouer={() => ouvrirExamen()}
        onSortir={() => ouvrir(null)}
      />
    )
  }

  const module = route.page === 'module' ? moduleByNumber(route.numero) : null

  if (!module) {
    return (
      <main className="carte-page">
        <header>
          <div className="titre-et-controle">
            <h1>Rythmes</h1>
            <button type="button" className="vers-examen" onClick={() => ouvrirExamen()}>
              Passer le contrôle <span aria-hidden="true">→</span>
            </button>
          </div>
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
