import * as chartFunctions from './scripts/chart-functions';
import * as constants from './scripts/constants';
import * as parsingFunctions from './scripts/parsing-functions';
import * as tableFunctions from './scripts/table-functions';
import { StateManager } from './scripts/state-manager';
import * as utils from './scripts/utils';

// Initialize instance of StateManger and select elements for event handling.
const pageManager = new StateManager();
const filtersForm = document.querySelector(".data-filters");
const seasonSelection = document.querySelector("#season");
const championship = document.querySelector("#championship");
const instructionsMenu = document.querySelector("#instructions-menu");

// Event Handlers.
const tableRefresh = e => {
  // General table refresh.
  pageManager.season = document.getElementById("season").value
  pageManager.championshipToggle(document.querySelector('#constructor').checked)
  populatePage();
}

const repopulatePage = e => {
  // This is the event handler for the submit action.
  e.preventDefault();
  pageManager.season = document.getElementById("season").value
  pageManager.championshipToggle(document.querySelector('#constructor').checked)
  pageManager.processDateRange(
    document.getElementById("start-date").value,
    document.getElementById("end-date").value,
    true
  )
  populatePage();
}

const handleDriverClick = (e, legendItem, _) => {
  // Switches to the Driver Detail View.
  pageManager.season = document.getElementById("season").value
  pageManager.processDateRange(
    document.getElementById("start-date").value,
    document.getElementById("end-date").value
  )
  pageManager.driverNum = legendItem.datasetIndex;
  pageManager.driverView = true;
  populatePage();
}

const backToMain = e => {
  // Resets back to Driver Championship View.
  pageManager.season = document.getElementById("season").value
  pageManager.clearDriverView();
  pageManager.processDateRange(
    document.getElementById("start-date").value,
    document.getElementById("end-date").value
  )
  populatePage();
}

const toggleShow = e => {
  // Toggles whether or not the instructions are hidden.
  const instructionsList = document.getElementById("instructions-list")
  if (instructionsList.style.display === "none") {
    instructionsList.style.display = "block";
  } else {
    instructionsList.style.display = "none";
  }
}

// Main page population function.
async function populatePage() {
  // Load and parse race data from local file or API.
  let jsonData = JSON.parse(localStorage.getItem(pageManager.season));
  // If we're not using cached data, get from local file or fetching from API.
  if (jsonData === null) {
    if (constants.localFileSeasons.includes(parseInt(pageManager.season))) {
      jsonData = await parsingFunctions.loadResultsJson(pageManager.season);
    } else {
      jsonData = await parsingFunctions.fetchSeasonResults(pageManager.season);
    }
    localStorage.setItem(pageManager.season, JSON.stringify(jsonData));
  }
  // Organize data into drivers from highest to lowest points.
  const sortedDrivers = parsingFunctions.parseSeasonResults(
    jsonData, pageManager.startDate, pageManager.endDate
  );
  const raceLabels = utils.getRaceLabels(sortedDrivers);
  // Update start/end date dropdowns.
  utils.createStartEndDropdown(jsonData, pageManager);
  // Render chart depending on which options are enabled.
  const ctx = utils.handleCanvas(StateManager.currentChart);
  if (pageManager.driverView) {
    // const singleDriver = [sortedDrivers[driverDetail]];
    const singleDriver = pageManager.findDriver(sortedDrivers);
    StateManager.currentChart = chartFunctions.renderDriverDetail(
      singleDriver, raceLabels, ctx, backToMain)
  } else if (pageManager.championship === constants.championship.constructors) {
    StateManager.currentChart = chartFunctions.renderConstructorsTable(
      jsonData, pageManager, raceLabels, ctx);
  } else {
    StateManager.currentChart = chartFunctions.renderDriversTable(
      sortedDrivers, pageManager, raceLabels, ctx, handleDriverClick);
  }
  // Create Positions Table
  const table = tableFunctions.generateTable(sortedDrivers, raceLabels);
  const pointsTable = document.querySelector(".table-container");
  pointsTable.childNodes.forEach(child => child.remove())
  pointsTable.appendChild(table);
}

// Event Listeners
filtersForm.addEventListener("submit", repopulatePage);
seasonSelection.addEventListener("change", tableRefresh);
championship.addEventListener("change", tableRefresh);
instructionsMenu.addEventListener("click", toggleShow)

// Run initial populate page with defaults: season 2021, driver's championship.
populatePage();
// We only need to populate the season dropdown once.
utils.createSeasonSelectDropdown();
