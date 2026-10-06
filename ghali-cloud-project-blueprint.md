# Blueprint global du projet Ghali Cloud

## 1. Objectif du projet

Le site doit présenter les services de **Ghali Cloud** avec :

- Une interface inspirée du design Vercel
- Trois langues : anglais, français et arabe
- Une mise en page RTL automatique pour l’arabe
- Des composants HTML chargés dynamiquement
- Un Header sticky avec effet de flou
- Des boutons d’action cohérents
- Des compteurs animés
- Un sélecteur de langue flottant
- Une page dédiée aux fonctionnalités non encore disponibles
- Une architecture simple à maintenir et déployer

---

## 2. Architecture finale recommandée

```text
ghali-cloud/
├── index.html
├── under-construction.html
├── README.md
├── VERCEL.DESIGN.md
│
├── assets/
│   ├── css/
│   │   └── app.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   └── floating-language.js
│   │
│   ├── images/
│   │   ├── logo.svg
│   │   └── favicon.svg
│   │
│   └── documents/
│       ├── terms.pdf
│       └── privacy.pdf
│
└── partials/
    ├── en/
    │   ├── header.html
    │   ├── hero.html
    │   ├── solutions.html
    │   ├── approach.html
    │   ├── security.html
    │   ├── contact.html
    │   └── footer.html
    │
    ├── fr/
    │   ├── header.html
    │   ├── hero.html
    │   ├── solutions.html
    │   ├── approach.html
    │   ├── security.html
    │   ├── contact.html
    │   └── footer.html
    │
    └── ar/
        ├── header.html
        ├── hero.html
        ├── solutions.html
        ├── approach.html
        ├── security.html
        ├── contact.html
        └── footer.html
```

### Principe essentiel

Chaque langue utilise exactement les mêmes composants et les mêmes classes CSS.

Seul le contenu change :

```text
partials/en/hero.html
partials/fr/hero.html
partials/ar/hero.html
```

Il ne faut pas créer de CSS différent par langue, sauf pour les adaptations RTL intégrées à `app.css`.

---

## 3. Responsabilité de chaque fichier

### `index.html`

Le fichier principal contient uniquement :

- Les métadonnées
- Les polices
- La feuille de style
- Les scripts
- Les points de montage des composants

Structure recommandée :

```html
<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Ghali Cloud builds practical AI agents and intelligent automation systems.">
    <title>Ghali Cloud</title>

    <link rel="stylesheet" href="assets/css/app.css">
    <script src="https://unpkg.com/htmx.org@2.0.4" defer></script>
    <script src="https://unpkg.com/lucide@0.468.0/dist/umd/lucide.min.js" defer></script>
    <script src="assets/js/app.js" defer></script>
    <script src="assets/js/floating-language.js" defer></script>
</head>
<body>
    <a class="skip-link" href="#main-content">Skip to main content</a>

    <div data-component-shell="header"></div>

    <main id="main-content">
        <div data-component-shell="hero"></div>
        <div data-component-shell="solutions"></div>
        <div data-component-shell="approach"></div>
        <div data-component-shell="security"></div>
        <div data-component-shell="contact"></div>
    </main>

    <div data-component-shell="footer"></div>

    <noscript>
        <p class="noscript-message">JavaScript is required to load this website.</p>
    </noscript>
</body>
</html>
```

---

## 4. Carte des composants

### Header

Le Header contient :

```text
Logo
Navigation principale
Bouton Discuss
CTA Start a project
Bouton menu mobile
```

Le sélecteur de langue ne doit plus être dans le Header.

#### Structure

```html
<header class="site-header">
    <nav class="nav-shell" aria-label="Main navigation">
        <a class="brand" href="#home">
            <img src="assets/images/logo.svg" alt="">
            <span>Ghali Cloud</span>
        </a>

        <ul class="desktop-nav">
            <li><a href="#solutions">Solutions</a></li>
            <li><a href="#approach">Approach</a></li>
            <li><a href="#security">Security</a></li>
            <li><a href="#contact">Contact</a></li>
        </ul>

        <div class="nav-actions">
            <a class="discuss-button nav-login" href="under-construction.html">
                <i data-lucide="message-circle" aria-hidden="true"></i>
                <span>Discuss</span>
            </a>

            <a class="button nav-cta" href="#contact">Start a project</a>

            <button class="menu-button" type="button" aria-expanded="false" aria-controls="mobile-navigation" data-menu-button>
                <i data-lucide="menu" aria-hidden="true"></i>
            </button>
        </div>
    </nav>

    <nav id="mobile-navigation" class="mobile-nav" hidden data-mobile-nav>
        <!-- Navigation mobile -->
    </nav>
</header>
```

#### Règle sticky

Le point de montage contrôle la position sticky :

```css
[data-component-shell="header"] {
    position: sticky;
    top: 0;
    z-index: 1000;
}
```

Le Header chargé dynamiquement reste relatif :

```css
.site-header {
    position: relative;
}
```

---

## 5. Hero

Le Hero contient :

- Badge
- Titre principal
- Description
- CTA principal
- CTA secondaire
- Liste de bénéfices
- Illustration workflow
- Compteurs

### Structure fonctionnelle

```text
Hero
├── Texte
│   ├── Badge
│   ├── H1
│   ├── Description
│   ├── Actions
│   └── Trust list
│
├── Illustration
│   ├── Input
│   ├── Agent
│   └── Action
│
└── Metrics
    ├── Satisfaction
    ├── Agents deployed
    ├── Availability
    └── Digital assistance
```

### Compteurs

Chaque valeur doit utiliser cette structure :

```html
<strong class="metric-value" data-counter data-target="98" data-decimals="0" data-suffix="%">0%</strong>
```

Le conteneur utilise :

```html
<div data-counter-section>
    <!-- Compteurs -->
</div>
```

---

## 6. Solutions

La section Solutions présente quatre domaines :

1. OCR et intelligence documentaire
2. Systèmes RAG
3. Assistants IA
4. Automatisation des processus

Structure :

```html
<section class="section section-white" id="solutions">
    <div class="container">
        <header class="section-header">
            <span class="eyebrow">Solutions</span>
            <h2>AI systems designed around your business.</h2>
            <p>Description de la section.</p>
        </header>

        <div class="feature-grid">
            <article class="feature-card">
                <!-- Contenu -->
            </article>
        </div>
    </div>
</section>
```

---

## 7. Approach

La section Approach présente quatre étapes :

```text
01 Understand
02 Design
03 Deploy
04 Improve
```

La colonne introductive peut rester sticky sur ordinateur :

```css
.sticky-copy {
    position: sticky;
    top: calc(var(--header-height) + 48px);
}
```

Sur mobile :

```css
.sticky-copy {
    position: static;
}
```

---

## 8. Security

La section Security utilise un fond noir et quatre domaines :

- Data security
- Privacy
- Supervision
- Performance

```html
<section class="section section-dark" id="security">
    <div class="container security-grid">
        <div class="security-copy">
            <!-- Introduction -->
        </div>

        <div class="security-list">
            <!-- Cartes -->
        </div>
    </div>
</section>
```

---

## 9. Contact

La section Contact doit comporter :

- Une question claire
- Une courte description
- Un CTA principal
- Une adresse e-mail

```html
<section class="section section-white" id="contact">
    <div class="container contact-card">
        <div>
            <span class="eyebrow">Start a project</span>
            <h2>What could an AI agent change in your operation?</h2>
        </div>

        <div class="contact-actions">
            <a class="button button-primary" href="mailto:contact@ghali.cloud">Discuss your project</a>
        </div>
    </div>
</section>
```

---

## 10. Footer

Le Footer possède quatre colonnes :

```text
Brand | Solutions | Company | Legal
```

Le sélecteur de langue flottant doit être placé après `.footer-bottom`, mais avant `</footer>`.

### Structure correcte

```html
<footer class="site-footer">
    <div class="container footer-grid">
        <div class="footer-brand">
            <!-- Logo et description -->
        </div>

        <nav class="footer-navigation">
            <!-- Solutions -->
        </nav>

        <nav class="footer-navigation">
            <!-- Company -->
        </nav>

        <nav class="footer-navigation">
            <!-- Legal -->
        </nav>
    </div>

    <div class="container footer-bottom">
        <!-- Copyright et retour en haut -->
    </div>

    <div class="floating-language" data-language-menu>
        <!-- Contrôle de langue -->
    </div>
</footer>
```

### Important

Toujours utiliser des ancres complètes :

```html
<a href="#solutions">OCR</a>
```

Ne jamais laisser du texte comme :

```text
#solutionsOCR
```

---

## 11. Sélecteur de langue flottant

```html
<div class="floating-language" data-language-menu>
    <button class="floating-language-button" type="button" aria-expanded="false" aria-controls="language-options-fr" data-language-menu-button>
        <i data-lucide="languages" aria-hidden="true"></i>
        <span class="sr-only">Choisir la langue</span>
    </button>

    <div id="language-options-fr" class="floating-language-options" role="menu" hidden data-language-options>
        <button class="language-option" type="button" data-language-choice="en">
            <span class="language-code">EN</span>
            <span>English</span>
        </button>

        <button class="language-option is-active" type="button" data-language-choice="fr" aria-current="true">
            <span class="language-code">FR</span>
            <span>Français</span>
        </button>

        <button class="language-option" type="button" data-language-choice="ar" lang="ar" dir="rtl">
            <span class="language-code">AR</span>
            <span>العربية</span>
        </button>
    </div>
</div>
```

### Comportements attendus

- Clic sur l’icône : ouverture
- Clic extérieur : fermeture
- Échap : fermeture
- Flèche haut/bas : navigation
- Entrée : sélection
- Langue sauvegardée dans `localStorage`
- URL synchronisée avec `?lang=`
- Arabe active automatiquement `dir="rtl"`

---

## 12. Architecture JavaScript

### `app.js`

Responsabilités :

```text
Configuration
Gestion de langue
Chargement des composants
Lucide
Menu mobile
Header sticky
Compteurs
Année dynamique
Initialisation globale
```

### `floating-language.js`

Responsabilités :

```text
Ouverture du menu
Fermeture du menu
Navigation clavier
Sélection de langue
Synchronisation de la langue active
Fallback avec ?lang=
```

### Ordre de chargement

```html
<script src="assets/js/app.js" defer></script>
<script src="assets/js/floating-language.js" defer></script>
```

---

## 13. Architecture CSS

Le projet doit utiliser un seul fichier principal :

```text
assets/css/app.css
```

Ne pas charger simultanément :

```text
app.css
discuss-button.css
footer-fix.css
language-selector.css
```

Cela provoquerait de nouveaux conflits de cascade.

### Organisation recommandée de `app.css`

```text
01 Design tokens
02 Reset
03 Typography
04 Layout
05 Accessibility
06 Buttons
07 Header
08 Mobile navigation
09 Discuss button
10 Hero
11 Workflow
12 Metrics
13 Feature cards
14 Approach
15 Security
16 Contact
17 Footer
18 Floating language selector
19 HTMX loading states
20 RTL
21 Responsive
22 Reduced motion
23 Browser fallbacks
```

---

## 14. Règles du bouton Discuter

### État normal

```text
Fond transparent
Segment jaune circulaire animé
Texte foncé
Icône visible
```

### Hover et focus

```text
Animation arrêtée
Bordure jaune complète de 3px
Fond transparent
Légère ombre
```

### Mobile

Le bouton devient pleine largeur dans le menu mobile.

---

## 15. Page Under Construction

Le fichier :

```text
under-construction.html
```

doit être autonome.

Fonctionnalités :

- EN, FR et AR
- Support RTL
- Retour à l’accueil
- Contact e-mail
- Barre de progression
- `noindex`
- Responsive
- Reduced motion

### Utilisation

```html
<a href="under-construction.html?lang=fr">Fonctionnalité à venir</a>
```

Exemples :

```text
under-construction.html?lang=en
under-construction.html?lang=fr
under-construction.html?lang=ar
```

---

## 16. Routage des pages non disponibles

Créer une liste centrale des routes non publiées :

```text
Blog
Case studies
Customer portal
Documentation
Careers
Resources
```

Tous les liens concernés doivent pointer vers :

```html
<a href="under-construction.html">Fonctionnalité à venir</a>
```

Avec langue :

```html
<a href="under-construction.html?lang=fr">Fonctionnalité à venir</a>
```

La langue peut également être obtenue automatiquement depuis `localStorage`.

---

## 17. Flux de chargement du site

```text
Utilisateur ouvre index.html
        │
        ▼
Détection de ?lang=
        │
        ├── Langue valide dans URL
        ├── Sinon localStorage
        └── Sinon anglais
        │
        ▼
Mise à jour de <html lang dir>
        │
        ▼
Chargement parallèle des composants
        │
        ├── Header
        ├── Hero
        ├── Solutions
        ├── Approach
        ├── Security
        ├── Contact
        └── Footer
        │
        ▼
Initialisation
        │
        ├── Lucide
        ├── Menu mobile
        ├── Sticky Header
        ├── Compteurs
        ├── Année
        └── Langue flottante
```

---

## 18. Responsive blueprint

### Desktop supérieur à 1024 px

```text
Navigation complète
Hero deux colonnes
Solutions deux colonnes
Approach deux colonnes
Security deux colonnes
Footer quatre colonnes
```

### Tablette entre 768 et 1024 px

```text
Espacement réduit
Certaines grilles maintenues
Footer deux colonnes
```

### Mobile inférieur à 768 px

```text
Navigation cachée
Bouton hamburger
Toutes les sections sur une colonne
Metrics sur deux colonnes
Footer sur deux colonnes
Langue flottante à 16px du bord
```

### Petit mobile inférieur à 640 px

```text
H1 et H2 à 32px
Actions pleine largeur
Footer sur une colonne
Metrics sur deux colonnes
Contact vertical
```

---

## 19. Accessibilité

Le projet doit respecter ces points :

- Un seul `h1`
- Ordre logique des titres
- Liens réels pour la navigation
- Boutons réels pour les actions
- Minimum `44px` pour les zones interactives
- Focus visible
- Menu mobile avec `aria-expanded`
- Menu langue avec `aria-current`
- `Escape` ferme les menus
- Skip link vers le contenu
- Icônes décoratives avec `aria-hidden="true"`
- `lang="ar"` et `dir="rtl"` pour l’arabe
- Reduced motion
- Barre de progression native sur la page en construction

---

## 20. SEO et métadonnées

Chaque page publique doit inclure :

```html
<meta name="description" content="Description spécifique de la page.">
```

Ajouter également :

```html
<link rel="canonical" href="https://ghali.cloud/">
```

Pour la page en construction :

```html
<meta name="robots" content="noindex, follow">
```

---

## 21. Tests obligatoires

### Validation HTML

```bash
npx html-validate index.html
npx html-validate partials/*/*.html
npx html-validate under-construction.html
```

### Validation CSS

```bash
npx csstree-validator assets/css/app.css
```

### Validation JavaScript

```bash
node --check assets/js/app.js
node --check assets/js/floating-language.js
```

### Test serveur

```bash
npx serve .
```

Tester :

```text
/?lang=en
/?lang=fr
/?lang=ar
/under-construction.html?lang=en
/under-construction.html?lang=fr
/under-construction.html?lang=ar
```

---

## 22. Checklist fonctionnelle

### Header

- [ ] Logo correct
- [ ] Header sticky
- [ ] Flou après défilement
- [ ] Navigation desktop
- [ ] Menu mobile
- [ ] Bouton Discuter
- [ ] CTA jaune
- [ ] Aucun sélecteur de langue dans le Header

### Contenu

- [ ] Hero chargé
- [ ] Compteurs animés
- [ ] Solutions chargées
- [ ] Approach chargé
- [ ] Security chargé
- [ ] Contact chargé

### Footer

- [ ] Aucun texte `#home` visible
- [ ] Aucun texte `#solutionsOCR` visible
- [ ] Quatre colonnes valides
- [ ] Liens légaux valides
- [ ] Retour en haut valide
- [ ] Icône de langue flottante visible

### Multilingue

- [ ] EN fonctionne
- [ ] FR fonctionne
- [ ] AR fonctionne
- [ ] RTL fonctionne
- [ ] Langue persiste
- [ ] URL synchronisée

### Responsive

- [ ] Desktop
- [ ] Tablette
- [ ] Mobile
- [ ] Petit mobile

---

## 23. Déploiement

### Fichiers à déployer

```text
index.html
under-construction.html
assets/
partials/
```

### Ne pas déployer

```text
node_modules/
build scripts temporaires
fichiers ZIP
captures d’écran
anciens CSS
anciens Headers
anciens Footers
```

### Serveur

Les fichiers HTMX doivent être servis par HTTP.

Ne pas ouvrir :

```text
file:///index.html
```

Utiliser :

```bash
npx serve .
```

ou le serveur du fournisseur d’hébergement.

---

## 24. Règles de maintenance

1. Une modification structurelle doit être appliquée aux trois langues.
2. Les trois composants doivent conserver les mêmes classes CSS.
3. Aucun style inline dans les partials.
4. Un seul fichier `app.css`.
5. Aucun lien mal formé.
6. Toujours valider HTML, CSS et JavaScript avant déploiement.
7. Tout nouveau composant doit être ajouté à la liste `components` dans `app.js`.
8. Toute page indisponible doit pointer vers `under-construction.html`.
9. Toute nouvelle langue doit définir :
   - Le dossier de partials
   - `lang`
   - `dir`
   - Les labels d’accessibilité
   - Les traductions de navigation

---

## Recommandation finale de référence

Le projet doit conserver seulement cette chaîne principale :

```text
index.html
    ↓
app.css
    ↓
app.js
    ↓
floating-language.js
    ↓
partials/{lang}/{component}.html
```

Cela élimine les conflits créés par les anciens fichiers séparés et fournit une base stable pour poursuivre le développement du site.
