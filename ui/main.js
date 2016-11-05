//Submit username and password to login
var submit = document.getElementById("submit_btn");
submit.onclick = function(){

	//Create a request
	var request = new XMLHttpRequest();

	//Capture the response and store it in the variable
	request.onreadystatechange = function(){
		if(request.readyState === XMLHttpRequest.DONE){
			//Take some action
			if(request.status === 200){
				console.log('user is logged in');
				alert('Logged in successfully');
			}else{
			    alert('Username/Password is incorrect');
			}
		}
		//Not done yet
	};	

	//Make a request
	var username= document.getElementById("username").value;
	var password= document.getElementById("password").value;
	request.open("POST","http://nayeem8527.imad.hasura-app.io/login",true);
	request.setRequestHeader('Content-Type','application/json');
	request.send(JSON.stringify({username:username,password:password}));
	//Make a request to the server and send the name
	
};