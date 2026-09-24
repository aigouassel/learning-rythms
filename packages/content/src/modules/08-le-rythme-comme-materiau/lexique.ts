import type { TermeRedige } from '@rythmes/syllabus'

/** Les termes que ce module installe — dans l'ordre où la leçon les amène. */
export const TERMES: readonly TermeRedige[] = [
  {
    slug: 'augmentation',
    nom: 'Augmentation',
    sensation: 'le même motif, au ralenti',
    definition: 'toutes les durées multipliées par un même facteur',
    voirAussi: ['diminution'],
  },
  {
    slug: 'diminution',
    nom: 'Diminution',
    sensation: 'le même motif, accéléré',
    definition: 'toutes les durées divisées par un même facteur',
    voirAussi: ['augmentation'],
  },
  {
    slug: 'ostinato',
    nom: 'Ostinato',
    sensation: 'ça ne s’arrête jamais et ça porte tout',
    definition: 'une figure répétée obstinément, servant de fondation',
    style: 'hip-hop',
  },
  {
    slug: 'groove',
    nom: 'Groove',
    sensation: 'l’envie de bouger — ou son absence',
    definition:
      'la qualité d’un rythme qui naît du placement et de l’accentuation, pas de la justesse métronomique',
    style: 'funk',
  },
  {
    slug: 'carrure',
    nom: 'Carrure',
    sensation: 'les phrases qui tombent juste',
    definition: 'l’organisation en groupes réguliers de mesures, le plus souvent par quatre ou huit',
  },
]
