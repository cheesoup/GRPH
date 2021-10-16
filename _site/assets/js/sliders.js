var toggle = false;
var size;

function opened() {
  document.getElementById("nav").style.opacity = "100";
  document.getElementById("nav").style.margin = "var(--side_navOpen)";
  document.getElementById("content").style.margin = "var(--content_navOpen)";
  toggle = true;
}

function closed() {
  document.getElementById("nav").style.opacity = "0";
  document.getElementById("nav").style.margin = "var(--side_navClose)";
  document.getElementById("content").style.margin = "var(--content_navClose)";
  toggle = false;
}

function button() {
  if (toggle) {
    closed();
  } else {
    opened();
  }
}

window.addEventListener('resize', function(event) {
  let prev = size;
  size = window.matchMedia("(min-width: 800px)").matches;
  if((size == false) && (prev != size)) {
    closed();
  }
}, true);

window.onload = function() {
  size = window.matchMedia("(min-width: 800px)").matches;
  closed();
}
