let projection1 = d3.geoMercator()
  .scale(120)
  .translate([400, 400])
  .center([0, 5]);

let geoGenerator = d3.geoPath()
  .projection(projection1);

//e is event
function handleMouseClick(e, d) {

  //location.reload();
  let currentCountry = d3.select('#worldmap .info').text(d.properties.name)  //get selected country name
  let country = currentCountry.text() //store selected country as string
  console.log(country)


  const target = d3.select(this)
  if (target.style("fill") == "black") {
    target.style("fill", "#aaa")
  } else {
    target.style("fill", "black");
  }
  // Testing function
  // test()
  //function test(){console.log(country)}
}


function update(geojson) {

  //select the map tag
  let u = d3.select('#worldmap g.map')
    .selectAll('path')
    .data(geojson.features);

  u.enter()
    .append('path')
    .attr('d', geoGenerator)
    .on('click', handleMouseClick)


}


// REQUEST DATA
d3.json('data/geo.json').then(function (json) { update(json) });
d3.csv('data/testcovid.csv', function (data) {

});


