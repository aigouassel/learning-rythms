import type { Exercise } from '@rythmes/content'
import { fraction, type Pattern } from '@rythmes/core'
import { compareRhythms, explain } from '@rythmes/scoring'
import { useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { GrilleDeSaisie } from '../components/GrilleDeSaisie'
import { Portee } from '../components/Portee'

type Completion = Extract<Exercise, { kind: 'completion' }>

/**
 * Produire, sous contrainte.
 *
 * Le premier niveau où l'on écrit vraiment au lieu de désigner. La contrainte
 * — presque tout est déjà posé — est ce qui rend le pas franchissable : on ne
 * demande pas encore de tenir une mesure entière, seulement de sentir où il
 * manque quelque chose.
 */
export function Completion({ exercice }: { readonly exercice: Completion }) {
  const [reponse, setReponse] = useState<Pattern>(exercice.donne)
  const [verifie, setVerifie] = useState(false)

  const lectureAttendu = useLecture({
    pattern: exercice.attendu,
    bpm: exercice.bpm ?? 76,
    parTemps: exercice.parTemps ?? fraction(1, 4),
  })
  const lectureReponse = useLecture({
    pattern: reponse,
    bpm: exercice.bpm ?? 76,
    parTemps: exercice.parTemps ?? fraction(1, 4),
  })

  const diff = compareRhythms(exercice.attendu, reponse)
  const figees = exercice.donne.onsets.map((o) => o.at)

  return (
    <div className="repondre">
      <div className="commandes">
        <button type="button" onClick={lectureAttendu.basculer}>
          {lectureAttendu.joue ? '⏸' : '▶'} écouter ce qu’il faut obtenir
        </button>
        <button type="button" onClick={lectureReponse.basculer}>
          {lectureReponse.joue ? '⏸' : '▶'} écouter ta réponse
        </button>
      </div>

      <Portee pattern={reponse} position={lectureReponse.position} />

      <GrilleDeSaisie
        meter={exercice.attendu.meter}
        length={exercice.attendu.length}
        value={reponse}
        figees={figees}
        onChange={(p) => {
          setReponse(p)
          setVerifie(false)
        }}
      />

      <p className="aide">
        Les cases sombres sont déjà écrites. Les traits plus épais marquent les
        temps.
      </p>

      <button type="button" onClick={() => setVerifie(true)}>
        vérifier
      </button>

      {verifie && (
        <p className={diff.identical ? 'verdict juste' : 'verdict faux'}>{explain(diff)}</p>
      )}
    </div>
  )
}
