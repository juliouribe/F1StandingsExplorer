import * as seasonSummary from './scripts/season-summary';
import * as seasonSummaryTable from './scripts/season-summary-table'

let chart;

async function populatePage() {
  let seasonOption = document.getElementById("season")
  let season = seasonOption.value;
  // Parse race data
  const jsonData = await seasonSummary.loadResultsJson(season);
  const sortedDrivers = await seasonSummary.parseSeasonResults(jsonData);
  console.log(sortedDrivers)

  // Create Season Summary Line-graphs
  const canvas = document.getElementById("graph-canvas")
  const ctx = canvas.getContext("2d");
  const seasonDataset = seasonSummary.generateDatasets(sortedDrivers);
  if (chart) {
    chart.destroy()
  }
  chart = seasonSummaryTable.generateSeasonSummary(sortedDrivers, seasonDataset, ctx)

  // Create Positions Table
  const table = seasonSummaryTable.generateTable(sortedDrivers);
  const pointsTable = document.querySelector(".table-container");
  pointsTable.childNodes.forEach(child => child.remove())
  pointsTable.appendChild(table);
}

const repopulatePage = e => {
  e.preventDefault();
  populatePage();
}

populatePage();
const filtersForm = document.querySelector(".data-filters");
filtersForm.addEventListener("submit", repopulatePage);
