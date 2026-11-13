# Calisthenix — Système des Porteurs

Application de suivi d'entraînement au poids du corps, transformée en système
d'évolution : quêtes quotidiennes, XP, chapitres, attributs, sceaux et bêtes
hebdomadaires à abattre. Interface sombre, cinématique et responsive, pensée
pour le téléphone comme pour l'ordinateur.

## L'Ordre des Porteurs

> « Poids. Souffle. Silence. »

Les Porteurs ne jurent pas de soulever plus lourd : ils jurent de **porter
juste**. Chaque jour, le corps est une page blanche que le geste vient remplir.
Mais l'inertie veille — la **Rouille** qui mange les articulations, le **Plomb**
posé sur les épaules, l'**Étau** qui serre les côtes, la **Gangue** des
habitudes mortes, le **Sédiment** des jours sans geste, la **Cendre** de la
fatigue déguisée en repos.

Le carnet — le **Codex** — garde la trace de ce que le corps a bâti. Rien ne
s'efface sans laisser de marque.

Le lore reste discret : il nomme les cartes, les chapitres et les récompenses,
sans jamais envahir l'entraînement.

## Lancer l'application

Double-clique simplement sur **`index.html`** : aucune installation, aucun compte,
aucune dépendance obligatoire. Tout fonctionne dans le navigateur.

> Astuce : pour une expérience optimale (et une sauvegarde locale fiable),
> tu peux aussi servir le dossier avec un petit serveur local :
> `py -m http.server 8000` puis ouvrir `http://localhost:8000`.

### Version autonome (un seul fichier)

`dist/index.html` contient toute l'application — CSS, JavaScript et polices
inclus. Il s'ouvre par double-clic et se dépose tel quel sur GitHub Pages,
sans dossiers annexes. Pour le reconstruire après une modification :

```
python outils/build-standalone.py
```

## Faire tester l'application

Le kit testeur est prévu pour être envoyé tel quel :

- **`TESTEUR.md`** — guide de test : lancement, parcours conseillé, ce qu'il faut observer, gravité des bugs.
- **`retours.html`** — formulaire de retour autonome (contexte, note par écran, bugs, priorités). Brouillon local, exports Markdown et JSON, résumé copiable.
- **`RETOURS-TESTEUR.md`** — même trame en version papier, à remplir à la main.
- **`Lancer-Calisthenix.cmd`** — serveur local + ouverture du navigateur (Windows).
- **`Lancer-Testeur-Reseau.cmd`** — même chose sur le réseau local, pour tester sur téléphone.
- **`Calisthenix-testeur.zip`** — archive prête à envoyer, sans le Product Lab.

Chaque testeur garde ses données dans son propre navigateur. Pour un test propre,
utiliser un autre navigateur ou exporter sa sauvegarde avant de commencer.

## Les quatre salles

| Entrée | Rôle |
| --- | --- |
| **QG** | Scène du quartier général : portail animé, sceau de niveau et chapitre, registre du jour, rituel, serment et épreuve de la semaine. |
| **Quêtes** | Programme de la semaine, ajout, validation et suppression de quêtes (nom, niveau, séries, répétitions, muscle), lancement de la séance guidée. |
| **Arsenal** | 21 exercices bodyweight répartis sur 3 niveaux, recherche insensible aux accents, ajout en un clic. |
| **Codex** | Attributs, sceaux, chapitres, trophées, statistiques et sauvegarde. |

## Mécaniques de jeu

### Quêtes et XP

| Niveau | XP de base | Exemples |
| --- | --- | --- |
| Débutant | 10 XP | Pompes inclinées, squats sur chaise, planche sur genoux |
| Intermédiaire | 17 XP | Pompes, tractions, dips, planche, mountain climbers |
| Pro | 28 XP | Pompes archer, tractions lestées, pistol squats, muscle-up |

Un bonus d'XP est ajouté selon le volume (séries × répétitions). Les quêtes se
réinitialisent chaque jour à minuit ; la série est maintenue dès qu'au moins une
quête est validée dans la journée. Valider un jour **toutes** les quêtes donne
un jour parfait.

### Le programme de la semaine

Sept journées, sept intentions : poussée, tirage, récupération, bas du corps,
force totale, conditionnement, repos. Chaque mouvement possède trois variantes
(débutant, intermédiaire, pro) et le programme choisit la sienne selon ton
niveau — il évolue donc avec toi, sans réglage.

Dans **Quêtes**, la carte *Programme de la semaine* met la journée en cours en
évidence. Le bouton **Charger** ajoute les exercices manquants à tes quêtes (sans
toucher aux existantes) ; la séance guidée les déroule ensuite comme n'importe
quelle quête. Quand aucune quête n'est active, le QG propose directement
**Charger le programme**.

### La séance guidée

Le bouton **Lancer la séance** (QG ou Quêtes) ouvre un mode plein écran qui
déroule les quêtes du jour, série par série :

- une série à la fois, avec le nombre de répétitions ou les secondes à tenir ;
- un **minuteur de repos** entre les séries, réglable en direct par pas de 15 s
  et par défaut dans le Codex ;
- validation de la quête à la dernière série, avec l'XP correspondant ;
- bilan de fin de séance : XP gagné, quêtes validées, séries et durée.

Une quête peut être passée sans être validée. Quitter en cours de route conserve
les quêtes déjà validées ; seules les séries terminées comptent. Le minuteur
reste utilisable au clavier (`Espace` pour valider, `Échap` pour quitter) et
respecte `prefers-reduced-motion`.

### Journal de séances et records

Chaque séance close avec au moins une série terminée est consignée dans le
**Codex** :

- les six dernières séances, avec date, durée, XP, quêtes validées et séries ;
- les totaux : séances, temps d'effort cumulé, meilleure séance, séries ;
- les **records** par exercice : meilleure série, meilleur volume (séries ×
  répétitions), nombre de validations et dernière date.

Valider une quête met à jour le record correspondant ; annuler une quête ne
retire jamais un record déjà acquis.

### La bête de la semaine

Une créature incarnant l'inertie apparaît chaque semaine. Ses points de vie
augmentent avec ton niveau ; chaque XP gagné dans la semaine lui inflige des
dégâts. Quand sa barre tombe à zéro, tu remportes un butin d'XP et un sceau.
La récompense n'est attribuée qu'une fois par semaine.

Le bouton **Engager le combat** ouvre la chasse plein écran : scan de la menace,
contact, puis — si la bête est déjà vaincue — trois frappes finales et l'écran de
butin. Si elle résiste encore, la chasse indique les dégâts restants et renvoie
vers les quêtes : seuls tes gestes de la semaine la blessent.

### Classes et rangs

À chaque rang correspond une classe de chasseur, affichée dans la barre latérale,
le HUD et l'écran de niveau :

| Rang | Classe |
| --- | --- |
| Recrue | E |
| Novice | D |
| Athlète | C |
| Guerrier | B |
| Maître | A |
| Légende | S |
| Mythique | SS |

### Le serment de la semaine

Trois promesses tournantes sont proposées chaque semaine :

- **La Constance** — douze quêtes dans la semaine ;
- **Les Trois Jours** — trois jours d'entraînement ;
- **Le Volume** — six cents répétitions ;
- **La Garde Haute** — deux quêtes de niveau pro.

Un seul serment peut être prêté par semaine. S'il est tenu avant dimanche, il
rapporte un bonus d'XP et un sceau. La récompense n'est versée qu'une fois.

### Attributs

Quatre attributs résument la progression, de 0 à 100, avec des paliers
(Apprenti → Confirmé → Aguerri → Maître → Sceau d'or) :

- **Force** — volume total de répétitions ;
- **Souffle** — série record et jours parfaits ;
- **Souplesse** — nombre de groupes musculaires travaillés ;
- **Discipline** — régularité des jours de pratique.

### Chapitres et rangs

Huit chapitres se débloquent aux niveaux 1, 3, 5, 7, 9, 11, 13 et 15. Chacun
porte un titre et une citation ; le chapitre en cours est affiché sur le QG et
dans le Codex.

Rangs : **Recrue → Novice → Athlète → Guerrier → Maître → Légende → Mythique**.
La courbe d'XP est `100 + (niveau - 1) × 50` par niveau.

### Sceaux

Huit sceaux se gravent dans le Codex : premier appui, jour parfait,
semaine de fer (7 jours), six muscles éveillés, bête brisée, serment tenu,
millier de répétitions et niveau 10.

## Direction visuelle — « Le Seuil »

- **Rituel technologique, pas tableau de bord.** Obsidienne, acier bruni,
  céramique et cire ; lumière cyan froide, bleu électrique et violet de seuil.
  Peu d'accents, jamais de décoration gratuite : chaque trait porte une
  information.
- Typographies auto-hébergées dans `assets/fonts/` : **Saira Condensed**
  (titres, capitales tracées), **Sora** (texte) et **Azeret Mono** (données,
  codes, mesures). Aucune requête vers un service de polices.
- **Iconographie maison** (`js/icons.js`) : portail, quêtes, arsenal, codex,
  sceaux, muscles, états. Aucun emoji dans l'interface ; les sceaux de niveau
  sont des numéraux gravés et les sigils de porteur sont générés à partir du nom.
- **QG cinématique** : portail animé en WebGL 1 (tore, membrane, poussière
  orbitale) avec repli Canvas 2D puis statique, sceau de niveau et anneau d'XP,
  chapitre en huit segments, brume et profondeur. Le dock réunit quatre
  panneaux : registre du jour, rituel, serment, épreuve de la semaine.
- **Vues éditoriales** : registre des quêtes avec cadran de progression,
  arsenal avec répartition par palier, codex avec bilan, attributs, sceaux,
  chapitres, séances, records, trophées et réglages.
- **Fenêtres de système** : chaque module des vues Quêtes, Arsenal et Codex est
  présenté comme une fenêtre d'exploitation — rail avec LEDs, identifiant
  `SYS/…`, nom, statut vivant, indicateur de sauvegarde, horloge et pied
  `SLOT · LOCAL`. Une barre système coiffe chaque vue. Les fenêtres se replient
  une par une ou toutes ensemble (mémorisé pour la session), et la fenêtre
  active est mise en évidence sans masquer les données réelles.
- Séquences : boot de session, séance guidée (cadran de repos cyan), scan de la
  bête (violet), frappes, brisure, butin, splash d'évolution avec sceau et
  attributs.
- **Performance** : DPR plafonné, rendu en pause quand l'onglet est masqué ou
  que le portail n'est pas visible. `prefers-reduced-motion` fige le portail et
  neutralise parallaxe, transitions et animations ; le boot est sauté.

## Sauvegarde et compatibilité

- Sauvegarde automatique dans `localStorage`, clé **`calisthenix.v1`**.
- Les anciennes sauvegardes v1 et v2 sont migrées silencieusement : nouveaux
  champs initialisés (serments, bête, sceaux, muscles, journal de séances,
  records), muscles des quêtes validées le jour même rétro-remplis, et un premier
  record ouvert pour chaque quête déjà validée.
- Les icônes héritées en emoji sont converties en noms d'icônes SVG au chargement
  (jamais affichées telles quelles) ; le champ `avatar`, jamais rendu, est retiré
  des sauvegardes. Aucun emoji ne subsiste dans les exports.
- Export / import JSON depuis le Codex ; les exports portent désormais la
  version 3. L'import accepte les fichiers v1, v2 et v3.
- Réinitialisation en deux clics, avec confirmation.
- Les réglages (sons, durée de repos) et le compteur de séances guidées sont
  conservés dans la sauvegarde ; les anciennes sauvegardes reçoivent des valeurs
  par défaut sans migration manuelle.

## Personnaliser

Tout est dans `app.js` :

- `ORDER`, `CHAPTERS`, `BOSSES`, `OATHS`, `SEALS` : lore et mécaniques.
- `LIBRARY` : exercices, niveaux, séries, répétitions, conseils.
- `PROGRAM` : programme hebdomadaire et variantes par palier (débutant, intermédiaire, pro).
- `ACHIEVEMENTS` : trophées et conditions de déblocage.
- `XP_BASE` / `calcXp()` : équilibrage de l'XP.
- `rankFor()` / `levelInfo()` / `rankClass()` : rangs, courbe de niveau et classes E→SS.
- `styles.css` : base historique (variables, composants, accessibilité).
- `system.css` : ancienne couche visuelle, conservée pour les overlays (chasse,
  séance, niveau) et les layouts hérités ; `css/core.css` la reprend et la
  surcharge.
- `css/core.css` : socle « Le Seuil » — jetons, typographies locales, coquille,
  navigation, vues registre / arsenal / codex, overlays, responsive.
- `css/hub.css` : scène du QG — portail, sceau de niveau, chapitre, dock,
  serment, adaptation mobile.
- `css/windows.css` : couche « fenêtres de système » — barre de vue, rails,
  statuts, repli, responsive et mouvement réduit.
- `js/icons.js` : icônes SVG, sigils, sceaux et glyphes de muscle.
- `js/gate.js` : portail WebGL 1 + repli Canvas 2D, boucle et cycle de vie.
- `js/hub.js` : montage unique du hub et mises à jour ciblées.
- `js/windows.js` : décoration des modules en fenêtres, statuts lus dans le DOM,
  repli persistant et signal de sauvegarde.
- `assets/fonts/` : WOFF2 auto-hébergés (Saira Condensed, Sora, Azeret Mono).

## Product Lab — piloter l'app jusqu'à 50 000 €

Le dossier **`roadmap/`** contient un second outil autonome : **150 décisions
produit cochables**, réparties en 15 chantiers (stratégie, contenu, programmes,
gamification, social, IA, design, technique, mobile, comptes, monétisation,
légal, acquisition, analytics, valorisation).

Ouvre **`roadmap/index.html`** (ou `http://localhost:8000/roadmap/`) pour :

- cocher les décisions faites et suivre le **socle critique** (56 actions) ;
- filtrer par chantier, priorité, effort ou état, et rechercher un mot-clé ;
- utiliser les presets **Socle critique** et **Quick wins** ;
- ajouter une note à chaque décision ;
- visualiser un **score de valeur indicatif** sur 50 000 € ;
- exporter le plan en **Markdown**, sauvegarder/importer en **JSON** ;
- retrouver la progression automatiquement dans le navigateur.

Les questions sont dans `roadmap/data/questions.js` et les chantiers dans
`roadmap/data/categories.js`. Le score est une heuristique de pilotage
(55 % socle + 30 % progression + 15 % chantiers amorcés), pas une garantie
de prix de vente.

## Structure

```
index.html               Structure de l'application
css/core.css             Socle visuel « Le Seuil » : jetons, vues, overlays
css/hub.css              Scène du QG : portail, sceau, chapitre, dock
css/windows.css          Fenêtres de système : rails, statuts, repli
js/icons.js              Iconographie SVG, sigils, sceaux
js/gate.js               Portail WebGL 1 + repli Canvas 2D
js/hub.js                Montage et mises à jour ciblées du QG
js/windows.js            Décoration en fenêtres et statuts dynamiques
assets/fonts/            Polices WOFF2 auto-hébergées
system.css               Couche visuelle v2 (compatibilité)
styles.css               Base historique : composants et accessibilité
app.js                   Lore, logique de jeu, séance, rendu, sauvegarde, combat
retours.html             Formulaire de retour testeur (autonome)
TESTEUR.md               Guide de test
GUIDE.md                 Guide rapide : récap + test sur téléphone
RETOURS-TESTEUR.md       Trame de retour à remplir à la main
Lancer-Calisthenix.cmd   Lancement local Windows
Lancer-Testeur-Reseau.cmd Lancement réseau pour tester sur téléphone
outils/trouver-ip.py     Détection de l'adresse réseau locale
outils/build-standalone.py  Génère dist/index.html (version un seul fichier)
dist/index.html          Version autonome : CSS, JS et polices intégrés
roadmap/index.html       Product Lab : 150 décisions produit
roadmap/lab.css          Design du Product Lab
roadmap/lab.js           Filtres, progression, notes, exports
roadmap/data/            Catégories et questions du plan
```

Les données restent sur ton appareil. Pense à exporter régulièrement une
sauvegarde depuis le **Codex → Sauvegarde**.
