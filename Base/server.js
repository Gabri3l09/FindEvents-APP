// setto elementi indispensabili per la realizzazione dell'applicazione
require('dotenv').config()
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser')
var request = require('request');
var bodyParser = require("body-parser");
const fs = require('fs');

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


// Settare la porta e definire vari tools da utilizzare
const PORT = process.env.PORT || 5000;
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());


// variabili utili
var user;

// pagina di index
app.get('/', (req, res) =>{
    res.render('index')
})

// Pagina per effettuare la conferma dell'accesso tramite google
app.post('/login', (req, res) =>{
    let token = req.body.token;
    console.log(token);
    
    async function verify() {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        console.log(payload);
    }
    verify().then(()=>{
        res.cookie('session-token', token);
        res.send('success');
    }).catch(console.error);
    
})


// Pagina per effettuare l'accesso sul calendar
app.get('/accedi_calendar', checkAuthenticated, function(req, res){
    // data_calendar = req.query.data;
    event_calendar = req.query.evento;
    ora_calendar = req.query.ora;
    ora_fine = ora_calendar;
    res.redirect("https://accounts.google.com/o/oauth2/v2/auth?scope=https://www.googleapis.com/auth/calendar.events&response_type=code&include_granted_scopes=true&state=state_parameter_passthrough_value&redirect_uri="+red_uri+"&client_id="+client_id);
  });

// Pagina per l'inserimento effettivo dell'evento sul calendario
  app.get('/confirmins', function(req, res){
    var formData = {
      code: req.query.code,
      client_id: client_id,
      client_secret: client_secret,
      redirect_uri: red_uri,
      grant_type: 'authorization_code'
    }
  
    request.post({url:'https://www.googleapis.com/oauth2/v4/token', form: formData}, function optionalCallback(err, httpResponse, body) {
      if (err) {
        return console.error('upload failed:', err);
      }
      console.log('Upload successful!  Server responded with:', body);
      var info = JSON.parse(body);
  
      a_t = info.access_token;
  
      var url = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
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
  
      request.post({headers: headers, url: url, body: JSON.stringify(b)}, function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
          //var info = JSON.parse(body);
          //console.log(info);
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
  /*
  Da inserire contenuto relativo alle api dell'evento
  */
  data_calendar = req.body.data;
  res.render('listevents', {data_calendar}/*{Parametri da passare}*/);
})

// Lista eventi odierni intorno all'utente
app.get('/today', checkAuthenticated, (req, res) =>{
  res.render('today', {user});
})

// Lista eventi odierni intorno all'utente
app.get('/todaylist', checkAuthenticated, (req, res) =>{
  var la = req.query.latitudine;
  var lo = req.query.longitudine;
  res.render('todaylist', {lo, la});
})

// LiveChat 
app.get('/chat', checkAuthenticated, (req, res) => {
  res.render('chat');
})

// Logout
app.get('/logout', (req, res) =>{
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