/**
 * Les leçons sont des fichiers MDX, compilés par Vite en composants React.
 *
 * TypeScript ne sait pas lire un `.mdx` ; cette déclaration lui dit quoi
 * attendre à la place, sans lui demander de comprendre le format.
 */
declare module '*.mdx' {
  import type { MDXProps } from 'mdx/types'
  const Lesson: (props: MDXProps) => JSX.Element
  export default Lesson
}
