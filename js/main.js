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
        .attr("fill", fillColor )

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
    //     .attr("fill", fillColor )

    }

}

function changeColor() {

  d3.select("#body")
    .selectAll("path")
    .attr("fill", fillColor )

}

function fillColor(d) {

  const base = 255

  var total = d.properties.repVotes + d.properties.demVotes;
  var repPercent = d.properties.repVotes / total;
  var demPercent = d.properties.demVotes / total;

  if ( document.getElementById("blue-yellow").checked )  {
  // Color formula for Blue-Yellow combinaation for color blindness
  // could use this same formula to blend other arbitraty colors

    let demR = 68
    let demG = 68
    let demB = 156

    let repR = 172
    let repG = 172
    let repB = 26

    let diffR = Math.abs(demR - repR) * demPercent;
    let diffG = Math.abs(demG - repG) * demPercent;
    let diffB = Math.abs(demB - repB) * demPercent;

    var r;
    var g;
    var b;

    if (repR < demR) { var r = Math.round(repR + diffR); } else { var r = Math.round(repR - diffR); };
    if (repG < demG) { var g = Math.round(repG + diffG); } else { var g = Math.round(repG - diffG); };
    if (repB < demB) { var b = Math.round(repB + diffB); } else { var b = Math.round(repB - diffB); };

    let color = "rgb(" + r + ", " + g + ", " + b + ")";
    return color;

  } else if ( document.getElementById("grayscale").checked ) {
  // Color formula for simple Grayscale

    let r = Math.round(repPercent * base)
    let g = Math.round(repPercent * base)
    let b = Math.round(repPercent * base)

    let color = "rgb(" + r + ", " + g + ", " + b + ")";
    return color;

  } else {
  // Color forumla for default Purple

    let r = Math.round(repPercent * base)
    let g = 60
    let b = Math.round(demPercent * base)

    let color = "rgb(" + r + ", " + g + ", " + b + ")";
    return color;

  }

}

// Add an id to the link of the year currently displayed in order to add styling
function tagYear(el) {

  var currentYear = document.getElementById("current-year");

  currentYear.removeAttribute("id");
  el.setAttribute("id", "current-year");

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


