import { isWellFormed, measureCount } from '@rythmes/core'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { exerciseProblems, forwardReferences } from '../../coherence'
import { termBySlug } from '../../lexique'
import { moduleByNumber } from '../../modules'
import { EXERCISES } from './exercises'
import * as PATTERNS from './patterns'

const lecon = readFileSync(join(__dirname, 'lesson.mdx'), 'utf8')

const sansAccents = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

describe('la leçon', () => {
  it('n’emploie aucun mot que le cours n’a pas encore donné', () => {
    // Le gardien de l'incrémentalité : on peut déclarer les bons prérequis et
    // écrire « syncope » par inadvertance. Le texte, lui, ne ment pas.
    expect(forwardReferences(lecon, 3)).toEqual([])
  })

  it('introduit bien les termes que le module annonce', () => {
    const module = moduleByNumber(3)!
    expect(module.introduces.length).toBeGreaterThan(0)

    // On compare des formes normalisées des deux côtés : « durée » et « duree »
    // sont le même mot, et un test qui l'ignorerait signalerait des absences
    // imaginaires.
    const corps = sansAccents(lecon)
    const absent = module.introduces.filter((slug) => {
      const terme = termBySlug(slug)!
      return !sansAccents(terme.nom).split(' ').every((mot) => corps.includes(mot))
    })
    expect(absent).toEqual([])
  })

  it('fait entendre avant de nommer', () => {
    // Le premier exemple jouable arrive avant le tableau des noms.
    const premierExemple = lecon.indexOf('<Exemple')
    const tableauDesNoms = lecon.indexOf('| ronde |')
    expect(premierExemple).toBeGreaterThan(0)
    expect(premierExemple).toBeLessThan(tableauDesNoms)
  })
})

describe('les motifs du module', () => {
  it('remplissent tous leurs mesures', () => {
    for (const [nom, motif] of Object.entries(PATTERNS)) {
      expect(isWellFormed(motif), `${nom} ne tombe pas juste`).toBe(true)
      expect(measureCount(motif).num, `${nom} est vide`).toBeGreaterThan(0)
    }
  })

  it('restent dans le répertoire déclaré par le module', () => {
    const styles = new Set(moduleByNumber(3)!.styles)
    for (const [nom, motif] of Object.entries(PATTERNS)) {
      expect(styles.has(motif.style), `${nom} est en ${motif.style}`).toBe(true)
    }
  })
})

describe('les exercices', () => {
  it('sont tous valides', () => {
    expect(EXERCISES.flatMap(exerciseProblems)).toEqual([])
  })

  it('portent des identifiants uniques et le bon numéro de module', () => {
    const ids = EXERCISES.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
    expect(EXERCISES.every((e) => e.module === 3)).toBe(true)
  })

  it('n’emploient aucun mot en avance dans leurs consignes', () => {
    expect(EXERCISES.flatMap((e) => forwardReferences(e.consigne, 3))).toEqual([])
  })

  it('portent les quatre niveaux de nommage, plus une lecture', () => {
    // Le seul module à les avoir tous les quatre : il installe la notation,
    // donc il doit la faire manipuler sous toutes ses formes.
    const genres = EXERCISES.map((e) => e.kind)
    expect(genres).toContain('qcm')
    expect(genres).toContain('appariement')
    expect(genres).toContain('completion')
    expect(genres).toContain('dictee')
    expect(genres).toContain('dechiffrage')
  })

  it('désignent une bonne réponse qui est vraiment celle qu’on joue', () => {
    for (const e of EXERCISES) {
      if (e.kind !== 'qcm') continue
      expect(e.options[e.bonne]).toBe(e.joue)
    }
  })
})
