//Configuration

//AWS CouchDB instance
//var urlprefix = "http://shop.earsson.se/cms/earsson/"; 
//var urlprefix = "http://content.iriscouch.com/electric_mountain/";
var urlprefix = "http://cms.earsson.se/earsson/";

//Startswith String prototype
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.indexOf(str) === 0;
  };
}

if (!Array.prototype.forEach)
{
  Array.prototype.forEach = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        fun.call(thisp, this[i], i, this);
    }
  };
}



var updateDOM = function(data, cmsitem) {
    var dataItem = data[cmsitem.getAttribute("contentKey").split(".")[1]];
    if(dataItem)
		cmsitem.innerHTML = dataItem;
	else
		cmsitem.innerHTML = "Could Not find contentItem with key: " +  
		cmsitem.getAttribute("contentKey");
}

//Managing localstorage
var hours = 0 // Reset when storage is more than 24hours
var now = new Date().getTime();
var setupTime = localStorage.getItem('setupTime');
if (setupTime === null) {
    localStorage.setItem('setupTime', now)
} else {
    if(now-setupTime > hours*60*60*1000) {
        localStorage.clear()
        localStorage.setItem('setupTime', now);
    }
}


//Update text and img elements from the cms
var cmselements = document.getElementsByName("cms");
var imgcmselements = [];
var textcmselements = [];

for (var i = cmselements.length - 1; i >= 0; i--) {
    
	if(cmselements[i].tagName.toLowerCase() == "img")
		imgcmselements.push(cmselements[i]);
	else
		textcmselements.push(cmselements[i]);
}


imgcmselements.forEach(function(item) {
	var parts = item.getAttribute("contentKey").split(".");
	item.setAttribute("src", urlprefix + parts[0] + "/" + parts[1] + "." + parts[2]);
});

function onDownloadedElement(event) {
    textcmselements.forEach(function(item) {
        var key = item.getAttribute("contentKey").split(".", 1)[0];
        if(key === event.type)
            updateDOM(JSON.parse(localStorage.getItem(key)), item);
        })
}

var eventhandler = new EventTarget();
function updatelocalstorage(item) {
        eventhandler.addListener(item.key, item.func);
    var url = urlprefix + item.key + "?callback=?";
    $.get(url, 
    function(data) {
		localStorage.setItem(item.key, JSON.stringify(data));
		eventhandler.fire(item.key);
        eventhandler.removeListener(item.key, item.func);
	}, "jsonp");
}

//** Lägg till dina cms nycklar här nedan om du vill skapa nya ** //
//*' Detta existerar bara för att vi inte har en dedikerad databas till dina content nycklar **//
// TODO: Fixa det

[{key : "masternav", func : onDownloadedElement}].forEach(updatelocalstorage);
[{key : "general", func : onDownloadedElement}].forEach(updatelocalstorage);
[{key : "hadeo_showcase", func : onDownloadedElement}].forEach(updatelocalstorage);
[{key : "hadeo_webshop", func : onDownloadedElement}].forEach(updatelocalstorage);
[{key : "hadeo_usp", func : onDownloadedElement}].forEach(updatelocalstorage);



