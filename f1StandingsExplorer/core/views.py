from django.db.models import Sum
from django.db.models.expressions import F
from django.shortcuts import render
from core.models import GrandPrix, RaceResult
from driver.models import Driver
from .forms import NewRaceResults


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
            'position', flat=True).order_by('grand_prix__race_date')
        driver_row = [str(place)] + [driver_name] + \
            list(driver_results) + [driver['total_points']]
        race_results.append(driver_row)
        place += 1

    context = {
        'headers': headers,
        'race_results': race_results,
    }

    return render(request, 'core/home.html', context)


def add_race_results(request):
    if request.method == 'POST':
        form = NewRaceResults(request.POST)

        if form.is_valid:
            race_result = form.save(commit=False)
            # race_result.grand_prix = top_level_gp
            # race_result.save()
    else:
        form = NewRaceResults()

    context = {
        'title': 'Add New Race Results',
        'form': form
    }
    return render(request, 'core/add_race_results.html', context)
