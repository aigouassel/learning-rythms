import type { ModuleDuCours } from '@rythmes/syllabus'
import { EXERCISES } from './exercises'
import { TERMES } from './lexique'
import { MODULE } from './module'

export { EXERCISES, MODULE, TERMES }
export * as motifs from './patterns'

/**
 * Ce que ce module apporte au cours.
 *
 * La leçon n'y figure pas : `lesson.mdx` s'importe depuis l'application, seule
 * à disposer du compilateur MDX.
 */
const contribution: ModuleDuCours = { module: MODULE, termes: TERMES, exercices: EXERCISES }
export default contribution
