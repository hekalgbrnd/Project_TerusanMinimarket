from django.apps import AppConfig


class MainappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'mainapp'

def ready(self):
    import yourapp.signals  # ganti dengan nama app kamu
