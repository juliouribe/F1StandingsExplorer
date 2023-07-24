

export function generateTable(sortedDrivers) {
  const table = document.createElement("table");
  const header = document.createElement("tr");

  const firstDriver = sortedDrivers[0][1]
  Object.keys(firstDriver).forEach((el) => {
    const column = document.createElement("th");
    column.innerHTML = el.toString();
    header.appendChild(column);
  })
  table.appendChild(header)
  

}


