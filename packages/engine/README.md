# @rythmes/engine

Le transport : décider quand chaque événement se produit.

**Dépend de :** `@rythmes/core`

Il dépend d'une interface `Clock`, jamais de `AudioContext`. En test on
injecte une horloge fictive : une polyrythmie 7:5 sur deux cents mesures se
vérifie instantanément, sans navigateur.
