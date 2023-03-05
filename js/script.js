// The svg
const svg = d3.select("#worldmap g.map"), //select the world map class
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const path = d3.geoPath(); // create a new path generator
const projection = d3
  .geoMercator() // create a new Mercator projection
  .scale(120)
  .center([0, 5])
  .translate([400, 400]); //offset

//Data loading
////////////////////////////////////////////////////////////////////////////////////////////
Promise.all([
  d3.json("./data/geo.json"), // load the geojson file
  d3.csv("./data/total_deaths_per_million.csv"), // load the CSV file that contains COVID-19 data for each country
  d3.csv(
    "https://raw.githubusercontent.com/owid/covid-19-data/master/public/data/cases_deaths/biweekly_cases_per_million.csv"
  ),
]).then(function (loadData) {
  // load the datasets
  let geoData = loadData[0];
  let totalDeath = loadData[1];
  //let mainData = d3.group(loadData[1].filter(d => !d.iso_code.includes("OWID")), d => d.location);
  let cases__million = loadData[2];

  const sortedGeo = geoData.features.sort((a, b) =>
    d3.ascending(a.properties.name, b.properties.name)
  );

  svg
    .append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "var(--seaColor)");

  // Draw the map
  svg
    .append("g")
    .selectAll("path")
    .data(sortedGeo)
    .join("path")
    .attr("d", path.projection(projection))
    // fill color based on cases
    .attr("fill", "")
    .on("click", handleMouseClick);

  function handleMouseClick(e, d) {
    const target = d3.select(this);
    const countryName = d.properties.name;

    // If statement to fill color of the clicked country
    if (target.style("fill") === "black") {
      target.style("fill", "");
      selectedCountries.delete(countryName);
    } else {
      target.style("fill", "black");
      selectedCountries.add(countryName); //if not add the country name into the set
    }

    // Update the list of selected countries in the HTML
    d3.select("#selected-countries")
      .selectAll("li")
      .data([selectedCountries])
      .join("li")
      .text((d) => d);
  }

  // Define an empty set to store the selected countries
  let selectedCountries = new Set();

  // Get the selected country name and update the list of selected countries
  let currentCountry = d3.select("#worldmap .info").text("");

  d3.selectAll("path").on("click", function (e, d) {
    handleMouseClick.call(this, e, d);
    currentCountry.text([...selectedCountries].join(", "));
  });

  /**
   * Color Scale taken from https://gka.github.io/palettes/#/10|s|f9f9f9,ff0000|ffffe0,ff005e,93003a|1|1
   * Color blind safe
   * @date 05/03/2023 - 13:32:41
   *
   * @param {*} min
   * @param {*} max
   * @returns {hex color}
   */
  function palette(min, max) {
    const d = (max - min) / 15;
    return d3
      .scaleThreshold()
      .range([
        "#f4f4f4",
        "#ffeb9b",
        "#ffe17c",
        "#ffd566",
        "#ffc953",
        "#ffbd43",
        "#ffb136",
        "#ffa429",
        "#ff961e",
        "#ff8714",
        "#ff780a",
        "#ff6702",
        "#ff5300",
        "#ff3900",
        "#ff0000",
      ])
      .domain([
        min + d * 1,
        min + d * 2,
        min + d * 3,
        min + d * 4,
        min + d * 5,
        min + d * 6,
        min + d * 7,
        min + d * 8,
        min + d * 9,
        min + d * 10,
        min + d * 11,
        min + d * 12,
        min + d * 13,
        min + d * 14,
      ]);
  }

  /**
   * Return the lastest total death per million and color the map accordingly
   * The color scale is based on the latest record
   * @date 05/03/2023 - 13:49:51
   */
  function latestDeathMillion() {
    d3.select("#buttonInfo").text("bye");

    let latestDeath = totalDeath[totalDeath.length - 1]; //load the CSV and get last row
    let index = totalDeath.length - 1;
    let deathValues = Object.values(latestDeath) //ignore first two column(date and world) and sort
      .slice(2)
      .sort((a, b) => a - b); //sort acscending
    //let deathValues2 = deathValues.filter((value) => value); unnessary, not quantile
    let maxTotalDeath = d3.max(deathValues);

    let colorScale = palette(0, maxTotalDeath); //return color between 0 and maxTotalDeath
    console.log(latestDeath);
    // Set the initial fill color of each country based on the current data
    svg
      .selectAll("path")
      .style("fill", "var--mapDefaultColor") //take color from CSS
      .transition()
      .duration(1000)

      .style("fill", (d) => {
        const countryData = totalDeath[index][d.properties.name]; //check if

        if (countryData) {
          return colorScale(+countryData);
        } else {
          return "";
        }
      });

    createLegend(svg, colorScale);
    // console.log(totalDeath)
  }

  /**
   *
   */
  function weeklyCasesMillion() {
    d3.select("#buttonInfo").text(
      "Below is a time series graph depicting the weekly cases " +
      "per million for each country, we can see the spread of the " +
      "virus and how well each country deals with the virus based on the colour.".trim());

    //finding 95th quantile
    const n = cases__million.map((d) =>
      Object.values(d)
        .slice(2)
        .map((val) => +val)
    );
    const q = n.flat(); //convert from object array to flat array
    q.sort((a, b) => a - b);
    const index = Math.round((q.length - 1) * 0.95 + 1); //find 95th index
    let quantile = Math.round(q[index]);
    console.log(quantile);

    //color scale base on the 95th quantile to avoid skewed scale with outlier
    // const colorScale = d3.scaleLinear()
    // .domain([0, quantile])
    // .range(["white", "red"])

    const colorScale = palette(0, quantile);

    // Group the data by date
    const gData = d3.group(loadData[2], (d) => d.date);

    function selectDate(day) {
      const selectedData = gData.get(day);
      // console.log(typeof day)
      d3.select("#worldmap .displayDate").text(day);

      svg
        .selectAll("path")
        //.style("fill", "white")// Set the initial fill color of each country based on the current data
        .transition()
        .duration(90)
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

    let defaultDate = "2021-01-15";
    let dateObj = new Date(defaultDate);
    const today = new Date("2023-02-21"); //make a function to get latest date instead

    function incrementDate() {
      while (dateObj < today) {
        setTimeout(incrementDate, 100);
        dateObj.setDate(dateObj.getDate() + 1);
        return selectDate(dateObj.toISOString().slice(0, 10)); //convert back to string
      }
    }
    incrementDate();

    createLegend(svg, colorScale); //svg is the svg element name
  }

  /**
   * Create a Legend base on color scale function "palette()"
   * by taking the range and domain as color and text of legend
   * @date 05/03/2023 - 13:26:14
   *
   * @param {*} svg
   * @param {*} colorScale
   */
  function createLegend(svg, colorScale) {
    const colorValues = colorScale.range();
    const Labels = colorScale.domain().map((d) => d3.format(".2s")(d));
    Labels.push("Over " + Labels[13]); //14th element

    svg.selectAll(".legend").remove();

    const legendContainer = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(5,280)");

    const legend = legendContainer
      .selectAll(".legend")
      .data(colorValues)
      .enter()
      .append("g")
      .attr("class", "legend");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", function (d, i) {
        return i * 20;
      })
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", function (d, i) {
        return colorValues[i];
      });

    legend
      .append("text")
      .attr("x", 25)
      .attr("y", function (d, i) {
        return i * 20 + 15;
      })
      .text(function (d, i) {
        return Labels[i];
      });

    //add the last label manually
    const lastLabelY = (Labels.length - 1) * 20;
    legendContainer
      .append("rect")
      .attr("x", 0)
      .attr("y", lastLabelY + 20) //get y coordinate
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", "var(--mapDefaultColor)");

    legendContainer
      .append("text")
      .attr("x", 25)
      .attr("y", lastLabelY + 35)
      .text("No Record");
  }

  // Handle button click event
  d3.select("#start-transition").on("click", weeklyCasesMillion);
  d3.select("#start-transition2").on("click", latestDeathMillion);
});
