d3.csv('/Users/kevinc/Downloads/F21DV/CW1/F21DV_CW1/data/covid.csv', function (data) {
  for (var i = 0; i < data.length; i++) {
    console.log(data[i].location);

  }


})
