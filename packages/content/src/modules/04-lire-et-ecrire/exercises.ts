import { fraction } from '@rythmes/core'
import type { Exercise } from '../../types'
import { bienGroupe, cellule, celluleAmputee, quatreQuarts, stompStompClap } from './patterns'

const NOIRE = fraction(1, 4)

/**
 * Les exercices du module 4.
 *
 * Plus de discrimination ici : la perception n'est plus le point dur, c'est
 * le passage entre le son et le signe. Quatre exercices, et ils vont tous les
 * quatre dans ce sens ou dans l'autre.
 */
export const EXERCISES: readonly Exercise[] = [
  {
    kind: 'dechiffrage',
    id: '04-lire-avant-d-entendre',
    module: 4,
    consigne:
      'Lis d’abord, joue ensuite — sans avoir entendu. C’est l’épreuve qui compte vraiment : tout le reste peut se faire à l’oreille, pas celle-ci.',
    aLire: stompStompClap,
    bpm: 84,
    parTemps: NOIRE,
  },
  {
    kind: 'reperage',
    id: '04-ou-ca-differe',
    module: 4,
    consigne:
      'La partition et l’enregistrement ne disent pas tout à fait la même chose. Suis le texte du doigt, signe par signe.',
    ecrit: cellule,
    joue: celluleAmputee,
    bpm: 76,
    parTemps: NOIRE,
  },
  {
    kind: 'dictee',
    id: '04-dictee-simple',
    module: 4,
    consigne:
      'Écoute, puis écris. La grille te donne les emplacements possibles ; à toi de dire lesquels sonnent.',
    attendu: quatreQuarts,
    saisie: 'palette',
  },
  {
    kind: 'completion',
    id: '04-completer-le-groupe',
    module: 4,
    consigne:
      'Il manque la fin. Complète pour que la mesure soit pleine, et regarde comment les groupes se reforment.',
    attendu: bienGroupe,
    donne: {
      ...bienGroupe,
      onsets: bienGroupe.onsets.slice(0, 4),
    },
  },
]
