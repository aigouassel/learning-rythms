import type { Exercise } from '@rythmes/content'
import { Appariement } from './Appariement'
import { Completion } from './Completion'
import { Dictee } from './Dictee'
import { Discrimination } from './Discrimination'
import { ExerciceDechiffrage, ExerciceFrappe } from './Frappe'
import { Qcm } from './Qcm'

export const GENRES: Record<Exercise['kind'], string> = {
  discrimination: 'Discrimination',
  qcm: 'Reconnaissance',
  appariement: 'Appariement',
  completion: 'Complétion',
  dictee: 'Dictée',
  dechiffrage: 'Déchiffrage',
  frappe: 'Frappe mesurée',
}

/**
 * Un exercice, quel qu'il soit.
 *
 * L'aiguillage est exhaustif : ajouter un genre d'exercice au domaine sans
 * écrire son interface devient une erreur de compilation, et non un écran
 * blanc découvert en cliquant dessus.
 */
export function Exercice({ exercice }: { readonly exercice: Exercise }) {
  switch (exercice.kind) {
    case 'discrimination':
      return <Discrimination exercice={exercice} />
    case 'qcm':
      return <Qcm exercice={exercice} />
    case 'appariement':
      return <Appariement exercice={exercice} />
    case 'completion':
      return <Completion exercice={exercice} />
    case 'dictee':
      return <Dictee exercice={exercice} />
    case 'dechiffrage':
      return <ExerciceDechiffrage exercice={exercice} />
    case 'frappe':
      return <ExerciceFrappe exercice={exercice} />
  }
}
