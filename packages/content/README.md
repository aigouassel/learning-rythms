# `@rythmes/content`

Le cours assemblé — la façade par laquelle l'application le voit.

**Dépend de :** `@rythmes/syllabus`, `@rythmes/core`, et des neuf libs de
`modules/`

Ce paquet ne contient plus de contenu : chaque module porte le sien dans
`modules/NN-slug`. Il en fait un cours — `MODULES` dans l'ordre, `LEXIQUE` d'un
seul tenant, le vivier du contrôle — et lie les opérations de `syllabus` à ces
données, si bien que l'application écrit `controle(graine)` et
`exercisesOf(3)` sans savoir d'où le cours vient.

C'est aussi ici que vivent les tests **transverses**, ceux qu'aucune lib de
module ne peut faire seule : le graphe des prérequis ne boucle pas, aucune
leçon n'emploie un terme introduit plus tard, le contrôle tire dans tout le
cours. Vérifier qu'un texte du module 5 n'utilise pas un mot du module 7
demande tout le lexique — donc l'agrégat.
