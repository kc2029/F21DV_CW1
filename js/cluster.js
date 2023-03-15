d3.select("#start-transitionCluster").on("click", cluster);


//initial state, decide if cluster() run or not by button press
let chartGenerated = false;

// Create close button element
const closeButtonCluster = document.createElement("button");
closeButtonCluster.textContent = "Close";
closeButtonCluster.style.width = "60px";
closeButtonCluster.style.height = "30px";
clusterChart.appendChild(closeButtonCluster); //add the button to cluster Chart

// Add event listener to close button
closeButtonCluster.addEventListener("click", () => {
  clusterChart.style.display = "none";
});

//Button to enable brush
const selectmultiCluster = document.createElement("button");
selectmultiCluster.textContent = "Brush select";
selectmultiCluster.style.width = "100px";
selectmultiCluster.style.height = "30px";
selectmultiCluster.style.float = "right";

clusterChart.appendChild(selectmultiCluster);

// Select the chart and define variables
const chartc = document.getElementById("clusterChart");
let isDraggingc = false;
let startXc, startYc, translateXc, translateYc;

// Add event listeners for mouse events
chartc.addEventListener("mousedown", (e) => {
  isDraggingc = true;
  startXc = e.clientX - translateXc;
  startYc = e.clientY - translateYc;
});

chartc.addEventListener("mouseup", () => {
  isDraggingc = false;
});

chartc.addEventListener("mousemove", (e) => {
  if (!isDraggingc) return;
  e.preventDefault();
  translateXc = e.clientX - startXc;
  translateYc = e.clientY - startYc;
  chartc.style.transform = `translate(${translateXc}px, ${translateYc}px)`;
});

/**
 * Generate the cluster Chart
 * @date 12/03/2023 - 14:03:00
 */
function cluster() {


  // Get the #clusterInfo element
  const clusterInfo = document.querySelector("#clusterInfo");

  // Display require element when function called
  clusterInfo.style.display = "block";
  buttonInfo.style.display = "none";

  clusterChart.style.display = "block";

  //if no chart generated then generate cluster chart
  if (!chartGenerated) {
    //display the cluster chart SVG
    document.getElementById("clusterChart").style.display = "block";

    //load the require csv
    d3.csv("https://raw.githubusercontent.com/kc2029/F21DV_CW1/main/data/lastDataRecord.csv").then((data) => {
      let da = data;
      let pointz = []; // initialise empty array to hold points of each country
      //convert it to a easier to work with form for scatter
      data.forEach((d) => {
        pointz.push({
          x: d.total_deaths_per_million,
          y: d.people_vaccinated_per_hundred,
          continent: d.continent,
          country: d.location,
          ct: 0, //Math.floor(Math.random() * 3), doesnt matter, get reassigned
        });
      }); //example array {x: '1265.165', y: '47.35', continent: 'Europe', country: 'Albania'}

      //remove all non valid points with empty value
      points = pointz.filter((point) => point.x !== "" && point.y !== "");

      //Assign initial centriods
      let centroids = [
        [1200, 100],
        [30, 50],
        [100, 20],
      ];

      //console.log to keep track of iteration if needed
      let iteration = 0;

      function kmeanIterate() {
        iteration++;

        // Get eculidean distance(ED) of each point to first centriod
        for (let i = 0; i < points.length; i++) {
          let d = Math.abs(
            (points[i].x - centroids[0][0]) ** 2 +
            (points[i].y - centroids[0][1]) ** 2
          );

          //assign centriod to each point
          points[1].ct = 0; // nearest

          //compare for the second to third centriod's ED
          for (let k = 1; k < centroids.length; k++) {
            let dn = Math.abs(
              (points[i].x - centroids[k][0]) ** 2 +
              (points[i].y - centroids[k][1]) ** 2
            );
            if (dn < d) {
              //reassign centriod depending on ED
              d = dn;
              points[i].ct = k;
            }
          }
        }

        // update centroids, for k(0,1,2)
        for (let k = 0; k < centroids.length; k++) {
          //initialise variable
          let dsum_x = 0;
          let dsum_y = 0;
          let dcount = 0;

          //get new centriod for each cluster  by averge coordinate of all the points
          for (let i = 0; i < points.length; i++) {
            if (points[i].ct === k) {
              dsum_x += Number(points[i].x);
              dsum_y += Number(points[i].y);
              dcount++;
            }
          }
          if (dcount > 0) {
            centroids[k][0] = dsum_x / dcount;
            centroids[k][1] = dsum_y / dcount;
          }
        }

        //append new centriod postion on graph
        svg
          .selectAll(".centroid")
          .data(centroids)
          .attr("r", "20")
          .style("stroke", "black") // set the stroke color to black
          .style("stroke-width", "5px")
          .attr("cx", (d) => {
            return x(d[0]);
          })
          .attr("cy", (d) => {
            return y(d[1]);
          });

        //change point color base on centriod

        svg
          .selectAll(".point")
          .data(points)
          .style("fill", (d) => {
            return ["blue", "green", "orange"][d.ct];
          });
      }

      // end one iteration of the clustering

      //set up svg
      const margin = { top: 10, right: 10, bottom: 100, left: 80 };
      const width = 900 - margin.left - margin.right;
      const height = 600 - margin.top - margin.bottom;

      // return colour base on continent
      const color = d3
        .scaleOrdinal()
        .domain([
          "Asia",
          "Europe",
          "Africa",
          "North America",
          "South America",
          "Oceania",
        ])
        .range(["red", "blue", "green", "purple", "black", "yellow"]);

      //set up SVG
      let svg = d3
        .select("#clusterChart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

      //set up x axis
      const x = d3
        .scaleLinear()
        .domain([0, d3.max(points, (d) => +d.x)])
        .range([0, width]);
      svg
        .append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

      // Add Y axis
      const y = d3
        .scaleLinear()
        .domain([0, d3.max(points, (d) => +d.y)])
        .range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      // Add X axis label:
      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("x", width / 2 + margin.left)
        .attr("y", height + margin.top + 50)
        .style("font-weight", "bold")
        .style("font-size", "25")

        .text("Total number of death per millions");

      // Y axis label:
      svg
        .append("text")
        .attr("text-anchor", "end")
        .attr("transform", "rotate(-90)")
        .attr("y", -margin.left + 30)
        .attr("x", -margin.top - height / 2 + 250)
        .style("font-weight", "bold")
        .style("font-size", "25")
        .text("Total vaccination per 100 (include boosters)");

      svg
        .selectAll(".centroid")
        .data(centroids)
        .enter()
        .append("circle")
        .attr("class", "centroid")
        .style("stroke", "gray")
        .style("fill", (d, i) => {
          return ["blue", "green", "orange"][i];
        })
        .attr("r", 10)
        .attr("cx", (d) => {
          return x(d[0]);
        })
        .attr("cy", (d) => {
          return y(d[1]);
        })
        .on("mouseover", function (event, d, i) {
          //brush();
          // reset the fill color of all points to their original color
          svg.selectAll(".point").style("fill", (d) => {
            return color(d.continent);
          });
        })
        .on("mouseout", function (event, d, i) {
          svg.selectAll(".point").style("fill", (d) => {
            return ["blue", "green", "orange"][d.ct];
          });
        });

      svg
        .selectAll(".point")
        .data(points)
        .enter()
        .append("circle")
        .attr("class", "point")
        .style("stroke", "gray")
        .style("fill", "gray")
        .attr("r", 5)
        .attr("cx", (d) => {
          return x(d.x);
        })
        .attr("cy", (d) => {
          return y(d.y);
        })
        .style("fill", function (d) {
          return color(d.continent);
        }); //colour in point base on continent

      // Append a title label to the chart
      svg
        .append("text")
        .attr("x", width - 120)
        .attr("y", margin.top / 2 + 20)
        .attr("text-anchor", "middle")
        .style("font-size", "24px")
        .text("  \u2757 Hover over centriod to show continent");

      //define legend
      const legend = svg.append("g").attr("transform", "translate(780,300)");

      // create legend
      const legendItems = legend
        .selectAll(".clegend")
        .data(color.domain())
        .enter()
        .append("g")
        .attr("class", "clegend")
        .attr("transform", (d, i) => `translate(-2, ${i * 22 - 66})`);

      legendItems
        .append("rect")
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", color);

      legendItems
        .append("text")
        .attr("x", 18 + 4)
        .attr("y", 18 - 4)
        .text(function (d) {
          return d;
        });

      for (let i = 0; i < 20; i++) {
        setTimeout(() => {
          kmeanIterate();
          //console.log("iteration" + i)
        }, i * 100);
      }

      function brush() {
        // Define brush function for selecting points
        const brush = d3
          .brush()
          .extent([
            [0, 0],
            [width, height],
          ])
          .on("end", brushed);

        // Add brush to chart
        svg.append("g").attr("class", "brush").call(brush);

        function brushed(event) {
          // Get selected area
          const selection = event.selection;
          console.log(selection);

          // If no selection, return
          if (!selection) {
            d3.selectAll(".country").style("fill", "");

            return;
          }

          // Get points within selection
          const selectedPoints = points.filter((point) => {
            const cx = x(point.x);
            const cy = y(point.y);

            return isBrushed(selection, cx, cy);
          });

          // Get continents of selected points
          const selectedC = selectedPoints.map((point) => point.country);

          selectedC.forEach((d) => {
            d3.select("#" + d.replace(/\s+/g, "_")).style("fill", "black");
          });

          // Log selected continents
          console.log(selectedC);
        }

        function isBrushed(brush_coords, cx, cy) {
          const x0 = brush_coords[0][0];
          const x1 = brush_coords[1][0];
          const y0 = brush_coords[0][1];
          const y1 = brush_coords[1][1];

          return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
        }
      }

      selectmultiCluster.addEventListener("click", () => {
        //svg.selectAll(".centroid").remove();

        brush();
      });
    });
  }
  chartGenerated = true;
}
