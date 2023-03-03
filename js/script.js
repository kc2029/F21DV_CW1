
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




//Data loading
////////////////////////////////////////////////////////////////////////////////////////////
Promise.all([
  d3.json("./data/geo.json"),// load the geojson file
  d3.csv("./data/test3.csv"),// load the CSV file that contains COVID-19 data for each country
  d3.csv("https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/cases_deaths/biweekly_cases_per_million.csv")
]).then(function (loadData) {

  // load the datasets

  let geoData = loadData[0];
  let mainData = d3.group(loadData[1].filter(d => !d.iso_code.includes("OWID")), d => d.location);
  let cases__million = loadData[2];



  const maxValue = d3.max(loadData[1], d => +d.total_cases_per_million);
  const colorScale = d3.scaleSequential()
    .domain([0, d3.max(loadData[1], d => +d.total_cases_per_million)])
    .interpolator(d3.interpolateReds);


  const sortedGeo = geoData.features.sort((a, b) => d3.ascending(a.properties.name, b.properties.name));

  // sortedGeo.forEach((d) => {
  //   console.log(d.properties.name);
  // });



  svg.append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "var(--seaColor)");

  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(sortedGeo)
    .join("path")
    .attr("d", path.projection(projection))
    // fill color based on cases
    .attr("fill", "")
    .on("click", handleMouseClick);







  /**
   * Mouseclick event
   */
  function handleMouseClick(e, d) {

    const target = d3.select(this);
    const countryName = d.properties.name;

    // Toggle the fill color of the clicked country
    if (target.style("fill") === "black") {  //If country is already black
      target.style("fill", ""); //return the default color
      selectedCountries = selectedCountries.filter((country) => country !== countryName);
      //remove country from the array of selected country with filter method
    } else {
      target.style("fill", "black");
      selectedCountries.push(countryName);//if not add the country name into the array
    }

    // Update the list of selected countries in the HTML
    d3.select("#selected-countries")
      .selectAll("li")
      .data(selectedCountries)
      .join("li")
      .text((d) => d);
  }

  // Define an empty array to store the selected countries
  let selectedCountries = [];
  // Get the selected country name and update the list of selected countries
  let currentCountry = d3.select('#worldmap .info').text("");

  d3.selectAll("path")
    .on("click", function (e, d) {
      handleMouseClick.call(this, e, d);
      currentCountry.text(selectedCountries.join(", "));
    });





  function latestCasesMillion() {
    // Set the initial fill color of each country based on the current data
    svg.selectAll("path")
      .style("fill", "")
      .transition()
      .duration(3000)

      .style("fill", (d) => {
        const countryData = mainData.get(d.properties.name);


        if (countryData) {
          const lastData = countryData[countryData.length - 1];

          return colorScale(+lastData.total_cases_per_million);
        } else {
          return "";
        }

      })
  }



  function weeklyCasesMillion() {

    //finding 95th quantile
    const n = cases__million.map(d => Object.values(d).slice(2).map(val => +val));
    const q = n.flat()  //convert from object array to flat array
    q.sort((a, b) => a - b)
    const index = Math.round((q.length - 1) * 0.95 + 1)  //find 95th index
    let quantile = Math.round(q[index])
    console.log(quantile)

    //color scale base on the 95th quantile to avoid skewed scale with outlier
    const colorScale = d3.scaleLinear()
      .domain([0, quantile])
      .range(["white", "red"])



    // Group the data by date
    const gData = d3.group(loadData[2], d => d.date);




    function selectDate(day) {
      const selectedData = gData.get(day);
      // console.log(typeof day)
      d3.select('#worldmap .displayDate').text(day)

      svg.selectAll("path")
        .style("fill", "white")// Set the initial fill color of each country based on the current data
        .transition()
        .duration(200)
        .style("fill", (d) => {
          //console.log(selectedData[1][0])
          const cases = selectedData[0][d.properties.name];
          if (cases) {
            return colorScale(cases);
          } else {
            //how to
          }
        });
    }

    let defaultDate = "2021-01-15"
    let dateObj = new Date(defaultDate);
    const today = new Date("2023-02-21"); //make a function to get latest date instead


    function incrementDate() {
      while (dateObj < today) {
        setTimeout(incrementDate, 100)
        dateObj.setDate(dateObj.getDate() + 1);
        return selectDate(dateObj.toISOString().slice(0, 10)); //convert back to string
      }
    }
    incrementDate()


    // Legend here
    const LegendSvg = d3.select('.legend')



    // Append a black rectangle to the SVG
    svg.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 100)
      .attr('height', 300)
      .attr('fill', 'black')
      .attr("transform", "translate(800,300)");








  }

  // Handle button click event
  d3.select("#start-transition").on("click", weeklyCasesMillion);
  d3.select("#start-transition2").on("click", latestCasesMillion);



});


