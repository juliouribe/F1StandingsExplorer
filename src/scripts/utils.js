import * as constants from './constants';

export function getRaceLabels(sortedDrivers) {
  // Get race labels. A driver may not participate in each race so we iterate
  // over three of them just to be safe.
  const uniqueRaces = new Set();
  for (let i = 0; i < 3; i++) {
    Object.values(sortedDrivers[i][1]).forEach((raceResult) => {
      if (raceResult.raceName) {
        uniqueRaces.add(constants.grandPrixAbbreviations[raceResult.raceName])
      }
    })
  }
  return Array.from(uniqueRaces);
}

export function populateElement(type, text, parent = null, eleClass = null) {
  /*
  Takes in an element, populates the text, and optionally appends it to a parent
  element and adds a class if given.

  */
  const newElement = document.createElement(type);
  newElement.innerHTML = text;
  if (parent != null) parent.appendChild(newElement);
  if (eleClass) newElement.classList.add(eleClass);
}