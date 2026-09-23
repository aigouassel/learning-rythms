import { Exemple } from './components/Exemple'
import { clave, divisions, pulsation, skank, triolet, troisContreDeux } from './demo'

/**
 * Une page d'essai, pas encore le cours.
 *
 * Elle existe pour vérifier de bout en bout ce que les paquets produisent : la
 * gravure, le son, et le surlignage qui les relie. Les modules viendront
 * remplacer cette page.
 */
export function App() {
  return (
    <main>
      <header>
        <h1>Rythmes</h1>
        <p>
          Essai des paquets : chaque exemple est gravé par <code>notation</code>, joué par{' '}
          <code>engine</code>, et le signe s’allume au moment où il sonne.
        </p>
      </header>

      <Exemple titre="La pulsation nue" pattern={pulsation} tempoInitial={110} />
      <Exemple titre="Diviser le temps" pattern={divisions} syllabes tempoInitial={72} />
      <Exemple titre="Le skank du reggae" pattern={skank} tempoInitial={80} />
      <Exemple titre="Un triolet de croches" pattern={triolet} tempoInitial={80} />
      <Exemple titre="Trois contre deux" pattern={troisContreDeux} tempoInitial={60} />
      <Exemple titre="La clave son 3-2" pattern={clave} tempoInitial={100} />
    </main>
  )
}
