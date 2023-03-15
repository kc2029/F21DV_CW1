let worldMap;


/**
 * create a global function to add shake animation to text box
 */
window.showButtonInfo = function () {
  var buttonInfo = document.getElementById("buttonInfo");
  buttonInfo.classList.add("shake-animation"); // add class to trigger animation
  buttonInfo.style.display = "block";

  // remove class after animation completes
  setTimeout(function () {
    buttonInfo.classList.remove("shake-animation");
  }, 500);
};




const dateInput = document.getElementById('date-input');
const selectBtn = document.getElementById('select-btn');
const dateSlider = document.getElementById('date-slider');



let intervalID;
var weeklyFunctionDisabled = false;




// The svg
const svg = d3.select("#worldmap g.map"), //select the world map class
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const path = d3.geoPath(); // create a new path generator
const projection = d3
  .geoMercator() // create a new Mercator projection
  .scale(200)
  .center([0, 0])
  .translate([630, 700]); //offset

//tooltips
const rect = document.getElementById("textBox");
console.log(rect);

//Data loading
////////////////////////////////////////////////////////////////////////////////////////////
Promise.all([
  d3.json("https://raw.githubusercontent.com/kc2029/F21DV_CW1/main/data/geo.json"), // load the geojson file
  d3.csv("https://raw.githubusercontent.com/kc2029/F21DV_CW1/main/data/total_deaths_per_million.csv"), // load the CSV file that contains COVID-19 data for each country
  d3.csv("https://raw.githubusercontent.com/kc2029/F21DV_CW1/main/data/weekly_deaths_per_million.csv"),
]).then(function (loadData) {
  // load the datasets into variables
  let geoData = loadData[0];
  let totalDeath = loadData[1];
  let cases__million = loadData[2];

  //sort the geoData
  const sortedGeo = geoData.features.sort((a, b) =>
    d3.ascending(a.properties.name, b.properties.name)
  );



  svg
    .append("foreignObject")
    .attr("width", "500px")
    .attr("height", "100px")
    .attr("y", "40px")
    .attr("x", "1420px")
    .attr("class", "mapTextBox")
    .append("xhtml:div")
    // .transition()
    // .duration(2000)

    .style("opacity", 0);

  /**
   * enter text into above foreignObject
   * @date 12/03/2023 - 19:57:04
   *
   * @param {*} text
   */
  function updateTextBox(text) {
    svg.select(".mapTextBox > div").style("opacity", 1).html(text);
    const divHeight = svg
      .select(".mapTextBox > div")
      .node()
      .getBoundingClientRect().height; //return DOMRect which has info on size
    svg.select(".mapTextBox").attr("height", divHeight * 2);
  }

  //introduction
  let p0 =
    "Please click one of the green button above to procced," +
    "<br><br> 'Weekly Case' display changing cases over time" +
    "<br><br> 'Last Total death' display color graph representing the lastest weekly death toll" +
    "<br><br> 'Compare country' Select the country you want to compare total death of each country over time" +
    "<br><br> 'Total Death vs Vaccine rate' perform cluster anaylysis base on countries Total Death vs Vaccine rate " +
    "<br><br> Double click a country to bring up summary detail of selected country";
  updateTextBox(p0);

  //append svg for the background
  svg
    .append("rect")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("class", "seaBG")
    .attr("fill", "var(--seaColor)");

  //make sure text box is top
  svg.select(".mapTextBox").raise();

  // Draw the map
  svg
    .append("g")
    .selectAll("path")
    .data(sortedGeo)
    .join("path")
    .attr("d", path.projection(projection))
    .attr("id", function (d) {
      return d.properties.name.replace(/\s+/g, "_");
    })
    .attr("class", function (d) {
      return "country";
    })
    .attr("fill", "")
    .on("click", handleMouseClick);

  /**
   * Handle what happen when you click on the map
   * @date 12/03/2023 - 19:58:44
   *
   * @param {*} e
   * @param {*} d
   */
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

    if (e.detail === 2) {
      detailCountry(countryName);

      // Add your desired behavior here
    }
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
    showButtonInfo()
    clusterInfo.style.display = "none";
    buttonInfo.style.display = "block";
    document.getElementById("barChart").style.display = "none";

    document.querySelector("#textBox").style.display = "block";

    //find max total death to use in color scale
    let latestDeath = totalDeath[totalDeath.length - 1]; //load the CSV and get last row
    let index = totalDeath.length - 1; //get index of last row
    let deathValues = Object.values(latestDeath) //ignore first two column(date and world) and sort
      .slice(2)
      .sort((a, b) => a - b); //sort acscending

    let maxTotalDeath = d3.max(deathValues);

    //scale color base
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

    d3.select("#buttonInfo").text(
      "This Chart display the latest total death per millions from Covid," +
      "The globally the max death per million is " +
      Math.round(maxTotalDeath) +
      ". Interestingly, while majority of country share similar value except those in Africa and Asia," +
      " This could be African countries is under reported as they dont have the means to keep a proper record"
    );
    createLegend(svg, colorScale);
    // console.log(totalDeath)
  }

  /**
   * Function that update the map color everyday
   * @date 12/03/2023 - 19:52:47
   */
  function weeklyCasesMillion() {
    showButtonInfo()
    clusterInfo.style.display = "none";
    buttonInfo.style.display = "block";
    document.getElementById("barChart").style.display = "none";

    //summary text
    d3.select("#buttonInfo").html(
      "Below is a time series graph depicting the weekly cases "
    );

    //set up text paragraph for textbox

    let p1 =
      "First detected in China, On the left is a time series graph depicting the weekly cases " +
      "per million of each country to illustrate the spread of the " +
      "virus over the globe and how well each country deals with the virus spread based on the scaled colour." +
      "<br>" +
      "<br>  When the record first began at Janury 2020, Cases was relatively low, with US, africa countries and Russia leading in cases.";

    let p2 =
      "Cases remain relatively low and stable likely due to lockdown, but at around 2020 November there is explosion of" +
      "case especially in the upper hemeisphere. this is likely due to winter where we stay togehter indoor and the more infectious Beta variant";

    let p3 =
      "Cases exploded again due to the even more infectious delta variant at around winter 2021, but lower till around the end of 2021," +
      "where case exploded again due to even more infectious Omicron variant is detected  ";

    let p4 =
      "However due to the much less serve nature of Omicron and effectiness vaccine in preventing serverc conplication , Most country stop testing and recording at around summer 2022" +
      "So even though it appear overed, we have no way of know how wide spead covid currently is";

    //updateTextBox(p1)
    console.log(p1);

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

    const colorScale = palette(0, quantile);

    // Group the data by date
    const gData = d3.group(loadData[2], (d) => d.date);

    function selectDate(day) {


      //colour map by smatching date
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

    let defaultDate = "2020-01-15";
    let dateObj = new Date(defaultDate);
    const today = new Date("2023-02-21"); //make a function to get latest date instead

    /**
     * increment the date from defaultDate, each day updating the colour of the map
     * by calling the selectDate()
     * @date 11/03/2023 - 22:17:58
     */
    function incrementDate() {
      if (weeklyFunctionDisabled) {
        return; // exit function if weekly function is disabled
      }
      while (dateObj < today) {
        setTimeout(incrementDate, 10);
        dateObj.setDate(dateObj.getDate() + 1);

        const dateStr = dateObj.toISOString().slice(0, 10); // convert back to string
        if (dateStr === "2020-01-20") {
          updateTextBox(p1);
        }
        if (dateStr === "2020-10-15") {
          updateTextBox(p2);
        }
        if (dateStr === "2021-10-15") {
          updateTextBox(p3);
        }
        if (dateStr === "2022-01-15") {
          updateTextBox(p4);
        }

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

    //remove every legend at the start of function
    svg.selectAll(".legend").remove();

    const legendContainer = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(5,680)");

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

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  countryChart.appendChild(closeButton);

  /**
   * Generate detail country data graph on double click
   * @date 13/03/2023 - 10:42:21
   *
   * @param {*} Dcountry
   */
  function detailCountry(Dcountry) {
    clusterInfo.style.display = "none";

    countryChart.style.display = "block";

    d3.selectAll("path").style("fill", "var(--mapDefaultColor)");

    // Add event listener to close button
    closeButton.addEventListener("click", () => {
      countryChart.style.display = "none";
    });

    let DDcountry = Dcountry;

    d3.selectAll("#" + DDcountry.replace(/\s+/g, "_")).style("fill", "black");

    console.log(DDcountry);

    d3.csv("https://raw.githubusercontent.com/kc2029/F21DV_CW1/main/data/lastDataRecord.csv").then((data) => {
      const ddCountryData = data.filter((d) => d.location === DDcountry);
      const geoCountry = geoData.features.filter(
        (feature) => feature.properties.name === DDcountry
      );

      const total_cases = ddCountryData.map((d) => d.total_cases);
      const total_cases_per_million = ddCountryData.map(
        (d) => d.total_cases_per_million
      );
      const total_deaths = ddCountryData.map((d) => d.total_deaths);
      const total_deaths_per_million = ddCountryData.map(
        (d) => d.total_deaths_per_million
      );
      const icu_patients_per_million = ddCountryData.map(
        (d) => d.icu_patients_per_million
      );
      const hosp_patients_per_million = ddCountryData.map(
        (d) => d.hosp_patients_per_million
      );
      const total_tests_per_thousand = ddCountryData.map(
        (d) => d.total_tests_per_thousand
      );
      const total_vaccinations_per_hundred = ddCountryData.map(
        (d) => d.total_vaccinations_per_hundred
      );
      const people_vaccinated_per_hundred = ddCountryData.map(
        (d) => d.people_vaccinated_per_hundred
      );
      const human_development_index = ddCountryData.map(
        (d) => d.human_development_index
      );
      const stringency_index = ddCountryData.map((d) => d.stringency_index);
      const gdp_per_capita = ddCountryData.map((d) => d.gdp_per_capita);

      //set up svg
      const margin = { top: 10, right: 10, bottom: 100, left: 80 };
      const width = 900 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;

      // Remove existing SVG container
      d3.select("#countryChart svg").remove();

      const svgID = `countryChart-${DDcountry}-svg`;

      // Create the SVG container
      console.log(svgID)

      let svg = d3
        .select("#countryChart")
        // .attr("id", `#${svgID}`)
        // .attr("class", "countryC")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("id", `#${svgID}`)
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      // svg
      //   .append("svg")
      //   //.attr("class", "countryC")
      //   .attr("id", `#${svgID}`)
      //   .attr("width", 500)
      //   .attr("height", 500)
      //   .attr("fill", "red")
      //   .append("g");
      //.attr("transform", `translate(${margin.left}, ${margin.top})`);

      svg
        .append("text")
        .attr("x", 300)
        .attr("y", 90)
        .style("font-weight", "bold")
        .style("font-size", "32px")
        .style("text-decoration", "underline")

        .text(`Summary data on Covid-19`);

      svg
        .append("text")
        .attr("x", 20)
        .attr("y", 25)
        .style("font-weight", "bold")
        .style("font-size", "45px")
        .text(DDcountry);

      // Define an array of variable names
      const variables = [
        "total_cases",
        "total_deaths",
        "total_tests_per_thousand",
        "total_cases_per_million",
        "total_deaths_per_million",
        "icu_patients_per_million",
        "hosp_patients_per_million",
        "total_vaccinations_per_hundred",
        "people_vaccinated_per_hundred",
        "human_development_index",
        "stringency_index",
        "gdp_per_capita",
      ];

      variables.forEach((variable, index) => {
        const value = ddCountryData[0][variable] || "No record"; //if empty no record
        const formatt = variable
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());

        svg
          .append("text")
          .attr("x", 300)
          .attr("y", 150 + index * 30)
          .style("font-weight", "bold")
          .style("font-size", "28px")
          .text(`${formatt}: ${value}`);
      });

      //project country
      const projection = d3.geoMercator().fitSize([250, 250], geoCountry[0]);

      svg

        .append("g")
        .attr("x", 130)
        .attr("y", 150)
        .selectAll("path")
        .data(geoCountry)
        .join("path")
        .attr("d", path.projection(projection))
        .attr("transform", "translate(10, 150)")
        .style("fill", "var(--mapDefaultColor)");

      console.log(projection);
    });
  }

  // add event listener to slider element
  document.getElementById("date-slider").addEventListener("input", disableWeeklyFunction);

  // add event listener to date select button
  document.getElementById("select-btn").addEventListener("click", disableWeeklyFunction);

  // function to disable weeklyCasesMillion() function
  function disableWeeklyFunction() {
    clearInterval(intervalID); // clear the interval used in weeklyCasesMillion() function
    weeklyFunctionDisabled = true; // set a variable to indicate that the weekly function is disabled
  }


  // Event listeners for the date selection
  selectBtn.addEventListener('click', () => {
    const bDate = dateInput.value;
    selectDate(bDate);
  });

  dateSlider.addEventListener('input', () => {
    const sliderValue = parseInt(dateSlider.value);
    const startDate = new Date('2020-01-15');
    const selectedDate = new Date(startDate.getTime() + sliderValue * 7 * 24 * 60 * 60 * 1000);
    const bDate = selectedDate.toISOString().split('T')[0];
    selectDate(bDate);
  });

  /**
   * Color scale the map base on the date entered
   * @date 15/03/2023 - 08:46:59
   *
   * @param {*} day
   */
  function selectDate(day) {
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

    d3.select("#worldmap .displayDate").text(day);
    const colorScale = palette(0, quantile);
    const gData = d3.group(loadData[2], (d) => d.date);
    const selectedData = gData.get(day);

    createLegend(svg, colorScale);
    svg
      .selectAll('path')
      .transition()
      .duration(90)
      .style('fill', (d) => {
        const cases = selectedData[0][d.properties.name];
        if (cases) {
          return colorScale(cases);
        } else {
          return '#ccc';
        }
      });
  }

  // Initial map display
  //selectDate('2020-01-15');

  // Handle button click event
  d3.select("#start-transition").on("click", weeklyCasesMillion);
  d3.select("#start-transition2").on("click", latestDeathMillion);
});

//export { geoData };
