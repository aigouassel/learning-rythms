import { useEffect, useState, type RefObject } from 'react'

type Section = {
  readonly id: string
  readonly titre: string
}

/** La hauteur sous laquelle un titre est considéré comme dépassé. */
const LIGNE_DE_FLOTTAISON = 120

/**
 * Le fil des sections d'une leçon.
 *
 * Il est construit en lisant le DOM plutôt qu'en analysant le MDX. Le cours
 * est du texte libre : extraire ses titres à la compilation demanderait un
 * greffon remark, puis de garder ses identifiants d'accord avec ceux que
 * rehype-slug pose à l'affichage. Lire ce qui est affiché supprime la
 * question — le fil ne peut pas mentionner une section qui n'existe pas.
 */
export function FilDesSections({
  lecon,
  module,
}: {
  readonly lecon: RefObject<HTMLElement | null>
  readonly module: number
}) {
  const [sections, setSections] = useState<readonly Section[]>([])
  const [courante, setCourante] = useState<string | null>(null)

  useEffect(() => {
    const titres = [...(lecon.current?.querySelectorAll<HTMLElement>('h2[id]') ?? [])]
    setSections(titres.map((t) => ({ id: t.id, titre: t.textContent ?? '' })))
    setCourante(titres[0]?.id ?? null)

    if (titres.length === 0) return

    /**
     * La section courante est le dernier titre passé sous la ligne de
     * flottaison.
     *
     * Un `IntersectionObserver` serait l'outil attendu, mais il ne répond que
     * lorsqu'un titre traverse une bande : au milieu d'une section longue —
     * celles du module 3 tiennent plusieurs écrans — aucun titre n'est dans la
     * bande et le fil se fige sur ce qu'il croyait savoir. Comparer des
     * positions répond toujours, y compris à l'arrêt.
     */
    let demande = 0
    const relire = () => {
      demande = 0
      // Au bas de la page, la dernière section est à l'écran mais son titre
      // n'a pas pu monter jusqu'à la ligne — le défilement s'est arrêté
      // avant. Sans ce cas, la dernière entrée du fil ne s'allumerait jamais.
      if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        setCourante(titres[titres.length - 1]!.id)
        return
      }
      const passes = titres.filter((t) => t.getBoundingClientRect().top <= LIGNE_DE_FLOTTAISON)
      setCourante((passes[passes.length - 1] ?? titres[0])!.id)
    }
    // Le défilement émet bien plus souvent que l'écran ne se rafraîchit ; une
    // seule lecture par image suffit, et elle tombe au bon moment.
    const surDefilement = () => {
      if (demande === 0) demande = requestAnimationFrame(relire)
    }

    relire()
    window.addEventListener('scroll', surDefilement, { passive: true })
    window.addEventListener('resize', surDefilement)
    return () => {
      if (demande !== 0) cancelAnimationFrame(demande)
      window.removeEventListener('scroll', surDefilement)
      window.removeEventListener('resize', surDefilement)
    }
  }, [lecon, module])

  // Deux sections ne font pas un sommaire : le fil coûterait plus d'attention
  // qu'il n'en fait gagner.
  if (sections.length < 3) return null

  return (
    <nav className="fil-sections" aria-label="Sections de la leçon">
      <ol>
        {sections.map((s) => (
          <li key={s.id}>
            <a
              href={`#module-${module}/${s.id}`}
              className={s.id === courante ? 'actif' : ''}
              aria-current={s.id === courante ? 'true' : undefined}
            >
              {s.titre}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  )
}
