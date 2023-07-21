const season = 2021
const url = `http://ergast.com/api/f1/${season}/results.json?limit=500`
let results;

const fetchSeasonResults = () => {
  fetch(url, { headers: { "Accept": "application/json" } })
    .then(res => {
      if (res.ok) {
        return res.json();
      } else {
        throw new Error('Something went wrong');
      }
    }, fail => console.log(fail))
    .then(body => {
      results = body;
    }, fail => console.log(fail)) // if this failure wasn't here, then we'd go to the catch if the if(res.ok) portion failed
    .catch(error => console.log(error))
}
// fetchSeasonResults();
