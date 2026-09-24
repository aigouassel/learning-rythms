import mdx from '@mdx-js/rollup'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * `base` diffère entre développement et production.
 *
 * GitHub Pages sert un dépôt de projet depuis un sous-chemin —
 * `/learning-rythms/` — et les liens vers les fichiers construits doivent en
 * tenir compte. En développement, le serveur est à la racine : imposer le même
 * préfixe obligerait à taper l'URL du dépôt pour travailler en local.
 */
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/learning-rythms/' : '/',
  plugins: [
    // MDX passe avant React : il produit du JSX, que le plugin React compile
    // ensuite. L'ordre inverse laisserait des fichiers .mdx non transformés.
    {
      enforce: 'pre',
      // remark-gfm ajoute les tableaux, que le Markdown de base ignore. Les
      // leçons s'en servent beaucoup : une échelle de durées se lit en deux
      // colonnes, pas en phrases.
      //
      // rehype-slug donne un `id` à chaque titre, dérivé de son texte. Le fil
      // des sections pourrait s'en fabriquer lui-même, mais alors les ancres
      // n'existeraient qu'une fois la page affichée : un lien vers
      // `#le-faux-ami` ne retomberait nulle part au chargement.
      ...mdx({
        providerImportSource: '@mdx-js/react',
        remarkPlugins: [remarkGfm],
        rehypePlugins: [rehypeSlug],
      }),
    },
    react(),
  ],
  optimizeDeps: {
    // Les paquets internes exposent leur source TypeScript : Vite doit la
    // compiler comme du code du projet, pas la pré-empaqueter comme une
    // dépendance publiée.
    exclude: [
      '@rythmes/core',
      '@rythmes/notation',
      '@rythmes/engine',
      '@rythmes/scoring',
      '@rythmes/syllabus',
      '@rythmes/content',
      '@rythmes/00-prise-de-reperes',
      '@rythmes/01-sentir-la-pulsation',
      '@rythmes/02-temps-forts-et-faibles',
      '@rythmes/03-les-durees',
      '@rythmes/04-lire-et-ecrire',
      '@rythmes/05-enrichir-le-vocabulaire',
      '@rythmes/06-composees-et-ternaire',
      '@rythmes/07-polyrythmie',
      '@rythmes/08-le-rythme-comme-materiau',
    ],
  },
}))
