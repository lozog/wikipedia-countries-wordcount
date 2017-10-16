(function(){
  var margin = { top: 50, left: 50, right: 50, bottom: 50 },
    height = 600 - margin.top - margin.bottom,
    width = 800 - margin.right - margin.left;

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
    .translate([ width/3 + 50, height/2 ])
    .scale(100);

  var path = d3.geoPath()
    .projection(projection);

  function ready(error, data) {
    // console.log(data);
    var countries = topojson.feature(data, data.objects.countries1).features;

    // console.log(countries)

    svg.selectAll(".country")
      .data(countries)
      .enter().append("path")
      .attr("class", "country")
      .attr("d", path)
      .attr("fill", "#cccccc");

    // console.log(svg)
    // console.log(countries._parents[0].children)
    countriesDOM = svg.selectAll(".country")._parents[0].children;

    countryNamesArray = [];
    _.forEach(countriesDOM, function(country, key) {
      randomColor = '#'+Math.floor(Math.random()*16777215).toString(16);
      // country.setAttribute("fill", randomColor);
      name = countries[key].properties.name;
      country.setAttribute("name", name);
      countryNamesArray.push(name);
      // console.log(name)
    });

    // console.log(countryNamesArray)
    countryNames = countryNamesArray.slice(0, 20).join('|');
    console.log("searching wiki...");
    wikipediaArticle(countryNames, countriesDOM);
  }

  function wikipediaArticle(searchterm, domElements) {
    console.log(searchterm);
    console.log(domElements);
    searchRegex = new RegExp(searchterm,"g");

    baseurl = "https://en.wikipedia.org/w/api.php?";
    params = {
      action: "query",
      titles: searchterm,
      prop: "extracts|revisions",
      format: "json",
      rvprop:"ids",
      excontinue:1,
      exlimit:'max',
      exintro: 'true'
    };

    baseurl = baseurl.concat($.param(params));
    console.log(baseurl);

    countryResults = [];
    $.ajax({
      url: baseurl,
      type: 'GET',
      dataType: 'jsonp',
      xhrFields: {
          withCredentials: true
      },
      success: (response) => {
        console.log("success");
        fromwiki = response.query.pages;
        console.log(Object.keys(fromwiki).length, "pages retrieved");

        _.forEach(fromwiki, function(page, pageId) {
          articleText = page.extract;
          // console.log(page)
          if (articleText != null) {
            // console.log(articleText);
            count = (articleText.match(searchRegex) || []).length;
            // // document.getElementById('result').innerHTML = articleText
          } else {
            count = 0; // TODO: aticleText shouldn't be null
          }
          // countryResults.push({name: page.title, count: count})
          // console.log(count)
        }); // forEach
      } // success
    }); // ajax
  } // wikipediaArticle
})();
