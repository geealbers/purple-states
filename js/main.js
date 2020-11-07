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
