# Calisthenix — guide rapide

## 1. Récap : ce qui a été fait

**Refonte visuelle « Le Seuil »**
- Interface sombre : obsidienne, acier, céramique, lumière cyan / bleu électrique / violet.
- Plus d'emojis ni de dashboard SaaS : iconographie SVG maison, composition de scène.
- Typographies auto-hébergées : Saira Condensed (titres), Sora (texte), Azeret Mono (données).
- QG avec portail WebGL 1, repli Canvas 2D, animations respectant `prefers-reduced-motion`.
- Fenêtres de système : chaque module a son rail, son identifiant, son statut vivant et peut être replié ; la fenêtre touchée s'illumine et la sauvegarde clignote.

**Données fiables**
- Import invalide rejeté ; sauvegarde v1 migrée vers v3 ; export/import v3 identique.
- Clés de stockage conservées, icônes héritées converties, champ `avatar` retiré.
- Réinitialisation à double confirmation.

**Accessibilité et responsive**
- Piège de focus dans les overlays, Échap ramène au bouton d'origine.
- `aria-current` sur la navigation, libellés de formulaires complets.
- Contrastes corrigés, overlays testés à 320 px, QG testé de 1280 à 1920 px.

**Kit testeur**
- `TESTEUR.md` : guide de test.
- `retours.html` : formulaire de retour (brouillon local, exports Markdown/JSON).
- `RETOURS-TESTEUR.md` : version papier.
- `Lancer-Calisthenix.cmd` / `Lancer-Testeur-Reseau.cmd` : lanceurs Windows testés.
- `Calisthenix-testeur.zip` : archive prête à envoyer.

---

## 2. Essayer sur téléphone

### Avant de commencer
- Le téléphone et l'ordinateur doivent être sur **le même Wi-Fi**.
- L'ordinateur doit avoir **Python** installé (`py -3 --version` doit répondre).
- Sur le téléphone, utilise **Chrome** (Android) ou **Safari** (iPhone) à jour.

### Étape 1 — Lancer le serveur
1. Ouvre le dossier de l'application sur l'ordinateur.
2. Double-clique sur **`Lancer-Testeur-Reseau.cmd`**.
3. Une fenêtre noire s'ouvre et affiche une adresse du type :
   `http://192.168.x.x:8765/` ou `http://10.x.x.x:8765/`.
4. **Garde cette fenêtre ouverte** pendant tout le test.

### Étape 2 — Autoriser le pare-feu
- Si Windows demande « Autoriser Python sur les réseaux privés », clique **Autoriser**.
- Sans cela, le téléphone ne pourra pas joindre l'ordinateur.

### Étape 3 — Ouvrir sur le téléphone
1. Recopie **exactement** l'adresse affichée (celle avec `http://...:8765/`).
2. Ouvre-la dans le navigateur du téléphone.
3. L'application doit s'afficher. Si la page tourne sans fin :
   - vérifie le Wi-Fi,
   - vérifie le pare-feu,
   - relance le lanceur.

### Étape 4 — Tester
1. Ouvre une quête, puis **Lancer la séance** : termine une série, valide la quête.
2. Regarde le QG évoluer (XP, niveau, serment).
3. Ouvre **Arsenal**, ajoute un exercice, puis **Codex** (sceaux, réglages).
4. Lance la **chasse** et observe le scan et le butin.
5. Vérifie les cas limites : Échap, rotation de l'écran, rechargement de la page, export de sauvegarde.
6. Replie une fenêtre, puis **Tout replier** : les barres système doivent rester lisibles et les statuts se mettre à jour après une validation.

### Étape 5 — Noter les retours
- Ouvre `retours.html` sur le téléphone (même adresse, remplace `index.html` par `retours.html`), ou remplis `RETOURS-TESTEUR.md`.
- Exporte le Markdown/JSON et envoie-le à la personne qui t'a confié le test.

### Arrêter le test
- Reviens dans la fenêtre noire et appuie sur **Ctrl+C**.
- Si le téléphone ne se connecte plus, c'est normal : le serveur est arrêté.

---

## 3. Dépannage rapide

| Problème | Solution |
| --- | --- |
| La fenêtre se ferme aussitôt | Python absent ou erreur : relance et lis le message. |
| « Adresse réseau introuvable » | Tape `ipconfig` et utilise l'adresse IPv4 de ta connexion Wi-Fi. |
| Le téléphone ne charge pas | Même Wi-Fi ? Pare-feu autorisé ? Adresse correcte (port 8765) ? |
| La progression a disparu | Les données sont liées au navigateur : utilise toujours le même. |
| Le test doit repartir de zéro | Codex → Réinitialiser (deux clics). |
| L'écran 3D rame | Signale-le : la scène bascule normalement sur un rendu 2D. |
