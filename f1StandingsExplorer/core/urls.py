from django.urls import path

from . import views

app_name = 'core'

urlpatterns = [
    path('', views.home, name='home'),
    path('add_race_results/', views.add_race_results, name='add_race_results'),
]
