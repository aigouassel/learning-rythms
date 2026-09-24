import type { Voice } from '@rythmes/core'

/**
 * Quelle touche tient quelle ligne.
 *
 * Une seule voix se frappe sur la barre d'espace : c'est le geste le plus
 * immédiat pour taper une pulsation, et les consignes du cours la nomment.
 * Dès qu'il y en a deux, elles passent aux index — F et J, les touches à
 * repère tactile, une main chacune. La main gauche tient la première voix de
 * l'exercice, la droite la seconde. À trois, le pouce reprend sa place au
 * milieu.
 *
 * L'ordre est celui que l'exercice déclare, et non celui des portées : c'est
 * l'auteur du module qui décide quelle ligne va à quelle main.
 */
const TOUCHES: Readonly<Record<number, readonly string[]>> = {
  1: ['Space'],
  2: ['KeyF', 'KeyJ'],
  3: ['KeyF', 'Space', 'KeyJ'],
}

/** Le code clavier attribué à chaque voix, dans l'ordre de l'exercice. */
export const touchesPour = (voix: readonly Voice[]): readonly string[] =>
  TOUCHES[voix.length] ?? []

/** Ce qu'on écrit sur l'écran pour désigner une touche. */
export const nomDeLaTouche = (code: string): string =>
  code === 'Space' ? 'Espace' : code.replace('Key', '')

/**
 * Le nom de chaque voix, tel que le cours la nomme.
 *
 * Les consignes disent « frappe avec la grosse caisse » : l'écran doit dire le
 * même mot, sans quoi rien ne relie la phrase à la portée qu'elle désigne.
 */
export const NOM_DE_LA_VOIX: Readonly<Record<Voice, string>> = {
  kick: 'la grosse caisse',
  snare: 'la caisse claire',
  hihat: 'le charleston',
  clave: 'la clave',
  cowbell: 'la cloche',
  rimshot: 'la baguette sur le bord',
  melody: 'la mélodie',
}
