import { describe, expect, it } from 'vitest'
import {
  cycles,
  danglingRequires,
  danglingSeeAlso,
  forwardReferences,
  termMismatches,
  unreachable,
} from './coherence'
import { LEXIQUE } from './lexique'
import { MODULES } from './modules'

describe('le graphe du cours', () => {
  it('ne boucle pas', () => {
    expect(cycles()).toEqual([])
  })

  it('n’abandonne aucun module en chemin', () => {
    expect(unreachable()).toEqual([])
  })

  it('ne renvoie à aucun module inexistant', () => {
    expect(danglingRequires()).toEqual([])
  })

  it('numérote sans trou ni doublon', () => {
    const numeros = MODULES.map((m) => m.number)
    expect(numeros).toEqual([...numeros].sort((a, b) => a - b))
    expect(new Set(numeros).size).toBe(numeros.length)
  })

  it('laisse les modules 5 et 6 indépendants l’un de l’autre', () => {
    // Écrire proprement et entendre du complexe sont deux choses distinctes :
    // rien ne justifie d’imposer un ordre entre elles.
    const cinq = MODULES.find((m) => m.number === 5)!
    const six = MODULES.find((m) => m.number === 6)!
    expect(cinq.requires).not.toContain(6)
    expect(six.requires).not.toContain(5)
  })
})

describe('le lexique', () => {
  it('s’accorde avec les modules sur qui introduit quoi', () => {
    expect(termMismatches()).toEqual([])
  })

  it('ne renvoie à aucun terme absent', () => {
    expect(danglingSeeAlso()).toEqual([])
  })

  it('n’a ni slug ni nom en double', () => {
    const slugs = LEXIQUE.map((t) => t.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('dit toujours la sensation avant la définition', () => {
    // Le principe du cours vaut jusque dans le lexique : entendre, puis nommer.
    // Un terme purement graphique porte un tiret, pas une phrase vide.
    for (const t of LEXIQUE) {
      expect(t.sensation.length, `« ${t.slug} » n’a pas de sensation`).toBeGreaterThan(0)
      expect(t.definition.length, `« ${t.slug} » n’a pas de définition`).toBeGreaterThan(0)
    }
  })
})

describe('les références en avant', () => {
  it('laissent passer un texte qui reste dans son vocabulaire', () => {
    const texte = 'Une noire vaut un temps ; deux croches remplissent la même durée.'
    expect(forwardReferences(texte, 3)).toEqual([])
  })

  it('attrapent un mot employé avant son module', () => {
    // « syncope » appartient au module 5. L’écrire au module 3 est la faute
    // typique d’un cours rédigé par morceaux.
    const texte = 'La syncope déplace l’appui.'
    expect(forwardReferences(texte, 3)).toHaveLength(1)
    expect(forwardReferences(texte, 3)[0]).toMatch(/module 3.*introduit au 5/)
  })

  it('attrapent aussi les synonymes d’usage', () => {
    // On dit « levée » en fanfare et « anacrouse » en théorie : le contrôle ne
    // doit pas se laisser contourner par le mot qu’on emploie vraiment.
    expect(forwardReferences('Le morceau commence par une levée.', 2)).toHaveLength(1)
  })

  it('ne se troublent ni de la casse ni des accents', () => {
    expect(forwardReferences('SYNCOPE', 3)).toHaveLength(1)
  })

  it('autorisent un terme à partir de son propre module', () => {
    expect(forwardReferences('La syncope déplace l’appui.', 5)).toEqual([])
  })
})
