import * as constants from './scripts/constants';
import * as seasonSummary from './scripts/season-summary';
import * as tableFunctions from './scripts/table-functions'
import * as utils from './scripts/utils'

let chart;
let driverView;
let driverNum;

async function populatePage(season = 2021, startDate = "", endDate = "", constructors = false, driverDetail = null) {
  // Load and parse race data from local file or API.
  let jsonData = JSON.parse(localStorage.getItem(season));
  // If we're not using cached data, get from local file or fetching from API.
  if (jsonData === null) {
    if (constants.localFileSeasons.includes(parseInt(season))) {
      console.log("Loading local file");
      jsonData = await seasonSummary.loadResultsJson(season);
    } else {
      console.log("Querying API");
      jsonData = await seasonSummary.fetchSeasonResults(season);
    }
    localStorage.setItem(season, JSON.stringify(jsonData));
  } else {
    console.log("Found data in local storage");
  }
  // Organize data into drivers from highest to lowest points.
  const sortedDrivers = seasonSummary.parseSeasonResults(
    jsonData, startDate, endDate
  );
  const raceLabels = utils.getRaceLabels(sortedDrivers);
  console.log(sortedDrivers)

  // Update start/end date dropdowns.
  seasonSummary.createStartEndDropdown(jsonData);

  // Create Season Summary Line-graphs
  const canvas = document.getElementById("graph-canvas")
  const ctx = canvas.getContext("2d");
  // Reset chart for potentially new graphs.
  if (chart) {
    chart.destroy()
  }
  if (driverDetail != null) {
    const singleDriver = [sortedDrivers[driverDetail]];
    const driverName = singleDriver[0][0]
    // TODO: Update this chart with a bart chart of quali and finish positions.
    const driverDataset = seasonSummary.generateSingleDriverData(singleDriver);
    chart = tableFunctions.generateSeasonSummary(
      raceLabels, driverDataset, ctx, backToMain, driverName, "bar"
    )
  } else if (constructors) {
    const sortedConstructors = seasonSummary.computeConstructorPoints(
      jsonData, startDate, endDate
    );
    const title = `Constructor's Championship ${season}`;
    const constructorDataset = seasonSummary.generateConstructorDataset(sortedConstructors);
    chart = tableFunctions.generateConstructorSummary(
      raceLabels, constructorDataset, ctx, title
    )
  } else {
    const driverDataset = seasonSummary.generateDatasets(sortedDrivers);
    const title = `Driver's Championship ${season}`
    chart = tableFunctions.generateSeasonSummary(
      raceLabels, driverDataset, ctx, handleDriverClick, title
    )
  }

  // Create Positions Table
  const table = tableFunctions.generateTable(sortedDrivers, raceLabels);
  const pointsTable = document.querySelector(".table-container");
  pointsTable.childNodes.forEach(child => child.remove())
  pointsTable.appendChild(table);
}

const changeSeasonRefresh = e => {
  let season = document.getElementById("season").value
  let constructors = document.querySelector('#constructor').checked;
  // When you change season don't pass in start/end date.
  populatePage(season, "", "", constructors);
}

const repopulatePage = e => {
  // This can be triggered but the submit action.
  e.preventDefault();
  let season = document.getElementById("season").value
  let inputStartDate = document.getElementById("start-date").value;
  let inputEndDate = document.getElementById("end-date").value;
  let constructors = document.querySelector('#constructor').checked;
  // Driver num is not enough. Order of drivers changes depending on how you filter
  // Figure out a way to pass the driver name or something and filter on that.
  // if (driverView) {
  //   populatePage(season, inputStartDate, inputEndDate, constructors, driverNum)
  // } else {
  // }
  // perhaps save what the last submitted dates were in case we jump to driver view
  populatePage(season, inputStartDate, inputEndDate);
}

const championshipToggle = e => {
  let season = document.getElementById("season").value
  let constructors = document.querySelector('#constructor').checked;
  populatePage(season, "", "", constructors);
}

const handleDriverClick = (e, legendItem, _) => {
  let season = document.getElementById("season").value
  let constructors = document.querySelector('#constructor').checked;
  let inputStartDate = document.getElementById("start-date").value;
  let inputEndDate = document.getElementById("end-date").value;
  if (inputStartDate === inputEndDate) {
    inputStartDate = "";
    inputEndDate = "";
  }
  driverNum = legendItem.datasetIndex;
  driverView = true;
  populatePage(season, inputStartDate, inputEndDate, constructors, driverNum);
}

const backToMain = e => {
  driverView = false;
  driverNum = null;
  let season = document.getElementById("season").value
  let inputStartDate = document.getElementById("start-date").value;
  let inputEndDate = document.getElementById("end-date").value;
  let constructors = document.querySelector('#constructor').checked;
  if (inputStartDate === inputEndDate) {
    inputStartDate = "";
    inputEndDate = "";
  }
  populatePage(season, inputStartDate, inputEndDate, constructors);
}

populatePage();
seasonSummary.createSeasonSelectDropdown();
const filtersForm = document.querySelector(".data-filters");
const seasonSelection = document.querySelector("#season");
const championship = document.querySelector("#championship");


filtersForm.addEventListener("submit", repopulatePage);
seasonSelection.addEventListener("change", changeSeasonRefresh);
championship.addEventListener("change", championshipToggle);
