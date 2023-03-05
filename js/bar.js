d3.select("#start-transitionBar").on("click", bar);






function bar() {

  d3.select("#buttonInfo").text("barrr");


  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 900 - margin.left - margin.right;
  const height = 600 - margin.top - margin.bottom;


  const svg = d3.select('#barChart svg')
    .append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr("transform", `translate(${margin.left},${margin.top})`);

  //Get the selected country and save as array
  let currentC = d3.select('#worldmap .info').text().trim();
  let countrylist = currentC.split(',').map(d => d.trim());

  d3.csv('/data/CovidRate.csv').then(data => {
    // Extract the unique names from the CSV file
    //const names = Array.from(new Set(data.map(d => d.location)));
    names = countrylist
    console.log(countrylist)

    //names = ['China', 'Russia', 'United States', 'Canada', 'United Kingdom'] //for testing

    const margin = { top: 20, right: 150, bottom: 10, left: 50 };
    const width = 700 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Create the SVG container
    const svg = d3.select('#barChart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Define the date parsing function
    const parser = d3.timeParse("%Y-%m-%d");

    // Parse the date values
    data.forEach(d => {
      d.date = parser(d.date);
    });

    // Create the x-axis scale
    const xScale = d3.scaleTime()
      .domain(d3.extent(data, d => d.date))
      .range([0, width]);

    // Create the y-axis scale
    const yScale = d3.scaleLinear()
      .domain([0, 1000000])//d3.max(data, d => +d.total_deaths)
      .range([height, 0]);

    // Create the x-axis
    const xAxis = d3.axisBottom(xScale).ticks(6);

    // Create the y-axis
    const yAxis = d3.axisLeft(yScale).ticks(10);

    // Add the x-axis to the chart
    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis);

    // Add the y-axis to the chart
    svg.append('g')
      .call(yAxis);

    // Create a color scale for the lines
    const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

    // Loop through each name and add the line to the chart
    names.forEach((name, i) => {
      const nameData = data.filter(d => d.location === name);
      const line = d3.line()
        .x(d => xScale(d.date))
        .y(d => yScale(+d.total_deaths));


      svg.append('path')
        .datum(nameData)
        .attr('fill', 'none')
        .attr('stroke', colorScale(i))
        .attr('stroke-width', 1.5)
        .attr('d', line)
        .on('click', function () {
          selectedLines = name;
          console.log(selectedLines)
        });   //selectedLines = name;
      //      //console.log(selectedLines)

      // function handleMouseClick(name){
      //     //const target = d3.select(this);
      //     const countryName2 = name
      //      console.log(countryName2);

      // }

      // Add a text label for the line
      const lastDataPoint = nameData[nameData.length - 1];
      svg.append('text')
        .attr('x', xScale(lastDataPoint.date) + 5)
        .attr('y', yScale(lastDataPoint.total_deaths))
        .attr('font-size', '12px')
        .text(name);
    });

    let selectedLines = null;



  });











}
