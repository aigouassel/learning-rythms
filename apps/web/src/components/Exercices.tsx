import type { Exercise } from '@rythmes/content'
import { Exemple } from './Exemple'

const GENRES: Record<Exercise['kind'], string> = {
  discrimination: 'Discrimination',
  qcm: 'Reconnaissance',
  appariement: 'Appariement',
  completion: 'Complétion',
  dictee: 'Dictée',
  dechiffrage: 'Déchiffrage',
  frappe: 'Frappe mesurée',
}

/**
 * La liste des exercices d'un module.
 *
 * Les consignes et les motifs sont en place ; la saisie ne l'est pas encore —
 * répondre à un QCM, assembler une palette, mesurer une frappe demandent
 * chacun leur interface. Ce qui est déjà là se joue : entendre l'exercice avant
 * de pouvoir y répondre a du sens, et permet de vérifier le contenu.
 */
export function Exercices({ exercises }: { readonly exercises: readonly Exercise[] }) {
  return (
    <section className="exercices">
      <p className="avertissement">
        Les consignes et les motifs sont écrits ; les interfaces de réponse
        viendront ensuite. En attendant, chaque exercice s’écoute.
      </p>

      {exercises.map((e) => (
        <article key={e.id} className="exercice">
          <h3>
            <span className="genre">{GENRES[e.kind]}</span>
          </h3>
          <p>{e.consigne}</p>
          {motifsDe(e).map((m, i) => (
            <Exemple
              key={`${e.id}-${i}`}
              titre={etiquette(e, i)}
              pattern={m}
              tempoInitial={'bpm' in e ? e.bpm : 80}
            />
          ))}
        </article>
      ))}
    </section>
  )
}

/** Ce qu'il y a à entendre dans un exercice, selon son genre. */
function motifsDe(e: Exercise) {
  switch (e.kind) {
    case 'qcm':
    case 'discrimination':
      return [e.joue]
    case 'appariement':
      return e.motifs
    case 'completion':
      return [e.attendu]
    case 'dictee':
      return [e.attendu]
    case 'dechiffrage':
      return [e.aLire]
    case 'frappe':
      return [e.grille]
  }
}

const etiquette = (e: Exercise, i: number): string =>
  e.kind === 'appariement' ? `Motif ${i + 1}` : 'À écouter'
