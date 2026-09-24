import { isWellFormed, measureLength, toNumber, type Pattern } from '@rythmes/core'
import type { Contrainte, Exercise, Module, Term } from './types'

/**
 * Les vérifications de cohérence du cours.
 *
 * Ce ne sont pas des garde-fous défensifs mais des **tests de rédaction** : ils
 * attrapent les fautes qu'on commet en écrivant du contenu par morceaux, et
 * qu'aucune relecture ne voit passer — un prérequis qui boucle, un module
 * devenu inatteignable, un mot employé trois modules avant d'être défini.
 *
 * Chacun reçoit les données qu'il examine plutôt que de les lire dans une
 * globale : c'est ce qui permet à ce paquet de ne dépendre d'aucun module, donc
 * aux modules de dépendre de lui. `assembleCours` fait la liaison, et les
 * appelants retrouvent des fonctions sans argument de données.
 */

/** Les modules qui participent à un cycle de prérequis. */
export function cycles(modules: readonly Module[]): readonly number[][] {
  const trouves: number[][] = []
  const etat = new Map<number, 'en-cours' | 'fini'>()

  const visiter = (n: number, chemin: number[]): void => {
    if (etat.get(n) === 'fini') return
    if (etat.get(n) === 'en-cours') {
      trouves.push([...chemin.slice(chemin.indexOf(n)), n])
      return
    }
    etat.set(n, 'en-cours')
    for (const p of modules.find((m) => m.number === n)?.requires ?? []) {
      visiter(p, [...chemin, n])
    }
    etat.set(n, 'fini')
  }

  for (const m of modules) visiter(m.number, [])
  return trouves
}

/** Les modules qu'aucun chemin de prérequis ne relie au module 0. */
export function unreachable(modules: readonly Module[]): readonly number[] {
  const atteints = new Set<number>()
  let change = true

  while (change) {
    change = false
    for (const m of modules) {
      if (atteints.has(m.number)) continue
      if (m.requires.length === 0 || m.requires.every((r) => atteints.has(r))) {
        atteints.add(m.number)
        change = true
      }
    }
  }

  return modules.filter((m) => !atteints.has(m.number)).map((m) => m.number)
}

/** Les prérequis qui désignent un module inexistant. */
export const danglingRequires = (modules: readonly Module[]): readonly string[] =>
  modules.flatMap((m) =>
    m.requires
      .filter((r) => !modules.some((x) => x.number === r))
      .map((r) => `le module ${m.number} exige le module ${r}, qui n’existe pas`),
  )

/** Les renvois `voirAussi` qui pointent vers un terme absent. */
export const danglingSeeAlso = (lexique: readonly Term[]): readonly string[] =>
  lexique.flatMap((t) =>
    (t.voirAussi ?? [])
      .filter((s) => !lexique.some((x) => x.slug === s))
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
 *
 * Il compare des **mots, pas des sens** : « on mesure ta dérive » déclenchera
 * le terme *mesure* du module 2. C'est un faux positif assumé — distinguer le
 * verbe du nom demanderait une analyse grammaticale, pour un gain nul :
 * reformuler lève l'alerte, et la reformulation est presque toujours plus
 * claire que la phrase qui l'avait provoquée.
 */
export function forwardReferences(
  lexique: readonly Term[],
  texte: string,
  module: number,
): readonly string[] {
  const normalise = (s: string) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')

  const corps = normalise(texte)

  return lexique
    .filter((t) => t.introduitAu > module)
    .filter((t) => !t.courant)
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
      if (e.voix && !e.grille.onsets.some((o) => o.voice === e.voix)) {
        p.push(`${e.id} : la voix ${e.voix} ne joue rien dans ce motif`)
      }
      break
    case 'reperage':
      if (differences(e.ecrit, e.joue) !== 1) {
        p.push(`${e.id} : l’écart doit porter sur une attaque et une seule`)
      }
      break
    case 'composition':
      if (e.contraintes.length === 0) p.push(`${e.id} : composer sans contrainte n’est pas un exercice`)
      for (const c of e.contraintes) {
        if ((c.regle === 'au-moins' || c.regle === 'au-plus') && c.n === undefined) {
          p.push(`${e.id} : « ${c.libelle} » ne dit pas combien`)
        }
      }
      break
    default:
      break
  }

  if (e.bpm !== undefined && (e.bpm < 30 || e.bpm > 200)) {
    p.push(`${e.id} : un tempo de ${e.bpm} sort des limites raisonnables`)
  }

  return p
}

/** Combien d'attaques séparent deux motifs — pour un repérage, il en faut une. */
function differences(a: Pattern, b: Pattern): number {
  const cle = (o: { at: { num: number; den: number } }) => `${o.at.num}/${o.at.den}`
  const gauche = new Set(a.onsets.map(cle))
  const droite = new Set(b.onsets.map(cle))
  const manquantes = [...gauche].filter((k) => !droite.has(k)).length
  const ajoutees = [...droite].filter((k) => !gauche.has(k)).length
  return Math.max(manquantes, ajoutees)
}

/** Les contraintes qu'une composition ne respecte pas. */
export function contraintesViolees(
  exercice: Extract<Exercise, { kind: 'composition' }>,
  propose: Pattern,
): readonly Contrainte[] {
  const horsDuTemps = (o: Pattern['onsets'][number]) => {
    const t = toNumber(o.at) / toNumber(measureLength(propose.meter))
    const parMesure = propose.meter.beats / (propose.meter.unit / 4)
    return Math.abs(t * parMesure - Math.round(t * parMesure)) > 1e-9
  }

  return exercice.contraintes.filter((c) => {
    switch (c.regle) {
      case 'mesures-pleines':
        return !isWellFormed(propose)
      case 'au-moins':
        return propose.onsets.length < (c.n ?? 0)
      case 'au-plus':
        return propose.onsets.length > (c.n ?? Infinity)
      case 'une-hors-du-temps':
        return !propose.onsets.some(horsDuTemps)
      case 'commence-sur-le-temps':
        return propose.onsets.length === 0 || toNumber(propose.onsets[0]!.at) !== 0
      case 'commence-apres-le-debut':
        // L'élan d'une levée : quelque chose se joue, mais pas sur la toute
        // première position.
        return propose.onsets.length === 0 || toNumber(propose.onsets[0]!.at) === 0
    }
  })
}
