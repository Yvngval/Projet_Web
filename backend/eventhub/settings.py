"""
Django settings for eventhub project.
"""

from datetime import timedelta
from pathlib import Path

from decouple import config, Csv

BASE_DIR = Path(__file__).resolve().parent.parent


# ──────────────────────────────────────────────
# Security
# ──────────────────────────────────────────────

SECRET_KEY = config(
    "SECRET_KEY",
    default="django-insecure-wn8%^ofyys7d73m3_mn77-v@^pu=@bp04_5tiu=xmkm)qb@t0z",
)

DEBUG = config("DEBUG", default=True, cast=bool)

ALLOWED_HOSTS = config("ALLOWED_HOSTS", default="127.0.0.1,localhost", cast=Csv())


# ──────────────────────────────────────────────
# Applications
# ──────────────────────────────────────────────

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    # Third-party
    "rest_framework",
    "rest_framework_simplejwt.token_blacklist",
    "django_filters",
    "corsheaders",
    "drf_spectacular",
    # Local apps
    "accounts",
    "events",
]


# ──────────────────────────────────────────────
# Middleware
# ──────────────────────────────────────────────

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    "django.middleware.security.SecurityMiddleware",
    "corsheaders.middleware.CorsMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]


# ──────────────────────────────────────────────
# URL & WSGI
# ──────────────────────────────────────────────

ROOT_URLCONF = "eventhub.urls"
WSGI_APPLICATION = "eventhub.wsgi.application"


# ──────────────────────────────────────────────
# Templates
# ──────────────────────────────────────────────

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]


# ──────────────────────────────────────────────
# Database
# ──────────────────────────────────────────────

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}


# ──────────────────────────────────────────────
# Auth
# ──────────────────────────────────────────────

AUTH_USER_MODEL = "accounts.User"

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]


# ──────────────────────────────────────────────
# Internationalization
# ──────────────────────────────────────────────

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True


# ──────────────────────────────────────────────
# Static files
# ──────────────────────────────────────────────

STATIC_URL = "static/"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ──────────────────────────────────────────────
# Django REST Framework
# ──────────────────────────────────────────────

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",
    ],
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 20,
    "EXCEPTION_HANDLER": "eventhub.exception_handler.custom_exception_handler",
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
}


# ──────────────────────────────────────────────
# Simple JWT
# ──────────────────────────────────────────────

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": True,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
}


# ──────────────────────────────────────────────
# drf-spectacular — API documentation
# ──────────────────────────────────────────────

SPECTACULAR_SETTINGS = {
    "TITLE": "TicketHub API",
    "DESCRIPTION": "REST API for Event and Participant Management System.",
    "VERSION": "1.0.0",
    "SERVE_INCLUDE_SCHEMA": False,
    "TAGS": [
        {"name": "Auth", "description": "Authentication & user management"},
        {"name": "Events", "description": "Event CRUD operations"},
        {"name": "Participants", "description": "Participant CRUD operations"},
        {"name": "Registrations", "description": "Event-Participant registrations"},
        {"name": "Dashboard", "description": "Summary statistics"},
    ],
}


# ──────────────────────────────────────────────
# CORS — allow React frontend to call the API
# ──────────────────────────────────────────────

CORS_ALLOWED_ORIGINS = config(
    "CORS_ALLOWED_ORIGINS",
    default="http://localhost:3000,http://127.0.0.1:3000",
    cast=Csv(),
)

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]