// The svg
const svg = d3.select("#worldmap g.map"), //select the wmap class
  width = +svg.attr("width"), // get the width of the SVG element
  height = +svg.attr("height"); // get the height of the SVG element

// Map and projection
const path = d3.geoPath(); // create a new path generator

const projection = d3.geoMercator() // create a new Mercator projection
  .scale(120)
  .center([0, 5])
  .translate([400, 400]); //offset



//parser to change to time object
const parser = d3.timeParse("%Y-%m-%d");

//Data loading
////////////////////////////////////////////////////////////////////////////////////////////
Promise.all([
  d3.json("/data/geo.json"),// load the geojson file
  d3.csv("/data/test2.csv"),// load the CSV file that contains COVID-19 data for each country
  d3.csv("/data/country.csv")
]).then(function (loadData) {
  // get the geographic data
  let geoData = loadData[0];

  //load csv to return a list of country names
  let countrys = loadData[2];
  let countryNames = countrys.map(function (d) {
    return d.Name;
  });
  console.log("hey" + countryNames); //return object of all country Data


  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(loadData[2], d => +d.total_deaths_per_million)])
    .interpolator(d3.interpolateReds);

  let covidData = new Map(); // create Map object

  //get covid data
  loadData[1].forEach(function (d) {

    //time parser
    d.date = parser(d.date);
    //console.log("date " + d.date)

  });
  //console.log(names);



  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(geoData.features)
    .join("path")
    .attr("d", path.projection(projection))
    //fill colour base on cases
    .attr("fill", '')
    .on("click", handleMouseClick);


  // Define an empty array to store the selected countries
  let selectedCountries = [];


  /**
   * Description placeholder
   * @date 04/03/2023 - 11:00:45
   *
   * @param {*} e
   * @param {*} d
   */
  function handleMouseClick(e, d) {

    const target = d3.select(this);
    const countryName = d.properties.name;

    // Toggle the fill color of the clicked country
    if (target.style("fill") === "black") {
      target.style("fill", "");
      // Remove the clicked country from the list of selected countries
      selectedCountries = selectedCountries.filter((country) => country !== countryName);
    } else {
      target.style("fill", "black");
      // Add the clicked country to the list of selected countries
      selectedCountries.push(countryName);
    }

    // Update the list of selected countries in the HTML
    d3.select("#selected-countries")
      .selectAll("li")
      .data(selectedCountries)
      .join("li")
      .text((d) => d);
  }

  // Get the selected country name and update the list of selected countries
  let currentCountry = d3.select('#worldmap .info').text("");
  d3.selectAll("path")
    .on("click", function (e, d) {
      handleMouseClick.call(this, e, d);
      currentCountry.text(selectedCountries.join(", "));
    });


  d3.selectAll("path")
    .transition()
    .duration(1000)
    .attr("fill", function (d) {
      const countryName = d.properties.name;
      const covidDataRow = covidData.get(countryName);
      if (covidDataRow) {
        return colorScale(covidDataRow.total_cases_per_million);
      } else {
        return "grey";
      }
    });



});
