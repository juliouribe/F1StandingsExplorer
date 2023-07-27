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

  championshipToggle(toggleStatus) {
    if (toggleStatus) {
      this.championship = constants.championship.constructors;
    } else {
      this.championship = constants.championship.drivers;
    };
  }

  processDateRange(start, end, matchingOkay=false) {
    this.startDate = start;
    this.endDate = end;
    // If the start and end are the same, reset to empty strings.
    if (this.startDate === this.endDate && !matchingOkay) {
      this.startDate = "";
      this.endDate = "";
    }
  }
}
