const { CallTracker } = require('assert');
const express = require('express');
const { logger } = require('handlebars');
const { v4: uuidv4 } = require('uuid');
const path = require('path')
const app = express()
const port = 8080

const userts = {username: "mevaranespitimou", password: "Dimitris69"};

app.listen(port, () => console.log("listening at" + port.toString()));

/* 
    Serve static content from directory "public",
    it will be accessible under path /, 
    e.g. http://localhost:8080/index.html
*/
app.use(express.static('public'))

// parse url-encoded content from body
app.use(express.urlencoded({ extended: false }))

// parse application/json content from body
app.use(express.json())

// serve index.html as content root
app.get('/', function(req, res){

    var options = {
        root: path.join(__dirname, 'public')
    }

    res.sendFile('index.html', options, function(err){
        console.log(err)
    })
})

/*
    LS
*/
app.post('/account/login', function(req, res){
    let username = req.body.username;
    let password = req.body.password;
    console.log('login request received from' + username.toString());
    if ((username === userts.username) && ( password === userts.password)){
        console.log("sex")
        let sessionId = uuidv4();
        res.send(sessionId);
    }
    else{
        console.log("sex sex")
        res.send('user does not exist');
    }
})

/*
    CIS
*/
app.post('/cart/buy', function(req, res){
    
    res.send('you buy)')
})

/*
    CSS
*/
app.get('/cart/size/', function(req, res){
    
    res.send('cart size as big as mom(')
})

/*
    CRS
*/
app.get('/cart/current', function(req, res){
    
    res.send('hit the gym fattie')
})