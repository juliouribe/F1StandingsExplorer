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

export async function loadResultsJson(season = 2021) {
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
    const raceDate = new Date(race.date);
    if (startDate) {
      const startFilter = new Date(startDate);
      const endFilter = new Date(endDate);

      if (raceDate.getFullYear() === startFilter.getFullYear()) {
        if (raceDate < startFilter || raceDate > endFilter) {
          return;
        }
      }
    }

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

// Driver's Championship
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
// Constructor's Championship
export function generateConstructorDataset(sortedConstructors) {
  const seasonDataset = [];
  sortedConstructors.forEach((constructor) => {
    const constructorData = {
      label: constructor[0],
      data: Object.values(constructor[1]).map((stats) => stats.currentPoints)
    }
    seasonDataset.push(constructorData);
  });
  return seasonDataset;
}

export function createStartEndDropdown(response) {
  const startDate = document.getElementById("start-date");
  const endDate = document.getElementById("end-date");
  // Clear out previous dropdown options.
  while (startDate.firstChild) {
    startDate.removeChild(startDate.firstChild)
  }
  while (endDate.firstChild) {
    endDate.removeChild(endDate.firstChild)
  }
  // Populate options with dates from current year.
  const races = response.MRData.RaceTable.Races;
  races.forEach((race) => {
    const optionStart = document.createElement("option");
    const optionEnd = document.createElement("option");
    const shortName = constants.grandPrixAbbreviations[race.raceName];
    optionStart.innerHTML = `${shortName} - ${race.date}`;
    optionStart.setAttribute("value", race.date)
    optionEnd.innerHTML = `${shortName} - ${race.date}`;
    optionEnd.setAttribute("value", race.date)
    startDate.appendChild(optionStart);
    endDate.appendChild(optionEnd);
  })
}

export function createSeasonSelectDropdown() {
  // Populate season select dropdown.
  const seasonOptions = document.getElementById("season")
  const today = new Date()
  const currentYear = today.getFullYear();
  for (let i = 0; i < constants.numberOfSeasons; i++) {
    const seasonOption = document.createElement("option");
    const year = parseInt(currentYear - i);
    seasonOption.innerHTML = year;
    seasonOption.setAttribute("value", year);
    if (year === 2021) {
      seasonOption.setAttribute("selected", true);
    }
    seasonOptions.appendChild(seasonOption);
  }
}

export function computeConstructorPoints(response, startDate, endDate) {
  const races = response.MRData.RaceTable.Races;
  const constructors = {};
  races.forEach((race) => {
    const raceName = race.raceName;
    // Insert filtering for date
    const raceDate = new Date(race.date);
    if (startDate) {
      const startFilter = new Date(startDate);
      const endFilter = new Date(endDate);
      if (raceDate.getFullYear() === startFilter.getFullYear()) {
        if (raceDate < startFilter || raceDate > endFilter) {
          return;
        }
      }
    }

    const round = race.round;
    race.Results.forEach((raceResult) => {
      const constructor = raceResult.Constructor.name;

      // Create default entries if they don't exist.
      if (!constructors[constructor]) constructors[constructor] = {};
      if (!constructors[constructor]["pointsTotal"]) constructors[constructor]["pointsTotal"] = 0;
      // We'll use finish and quali in the driver detail view.
      constructors[constructor]["pointsTotal"] += parseInt(raceResult.points);
      // Each team has two drivers
      if (constructors[constructor][round]) {
        constructors[constructor][round]["points"] += raceResult.points
      }
      constructors[constructor][round] = {
        "raceName": raceName,
        "points": raceResult.points,
        "currentPoints": constructors[constructor]["pointsTotal"],
        "date": race.date
      }
    })
  })
  // Sort drivers by total points. Returns an array with 2 element subarrays.
  // The first element is the driver ID and the second element is the full
  // driver results. Each round is a key for the full race result.
  const seasonResults = Object.entries(constructors)
    .sort(([, a], [, b]) => b.pointsTotal - a.pointsTotal);

  return seasonResults;
}
