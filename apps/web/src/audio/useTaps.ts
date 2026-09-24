import type { Voice } from '@rythmes/core'
import { useCallback, useRef, useState } from 'react'
import { clockBridge } from './webAudioClock'

export type Tap = { readonly at: number; readonly voix: Voice }

/** Une touche, et la ligne qu'elle tient. */
export type Touche = { readonly code: string; readonly voix: Voice }

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
 *
 * Chaque frappe porte la ligne qu'elle joue. Un motif de batterie fait tomber
 * la grosse caisse et le charleston sur le même temps : sans savoir de quelle
 * main vient la frappe, la correction ne peut pas dire laquelle des deux
 * attaques a été jouée.
 */
export function useTaps(): {
  readonly taps: readonly Tap[]
  ecouter(ctx: BaseAudioContext, touches: readonly Touche[]): () => void
  vider(): void
} {
  const [taps, setTaps] = useState<Tap[]>([])
  const actif = useRef(false)

  const ecouter = useCallback((ctx: BaseAudioContext, touches: readonly Touche[]) => {
    const versAudio = clockBridge(ctx)
    const parCode = new Map(touches.map((t) => [t.code, t.voix]))
    actif.current = true

    const surTouche = (e: KeyboardEvent) => {
      if (!actif.current || e.repeat) return
      // Entrée reste un synonyme de la barre d'espace, là où celle-ci sert —
      // c'est le geste que les consignes nomment depuis le module 0.
      const code = e.code === 'Enter' && parCode.has('Space') ? 'Space' : e.code
      const voix = parCode.get(code)
      if (!voix) return
      e.preventDefault()
      setTaps((t) => [...t, { at: versAudio(e.timeStamp), voix }])
    }

    window.addEventListener('keydown', surTouche)
    return () => {
      actif.current = false
      window.removeEventListener('keydown', surTouche)
    }
  }, [])

  const vider = useCallback(() => setTaps([]), [])

  return { taps, ecouter, vider }
}
