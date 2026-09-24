# Chantier — dictée, déchiffrage, repérage d'erreur

> **Document temporaire.** Il tient la liste de ce qui reste à corriger sur ces
> trois genres d'exercices, et **il est à supprimer** dès que tout est traité.
> Il n'appartient pas à la documentation du projet : d'où le préfixe `my.`.

Établi le 2026-09-24, après lecture de `apps/web/src/exercices/Dictee.tsx`,
`Reperage.tsx` et `Frappe.tsx`, croisée avec les données des modules.

---

## Le diagnostic commun

Ces trois exercices sont les seuls où **l'élève produit ou désigne quelque
chose** — un rythme écrit, une exécution silencieuse, une position sur une
grille. Et ce sont les trois où **rien ne permet d'entendre ce qu'on a produit,
ni de voir la bonne réponse**.

La frappe mesurée a désormais son « écouter la grille juste ». Ces trois-là
n'ont pas d'équivalent : on y répond à l'aveugle, et l'on y reste. C'est la
cause première de l'impression d'opacité ; la plupart des points ci-dessous en
découlent.

---

## 1. Bugs de justesse — la machine a tort, l'élève croit avoir tort

- [ ] **Le tempo de quantification de la dictée est codé en dur.**
      `Dictee.tsx` — `candidats` divise par `BPM = 72` alors que la lecture
      joue à `exercice.bpm ?? BPM`. `03-dictee-escalier` est à **66** : les
      positions relevées sont comprimées d'un facteur 66/72, soit un tiers de
      temps d'écart sur la dernière frappe d'une mesure. Aucun des candidats
      proposés ne correspond à ce qui a été joué.
      *Correctif : lire le tempo de l'exercice, une seule fois, et le passer
      aussi bien à la lecture qu'à la quantification.*

- [ ] **Deux transports simultanés en dictée.**
      `Dictee.tsx` — `commencer()` appelle `lecture.demarrer()` sans arrêter la
      lecture en cours. Cliquer « je le rejoue » sans avoir mis en pause laisse
      le premier transport boucler jusqu'au rechargement de la page, hors de
      portée de tout `arreter()`.
      *Correctif : arrêter avant de démarrer.*

- [ ] **La grille du repérage a perdu ses repères de pulsation.**
      `Reperage.tsx` — le composant réimplémente à la main le balisage de
      `.grille` sans appeler `beatStarts`, donc sans la classe `temps` qui pose
      une barre plus forte au début de chaque temps. `GrilleDeSaisie`, elle, les
      a. Pour la clave du module 7 (2 rondes, 16 cases), on désigne une position
      parmi seize carrés identiques : on peut trouver l'erreur à l'oreille et se
      tromper de case.
      *Correctif : réutiliser `GrilleDeSaisie` en lecture seule plutôt que de la
      dupliquer — c'est aussi ce qui évitera la prochaine divergence.*

- [ ] **`04-une-attaque-en-avance` refuse la réponse que l'oreille donne.**
      `Reperage.tsx` — `ecart` renvoie la **première** position divergente dans
      l'ordre `[...ecrit, ...joue]`. Pour `quatreQuarts` (attaque en 3/4) contre
      `quatreQuartsDecale` (en 5/8), c'est **3/4** : l'endroit où quelque chose
      est écrit et où l'on n'entend rien. Mais ce que l'oreille repère, c'est
      l'attaque entendue trop tôt, en 5/8 — refusée par « Pas là ». Les trois
      autres repérages n'ont qu'une position divergente et masquent le défaut.
      *Correctif : `ecart` devient un ensemble de positions, toutes acceptées,
      et le verdict nomme la nature de l'écart (manquante, en trop, déplacée).*

## 2. Ce qui manque pour apprendre quelque chose

- [ ] **Entendre ce qu'on a écrit** (dictée, variante palette).
      La portée affiche la réponse, la grille la construit, et rien ne la joue.
      C'est pourtant ainsi qu'on se corrige en dictée : jouer sa version, jouer
      le modèle, entendre l'écart. Tout est déjà là — `useLecture` accepte
      n'importe quel motif.

- [ ] **Entendre les candidats** (dictée, variante frappe-puis-choix).
      On doit reconnaître « celle que tu as entendue » parmi des notations
      muettes, le modèle n'étant plus audible à ce moment-là.

- [ ] **Entendre ce qui est écrit** (repérage).
      On n'entend que l'enregistrement. Comparer deux sons est précisément le
      geste que l'exercice prétend enseigner, et même après une réponse juste
      l'écart n'est ni montré ni entendu.

- [ ] **Révéler la bonne réponse** (dictée, repérage).
      On peut se tromper indéfiniment sans jamais voir ce qu'il fallait écrire
      ou désigner. Voir ⚠️ *Décision ouverte* ci-dessous.

- [ ] **Un verdict dans la langue de l'élève** (dictée).
      La grille de saisie ne demande jamais de choisir une durée — elle les
      déduit de l'attaque suivante, et c'est un bon choix. Mais `explain()`
      répond « tu as écrit 3/8 de ronde là où il fallait 1/4 de ronde » : on
      reproche une décision qu'elle n'a pas prise, dans une unité qu'aucun
      musicien n'emploie.

## 3. Ce qu'il faut deviner et qui devrait être dit

- [ ] **Le déchiffrage ne dit pas qu'il est muet.**
      Le bandeau annonce « À frapper : … · 1 mesures, après une mesure de
      décompte » et ne dit jamais que **rien ne sonnera**. C'est toute la
      différence avec la frappe mesurée, et l'information la plus
      déstabilisante : on attend un accompagnement qui ne vient pas et l'on
      croit à une panne.

- [ ] **« 1 mesures ».** `Frappe.tsx` — le sélecteur de durée écrit
      `{m} mesures` sans accord, là où `Consigne` accorde. Le déchiffrage est le
      seul à l'exposer, puisque le seul à proposer 1.

- [ ] **Le déchiffrage sans `voix` désigne ses lignes au hasard.**
      Le repli prend la première voix rencontrée dans l'ordre des `onsets`, qui
      n'est pas forcément la portée du haut. L'ambiguïté que le bandeau devait
      lever revient silencieusement.

- [ ] **`cycles={1}` en dur pour le déchiffrage** (`ExerciceDechiffrage`).
      Le sélecteur offre 1/2/4/8, donc le choix existe — mais un défaut à une
      mesure rend le verdict statistiquement creux : la dérive ne se lit pas sur
      quatre attaques. Choisir entre un défaut plus long et un `cycles` porté
      par le type `Dechiffrage`.

- [ ] **La dictée frappe-puis-choix ne dit pas où l'on en est.**
      Quatre phases (`ecoute`, `frappe`, `choix`, `verdict`) sans indicateur, ni
      nombre de mesures, ni fin : « j'ai fini » est manuel et le motif boucle.
      La frappe mesurée a résolu le même problème avec un décompte et des
      jetons de mesure — il y a là un composant à partager.

- [ ] **`aria-label="Position 3/8"`** (repérage, grille de saisie).
      Personne ne pense en huitièmes de ronde. « Mesure 1, deuxième temps et
      demi » est l'énoncé d'un musicien.

---

## ⚠️ Décision ouverte

**Révéler la bonne réponse : au premier échec, ou seulement à la demande ?**

- *Tout de suite* — soulage, et court-circuite l'effort : on cesse de chercher
  dès qu'on sait que la réponse arrive.
- *Derrière un bouton « montre-moi »* — laisse le choix, mais la plupart
  cliqueront avant d'avoir cherché.

Un troisième terme : ne l'offrir qu'**après deux tentatives**, ce qui garantit
qu'on a cherché sans enfermer dans l'échec. À trancher avant d'attaquer §2.

---

## Ordre proposé

1. §1 en entier — ce sont des corrections, aucun arbitrage requis.
2. §3 sauf `cycles={1}` — du texte et un repli, sans conséquence de conception.
3. §2 — après la décision ci-dessus.
4. `cycles={1}` — c'est une question de contenu autant que de code.

**Quand toutes les cases sont cochées, supprimer ce fichier.**
