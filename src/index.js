import * as constants from './scripts/constants';
import * as seasonSummary from './scripts/season-summary';
import * as seasonSummaryTable from './scripts/season-summary-table'

let chart;

async function populatePage(season = 2021, startDate = "", endDate = "") {
  // Parse race data
  let jsonData = JSON.parse(localStorage.getItem(season));
  // If we're not using cached data, get from local file or fetching from API.
  if (jsonData === null) {
    console.log("looking up data")
    if (constants.localFileSeasons.includes(parseInt(season))) {
      jsonData = await seasonSummary.loadResultsJson(season);
    } else {
      jsonData = await seasonSummary.fetchSeasonResults(season);
    }
    localStorage.setItem(season, JSON.stringify(jsonData));
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
  const seasonDataset = seasonSummary.generateDatasets(sortedDrivers);
  if (chart) {
    chart.destroy()
  }
  chart = seasonSummaryTable.generateSeasonSummary(
    sortedDrivers, seasonDataset, ctx
  )

  // Create Positions Table
  const table = seasonSummaryTable.generateTable(sortedDrivers);
  const pointsTable = document.querySelector(".table-container");
  pointsTable.childNodes.forEach(child => child.remove())
  pointsTable.appendChild(table);
}

const changeSeasonRefresh = e => {
  e.preventDefault();
  let season = document.getElementById("season").value
  // When you change season don't pass in start/end date.
  populatePage(season);
}

const repopulatePage = e => {
  e.preventDefault();
  let season = document.getElementById("season").value
  let inputStartDate = document.getElementById("start-date").value;
  let inputEndDate = document.getElementById("end-date").value;
  populatePage(season, inputStartDate, inputEndDate);
}

populatePage();
seasonSummary.createSeasonSelectDropdown();
const filtersForm = document.querySelector(".data-filters");
const seasonSelection = document.querySelector("#season");

filtersForm.addEventListener("submit", repopulatePage);
seasonSelection.addEventListener("change", changeSeasonRefresh)
