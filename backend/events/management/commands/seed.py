"""Populate the database with sample data for development and demo."""

from django.core.management.base import BaseCommand
from django.utils import timezone

from accounts.models import User
from events.models import Event, Participant, Registration


class Command(BaseCommand):
    help = "Seed the database with sample users, events, participants, and registrations."

    def handle(self, *args, **options):
        # ── Users ──────────────────────────────────────
        editor, _ = User.objects.get_or_create(
            username="editor",
            defaults={"email": "editor@eventhub.com", "role": "editor"},
        )
        editor.set_password("editor12345")
        editor.save()

        viewer, _ = User.objects.get_or_create(
            username="viewer",
            defaults={"email": "viewer@eventhub.com", "role": "viewer"},
        )
        viewer.set_password("viewer12345")
        viewer.save()

        self.stdout.write(self.style.SUCCESS("Users created: editor, viewer"))

        # ── Events ─────────────────────────────────────
        now = timezone.now()
        events_data = [
            {
                "title": "Django Conference 2026",
                "description": "Annual Django developers conference with workshops and talks.",
                "date": now + timezone.timedelta(days=30),
                "location": "Paris, France",
                "status": "planned",
            },
            {
                "title": "React Summit",
                "description": "Frontend developers gathering to discuss React ecosystem.",
                "date": now + timezone.timedelta(days=60),
                "location": "Berlin, Germany",
                "status": "planned",
            },
            {
                "title": "DevOps Workshop",
                "description": "Hands-on workshop on CI/CD, Docker, and Kubernetes.",
                "date": now + timezone.timedelta(days=15),
                "location": "London, UK",
                "status": "ongoing",
            },
            {
                "title": "AI & ML Hackathon",
                "description": "48-hour hackathon focused on AI and machine learning projects.",
                "date": now - timezone.timedelta(days=10),
                "location": "Amsterdam, Netherlands",
                "status": "completed",
            },
            {
                "title": "Startup Pitch Night",
                "description": "Evening event for startups to pitch to investors.",
                "date": now + timezone.timedelta(days=5),
                "location": "Lyon, France",
                "status": "cancelled",
            },
        ]

        admin_user = User.objects.filter(role="admin").first()
        events = []
        for data in events_data:
            event, _ = Event.objects.get_or_create(
                title=data["title"],
                defaults={**data, "created_by": admin_user},
            )
            events.append(event)

        self.stdout.write(self.style.SUCCESS(f"{len(events)} events created"))

        # ── Participants ───────────────────────────────
        participants_data = [
            {"first_name": "Alice", "last_name": "Dupont", "email": "alice@example.com", "phone": "+33612345678"},
            {"first_name": "Bob", "last_name": "Martin", "email": "bob@example.com", "phone": "+33698765432"},
            {"first_name": "Clara", "last_name": "Schmidt", "email": "clara@example.com", "phone": "+49171234567"},
            {"first_name": "David", "last_name": "Johnson", "email": "david@example.com", "phone": "+44771234567"},
            {"first_name": "Emma", "last_name": "Leroy", "email": "emma@example.com", "phone": "+33645678901"},
        ]

        participants = []
        for data in participants_data:
            p, _ = Participant.objects.get_or_create(
                email=data["email"], defaults=data
            )
            participants.append(p)

        self.stdout.write(self.style.SUCCESS(f"{len(participants)} participants created"))

        # ── Registrations ──────────────────────────────
        registrations = [
            (events[0], participants[0]),
            (events[0], participants[1]),
            (events[0], participants[2]),
            (events[1], participants[0]),
            (events[1], participants[3]),
            (events[2], participants[1]),
            (events[2], participants[4]),
            (events[3], participants[2]),
            (events[3], participants[3]),
            (events[3], participants[4]),
        ]

        count = 0
        for event, participant in registrations:
            _, created = Registration.objects.get_or_create(
                event=event, participant=participant
            )
            if created:
                count += 1

        self.stdout.write(self.style.SUCCESS(f"{count} registrations created"))
        self.stdout.write(self.style.SUCCESS("Database seeded successfully!"))
