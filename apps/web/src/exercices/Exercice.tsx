import type { Exercise } from '@rythmes/content'
import { Appariement } from './Appariement'
import { Completion } from './Completion'
import { Composition } from './Composition'
import { Dictee } from './Dictee'
import { Discrimination } from './Discrimination'
import { ExerciceDechiffrage, ExerciceFrappe } from './Frappe'
import { Qcm } from './Qcm'
import { Reperage } from './Reperage'

export const GENRES: Record<Exercise['kind'], string> = {
  discrimination: 'Discrimination',
  qcm: 'Reconnaissance',
  appariement: 'Appariement',
  completion: 'Complétion',
  dictee: 'Dictée',
  dechiffrage: 'Déchiffrage',
  frappe: 'Frappe mesurée',
  reperage: 'Repérage d’erreur',
  composition: 'Composition guidée',
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
    case 'reperage':
      return <Reperage exercice={exercice} />
    case 'composition':
      return <Composition exercice={exercice} />
  }
}
