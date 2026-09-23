import type { TimingAnalysis } from './timing'

export type Finding = {
  readonly kind: 'decalage' | 'derive' | 'dispersion' | 'manques' | 'ajouts' | 'juste'
  readonly severity: 'info' | 'notable' | 'important'
  readonly message: string
}

/**
 * Les seuils au-delà desquels un défaut mérite d'être nommé.
 *
 * Ce sont des choix pédagogiques, pas des constantes physiques. L'oreille
 * distingue environ dix millisecondes sur une attaque isolée ; signaler à ce
 * niveau serait décourageant et faux, puisque la mesure elle-même n'est pas si
 * précise. On nomme ce qui s'entend musicalement, pas ce qui se mesure.
 */
export type Thresholds = {
  readonly offsetMs: number
  readonly driftMsPerSecond: number
  readonly dispersionMs: number
}

export const SEUILS: Thresholds = {
  offsetMs: 25,
  driftMsPerSecond: 4,
  dispersionMs: 30,
}

const signe = (ms: number, avance: string, retard: string): string => (ms < 0 ? avance : retard)

/**
 * Nommer ce qui ne va pas, et rien d'autre.
 *
 * Un élève qui accélère et un élève instable ne doivent pas recevoir le même
 * conseil : le premier doit s'appuyer sur la pulsation, le second doit
 * ralentir. Confondre les deux sous un même « pas assez précis » les laisserait
 * tous deux sans remède.
 *
 * Les constats sortent **du plus important au moins important**, et le décalage
 * global vient en dernier : c'est souvent le matériel qui parle, pas la
 * musicienne.
 */
export function diagnose(a: TimingAnalysis, seuils: Thresholds = SEUILS): readonly Finding[] {
  const constats: Finding[] = []

  if (a.missed > 0) {
    constats.push({
      kind: 'manques',
      severity: a.missed > a.matched / 3 ? 'important' : 'notable',
      message:
        a.missed === 1
          ? 'Une attaque est restée sans frappe.'
          : `${a.missed} attaques sont restées sans frappe.`,
    })
  }

  if (a.extra > 0) {
    constats.push({
      kind: 'ajouts',
      severity: a.extra > a.matched / 3 ? 'important' : 'notable',
      message:
        a.extra === 1
          ? 'Une frappe ne correspond à aucune attaque.'
          : `${a.extra} frappes ne correspondent à aucune attaque.`,
    })
  }

  if (Math.abs(a.driftMsPerSecond) > seuils.driftMsPerSecond) {
    constats.push({
      kind: 'derive',
      severity: 'important',
      message: `${signe(a.driftMsPerSecond, 'Tu accélères', 'Tu ralentis')} au fil du motif — environ ${Math.abs(a.driftMsPerSecond).toFixed(0)} ms par seconde. Appuie-toi sur la pulsation plutôt que sur la note précédente.`,
    })
  }

  if (a.dispersionMs > seuils.dispersionMs) {
    constats.push({
      kind: 'dispersion',
      severity: 'notable',
      message: `Ton placement est irrégulier : ${a.dispersionMs.toFixed(0)} ms d’écart type, sans direction particulière. Essaie plus lentement.`,
    })
  }

  if (Math.abs(a.offsetMs) > seuils.offsetMs) {
    constats.push({
      kind: 'decalage',
      severity: 'info',
      message: `Tu joues ${signe(a.offsetMs, 'en avance', 'en retard')} de ${Math.abs(a.offsetMs).toFixed(0)} ms de façon constante. Si c’est systématique, refais la calibration : ce décalage vient souvent du matériel.`,
    })
  }

  if (constats.length === 0) {
    constats.push({ kind: 'juste', severity: 'info', message: 'En place, et régulier.' })
  }

  return constats
}
