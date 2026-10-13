# Contributing to EventHub

Thanks for your interest in improving EventHub. This guide covers how to report a problem, set up the project locally and propose a change.

## Reporting bugs and suggesting features

Open an [issue](https://github.com/Yvngval/Projet_Web/issues) and include:

- what you expected and what happened instead
- the steps to reproduce it, with the backend you used (Django or Node.js)
- your environment (operating system, Python and Node.js versions, browser)

Security issues are the exception: report them privately as described in [SECURITY.md](SECURITY.md).

## Development setup

```bash
git clone https://github.com/Yvngval/Projet_Web.git
cd Projet_Web

# Node.js backend (port 3000, used by the frontend by default)
cd node-backend && npm install && npm run dev

# Django backend (port 8000), in a second terminal
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate && python manage.py runserver

# Frontend (port 5173), in a third terminal
cd frontend && npm install && npm run dev
```

## Proposing a change

1. Fork the repository and create a branch from `main`, for example `git checkout -b fix/registration-count`.
2. Keep each pull request focused on a single change.
3. Run the Django tests with `python manage.py test` from `backend/` and make sure they pass.
4. Lint the frontend with `npm run lint` from `frontend/`.
5. Write commit messages in the [Conventional Commits](https://www.conventionalcommits.org/) style, for example `fix: refresh participant count after unregistering`.
6. Open a pull request that explains what changed and why. A change to the API should land in both backends, since the frontend works with either one.

## Code style

The frontend follows the ESLint configuration in `frontend/eslint.config.js`. The Django apps keep one responsibility per file (`models.py`, `serializers.py`, `views.py`, `permissions.py`); the Node.js backend splits the same logic into `routes/`, `controllers/`, `middleware/` and `models/`.
