import { fraction, meter, pattern, type Voice } from '@rythmes/core'
import { describe, expect, it } from 'vitest'
import {
  cycles,
  danglingRequires,
  danglingSeeAlso,
  EXERCISES_BY_MODULE,
  exerciseProblems,
  forwardReferences,
  LEXIQUE,
  misplacedExercises,
  MODULES,
  unreachable,
} from './index'

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

describe('le découpage en libs', () => {
  it('ne laisse aucun exercice dans le module d’un autre', () => {
    // Une lib porte ses exercices, et chaque exercice porte son numéro de
    // module : la jointure que le découpage a créée, et que rien dans les types
    // ne contraint.
    expect(misplacedExercises()).toEqual([])
  })
})

describe('le lexique', () => {
  // Le désaccord entre « le module annonce ce terme » et « le terme dit venir
  // de ce module » n'a plus de test parce qu'il n'a plus d'existence : les deux
  // se lisent maintenant sur la même écriture, le lexique que porte la lib du
  // module. Voir `assembleCours`.


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

describe('le registre des exercices', () => {
  it('range chaque exercice sous son propre module', () => {
    for (const [numero, exercices] of Object.entries(EXERCISES_BY_MODULE)) {
      for (const e of exercices) {
        expect(e.module, `${e.id} est rangé sous ${numero}`).toBe(Number(numero))
      }
    }
  })

  it('ne référence que des modules qui existent', () => {
    for (const numero of Object.keys(EXERCISES_BY_MODULE)) {
      expect(MODULES.some((m) => m.number === Number(numero))).toBe(true)
    }
  })

  it('n’a aucun identifiant en double, tous modules confondus', () => {
    const ids = Object.values(EXERCISES_BY_MODULE).flatMap((es) => es.map((e) => e.id))
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('le diagnostic du module 0', () => {
  const diagnostic = EXERCISES_BY_MODULE[0] ?? []

  it('pose ses trois questions : tenir, compter, lire', () => {
    // Le compte exact n'est pas le sujet — il a changé une fois et changera
    // encore. Ce qui ne doit pas changer, c'est qu'aucune des trois questions
    // ne disparaisse : le diagnostic existe pour lever une zone d'ombre
    // précise, et une seule des trois y répond.
    const genres = new Set(diagnostic.map((e) => e.kind))
    expect(genres.has('frappe'), 'rien ne sonde la tenue').toBe(true)
    expect(genres.has('discrimination'), 'rien ne sonde le comptage').toBe(true)
    expect(genres.has('qcm'), 'rien ne sonde la lecture').toBe(true)
  })

  it('reste plus court qu’une page de module', () => {
    // Un diagnostic n'entraîne rien : il mesure. Se mesurer quinze fois avant
    // d'avoir rien appris décourage sans rien apprendre.
    expect(diagnostic.length).toBeLessThanOrEqual(10)
  })

  it('n’emploie aucun mot de théorie dans ses consignes', () => {
    // À ce stade, nommer serait déjà enseigner. Le diagnostic demande de
    // compter et de comparer, jamais de qualifier — ce que le contrôle des
    // références en avant vérifie mot à mot, puisque tout le lexique vient
    // après le module 0.
    expect(diagnostic.flatMap((e) => forwardReferences(e.consigne, 0))).toEqual([])
  })

  it('sonde la tenue du tempo en faisant taire le clic', () => {
    const tenue = diagnostic.find((e) => e.kind === 'frappe')
    expect(tenue).toBeDefined()
    expect(tenue!.kind === 'frappe' && tenue!.clicSArrete).toBe(true)
  })

  it('est valide', () => {
    expect(diagnostic.flatMap(exerciseProblems)).toEqual([])
  })
})

describe('les mots trop courants', () => {
  it('sont ignorés par le contrôle des références en avant', () => {
    // On ne peut pas écrire une leçon de rythme sans jamais dire « en même
    // temps ». Surveiller ces mots-là rendrait toute prose impossible avant le
    // module qui les définit.
    expect(forwardReferences('Écoute en même temps la mesure et l’accent.', 1)).toEqual([])
  })

  it('n’affaiblissent pas le contrôle sur le vocabulaire propre', () => {
    expect(forwardReferences('Une hémiole, un ostinato.', 1)).toHaveLength(2)
  })
})


describe('les lignes à frapper', () => {
  const NOIRE = fraction(1, 4)

  const batterie = (voix: readonly Voice[]) =>
    pattern({
      meter: meter(2, 4),
      onsets: voix.flatMap((v) => [
        { at: fraction(0, 1), duration: NOIRE, voice: v },
        { at: fraction(1, 4), duration: NOIRE, voice: v },
      ]),
    })

  const exercice = (grille: ReturnType<typeof batterie>, voix?: readonly Voice[]) =>
    ({
      kind: 'frappe',
      id: 'essai',
      module: 1,
      consigne: 'Frappe.',
      grille,
      bpm: 90,
      parTemps: NOIRE,
      cycles: 2,
      ...(voix ? { voix } : {}),
    }) as const

  it('sont exigées dès qu’une partition en montre plusieurs', () => {
    // Le défaut qui a rendu trois déchiffrages injouables : sans ligne
    // désignée, la correction attendait les attaques de toutes les voix, dont
    // celles qui tombent au même instant.
    expect(exerciseProblems(exercice(batterie(['kick', 'hihat'])))).toEqual([
      'essai : 2 voix écrites, et aucune désignée à frapper',
    ])
  })

  it('ne sont pas exigées quand il n’y a rien à choisir', () => {
    expect(exerciseProblems(exercice(batterie(['kick'])))).toEqual([])
  })

  it('doivent jouer quelque chose', () => {
    expect(exerciseProblems(exercice(batterie(['kick']), ['snare']))).toEqual([
      'essai : la voix snare ne joue rien dans ce motif',
    ])
  })

  it('acceptent deux lignes simultanées — c’est ce qu’on vient chercher à deux mains', () => {
    expect(exerciseProblems(exercice(batterie(['kick', 'hihat']), ['kick', 'hihat']))).toEqual([])
  })

  it('ne dépassent pas le nombre de doigts', () => {
    const cinq: readonly Voice[] = ['kick', 'snare', 'hihat', 'clave', 'cowbell']
    expect(exerciseProblems(exercice(batterie(cinq), cinq))).toContain(
      'essai : 5 voix à frapper, au-delà des 3 doigts',
    )
  })
})
