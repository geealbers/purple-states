function buildMap(y) {

  var year;
  if (y == null) {
    var year = document.getElementById("current-year").textContent;
  } else {
    var year = y
  }

  Promise.all([
      d3.json("../js/states-map-20m.json"),
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
        +v.population,
        v.postal_code ];
    }
    map.features = map.features.map( d => {
      let state = d.properties.NAME;
      let votes = index[state];
      d.properties.repVotes = votes[0];
      d.properties.demVotes = votes[1];
      d.properties.electoralVotes = votes[2];
      d.properties.population = votes[3];
      d.properties.postalCode = votes[4];
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

  if ( document.getElementById("population").checked ) {
    //Intial version of map with area of circles representing population size

    // const populationMax = d3.max(map.features, d => d.properties.population )
    const populationMax = 40000000
    const fontSize = 8.5

    var sqrtScale = d3.scaleSqrt()
      .domain([0, populationMax])
      .range([0, 55]);

    var spreadMap = applySimulation(map.features)

    body.selectAll("path")
        .attr("d", d => path(d))
        .attr("stroke", "#b5b5b5")
        .attr("stroke-width", ".5px")
        .attr("fill", "none")
    body.selectAll("circle").remove()
    body.selectAll("circle")
        .enter()
        .data(spreadMap)
        .enter().append("circle")
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("r", d => sqrtScale(d.properties.population) )
        .style("stroke", "none")
        .attr("fill", fillColor )

    labels.selectAll("*").remove()
    labels.selectAll("text.state")
        .data(spreadMap)
        .enter().append("text")
        .attr("x", d => d.x)
        .attr("y", d => d.y + (fontSize * .3))
        .attr("text-anchor", "middle")
        .attr("font-size", d => sqrtScale(d.properties.population) <  fontSize ? (fontSize * .7) + "px" : fontSize + "px" )
        .attr("font-weight", "bold")
        .attr("fill", "#e5e5e5" )
        .text( d => d.properties.postalCode )
    // labels.selectAll("text.votes")
    //     .data(spreadMap)
    //     .enter().append("text")
    //     .attr("x", d => d.x)
    //     .attr("y", d => d.y + fontSize)
    //     .attr("text-anchor", "middle")
    //     .attr("font-size", d => sqrtScale(d.properties.population) <  fontSize ? (fontSize * .7) + "px" : fontSize + "px" )
    //     .attr("fill", "#e5e5e5" )
    //     .text( d => d.properties.electoralVotes )

    function applySimulation(nodes) {
        const simulation = d3.forceSimulation(nodes)
          .force("cx", d3.forceX().x(d => path.centroid(d)[0]).strength(0.3))
          .force("cy", d3.forceY().y(d => path.centroid(d)[1]).strength(0.3))
          .force("collide", d3.forceCollide().radius(d => sqrtScale(d.properties.population) + 1).strength(1))
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

  labelColors()
}

function changeColor() {
  if ( document.getElementById("population").checked ) {
    d3.select("#body")
      .selectAll("circle")
      .attr("fill", fillColor )
  } else {
    d3.select("#body")
      .selectAll("path")
      .attr("fill", fillColor )
  }
  labelColors()
}

function fillColor(d) {
  var total = d.properties.repVotes + d.properties.demVotes;
  var repPercent = d.properties.repVotes / total;
  var demPercent = d.properties.demVotes / total;

  if ( document.getElementById("blue-yellow").checked )  {
    let color = colorBlueYellow(repPercent,demPercent)
    return color;
  } else if ( document.getElementById("grayscale").checked ) {
    let color = colorGrayscale(repPercent,demPercent)
    return color;
  } else {
    let color = colorPurple(repPercent,demPercent)
    return color;
  }
}

function labelColors() {
  let dem75 = document.getElementById("dem-75")
  let dem65 = document.getElementById("dem-65")
  let split = document.getElementById("split")
  let rep65 = document.getElementById("rep-65")
  let rep75 = document.getElementById("rep-75")

  if ( document.getElementById("blue-yellow").checked ) {
    dem75.style.backgroundColor = colorBlueYellow(.25,.75)
    dem65.style.backgroundColor = colorBlueYellow(.35,.65)
    split.style.backgroundColor = colorBlueYellow(.50,.50)
    rep65.style.backgroundColor = colorBlueYellow(.65,.35)
    rep75.style.backgroundColor = colorBlueYellow(.75,.25)
  } else if ( document.getElementById("grayscale").checked ) {
    dem75.style.backgroundColor = colorGrayscale(.25,.75)
    dem65.style.backgroundColor = colorGrayscale(.35,.65)
    split.style.backgroundColor = colorGrayscale(.50,.50)
    rep65.style.backgroundColor = colorGrayscale(.65,.35)
    rep75.style.backgroundColor = colorGrayscale(.75,.25)
  } else {
    dem75.style.backgroundColor = colorPurple(.25,.75)
    dem65.style.backgroundColor = colorPurple(.35,.65)
    split.style.backgroundColor = colorPurple(.50,.50)
    rep65.style.backgroundColor = colorPurple(.65,.35)
    rep75.style.backgroundColor = colorPurple(.75,.25)
  }
}

function colorPurple(rep,dem) {
  // Color forumla for default Purple
  let r = Math.round(rep * 255)
  let g = 60
  let b = Math.round(dem * 255)

  let color = "rgb(" + r + ", " + g + ", " + b + ")";
  return color;
}

function colorGrayscale(rep,dem) {
  // Color formula for simple Grayscale
  let r = Math.round(rep * 255)
  let g = Math.round(rep * 255)
  let b = Math.round(rep * 255)

  let color = "rgb(" + r + ", " + g + ", " + b + ")";
  return color;
}

function colorBlueYellow(rep,dem) {
  // Color formula for Blue-Yellow combinaation for color blindness
  // could use this same formula to blend other arbitraty colors
  let demR = 0
  let demG = 114
  let demB = 178

  let repR = 240
  let repG = 228
  let repB = 66

  let diffR = Math.abs(demR - repR) * dem;
  let diffG = Math.abs(demG - repG) * dem;
  let diffB = Math.abs(demB - repB) * dem;

  var r;
  var g;
  var b;

  if (repR < demR) { var r = Math.round(repR + diffR); } else { var r = Math.round(repR - diffR); };
  if (repG < demG) { var g = Math.round(repG + diffG); } else { var g = Math.round(repG - diffG); };
  if (repB < demB) { var b = Math.round(repB + diffB); } else { var b = Math.round(repB - diffB); };

  let color = "rgb(" + r + ", " + g + ", " + b + ")";
  return color;
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
