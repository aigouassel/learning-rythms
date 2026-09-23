# Cadrage — learning-rythms

> Document de référence du projet. Il fixe l'objectif, la structure du cours et
> les décisions d'architecture prises avant la première ligne de code.
>
> Dernière mise à jour : 2026-09-23

---

## 1. Objectif

Un cours de rythme musical, construit pour Audrey, servi par une application web
qui fait ce qu'un support écrit ne peut pas faire : **sonner, mesurer, corriger**.

L'objectif n'est pas d'apprendre le rythme à quelqu'un qui l'ignore. Il est de
**poser des mots et une notation sur une compétence déjà réelle** — dix ans de
saxophone en fanfare, joués d'oreille, avec une lecture restée laborieuse.

Le cours construit donc un pont, dans les deux sens :

```
   J'entends un rythme   →  je le nomme   →  je l'écris        (dictée)
   Je lis un rythme      →  je l'entends  →  je le joue        (déchiffrage)
   Je veux un groove     →  je le conçois →  je le note        (composition)
```

Le troisième sens est la destination : **composer et arranger**.

---

## 2. Ce que le profil de l'apprenante impose

Ces contraintes ne sont pas des préférences d'interface, elles découlent du
profil musical (voir `~/projects/scales/docs/my.musical-profile.md`).

| Constat | Conséquence sur le cours |
|---|---|
| Oreille relative forte, audiation | l'écoute précède toujours la théorie |
| Déchiffrage laborieux | le symbole écrit arrive **en dernier**, collé au son |
| Clé de sol uniquement | **jamais de clé de fa**, jamais deux portées |
| Aucun geste pianistique | aucune consigne ne suppose de savoir jouer du piano |
| Saxophone en mi♭ | hauteurs nommées **en son réel** (référence piano) |
| Vise la composition | le cours se termine sur la production, pas sur la découverte |

Une remarque qui vaut pour tout le projet : **le rythme est le seul domaine
musical où la transposition du saxophone ne gêne pas.** Une noire est une noire
sur tous les instruments. C'est le terrain idéal pour reconstruire un rapport à
la notation sans la couche de décalage qui a saboté le nommage des hauteurs.

---

## 3. Principes pédagogiques

### 3.1 Les cinq temps d'un module

Chaque module progresse dans cet ordre, qui n'est pas négociable :

| | Étape | Où |
|---|---|---|
| 1 | **Entendre** — la sensation avant tout mot | onglet Cours |
| 2 | **Nommer** — la théorie, posée sur une sensation déjà installée | onglet Cours |
| 3 | **Lire** — le symbole, introduit en dernier, collé à son son | onglet Cours |
| 4 | **Écrire** — dictée, QCM, production | onglet Exercices |
| 5 | **Jouer** — frappe mesurée | onglet Exercices |

Le cours **installe** : sensation → mot → symbole.
Les exercices **retournent le mouvement** : ils partent du symbole pour remonter
vers le son. C'est ce demi-tour qui construit la lecture.

### 3.2 Trois représentations, jamais une seule

Un même objet rythmique existe sous trois formes, affichées **simultanément et
synchronisées** dans les exemples jouables :

- le **son** (percussion, éventuellement une hauteur) ;
- la **notation** (VexFlow) ;
- les **syllabes rythmiques** (Kodály : *ta*, *ti-ti*).

La co-occurrence est le mécanisme d'apprentissage. On n'apprend pas à lire en
lisant davantage, mais en associant.

**Les syllabes sont un tremplin, pas une couche permanente.** Elles servent au
module 3, où la notation est introduite, puis disparaissent. Leur rôle est de
faire traverser le passage du son au symbole ; les maintenir ensuite en ferait
une béquille qui dispenserait de lire. Elles restent consultables dans le
lexique (§4.4) pour qui veut y revenir.

### 3.3 Passer par le rapport avant le nom

Les figures sont présentées comme des **proportions** (moitié de, tiers de) avant
d'être nommées (croche, triolet). C'est la transposition au temps de la règle
« passer par l'intervalle avant le nom ».

### 3.4 Expliquer la cause, pas la règle

Exemple canonique : on n'écrit pas un rythme n'importe comment parce que la
notation doit rendre **les temps visibles à l'œil**. La règle de regroupement
découle de cette cause ; elle n'est pas une convention arbitraire à mémoriser.

### 3.5 L'app ne prescrit que ce qu'elle peut accompagner

Pas de consigne « lève-toi et marche », pas d'exercice non vérifiable. Tout passe
par la frappe au clavier. Frapper dans ses mains sur une suite affichée reste
possible à tout moment — c'est une initiative personnelle, pas une fonctionnalité.

---

## 4. Structure du cours

### 4.1 Les modules

| # | Module | Cœur du module |
|---|---|---|
| **0** | Prise de repères | calibration de latence + diagnostic de départ |
| **1** | Sentir la pulsation | pulsation, tempo · écoute comparée lent/rapide |
| **2** | Temps forts et temps faibles | la mesure · 2, 3, 4 temps reconnus à l'oreille |
| **3** | **Les durées** ⭐ | ronde → double **en proportions** · syllabes · silences |
| **4** | Lire et écrire le rythme | chiffrages · cellules · dictées · **écrire lisiblement** |
| **5** | Enrichir le vocabulaire | croche pointée, doubles · syncope · contretemps |
| **6** | Mesures composées et ternaire | 6/8 · triolet · binaire vs ternaire |
| **7** | Polyrythmie et métriques asymétriques | 2 contre 3 · clave · 7/8, 9/8 |
| **8** | Le rythme comme matériau | cellule, variation, augmentation/diminution, groove |

⭐ = tranche verticale construite en premier (voir §8.1).

**Unité 0** est à part : ni théorie ni note. Elle calibre la latence
(16 frappes sur un clic, offset médian stocké, rejouable depuis les réglages)
puis mesure un point de départ sur quatre mini-épreuves — la lecture rythmique
étant une zone d'ombre déclarée du profil.

**Les règles d'écriture lisible** (ligature, regroupement) vivent dans le module 4,
parce qu'elles sont nécessaires dès la première dictée. Le module 8 y revient,
là où écrire pour être lu devient le sujet.

### 4.2 Le graphe de progression

L'ordre n'est pas une liste : les modules 5 (écrire proprement) et 6 (entendre du
complexe) sont indépendants l'un de l'autre.

```
        0 ─→ 1 ─→ 2 ─→ 3 ─→ 4 ─┬─→ 5 ─┬─→ 7 ─→ 8
                                └─→ 6 ─┘
```

Les prérequis sont **des données** dans le frontmatter de chaque module, et un
test du package `content` vérifie que le graphe est acyclique et que tout module
est atteignable depuis 0. Une erreur de rédaction devient un test rouge.

### 4.3 Les styles, fil transversal

Chaque module est teinté d'un répertoire. Le style choisi doit **démontrer** le
concept, pas seulement l'illustrer.

| # | Styles | Pourquoi celui-là |
|---|---|---|
| 1 | house/techno, marche militaire, ballade lente | la house met la pulsation à nu |
| 2 | marche (2), valse (3), pop/rock (4) | le cycle s'entend sans compter |
| 3 | batterie rock : charley en noires → croches → doubles | la proportion devient audible |
| 4 | riffs percussifs célèbres, motifs de fanfare | une cellule déjà connue, enfin écrite |
| 5 | reggae (skank), funk, ska, jazz | le reggae est le contretemps à l'état pur |
| 6 | blues shuffle, marche en 6/8, gigue, ballade 12/8 | la marche en 6/8 est un terrain de compétence |
| 7 | clave cubaine, afrobeat, Balkans 7/8 & 9/8 | le 3-contre-2 y est structurel |
| 8 | boucle hip-hop, ostinato (Boléro), phasing (Reich) | la variation d'une cellule *est* la composition |

Le `style` est une **donnée typée** portée par chaque pattern, pas une mention
dans la prose. Bénéfice gratuit : un index transversal par répertoire, seconde
façon de parcourir le cours.

Note de cohérence à assumer dans le texte : le swing du jazz est *ternaire par
nature*. Le module 5 s'y appuie avant que le module 6 ne le nomme. C'est une
bonne amorce à condition d'être explicitée, pas laissée en angle mort.

### 4.4 Le lexique, colonne transversale

Le vocabulaire théorique est la lacune centrale du profil. Le cours ne peut donc
pas se contenter de définir un terme au passage : il lui faut un **lexique de
premier rang**, consultable à tout moment et relié aux modules dans les deux sens.

Inventaire éditorial : `docs/lexique.md`. Il devient à terme des données typées
dans `content`, rendues comme une page de l'application.

Chaque entrée porte :

| Champ | Rôle |
|---|---|
| `nom` | le terme savant |
| `aussiAppele` | les synonymes d'usage — *anacrouse* / *levée* |
| `sensation` | **ce que ça fait avant d'avoir un nom** — le champ distinctif |
| `definition` | une phrase, pas un paragraphe |
| `introduitAu` | le module qui l'installe |
| `voirAussi` | les termes voisins, et surtout ceux avec lesquels on le confond |
| `exemple` | un pattern jouable |
| `style` | où on l'entend pour de vrai |

Le champ `sensation` applique le principe §3.1 jusque dans le lexique : une
entrée qui commencerait par la définition formelle trahirait l'ordre
*entendre → nommer*.

Le lexique comporte aussi une section **faux amis** — les couples qu'on
confond : syncope/contretemps, 6/8 contre 3/4, temps/pulsation, tempo/rythme.
Pour un vocabulaire jamais consolidé, distinguer vaut mieux que définir.

**Le croisement est vérifié au build.** Deux tests du package `content` :

1. tout terme cité dans une leçon existe dans le lexique ;
2. **aucune leçon n'emploie un terme dont le module d'introduction vient
   après elle.**

Le second test est le gardien réel de l'incrémentalité. Le graphe de prérequis
(§4.2) déclare une intention ; la vérification des références en avant constate
ce que le texte fait vraiment.

---

## 5. Les exemples jouables

### 5.1 Le composant

```
  ┌──────────────────────────────────────────────┐
  │  ♩     ♪ ♪     ♩       𝄽                     │
  │  ta    ti-ti   ta                            │
  │        ▔▔▔▔▔   ← notation ET syllabe s'allument
  │  ▶  ⏸   tempo ──●───  ♩=72   [ralenti]       │
  └──────────────────────────────────────────────┘
```

L'écran **suit** le son : le surlignage se met à jour dans une
`requestAnimationFrame` qui *lit* l'horloge audio, sans jamais la piloter.

La ligne de syllabes n'est présente **qu'au module 3** (§3.2). Ailleurs, le
composant affiche la notation et le son seuls.

### 5.2 Deux modes

| Mode | Rendu | Quand |
|---|---|---|
| **Rythmique pur** | portée à ligne unique, kit de percussions | quand le rythme *est* le sujet |
| **Avec hauteurs** | portée à 5 lignes, timbre mélodique | quand le style ne se reconnaît pas sans mélodie |

Les hauteurs sont **décoratives** : une annotation optionnelle sur une attaque,
jamais un domaine modélisé. Pas de gammes, pas d'harmonie, pas de transposition
de hauteur. Ce cours parle de temps.

### 5.3 Le son

Percussion échantillonnée (smplr), avec un **kit** et non un clic unique —
grosse caisse, caisse claire, charleston, clave, cowbell. Sans variété de timbre,
le reggae et la house sonnent pareil.

### 5.4 Répertoire réel : hybride

- **Percussion synthétisée** pour tout ce qui est manipulé, ralenti, décomposé,
  surligné. C'est le cœur pédagogique.
- **Liens externes** vers un vrai morceau, posés à côté, pour que le concept
  atterrisse dans de la musique réelle. Aucune synchronisation, aucun fichier
  embarqué — les droits d'auteur, pas la technique, sont la raison.

### 5.5 Le laboratoire de transformations — outil interne

Des fonctions pures utilisées **au moment de rédiger** le contenu. Leur sortie
est commitée dans `content` ; le générateur ne part pas dans le bundle.

| Transformation | Effet | Sert au module |
|---|---|---|
| **Remétrage** | la même cellule relue en 4/4, 3/4, 2/4 | 2 |
| **Binaire ⇄ ternaire** | le même motif en croches puis en triolets / 6/8 | 6 |
| **Augmentation / diminution** | toutes les durées ×2 ou ÷2 | 3 |
| **Déplacement (rotation)** | la cellule décalée d'un temps | 5, 7 |
| **Densification** | ajouter ou retirer des attaques | 8 |

*Remétrage* désigne le changement de mesure. *Transposition* désigne le
déplacement des hauteurs. Les deux mots ne sont pas interchangeables.

Geler la sortie n'est pas qu'une économie de poids : un remétrage automatique
sera **parfois musicalement faux** — techniquement valide, sonnant mal. La sortie
commitée peut être corrigée à la main.

---

## 6. Les exercices

### 6.1 La typologie

| Type | Consigne | Compétence |
|---|---|---|
| **Discrimination** | « binaire ou ternaire ? » · « 6/8 ou 3/4 ? » | catégoriser une sensation |
| **QCM notation** | « écoute — laquelle de ces notations ? » | reconnaître |
| **Appariement** | relier 4 sons à 4 notations | discriminer finement |
| **Complétion** | une mesure à trous, un élément à placer | produire sous contrainte |
| **Palette libre** | écrire toute la mesure (dictée) | produire |
| **Frappe mesurée** | taper en place, tenir, frapper des contretemps | exécuter |
| **Déchiffrage** | lire et jouer | symbole → son |
| **Repérage d'erreur** | « où la partition et le son diffèrent-ils ? » | lecture active |
| **Composition guidée** | « 2 mesures en 6/8 avec une levée et une syncope » | **l'objectif final** |

Les quatre premiers forment une échelle du moins au plus exigeant : reconnaître
avant de restituer. Le QCM est un **point de départ**, jamais un point d'arrivée —
quand on compose, personne ne propose quatre options.

### 6.2 Règle de sélection

**Le type d'exercice est choisi par la compétence que le module installe, jamais
par souci de complétude.** Un module sans notation ne peut pas avoir de dictée ;
un module de polyrythmie n'a pas à en avoir une — transcrire du 3-contre-2 n'est
pas l'objectif, le sentir l'est.

### 6.3 Répartition par module

| # | Module | Types retenus | Écartés, et pourquoi |
|---|---|---|---|
| 0 | Prise de repères | calibration, mini-diagnostic | — (hors typologie) |
| 1 | Sentir la pulsation | frappe mesurée · **tenue sans clic** · discrimination de tempo | tout ce qui touche à la notation : elle n'existe pas encore |
| 2 | Temps forts/faibles | discrimination du nombre de temps · frappe accentuée · QCM chiffrage | dictée : rien à écrire encore |
| 3 | **Les durées** ⭐ | QCM · appariement · complétion · palette · déchiffrage | — c'est la tranche verticale, elle porte les 4 niveaux |
| 4 | Lire et écrire | déchiffrage · palette · repérage d'erreur · composition guidée minimale | discrimination : la perception n'est plus le point dur |
| 5 | Syncope, contretemps | discrimination syncope/contretemps · frappe de contretemps · palette · repérage d'erreur | appariement : redondant avec la discrimination ici |
| 6 | Composées et ternaire | discrimination binaire/ternaire · QCM 6/8 vs 3/4 · déchiffrage ternaire · frappe | palette : la notation du ternaire arrive trop tôt pour être produite |
| 7 | Polyrythmie, asymétrique | frappe à deux touches (2 contre 3) · discrimination de groupement · déchiffrage | dictée : transcrire n'est pas l'objectif, sentir l'est |
| 8 | Le rythme comme matériau | composition guidée · variation d'un motif donné · palette | QCM, discrimination : on ne reconnaît plus, on produit |

Trois à cinq types par module. Le chiffre définitif reste ouvert (§9).

### 6.4 La dictée : modalité d'entrée

La modalité est une **propriété de l'exercice**, pas de l'app, parce que les deux
saisies ne travaillent pas la même chose :

| Modalité | Ce que ça teste |
|---|---|
| Frappe au clavier | percevoir + reproduire — terrain fort, risque de contourner le nommage |
| Palette de figures | percevoir + **analyser et nommer** — le manque réel |

Voie retenue par défaut : **frappe → quantification → 2-3 interprétations
proposées → choix**. L'oreille reste la porte d'entrée, mais valider impose de
départager des notations. L'ambiguïté technique devient le levier pédagogique.

---

## 7. Le modèle de feedback

### 7.1 Deux natures de correction

- **Temporelle** — l'écart en millisecondes entre une frappe et la grille.
- **Symbolique** — deux rythmes comparés en tant que structures (a-t-on écrit un
  triolet là où il y avait deux croches ?).

Ce sont deux fonctions pures distinctes. La correction symbolique est partagée
par le QCM, l'appariement, la complétion et la palette : seul le widget de saisie
change. Commencer par le QCM n'enferme donc nulle part.

### 7.2 Correction temporelle : trois grandeurs, pas une note

Un score en pourcentage n'apprend rien. On décompose l'erreur :

| Grandeur | Calcul | Ce que ça révèle |
|---|---|---|
| **Décalage global** | moyenne de l'erreur signée | biais — souvent matériel, pas musical |
| **Dérive de tempo** | pente d'une régression linéaire de l'erreur | on accélère ou on ralentit |
| **Dispersion** | écart-type des résidus | instabilité sans biais |

Trois causes, trois remèdes différents. Un élève qui accélère et un élève instable
ne doivent pas recevoir le même conseil.

### 7.3 La latence

Trois retards s'additionnent : sortie audio (5–30 ms), remontée de l'événement
clavier, temps de réaction. Total : 20–40 ms de **biais constant**, qui ferait
diagnostiquer « systématiquement en retard » un jeu parfait.

La décomposition du §7.2 le résout : le biais matériel tombe entièrement dans le
décalage global. La calibration de l'unité 0 le mesure une fois et le soustrait.

Piège d'API : le `timeStamp` d'un `KeyboardEvent` est exprimé sur l'horloge
`performance.now()`, **pas** sur celle de l'`AudioContext`. Même vitesse, origines
différentes. La conversion est obligatoire.

---

## 8. Architecture technique

```
learning-rythms/
├── package.json                 workspaces Yarn 4
├── tsconfig.base.json
├── docs/
├── apps/
│   └── web/                     React · Vite · VexFlow · smplr
└── packages/
    ├── core/                    types du domaine, fractions exactes   (0 dép)
    ├── notation/                fractions ⇄ figures ⇄ syllabes        (core)
    ├── engine/                  transport, scheduler, horloge injectée (core)
    ├── scoring/                 correction temporelle et symbolique   (core, notation)
    └── content/                 modules MDX + exercices typés
```

**Outillage** : Yarn 4 · Vite · Vitest · project references TypeScript.
**Chaque package porte sa propre série de tests.**

### Pourquoi ce découpage

- `core` ne dépend de rien et ignore le DOM comme l'audio. La vérité musicale s'y
  teste dans Node, en millisecondes.
- `engine` dépend d'une interface `Clock`, **pas** de `AudioContext`. En test on
  injecte une horloge fictive : une polyrythmie 7:5 sur 200 mesures se vérifie
  instantanément, sans navigateur. L'adaptateur Web Audio vit donc dans
  `apps/web`, avec le reste de ce qui touche au navigateur : `engine` se compile
  sans les types du DOM, ce qui rend la règle vérifiable plutôt que promise.
- `notation` traduit entre les trois représentations. Utilisé deux fois : pour
  afficher un exemple, et pour corriger une dictée.
- `scoring` est une fonction pure — testable avec des données synthétiques
  (« je simule quelqu'un qui accélère de 2 BPM par mesure : est-ce détecté ? »).
- **VexFlow et smplr restent confinés dans `apps/web`.** Les packages logiques ne
  les connaissent pas ; la bibliothèque de rendu est remplaçable.

Cette discipline est **vérifiée par l'outillage** : si `core` ne déclare aucune
dépendance, aucune importation accidentelle ne peut passer.

### 8.1 Représentation du rythme

Positions en **fractions exactes** (`{num, den}`), pas en flottants.

Seule représentation qui exprime triolets et polyrythmies sans cas particulier,
et seule qui permette de **comparer** deux rythmes symboliquement sans ambiguïté :
`1/3` reste `1/3`, jamais `0.33333…`.

### 8.2 Le contenu : MDX et données typées

```
content/modules/03-les-durees/
├── lesson.mdx        la prose + les <Exemple> jouables
└── exercises.ts      les exercices, en données typées
```

La prose en MDX est agréable à rédiger et laisse insérer un exemple au moment
exact où le concept est expliqué. Les exercices en TS typé sont vérifiés par le
compilateur : un QCM a bien une réponse correcte parmi ses options, une mesure en
6/8 contient bien six croches. **Une erreur de contenu devient une erreur de
build**, pas un bug découvert en se trompant sur un exercice faux.

### 8.3 Le motif récurrent : l'ambiguïté rendue explicite

Trois problèmes du projet n'ont pas de solution unique :

- **quantifier** une frappe en notation ;
- **remétrer** un motif d'une mesure vers une autre ;
- **choisir** l'écriture d'un même rythme.

Dans les trois cas, la signature juste n'est pas `(entrée) → sortie` mais
`(entrée, stratégie) → sortie`, ou `(entrée) → candidats[]`. Prétendre à une
réponse unique serait mentir — et l'ambiguïté est souvent le contenu à enseigner.

### 8.4 Persistance

`localStorage` : calibration de latence, progression, historique des scores.
Aucun back-end, aucun compte. L'application se déploie en statique.

### 8.5 Premier chantier

La tranche verticale est le **module 3, « Les durées »**.

Le module 1 est le bon point d'entrée pour apprendre, mais un mauvais premier
chantier : presque pas de notation, donc `notation` n'est pas éprouvé. Le module 3
force au contraire les cinq packages à exister pour de vrai.

**L'ordre de construction n'a pas à suivre l'ordre de lecture.**

---

## 9. Décisions en attente et backlog

### Non tranché

*Rien à ce jour.*

### Écrit à ce jour

Les neuf modules, leurs exercices et les interfaces de réponse. Ce qui reste
ouvert est listé ci-dessous.

### Backlog assumé

- **Système d'acquisition** — que veut dire « module acquis » ? Écarté de la v1 :
  pour un usage personnel, un journal de résultats suffit ; un seuil mal calibré
  n'apporterait que de la frustration.
- **Nombre définitif d'exercices par module** — 3 à 5 pour commencer.
- **Échauffement / répétition espacée** en début de session.

---

## 10. Journal des décisions

| Date | Décision |
|---|---|
| 2026-09-23 | Rythme musical · usage personnel · lecteur + exercices interactifs |
| 2026-09-23 | Frappe au clavier · contenu MDX versionné · persistance `localStorage` |
| 2026-09-23 | Cinq packages · fractions exactes · feedback décomposé en trois grandeurs |
| 2026-09-23 | Colonne vertébrale fusionnée : unité 0 + 8 modules |
| 2026-09-23 | Styles transversaux · hybride synthétisé + liens externes |
| 2026-09-23 | Hauteurs décoratives, exemples rythmiques purs conservés |
| 2026-09-23 | Laboratoire de transformations : outil de rédaction, pas d'écran |
| 2026-09-23 | Types d'exercices choisis par module selon la compétence installée |
| 2026-09-23 | Syllabes Kodály : tremplin du module 3, retirées ensuite |
| 2026-09-23 | Un lexique transversal, vérifié au build contre les références en avant |
| 2026-09-23 | Ajout du repérage d'erreur et de la composition guidée au domaine |
| 2026-09-23 | Les mots trop courants — temps, mesure, accent, silence — échappent au contrôle des références en avant |
| 2026-09-23 | La quantification rend des candidats, jamais une réponse |
| 2026-09-23 | Les neuf modules sont rédigés
