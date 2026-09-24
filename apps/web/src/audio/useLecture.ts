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
 *
 * La **fin**, en revanche, ne peut pas dépendre de cette boucle. Un onglet qui
 * passe à l'arrière-plan voit ses `requestAnimationFrame` gelées par le
 * navigateur alors que l'horloge audio, elle, continue : l'exercice se jouait
 * jusqu'au bout sans jamais se terminer, et restait indéfiniment « en cours ».
 * Une minuterie double donc la boucle — moins précise, et sans importance
 * puisqu'elle ne fait sonner personne.
 *
 * `pattern` doit être **référentiellement stable** : un objet reconstruit à
 * chaque rendu déclenche l'arrêt ci-dessous, et le transport meurt aussitôt
 * né. Passer `motif` et non `{ ...motif }`.
 */
export function useLecture(options: {
  pattern: Pattern
  bpm: number
  parTemps: Fraction
  loop?: boolean
  cycles?: number
  /** Les mesures de décompte avant que le motif ne commence. */
  countIn?: number
  /** Le motif est placé sur l'horloge mais ne sonne pas — le déchiffrage. */
  muet?: boolean
  onFin?: () => void
}): Lecture {
  const { pattern, bpm, parTemps, loop = true, cycles, countIn = 0, muet = false, onFin } = options
  const { ensure, loading } = useAudio()

  const [joue, setJoue] = useState(false)
  const [position, setPosition] = useState<number | null>(null)

  const transportRef = useRef<Transport | null>(null)
  const frameRef = useRef<number | null>(null)
  const minuterieRef = useRef<number | null>(null)
  const audioRef = useRef<Audio | null>(null)
  const finiRef = useRef(false)
  const finRef = useRef(onFin)
  finRef.current = onFin

  const arreter = useCallback(() => {
    transportRef.current?.stop()
    transportRef.current = null
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    if (minuterieRef.current !== null) window.clearTimeout(minuterieRef.current)
    minuterieRef.current = null
    setJoue(false)
    setPosition(null)
  }, [])

  // La boucle et la minuterie courent toutes deux vers la même fin : celle qui
  // arrive la première la prononce, l'autre n'a plus rien à dire.
  const terminer = useCallback(() => {
    if (finiRef.current) return
    finiRef.current = true
    arreter()
    finRef.current?.()
  }, [arreter])

  // Reprendre en vol demanderait de replanifier ce qui est déjà daté : on
  // arrête plutôt, au moindre changement de motif ou de tempo.
  useEffect(() => arreter, [arreter])
  useEffect(() => {
    if (transportRef.current) arreter()
  }, [pattern, bpm, arreter])

  const demarrer = useCallback(async () => {
    const audio = await ensure()
    audioRef.current = audio
    finiRef.current = false

    const t = transport({
      clock: webAudioClock(audio.ctx),
      output: audio.output,
      pattern,
      tempo: tempoOf(bpm, parTemps),
      loop,
      countIn,
      silent: muet,
    })
    t.start()
    transportRef.current = t
    setJoue(true)

    const fin = cycles === undefined ? null : t.origin + cycles * dureeDe(pattern, bpm, parTemps)

    const suivre = () => {
      const maintenant = audio.ctx.currentTime
      if (fin !== null && maintenant >= fin) {
        terminer()
        return
      }
      const p = t.positionAt(maintenant)
      setPosition(p ? p.at : null)
      frameRef.current = requestAnimationFrame(suivre)
    }
    suivre()

    if (fin !== null) {
      // Une marge : la minuterie ne doit pas prononcer la fin avant l'horloge
      // audio, sans quoi le dernier temps serait coupé.
      const reste = Math.max(0, fin - audio.ctx.currentTime) * 1000 + 80
      minuterieRef.current = window.setTimeout(terminer, reste)
    }

    return t
  }, [ensure, pattern, bpm, parTemps, loop, cycles, countIn, muet, terminer])

  const basculer = useCallback(async () => {
    if (transportRef.current) arreter()
    else await demarrer()
  }, [arreter, demarrer])

  // Stable : les appelants la mettent en dépendance d'effet pour dater des
  // frappes. Recréée à chaque rendu, elle faisait refaire soixante fois par
  // seconde le pont entre l'horloge du clavier et celle de l'audio — et chaque
  // pont réancre sur `ctx.currentTime`, qui n'avance que par blocs d'environ
  // trois millisecondes. Le bruit ainsi injecté avait l'ordre de grandeur de
  // ce qu'on prétend mesurer.
  const audio = useCallback(() => audioRef.current, [])

  return {
    joue,
    chargement: loading,
    position,
    demarrer,
    arreter,
    basculer,
    audio,
  }
}

const dureeDe = (p: Pattern, bpm: number, parTemps: Fraction): number =>
  (toNumber(p.length) / toNumber(parTemps)) * (60 / bpm)
