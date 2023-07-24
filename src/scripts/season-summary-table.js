

export function generateTable(sortedDrivers) {
  const table = document.createElement("table");
  const header = document.createElement("tr");
  // Generate headers.
  const firstDriver = sortedDrivers[0][1]
  Object.keys(firstDriver).forEach((el) => {
    const column = document.createElement("th");
    column.innerHTML = el.toString();
    header.appendChild(column);
  })
  table.appendChild(header)
  console.log(table)
  // Generate driver rows.
  // Top level iterates over drivers (Y-Axis)
  Object.entries(sortedDrivers).forEach((driver) => {
    driverStats = driver[1];
    const row = document.createElement("tr");
    const driverName = document.createElement("td");
    driverName.innerHTML = driverStats.fullName;
    row.appendChild(driverName);
    // Inner loop iterates over race results (X-Axis)
    for (const [round, results] of Object.entries(driverStats)) {
      const raceResult = document.createElement("td");
      raceResult.innerHTML = results.points;
      row.appendChild(raceResult);
    }
    table.appendChild(row);
  })
  return table;

}


