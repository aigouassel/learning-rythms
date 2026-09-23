# learning-rythms

Un cours de rythme musical servi par une application web : elle sonne, elle
mesure, elle corrige — ce qu'un support écrit ne peut pas faire.

**En ligne : <https://aigouassel.github.io/learning-rythms/>**

Le cadrage complet est dans [`docs/cadrage.md`](docs/cadrage.md) ; le vocabulaire
du cours dans [`docs/lexique.md`](docs/lexique.md).

## Organisation

| Paquet | Rôle | Dépend de |
| --- | --- | --- |
| `@rythmes/core` | le domaine rythmique, en fractions exactes | *rien* |
| `@rythmes/notation` | fractions ⇄ figures ⇄ syllabes | `core` |
| `@rythmes/engine` | transport et scheduler, sur une horloge injectée | `core` |
| `@rythmes/scoring` | correction temporelle et symbolique | `core`, `notation` |
| `@rythmes/content` | les modules du cours et leurs exercices | `core`, `notation` |
| `@rythmes/web` | l'application — React, VexFlow, smplr | tous |

VexFlow et smplr restent confinés dans `apps/web` : les paquets logiques ne les
connaissent pas, et la bibliothèque de rendu reste remplaçable.

## Où en est le projet

Les neuf modules sont écrits — leçon, motifs et exercices — et les neuf genres
d'exercices ont leur interface. La calibration de latence et le diagnostic du
module 0 fonctionnent, la progression tient dans le navigateur. Le cours compte
124 exercices : une quinzaine par module, neuf pour l'unité 0.

Reste ouvert, par choix : le système d'acquisition (« module acquis ») et
l'échauffement par répétition espacée. Voir `docs/cadrage.md` §9.

## Commandes

```bash
yarn install
yarn dev         # lance l'application
yarn test        # les tests de tous les paquets
yarn typecheck   # compile le graphe de références TypeScript
```
