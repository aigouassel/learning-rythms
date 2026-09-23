import { useCallback, useRef, useState } from 'react'
import { audioOutput, type AudioOutput } from './percussionOutput'

export type Audio = {
  readonly ctx: AudioContext
  readonly output: AudioOutput
}

/**
 * Le contexte audio, créé au premier geste de l'utilisatrice.
 *
 * Les navigateurs refusent de démarrer un `AudioContext` sans interaction —
 * c'est une protection contre les pages qui se mettent à sonner toutes seules.
 * On ne peut donc pas le créer au montage du composant : il faut attendre le
 * clic, et c'est pour ça que ce hook rend une fonction plutôt qu'un objet.
 */
export function useAudio(): {
  ensure: () => Promise<Audio>
  loading: boolean
} {
  const ref = useRef<Audio | null>(null)
  const [loading, setLoading] = useState(false)

  const ensure = useCallback(async () => {
    if (ref.current) {
      if (ref.current.ctx.state === 'suspended') await ref.current.ctx.resume()
      return ref.current
    }

    setLoading(true)
    const ctx = new AudioContext()
    const output = audioOutput(ctx)
    await output.ready
    ref.current = { ctx, output }
    setLoading(false)
    return ref.current
  }, [])

  return { ensure, loading }
}
