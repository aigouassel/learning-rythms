import { isWellFormed, measureCount, type Pattern } from '@rythmes/core'
import { readFileSync } from 'node:fs'
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import {
  EXERCISES_BY_MODULE,
  exerciseProblems,
  forwardReferences,
  moduleByNumber,
  MODULES,
  termBySlug,
} from './index'

const sansAccents = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

/** Les dossiers de module présents sur le disque, avec leur numéro. */
/** Les libs de module, sur le disque — `modules/` à la racine du dépôt. */
const MODULES_DIR = join(__dirname, '..', '..', '..', 'modules')

const DOSSIERS = readdirSync(MODULES_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => ({ nom: d.name, numero: Number(d.name.slice(0, 2)) }))
  .sort((a, b) => a.numero - b.numero)

const lecon = (nom: string): string | null => {
  try {
    return readFileSync(join(MODULES_DIR, nom, 'src', 'lesson.mdx'), 'utf8')
  } catch {
    return null
  }
}

const motifs = async (nom: string): Promise<Record<string, Pattern>> => {
  try {
    return (await import(`../../../modules/${nom}/src/patterns.ts`)) as Record<string, Pattern>
  } catch {
    return {}
  }
}

describe('chaque dossier correspond à un module déclaré', () => {
  it.each(DOSSIERS)('$nom', ({ numero }) => {
    expect(moduleByNumber(numero), `aucun module ${numero}`).toBeDefined()
  })
})

describe.each(DOSSIERS.filter((d) => lecon(d.nom) !== null))('la leçon $nom', ({ nom, numero }) => {
  const texte = lecon(nom)!
  const module = moduleByNumber(numero)!

  it('n’emploie aucun mot que le cours n’a pas encore donné', () => {
    // Le gardien de l'incrémentalité. Le graphe des prérequis déclare une
    // intention ; ceci constate ce que le texte fait vraiment.
    expect(forwardReferences(texte, numero)).toEqual([])
  })

  it('nomme les termes que le module annonce introduire', () => {
    const corps = sansAccents(texte)
    const absents = module.introduces.filter((slug) => {
      const terme = termBySlug(slug)!
      return !sansAccents(terme.nom)
        .split(' ')
        .every((mot) => corps.includes(mot))
    })
    expect(absents).toEqual([])
  })

  it('fait entendre avant de nommer', () => {
    // Le premier exemple jouable précède la première liste de définitions.
    const premierExemple = texte.indexOf('<Exemple')
    expect(premierExemple, 'aucun exemple jouable').toBeGreaterThan(0)

    const premierTableau = texte.indexOf('\n| ')
    if (premierTableau > 0) expect(premierExemple).toBeLessThan(premierTableau)
  })

  it('se termine sur ce qu’il faut retenir', () => {
    expect(texte).toMatch(/## Ce qu’il faut retenir/)
  })
})

describe.each(DOSSIERS)('les motifs de $nom', ({ nom, numero }) => {
  it('remplissent leurs mesures et restent dans le répertoire du module', async () => {
    const tous = await motifs(nom)
    const styles = new Set(moduleByNumber(numero)!.styles)

    // Un import silencieusement vide rendrait tout ce qui suit vacuité : le
    // test passerait sans rien vérifier, ce qui est pire que pas de test.
    expect(Object.keys(tous).length, `aucun motif chargé pour ${nom}`).toBeGreaterThan(0)

    for (const [cle, motif] of Object.entries(tous)) {
      if (!motif || typeof motif !== 'object' || !('onsets' in motif)) continue
      expect(isWellFormed(motif), `${nom}/${cle} ne tombe pas juste`).toBe(true)
      expect(measureCount(motif).num, `${nom}/${cle} est vide`).toBeGreaterThan(0)
      expect(
        motif.style === 'neutre' || styles.has(motif.style),
        `${nom}/${cle} est en ${motif.style}, hors du répertoire du module`,
      ).toBe(true)
    }
  })
})

describe.each(Object.entries(EXERCISES_BY_MODULE))('les exercices du module %s', (_n, exercices) => {
  it('sont valides', () => {
    expect(exercices.flatMap(exerciseProblems)).toEqual([])
  })

  it('n’emploient aucun mot en avance dans leurs consignes', () => {
    expect(exercices.flatMap((e) => forwardReferences(e.consigne, e.module))).toEqual([])
  })

  it('portent des identifiants uniques', () => {
    const ids = exercices.map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('la couverture du cours', () => {
  it('dit honnêtement quels modules sont écrits', () => {
    const ecrits = DOSSIERS.filter((d) => lecon(d.nom) !== null).map((d) => d.numero)
    const avecExercices = Object.keys(EXERCISES_BY_MODULE).map(Number)

    // Ce test ne juge pas l'avancement : il empêche un module d'avoir des
    // exercices sans jamais apparaître dans la table des modules.
    for (const n of [...ecrits, ...avecExercices]) {
      expect(MODULES.some((m) => m.number === n), `module ${n} inconnu`).toBe(true)
    }
  })
})
