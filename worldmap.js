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
    countryNames = countryNamesArray.slice(0,20).join('|');
    // console.log("searching wiki...");
    getWordcounts(countryNames, countriesDOM, fillCountries);
  }

  function fillCountries(response) {
    searchterm = "the";
    countryResults = [];
    console.log("success");
    fromwiki = response.query.pages;
    console.log("retrieved", Object.keys(fromwiki).length, "pages");

    searchRegex = new RegExp(searchterm,"g");

    _.forEach(fromwiki, function(page, pageId) {
      extract = page.extract;
      // console.log(page)
      if (extract != null) {
        articleText = $(extract).text();
        // console.log(articleText);
        count = (articleText.match(searchRegex) || []).length;
        // // document.getElementById('result').innerHTML = articleText
        console.log("name:", page.title, ", pageId:",pageId,", count:", count);
      } else {
        console.log("couldn\'t find articletext for", page.title);
        count = 0; // TODO: articleText shouldn't be null
      }
    }); // forEach
  }

  function getWordcounts(countryNames, domElements, callback) {
    // console.log(searchterm);
    // console.log(domElements);

    baseurl = "https://en.wikipedia.org/w/api.php?";
    params = {
      action: "query",
      titles: countryNames,
      prop: "extracts|revisions",
      format: "json",
      rvprop:"ids",
      excontinue:1,
      exlimit:'20',
      exintro: 'true'
    };

    baseurl = baseurl.concat($.param(params));
    // console.log(baseurl);

    $.ajax({
      url: baseurl,
      type: 'GET',
      dataType: 'jsonp',
      xhrFields: {
          withCredentials: true
      },
      success: (response) => {
        callback(response);
      } // success
    }); // ajax
  } // getWordcounts
})();
