import { useCallback, useRef, useState } from 'react'
import { clockBridge } from './webAudioClock'

export type Tap = { readonly at: number }

/**
 * Capter les frappes, datées sur l'horloge de l'audio.
 *
 * Tout le piège est là. Le `timeStamp` d'un événement clavier est exprimé sur
 * `performance.now()`, en millisecondes depuis le chargement de la page ;
 * `ctx.currentTime` compte des secondes depuis la création du contexte audio.
 * Les deux avancent à la même vitesse et n'ont pas la même origine — comparer
 * sans convertir donnerait un écart de plusieurs secondes, et personne ne
 * penserait à chercher l'erreur là.
 *
 * On date donc la frappe avec le `timeStamp` de l'événement, et non avec
 * l'heure au moment où React le traite : entre les deux, il peut s'être écoulé
 * une image entière, soit seize millisecondes — plus que ce qu'on cherche à
 * mesurer.
 */
export function useTaps(): {
  readonly taps: readonly Tap[]
  readonly dernier: number | null
  ecouter(ctx: BaseAudioContext): () => void
  vider(): void
} {
  const [taps, setTaps] = useState<Tap[]>([])
  const [dernier, setDernier] = useState<number | null>(null)
  const actif = useRef(false)

  const ecouter = useCallback((ctx: BaseAudioContext) => {
    const versAudio = clockBridge(ctx)
    actif.current = true

    const surTouche = (e: KeyboardEvent) => {
      if (!actif.current || e.repeat) return
      if (e.code !== 'Space' && e.key !== 'Enter') return
      e.preventDefault()
      const at = versAudio(e.timeStamp)
      setTaps((t) => [...t, { at }])
      setDernier(performance.now())
    }

    window.addEventListener('keydown', surTouche)
    return () => {
      actif.current = false
      window.removeEventListener('keydown', surTouche)
    }
  }, [])

  const vider = useCallback(() => {
    setTaps([])
    setDernier(null)
  }, [])

  return { taps, dernier, ecouter, vider }
}
