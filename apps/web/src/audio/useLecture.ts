import { toNumber, type Fraction, type Pattern } from '@rythmes/core'
import { transport, tempo as tempoOf, type Transport } from '@rythmes/engine'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAudio, type Audio } from './useAudio'
import { webAudioClock } from './webAudioClock'

export type Lecture = {
  readonly joue: boolean
  readonly chargement: boolean
  /** La position lue, en rondes. `null` quand rien ne joue. */
  readonly position: number | null
  demarrer(): Promise<Transport | null>
  arreter(): void
  basculer(): Promise<void>
  /** Le contexte audio, une fois créé — pour dater des frappes. */
  audio(): Audio | null
}

/**
 * Jouer un motif, et savoir où l'on en est.
 *
 * Extrait de l'exemple jouable pour servir aussi aux exercices : entendre un
 * motif est le point commun de tout ce que fait ce cours.
 *
 * L'écran **suit** le son. Cette boucle lit l'horloge audio dans une
 * `requestAnimationFrame` et ne la pilote jamais : l'inverse ferait dépendre
 * le rythme du taux de rafraîchissement, donc de la charge de la machine.
 */
export function useLecture(options: {
  pattern: Pattern
  bpm: number
  parTemps: Fraction
  loop?: boolean
  cycles?: number
  onFin?: () => void
}): Lecture {
  const { pattern, bpm, parTemps, loop = true, cycles, onFin } = options
  const { ensure, loading } = useAudio()

  const [joue, setJoue] = useState(false)
  const [position, setPosition] = useState<number | null>(null)

  const transportRef = useRef<Transport | null>(null)
  const frameRef = useRef<number | null>(null)
  const audioRef = useRef<Audio | null>(null)
  const finRef = useRef(onFin)
  finRef.current = onFin

  const arreter = useCallback(() => {
    transportRef.current?.stop()
    transportRef.current = null
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    setJoue(false)
    setPosition(null)
  }, [])

  // Reprendre en vol demanderait de replanifier ce qui est déjà daté : on
  // arrête plutôt, au moindre changement de motif ou de tempo.
  useEffect(() => arreter, [arreter])
  useEffect(() => {
    if (transportRef.current) arreter()
  }, [pattern, bpm, arreter])

  const demarrer = useCallback(async () => {
    const audio = await ensure()
    audioRef.current = audio

    const t = transport({
      clock: webAudioClock(audio.ctx),
      output: audio.output,
      pattern,
      tempo: tempoOf(bpm, parTemps),
      loop,
    })
    t.start()
    transportRef.current = t
    setJoue(true)

    const fin = cycles === undefined ? null : t.origin + cycles * dureeDe(pattern, bpm, parTemps)

    const suivre = () => {
      const maintenant = audio.ctx.currentTime
      if (fin !== null && maintenant >= fin) {
        arreter()
        finRef.current?.()
        return
      }
      const p = t.positionAt(maintenant)
      setPosition(p ? p.at : null)
      frameRef.current = requestAnimationFrame(suivre)
    }
    suivre()

    return t
  }, [ensure, pattern, bpm, parTemps, loop, cycles, arreter])

  const basculer = useCallback(async () => {
    if (transportRef.current) arreter()
    else await demarrer()
  }, [arreter, demarrer])

  return {
    joue,
    chargement: loading,
    position,
    demarrer,
    arreter,
    basculer,
    audio: () => audioRef.current,
  }
}

const dureeDe = (p: Pattern, bpm: number, parTemps: Fraction): number =>
  (toNumber(p.length) / toNumber(parTemps)) * (60 / bpm)
