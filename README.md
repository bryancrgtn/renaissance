# Site vitrine — Salon de coiffure Renaissance

Site statique d'une seule page (HTML5, CSS3, JavaScript) pour le salon de coiffure Renaissance, 52 rue Roger Salengro à Feuquières-en-Vimeu. Pas de back-end, pas de base de données, pas de build, pas de cookies, **aucun service tiers** : polices et bibliothèque de défilement sont hébergées dans le dossier.

## Direction artistique

- **Palette** : noir bordeaux, ivoire, or champagne (variables CSS en tête de `css/style.css`).
- **Typographie** : Cormorant Garamond (titres, italiques) et Jost (texte), auto-hébergées dans `fonts/` (licence SIL OFL).
- **Détails** : cadres en arche avec filet doré, sceau rotatif, ruban défilant, grain léger, numérotation des sections.
- **Animations** : défilement fluide (Lenis), titre révélé lettre par lettre, images dévoilées au défilement, parallaxe douce, filets qui se dessinent, en-tête qui se masque en descendant, barre de progression, menu plein écran sur mobile, visionneuse photo avec flèches, clavier et glissement.
- **Accessibilité** : `prefers-reduced-motion` respecté (aucune animation, défilement natif), navigation au clavier, focus visible, site entièrement lisible sans JavaScript.

## Structure

```
salon-renaissance/
├── index.html              Page unique (accueil, salon, tarifs, réalisations, horaires et contact)
├── mentions-legales.html   Mentions légales (champs à compléter signalés)
├── css/style.css           Styles
├── js/main.js              Menu, animations, parallaxe, statut ouvert/fermé, visionneuse
├── js/vendor/lenis.min.js  Défilement fluide (Lenis 1.3, licence MIT)
├── fonts/                  Cormorant Garamond et Jost (woff2)
├── images/                 Photos en WebP (480, 800 et 1200 px) + image de partage
├── favicon.svg
├── sitemap.xml
├── robots.txt
└── README.md
```

Les photos d'origine n'ont pas été modifiées : seules des copies redimensionnées sont dans `images/`.

## Ouvrir le site en local

Pour un rendu fidèle, lancez un petit serveur depuis le dossier :

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

(Un double-clic sur `index.html` fonctionne aussi ; le navigateur peut simplement signaler dans sa console que le préchargement des polices est bloqué en `file://`, sans effet visible.)

## Déployer

Envoyez le contenu du dossier à la racine de n'importe quel hébergement statique (hébergeur classique en FTP, Netlify, Cloudflare Pages, GitHub Pages, etc.).

Avant la mise en ligne, recherchez `À COMPLÉTER` dans les fichiers et remplacez :

1. `https://www.votre-domaine.fr` par l'adresse réelle du site, dans `index.html` (canonical, Open Graph, données structurées), `mentions-legales.html`, `sitemap.xml` et `robots.txt` ;
2. les informations manquantes de `mentions-legales.html` (e-mail, forme juridique, SIRET, responsable de publication, hébergeur) ;
3. l'adresse e-mail dans `index.html` (bloc commenté « À COMPLÉTER : adresse e-mail »), à décommenter une fois renseignée.

## Modifier les contenus courants

- **Tarifs** : section `#tarifs` de `index.html`.
- **Horaires** : tableau `#horaires` dans `index.html`, **et** l'objet `HORAIRES` dans `js/main.js` (minutes depuis minuit) **et** `openingHoursSpecification` dans le JSON-LD de `index.html`.
- **Photos** : ajoutez les versions web dans `images/`, puis copiez un bloc `<li>` de la galerie.
- **Vitesse du défilement fluide** : paramètre `lerp` dans `js/main.js` (plus petit = plus doux).
