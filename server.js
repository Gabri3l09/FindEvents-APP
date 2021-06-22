// setto elementi indispensabili per la realizzazione dell'applicazione
require('dotenv').config()
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
var request = require('request');
const fs = require('fs');
const path = require('path');

// Asynch Protocol - libreria amqp
var amqp = require('amqplib/callback_api');

// get POST parameters
var bodyParser = require('body-parser');
const { response } = require('express');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/docs', express.static('./docs'));

//Google Auth
const {OAuth2Client} = require('google-auth-library'); // npm install google-auth-library
const CLIENT_ID = process.env.cid;
const client = new OAuth2Client(CLIENT_ID);


// elementi per ricavare i dati dal file json in cui sono contenute le credenziali per l'app di google calendar
const CLIENT_SEC = process.env.cs;
let rawdata = fs.readFileSync(CLIENT_SEC);
let sec = JSON.parse(rawdata);
client_id = sec.web.client_id;
client_secret = sec.web.client_secret;
red_uri=sec.web.redirect_uris[0];
var a_t = '';
app.use(bodyParser.urlencoded({ extended: false }));

// dati presi dalla form da inserire nel calendar
var data_calendar;
var evento_calendar;
var ora_calendar;
var ora_fine;

// Email admin
var jac = process.env.em_b;
var dom = process.env.em_m;
var toni = process.env.em_t;

// Coda dei messaggi
var msx = [];


// Settare la porta e definire vari tools da utilizzare
const PORT = process.env.PORT || 5000;
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());


// variabili utili
var user;

// pagina di index
app.get('/', (req, res) =>{
    const x = process.env.cid;
    res.render('index', {x});
})

// Pagina per effettuare la conferma dell'accesso tramite google
app.post('/login', (req, res) =>{
    let token = req.body.token;
    
    
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        console.log('Accesso da: ' + payload.email);
    }
    verify().then(()=>{
        res.cookie('session-token', token);
        res.send('success');
    }).catch(console.error);
    
})

// Pagina per effettuare l'accesso sul calendar
app.get('/accedi_calendar', checkAuthenticated, function(req, res){
    data_calendar = req.query.data;
    event_calendar = req.query.evento;
    ora_calendar = req.query.ora;
    ora_fine = ora_calendar;
    res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar.events&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri="+red_uri+"&client_id="+client_id); // Rimando alla pagina google per effettuare il login per poter poi lavorare su calendar
  });

// Pagina per l'inserimento effettivo dell'evento sul calendario
app.get('/confirmins', checkAuthenticated, function(req, res){
    var formData = {
      code: req.query.code,
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: red_uri,
      grant_type: 'authorization_code'
    }
  
    request.post({url:'https://www.googleapis.com/oauth2/v4/token', form: formData}, function optionalCallback(err, httpResponse, body) { //  richiesta per la verifica corretta dei dati utente
      if (err) {
        return console.error('upload failed:', err);
      }
      var info = JSON.parse(body);
  
      a_t = info.access_token;
  
      var urlcal = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
      var headers = {
        'Authorization': 'Bearer '+a_t,
        'Content-Type': 'application/json'
      };
      var b = {
        'summary': event_calendar,
        'locarion': 'Rome',
        'description': 'Prova dell inserimento dentro a Calendar',
        'start': {
          'dateTime': data_calendar+'T'+ora_calendar+':00+02:00',
          'timeZone': 'Europe/Rome'
        },
        'end': {
          'dateTime': data_calendar+'T'+ora_calendar+':00+02:00',
          'timeZone': 'Europe/Rome'
        }
      };
  
      request.post({headers: headers, url: urlcal, body: JSON.stringify(b)}, function callback(error, response, body) {   // invio effettivo dell'inserimento dell'evento nel calendar
        if (!error && response.statusCode == 200) {
          res.render('confermacalendar', {b}); // invio a confermacalendar i valori passati al calendar
        }
        else {
          console.log(error);
        }
      });
    });
});

// arrivo alla dashboard
app.get('/dashboard', checkAuthenticated, (req, res) =>{
    user = req.user;
    res.render('dashboard', {user, jac, dom, toni});
})

// Lista degli eventi
app.post('/dashboard', checkAuthenticated, (req, res) =>{
  var url = 'http://localhost:5000/findbyplace?luogo='+req.body.luogo+'&data='+req.body.data+'&size=5';
    request.get({url:url}, function Callback(err, httpResponse, body) {
      if(!err && response.statusCode == 200){
          var dataString = body.toString(); //Stringify the json to turn it to object
          var eventi = JSON.parse(dataString);
          var x = eventi.event
          if (!x[0]){
            res.render('error');
          }
          else{
            res.render('listevents',{x})
        }
      }
      else{
          res.send("Errore richiesta")
      }
  });
})

// Lista eventi odierni intorno all'utente
app.get('/today', checkAuthenticated, (req, res) =>{
  const akmap = process.env.ap_k;
  res.render('today', {user, akmap});
})

// Lista eventi odierni intorno all'utente
app.get('/todaylist', checkAuthenticated, (req, res) =>{
  var url = 'http://localhost:5000/findtodayevents?longitudine='+req.query.longitudine+'&latitudine='+req.query.latitudine+'&size=5';
  
  request.get({url:url}, function Callback(err, httpResponse, body) {
    if(!err && response.statusCode == 200){
        var dataString = body.toString(); //Stringify the json to turn it to object
        var eventi = JSON.parse(dataString);
        var x = eventi.event
        if (!x[0]){
          res.render('error');
        }
        else{
          res.render('todaylist',{x})
      }
    }
    else{
        res.send("Errore richiesta")
    }
  });
  ///////////////////////////////////////7
})

// Request to admin
app.get('/chat', checkAuthenticated, (req, res) => {
  res.render('chat', {user});
})

// Send in queue 
app.post('/chat', checkAuthenticated, (req, res) => {
  const messaggio = req.body.msg;
  const mittente = req.body.us;
  amqp.connect('amqp://localhost', function(error0, connection) {   // connessione al broker - istanza locale su doker
    if (error0) {
        console.log(error0);
    }
    connection.createChannel(function(error1, channel) {    // creazione del canale
        if (error1) {
            throw error1;
        }
        var queue = 'Messaggi';   // nome della coda
        var msg = 'Messaggio da '+ mittente +': \''+messaggio+'\'';   // messaggio inviato alla coda

        channel.assertQueue(queue, {
            durable: false
        });
        channel.sendToQueue(queue, Buffer.from(msg));   // invio effettivo del messaggio alla coda
    });
  });
  res.render('confins');
})

// Login admin
app.post('/logadmin', checkAuthenticated, (req, res) => {
  var p = req.body.psw;
  var i = 0;
  if (p == process.env.pass){
    var amqp = require('amqplib/callback_api');

    amqp.connect('amqp://localhost', function(e0, connection) {
        if (e0) {
            throw e0;
        }
        connection.createChannel(function(e1, channel) {    // creazione del canale
            if (e1) {
                throw e1;
            }
            var queue = 'Messaggi';     // coda da cui leggo
            channel.assertQueue(queue, {    // definisco l'idempotenza della coda
                durable: false
            });
            
            msx = [];

            channel.consume(queue, function(msg) {      // prelevo le informazioni dalla coda
                var x =msg.content.toString() 
                msx.push(x);
                i = i + 1;
            }, {
                noAck: true
            });
        });
    });
    lungharr = msx.length;
    res.render('logad', {msx, lungharr});
  }
  else{
    res.render('errorad');
  }
})

// Logout
app.get('/logout', checkAuthenticated, (req, res) =>{
    res.clearCookie('session-token');
    res.redirect('/');
})

// funzione per effettuare il controllo se si è loggati o no così da precludere l'accesso alle pagine
function checkAuthenticated (req, res, next){
    let token = req.cookies['session-token'];

    let user = {};
    
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        user.name = payload.name;
        user.email = payload.email;
    }
    verify().then(()=>{
        req.user = user;
        next();
    }).catch(err=>{
        res.redirect('/');
    });
}


app.listen(PORT, () =>{
    console.log('Server running on port: ' + PORT);
})


//////////////////////////////////////////////////////////////////////////
/*******************************API FORNITE******************************/
//////////////////////////////////////////////////////////////////////////


/*******************************APIDOC******************************/
/**
* @api {get} /findbyplace?luogo={location}&data={date}&size={nrEvents} by location/date
* @apiName GetEventsLocDate
* @apiGroup FindEvent API

* @apiParam {String} location Città dell'evento
* @apiParam {Date} date Data formato aaaa-mm-gg
* @apiParam {Number} nrEvents Quanti eventi si vuol vedere
* @apiSuccess {Object[]} event json eventi in risposta
* 
*
* @apiSuccessExample Success-Response:
* HTTP/1.1 200 OK
* {
*     "event": [
*         {
*             "name": "2021 Rome Braves Regular Season",
*             "link": "https://www.ticketmaster.com/2021-rome-braves-regular-season-rome-georgia-09-18-2021/event/0E005A8CB92223B5",
*             "data": "2021-09-18",
*             "ora": "18:00:00",
*             "luogo": "State Mutual Stadium"
*         }
*     ]
* }
*
*/
/*******************************APIDOC******************************/

// Trova eventi odierni in base alle coordinate

app.get('/findtodayevents', (req, res) =>{
  const ak_ticketm = process.env.key_tm;
    var dataattuale = new Date();
    var dataact;
    if((dataattuale.getMonth()+1)<10){
      if((dataattuale.getDate())<10){
        dataact = dataattuale.getFullYear()+'-0'+(dataattuale.getMonth()+1)+'-0'+dataattuale.getDate();
      }
      else{
        dataact = dataattuale.getFullYear()+'-0'+(dataattuale.getMonth()+1)+'-'+dataattuale.getDate();
      }
    }
    else{
      if((dataattuale.getDate())<10){
        dataact = dataattuale.getFullYear()+'-'+(dataattuale.getMonth()+1)+'-0'+dataattuale.getDate();
      }
      else{
        dataact = dataattuale.getFullYear()+'-'+(dataattuale.getMonth()+1)+'-'+dataattuale.getDate();
      }
    }

    var lalo=req.query.latitudine+','+req.query.longitudine;

    var objres = {
      event: []
    };

    var url = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+ak_ticketm+'&latlong='+lalo+'&startDateTime='+dataact+'T00:00:00Z&size='+req.query.size;
    request.get({url:url}, function Callback(err, httpResponse, body) {
      if(!err && response.statusCode == 200){
        var dataString = body.toString(); //Stringify the json to turn it to object
        var dataObj = JSON.parse(dataString);
          if (!dataObj._embedded){
            res.send(objres);
          }
          else{
            var bu = dataObj._embedded.events;
            for (i = 0; i < req.query.size; i++){
              objres.event.push({
                name: bu[i].name,
                link: bu[i].url,
                data: bu[i].dates.start.localDate,
                ora: bu[i].dates.start.localTime,
                luogo: bu[i]._embedded.venues[0].name
              })
            }
            res.send(objres);
          }
      }
  });
})

/*******************************APIDOC******************************/
/**
* @api {get} /findtodayevents?longitudine={long}&latitudine={lat}&size={nrEvents} by long/lat
* @apiName GetEventsLonLat
* @apiGroup FindEvent API

* @apiParam {String} long Longitudine
* @apiParam {String} lat Latitudine
* @apiParam {Number} nrEvents Quanti eventi si vuol vedere
* @apiSuccess {Object[]} event json eventi in risposta
* 
*
* @apiSuccessExample Success-Response:
* HTTP/1.1 200 OK
* {
*     "event": [
*         {
*             "name": "2021 Rome Braves Regular Season",
*             "link": "https://www.ticketmaster.com/2021-rome-braves-regular-season-rome-georgia-09-18-2021/event/0E005A8CB92223B5",
*             "data": "2021-09-18",
*             "ora": "18:00:00",
*             "luogo": "State Mutual Stadium"
*         }
*     ]
* }
*/
/*******************************APIDOC******************************/

// Trova eventi in base alla città e data

app.get('/findbyplace', (req, res) =>{
  const ak_ticketm = process.env.key_tm;
  var objres = {
    event: []
  };
  var urltm = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+ak_ticketm+'&City='+req.query.luogo+'&startDateTime='+req.query.data+'T00:00:00Z&size='+req.query.size;
  request.get({url:urltm}, function Callback(err, httpResponse, body){
    if(!err && response.statusCode == 200){
      var dataString = body.toString(); //Stringify the json to turn it to object
      var dataObj = JSON.parse(dataString);
        if (!dataObj._embedded){
          res.send(objres);
        }
        else{
          var bu = dataObj._embedded.events;
          for (i = 0; i < req.query.size; i++){
            objres.event.push({
              name: bu[i].name,
              link: bu[i].url,
              data: bu[i].dates.start.localDate,
              ora: bu[i].dates.start.localTime,
              luogo: bu[i]._embedded.venues[0].name
            })
          }

          res.send(objres);
        }
    }
  });
})