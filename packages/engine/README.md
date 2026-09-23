# @rythmes/engine

Le transport : décider quand chaque événement se produit.

**Dépend de :** `@rythmes/core`

Il dépend d'une interface `Clock`, jamais de `AudioContext` — l'adaptateur Web
Audio vit dans `apps/web`, et ce paquet se compile sans les types du DOM. En
test on injecte une horloge fictive : une polyrythmie 7:5 sur deux cents mesures
se vérifie instantanément, sans navigateur.

Le principe du planificateur tient en une phrase : **un réveil imprécis place
des sons sur une horloge précise**. Voir
[A Tale of Two Clocks](https://web.dev/articles/audio-scheduling).
