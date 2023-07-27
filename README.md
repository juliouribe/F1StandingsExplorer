# F1 Standings Explorer
![img](./assets/samples/project-banner.png "Project Banner")
F1 Standings Explorer is a single page application for exploring Formula 1 seasons results. When F1 fans look up season standings online, they usually find a simple table with current totals. F1 Standings Explorer offers F1 fans the option to explore season standings of the current season and previous seasons with data visualizations and interactive graphs. How close was the WDC championship halfway through the year in 2021? How often did Charles not win a race when he got pole in 2022? Who was leading the constructor's championship in 2020? All of those questions can be answered using the F1 Standings Explorer web app.

[F1 Standings Explorer Live Site](http://juliouribe.github.io/F1StandingsExplorer/)

## Technologies Used
F1 Standings Explorer is a fully functional web app built using JavaScript, HTML, and CSS. This app was build following App Academy's guidelines to build a front-end only app with no back-end. I used [Chart.JS](https://www.chartjs.org/) for creating plots and [Ergast API](https://ergast.com/mrd/) for data.

# Features
## Driver's Championship Graphs
F1 Standings Explorer creates visualizations that show how an F1 season played out. Two plots are generated for the Driver's championship. The first is a line graph showing the points total for each driver. Data is rendered by parsing json data pulled from the Ergast F1 API. The web app uses caching so repeated queries are quick.

![img](./assets/samples/WDC-2021.png "WDC 2021")

A driver's position table summary is also generated. This data is rendered using the same data that renders the line-graphs. Both are updated when a user selects filtering options.

![img](./assets/samples/positions-table.png "Positions Table 2021")

## Data Filtering Options
F1 Standings Explorer provides users the option to select different seasons of F1, filter for date ranges, and toggle between championships. Plots are regenerated using the filtered data. In the example below we can see Charles Leclerc's lead after Miami in 2022. Max Verstappen was far behind at the end of Australia's GP but was making a huge comeback.

![img](./assets/samples/filtering.png "Example Filtering")


## Constructor's Championship
Users can toggle to see the Constructor's Championship. The linegraphs update so we can view how each team performed through the year. User's can filter for date ranges and select different seasons just like the WDC graphs. In the example below, we can see how neck and neck Mercedes and Redbull were all year with Mercedes ultimately taking the WCC trophy.
![img](./assets/samples/WCC-2021.png "WCC 2021")

## Driver Detail View
While on the Driver's Championship view, users can click on an individual driver to pull up a bar chart with their individual qualifying and race results for each race. In the example below we can look at Sergio Perez who is under a lot of scrutiny in 2023 for having poor qualifying results. The bar charts however show he's doing a great job recovering positions on race day. For example, in Austria Checo started in 15th but by the end of the race he made it onto the podium finishing 3rd.

![img](./assets/samples/checo-detail.png "Checo Detail View")

# Challenges
## Managing State
There are a lot of ways the plots can get rendered when processing user input which makes it tricky to conditionally render the correct graphs and data. I used a class called StateManager which acts very similarly to a Singleton. There is only one instance of this class and it is accessed across the codebase so we have consistent filter values across the entire application. It also have a few methods to dry up code and carefully handle changing values.

![img](./assets/samples/state-manager.png "State Manager")

## Caching and loading data
F1 Standings Explorer parses a lot of data which can potentially cause downtime for users. For each season of Forumla 1 we are querying and parsing hundreds of races results. To solve this, I used two local data files so the default select season renders almost instantly. We query the Ergast API when data isn't available in a file. The first query may be a bit slow but future API calls are cached and load quickly. I used Javascript's localStorage to keep track of which seasons have already been queried.

![img](./assets/samples/caching.png "Loading, fetching, and caching")

## Parsing JSON data and generating dynamic graphs
One challenge was coming up with efficient code that parses the json data returned from the API into meaningful summaries but also compatible with populating two types of graphs. I came up with parsing algorithms to efficiently parse hundreds of race results and group them by driver, tally points totals, and order them by position in the championship. I made these functions modular so we can apply dynamic filters and still return accurate points totals.

*See "/src/scripts/parsing-functions.js" for well documented parsing code.*
