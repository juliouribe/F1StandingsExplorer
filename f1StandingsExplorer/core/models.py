from tabnanny import verbose
from django.db import models


class Constructor(models.Model):
    name = models.CharField(max_length=255)
    founded = models.DecimalField(max_digits=4, decimal_places=0)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name
