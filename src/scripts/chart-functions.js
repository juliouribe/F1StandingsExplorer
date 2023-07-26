import * as parsingFunctions from './parsing-functions';
import * as tableFunctions from './table-functions';

export function renderDriverDetail(singleDriver, raceLabels, ctx, backToMain) {
  const driverName = singleDriver[0][0]
  const driverDataset = parsingFunctions.generateSingleDriverData(singleDriver);
  return tableFunctions.generateSeasonSummary(
    raceLabels, driverDataset, ctx, backToMain, driverName, "bar"
  )
}

export function renderConstructorsTable(jsonData, startDate, endDate, season, raceLabels, ctx) {
  const sortedConstructors = parsingFunctions.computeConstructorPoints(
    jsonData, startDate, endDate
  );
  const title = `Constructor's Championship ${season}`;
  const constructorDataset = parsingFunctions.generateConstructorDataset(sortedConstructors);
  return tableFunctions.generateConstructorSummary(
    raceLabels, constructorDataset, ctx, title
  )
}

export function renderDriversTable(sortedDrivers, season, raceLabels, ctx, handleDriverClick) {
  const driverDataset = parsingFunctions.generateDatasets(sortedDrivers);
  const title = `Driver's Championship ${season}`
  return tableFunctions.generateSeasonSummary(
    raceLabels, driverDataset, ctx, handleDriverClick, title
  )
}
