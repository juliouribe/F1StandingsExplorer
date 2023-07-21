import * as seasonSummary from './scripts/season-summary';

const jsonData = await seasonSummary.loadResultsJson();
const sortedDrivers = seasonSummary.parseSeasonResults(jsonData);

sortedDrivers.forEach((driver) => {
  console.log(`${driver[0]}, ${driver[1].pointsTotal}`);
})
