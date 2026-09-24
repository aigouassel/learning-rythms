import type { ModuleRedige } from '@rythmes/syllabus'

export const MODULE: ModuleRedige = {
  number: 2,
  slug: 'temps-forts-et-faibles',
  title: 'Temps forts et temps faibles',
  summary:
    'La pulsation s’organise en cycles. Marche à deux, valse à trois, pop à quatre : le cycle s’entend sans compter.',
  requires: [1],
  styles: ['marche', 'valse', 'pop'],
}
