// The svg
const svg = d3.select("#covidmap"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

// Map and projection
const projection = d3.geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])

// Load external data and boot

d3.json("https://raw.githubusercontent.com/kc2029/F21DV_map/main/custom.geo.json").then(function (data) {

    // Draw the map
    svg.append("g")
        .selectAll("path")
        .data(data.features)
        .join("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.geoPath()
            .projection(projection)
        )
        .style("stroke", "#fff")

})
