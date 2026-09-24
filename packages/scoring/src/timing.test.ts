import { describe, expect, it } from 'vitest'
import { analyseParLigne, analyseTiming, calibrate } from './timing'

/** Une mesure de quatre noires à ♩ = 60 : les attaques tombent sur la seconde. */
const GRILLE = [0, 1, 2, 3, 4, 5, 6, 7]

const frappes = (erreursMs: readonly number[]) =>
  GRILLE.map((t, i) => ({ at: t + (erreursMs[i] ?? 0) / 1000 }))

describe('une exécution parfaite', () => {
  it('ne trouve rien à dire', () => {
    const a = analyseTiming(GRILLE, frappes(GRILLE.map(() => 0)))
    expect(a.matched).toBe(8)
    expect(a.offsetMs).toBeCloseTo(0)
    expect(a.driftMsPerSecond).toBeCloseTo(0)
    expect(a.dispersionMs).toBeCloseTo(0)
  })
})

describe('les trois défauts, séparés', () => {
  it('isole un décalage constant sans inventer de dérive', () => {
    // Quelqu’un qui joue 20 ms en avance, parfaitement régulièrement.
    const a = analyseTiming(GRILLE, frappes(GRILLE.map(() => -20)))
    expect(a.offsetMs).toBeCloseTo(-20)
    expect(a.driftMsPerSecond).toBeCloseTo(0)
    expect(a.dispersionMs).toBeCloseTo(0)
  })

  it('isole une accélération progressive', () => {
    // Deux millisecondes d’avance de plus à chaque seconde.
    const a = analyseTiming(GRILLE, frappes(GRILLE.map((t) => -2 * t)))
    expect(a.driftMsPerSecond).toBeCloseTo(-2)
    expect(a.dispersionMs).toBeCloseTo(0)
  })

  it('isole l’instabilité pure, sans biais ni tendance', () => {
    // Des écarts qui se compensent, et surtout **sans corrélation au temps**.
    // Une simple alternance +/− n’irait pas : sur un nombre pair de points elle
    // porte une pente, et la régression la lirait comme une vraie dérive.
    const a = analyseTiming(GRILLE, frappes([30, -30, -30, 30, 30, -30, -30, 30]))
    expect(a.offsetMs).toBeCloseTo(0)
    expect(a.driftMsPerSecond).toBeCloseTo(0)
    expect(a.dispersionMs).toBeGreaterThan(25)
  })

  it('démêle un décalage ET une dérive superposés', () => {
    // Le cas réel : 25 ms de latence matérielle, plus une vraie accélération.
    const a = analyseTiming(GRILLE, frappes(GRILLE.map((t) => 25 - 3 * t)))
    expect(a.driftMsPerSecond).toBeCloseTo(-3)
    // La calibration retire le biais ; la dérive, elle, reste.
    const corrige = analyseTiming(GRILLE, frappes(GRILLE.map((t) => 25 - 3 * t)), {
      calibrationMs: 25 - 3 * 3.5,
    })
    expect(corrige.offsetMs).toBeCloseTo(0)
    expect(corrige.driftMsPerSecond).toBeCloseTo(-3)
  })
})

describe('frappes manquantes et surnuméraires', () => {
  it('trouve laquelle manque sans décaler tout le reste', () => {
    // Le piège : la cinquième attaque n’est pas frappée. Un appariement au
    // plus proche déclarerait fausses les quatre suivantes.
    const sansLaCinquieme = frappes(GRILLE.map(() => 0)).filter((_, i) => i !== 4)
    const a = analyseTiming(GRILLE, sansLaCinquieme)

    expect(a.missed).toBe(1)
    expect(a.extra).toBe(0)
    expect(a.matched).toBe(7)
    expect(a.offsetMs).toBeCloseTo(0)
  })

  it('compte une frappe en trop pour ce qu’elle est', () => {
    const avecUneDeTrop = [...frappes(GRILLE.map(() => 0)), { at: 3.5 }].sort((x, y) => x.at - y.at)
    const a = analyseTiming(GRILLE, avecUneDeTrop)

    expect(a.extra).toBe(1)
    expect(a.missed).toBe(0)
    expect(a.matched).toBe(8)
  })

  it('ne se fâche pas sur une exécution vide', () => {
    const a = analyseTiming(GRILLE, [])
    expect(a.matched).toBe(0)
    expect(a.missed).toBe(8)
    expect(a.offsetMs).toBe(0)
  })
})

describe('calibrate', () => {
  it('prend la médiane, qu’une distraction ne fausse pas', () => {
    // Quinze frappes à 30 ms, une seule à 400 : la moyenne dirait 53 ms.
    const erreurs = [30, 30, 30, 30, 30, 30, 30, 400]
    expect(calibrate(GRILLE, frappes(erreurs))).toBeCloseTo(30)
  })
})

describe('plusieurs lignes à la fois', () => {
  it('n’oppose pas deux voix qui tombent sur le même temps', () => {
    // Grosse caisse et charleston sur les temps 0 et 1, frappés juste, à deux
    // mains. Apparié en bloc, chaque temps n'aurait qu'une frappe pour deux
    // attaques : une manquée et une en trop, à chaque fois.
    const analyse = analyseParLigne([
      { expected: [0, 1], taps: [{ at: 0 }, { at: 1 }] },
      { expected: [0, 1], taps: [{ at: 0 }, { at: 1 }] },
    ])

    expect(analyse.matched).toBe(4)
    expect(analyse.missed).toBe(0)
    expect(analyse.extra).toBe(0)
  })

  it('lit la dérive sur l’exécution entière, pas main par main', () => {
    // Une seule musicienne qui ralentit régulièrement : dix millisecondes de
    // retard de plus à chaque seconde, quelle que soit la main.
    const gauche = { expected: [0, 2, 4], taps: [{ at: 0 }, { at: 2.02 }, { at: 4.04 }] }
    const droite = { expected: [1, 3, 5], taps: [{ at: 1.01 }, { at: 3.03 }, { at: 5.05 }] }

    const analyse = analyseParLigne([gauche, droite])

    expect(analyse.matched).toBe(6)
    expect(analyse.driftMsPerSecond).toBeCloseTo(10, 1)
    expect(analyse.dispersionMs).toBeCloseTo(0, 1)
  })

  it('compte les manques de chaque ligne', () => {
    const analyse = analyseParLigne([
      { expected: [0, 1, 2], taps: [{ at: 0 }] },
      { expected: [0, 1], taps: [{ at: 0 }, { at: 1 }, { at: 5 }] },
    ])

    expect(analyse.matched).toBe(3)
    expect(analyse.missed).toBe(2)
    expect(analyse.extra).toBe(1)
  })
})
