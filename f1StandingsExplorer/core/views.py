from django.db.models import Sum
from django.db.models.expressions import F
from django.shortcuts import render
from core.models import GrandPrix, RaceResult
from driver.models import Driver


def home(request):
    headers = ['Place'] + ['Driver'] + list(GrandPrix.objects.filter(
        race_date__year=2022).values_list('race_track__country_abbreviation', flat=True))
    headers.append('Points')
    # .values() essentially does the group by.
    results = RaceResult.objects.filter(
        grand_prix__race_date__year=2022).values('driver').annotate(
        total_points=Sum('points')).order_by('-total_points')

    drivers = Driver.objects.filter(raceresults__grand_prix__race_date__year=2022).annotate(
        total_points=Sum('raceresults__points')).values('id', 'first_name', 'last_name', 'total_points').order_by(
            '-total_points')

    race_results = []
    place = 1
    # A driver row is the name, individual track results, and total points.
    for driver in drivers:
        driver_name = driver['first_name'] + ' ' + driver['last_name']
        driver_results = RaceResult.objects.filter(driver__id=driver['id']).values_list(
            'points', flat=True).order_by('grand_prix__race_date')
        driver_row = [str(place)] + [driver_name] + \
            list(driver_results) + [driver['total_points']]
        # TODO: Find a way to fill missing values. Vettel and Hulk subs
        if len(driver_row) < len(headers):
            # Super hacky but fills in some missing 0's.
            for i in range(len(headers) - len(driver_row)):
                driver_row.append('0')
        race_results.append(driver_row)
        place += 1

    context = {
        'headers': headers,
        'race_results': race_results,
    }

    return render(request, 'core/home.html', context)
