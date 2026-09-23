import { controle, TAILLE_DU_CONTROLE } from '@rythmes/content'
import { useMemo, useState } from 'react'
import { Exercice, GENRES } from '../exercices/Exercice'

/**
 * Le contrôle : vingt questions prises dans tout le cours, une à la fois.
 *
 * Deux partis pris, et ils ne sont pas cosmétiques.
 *
 * **Une question à l'écran, sans retour arrière.** L'onglet Exercices d'un
 * module déroule toute sa liste : on y survole, on compare les questions entre
 * elles, on devine une réponse à la forme de la suivante. Ici c'est impossible,
 * et c'est la seule chose qui distingue vraiment un contrôle d'une page
 * d'exercices — le tirage fait le reste du travail, mais en amont, invisible.
 *
 * **Aucun numéro de module affiché.** Le mélange serait trahi par son étiquette,
 * et l'indication donnerait la moitié de la réponse : savoir qu'on est au
 * module 6 réduit « binaire ou ternaire ? » à une formalité. Le genre reste, lui,
 * parce qu'il dit ce qu'on attend — pas d'où ça vient.
 *
 * Il n'y a pas d'écran de note. Le cadrage (§7.2) écarte la note unique au
 * profit de trois grandeurs, et un contrôle n'est pas une raison de revenir
 * dessus : chaque question se corrige sur place, comme partout ailleurs dans
 * l'application, et ce qu'on en retire est ce qu'on a vu passer.
 */
export function Examen({
  graine,
  onRejouer,
  onSortir,
}: {
  readonly graine: string
  /** Reprendre un contrôle neuf : une graine nouvelle, donc un tirage neuf. */
  readonly onRejouer: () => void
  readonly onSortir: () => void
}) {
  // Le tirage ne dépend que de la graine : le mémoriser évite qu'une réponse
  // saisie dans une question ne redistribue les dix-neuf autres sous les pieds.
  const { questions } = useMemo(() => controle(graine), [graine])
  const [rang, setRang] = useState(0)

  const finie = rang >= questions.length
  const question = questions[rang]

  return (
    <main className="examen-page">
      <nav className="barre" aria-label="Navigation du contrôle">
        <button type="button" className="retour" onClick={onSortir}>
          <span aria-hidden="true">←</span> Quitter le contrôle
        </button>
        <span className="position">
          {finie ? 'Terminé' : `Question ${rang + 1} sur ${questions.length}`}
        </span>
        <span className="graine" title="Le tirage de ce contrôle">
          {graine}
        </span>
      </nav>

      <Avancement fait={rang} total={questions.length} />

      {finie || !question ? (
        <Fin graine={graine} onRejouer={onRejouer} onSortir={onSortir} />
      ) : (
        <article
          className="question"
          /* La clé fait recommencer la question à zéro : sans elle, React
             réemploierait le composant d'exercice d'une question à l'autre
             quand deux voisines sont du même genre, et la réponse précédente
             resterait affichée sur la suivante. */
          key={question.id}
        >
          <h2>
            <span className="genre">{GENRES[question.kind]}</span>
          </h2>
          <p className="consigne">{question.consigne}</p>
          <Exercice exercice={question} />

          <div className="passer">
            <button type="button" className="suivant" onClick={() => setRang(rang + 1)}>
              {rang + 1 === questions.length ? 'Terminer' : 'Suivant'}{' '}
              <span aria-hidden="true">→</span>
            </button>
            {/* La formulation dit ce qui est vrai : rien n'oblige à répondre,
                mais on ne revient pas. Une interdiction non dite se découvre
                en cliquant, et c'est toujours trop tard. */}
            <p className="aide">On ne revient pas en arrière.</p>
          </div>
        </article>
      )}
    </main>
  )
}

/**
 * L'avancement.
 *
 * Une barre plutôt qu'un compteur seul : la question n'est pas « combien en
 * ai-je fait » mais « combien en reste-t-il », et un rapport se lit d'un coup
 * d'œil là où deux nombres demandent une soustraction.
 */
function Avancement({ fait, total }: { readonly fait: number; readonly total: number }) {
  return (
    <div
      className="avancement"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={fait}
      aria-label="Avancement du contrôle"
    >
      <span className="parcouru" style={{ inlineSize: `${(fait / total) * 100}%` }} />
    </div>
  )
}

/**
 * La fin du contrôle.
 *
 * Elle ne note pas, et elle ne fait pas semblant de le regretter : ce qui est
 * offert à la place, c'est le moyen de recommencer — le même contrôle, si on
 * veut se mesurer à ce qu'on a raté, ou un autre.
 */
function Fin({
  graine,
  onRejouer,
  onSortir,
}: {
  readonly graine: string
  readonly onRejouer: () => void
  readonly onSortir: () => void
}) {
  return (
    <section className="fin-examen">
      <h2>Contrôle terminé</h2>
      <p>
        {TAILLE_DU_CONTROLE} questions prises dans les huit modules, toutes
        difficultés mêlées. Chacune s’est corrigée devant toi : ce qui reste à
        travailler, tu l’as vu passer.
      </p>
      <p className="rappel-graine">
        Ce tirage porte le nom <code>{graine}</code> — l’adresse de cette page le
        garde, et le même lien le redonnera à l’identique.
      </p>
      <div className="apres">
        <button type="button" className="suivant" onClick={onRejouer}>
          Un autre tirage
        </button>
        <button type="button" className="retour" onClick={onSortir}>
          Revenir au cours
        </button>
      </div>
    </section>
  )
}
