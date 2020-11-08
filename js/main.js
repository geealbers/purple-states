// https://stackoverflow.com/questions/19844545/replacing-css-file-on-the-fly-and-apply-the-new-style-to-the-page
function changeCSS(cssFile, cssLinkIndex) {

    var oldlink = document.getElementsByTagName("link").item(cssLinkIndex);

    var newlink = document.createElement("link");
    newlink.setAttribute("rel", "stylesheet");
    newlink.setAttribute("type", "text/css");
    newlink.setAttribute("href", cssFile);

    document.getElementsByTagName("head").item(0).replaceChild(newlink, oldlink)

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
    var status = labels.classList;
    if ( status == "hidden" ) {
      labels.classList.remove("hidden");
      el.innerHTML = "hide labels";
    } else {
      labels.classList.add("hidden");
      el.innerHTML = "labels";
    }
}


