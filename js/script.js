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


let covidData = new Map(); // create a new Map object to store population data for each country
let covidData2 = new Map();// each new map need a duplicate of this

const colorScale = d3.scaleThreshold() // create a new threshold color scale
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range("yellow", "red");

Promise.all([
  d3.json("/data/geo.json"), // load the geojson file that contains the geographic data for the countries of the world
  d3.csv("/data/test.csv", function (d) {
    //covidData.set(d.country, +d.date, +d.cases) // create Map object
    //console.log(covidData)
  })]).then(function (loadData) {

    let geoData = loadData[0]; // get the geographic data for the countries of the world(ie the first dataset)
    let cdata = loadData[1];
    console.log(cdata)

    // Draw the map
    svg.append("g")
      .selectAll("path")
      .data(geoData.features)
      .join("path")
      .attr("d", path.projection(projection))
      .attr("fill", function (d) { return colorScale(covidData.get(d.id)) })
      .on("click", handleMouseClick); // add mouse click event on world map

    // Define an empty array to store the selected countries
    let selectedCountries = [];

    /**
     * Mouseclick event
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


  });

