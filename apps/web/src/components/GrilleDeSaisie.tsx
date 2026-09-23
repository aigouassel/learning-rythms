import {
  equals,
  fraction,
  pattern as construire,
  sub,
  toNumber,
  type Fraction,
  type Meter,
  type Onset,
  type Pattern,
  type Voice,
} from '@rythmes/core'
import { beatStarts, engraveVoice } from '@rythmes/notation'
import { useMemo } from 'react'

export type GrilleDeSaisieProps = {
  readonly meter: Meter
  readonly length: Fraction
  /** Le pas de la grille — une croche par défaut. */
  readonly subdivision?: Fraction
  readonly value: Pattern
  onChange(p: Pattern): void
  /** Les positions déjà écrites, qu'on ne peut ni retirer ni déplacer. */
  readonly figees?: readonly Fraction[]
  readonly voice?: Voice
  readonly disabled?: boolean
}

/**
 * Écrire un rythme en désignant où l'on frappe.
 *
 * C'est la saisie de la complétion et de la dictée. Elle ne demande pas de
 * choisir une figure : **la durée se déduit de la frappe suivante**, exactement
 * comme dans le modèle. Écrire « une noire » et écrire « une attaque ici, la
 * suivante un temps plus loin » sont la même chose, et la seconde formulation
 * est celle que l'oreille produit.
 *
 * Les cases portent une marque plus forte sur les débuts de temps : la grille
 * doit rendre la pulsation visible, comme la notation qu'elle sert à produire.
 */
export function GrilleDeSaisie({
  meter,
  length,
  subdivision = fraction(1, 8),
  value,
  onChange,
  figees = [],
  voice = 'kick',
  disabled,
}: GrilleDeSaisieProps) {
  const cases = useMemo(() => {
    const total = Math.round(toNumber(length) / toNumber(subdivision))
    return Array.from({ length: total }, (_, i) =>
      fraction(i * subdivision.num, subdivision.den),
    )
  }, [length, subdivision])

  const debutsDeTemps = useMemo(
    () => beatStarts({ ...value, meter, length }).map(toNumber),
    [value, meter, length],
  )

  const estFrappee = (at: Fraction) => value.onsets.some((o) => equals(o.at, at))
  const estFigee = (at: Fraction) => figees.some((f) => equals(f, at))

  const basculer = (at: Fraction) => {
    if (disabled || estFigee(at)) return

    const restantes = estFrappee(at)
      ? value.onsets.filter((o) => !equals(o.at, at))
      : [...value.onsets, { at, duration: subdivision, voice }]

    onChange(construire({ meter, length, style: value.style, onsets: durees(restantes, length) }))
  }

  return (
    <div className="grille" role="group" aria-label="Où tombent les attaques">
      {cases.map((at) => {
        const surUnTemps = debutsDeTemps.some((b) => Math.abs(b - toNumber(at)) < 1e-9)
        const classes = [
          'case',
          estFrappee(at) ? 'frappee' : '',
          estFigee(at) ? 'figee' : '',
          surUnTemps ? 'temps' : '',
        ]
          .filter(Boolean)
          .join(' ')

        return (
          <button
            key={`${at.num}/${at.den}`}
            type="button"
            className={classes}
            onClick={() => basculer(at)}
            disabled={disabled || estFigee(at)}
            aria-pressed={estFrappee(at)}
            aria-label={`Position ${at.num}/${at.den}`}
          />
        )
      })}
    </div>
  )
}

/**
 * Recalculer les durées : chaque attaque tient jusqu'à la suivante.
 *
 * C'est ce qui évite à l'élève de choisir une figure avant d'avoir posé la
 * note — et c'est aussi ce qui rend impossible un chevauchement, que le modèle
 * refuserait de toute façon.
 */
function durees(onsets: readonly Onset[], length: Fraction): Onset[] {
  const triees = [...onsets].sort((a, b) => toNumber(a.at) - toNumber(b.at))
  return triees.map((o, i) => {
    const suivante = triees[i + 1]
    const fin = suivante ? suivante.at : length
    return { ...o, duration: sub(fin, o.at) }
  })
}

/** Un motif vide, point de départ d'une saisie. */
export const motifVide = (meter: Meter, length: Fraction, style: Pattern['style'] = 'neutre') =>
  construire({ meter, length, style, onsets: [] })

/** Les premières attaques d'un motif, telles qu'on les donne dans une complétion. */
export const prefixe = (p: Pattern, combien: number): Pattern =>
  construire({
    meter: p.meter,
    length: p.length,
    style: p.style,
    onsets: durees(p.onsets.slice(0, combien), p.length),
  })

/** Le nombre de temps d'un motif, pour dimensionner une grille. */
export const nombreDeTemps = (p: Pattern): number =>
  engraveVoice(p, p.onsets[0]?.voice ?? 'kick').beats.length
