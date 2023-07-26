// Functions for creating graphs for the season summary view.
import * as constants from './constants';
import * as utils from './utils';
import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';

export function generateTable(sortedDrivers, raceLabels) {
  // Setup table layout elements.
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const header = document.createElement("tr");
  // Add Position column header.
  utils.populateElement("th", "Pos.", header)
  // Add Driver column header.
  utils.populateElement("th", "Driver", header)
  // Add Race abbreviation headers.
  raceLabels.forEach((raceShortName) => {
    utils.populateElement("th", raceShortName, header)
  })
  // Add Total column header
  utils.populateElement("th", "Total", header)
  thead.appendChild(header)
  table.appendChild(thead)

  // Generate driver rows.
  // Top level iterates over drivers (Y-Axis)
  const tbody = document.createElement("tbody");
  // When date filters are applied we need to pull the respective key.
  const roundStart = parseInt(Object.keys(sortedDrivers[0][1])[0])
  sortedDrivers.forEach((driver, pos) => {
    const driverStats = driver[1];
    const row = document.createElement("tr");
    // Add position row (1-20).
    utils.populateElement("th", (pos + 1).toString(), row)
    // Add driver's name.
    utils.populateElement("td", driver[0], row, "driver-name")
    // Inner loop iterates over race results (X-Axis).
    for (let i = roundStart; i < (raceLabels.length + roundStart); i++) {
      const raceResult = document.createElement("td");
      raceResult.classList.add("data-cell")
      // Cell will be empty if a driver didn't participate in a given round.
      if (i in driverStats) {
        const finishPos = driverStats[i]["finishPosition"];
        raceResult.innerHTML = finishPos;
        // Add color to background depending on finish.
        if (finishPos === "1") {
          raceResult.setAttribute("id", "gold-cell");
        } else if (finishPos === "2") {
          raceResult.setAttribute("id", "silver-cell");
        } else if (finishPos === "3") {
          raceResult.setAttribute("id", "bronze-cell");
        } else if (finishPos <= 10) {
          raceResult.setAttribute("id", "points-cell");
        } else {
          raceResult.setAttribute("id", "no-points-cell");
        }
      }
      row.appendChild(raceResult);
    }
    // Add Total column for given driver.
    utils.populateElement("th", driverStats.pointsTotal, row)
    tbody.appendChild(row);
  })
  table.appendChild(tbody);
  table.classList.add("results-table");
  return table;
}

export function generateSeasonSummary(raceLabels, seasonDataset, ctx, callback, title, type = "line") {
  const chart = new Chart(ctx, {
    type: type,
    data: { labels: raceLabels, datasets: seasonDataset },
    options: {
      onClick: (e) => {
        const canvasPosition = getRelativePosition(e, chart);
        const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
        const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
      },
      plugins: {
        legend: {
          onClick: callback,
          display: true,
          position: 'left'
        },
        title: {
          display: true,
          text: title,
          font: { size: 24 },
          padding: { top: 10, bottom: 10 },
        }
      }
    }
  });
  return chart;
}

export function generateConstructorSummary(raceLabels, constructorDataset, ctx, title) {
  const chart = new Chart(ctx, {
    type: 'line',
    data: { labels: raceLabels, datasets: constructorDataset },
    options: {
      onClick: (e) => {
        const canvasPosition = getRelativePosition(e, chart);
        const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
        const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
      },
      plugins: {
        legend: {
          display: true,
          position: 'left'
        },
        title: {
          display: true,
          text: title,
          font: { size: 24 },
          padding: { top: 10, bottom: 10 },
        }
      }
    }
  });
  return chart;
}
