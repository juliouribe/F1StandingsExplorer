import * as constants from './scripts/constants';
import * as seasonSummary from './scripts/season-summary';
import * as seasonSummaryTable from './scripts/season-summary-table'

let chart;

async function populatePage(season = 2021, startDate = "", endDate = "") {
  // Parse race data
  let jsonData
  if (constants.localFileSeasons.includes(parseInt(season))) {
    jsonData = await seasonSummary.loadResultsJson(season);
  } else {
    // jsonData = await seasonSummary.fetchSeasonResults(season);
  }
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
  // when you change season don't pass in start/end date.
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
const filtersForm = document.querySelector(".data-filters");
const seasonSelection = document.querySelector("#season");

filtersForm.addEventListener("submit", repopulatePage);
seasonSelection.addEventListener("change", changeSeasonRefresh)
