console.log('Loaded!');

//Change the text of main-text div

var element = document.getElementById("main-text");
element.innerHTML = "new value";

//Moving the image on click
var img = document.getElementById("madi");
var marginLeft = 0;
function moveRight() {
    marginLeft = marginLeft + 10;
    img.style.marginLeft = marginLeft+'px';
}
img.onclick = function(){
  var interval = setInterval(moveRight,100);
};