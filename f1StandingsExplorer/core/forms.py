from django import forms
from django.forms import widgets

from .models import RaceResult

INPUT_CLASSES = 'py-2 px-2 rounded-xl border'
YES_NO_BOOLEAN_CHOICES = [
    (True, 'Yes'),
    (False, 'No'),
]


class NewRaceResults(forms.ModelForm):
    class Meta:
        model = RaceResult
        fields = ('grand_prix', 'position', 'driver', 'constructor',
                  'fastest_lap', 'retired')

        widgets = {
            'grand_prix': forms.Select(attrs={
                'class': INPUT_CLASSES
            }),
            'position': forms.Select(attrs={
                'class': INPUT_CLASSES
            }),
            'driver': forms.Select(attrs={
                'class': INPUT_CLASSES
            }),
            'constructor': forms.Select(attrs={
                'class': INPUT_CLASSES
            }),
            'fastest_lap': forms.Select(choices=YES_NO_BOOLEAN_CHOICES, attrs={
                'class': INPUT_CLASSES
            }),
            'retired': forms.Select(choices=YES_NO_BOOLEAN_CHOICES, attrs={
                'class': INPUT_CLASSES
            }),
        }
