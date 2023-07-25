// Functions for processing data related to the Season Summary Main View.
import * as constants from './constants';

export async function fetchSeasonResults(season = 2021) {
  const url = `http://ergast.com/api/f1/${season}/results.json?limit=500`
  let result;
  try {
    const response = await fetch(
      url, { headers: { "Accept": "application/json" } }
    )
    if (response.ok) {
      result = await response.json();
    }
  } catch (errorResponse) {
    console.error(errorResponse);
  }
  return result;
}

export async function loadResultsJson(season = 2022) {
  let result;
  try {
    const response = await fetch(`./src/data/results-${season}.json`)
    if (response.ok) {
      result = await response.json();
    } else {
      throw response;
    }
  } catch (errorResponse) {
    console.error(errorResponse);
  }
  return result;
}

export function parseSeasonResults(response, startDate, endDate) {
  /*
  Takes in the result of calling the full seasons results endpoint. Parses the
  body into an array that can be used to generate the season summary table.
  Groups races by driver to determine the total points per driver. Then places
  drivers into an array sorted from highest to lowest. Race order is preserved.

  response: JSON object
  seasonResults: an array containing sub-arrays of driver results. Each subarray
    contains the name of the driver, and a hash object. The hash object contains
    race results for points, quali position, and finish position.
  */
  // This returns an array of races.
  const races = response.MRData.RaceTable.Races;
  const drivers = {};
  races.forEach((race) => {
    const raceName = race.raceName;
    // Insert filtering for date
    const raceDate = race.date; // "2021-03-28"
    // startDate // mm-dd-yyyy

    const round = race.round;
    race.Results.forEach((raceResult) => {
      const first = raceResult.Driver.givenName;
      const last = raceResult.Driver.familyName;
      const driver = `${first} ${last}`

      // Create default entries if they don't exist.
      if (!drivers[driver]) drivers[driver] = {};
      if (!drivers[driver]["pointsTotal"]) drivers[driver]["pointsTotal"] = 0;
      // We'll use finish and quali in the driver detail view.
      drivers[driver]["pointsTotal"] += parseInt(raceResult.points);
      drivers[driver][round] = {
        "raceName": raceName,
        "points": raceResult.points,
        "finishPosition": raceResult.position,
        "qualiPosition": raceResult.grid,
        "currentPoints": drivers[driver]["pointsTotal"],
        "date": race.date
      }
    })
  })
  // Sort drivers by total points. Returns an array with 2 element subarrays.
  // The first element is the driver ID and the second element is the full
  // driver results. Each round is a key for the full race result.
  const seasonResults = Object.entries(drivers)
    .sort(([, a], [, b]) => b.pointsTotal - a.pointsTotal);

  return seasonResults;
}

export function generateDatasets(sortedDrivers) {
  const seasonDataset = [];
  sortedDrivers.forEach((driver) => {
    const driverData = {
      label: driver[0].split(' ')[1].slice(0, 3).toUpperCase(),
      data: Object.values(driver[1]).map((stats) => stats.currentPoints)
    }
    seasonDataset.push(driverData);
  });
  return seasonDataset;
}

export function createStartEndDropdown(sortedDrivers) {
  const startDate = document.getElementById("start-date");
  const endDate = document.getElementById("end-date");
  console.log(startDate);
  console.log(endDate);
  const firstRow = sortedDrivers[0][1];
  Object.values(firstRow).forEach((ele) => {
    const optionStart = document.createElement("option");
    const optionEnd = document.createElement("option");
    if (typeof ele === "object") {
      const raceName = constants.grandPrixAbbreviations[ele.raceName];
      optionStart.innerHTML = `${raceName} - ${ele.date}`;
      optionStart.setAttribute("value", ele.date)
      optionEnd.innerHTML = `${raceName} - ${ele.date}`;
      optionEnd.setAttribute("value", ele.date)
    }
    startDate.appendChild(optionStart);
    endDate.appendChild(optionEnd);
  })
}
