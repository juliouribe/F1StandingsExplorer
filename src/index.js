import * as seasonSummary from './scripts/season-summary';
import * as seasonSummaryTable from './scripts/season-summary-table'

// Parse race data
let season = 2022;
const jsonData = await seasonSummary.loadResultsJson(season);
const sortedDrivers = await seasonSummary.parseSeasonResults(jsonData);
console.log(sortedDrivers)

const canvas = document.getElementById("graph-canvas")
const ctx = canvas.getContext("2d");

// Create Season Summary Line-graphs
const seasonDataset = seasonSummary.generateDatasets(sortedDrivers);
seasonSummaryTable.generateSeasonSummary(sortedDrivers, seasonDataset, ctx)

// Create Positions Table
const table = seasonSummaryTable.generateTable(sortedDrivers);
const pointsTable = document.querySelector(".table-container");
pointsTable.appendChild(table);
