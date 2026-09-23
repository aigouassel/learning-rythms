import mdx from '@mdx-js/rollup'
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
      ...mdx({ providerImportSource: '@mdx-js/react', remarkPlugins: [remarkGfm] }),
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
      '@rythmes/content',
    ],
  },
}))
