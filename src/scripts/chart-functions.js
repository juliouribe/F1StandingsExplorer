import * as parsingFunctions from './parsing-functions';
import * as tableFunctions from './table-functions';
import { handleDriverClick } from '../index';

export function renderDriverDetail(singleDriver, raceLabels, ctx) {
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

export function renderDriversTable(sortedDrivers, season, raceLabels, ctx) {
  const driverDataset = parsingFunctions.generateDatasets(sortedDrivers);
  const title = `Driver's Championship ${season}`
  return tableFunctions.generateSeasonSummary(
    raceLabels, driverDataset, ctx, handleDriverClick, title
  )
}
