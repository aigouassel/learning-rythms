import { fraction, measureCount, type Pattern } from '@rythmes/core'
import { transport, tempo as tempoOf, type Transport } from '@rythmes/engine'
import { engrave, syllabize } from '@rythmes/notation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useAudio } from '../audio/useAudio'
import { webAudioClock } from '../audio/webAudioClock'
import { StaffView } from '../notation/StaffView'

export type ExempleProps = {
  readonly pattern: Pattern
  readonly titre: string
  /** La figure qui porte le tempo — ♩ par défaut, ♩. en mesure composée. */
  readonly parTemps?: [number, number]
  readonly tempoInitial?: number
  readonly pitched?: boolean
  /** Les syllabes rythmiques — module 3 seulement. */
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
  const { ensure, loading } = useAudio()
  const [bpm, setBpm] = useState(tempoInitial)
  const [joue, setJoue] = useState(false)
  const [position, setPosition] = useState<number | null>(null)

  const transportRef = useRef<Transport | null>(null)
  const frameRef = useRef<number | null>(null)

  const voix = useMemo(() => engrave(pattern), [pattern])
  const syllabesParVoix = useMemo(
    () => (syllabes ? voix.map((v) => syllabize(v).map((s) => s.syllable)) : null),
    [voix, syllabes],
  )

  const arreter = () => {
    transportRef.current?.stop()
    transportRef.current = null
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    setJoue(false)
    setPosition(null)
  }

  // Arrêter en quittant, et au moindre changement de motif ou de tempo :
  // reprendre en vol demanderait de replanifier ce qui est déjà daté.
  useEffect(() => arreter, [])
  useEffect(() => {
    if (transportRef.current) arreter()
  }, [pattern, bpm])

  const basculer = async () => {
    if (joue) return arreter()

    const { ctx, output } = await ensure()
    const t = transport({
      clock: webAudioClock(ctx),
      output,
      pattern,
      tempo: tempoOf(bpm, fraction(parTemps[0], parTemps[1])),
    })
    t.start()
    transportRef.current = t
    setJoue(true)

    // L'écran suit le son : cette boucle *lit* l'horloge audio, elle ne la
    // pilote jamais. L'inverse ferait dépendre le rythme du taux de
    // rafraîchissement, donc de la charge de la machine.
    const suivre = () => {
      const p = t.positionAt(ctx.currentTime)
      setPosition(p ? p.at : null)
      frameRef.current = requestAnimationFrame(suivre)
    }
    suivre()
  }

  return (
    <figure className="exemple">
      <figcaption>
        {titre}
        <span className="style">{pattern.style}</span>
      </figcaption>

      {voix.map((v, i) => (
        <StaffView
          key={v.voice}
          voice={v}
          meter={pattern.meter}
          pitched={pitched}
          position={position}
          {...(syllabesParVoix ? { syllables: syllabesParVoix[i] } : {})}
        />
      ))}

      <div className="commandes">
        <button type="button" onClick={basculer} disabled={loading}>
          {loading ? 'chargement…' : joue ? '⏸ pause' : '▶ écouter'}
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
