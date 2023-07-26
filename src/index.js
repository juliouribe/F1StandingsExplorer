import * as constants from './scripts/constants';
import * as seasonSummary from './scripts/season-summary';
import * as seasonSummaryTable from './scripts/season-summary-table'

let chart;

async function populatePage(season = 2021, startDate = "", endDate = "", constructors = false, driverDetail = null) {
  // Parse race data
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
    // TODO: Update this chart with a bart chart of quali and finish positions.
    const driverDataset = seasonSummary.generateDatasets(singleDriver);
    chart = seasonSummaryTable.generateSeasonSummary(
      singleDriver, driverDataset, ctx, changeSeasonRefresh
    )
  } else if (constructors) {
    const sortedConstructors = seasonSummary.computeConstructorPoints(
      jsonData, startDate, endDate
    );
    console.log(sortedConstructors)
    const constructorDataset = seasonSummary.generateConstructorDataset(sortedConstructors);
    chart = seasonSummaryTable.generateConstructorSummary(
      sortedConstructors, constructorDataset, ctx
    )
  } else {
    const driverDataset = seasonSummary.generateDatasets(sortedDrivers);
    chart = seasonSummaryTable.generateSeasonSummary(
      sortedDrivers, driverDataset, ctx, handleDriverClick
    )
  }

  // Create Positions Table
  const table = seasonSummaryTable.generateTable(sortedDrivers);
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
  populatePage(season, inputStartDate, inputEndDate);
}

const championshipToggle = e => {
  let season = document.getElementById("season").value
  let constructors = document.querySelector('#constructor').checked;
  populatePage(season, "", "", constructors);
}

const handleDriverClick = (e, legendItem, legend) => {
  let season = document.getElementById("season").value
  let constructors = document.querySelector('#constructor').checked;
  console.log(legend);
  console.log(legendItem);
  let driverDetail = legendItem.datasetIndex;
  populatePage(season, "", "", constructors, driverDetail);
}

populatePage();
seasonSummary.createSeasonSelectDropdown();
const filtersForm = document.querySelector(".data-filters");
const seasonSelection = document.querySelector("#season");
const championship = document.querySelector("#championship");


filtersForm.addEventListener("submit", repopulatePage);
seasonSelection.addEventListener("change", changeSeasonRefresh);
championship.addEventListener("change", championshipToggle);
