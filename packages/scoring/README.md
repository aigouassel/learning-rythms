# @rythmes/scoring

La correction, sous ses deux formes : temporelle (des millisecondes) et
symbolique (deux rythmes comparés en tant que structures).

**Dépend de :** `@rythmes/core`, `@rythmes/notation`

Des fonctions pures, testables avec des données synthétiques — « je simule
quelqu'un qui accélère de deux BPM par mesure : est-ce détecté ? ».

Les deux corrections partagent un même appariement (`align`) : si sept frappes
répondent à huit attaques, laquelle manque ? La réponse naïve — chacune à la
plus proche — produit des cascades d'erreurs absurdes. On cherche donc
l'appariement de coût total minimal en préservant l'ordre. Seule la clé change :
des secondes pour une frappe, des fractions pour une dictée.

La correction temporelle ne rend pas une note mais **trois grandeurs** : le
décalage global (souvent le matériel), la dérive de tempo, et la dispersion.
Trois causes, trois remèdes — un élève qui accélère et un élève instable ne
doivent pas recevoir le même conseil.
