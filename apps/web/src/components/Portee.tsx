import type { Pattern } from '@rythmes/core'
import { engrave, syllabize } from '@rythmes/notation'
import { useMemo } from 'react'
import { StaffView } from '../notation/StaffView'

export type PorteeProps = {
  readonly pattern: Pattern
  /** La position lue, en rondes. `null` quand rien ne joue. */
  readonly position?: number | null
  readonly pitched?: boolean
  /** Les syllabes rythmiques — module 3 seulement. */
  readonly syllabes?: boolean
}

/**
 * Un motif gravé, toutes voix comprises.
 *
 * La gravure est mémorisée : elle ne dépend que de la musique, là où la
 * position change soixante fois par seconde.
 */
export function Portee({ pattern, position, pitched, syllabes }: PorteeProps) {
  const voix = useMemo(() => engrave(pattern), [pattern])
  const syllabesParVoix = useMemo(
    () => (syllabes ? voix.map((v) => syllabize(v).map((s) => s.syllable)) : null),
    [voix, syllabes],
  )

  return (
    <StaffView
      voices={voix}
      meter={pattern.meter}
      pitched={pitched}
      position={position ?? null}
      {...(syllabesParVoix ? { syllables: syllabesParVoix } : {})}
    />
  )
}
