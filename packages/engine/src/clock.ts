/**
 * La source de temps du transport.
 *
 * Le moteur ne connaît pas `AudioContext` : il dépend de cette interface, et
 * l'adaptateur Web Audio vit dans l'application, avec le reste de ce qui touche
 * au navigateur.
 *
 * Ce découplage n'est pas de la ceinture et bretelles : il permet de vérifier
 * une polyrythmie 7:5 sur deux cents mesures **instantanément**, en avançant
 * une horloge fictive, là où un vrai contexte audio imposerait d'attendre le
 * temps réel de la musique.
 */
export type Clock = {
  /** L'instant courant, en secondes, sur une origine quelconque mais stable. */
  now(): number
  /**
   * Un réveil régulier et imprécis — celui qui déclenche le réapprovisionnement.
   *
   * L'imprécision est assumée : ce timer ne place aucun son, il ne fait que
   * réveiller le planificateur assez souvent pour qu'il garde de l'avance.
   * Renvoie de quoi l'arrêter.
   */
  every(intervalMs: number, tick: () => void): () => void
}

/**
 * Une horloge qu'on avance à la main, pour les tests.
 *
 * `advance` fait s'écouler le temps en déclenchant au passage les réveils dus,
 * dans l'ordre — de sorte qu'un test voie exactement la même suite d'appels
 * qu'une exécution réelle, sans en subir la durée.
 */
export function fakeClock(): Clock & { advance(seconds: number): void } {
  let t = 0
  let suivant = 0
  const reveils = new Map<number, { intervalMs: number; tick: () => void; prochain: number }>()

  return {
    now: () => t,

    every(intervalMs, tick) {
      const id = suivant++
      reveils.set(id, { intervalMs, tick, prochain: t + intervalMs / 1000 })
      return () => reveils.delete(id)
    },

    advance(seconds) {
      const cible = t + seconds

      for (;;) {
        let prochainId: number | null = null
        let prochainT = Infinity

        for (const [id, r] of reveils) {
          if (r.prochain <= cible && r.prochain < prochainT) {
            prochainId = id
            prochainT = r.prochain
          }
        }

        if (prochainId === null) break

        const reveil = reveils.get(prochainId)!
        t = prochainT
        reveil.prochain = t + reveil.intervalMs / 1000
        reveil.tick()
      }

      t = cible
    },
  }
}
