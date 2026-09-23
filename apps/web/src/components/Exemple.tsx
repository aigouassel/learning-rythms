import { fraction, measureCount, type Pattern } from '@rythmes/core'
import { useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { Portee } from './Portee'

export type ExempleProps = {
  readonly pattern: Pattern
  readonly titre: string
  /** La figure qui porte le tempo — ♩ par défaut, ♩. en mesure composée. */
  readonly parTemps?: [number, number]
  readonly tempoInitial?: number
  readonly pitched?: boolean
  readonly syllabes?: boolean
}

/**
 * Un exemple jouable : la notation, le son, et le lien visible entre les deux.
 *
 * Ce composant est le cœur pédagogique du cours. Il ne se contente pas de
 * jouer un motif : il **allume le signe au moment exact où il sonne**. On
 * n'apprend pas à lire en lisant davantage, mais en associant — et c'est cette
 * co-occurrence, répétée, qui construit le lien entre un symbole et un son.
 *
 * Le bouton de ralenti sert la même intention : ralentir sans rien changer
 * d'autre rend l'association explicite au lieu de la laisser subliminale.
 */
export function Exemple({
  pattern,
  titre,
  parTemps = [1, 4],
  tempoInitial = 72,
  pitched,
  syllabes,
}: ExempleProps) {
  const [bpm, setBpm] = useState(tempoInitial)
  const lecture = useLecture({
    pattern,
    bpm,
    parTemps: fraction(parTemps[0], parTemps[1]),
  })

  return (
    <figure className="exemple">
      <figcaption>
        {titre}
        <span className="style">{pattern.style}</span>
      </figcaption>

      <Portee
        pattern={pattern}
        position={lecture.position}
        pitched={pitched}
        syllabes={syllabes}
      />

      <div className="commandes">
        <button type="button" onClick={lecture.basculer} disabled={lecture.chargement}>
          {lecture.chargement ? 'chargement…' : lecture.joue ? '⏸ pause' : '▶ écouter'}
        </button>

        <label>
          tempo
          <input
            type="range"
            min={30}
            max={160}
            value={bpm}
            onChange={(e) => setBpm(Number(e.target.value))}
          />
          <output>
            {parTemps[1] === 8 && parTemps[0] === 3 ? '♩.' : '♩'} = {bpm}
          </output>
        </label>

        <button type="button" onClick={() => setBpm(Math.round(tempoInitial / 2))}>
          ralenti
        </button>
        <button type="button" onClick={() => setBpm(tempoInitial)}>
          tempo normal
        </button>
      </div>

      <p className="duree">{nombreDeMesures(pattern)}</p>
    </figure>
  )
}

/** « une mesure », « deux mesures » — ou la fraction, si le motif ne tombe pas juste. */
function nombreDeMesures(p: Pattern): string {
  const n = measureCount(p)
  if (n.den !== 1) return `${n.num}/${n.den} de mesure`
  return n.num === 1 ? 'une mesure' : `${n.num} mesures`
}
