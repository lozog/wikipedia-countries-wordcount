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
    var countries = topojson.feature(data, data.objects.countries1).features

    // console.log(countries)

    svg.selectAll(".country")
      .data(countries)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#cccccc");

    // console.log(svg)
    // console.log(countries._parents[0].children)

    _.forEach(svg.selectAll(".country")._parents[0].children, function(country, key) {
      randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
      country.setAttribute("fill", randomColor);
    });

    console.log("searching wiki...");
    wikipediaArticle("Canada");
  }

  function wikipediaArticle(searchterm) {
    searchRegex = new RegExp(searchterm,"g");

    baseurl = "https://en.wikipedia.org/w/api.php?"
    params = {
      action: "query",
      titles: searchterm,
      prop: "extracts|revisions",
      format: "json",
      rvprop:"ids"
    }

    baseurl = baseurl.concat($.param(params));
    console.log(baseurl)

    $.ajax({
      url: baseurl,
      type: 'GET',
      dataType: 'jsonp',
      xhrFields: {
          withCredentials: true
      },
      success: (response) => {
        console.log("success")
        fromwiki = response.query.pages
        console.log(fromwiki)
        pageId = Object.getOwnPropertyNames(fromwiki)[0]
        articleText = fromwiki[pageId].extract
        count = (articleText.match(searchRegex) || []).length;
        // document.getElementById('result').innerHTML = articleText
        console.log(count)
      }
    });
  }
})();
