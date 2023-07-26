// Class to help manage the state of the single-page application.
import * as constants from './constants'
export class StateManager {
  constructor() {
    this.season = 2021;
    this.currentChart = '';
    this.startDate = '';
    this.endDate = '';
    this.championship = constants.championship.drivers;
    this.driverView = false;
    this.driverNum = null;
  }
}
