// Functions for parsing the results of an entire season
const season = 2021
const url = `http://ergast.com/api/f1/${season}/results.json?limit=500`
let results;
let fileData;

export const fetchSeasonResults = () => {
  fetch(url, { headers: { "Accept": "application/json" } })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Something went wrong');
      }
    }, fail => console.log(fail))
    .then(body => {
      results = body;
    }, fail => console.log(fail)) // if this failure wasn't here, then we'd go to the catch if the if(res.ok) portion failed
    .catch(error => console.log(error))
}

export const loadResultsJson = () => {
  fetch('./src/data/results-2021.json', { mode: 'no-cors' })
    .then((response) => response.json())
    .then((json) => {
      console.log(json);
      fileData = json;
    });
}

export function parseSeasonResults(response) {
  /*
  Takes in the result of calling the full seasons results endpoint. Parses the
  body into an array that can be used to generate the season summary table.
  Groups races by driver to determine the total points per driver. Then places
  drivers into an array sorted from highest to lowest. Race order is preserved.

  response: JSON object
  seasonSummary: an array containing sub-arrays of driver results. Each subarray
    contains a hash object. The keys are the races and values are points. An
    additional key is added for points total.
  */
  // This returns an array of races.
  const races = response.MRData.RaceTable.Races;
  const drivers = {};
  races.forEach((race) => {
    const raceName = race.raceName;
    const round = race.round;
    race.forEach((raceResult) => {
      const driver = raceResult.driverId
      // Create default entries if they don't exist.
      if (!drivers[driver]) drivers[driver] = {};
      if (!drivers[driver]["pointsTotal"]) drivers[driver]["pointsTotal"] = 0;
      // We'll use finish and quali in the driver detail view.
      drivers[driver][round] = {
        "raceName": raceName,
        "points": raceResult.points,
        "finishPosition": raceResult.position,
        "qualiPosition": raceResult.grid
      }
      drivers[driver]["pointsTotal"] += raceResult.points;
    })
  })
  // Sort drivers by total points. Returns an array with 2 element subarrays.
  // The first element is the driver ID and the second element is the full
  // driver results. Each round is a key for the full race result.
  const seasonResults = Object.entries(drivers)
    .sort(([, a], [, b]) => b.pointsTotal - a.pointsTotal);
  return seasonResults;
}
