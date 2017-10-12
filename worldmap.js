(function(){
  var margin = { top: 50, left: 50, right: 50, bottom: 50 },
    height = 500 - margin.top - margin.bottom,
    width = 1000 - margin.right - margin.left;

  var svg = d3.select("#map")
              .append("svg")
              .attr("height", height + margin.top + margin.bottom)
              .attr("width", width + margin.right + margin.left)
              .append("g")
              .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

  d3.queue()
    .defer(d3.json, "world-countries.json")
    .await(ready);

  var projection = d3.geoMercator()
    .translate([ width/3, height/2 ])
    .scale(100)

  var path = d3.geoPath()
    .projection(projection)

  function ready(error, data) {
    // console.log(data)
    var countries1 = topojson.feature(data, data.objects.countries1).features
    var countries2 = topojson.feature(data, data.objects.countries2).features

    // console.log(countries1)
    // console.log(countries2)

    var countries = svg.selectAll(".country")
    countries.data(countries1)
      // .data(countries2)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#cccccc");

    console.log(svg)
    console.log(countries._parents[0].children)

    // countries._parents[0].children.each((p, j) => {
    //   console.log(p, j);
    //   d3.select(this)
    // });

    _.forEach(countries._parents[0].children, function(country, key) {
      randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
      country.setAttribute("fill", randomColor);
    });
  }
})();
