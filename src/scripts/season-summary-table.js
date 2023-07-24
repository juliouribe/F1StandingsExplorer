// Functions for creating graphs for the season summary view.
import * as constants from './constants';
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers';
// import autocolors from 'chartjs-plugin-autocolors';

export function generateTable(sortedDrivers) {
  const table = document.createElement("table");
  const header = document.createElement("tr");
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
  table.appendChild(header)
  console.log(table)
  // Generate driver rows.
  // Top level iterates over drivers (Y-Axis)
  sortedDrivers.forEach((driver) => {
    const driverStats = driver[1];
    const row = document.createElement("tr");
    const driverName = document.createElement("td");
    driverName.innerHTML = driver[0];
    row.appendChild(driverName);
    // Inner loop iterates over race results (X-Axis).
    for (let i = 1; i <= numRaces; i++) {
      const raceResult = document.createElement("td");
      // Cell will be empty if a driver didn't participate in a given round.
      if (i in driverStats) {
        raceResult.innerHTML = driverStats[i]["finishPosition"];
      }
      row.appendChild(raceResult);
    }
    const total = document.createElement("td");
    total.innerHTML = driverStats.pointsTotal;
    row.appendChild(total)
    table.appendChild(row);
  })
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
