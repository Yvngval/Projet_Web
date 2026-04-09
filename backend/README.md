# EventHub — Backend API

API REST pour la gestion d'événements, de participants et d'inscriptions. Développée avec Django et Django REST Framework.

---

## Stack technique

| Technologie | Version | Rôle |
|---|---|---|
| Django | 6.0.4 | Framework web |
| Django REST Framework | 3.17.1 | API REST |
| Simple JWT | 5.5.1 | Authentification par token |
| django-filter | 25.2 | Filtrage des listes |
| drf-spectacular | 0.29.0 | Documentation OpenAPI |
| django-cors-headers | 4.9.0 | Gestion du CORS |
| SQLite | — | Base de données (dev) |

---

## Installation

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows : venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

L'API est disponible sur `http://localhost:8000/api/`.

---

## Structure du projet

```
backend/
├── eventhub/               # Configuration principale
│   ├── settings.py
│   ├── urls.py
│   └── exception_handler.py
├── accounts/               # Authentification et utilisateurs
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   ├── permissions.py
│   └── urls.py
├── events/                 # Métier : événements, participants, inscriptions
│   ├── models.py
│   ├── views.py
│   ├── serializers.py
│   └── urls.py
└── manage.py
```

---

## Modèles de données

### User

Hérite du modèle `AbstractUser` de Django avec un champ `role` supplémentaire.

| Champ | Type | Description |
|---|---|---|
| username | string | Identifiant unique |
| email | string | Adresse email |
| password | string | Mot de passe hashé |
| role | choice | `admin`, `editor`, `viewer` (défaut : `viewer`) |

### Event

| Champ | Type | Description |
|---|---|---|
| title | string | Titre de l'événement |
| description | text | Description (optionnelle) |
| date | datetime | Date et heure |
| location | string | Lieu |
| status | choice | `planned`, `ongoing`, `completed`, `cancelled` |
| created_by | FK → User | Auteur de la création |

### Participant

| Champ | Type | Description |
|---|---|---|
| first_name | string | Prénom |
| last_name | string | Nom |
| email | string | Email (unique) |
| phone | string | Téléphone (optionnel) |

### Registration

Relie un participant à un événement. Un même participant ne peut s'inscrire qu'une seule fois à un événement donné.

| Champ | Type | Description |
|---|---|---|
| event | FK → Event | Événement |
| participant | FK → Participant | Participant |
| registered_at | datetime | Date d'inscription (auto) |

---

## Authentification

L'API utilise JWT (JSON Web Token). Après login, le client reçoit deux tokens :

- **access** : valide 1 heure, à envoyer dans le header `Authorization: Bearer <token>`
- **refresh** : valide 7 jours, utilisé pour obtenir un nouvel access token

### Login

```http
POST /api/auth/login/
Content-Type: application/json

{
  "username": "admin",
  "password": "password123"
}
```

```json
{
  "access": "eyJ0eXAiOiJKV1Qi...",
  "refresh": "eyJ0eXAiOiJKV1Qi..."
}
```

### Rafraîchir le token

```http
POST /api/auth/token/refresh/

{
  "refresh": "eyJ0eXAiOiJKV1Qi..."
}
```

### Logout

```http
POST /api/auth/logout/
Authorization: Bearer <access>

{
  "refresh": "eyJ0eXAiOiJKV1Qi..."
}
```

Le refresh token est blacklisté — il ne peut plus être réutilisé.

---

## Rôles et permissions

| Action | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|
| Lire événements / participants / inscriptions | ✓ | ✓ | ✓ |
| Créer / modifier / supprimer | ✓ | ✓ | ✗ |
| Accéder au dashboard | ✓ | ✓ | ✗ |
| Voir la liste des utilisateurs | ✓ | ✗ | ✗ |

---

## Endpoints

### Authentification — `/api/auth/`

| Méthode | Route | Permission | Description |
|---|---|---|---|
| POST | `/login/` | Public | Connexion |
| POST | `/token/refresh/` | Public | Rafraîchir l'access token |
| POST | `/register/` | Public | Créer un compte |
| GET | `/me/` | Connecté | Profil courant |
| POST | `/logout/` | Connecté | Déconnexion |
| POST | `/change-password/` | Connecté | Changer le mot de passe |
| GET | `/users/` | Admin | Liste des utilisateurs |

---

### Événements — `/api/events/`

| Méthode | Route | Permission | Description |
|---|---|---|---|
| GET | `/` | Connecté | Lister les événements |
| POST | `/` | Admin / Editor | Créer un événement |
| GET | `/<id>/` | Connecté | Détail d'un événement |
| PUT / PATCH | `/<id>/` | Admin / Editor | Modifier un événement |
| DELETE | `/<id>/` | Admin / Editor | Supprimer un événement |

**Paramètres de filtrage (GET `/`) :**
- `status` — filtrer par statut (`planned`, `ongoing`, etc.)
- `date_from` / `date_to` — filtrer par plage de dates (ISO 8601)
- `search` — recherche dans le titre et la localisation
- `ordering` — trier par `date`, `title` ou `created_at`
- `page` — pagination (20 résultats par page)

**Exemple de réponse :**

```json
{
  "count": 3,
  "next": null,
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Django Conference 2026",
      "date": "2026-05-09T14:00:00Z",
      "location": "Paris, France",
      "status": "planned",
      "participant_count": 3,
      "created_by": "admin"
    }
  ]
}
```

**Validation :** la date d'un événement ne peut pas être dans le passé.

---

### Participants — `/api/participants/`

| Méthode | Route | Permission | Description |
|---|---|---|---|
| GET | `/` | Connecté | Lister les participants |
| POST | `/` | Admin / Editor | Créer un participant |
| GET | `/<id>/` | Connecté | Détail d'un participant |
| PUT / PATCH | `/<id>/` | Admin / Editor | Modifier un participant |
| DELETE | `/<id>/` | Admin / Editor | Supprimer un participant |

**Paramètres de filtrage :** `search` (prénom, nom, email), `ordering`, `page`.

---

### Inscriptions — `/api/registrations/`

| Méthode | Route | Permission | Description |
|---|---|---|---|
| GET | `/` | Connecté | Lister les inscriptions |
| POST | `/` | Admin / Editor | Inscrire un participant |
| GET | `/<id>/` | Connecté | Détail d'une inscription |
| DELETE | `/<id>/` | Admin / Editor | Annuler une inscription |

**Exemple de création :**

```http
POST /api/registrations/
Authorization: Bearer <token>

{
  "event": 1,
  "participant": 3
}
```

**Règles métier :**
- Impossible d'inscrire à un événement avec le statut `cancelled`
- Impossible d'inscrire un participant deux fois au même événement

---

### Dashboard — `/api/dashboard/`

| Méthode | Route | Permission | Description |
|---|---|---|---|
| GET | `/` | Admin / Editor | Statistiques globales |

```json
{
  "total_events": 5,
  "total_participants": 10,
  "total_registrations": 20,
  "events_by_status": {
    "planned": 2,
    "ongoing": 1,
    "completed": 1,
    "cancelled": 1
  },
  "upcoming_events": [...]
}
```

---

## Gestion des erreurs

Toutes les erreurs suivent le même format :

```json
{
  "error": true,
  "status_code": 400,
  "message": "Event date cannot be in the past.",
  "details": {
    "date": ["Event date cannot be in the past."]
  }
}
```

| Code | Situation |
|---|---|
| 400 | Données invalides |
| 401 | Non authentifié |
| 403 | Permission insuffisante |
| 404 | Ressource introuvable |

---

## Documentation interactive

Une fois le serveur lancé :

- **Swagger UI** : `http://localhost:8000/api/docs/`
- **ReDoc** : `http://localhost:8000/api/redoc/`
- **Schema OpenAPI** : `http://localhost:8000/api/schema/`

---

## Tests

```bash
python manage.py test
```

36 tests au total, répartis en deux apps :

- `accounts` (10 tests) : login, logout, refresh, register, changement de mot de passe, profil
- `events` (26 tests) : CRUD événements, CRUD participants, inscriptions, dashboard

---

## Données de test

La commande `seed` peuple la base avec un jeu de données cohérent :

```bash
python manage.py seed
```

**Utilisateurs créés :**

| Username | Rôle | Mot de passe |
|---|---|---|
| editor | editor | editor12345 |
| viewer | viewer | viewer12345 |

(Le superuser est créé séparément via `createsuperuser`.)

**Événements :**
- Django Conference 2026 — Planned
- React Summit — Planned
- DevOps Workshop — Ongoing
- AI & ML Hackathon — Completed
- Startup Pitch Night — Cancelled

**Participants :** Alice Dupont, Bob Martin, Clara Schmidt, David Johnson, Emma Leroy

**Inscriptions :** 10 inscriptions réparties entre les participants et les événements.
