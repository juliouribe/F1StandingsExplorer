// Functions for creating graphs for the season summary view.
import * as constants from './constants';
import * as utils from './utils';
import Chart from 'chart.js/auto';
import { getRelativePosition } from 'chart.js/helpers';
// import autocolors from 'chartjs-plugin-autocolors';

export function generateTable(sortedDrivers) {
  // Setup table layout elements.
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const header = document.createElement("tr");
  const position = utils.populateElement("th", "Pos.", header)
  const driverColumn = document.createElement("th");
  driverColumn.innerHTML = "Driver";
  header.appendChild(driverColumn);

  // Generate headers.
  const uniqueRaces = new Set();
  for (let i = 0; i < 3; i++) {
    Object.values(sortedDrivers[i][1]).forEach((raceResult) => {
      if (raceResult.raceName) uniqueRaces.add(raceResult.raceName)
    })
  }
  for (const raceName of uniqueRaces) {
    const column = document.createElement("th");
    column.innerHTML = constants.grandPrixAbbreviations[raceName];
    header.appendChild(column);
  }
  const column = document.createElement("th");
  column.innerHTML = "Total"
  header.appendChild(column);
  thead.appendChild(header)
  table.appendChild(thead)

  // Generate driver rows.
  // Top level iterates over drivers (Y-Axis)
  const tbody = document.createElement("tbody");
  const roundStart = parseInt(Object.keys(sortedDrivers[0][1])[0])
  sortedDrivers.forEach((driver, pos) => {
    const driverStats = driver[1];
    const row = document.createElement("tr");
    const driverPos = document.createElement("th")
    driverPos.innerHTML = (pos + 1).toString();
    row.appendChild(driverPos);
    const driverName = document.createElement("td");
    driverName.innerHTML = driver[0];
    driverName.classList.add("driver-name");
    row.appendChild(driverName);
    // Inner loop iterates over race results (X-Axis).
    for (let i = roundStart; i < (uniqueRaces.size + roundStart); i++) {
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
    const total = document.createElement("th");
    total.innerHTML = driverStats.pointsTotal;
    row.appendChild(total)
    tbody.appendChild(row);
  })
  table.appendChild(tbody);
  table.classList.add("results-table");
  return table;
}

export function generateSeasonSummary(raceLabels, seasonDataset, ctx, callback, title, type = "line") {
  // Chart.register(autocolors);

  const chart = new Chart(ctx, {
    type: type,
    data: {
      // TODO: Improve how we get labels for races
      labels: raceLabels,
      datasets: seasonDataset
    },
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
          font: {
            size: 24
          },
          padding: {
            top: 10,
            bottom: 10
          },
        }
      }
    }
  });
  return chart;
}

export function generateConstructorSummary(raceLabels, constructorDataset, ctx, title) {
  // Chart.register(autocolors);
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: raceLabels,
      datasets: constructorDataset
    },
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
          font: {
            size: 24
          },
          padding: {
            top: 10,
            bottom: 10
          },
        }
      }
    }
  });
  return chart;
}
