import * as seasonSummary from './scripts/season-summary';
import * as seasonSummaryTable from './scripts/season-summary-table'
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers';
import autocolors from 'chartjs-plugin-autocolors';


const jsonData = await seasonSummary.loadResultsJson();
const sortedDrivers = seasonSummary.parseSeasonResults(jsonData);
console.log(sortedDrivers)

const table = seasonSummaryTable.generateTable(sortedDrivers);
const pointsTable = document.querySelector(".points-table");
pointsTable.appendChild(table);


// const canvas = document.getElementById("graph-canvas")
// const ctx = canvas.getContext("2d");

// Chart.register(autocolors);
// const chart = new Chart(ctx, {
//   type: 'line',
//   data: {
//     labels: sortedDrivers.map((subarray) => subarray[1].fullName),
//     datasets: [
//       {
//         label: 'Test',
//         data: sortedDrivers.map((subarray) => subarray[1].pointsTotal)
//       }
//     ]
//   },
//   options: {
//     onClick: (e) => {
//       const canvasPosition = getRelativePosition(e, chart);

//       // Substitute the appropriate scale IDs
//       const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
//       const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
//     },
//     plugins: [autocolors],
//     // animation: false,
//     // tooltip: {
//     //   enabled: false
//     // }
//   }
// });
