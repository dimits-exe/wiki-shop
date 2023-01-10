const { User } = require('./modules/user.js')
const { userDao } = require('./modules/userdao.js');
const { CallTracker } = require('assert');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express()
const port = 8080

const userdao = new userDao([]);
userts = new User("TestUser", "Admin1234");
userdao.addUser(userts);

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
    const username = req.body.username;
    const password = req.body.password;
    console.log(`login request received from User ${username}`);
    if (userdao.checkPassword(username, password)){
        const sessionId = {sessionId: uuidv4()}
        userdao.getUserByUsername(username).sessionId=sessionId.sessionId;
        res.send(sessionId);
    }
    else{
        if(userdao.getUserByUsername(username)){
            res.status(401).send(`Incorrect Password`);
        }
        else{
            res.status(404).send(`User ${username} not found`);
        }
    }
})

/*
    CIS
*/
app.post('/cart/buy', function(req, res){
    const username = req.body.username;
    const product = req.body.product;
    const sessionId = req.body.sessionId;

    //get user from username
    //update user's cart
    //update products list
    //send success/error message to user

    res.send('you buy)')
})

/*
    CSS
*/
app.get('/cart/size/', function(req, res){
    const username = req.body.username;
    const sessionId = req.body.sessionId;
    //search username in users list
    //return cart size of said user (getCartSize) or return a 404 error
    res.send('cart size as big as mom(')
})

/*
    CRS
*/
app.get('/cart/current', function(req, res){
    const username = req.body.username;
    const sessionId = req.body.sessionId;
    //search username in users list
    //return cart
    res.send('hit the gym fattie')
})