from django.db.models import Sum
from django.db.models.expressions import F
from django.shortcuts import render
from core.models import GrandPrix, RaceResult
from driver.models import Driver


def home(request):
    headers = list(GrandPrix.objects.filter(
        race_date__year=2022).values_list('race_track__country_abbreviation', flat=True))
    # .values() essentially does the group by.
    results = RaceResult.objects.filter(
        grand_prix__race_date__year=2022).values('driver').annotate(
        total_points=Sum('points')).order_by('-total_points')

    print("Results: " + str(len(results)))
    for result in results:
        print(result)

    # Group by driver,
    # Add all of the points up
    # Order by points DESC

    # for driver_results in all_results:
    #     for result in driver_results:
    #         # retrieve points value assuming they are in order

    import pdb
    pdb.set_trace()
    context = {
        'headers': headers,
        'race_results': results,
    }

    return render(request, 'core/home.html', context)
