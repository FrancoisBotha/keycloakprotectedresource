var express = require("express");
var app = express();
var cors = require('cors');
var Keycloak = require('keycloak-connect');
var session = require('express-session');

app.use(cors({
  origin: 'http://localhost:8080'
}));

/***************************
 * INTEGRATE WITH KEYCLOAK *
 ***************************/

// 1. Create a session memory store
var memoryStore = new session.MemoryStore();
 
// 2. Establish a session
app.use(session({
  secret: 'some secret',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}));

// 3. Configure keycloak 
var ckConfig = {
  clientId: "vueclient",
  bearerOnly: true,
  serverUrl: "http://localhost:8085/auth",
  realm: "AuthSrvTest"
};


// 4. Instantiate keycloak 
var keycloak = new Keycloak({store: memoryStore},ckConfig);

// 5. Set Express to use Keycloak
app.use( keycloak.middleware() );

// 6. Protect all routes
app.all('*', keycloak.protect());

var getAccessToken = function(req, res, next) {

  var inToken = null;
  var auth = req.headers['authorization'];

  var token = {
    "access_token": "SOME_TOKEN",
    "clientId": "oauth-client-1",
    "scope": ["foo"]
    }

  req.access_token = null; 

  if (auth && auth.toLowerCase().indexOf('bearer') == 0) {
    
    inToken = auth.slice('bearer '.length);
    console.log(inToken)

    if (inToken === "SOME_TOKEN") {
      req.access_token = token;
    }
  }  
  next();
  return;

};

var requireAccessToken = function(req, res, next) {
    if (req.access_token) {
    next();
    } else {
    res.status(401).end();
    }
};

app.get("/fruit", (req, res, next) => {
    console.log('Getting the fruit');
    res.json(["Apple","Pear","Grape","Orange", "Banana"]);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
 });