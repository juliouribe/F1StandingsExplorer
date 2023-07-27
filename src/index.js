import * as chartFunctions from './scripts/chart-functions';
import * as constants from './scripts/constants';
import * as parsingFunctions from './scripts/parsing-functions';
import * as tableFunctions from './scripts/table-functions';
import { StateManager } from './scripts/state-manager';
import * as utils from './scripts/utils';

let driverView;
let driverNum;

// Main
const pageManager = new StateManager();
const filtersForm = document.querySelector(".data-filters");
const seasonSelection = document.querySelector("#season");
const championship = document.querySelector("#championship");

const changeSeasonRefresh = e => {
  pageManager.season = document.getElementById("season").value
  pageManager.championshipToggle(document.querySelector('#constructor').checked)
  // When you change season don't pass in start/end date.
  populatePage("", "");
}

const repopulatePage = e => {
  // This can be triggered but the submit action.
  e.preventDefault();
  pageManager.season = document.getElementById("season").value
  pageManager.processDateRange(
    document.getElementById("start-date").value,
    document.getElementById("end-date").value,
    true
  )
  pageManager.championshipToggle(document.querySelector('#constructor').checked)
  // Driver num is not enough. Order of drivers changes depending on how you filter
  // Figure out a way to pass the driver name or something and filter on that.
  // if (driverView) {
  //   populatePage(season, inputStartDate, inputEndDate, constructors, driverNum)
  // } else {
  // }
  // perhaps save what the last submitted dates were in case we jump to driver view
  populatePage();
}

const championshipToggle = e => {
  pageManager.season = document.getElementById("season").value
  pageManager.championshipToggle(document.querySelector('#constructor').checked)
  pageManager.processDateRange("", "")
  populatePage();
}

const handleDriverClick = (e, legendItem, _) => {
  pageManager.season = document.getElementById("season").value
  pageManager.processDateRange(
    document.getElementById("start-date").value,
    document.getElementById("end-date").value
  )
  driverNum = legendItem.datasetIndex;
  driverView = true;
  populatePage(driverNum);
}

const backToMain = e => {
  driverView = false;
  driverNum = null;
  pageManager.season = document.getElementById("season").value
  pageManager.processDateRange(
    document.getElementById("start-date").value,
    document.getElementById("end-date").value
  )
  populatePage();
}

async function populatePage(driverDetail = null) {
  // Load and parse race data from local file or API.
  let jsonData = JSON.parse(localStorage.getItem(pageManager.season));
  // If we're not using cached data, get from local file or fetching from API.
  if (jsonData === null) {
    if (constants.localFileSeasons.includes(parseInt(pageManager.season))) {
      console.log("Loading local file");
      jsonData = await parsingFunctions.loadResultsJson(pageManager.season);
    } else {
      console.log("Querying API");
      jsonData = await parsingFunctions.fetchSeasonResults(pageManager.season);
    }
    localStorage.setItem(pageManager.season, JSON.stringify(jsonData));
  } else {
    console.log("Found data in local storage");
  }
  // Organize data into drivers from highest to lowest points.
  const sortedDrivers = parsingFunctions.parseSeasonResults(
    jsonData, pageManager.startDate, pageManager.endDate
  );
  const raceLabels = utils.getRaceLabels(sortedDrivers);
  console.log(sortedDrivers)
  // Update start/end date dropdowns.
  utils.createStartEndDropdown(jsonData, pageManager);

  // Render chart depending on which options are enabled.
  const ctx = utils.handleCanvas(StateManager.currentChart);
  if (driverDetail != null) {
    const singleDriver = [sortedDrivers[driverDetail]];
    StateManager.currentChart = chartFunctions.renderDriverDetail(singleDriver, raceLabels, ctx, backToMain)
  } else if (pageManager.championship === constants.championship.constructors) {
    StateManager.currentChart = chartFunctions.renderConstructorsTable(jsonData, pageManager.startDate, pageManager.endDate, pageManager.season, raceLabels, ctx);
  } else {
    StateManager.currentChart = chartFunctions.renderDriversTable(sortedDrivers, pageManager.season, raceLabels, ctx, handleDriverClick);
  }
  // Create Positions Table
  const table = tableFunctions.generateTable(sortedDrivers, raceLabels);
  const pointsTable = document.querySelector(".table-container");
  pointsTable.childNodes.forEach(child => child.remove())
  pointsTable.appendChild(table);
}

// Main part two
populatePage();
utils.createSeasonSelectDropdown();

// Event Listeners
filtersForm.addEventListener("submit", repopulatePage);
seasonSelection.addEventListener("change", changeSeasonRefresh);
championship.addEventListener("change", championshipToggle);
