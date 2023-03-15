d3.select("#start-transitionBar").on("click", lineChart);

// Create close button
const closeButton = document.createElement("button");
closeButton.textContent = "Close";
barChart.appendChild(closeButton); //add the button to barChart

// Add event listener to close button
closeButton.addEventListener("click", () => {
  barChart.style.display = "none";
});

//enable pan function with element ID as input
function pan(chartID) {
  const chart = document.getElementById(chartID);
  //  const linePan = document.getElementById("linePan");

  let isDragging = false;
  let startX, startY, translateX, translateY;

  chart.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    translateX = parseFloat(
      window
        .getComputedStyle(chart)
        .getPropertyValue("transform")
        .split(", ")[4]
    );
    translateY = parseFloat(
      window
        .getComputedStyle(chart)
        .getPropertyValue("transform")
        .split(", ")[5]
    );
  });

  chart.addEventListener("mousemove", (e) => {
    if (isDragging) {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;

      chart.style.transform = `translate(${translateX + deltaX}px, ${translateY + deltaY
        }px)scale(0.6)`;
    }
  });

  chart.addEventListener("mouseup", () => {
    isDragging = false;
  });
}

//which chart to enable
pan("barChart");
pan("countryChart");

let selectedLines = null;

/**
 * Description placeholder
 * @date 12/03/2023 - 13:54:36
 */
function lineChart() {
  showButtonInfo();
  clusterInfo.style.display = "none";
  buttonInfo.style.display = "block";
  const mousemove = function (event, d) { };

  const mouseover = function (event, d) {
    //  tooltipLine
    //   .style("opacity", 1)
  };
  // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
  const mouseleave = function (event, d) {
    setTimeout(function () {
      d3.selectAll(".tooltipLine").style("opacity", 0);
    }, 1000);
  };

  document.getElementById("barChart").style.display = "block";

  // add code to create and update the bar chart here

  d3.select("#buttonInfo").text(
    "Select all the country you wish to compare to see how they fared againest Coivd-19. " +
    "For example comparing UK to other close by European country would be a good comparision due to similarity in both location, wealth and population" +
    "you can also hover over the line to see the total death number and where the country is on the world map"
  );

  const svg = d3.selectAll("#barChart");
  d3.select("#barChart svg").remove();

  //Get the selected country and save as array
  let currentC = d3.select("#worldmap .info").text().trim();
  let countrylist = currentC.split(",").map((d) => d.trim());

  d3.csv(
    "https://raw.githubusercontent.com/kc2029/F21DV_CW1/main/data/CovidRate.csv"
  ).then((data) => {
    names = countrylist;
    //console.log(countrylist);
    //console.log("name " + typeof countrylist);
    //names = ['China', 'Russia', 'United States', 'Canada', 'United Kingdom'] //for testing

    const margin = { top: 10, right: 10, bottom: 100, left: 80 };
    const width = 900 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3
      .select("#barChart")
      .append("svg")
      .attr("class", "lineC")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")

      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Define the date parsing function
    const parser = d3.timeParse("%Y-%m-%d");

    // Parse the date values
    data.forEach((d) => {
      d.date = parser(d.date);
    });

    // Create the x-axis scale
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => d.date))
      .range([0, width]);

    function ydomain() {
      const maxV = [];
      names.forEach((country) => {
        //filter data so it only store selected country and it total_deaths
        const filteredData = data.filter(
          (d) => d.location === country && d.total_deaths !== ""
        );
        //Find max death if each country selected
        const maxDeaths = Math.max(
          ...filteredData.map((d) => Number(d.total_deaths))
        );
        maxV.push(maxDeaths); //store each value in an array
        //console.log(`The maximum total deaths in ${country} is ${maxDeaths}`);
      });
      //console.log("soup" + d3.max(maxV));

      return d3.max(maxV); //return max value of array
    }
    ydomain();

    // Create the y-axis scale
    const yScale = d3
      .scaleLinear()
      .domain([0, ydomain()]) //d3.max(data, d => +d.total_deaths)
      .range([height, 0]);

    // Create the x-axis
    const xAxis = d3.axisBottom(xScale).ticks(10);

    // Create the y-axis
    const yAxis = d3.axisLeft(yScale).ticks(10);

    // Add the x-axis to the chart
    svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);

    // Add the y-axis to the chart
    svg.append("g").call(yAxis);

    // Add X axis label:
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 50)
      .style("font-weight", "bold")
      .style("font-size", "25")

      .text("Time-Line");

    // Y axis label:
    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 30)
      .attr("x", -margin.top - height / 2 + 20)
      .style("font-weight", "bold")
      .style("font-size", "25")
      .text("Total death");

    // Create a color scale for the lines
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let selectedLines = "";
    //console.log("export" + selectedLines);
    // Loop through each name and add the line to the chart
    names.forEach((name, i) => {
      const nameData = data.filter((d) => d.location === name);
      const line = d3
        .line()
        .x((d) => xScale(d.date))
        .y((d) => yScale(+d.total_deaths));

      svg.append("text").attr("class", "tooltipLine").style("opacity", 0);

      //Draws the line, and some customisation(some in css)
      svg
        .append("path")
        .datum(nameData)
        .attr("id", "lineChart")
        .attr("fill", "none")
        .attr("stroke", colorScale(i))
        .attr("stroke-width", 1.5)
        .attr("d", line)
        //display name and deaths and highlight the line on mouseover
        .on("mouseover", function (event, d) {
          mouseover(event, d);
          // Remove the 'selected-line' class from all lines
          d3.selectAll("#barChart path").classed("selected-line", false);

          // Add the 'selected-line' class to the clicked line
          d3.select(this).classed("selected-line", true);
          selectedLines = name;
          // hey(name)
          d3.selectAll(".country").style("fill", "");

          d3.select("#worldmap > div.info").text(name);

          d3.select("#" + name.replace(/\s+/g, "_")) //country with space in between doesnt work, so need to reformat
            .style("fill", "black");

          // Get the last data point of the selected line
          var maxY = d3.max(nameData, function (d) {
            return +d.total_deaths;
          });
          var m = d3.format(".3s")(maxY).replace("G", "B");
          console.log("yup " + maxY);

          var mouse = d3.pointer(event);
          console.log(d3.pointer(event));
          svg
            .select(".tooltipLine")
            .style("opacity", 1)
            .attr("x", mouse[0] + 10)
            .attr("y", mouse[1] + 10)
            .attr("font-size", "32px")
            .attr("fill", "blue")

            .text(name + " Total death " + m);
        })
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      const lastDataPoint = nameData[nameData.length - 1];

      svg
        .append("text")
        .attr("x", xScale(lastDataPoint.date) + 5)
        .attr("y", yScale(lastDataPoint.total_deaths))
        .attr("font-size", "12px")
        .text(name);

      // Append a title label to the chart
      svg
        .append("text")
        .attr("x", width / 2 - 120)
        .attr("y", margin.top / 2 + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text("Comparison of total death of countries");
    });
  });
}
