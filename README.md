# EventHub — Gestionnaire d'Événements

Application web fullstack de gestion d'événements avec authentification JWT, système de rôles et documentation API intégrée.

## Technologies

| Couche | Technologie | Version |
|--------|-------------|---------|
| Backend | Django + Django REST Framework | 6.0.4 / 3.17.1 |
| Authentification | Simple JWT | 5.5.1 |
| Filtrage | django-filter | 25.2 |
| Documentation API | drf-spectacular (Swagger / ReDoc) | 0.29.0 |
| Base de données | SQLite3 | — |
| Frontend | React + Vite | 19.2.4 / 8.0.4 |
| Routing | React Router DOM | 7.14.0 |
| HTTP Client | Axios | 1.14.0 |

---

## Structure du projet

```
Projet_Web/
├── backend/
│   ├── accounts/          # Authentification & gestion utilisateurs
│   ├── events/            # Événements, participants, inscriptions
│   ├── eventhub/          # Configuration Django (settings, urls, wsgi)
│   ├── requirements.txt
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── api/           # Configuration Axios
│   │   ├── pages/         # Login, Register, Dashboard
│   │   └── App.jsx        # Routeur principal
│   ├── package.json
│   └── vite.config.js
├── .env
└── README.md
```

---

## Prérequis

- Python 3.10+
- Node.js 18+
- npm 9+

---

## Installation

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows : venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed          # Données de démonstration (optionnel)
python manage.py runserver
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

L'application est disponible sur :
- Frontend : http://localhost:5173
- API : http://localhost:8000/api/
- Swagger UI : http://localhost:8000/api/docs/
- ReDoc : http://localhost:8000/api/redoc/

---

## Variables d'environnement

Créer un fichier `.env` à la racine du projet :

```env
SECRET_KEY=votre-clé-secrète-django
DEBUG=True
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

> **Production** : passer `DEBUG=False` et définir une `SECRET_KEY` sécurisée.

---

## Fonctionnalités

### Authentification
- Inscription et connexion avec tokens JWT (access 1h / refresh 7 jours)
- Rotation automatique des refresh tokens avec blacklist à la déconnexion
- Changement de mot de passe

### Système de rôles
| Rôle | Permissions |
|------|-------------|
| `admin` | Accès complet (y compris liste des utilisateurs) |
| `editor` | Créer, modifier, supprimer des événements |
| `viewer` | Lecture seule |

### Gestion des événements
- CRUD complet avec statuts : `planned`, `ongoing`, `completed`, `cancelled`
- Filtrage par date (`date_from`, `date_to`) et statut
- Recherche par titre et lieu
- Pagination (20 éléments par page)
- Compteur de participants inscrits

### Gestion des participants
- CRUD complet avec email unique
- Historique des inscriptions par participant

### Inscriptions
- Relation Many-to-Many custom (Événement ↔ Participant)
- Contrainte d'unicité (pas de doublon)
- Validation : impossible de s'inscrire à un événement annulé
- Inscription / désinscription en self-service pour les viewers depuis le dashboard
- Affichage des inscrits avec nom, prénom, email et date d'inscription (admin/editor)
- Suppression d'un inscrit depuis la modale (admin uniquement)

### Dashboard
- Statistiques globales : nombre d'événements, participants, inscriptions
- Répartition par statut
- Liste des 5 prochains événements

---

## Endpoints API

### Authentification (`/api/auth/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/register/` | Créer un compte |
| POST | `/login/` | Connexion (retourne les tokens) |
| POST | `/token/refresh/` | Rafraîchir le token d'accès |
| POST | `/logout/` | Déconnexion (blacklist du refresh token) |
| GET | `/me/` | Profil de l'utilisateur connecté |
| POST | `/change-password/` | Changer le mot de passe |
| GET | `/users/` | Liste des utilisateurs (admin uniquement) |

### Événements, Participants & Inscriptions (`/api/`)
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET/POST | `/events/` | Liste / Créer un événement |
| GET/PUT/DELETE | `/events/<id>/` | Détail / Modifier / Supprimer |
| POST | `/events/<id>/register` | S'inscrire à un événement (viewer) |
| DELETE | `/events/<id>/unregister` | Se désinscrire d'un événement (viewer) |
| GET | `/events/me/registrations` | Mes inscriptions (viewer) |
| GET/POST | `/participants/` | Liste / Créer un participant |
| GET/PUT/DELETE | `/participants/<id>/` | Détail / Modifier / Supprimer |
| GET/POST | `/registrations/` | Liste / Créer une inscription |
| GET/DELETE | `/registrations/<id>/` | Détail / Supprimer |
| GET | `/dashboard/` | Statistiques globales |

---

## Tests

```bash
cd backend
python manage.py test
```

Les tests couvrent :
- Authentification et gestion des tokens JWT
- Permissions par rôle (admin, editor, viewer)
- CRUD complet des événements, participants et inscriptions
- Validations métier (doublons, événements annulés)

---

## Scripts disponibles

### Backend
```bash
python manage.py runserver       # Serveur de développement
python manage.py migrate         # Appliquer les migrations
python manage.py seed            # Peupler la base avec des données de démo
python manage.py test            # Lancer les tests
```

### Frontend
```bash
npm run dev        # Serveur de développement (HMR)
npm run build      # Build de production
npm run preview    # Prévisualiser le build
npm run lint       # Linter ESLint
```

---

## Données de démonstration

La commande `python manage.py seed` crée :
- 2 utilisateurs (`editor` et `viewer`)
- 5 événements avec statuts variés
- 5 participants avec inscriptions aléatoires

---

## Interface d'administration Django

Disponible sur http://localhost:8000/admin/ — tous les modèles sont enregistrés avec des filtres et des recherches configurés.

---

## Déploiement en production

### Architecture déployée

```
Utilisateur
    │
    └── Netlify (Frontend React)
              │
              └── Railway (Backend Node.js/Express + SQLite)
```

| Service | URL |
|---------|-----|
| Frontend | https://ticket-hub-m1.netlify.app |
| Backend API | https://eventhub-backend-production-eb7d.up.railway.app/api/ |

---

### Backend — Railway

Le backend Node.js est déployé sur [Railway](https://railway.app). La base SQLite est réinitialisée à chaque redéploiement — les utilisateurs de base sont recréés automatiquement au démarrage via `seed.js`.

**Déployer via Railway CLI :**

```bash
npm install -g @railway/cli
railway login
cd node-backend
railway link          # Lier au projet Railway existant
railway up --service eventhub-backend
```

**Variables d'environnement à définir sur Railway :**

| Variable | Description |
|----------|-------------|
| `DB_PATH` | `/data/database.sqlite` |
| `JWT_SECRET` | Clé secrète JWT (longue et aléatoire) |
| `PORT` | `3000` |

**Volume persistant :**
- Mount path : `/data`
- Sans volume, la base de données est perdue à chaque redéploiement.

---

### Frontend — Netlify

Le frontend React est déployé sur [Netlify](https://netlify.com) depuis un fork du dépôt GitHub.

**Configuration Netlify :**

| Paramètre | Valeur |
|-----------|--------|
| Base directory | `frontend` |
| Build command | `npm run build` |
| Publish directory | `dist` |

**Variable d'environnement à définir sur Netlify :**

| Variable | Valeur |
|----------|--------|
| `VITE_API_URL` | `https://eventhub-backend-production-eb7d.up.railway.app/api/` |

> La variable doit être définie **avant** le build — Vite l'intègre au moment de la compilation.

Le fichier `frontend/netlify.toml` gère la redirection SPA (React Router) automatiquement.

---

### Comptes disponibles en production

| Username | Password | Rôle |
|----------|----------|------|
| `admin` | `Admin1234!` | admin |
| `editor` | `Admin1234!` | editor |
| `viewer` | `Admin1234!` | viewer |

> Ces comptes sont créés automatiquement au premier démarrage du serveur si la base de données est vide (voir `node-backend/src/seed.js`).

---

## Changer de backend (Django ↔ Node.js)

Le frontend peut fonctionner avec les deux backends. Le seul fichier à modifier est `frontend/src/api/axios.js`, ligne `baseURL` :

**Connecter au backend Django :**
```js
baseURL: 'http://127.0.0.1:8000/api/',
```

**Connecter au backend Node.js :**
```js
baseURL: 'http://localhost:3000/api/',
```

Pour lancer le backend Node.js :
```bash
cd node-backend
npm install
npm run dev
```
