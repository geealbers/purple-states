function buildMap(year) {

  let body = d3.select("#body")

  Promise.all([
      d3.json("../js/states-map.json"),
      d3.json("../js/states-data.json"),
  ]).then(mapData)

  function mapData(datasources) {
    let map = datasources[0]
    let votes = datasources[1]

    let index = {}
    for (let v of votes[year]) {
      let state = v.state;
      index[state] = [
        +v.republican_votes,
        +v.democratic_votes ];
    }
    map.features = map.features.map( d => {
      let state = d.properties.name;
      let votes = index[state];
      d.properties.repVotes = votes[0];
      d.properties.demVotes = votes[1];
      return d;
    })

    // console.log(index)
    // console.log(electoralVotes)
    // console.log(map)

    let bodyHeight = 377
    let bodyWidth = 624

    var projection = d3.geoAlbersUsa()
        .scale(810)
        .translate([bodyWidth / 2, bodyHeight / 2])

    var path = d3.geoPath()
        .projection(projection);

    body.selectAll("*").remove()

    body.selectAll("path")
        .data(map.features)
        .enter().append("path")
        .attr("d", d => path(d))
        .attr("stroke", "#e5e5e5")
        .attr("stroke-width", ".3px")
        .attr("fill", function(d) {
          let total = d.properties.repVotes + d.properties.demVotes;
          let red = d.properties.repVotes / total * 255;
          let blue = d.properties.demVotes / total * 255;
          let color = "rgb(" + red + ", 60, " + blue + ")";
          return color;
        })

    // Intial version of map with circles representing electoral vote size
    // body.selectAll("path")
    //     .data(map.features)
    //     .enter().append("path")
    //     .attr("d", d => path(d))
    //     .attr("stroke", "#999")
    //     .attr("stroke-width", ".5px")
    //     .attr("fill", "none")
    // body.selectAll("circle")
    //     .data(map.features)
    //     .enter().append("circle")
    //     .attr("cx", d => path.centroid(d)[0] )
    //     .attr("cy", d => path.centroid(d)[1] )
    //     .attr("r", d => d.properties.electoralVotes )
    //     .style("stroke", "none")
    //     .attr("fill", function(d) {
    //       let total = d.properties.repVotes + d.properties.demVotes;
    //       let red = d.properties.repVotes / total * 255;
    //       let blue = d.properties.demVotes / total * 255;
    //       let color = "rgb(" + red + ", 60, " + blue + ")";
    //       return color;
    //     })

    }

}

// Add an id to the link of the year currently displayed in order to add styling
function tagYear(el) {

  var currentYear = document.getElementById("current-year");

  currentYear.removeAttribute("id");
  el.setAttribute("id", "current-year");

}

// Toggle classes on states and color key to allow for color blindness variants
function changeColor(button) {

   var color = button.id;
   var states = document.getElementsByClassName("state");
   var keys = document.getElementsByClassName("key-item");

   Array.prototype.forEach.call(states, function(el) {

       el.setAttribute("class", "");
       el.classList.add("state");
       el.classList.add(color);

   });

   Array.prototype.forEach.call(keys, function(el) {

       el.setAttribute("class", "");
       el.classList.add("key-item");
       el.classList.add(color);

   });

}

// Show and hide variant maps
function changeMap(button) {

    var mapPrefix = "map-"
    var selectedMap = mapPrefix.concat(button.id);
    var maps = document.getElementsByClassName("map");

    Array.prototype.forEach.call(maps, function(map) {

      if (map.id == selectedMap) {
        map.setAttribute("class", "");
        map.classList.add("map");
      } else {
        map.setAttribute("class", "");
        map.classList.add("map");
        map.classList.add("hidden");
      }

     });

}

// Toggle state labels on electoral map
function toggleLabels(el) {
    var labels = document.getElementById("map-labels--electoral");
    var status = labels.classList.toString();
    if ( status.includes("hidden") ) {
      labels.classList.remove("hidden");
      el.innerHTML = "hide labels";
    } else {
      labels.classList.add("hidden");
      el.innerHTML = "labels";
    }
}


