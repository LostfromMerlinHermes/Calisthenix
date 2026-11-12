# Calisthenix — guide du testeur

Merci d'essayer Calisthenix. L'objectif de ce test n'est pas de vérifier que « ça marche »,
mais de comprendre ce que tu vis : ce que tu comprends sans explication, ce qui te bloque,
ce qui te donne envie de revenir — ou pas.

Compte **10 minutes** pour un premier retour utile, **25 à 30 minutes** pour le parcours complet.

## 1. Ouvrir l'application

### Le plus simple — Windows

Double-clique sur **`Lancer-Calisthenix.cmd`**. Le navigateur s'ouvre sur l'application.
Garde la fenêtre noire ouverte pendant le test ; ferme-la à la fin.

### Sans installation

Double-clique sur **`index.html`**. L'application fonctionne entièrement hors ligne.
Utilise de préférence Chrome, Edge, Firefox ou Safari à jour.

### Sur téléphone (même Wi-Fi)

1. Sur l'ordinateur, double-clique sur **`Lancer-Testeur-Reseau.cmd`**.
2. Autorise Python dans le pare-feu Windows si une fenêtre s'affiche.
3. Ouvre l'adresse `http://…:8765/` affichée dans la fenêtre, sur le téléphone.
4. Garde la fenêtre ouverte pendant le test.

### Mac ou Linux

Dans le dossier de l'application :

```bash
python3 -m http.server 8765
```

puis ouvre `http://127.0.0.1:8765/`.

> **Important :** les données sont stockées dans le navigateur, pas dans un compte.
> Chaque navigateur a sa propre sauvegarde. Si tu testais déjà sur ce navigateur,
> pense à exporter ta sauvegarde depuis **Codex → Sauvegarde** avant de commencer,
> ou utilise un autre navigateur / une fenêtre de navigation privée.

## 2. Parcours conseillé

### Étape A — Découverte à froid (3 min)

1. Ouvre l'application et **ne lis pas ce guide plus loin** pendant une minute.
2. Note ce que tu comprends du but de l'écran, et ce que tu ferais en premier.
3. Clique sur une quête, puis sur **Lancer la séance**.

Ce qu'on cherche : la première impression, les hésitations, les mots que tu ne comprends pas.

### Étape B — Une vraie boucle de jeu (10 min)

1. Termine une série dans la séance guidée, puis une quête entière.
2. Regarde le QG évoluer : XP, anneau de niveau, registre, serment.
3. Ouvre **Arsenal**, cherche un exercice, ajoute-le à tes quêtes.
4. Ouvre **Codex** : attributs, sceaux, chapitres, records, réglages.
5. Lance la **chasse** et observe le scan, les frappes et le butin.

Ce qu'on cherche : est-ce que la boucle « geste → XP → progression → envie de revenir » tient debout ?

### Étape C — Cas limites et robustesse (7 min)

- Ajoute une quête personnalisée, puis supprime-la.
- Coupe le son, change la durée de repos, recharge la page : les réglages tiennent-ils ?
- Exporte ta sauvegarde depuis le Codex, puis réimporte-la.
- Ouvre la séance puis appuie sur **Échap**.
- Essaie au clavier uniquement : **Tab**, **Entrée**, **Espace**, **Échap**.
- Sur téléphone : vérifie que rien ne déborde horizontalement, que les boutons sont atteignables au pouce.

### Étape D — Recul (5 min)

- Reviendrais-tu demain ? Pourquoi ?
- Qu'est-ce qui te semble trop long, trop technique, ou inutile ?
- Quelle est la seule chose qui te ferait supprimer l'application ?

## 3. Consigner les retours

Ouvre **`retours.html`** et remplis le formulaire au fil du test. Il enregistre un brouillon
local et te permet d'exporter :

- un **Markdown** lisible, à envoyer tel quel ;
- un **JSON** si la personne qui collecte veut analyser les réponses ;
- un **résumé copié** dans le presse-papiers.

Si tu préfères écrire à la main, utilise **`RETOURS-TESTEUR.md`**.

### Ce qui est vraiment utile

| À noter | Pourquoi |
| --- | --- |
| Tes mots exacts, même maladroits | Ils révèlent les incompréhensions mieux qu'une reformulation. |
| Le moment précis où tu hésites | C'est souvent là que se cache le problème de conception. |
| Ce que tu attendais | Un bug est souvent un écart entre attente et comportement. |
| Une capture d'écran | Indispensable pour un problème visuel ou de mise en page. |
| Ta note et ta recommandation | Donne un repère comparable entre testeurs. |

### Gravité des bugs

- **Bloquant** : impossible de continuer ou de sauvegarder.
- **Majeur** : une fonction importante ne fait pas ce qu'elle annonce.
- **Mineur** : gêne ponctuelle, contournable.
- **Détail visuel** : alignement, contraste, micro-animation.

## 4. Confidentialité et limites connues

- Aucun compte, aucun serveur, aucune analytics : tout reste dans le navigateur.
- Effacer les données du navigateur efface la progression.
- L'export/import JSON est le seul moyen de déplacer une sauvegarde.
- Le test se fait en français ; l'application est monolingue pour l'instant.
- Certaines animations 3D peuvent être plus coûteuses sur un vieux téléphone.
  Signale-le si tu constates des ralentissements ou un échauffement.
- Les données de test ne sont pas précieuses : tu peux réinitialiser depuis
  **Codex → Réinitialiser** (deux clics de confirmation).

## 5. Renvoyer le retour

Envoie à la personne qui t'a confié le test :

1. le fichier Markdown ou JSON exporté depuis `retours.html` ;
2. tes captures d'écran éventuelles ;
3. en une phrase : **la première chose à corriger selon toi**.

Merci. Un retour honnête vaut mieux qu'un retour gentil.
