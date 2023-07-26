// Functions for processing data related to the Season Summary Main View.
import * as constants from './constants';
import * as utils from './utils';

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
    // Apply optional date filters for start and end dates.
    if (startDate) {
      const raceDate = new Date(race.date);
      const startFilter = new Date(startDate);
      const endFilter = new Date(endDate);
      if (raceDate.getFullYear() === startFilter.getFullYear()) {
        if (raceDate < startFilter || raceDate > endFilter) {
          return;
        }
      }
    }
    const raceName = race.raceName;
    const round = race.round;
    // Update driver object with respective race results.
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
  /*
  Sort drivers by total points. Returns an array with 2 element subarrays. The
  first element is the driver name and the second element is the full driver
  results for a given season. Each round is a key for the full race result.
  */
  return Object.entries(drivers)
    .sort(([, raceA], [, raceB]) => raceB.pointsTotal - raceA.pointsTotal);;
}

export function generateDatasets(sortedDrivers) {
  // Generate chart data for the Driver's Championship.
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

export function generateConstructorDataset(sortedConstructors) {
  // Generate chart data for the Constructor's Championship.
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

export function generateSingleDriverData(singleDriver) {
  // Generate chart data for the Driver Detail view.
  const driverName = singleDriver[0][0];
  let driverData = Object.values(singleDriver[0][1])
  driverData = driverData.slice(0, driverData.length - 1)
  const qualiDataset = {
    label: "Qualifying",
    data: driverData.map((race) => race.qualiPosition),
  }
  const raceDataset = {
    label: "Race Finish",
    data: driverData.map((race) => race.finishPosition),
  }
  return [qualiDataset, raceDataset];
}

export function createStartEndDropdown(response) {
  // Generates dropdown options for the start and end date filters.
  const startDate = utils.removeAllChildren("start-date");
  const endDate = utils.removeAllChildren("end-date");
  const races = response.MRData.RaceTable.Races;
  races.forEach((race) => {
    const shortName = constants.grandPrixAbbreviations[race.raceName];
    const optionText = `${shortName} - ${race.date}`;
    const startOption = utils.populateElement("option", optionText, startDate);
    startOption.setAttribute("value", race.date);
    const endOption = utils.populateElement("option", optionText, endDate);
    endOption.setAttribute("value", race.date);
  })
}

export function createSeasonSelectDropdown() {
  /*
  Creates season selection dropdown options for the last X number of years.
  Number of years is defined in constants.numberOfSeasons.
  */
  const seasonOptions = document.getElementById("season")
  const today = new Date()
  const currentYear = today.getFullYear();
  for (let i = 0; i < constants.numberOfSeasons; i++) {
    const year = parseInt(currentYear - i);
    const yearOption = utils.populateElement("option", year, seasonOptions)
    yearOption.setAttribute("value", year);
    if (year === 2021) yearOption.setAttribute("selected", true);
  }
}

export function computeConstructorPoints(response, startDate, endDate) {
  const races = response.MRData.RaceTable.Races;
  const constructors = {};
  races.forEach((race) => {
    // Optionally filter out races if start and end dates are given.
    if (startDate) {
      const raceDate = new Date(race.date);
      const startFilter = new Date(startDate);
      const endFilter = new Date(endDate);
      if (raceDate.getFullYear() === startFilter.getFullYear()) {
        if (raceDate < startFilter || raceDate > endFilter) {
          return;
        }
      }
    }
    const raceName = race.raceName;
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
  /*
  Sort constructors by total points. Returns an array with 2 element subarrays.
  The first element is the team name and the second element is the full
  constructor's results.
  */
  return Object.entries(constructors)
    .sort(([, raceA], [, raceB]) => raceB.pointsTotal - raceA.pointsTotal);;
}
