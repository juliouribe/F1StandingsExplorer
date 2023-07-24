// Functions for creating graphs for the season summary view.
import * as constants from './constants';
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers';
// import autocolors from 'chartjs-plugin-autocolors';

export function generateTable(sortedDrivers) {
  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const header = document.createElement("tr");
  const position = document.createElement("th");
  position.innerHTML = "Pos.";
  header.appendChild(position);
  const driverColumn = document.createElement("th");
  driverColumn.innerHTML = "Driver";
  header.appendChild(driverColumn);
  // Generate headers.
  const firstDriver = sortedDrivers[0][1]
  // Figure out how many races there are, i.e. don't include Total column.
  let numRaces = 0;
  Object.values(firstDriver).forEach((ele) => {
    const column = document.createElement("th");
    if (typeof ele === "object") {
      column.innerHTML = constants.grandPrixAbbreviations[ele.raceName];
      numRaces++;
    } else {
      column.innerHTML = "Total"
    }
    header.appendChild(column);
  })
  thead.appendChild(header)
  table.appendChild(thead)
  // Generate driver rows.
  // Top level iterates over drivers (Y-Axis)
  const tbody = document.createElement("tbody");
  sortedDrivers.forEach((driver, pos) => {
    const driverStats = driver[1];
    const row = document.createElement("tr");
    const driverPos = document.createElement("th")
    driverPos.innerHTML = (pos + 1).toString();
    row.appendChild(driverPos);
    const driverName = document.createElement("td");
    driverName.innerHTML = driver[0];
    row.appendChild(driverName);
    // Inner loop iterates over race results (X-Axis).
    for (let i = 1; i <= numRaces; i++) {
      const raceResult = document.createElement("td");
      raceResult.classList.add("data-cell")
      // Cell will be empty if a driver didn't participate in a given round.
      if (i in driverStats) {
        const finishPos = driverStats[i]["finishPosition"];
        raceResult.innerHTML = finishPos;
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
    const total = document.createElement("td");
    total.innerHTML = driverStats.pointsTotal;
    row.appendChild(total)
    tbody.appendChild(row);
  })
  table.appendChild(tbody);
  table.classList.add("results-table");
  return table;
}

export function generateSeasonSummary(sortedDrivers, seasonDataset, ctx) {
  // Chart.register(autocolors);
  const chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.values(sortedDrivers[0][1]).map((stats) => stats.raceName),
      datasets: seasonDataset
    },
    options: {
      onClick: (e) => {
        const canvasPosition = getRelativePosition(e, chart);
        const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
        const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
      },
    }
  });
}
