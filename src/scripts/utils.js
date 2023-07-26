import * as constants from './constants';

export function handleCanvas(chart=null) {
  // Gets canvas and returns the context. Destroys chart if populated.
  const canvas = document.getElementById("graph-canvas")
  if (chart) chart.destroy()
  return canvas.getContext("2d");
}

export function getRaceLabels(sortedDrivers) {
  // Get race labels. A driver may not participate in each race so we iterate
  // over three of them just to be safe.
  const uniqueRaces = new Set();
  for (let i = 0; i < 3; i++) {
    Object.values(sortedDrivers[i][1]).forEach((raceResult) => {
      if (raceResult.raceName) {
        uniqueRaces.add(constants.grandPrixAbbreviations[raceResult.raceName])
      }
    })
  }
  return Array.from(uniqueRaces);
}

export function populateElement(type, text, parent = null, eleClass = null) {
  /*
  Takes in an element, populates the text, and optionally adds it to a parent,
  adds a class, or sets an attribute with a value. Returns the newElement.

  */
  const newElement = document.createElement(type);
  newElement.innerHTML = text;
  if (parent != null) parent.appendChild(newElement);
  if (eleClass) newElement.classList.add(eleClass);
  return newElement;
}

export function removeAllChildren(elementId) {
  // Retrieves element by ID and removes all children.
  const parentElement = document.getElementById(elementId);
  while (parentElement.firstChild) {
    parentElement.removeChild(parentElement.firstChild)
  }
  return parentElement;
}

export function createStartEndDropdown(response) {
  // Generates dropdown options for the start and end date filters.
  const startDate = removeAllChildren("start-date");
  const endDate = removeAllChildren("end-date");
  const races = response.MRData.RaceTable.Races;
  races.forEach((race) => {
    const shortName = constants.grandPrixAbbreviations[race.raceName];
    const optionText = `${shortName} - ${race.date}`;
    const startOption = populateElement("option", optionText, startDate);
    startOption.setAttribute("value", race.date);
    const endOption = populateElement("option", optionText, endDate);
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
    const yearOption = populateElement("option", year, seasonOptions)
    yearOption.setAttribute("value", year);
    if (year === 2021) yearOption.setAttribute("selected", true);
  }
}
