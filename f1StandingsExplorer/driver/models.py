from django.db import models


class Driver(models.Model):
    first_name = models.CharField(max_length=255)
    last_name = models.CharField(max_length=255)

    class Meta:
        ordering = ('last_name',)

    def __str__(self):
        return self.first_name + ' ' + self.last_name
