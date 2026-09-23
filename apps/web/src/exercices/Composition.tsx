import { contraintesViolees, type Exercise } from '@rythmes/content'
import { fraction, type Pattern } from '@rythmes/core'
import { useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { GrilleDeSaisie, motifVide } from '../components/GrilleDeSaisie'
import { Portee } from '../components/Portee'

type Composition = Extract<Exercise, { kind: 'composition' }>

/**
 * Écrire soi-même.
 *
 * Le seul exercice du cours dont la réponse n'est pas prévue d'avance — et
 * l'objectif vers lequel tout le reste conduit. On ne peut donc pas le noter :
 * on vérifie ce qui a été demandé, on joue le résultat, et c'est l'oreille qui
 * juge le reste. Une machine n'a rien à dire sur la valeur d'un groove.
 */
export function Composition({ exercice }: { readonly exercice: Composition }) {
  const [oeuvre, setOeuvre] = useState<Pattern>(() =>
    motifVide(exercice.meter, exercice.length),
  )
  const lecture = useLecture({ pattern: oeuvre, bpm: 84, parTemps: fraction(1, 4) })
  const violees = contraintesViolees(exercice, oeuvre)
  const vide = oeuvre.onsets.length === 0

  return (
    <div className="repondre composition">
      <Portee pattern={oeuvre} position={lecture.position} />

      <GrilleDeSaisie
        meter={exercice.meter}
        length={exercice.length}
        value={oeuvre}
        voice={exercice.voix ?? 'snare'}
        onChange={setOeuvre}
      />

      <ul className="contraintes">
        {exercice.contraintes.map((c) => {
          const tenue = !violees.includes(c)
          return (
            <li key={c.libelle} className={vide ? '' : tenue ? 'tenue' : 'manquee'}>
              <span aria-hidden>{vide ? '·' : tenue ? '✓' : '○'}</span> {c.libelle}
            </li>
          )
        })}
      </ul>

      <button type="button" onClick={lecture.basculer} disabled={vide}>
        {lecture.joue ? '⏸ pause' : '▶ écouter ce que tu as écrit'}
      </button>

      {!vide && violees.length === 0 && (
        <p className="verdict juste">
          Toutes les contraintes sont tenues. Le reste ne se vérifie pas :
          écoute, et garde ce qui te plaît.
        </p>
      )}
    </div>
  )
}
