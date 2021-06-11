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
app.use(express.urlencoded({ extended: true }))

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

//
var jacopobrune = [];


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
        const userid = payload['sub'];
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
      console.log('Upload successful!  Server responded with:', body);
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
    res.render('dashboard', {user});
})

// Lista degli eventi
app.post('/dashboard', checkAuthenticated, (req, res) =>{
  const ak_ticketm = process.env.key_tm;
  var urltm = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+ak_ticketm+'&City='+req.body.luogo+'&startDateTime='+req.body.data+'T00:00:00Z&size=5';
  request.get({url:urltm}, function Callback(err, httpResponse, body){
    if(!err && response.statusCode == 200){
      var dataString = body.toString(); //Stringify the json to turn it to object
      var dataObj = JSON.parse(dataString);
      var eventi = dataObj._embedded;
      if (!eventi){
        res.render('error');
      }
      else{
        var e0 = [eventi.events[0].name, eventi.events[0].url, eventi.events[0].dates.start.localDate, eventi.events[0].dates.start.localTime];
        var e1 = [eventi.events[1].name, eventi.events[1].url, eventi.events[1].dates.start.localDate, eventi.events[1].dates.start.localTime];
        var e2 = [eventi.events[2].name, eventi.events[2].url, eventi.events[2].dates.start.localDate, eventi.events[2].dates.start.localTime];
        var e3 = [eventi.events[3].name, eventi.events[3].url, eventi.events[3].dates.start.localDate, eventi.events[3].dates.start.localTime];
        var e4 = [eventi.events[4].name, eventi.events[4].url, eventi.events[4].dates.start.localDate, eventi.events[4].dates.start.localTime];
        res.render('listevents',{e0, e1, e2, e3, e4})
    }
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
  var la = req.query.latitudine;
  var lo = req.query.longitudine;
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
    var lalo=la+','+lo;
    // var lalox='51.50853,-0.12574';


    var url = 'https://app.ticketmaster.com/discovery/v2/events.json?apikey='+ak_ticketm+'&latlong='+lalo+'&startDateTime='+dataact+'T00:00:00Z&size=5';
    request.get({url:url}, function Callback(err, httpResponse, body) {
      if(!err && response.statusCode == 200){
          
          var dataString = body.toString(); //Stringify the json to turn it to object
          var dataObj = JSON.parse(dataString);
          var eventi = dataObj._embedded;
          if (!eventi){
              res.render('error');
          }
          else{
              var e0 = [eventi.events[0].name, eventi.events[0].url, eventi.events[0].dates.start.localDate, eventi.events[0].dates.start.localTime];
              var e1 = [eventi.events[1].name, eventi.events[1].url, eventi.events[1].dates.start.localDate, eventi.events[1].dates.start.localTime];
              var e2 = [eventi.events[2].name, eventi.events[2].url, eventi.events[2].dates.start.localDate, eventi.events[2].dates.start.localTime];
              var e3 = [eventi.events[3].name, eventi.events[3].url, eventi.events[3].dates.start.localDate, eventi.events[3].dates.start.localTime];
              var e4 = [eventi.events[4].name, eventi.events[4].url, eventi.events[4].dates.start.localDate, eventi.events[4].dates.start.localTime];
              res.render('todaylist',{e0, e1, e2, e3, e4})
          }

          //res.send(eventi.events[0]);
          
      }
      else{
          console.log(error);
      }

  });
})

// LiveChat 
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
  j = [];
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
            
            jacopobrune = [];

            channel.consume(queue, function(msg) {      // prelevo le informazioni dalla coda
                var x =msg.content.toString() 
                jacopobrune.push(x);
                i = i + 1;
            }, {
                noAck: true
            });
        });
    });
    
    //res.send(jacopobrune)
    lungharr = jacopobrune.length;
    res.render('logad', {jacopobrune, lungharr});
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
        user.picture = payload.picture;
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