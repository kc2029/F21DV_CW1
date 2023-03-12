d3.select("#start-transitionBar").on("click", bar);

// Create close button element
const closeButton = document.createElement("button");
closeButton.textContent = "Close";
barChart.appendChild(closeButton); //add the button to barChart

// Add event listener to close button
closeButton.addEventListener("click", () => {
  barChart.style.display = "none";
});

//drag and pan event
const chart = document.getElementById("barChart");
let isDragging = false;
let startX, startY, translateX, translateY;

chart.addEventListener("mousedown", (e) => {
  isDragging = true;
  startX = e.clientX;
  startY = e.clientY;
  translateX = parseFloat(
    window.getComputedStyle(chart).getPropertyValue("transform").split(", ")[4]
  );
  translateY = parseFloat(
    window.getComputedStyle(chart).getPropertyValue("transform").split(", ")[5]
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

let selectedLines = null;

function bar() {
  // const tooltip = d3.select("body")
  //   //d3.select("body")
  //   .append("div")
  //   .style("opacity", 0)
  //   .attr("class", "tooltip")
  //   .style("background-color", "black")
  //   .style("border", "solid")
  //   .style("border-width", "100px")
  //   .style("border-radius", "50px")
  //   .style("padding", "20px")

  const mousemove = function (event, d) {
    // tooltip
    //   .html(`The exact value ofsdss`)
    //   .style("left", (event.x) / 2 + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
    //   .style("top", (event.y) / 2 + "px")
  };

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
    "Below is a line chart showing the total death from covid"
  );

  const svg = d3.selectAll("#barChart");
  d3.select("#barChart svg").remove();

  //Get the selected country and save as array
  let currentC = d3.select("#worldmap .info").text().trim();
  let countrylist = currentC.split(",").map((d) => d.trim());

  d3.csv("/data/CovidRate.csv").then((data) => {
    names = countrylist;
    console.log(countrylist);
    console.log("name " + typeof countrylist);
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
        console.log(`The maximum total deaths in ${country} is ${maxDeaths}`);
      });
      console.log("soup" + d3.max(maxV));

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

    // Create a color scale for the lines
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    let selectedLines = "";
    console.log("export" + selectedLines);
    // Loop through each name and add the line to the chart
    names.forEach((name, i) => {
      const nameData = data.filter((d) => d.location === name);
      const line = d3
        .line()
        .x((d) => xScale(d.date))
        .y((d) => yScale(+d.total_deaths));

      //
      svg.append("text").attr("class", "tooltipLine").style("opacity", 0);

      //
      svg
        .append("path")
        .datum(nameData)
        .attr("id", "lineChart")

        .attr("fill", "none")
        .attr("stroke", colorScale(i))
        .attr("stroke-width", 1.5)
        .attr("d", line)
        //.attr("text-anchor", function(d) { return (name)})
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

          d3.select("#" + name.replace(/\s+/g, "_")) //country with space in between doesnt work
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
            .text(name + " Total death " + m);
        })
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave);

      const lastDataPoint = nameData[nameData.length - 1];
      // const MaxD2 = d3.max(
      //   nameData.filter((d) => d.location === lastDataPoint.location),
      //   (d) => d.total_deaths
      // ); // calculate the maximum value of `total_deaths` only for the rows corresponding to `lastDataPoint.location`
      // console.log(MaxD2);

      svg
        .append("text")
        .attr("x", xScale(lastDataPoint.date) + 5) // X-coordinate is XScale(date)
        .attr("y", yScale(lastDataPoint.total_deaths))
        // X-coordinate is yScale(total_Death)
        .attr("font-size", "12px")
        .text(name);
    });
  });

  //text()
}

// function hey(va){
//   const cou = va
// console.log("jesus "+cou)
// }

// function text(){
//   worldMap
//   .style("fill", "black")
// }
