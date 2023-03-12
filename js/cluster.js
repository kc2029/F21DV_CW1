d3.select("#start-transitionCluster").on("click", cluster);

function cluster() {
  d3.csv("/data/LastDataRecord.csv").then((data) => {
    let pointz = []; // initialize array to hold dots

    data.forEach((d) => {
      pointz.push({
        x: d.total_deaths_per_million,
        y: d.people_vaccinated_per_hundred,
        continent: d.continent,
        country: d.location,
        ct: 0//Math.floor(Math.random() * 3)
      });
    }); //example array {x: '1265.165', y: '47.35', continent: 'Europe', country: 'Albania'}

    //make sure no points are invalid
    points = pointz.filter((point) => point.x !== "" && point.y !== "");
    console.log(points)


    //assign centriods //make it random if we have time
    let centroids = [
      [1200, 100],
      [30, 50],
      [100, 20],
    ];
    let iteration = 0;

    function kmeanIterate() {
      iteration++;
      //console.log('step..');
      // assigned each point to the nearest centroid
      for (let i = 0; i < points.length; i++) {
        let d = Math.abs(
          (points[i].x - centroids[0][0]) ** 2 +
          (points[i].y - centroids[0][1]) ** 2
        );

        points[1].ct = 0; // nearest

        //compare for the second to third centriod
        for (let k = 1; k < centroids.length; k++) {
          let dn = Math.abs(
            (points[i].x - centroids[k][0]) ** 2 +
            (points[i].y - centroids[k][1]) ** 2
          );
          if (dn < d) {
            d = dn;
            points[i].ct = k;
          }
        }
      }

      // update centroids, for k(0,1,2)
      for (let k = 0; k < centroids.length; k++) {
        let dsum_x = 0;
        let dsum_y = 0;
        let dcount = 0;

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
      svg
        .selectAll(".centroid")
        .data(centroids)
        .attr("cx", (d) => {
          return x(d[0]);
        })
        .attr("cy", (d) => {
          return y(d[1]);
        });

      // Define the shape functions for each cluster
      // const shapes = [
      //   d3.symbol().type(d3.symbolCircle).size(190),
      //   d3.symbol().type(d3.symbolSquare).size(190),
      //   d3.symbol().type(d3.symbolTriangle).size(190)
      // ];

      svg
        .selectAll(".point")
        .data(points)
        .style("fill", (d) => {
          return ["blue", "green", "orange"][d.ct];
        })











    }
    console.log(centroids)
    // end iteration(..)

    //
    const margin = { top: 10, right: 30, bottom: 30, left: 60 },
      width = 460 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

    // Color scale: give me a specie name, I return a color
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

    let svg = d3
      .select("body")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const x = d3.scaleLinear().domain([4, 6000]).range([0, width]);
    svg
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x));

    // Add Y axis
    const y = d3.scaleLinear().domain([0, 150]).range([height, 0]);
    svg.append("g").call(d3.axisLeft(y));

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
      });

    svg
      .selectAll(".point")
      .data(points)
      .enter()
      .append("circle")
      .attr("class", "point")
      .style("stroke", "gray")
      .style("fill", "gray")
      .attr("r", 2.5)
      .attr("cx", (d) => {
        return x(d.x);
      })
      .attr("cy", (d) => {
        return y(d.y);
      })
      .style("fill", function (d) {
        return color(d.continent);
      });






    // for (let i = 0; i < 500; i++) {
    //   setTimeout(() => {
    //     kmeanIterate();
    //     console.log("iteration" + i)
    //   }, i * 1000);
    // }

  });
}
