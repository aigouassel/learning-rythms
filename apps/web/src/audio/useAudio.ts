import { useCallback, useState } from 'react'
import { audioOutput, type AudioOutput } from './percussionOutput'

export type Audio = {
  readonly ctx: AudioContext
  readonly output: AudioOutput
}

/**
 * Un seul contexte audio pour toute l'application.
 *
 * Le partage n'est pas une optimisation, c'est une nécessité : un navigateur
 * plafonne le nombre de contextes audio simultanés — autour de six sur Chrome
 * — et une leçon compte jusqu'à neuf exemples jouables. Avec un contexte par
 * exemple, les derniers de la page restaient définitivement muets.
 *
 * Au passage, les échantillons ne se téléchargent qu'une fois au lieu d'une
 * fois par exemple.
 *
 * La promesse est mémorisée plutôt que le résultat : deux exemples cliqués
 * coup sur coup attendent le même chargement au lieu d'en lancer deux.
 */
let partage: Promise<Audio> | null = null

/**
 * Le contexte est créé au premier geste de l'utilisatrice.
 *
 * Les navigateurs refusent de démarrer un `AudioContext` sans interaction —
 * c'est une protection contre les pages qui se mettent à sonner toutes seules.
 * On ne peut donc pas le créer au montage : il faut attendre le clic, et c'est
 * pour ça que ce hook rend une fonction plutôt qu'un objet.
 */
export function useAudio(): {
  ensure: () => Promise<Audio>
  loading: boolean
} {
  const [loading, setLoading] = useState(false)

  const ensure = useCallback(async () => {
    if (!partage) {
      setLoading(true)
      partage = (async () => {
        const ctx = new AudioContext()
        const output = audioOutput(ctx)
        await output.ready
        return { ctx, output }
      })()
    }

    try {
      const audio = await partage
      // Un contexte peut être suspendu par le navigateur quand l'onglet passe
      // en arrière-plan : on le réveille à chaque fois, pas seulement au
      // premier clic.
      if (audio.ctx.state === 'suspended') await audio.ctx.resume()
      return audio
    } finally {
      setLoading(false)
    }
  }, [])

  return { ensure, loading }
}
