import type { Exercise } from '@rythmes/content'
import { fraction, type Fraction, type Pattern } from '@rythmes/core'
import { useMemo, useState } from 'react'
import { useLecture } from '../audio/useLecture'
import { Portee } from '../components/Portee'

type Appariement = Extract<Exercise, { kind: 'appariement' }>

/**
 * Discriminer finement : relier des sons à des notations.
 *
 * Un cran au-dessus du QCM. Là où le QCM laisse éliminer par défaut — « ce
 * n'est ni celle-ci ni celle-là, donc c'est la troisième » —, l'appariement
 * oblige à décider de chacune. Les motifs proposés ne diffèrent que par
 * l'ordre de leurs durées : aucune ne se reconnaît à sa silhouette.
 */
export function Appariement({ exercice }: { readonly exercice: Appariement }) {
  // L'ordre des sons est brouillé une fois pour toutes : le rejouer à chaque
  // rendu changerait la réponse sous les doigts de l'élève.
  const ordre = useMemo(() => melange(exercice.motifs.length), [exercice.motifs.length])
  const [liens, setLiens] = useState<Record<number, number>>({})
  const [verifie, setVerifie] = useState(false)

  const complet = Object.keys(liens).length === exercice.motifs.length

  return (
    <div className="repondre appariement">
      <div className="sons">
        {ordre.map((vrai, place) => (
          <Son
            key={place}
            lettre={LETTRES[place]!}
            pattern={exercice.motifs[vrai]!}
            bpm={exercice.bpm ?? 80}
            parTemps={exercice.parTemps ?? fraction(1, 4)}
            choisi={liens[place]}
            options={exercice.motifs.length}
            onChoisir={(n) => {
              setLiens((l) => ({ ...l, [place]: n }))
              setVerifie(false)
            }}
            verdict={verifie ? (liens[place] === vrai ? 'juste' : 'faux') : null}
          />
        ))}
      </div>

      <ol className="notations">
        {exercice.motifs.map((m, i) => (
          <li key={i}>
            <span className="numero">{i + 1}</span>
            <Portee pattern={m} />
          </li>
        ))}
      </ol>

      <button type="button" disabled={!complet} onClick={() => setVerifie(true)}>
        vérifier
      </button>

      {verifie && (
        <p className={ordre.every((vrai, place) => liens[place] === vrai) ? 'verdict juste' : 'verdict faux'}>
          {ordre.every((vrai, place) => liens[place] === vrai)
            ? 'Tout est relié correctement.'
            : 'Certaines paires ne vont pas. Réécoute celles qui sont marquées.'}
        </p>
      )}
    </div>
  )
}

const LETTRES = ['A', 'B', 'C', 'D', 'E']

function Son({
  lettre,
  pattern,
  bpm,
  parTemps,
  choisi,
  options,
  onChoisir,
  verdict,
}: {
  readonly lettre: string
  readonly pattern: Pattern
  readonly bpm: number
  readonly parTemps: Fraction
  readonly choisi: number | undefined
  readonly options: number
  onChoisir(n: number): void
  readonly verdict: 'juste' | 'faux' | null
}) {
  const lecture = useLecture({ pattern, bpm, parTemps })

  return (
    <div className={`son ${verdict ?? ''}`}>
      <button type="button" onClick={lecture.basculer} disabled={lecture.chargement}>
        {lecture.joue ? '⏸' : '▶'} son {lettre}
      </button>
      <div className="choix">
        {Array.from({ length: options }, (_, i) => (
          <button
            key={i}
            type="button"
            className={choisi === i ? 'actif' : ''}
            onClick={() => onChoisir(i)}
            aria-label={`Le son ${lettre} correspond à la notation ${i + 1}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Un mélange déterministe pour la durée de la séance, pas pour la sécurité. */
function melange(n: number): number[] {
  const ordre = Array.from({ length: n }, (_, i) => i)
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[ordre[i], ordre[j]] = [ordre[j]!, ordre[i]!]
  }
  return ordre
}
