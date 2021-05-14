require('dotenv').config()

const express = require('express');
const app = express();
const cookieParser = require('cookie-parser'); 
const songkickApikey = "vuoto";
const https = require("https");

//Google Auth
const {OAuth2Client} = require('google-auth-library'); // npm install google-auth-library
const CLIENT_ID = '940150220374-b6v6om4tatafntgcihdk9od4vti7c74c.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);

const PORT = process.env.PORT || 5000;

// Middleware
app.set('view engine', 'ejs');
app.use(express.json());
app.use(cookieParser());


app.get('/', (req, res) =>{
    res.render('index')
})

app.get('/login', (req, res) =>{
    res.render('login')
})

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

app.get('/dashboard', checkAuthenticated, (req, res) =>{
    let user = req.user;
    res.render('dashboard', {user});
})

app.get('/protectedroute', checkAuthenticated, (req, res) =>{
    let user = req.user;
    res.render('protectedroute', {user});
})



app.get('/logout', (req, res) =>{
    res.clearCookie('session-token');
    res.redirect('/login');
})

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
        res.redirect('/login');
    });
}
//  API : SongkickAPI upcomingevent
//  URI : /upcomingevent/:venue
//  ex  : https://api.songkick.com/api/3.0/search/venues.json?query=colloseum&apikey=1232312
//  usage : http://localhost:9000/upcomingevent/colloseum
app.get('/upcomingevent', function(req, res){
    console.log(req);
     url = `https://api.songkick.com/api/3.0/search/venues.json?query=`+encodeURIComponent(req.query.venue)+`&apikey=${songkickApikey}`;
     var resbody = "";
     var venue_id = "";
     var calendarurl = "";
     var resbody2 = "";
 
     console.log(url);
 
     https.get(url, res=>{
         res.setEncoding("UTF-8");
         
         res.on("data", data => {
             resbody += data; 
         });
         
         res.on("end", () => {
             resbody = JSON.parse(resbody);
             console.log(resbody);
             console.log(resbody.resultsPage.totalEntries);
             console.log(resbody.resultsPage.totalEntries == 0);
             if(resbody.resultsPage.totalEntries == 0){
                 res7.json(resbody);
             }else{
                 venue_id = resbody.resultsPage.results.venue[0].id;
                 console.log("venue_id"+venue_id);
                 
                 calendarurl = `https://api.songkick.com/api/3.0/venues/${venue_id}/calendar.json?apikey=${songkickApikey}`;
                 https.get(calendarurl, res => {
                     res.setEncoding("utf8");
 
                     res.on("data", data => {
                         resbody2 += data;
                     });
                     res.on("end", () => {
                         resbody2 = JSON.parse(resbody2);
                         console.log(resbody2);
 
                         res7.json(resbody2);
                     });
 
                     resbody2 = "";
                     calendarurl = "";
                     venue_id = "";
                 });       
             }
             resbody = "";
         });
     });
 });
 


app.listen(PORT, () =>{
    console.log('Server running on port: ' + PORT);
})