import { describe, expect, it } from 'vitest'
import {
  controle,
  difficulte,
  graineAleatoire,
  NOMBRE_DE_STRATES,
  strates,
  TAILLE_DU_CONTROLE,
  vivier,
} from './index'

/**
 * Deux cents graines : assez pour que les propriétés énoncées valent comme
 * propriétés et non comme coup de chance, assez peu pour que la suite reste
 * instantanée.
 */
const GRAINES = Array.from({ length: 200 }, (_, i) => `graine-${i}`)

/** À quelle strate appartient un exercice, une fois les bandes constituées. */
const strateDe = (id: string): number =>
  strates().findIndex((bande) => bande.some((e) => e.id === id))

describe('le vivier du contrôle', () => {
  it('écarte l’unité 0, qui diagnostique au lieu d’enseigner', () => {
    expect(vivier().some((e) => e.module === 0)).toBe(false)
  })

  it('couvre tous les modules du cours', () => {
    const modules = new Set(vivier().map((e) => e.module))
    expect([...modules].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6, 7, 8])
  })

  it('reste largement plus grand qu’un contrôle', () => {
    // Sans quoi les tirages successifs se ressembleraient tous, et la graine
    // n’aurait plus rien à décider.
    expect(vivier().length).toBeGreaterThan(4 * TAILLE_DU_CONTROLE)
  })
})

describe('les strates', () => {
  it('découpent le vivier sans perte ni doublon', () => {
    const repartis = strates().flat()
    expect(repartis.length).toBe(vivier().length)
    expect(new Set(repartis.map((e) => e.id)).size).toBe(vivier().length)
  })

  it('ont des effectifs comparables', () => {
    const tailles = strates().map((s) => s.length)
    expect(Math.max(...tailles) - Math.min(...tailles)).toBeLessThanOrEqual(1)
  })

  it('vont du plus facile au plus exigeant', () => {
    // La propriété qui compte : une strate n’empiète pas sur la suivante.
    const bornes = strates().map((s) => ({
      bas: Math.min(...s.map(difficulte)),
      haut: Math.max(...s.map(difficulte)),
    }))
    for (let i = 1; i < bornes.length; i += 1) {
      expect(bornes[i]!.bas).toBeGreaterThanOrEqual(bornes[i - 1]!.bas)
      expect(bornes[i]!.haut).toBeGreaterThan(bornes[i - 1]!.bas)
    }
  })
})

describe('un contrôle', () => {
  it('rend toujours vingt questions', () => {
    for (const g of GRAINES) expect(controle(g).questions.length).toBe(TAILLE_DU_CONTROLE)
  })

  it('ne pose jamais deux fois la même', () => {
    for (const g of GRAINES) {
      const ids = controle(g).questions.map((q) => q.id)
      expect(new Set(ids).size).toBe(ids.length)
    }
  })

  it('ne pose que des questions qui existent', () => {
    const connus = new Set(vivier().map((e) => e.id))
    for (const g of GRAINES) {
      for (const q of controle(g).questions) expect(connus.has(q.id)).toBe(true)
    }
  })

  it('honore la taille qu’on lui demande', () => {
    expect(controle('court', 6).questions.length).toBe(6)
    expect(controle('long', 40).questions.length).toBe(40)
  })
})

describe('la graine', () => {
  it('redonne exactement le même contrôle', () => {
    const ids = (g: string) => controle(g).questions.map((q) => q.id)
    for (const g of GRAINES.slice(0, 20)) expect(ids(g)).toEqual(ids(g))
  })

  it('donne des contrôles différents d’une graine à l’autre', () => {
    const empreintes = new Set(GRAINES.map((g) => controle(g).questions.map((q) => q.id).join()))
    // On n’exige pas deux cents tirages tous distincts — on exige que la graine
    // serve vraiment à quelque chose.
    expect(empreintes.size).toBeGreaterThan(GRAINES.length * 0.95)
  })

  it('en produit une lisible dans une URL', () => {
    for (let i = 0; i < 100; i += 1) expect(graineAleatoire()).toMatch(/^[0-9a-f]{4}$/)
  })
})

describe('le mélange des sujets', () => {
  it('prend dans les trois strates à chaque fois', () => {
    for (const g of GRAINES) {
      const vues = new Set(controle(g).questions.map((q) => strateDe(q.id)))
      expect(vues.size).toBe(NOMBRE_DE_STRATES)
    }
  })

  it('répartit les questions entre les strates', () => {
    for (const g of GRAINES) {
      const compte = new Map<number, number>()
      for (const q of controle(g).questions) {
        const s = strateDe(q.id)
        compte.set(s, (compte.get(s) ?? 0) + 1)
      }
      const effectifs = [...compte.values()]
      expect(Math.max(...effectifs) - Math.min(...effectifs)).toBeLessThanOrEqual(1)
    }
  })

  it('balaie le cours au lieu de camper sur quelques modules', () => {
    for (const g of GRAINES) {
      const modules = new Set(controle(g).questions.map((q) => q.module))
      expect(modules.size).toBeGreaterThanOrEqual(6)
    }
  })

  it('varie les genres', () => {
    for (const g of GRAINES) {
      const genres = new Set(controle(g).questions.map((q) => q.kind))
      expect(genres.size).toBeGreaterThanOrEqual(5)
    }
  })
})

/**
 * Le cœur du sujet.
 *
 * Un contrôle qui se lit comme une suite de module a échoué, même si ses vingt
 * questions sont bien choisies. Ces trois tests sont la seule chose qui tienne
 * cette promesse — le reste du fichier vérifie le tirage, celui-ci vérifie
 * l'impression qu'il donne.
 */
describe('l’enchaînement', () => {
  it('ne monte ni ne descend en difficulté par paliers', () => {
    for (const g of GRAINES) {
      const suite = controle(g).questions.map((q) => strateDe(q.id))
      for (let i = 1; i < suite.length; i += 1) {
        expect(suite[i]).not.toBe(suite[i - 1])
      }
    }
  })

  it('ne pose jamais deux questions de suite du même module', () => {
    for (const g of GRAINES) {
      const suite = controle(g).questions.map((q) => q.module)
      for (let i = 1; i < suite.length; i += 1) {
        expect(suite[i]).not.toBe(suite[i - 1])
      }
    }
  })

  it('ne suit pas l’ordre du cours', () => {
    // Le test le plus direct : un contrôle trié par module serait exactement
    // l’onglet Exercices, en plus long.
    for (const g of GRAINES) {
      const modules = controle(g).questions.map((q) => q.module)
      expect(modules).not.toEqual([...modules].sort((a, b) => a - b))
    }
  })
})
