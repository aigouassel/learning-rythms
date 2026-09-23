/**
 * Ce que l'application retient d'une séance à l'autre.
 *
 * Tout tient dans le navigateur : ni compte, ni serveur. Le cours est pour une
 * seule personne sur une seule machine, et rien n'y justifierait une base de
 * données — ni le coût, ni la dépendance, ni le compte à créer.
 *
 * Chaque accès est protégé : le stockage local peut être refusé (navigation
 * privée, réglages) et lever au lieu de rendre `null`. Une préférence perdue
 * n'est pas une raison de casser la page.
 */
const CLE_CALIBRATION = 'rythmes.calibration-ms'

/** Le biais matériel mesuré à l'unité 0, en millisecondes. */
export function calibration(): number {
  try {
    const brut = localStorage.getItem(CLE_CALIBRATION)
    const valeur = brut === null ? 0 : Number(brut)
    return Number.isFinite(valeur) ? valeur : 0
  } catch {
    return 0
  }
}

export function setCalibration(ms: number): void {
  try {
    localStorage.setItem(CLE_CALIBRATION, String(Math.round(ms)))
  } catch {
    // Rien à faire : la mesure vaudra pour cette séance seulement.
  }
}

export const calibrationFaite = (): boolean => {
  try {
    return localStorage.getItem(CLE_CALIBRATION) !== null
  } catch {
    return false
  }
}
