// The svg
const svg = d3.select("#covidmap"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
const projection = d3.geoEquirectangular();


//scale the worldmap
function mapScale(data) {
  projection.fitExtent([[50, 00], [1200, 500]], data);
}


//load the geo json and draw the map
d3.json("https://raw.githubusercontent.com/kc2029/F21DV_map/main/custom.geo.json").then(function (data) {

  mapScale(data);

  // Draw the map
  svg.append("g")

    .selectAll("path")
    .data(data.features)
    .join("path")
    .attr("fill", "grey") //map color, background?

    .attr("d", d3.geoPath()
      .projection(projection)
    )
    .style("stroke", "white") //country border color
})
