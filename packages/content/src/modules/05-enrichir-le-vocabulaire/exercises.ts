import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import { contretemps, skank, skankAmpute, syncope } from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 5.
 *
 * Pas d'appariement ici : il ferait doublon avec la discrimination, qui
 * travaille exactement la même chose — séparer deux sensations voisines — en
 * posant la question plus directement.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'discrimination',
    id: '05-syncope-ou-contretemps',
    module: 5,
    consigne:
      'Écoute le deuxième appui de la mesure. Est-il occupé par une note qui déborde sur lui, ou reste-t-il vide ?',
    joue: syncope,
    choix: ['Une note déborde dessus', 'Il reste vide'],
    bonne: 0,
  },
  {
    kind: 'frappe',
    id: '05-frapper-les-contretemps',
    module: 5,
    consigne:
      'Frappe uniquement entre les appuis, jamais dessus. C’est l’exercice le plus inconfortable du cours — et celui qui change le plus de choses.',
    grille: skank,
    bpm: 76,
    parTemps: NOIRE,
    cycles: 4,
    voix: 'rimshot',
  },
  {
    kind: 'reperage',
    id: '05-skank-troue',
    module: 5,
    consigne:
      'Le skank écrit compte quatre attaques ; l’enregistrement n’en a pas autant. Laquelle manque ?',
    ecrit: skank,
    joue: skankAmpute,
    bpm: 76,
    parTemps: NOIRE,
  },
  {
    kind: 'dictee',
    id: '05-dictee-contretemps',
    module: 5,
    consigne:
      'Écoute et écris. Attention au deuxième appui : y a-t-il une attaque dessus, ou juste avant ?',
    attendu: contretemps,
    saisie: 'palette',
  },
]
