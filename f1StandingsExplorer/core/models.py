from typing import Collection, Optional, ValuesView
from django.core.exceptions import ValidationError
from django.db import models
from driver.models import Driver
from core.constants import POINTS_MAP


class Constructor(models.Model):
    name = models.CharField(max_length=255)
    founded = models.DecimalField(max_digits=4, decimal_places=0)

    class Meta:
        ordering = ('name',)

    def __str__(self):
        return self.name


class RaceTrack(models.Model):
    circuit_name = models.CharField(max_length=255)
    country = models.CharField(max_length=255)
    country_abbreviation = models.CharField(max_length=3)

    class Meta:
        ordering = ('country', 'circuit_name',)

    def __str__(self):
        return self.country + ', ' + self.circuit_name


class GrandPrix(models.Model):
    race_date = models.DateField()
    race_track = models.ForeignKey(
        RaceTrack, related_name='grand_prix', on_delete=models.CASCADE)

    class Meta:
        ordering = ('-race_date',)

    def __str__(self):
        return self.race_date.strftime('%m/%d/%Y') + ', ' + self.race_track.country


class RaceResult(models.Model):
    # TODO: Figure out a way to enforce unique 20 placings per Grand Prix Race.
    POSITION_CHOICES = [
        ('1st', '1st'), ('2nd', '2nd'), ('3rd', '3rd'), ('4th', '4th'),
        ('5th', '5th'), ('6th', '6th'), ('7th', '7th'), ('8th', '8th'),
        ('9th', '9th'), ('10th', '10th'), ('11th', '11th'), ('12th', '12th'),
        ('13th', '13th'), ('14th', '14th'), ('15th', '15th'), ('16th', '16th'),
        ('17th', '17th'), ('18th', '18th'), ('19th', '19th'), ('20th', '20th'),
        ('21st', '21st'), ('22nd', '22nd'),
    ]
    driver = models.ForeignKey(
        Driver, related_name='raceresults', on_delete=models.CASCADE)
    position = models.CharField(
        max_length=4,
        choices=POSITION_CHOICES,
    )
    retired = models.BooleanField(default=False)
    grand_prix = models.ForeignKey(
        GrandPrix, related_name='race_results', on_delete=models.CASCADE)
    constructor = models.ForeignKey(
        Constructor, related_name='race_results', on_delete=models.CASCADE)
    fastest_lap = models.BooleanField(
        default=False)
    points = models.IntegerField(blank=True, editable=False)

    def save(self):
        self.points = POINTS_MAP[self.position]
        # Add fastest lap point if a top 10 position and fastest_lap.
        if self.points and self.fastest_lap:
            self.points += 1
        return super(RaceResult, self).save()

    class Meta:
        ordering = ('-grand_prix__race_date', '-points', 'position',)
        constraints = [
            # Prevent multiple of the same position at a race, two 5th places.
            models.UniqueConstraint(
                name="unique_constraint_race_and_position",
                fields=('grand_prix', 'position')
            ),
            # Prevent multiple results for the same driver at a race.
            models.UniqueConstraint(
                name='unique_constraint_race_and_driver_and_position',
                fields=('grand_prix', 'driver')
            )
        ]

    # Ex: 4/10/2022: AUS 1st, Charles Leclerc
    def __str__(self):
        driver_name = self.driver.first_name + ' ' + self.driver.last_name
        track_info = self.grand_prix.race_date.strftime(
            '%m/%d/%Y') + ': ' + self.grand_prix.race_track.country_abbreviation
        return track_info + ' ' + self.position + ', ' + driver_name
