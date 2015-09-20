function loadFile(file, description){

	var s = document.getElementById("statement");
	s.className = "fail";
	var msg = "";

	document.getElementById("content_title").innerHTML=description;
	document.getElementById("content_link").href = file.get("url");
	document.title=description;

	if(file){
	
		var plugintype = file.get("pluginTypeFound");
		
		if(plugintype){
			document.getElementById("pdf").className = "embedded";  //Style the DIV
			
			var htmlObj = file.embed("pdf");	//Returns a reference to the HTML object or null if unsuccessful
			
			if(htmlObj){
				msg = "Feel free to ";				
				s.className = "success";

			} else {
				msg = "The embed didn't work. Don't sweat. Just";
				s.className = "fail";
			}

		} else {
			msg += "We can't figure out how to embed the file (we're n00bs). Just";
			s.className = "fail";
		}	
	}
	msg +=  ' <a download href="' + file.get("url") + '">download here</a>.';
	s.innerHTML = msg;

};
