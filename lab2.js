// Freny Patel
// 000744054
// StAuth10065: I Freny Patel, 000744054 certify that this material is my original work. No other person's work has been used without due acknowledgement. I have not made my work available to anyone else.
var Bot = require("slackbots");

var api_setting = {token:"" , name:"yelphelp"}
var yelp_api_key = "";
var yelpApi = require("yelp-api");
var yelp = new yelpApi(yelp_api_key);

var sqlite3 = require("sqlite3").verbose();
var file = "api.db";
var db = new sqlite3.Database(file);

db.serialize(function(){
	var del = db.prepare("DROP TABLE IF EXISTS users");
	del.run();
	del.finalize();
	db.run("CREATE TABLE users(rowid INTEGER PRIMARY KEY AUTOINCREMENT,status TEXT , message TEXT, timestamp TEXT)");
});

var bot = new Bot(api_setting);

bot.on('message',function(data){
	
	if(data.type == "message" && !data.sub_type){
		search_text = data.text.toLowerCase();
		if(search_text.startsWith("nearby")){
			var address = search_text.replace("nearby","");
			get_nearyby(address);
		}
		if(search_text.startsWith("events")){
			var sub_string = search_text.split(" ");
			var lat = sub_string[1].replace(/.$/,"")
			var long = sub_string[2].replace(/.$/,"")
			console.log(lat + long);
			get_closeby(lat,long);
		}
		if(search_text.startsWith("top")){
			var sub_string = search_text.split(" ",2);
			var top_number = sub_string[1];
			var address_temp = search_text.replace("top","");
			var address = address_temp.replace(top_number,"");
			get_top(top_number,address);	
		}
		if(search_text.startsWith("closest")){
			var sub_string = search_text.split(" ",2);
			var closest_number = sub_string[1];
			var address_temp = search_text.replace("closest","");
			var address = address_temp.replace(closest_number,"");
			get_closest(closest_number,address);
		}
		if(search_text.startsWith("findme")){
			var sub_string = search_text.split(" ",2);
			var category = sub_string[1];
			var address_temp = search_text.replace("closest","");
			var address = address_temp.replace(category,"");
			get_findme(category,address);
		}
		if(search_text.startsWith("reviews")){
			var name_temp = search_text.replace("reviews","");
			var name = name_temp.split(/[0-9]/,1);
			var address = name_temp.replace(name[0],"");
			get_reviews(name[0],address);
		}
		if(search_text.startsWith("searchbyphone")){
			var search = search_text.replace("searchbyphone","");
			get_searchbyphone(search);
		}
		if(search_text.startsWith("statusupdate")){
			var search = search_text.toLowerCase().replace("statusupdate","");
			var status = search.split(" ",2);
			var message = search.replace(status[1],"");
			var timestamp = data.timestamp;
			update_status(status,message,timestamp);
		}
	}
});

function get_nearyby(address){
	var params = [
		{type:"restaurants"},
		{location: address},
		{radius: 10000}
	];


	yelp.query('businesses/search',params).then(data => {
		var bot_message="";
		result = JSON.parse(data);
		var length = result.total;
		if(result.total> 0){
			if(result.total > 5 ){
				length = 5;
			}
			bot_message = "The " + length + " Closet restaurants are: \n\n";
			for(var i = 0; i < length; i ++){
				bot_message += "" + (i+1) + " Name: " + result.businesses[i].name + "\n" +
							"Address: " + result.businesses[i].location.display_address + "\n";
			}
			bot.postMessageToChannel("general",bot_message);
		}else{
			bot.postMessageToChannel("general","No nearby restaurants can be found");
		}
		})
		.catch(err =>{
			console.log(err);
		});
	
}

function get_closeby(lat,long){
	var params = [
		{type: "restaurants"},
		{latitude: lat},
		{longitude: long},
		{radius:10000}
		
	];
	yelp.query('events',params).then(data => {
		var bot_message="";
		result = JSON.parse(data);
		var length = result.total;
		if(result.total>0){
			if(result.total > 5 ){
				length = 5;
			}
			bot_message = "The " + length + " Closet events are: \n\n";
			for(var i = 0; i < length; i ++){
				bot_message += "\n" + (i+1) + " Name: " + result.events[i].name + "\n" +
							"Address: " + result.events[i].location.display_address + "\n" +
							"Description: " + result.events[i].description + "\n";
			}
			bot.postMessageToChannel("general",bot_message);
		}else{
			bot.postMessageToChannel("general","No close by events can be found");
		}
		})
		.catch(err =>{
			console.log(err);
		});
}

function get_top(top_number,address){
	var params = [
		{type: "restaurants"},
		{location: address},
		{sort_by: "rating"},
		{radius:10000}
	];

	yelp.query('businesses/search',params).then(data => {
		var bot_message="";
		result = JSON.parse(data);
		var length = top_number;
		if(result.total > 0){
			if(result.total < length){
				length = result.total;
			}
			bot_message = "The Top " + length + " Closet restaurants are: \n\n";
			for(var i = 0; i < length; i ++){
				bot_message += "\n" + (i+1) + " Name: " + result.businesses[i].name + "\n" +
							"Address: " + result.businesses[i].location.display_address + "\n" ;
			}
			bot.postMessageToChannel("general",bot_message);
		}else{
			bot.postMessageToChannel("general","No nearby restaurants can be found");
		}
		})
		.catch(err =>{
			console.log(err);
		});
}

function get_closest(closest_number,address){
	var params = [
		{type: "restaurants"},
		{location: address},
		{sort_by: "distance"}
	];

	yelp.query('businesses/search',params).then(data => {
		var bot_message="";
		result = JSON.parse(data);
		var length = closest_number;
		if(result.total > 0){
			if(result.total < length){
				length = result.total;
			}
			bot_message = "The Top " + length + " Closet restaurants are: \n\n";
			for(var i = 0; i < length; i ++){
				bot_message += "\n" + (i+1) + " Name: " + result.businesses[i].name + "\n" +
							"Address: " + result.businesses[i].location.display_address + "\n" ;
			}
			bot.postMessageToChannel("general",bot_message);
		}else{
			bot.postMessageToChannel("general","No nearby restaurants can be found");
		}
		})
		.catch(err =>{
			console.log(err);
		});
}
function get_findme(category,address){
	var params = [
		{type: "restaurants"},
		{location: address},
		{categories: category},
		{radius: 20000}
	];

	yelp.query('businesses/search',params).then(data => {
		var bot_message="";
		result = JSON.parse(data);
		if(result.total > 0){
			bot_message = "The " + result.total + " " + category + " restaurants are: \n\n";
			for(var i = 0; i < result.total; i ++){
				bot_message += "\n" + (i+1) + " Name: " + result.businesses[i].name + "\n" +
							"Address: " + result.businesses[i].location.display_address + "\n" +
							"Rating: " + result.businesses[i].rating + "\n";
			}
			bot.postMessageToChannel("general",bot_message);
		}else{
			bot.postMessageToChannel("general","No nearby "+ category +  " restaurants can be found");
		}
		})
		.catch(err =>{
			console.log(err);
		});
}
function get_reviews(name,address){
	var params = [
		{term: name},
		{location: address},
		{sort_by: "distance"}
	];

	yelp.query('businesses/search',params).then(data => {
		result1 = JSON.parse(data);
		var restID = result1.businesses[0].id;
		if(result1.total > 0 ){
		yelp.query('businesses/'+ restID +'/reviews').then(data => {
			var bot_message="";
			result = JSON.parse(data);
				console.log(data);
				bot_message = "" + name  + " Reviews are: \n\n";
				for(var i = 0; i < 3; i ++){
					bot_message += "\n" + (i+1) + " Reviw Text: " + result.reviews[i].text + "\n" +
								"User: " + result.reviews[i].user.name + "\n" +
								"Rating: " + result.reviews[i].rating + "\n"+
								"Review Url : " + result.reviews[i].url+ "\n";
				}
				bot.postMessageToChannel("general",bot_message);
			})
			.catch(err =>{
				console.log(err);
			});
		}else{
			bot.postMessageToChannel("general", name +  " can not be found");
		}
	}).catch(err=>{
		console.log(err);
	})
}
function get_searchbyphone(phoneNumber){
	var params = [
		{phone: phoneNumber}
	];
	yelp.query('businesses/search/phone',params).then(data => {
		var bot_message="";
		result = JSON.parse(data);
		if(result.total> 0){
			bot_message = "The restaurant with "+ phoneNumber +" is: \n\n";
			for(var i = 0; i < result.total; i ++){
				bot_message += "" + (i+1) + " Name: " + result.businesses[i].name + "\n" +
							"Address: " + result.businesses[i].location.display_address + "\n";
			}
			bot.postMessageToChannel("general",bot_message);
		}else{
			bot.postMessageToChannel("general","No restaurant with phone number " +phoneNumber+ " can be found");
		}
		})
		.catch(err =>{
			console.log(err);
		});
}
function update_status(status,message,timestamp){
	var stmt = "INSERT INTO users VALUES(?,?,?,?)";
	var params = [null,status,message,timestamp];
	db.run(stmt,params,function(err){
		if(err){
			return console.log(err.message);
		}
		console.log("Status Updated with rowid " , this.lastID);
	});
	
}