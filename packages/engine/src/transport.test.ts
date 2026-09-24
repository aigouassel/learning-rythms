import { fraction, meter, pattern, type Onset, type Voice } from '@rythmes/core'
import { beforeEach, describe, expect, it } from 'vitest'
import { fakeClock } from './clock'
import { tempo } from './tempo'
import { transport, type PlannedEvent } from './transport'

const NOIRE = fraction(1, 4)
const CROCHE = fraction(1, 8)
const NOIRE_POINTEE = fraction(3, 8)

const frappe = (at: [number, number], duration = NOIRE, voice: Voice = 'kick'): Onset => ({
  at: fraction(...at),
  duration,
  voice,
})

const espion = () => {
  const events: PlannedEvent[] = []
  return { events, schedule: (e: PlannedEvent) => void events.push(e) }
}

describe('transport', () => {
  let clock: ReturnType<typeof fakeClock>
  let output: ReturnType<typeof espion>

  beforeEach(() => {
    clock = fakeClock()
    output = espion()
  })

  const quatreNoires = () =>
    pattern({
      meter: meter(4, 4),
      onsets: [frappe([0, 1]), frappe([1, 4]), frappe([1, 2]), frappe([3, 4])],
    })

  it('place les attaques une seconde après l’autre à ♩ = 60', () => {
    const t = transport({
      clock,
      output,
      pattern: quatreNoires(),
      tempo: tempo(60, NOIRE),
      leadMs: 0,
      loop: false,
    })

    t.start()
    clock.advance(4)

    expect(output.events.map((e) => e.at)).toEqual([0, 1, 2, 3])
  })

  it('prend de l’avance : un son est placé avant de se produire', () => {
    const t = transport({
      clock,
      output,
      pattern: quatreNoires(),
      tempo: tempo(60, NOIRE),
      leadMs: 0,
      lookaheadMs: 100,
    })

    t.start()
    // Rien n’a encore sonné, mais la première attaque est déjà datée.
    expect(output.events).toHaveLength(1)
    expect(output.events[0]!.at).toBe(0)

    // À 0,95 s, la deuxième (à 1 s) est entrée dans l’horizon de 100 ms.
    clock.advance(0.95)
    expect(output.events.map((e) => e.at)).toEqual([0, 1])
  })

  it('boucle et numérote les passages', () => {
    const cycles: number[] = []
    const t = transport({
      clock,
      output,
      pattern: quatreNoires(),
      tempo: tempo(60, NOIRE),
      leadMs: 0,
      onCycle: (c) => void cycles.push(c),
    })

    t.start()
    clock.advance(8)

    expect(cycles).toEqual([1, 2])
    expect(output.events.filter((e) => e.cycle === 1).map((e) => e.at)).toEqual([4, 5, 6, 7])
  })

  it('s’arrête de lui-même quand la boucle est refusée', () => {
    const t = transport({
      clock,
      output,
      pattern: quatreNoires(),
      tempo: tempo(60, NOIRE),
      leadMs: 0,
      loop: false,
    })

    t.start()
    clock.advance(10)

    expect(t.running).toBe(false)
    expect(output.events).toHaveLength(4)
  })

  it('cesse de planifier après stop', () => {
    const t = transport({ clock, output, pattern: quatreNoires(), tempo: tempo(60, NOIRE), leadMs: 0 })

    t.start()
    clock.advance(1)
    const apresUneSeconde = output.events.length
    t.stop()
    clock.advance(10)

    expect(output.events).toHaveLength(apresUneSeconde)
  })

  it('ne tourne pas dans le vide sur un motif sans attaque', () => {
    const t = transport({
      clock,
      output,
      pattern: pattern({ meter: meter(4, 4), onsets: [] }),
      tempo: tempo(60, NOIRE),
      leadMs: 0,
    })

    t.start()
    clock.advance(10)

    expect(output.events).toHaveLength(0)
  })
})

describe('tempo et chiffrage', () => {
  it('compte en noires pointées sur une mesure composée', () => {
    // ♩. = 60 en 6/8 : deux temps par mesure, une seconde chacun.
    const clock = fakeClock()
    const output = espion()
    const p = pattern({
      meter: meter(6, 8),
      onsets: [frappe([0, 1], NOIRE_POINTEE), frappe([3, 8], NOIRE_POINTEE)],
    })

    transport({ clock, output, pattern: p, tempo: tempo(60, NOIRE_POINTEE), leadMs: 0, loop: false }).start()
    clock.advance(3)

    expect(output.events.map((e) => e.at)).toEqual([0, 1])
  })
})

describe('polyrythmie', () => {
  it('place trois contre deux sans que les voix se gênent', () => {
    const clock = fakeClock()
    const output = espion()
    const tiers = fraction(1, 6)

    // Sur une blanche : la grosse caisse divise en deux, le charleston en trois.
    const p = pattern({
      meter: meter(4, 4),
      length: fraction(1, 2),
      onsets: [
        frappe([0, 1], NOIRE, 'kick'),
        frappe([1, 4], NOIRE, 'kick'),
        frappe([0, 1], tiers, 'hihat'),
        frappe([1, 6], tiers, 'hihat'),
        frappe([1, 3], tiers, 'hihat'),
      ],
    })

    transport({ clock, output, pattern: p, tempo: tempo(60, NOIRE), leadMs: 0, loop: false }).start()
    clock.advance(3)

    const aux = (v: Voice) => output.events.filter((e) => e.voice === v).map((e) => e.at)
    expect(aux('kick')).toEqual([0, 1])
    // Deux secondes divisées en trois : les deux voix ne se retrouvent qu’au départ.
    expect(aux('hihat')).toEqual([0, 2 / 3, 4 / 3])
  })
})

describe('positionAt', () => {
  it('rend une position continue, pour déplacer un curseur', () => {
    const clock = fakeClock()
    const output = espion()
    const t = transport({
      clock,
      output,
      pattern: pattern({ meter: meter(4, 4), onsets: [frappe([0, 1])] }),
      tempo: tempo(60, NOIRE),
      leadMs: 0,
    })

    t.start()
    // À deux secondes, on est au milieu d’une mesure de quatre secondes.
    expect(t.positionAt(2)).toEqual({ cycle: 0, at: 0.5 })
    // À six secondes, au milieu du deuxième passage.
    expect(t.positionAt(6)).toEqual({ cycle: 1, at: 0.5 })
  })
})

describe('la référence pour la correction', () => {
  it('dit où le motif a commencé et où chaque attaque tombe', () => {
    const clock = fakeClock()
    const output = espion()
    const p = pattern({
      meter: meter(2, 4),
      onsets: [frappe([0, 1]), frappe([1, 4])],
    })

    const t = transport({ clock, output, pattern: p, tempo: tempo(60, NOIRE), leadMs: 500 })
    t.start()

    // Une demi-seconde d’amorce, pour ne pas placer la première attaque dans
    // le passé.
    expect(t.origin).toBeCloseTo(0.5)
    expect(t.expectedTimes(2)).toEqual([0.5, 1.5, 2.5, 3.5])
  })
})

describe('le décompte', () => {
  const clock = () => fakeClock()

  it('bat au tempo, une fois par figure de référence', () => {
    const c = clock()
    const output = espion()
    const p = pattern({ meter: meter(4, 4), onsets: [frappe([0, 1])] })

    const t = transport({
      clock: c,
      output,
      pattern: p,
      tempo: tempo(60, NOIRE),
      leadMs: 0,
      countIn: 1,
    })
    t.start()

    const decompte = output.events.filter((e) => e.cycle < 0)
    expect(decompte.map((e) => e.at)).toEqual([0, 1, 2, 3])
    // L'appui sur le premier : le décompte doit faire entendre le cycle, pas
    // seulement la vitesse.
    expect(decompte.map((e) => e.accent)).toEqual([true, false, false, false])
  })

  it('compte les temps et non les croches, en mesure composée', () => {
    const c = clock()
    const output = espion()
    // 6/8 à ♩. = 60 : deux temps par mesure, pas six.
    const p = pattern({ meter: meter(6, 8), onsets: [frappe([0, 1], CROCHE)] })

    const t = transport({
      clock: c,
      output,
      pattern: p,
      tempo: tempo(60, NOIRE_POINTEE),
      leadMs: 0,
      countIn: 1,
    })
    t.start()

    expect(output.events.filter((e) => e.cycle < 0).map((e) => e.at)).toEqual([0, 1])
  })

  it('repousse l’origine d’autant, et la correction n’en sait rien', () => {
    const c = clock()
    const output = espion()
    const p = pattern({
      meter: meter(2, 4),
      onsets: [frappe([0, 1]), frappe([1, 4])],
    })

    const t = transport({
      clock: c,
      output,
      pattern: p,
      tempo: tempo(60, NOIRE),
      leadMs: 0,
      countIn: 1,
    })
    t.start()

    // Une mesure à deux temps de soixante à la noire : deux secondes.
    expect(t.origin).toBeCloseTo(2)
    expect(t.expectedTimes(1)).toEqual([2, 3])
    // Pendant le décompte, aucun signe ne s'allume.
    expect(t.positionAt(1)).toBeNull()
  })
})

describe('le motif muet', () => {
  it('ne fait rien sonner mais dit toujours où les attaques tombaient', () => {
    const c = fakeClock()
    const output = espion()
    const p = pattern({
      meter: meter(2, 4),
      onsets: [frappe([0, 1]), frappe([1, 4])],
    })

    const t = transport({
      clock: c,
      output,
      pattern: p,
      tempo: tempo(60, NOIRE),
      leadMs: 0,
      silent: true,
      countIn: 1,
    })
    t.start()

    // C'est tout l'enjeu du déchiffrage : le silence porte sur le son, pas sur
    // la connaissance de la grille. Vider le motif de ses attaques rendait la
    // correction impossible — il n'y avait plus rien à attendre.
    expect(t.expectedTimes(1)).toEqual([2, 3])
    // Seul le décompte a sonné.
    expect(output.events.every((e) => e.cycle < 0)).toBe(true)
    expect(output.events).toHaveLength(2)
  })
})
