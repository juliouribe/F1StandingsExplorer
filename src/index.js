import * as seasonSummary from './scripts/season-summary';
import Chart from 'chart.js/auto'
import { getRelativePosition } from 'chart.js/helpers';
import autocolors from 'chartjs-plugin-autocolors';


const jsonData = await seasonSummary.loadResultsJson();
const sortedDrivers = seasonSummary.parseSeasonResults(jsonData);
console.log(sortedDrivers)

sortedDrivers.forEach((driver) => {
  console.log(`${driver[0]}, ${driver[1].pointsTotal}`);
})

const canvas = document.getElementById("graph-canvas")
const ctx = canvas.getContext("2d");

const data = [
  { year: 2010, count: 2 },
  { year: 2011, count: 5 },
  { year: 2012, count: 12 }
]
Chart.register(autocolors);
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: sortedDrivers.map((subarray) => subarray[0]),
    datasets: [
      {
        label: 'Test',
        data: sortedDrivers.map((subarray) => subarray[1].pointsTotal)
      }
    ]
  },
  options: {
    onClick: (e) => {
      const canvasPosition = getRelativePosition(e, chart);

      // Substitute the appropriate scale IDs
      const dataX = chart.scales.x.getValueForPixel(canvasPosition.x);
      const dataY = chart.scales.y.getValueForPixel(canvasPosition.y);
    },
    plugins: [autocolors],
    // animation: false,
    // tooltip: {
    //   enabled: false
    // }
  }
});
