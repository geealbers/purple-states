function buildMap(y) {

  var year;
  if (y == null) {
    var year = document.getElementById("current-year").textContent;
  } else {
    var year = y
  }

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
        +v.democratic_votes,
        +v.electoral_votes,
        v.postal_code ];
    }
    map.features = map.features.map( d => {
      let state = d.properties.name;
      let votes = index[state];
      d.properties.repVotes = votes[0];
      d.properties.demVotes = votes[1];
      d.properties.electoralVotes = votes[2];
      d.properties.postalCode = votes[3];
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

    drawMap(map,path);

    }

}

function drawMap(map,path) {

  let body = d3.select("#body")
  let labels = d3.select("#labels")

  if ( document.getElementById("electoral").checked ) {
    //Intial version of map with area of circles representing electoral vote size

    // const electoralMax = d3.max(map.features, d => d.properties.electoralVotes )
    const electoralMax = 60
    const fontSize = 8.5

    var sqrtScale = d3.scaleSqrt()
      .domain([0, electoralMax])
      .range([0, 50]);

    var spreadMap = applySimulation(map.features)

    body.selectAll("*").remove()
    body.selectAll("path")
        .data(map.features)
        .enter().append("path")
        .attr("d", d => path(d))
        .attr("stroke", "#b5b5b5")
        .attr("stroke-width", ".5px")
        .attr("fill", "none")
    body.selectAll("circle")
        .data(spreadMap)
        .enter().append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => sqrtScale(d.properties.electoralVotes) )
        .style("stroke", "none")
        .attr("fill", fillColor )

    labels.selectAll("*").remove()
    labels.selectAll("text.state")
        .data(spreadMap)
        .enter().append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y - 1)
        .attr("text-anchor", "middle")
        .attr("font-size", fontSize + "px" )
        .attr("font-weight", "bold")
        .attr("fill", "#e5e5e5" )
        .text( d => d.properties.postalCode )
    labels.selectAll("text.votes")
        .data(spreadMap)
        .enter().append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y + fontSize)
        .attr("text-anchor", "middle")
        .attr("font-size", fontSize + "px" )
        .attr("fill", "#e5e5e5" )
        .text( d => d.properties.electoralVotes )

    function applySimulation(nodes) {
        const simulation = d3.forceSimulation(nodes)
          .force("cx", d3.forceX().x(d => path.centroid(d)[0]).strength(0.3))
          .force("cy", d3.forceY().y(d => path.centroid(d)[1]).strength(0.3))
          .force("collide", d3.forceCollide().radius(d => sqrtScale(d.properties.electoralVotes) + 1).strength(1))
          .stop()
        let i = 0;
        while (simulation.alpha() > 0.01 && i < 200) {
          simulation.tick();
          i++;
        }
        return simulation.nodes();
      }

  } else {
    // Default geographic version of map
    labels.selectAll("*").remove()
    body.selectAll("*").remove()
    body.selectAll("path")
        .data(map.features)
        .enter().append("path")
        .attr("d", d => path(d))
        .attr("stroke", "#e5e5e5")
        .attr("stroke-width", ".3px")
        .attr("fill", fillColor )
  }

}

function changeColor() {

  if ( document.getElementById("electoral").checked ) {
    d3.select("#body")
      .selectAll("circle")
      .attr("fill", fillColor )
  } else {
    d3.select("#body")
      .selectAll("path")
      .attr("fill", fillColor )
  }
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

// Toggle state labels on electoral map
function toggleLabels(el) {
    var labels = document.getElementById("labels");
    var status = labels.classList.toString();
    if ( status.includes("hidden") ) {
      labels.classList.remove("hidden");
      el.innerHTML = "hide labels";
    } else {
      labels.classList.add("hidden");
      el.innerHTML = "labels";
    }
}
