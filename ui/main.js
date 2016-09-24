console.log('Loaded!');

//Change the text of main-text div

var element = document.getElementById("main-text");
element.innerHTML = "new value";

//Moving the image on click
var img = document.getElementById("madi");
img.onclick = function(){
  img.style.marginLeft = '100px';  
};