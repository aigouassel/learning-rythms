import { LEXIQUE } from './lexique'
import { MODULES } from './modules'
import type { Exercise } from './types'

/**
 * Les vérifications de cohérence du cours.
 *
 * Ce ne sont pas des garde-fous défensifs mais des **tests de rédaction** : ils
 * attrapent les fautes qu'on commet en écrivant du contenu par morceaux, et
 * qu'aucune relecture ne voit passer — un prérequis qui boucle, un module
 * devenu inatteignable, un mot employé trois modules avant d'être défini.
 */

/** Les modules qui participent à un cycle de prérequis. */
export function cycles(): readonly number[][] {
  const trouves: number[][] = []
  const etat = new Map<number, 'en-cours' | 'fini'>()

  const visiter = (n: number, chemin: number[]): void => {
    if (etat.get(n) === 'fini') return
    if (etat.get(n) === 'en-cours') {
      trouves.push([...chemin.slice(chemin.indexOf(n)), n])
      return
    }
    etat.set(n, 'en-cours')
    for (const p of MODULES.find((m) => m.number === n)?.requires ?? []) {
      visiter(p, [...chemin, n])
    }
    etat.set(n, 'fini')
  }

  for (const m of MODULES) visiter(m.number, [])
  return trouves
}

/** Les modules qu'aucun chemin de prérequis ne relie au module 0. */
export function unreachable(): readonly number[] {
  const atteints = new Set<number>()
  let change = true

  while (change) {
    change = false
    for (const m of MODULES) {
      if (atteints.has(m.number)) continue
      if (m.requires.length === 0 || m.requires.every((r) => atteints.has(r))) {
        atteints.add(m.number)
        change = true
      }
    }
  }

  return MODULES.filter((m) => !atteints.has(m.number)).map((m) => m.number)
}

/** Les prérequis qui désignent un module inexistant. */
export const danglingRequires = (): readonly string[] =>
  MODULES.flatMap((m) =>
    m.requires
      .filter((r) => !MODULES.some((x) => x.number === r))
      .map((r) => `le module ${m.number} exige le module ${r}, qui n’existe pas`),
  )

/** Les désaccords entre `module.introduces` et `term.introduitAu`. */
export function termMismatches(): readonly string[] {
  const problemes: string[] = []

  for (const m of MODULES) {
    for (const slug of m.introduces) {
      const terme = LEXIQUE.find((t) => t.slug === slug)
      if (!terme) {
        problemes.push(`le module ${m.number} annonce « ${slug} », absent du lexique`)
      } else if (terme.introduitAu !== m.number) {
        problemes.push(
          `« ${slug} » est annoncé par le module ${m.number} mais se dit introduit au ${terme.introduitAu}`,
        )
      }
    }
  }

  for (const t of LEXIQUE) {
    const m = MODULES.find((x) => x.number === t.introduitAu)
    if (!m) problemes.push(`« ${t.slug} » dit venir du module ${t.introduitAu}, qui n’existe pas`)
    else if (!m.introduces.includes(t.slug)) {
      problemes.push(`« ${t.slug} » dit venir du module ${t.introduitAu}, qui ne l’annonce pas`)
    }
  }

  return problemes
}

/** Les renvois `voirAussi` qui pointent vers un terme absent. */
export const danglingSeeAlso = (): readonly string[] =>
  LEXIQUE.flatMap((t) =>
    (t.voirAussi ?? [])
      .filter((s) => !LEXIQUE.some((x) => x.slug === s))
      .map((s) => `« ${t.slug} » renvoie à « ${s} », absent du lexique`),
  )

/**
 * Les termes cités dans un texte alors que leur module vient plus tard.
 *
 * C'est le gardien réel de l'incrémentalité. Le graphe de prérequis déclare une
 * intention ; celui-ci constate ce que le texte fait vraiment. On peut très
 * bien déclarer que le module 5 ne dépend que du module 4 et y écrire
 * « triolet » par inadvertance — le compilateur, lui, ne se laisse pas
 * convaincre par les intentions.
 */
export function forwardReferences(texte: string, module: number): readonly string[] {
  const normalise = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')

  const corps = normalise(texte)

  return LEXIQUE.filter((t) => t.introduitAu > module)
    .filter((t) =>
      [t.nom, ...(t.aussiAppele ?? [])].some((mot) =>
        new RegExp(`\\b${normalise(mot).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'u').test(corps),
      ),
    )
    .map((t) => `« ${t.nom} » est employé au module ${module} mais introduit au ${t.introduitAu}`)
}

/** Ce qui rend un exercice invalide — vérifié par les tests, pas à l'exécution. */
export function exerciseProblems(e: Exercise): readonly string[] {
  const p: string[] = []
  const borne = (i: number, n: number, quoi: string) => {
    if (i < 0 || i >= n) p.push(`${e.id} : la bonne réponse ${quoi} est hors des options`)
  }

  switch (e.kind) {
    case 'discrimination':
      if (e.choix.length < 2) p.push(`${e.id} : un choix unique n’en est pas un`)
      borne(e.bonne, e.choix.length, '')
      break
    case 'qcm':
      if (e.options.length < 2) p.push(`${e.id} : un QCM demande plusieurs options`)
      borne(e.bonne, e.options.length, '')
      break
    case 'appariement':
      if (e.motifs.length < 2) p.push(`${e.id} : apparier demande au moins deux motifs`)
      break
    case 'completion':
      if (e.donne.onsets.length >= e.attendu.onsets.length) {
        p.push(`${e.id} : rien à compléter, tout est déjà donné`)
      }
      break
    case 'frappe':
      if (e.cycles < 1) p.push(`${e.id} : il faut au moins un passage`)
      break
    default:
      break
  }

  if ('bpm' in e && (e.bpm < 30 || e.bpm > 200)) {
    p.push(`${e.id} : un tempo de ${e.bpm} sort des limites raisonnables`)
  }

  return p
}
