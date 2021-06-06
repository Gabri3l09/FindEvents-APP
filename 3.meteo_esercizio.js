var express = require('express');
var bodyParser     =        require("body-parser");
var req = require('request');

var app = express();
//app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded());

//require('dotenv').config(); //necessario per abilitare le API keys

app.post('/meteo', function(req, res){
    //1. Prelevo la città dalla form req.body.city vedi form_meteo.html
    console.log(req.body.city);
    var city = req.body.city;
    var val = "";
    
    //2. Faccio la chiamata REST a https://openweathermap.org/
    var meteo_req = require('request');
    var options = {
        url: `http://api.openweathermap.org/data/2.5/weather?q=${city},IT&appid=YOURAPI_ID`,
    }
    
    meteo_req.get(options, function(error, response, body){
        if (!error && response.statusCode == 200) {
            var info = JSON.parse(body);
            val = info.main.temp;
            console.log(val);
        
            //3. Scrivo i dati su DB con chiamata REST --> scrivi_db()
            scrivi_db(city, val);

            //4. Rispondo all'utente  res.send...
            res.send(`La temperatura di ${city} è di ${(parseFloat(val)-273.15).toFixed(2)} C°`);
        }
    });
});

function scrivi_db(city, val){

// curl -X PUT http://127.0.0.1:5984/my_database/"001" -d '{ " city " : city , " val" :val }'


req({
    url: 'http://user:user@127.0.0.1:5984/my_database_meteo/'+city, 
    qs: {city: city, val: val},
    method: 'PUT',
    headers: {
        'content-type': 'application/json'
    },
    body: `{"city": "${city}","temp": ${val}}`
},
    //body: 'Hello Hello! String body!' //Set the body as a string
 function(error, response, body){
    if(error) {
        console.log(error);
    } else {
        console.log(response.statusCode, body);
    }
});


}

app.listen(3000);
