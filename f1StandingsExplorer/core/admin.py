from django.contrib import admin

from .models import Constructor, GrandPrix, RaceResult, RaceTrack
from driver.models import Driver

admin.site.register(RaceTrack)
admin.site.register(Driver)
admin.site.register(Constructor)
admin.site.register(GrandPrix)
admin.site.register(RaceResult)
