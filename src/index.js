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
const explainerButton = document.getElementById("explainer-button");
const explainerModal = document.getElementById("explainer-modal");
const explainerClose = document.getElementById("explainer-close");
const backToMainButton = document.getElementById("back-to-main");

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
  backToMainButton.style.display = "block";
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
  backToMainButton.style.display = "none";
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
  let jsonData;
  if (pageManager.season !== 2023) {
    jsonData = await JSON.parse(localStorage.getItem(pageManager.season));
  }
  // If we're not using cached data, load data from local file or fetch from the API.
  if (jsonData === null) {
    if (constants.localFileSeasons.includes(parseInt(pageManager.season))) {
      console.log("Loading from local file.")
      jsonData = await parsingFunctions.loadResultsJson(pageManager.season);
    } else {
      console.log("Fetching from API.")
      jsonData = await parsingFunctions.fetchSeasonResults(pageManager.season);
    }
    if (pageManager.season !== 2023) {
      localStorage.setItem(pageManager.season, JSON.stringify(jsonData));
    }
  }
  // Organize data into drivers from highest to lowest points.
  const sortedDrivers = parsingFunctions.parseSeasonResults(
    jsonData, pageManager.startDate, pageManager.endDate
  );
  const raceLabels = utils.getRaceLabels(sortedDrivers);
  utils.createStartEndDropdown(jsonData, pageManager);
  // Render chart depending on which options are enabled.
  const ctx = utils.handleCanvas(StateManager.currentChart);
  if (pageManager.driverView) {
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

// // Logic to open and close the explainer modal.
explainerButton.onclick = function () {
  explainerModal.style.display = "block";
}

// When the user clicks on <span> (x) or outside of the modal, close the modal
explainerClose.onclick = function () {
  explainerModal.style.display = "none";
}
window.onclick = function (event) {
  if (event.target == explainerModal) {
    explainerModal.style.display = "none";
  }
}

// Event Listeners
filtersForm.addEventListener("submit", repopulatePage);
seasonSelection.addEventListener("change", tableRefresh);
championship.addEventListener("change", tableRefresh);
instructionsMenu.addEventListener("click", toggleShow)
backToMainButton.addEventListener("click", backToMain);

// Run initial populate page with defaults: season 2021, driver's championship.
populatePage();
// We only need to populate the season dropdown once.
utils.createSeasonSelectDropdown();
