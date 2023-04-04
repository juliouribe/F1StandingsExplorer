from django.contrib import admin

from .models import Constructor, RaceTrack
from driver.models import Driver

admin.site.register(RaceTrack)
admin.site.register(Driver)
admin.site.register(Constructor)
