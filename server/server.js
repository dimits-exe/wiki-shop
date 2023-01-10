//import { Dao } from './modules/dao.mjs';
//import { User } from './modules/user.mjs';
//import { Product } from './modules/product.mjs';
const { CallTracker } = require('assert');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path')
const app = express()
const port = 8080
//const dao = new Dao();
const userts = {username: "TestUser", password: "Admin1234"};

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
    if ((username === userts.username) && ( password === userts.password)){
        const sessionId = {sessionId: uuidv4()}
        res.send(sessionId);//TODO: CHANGE THIS ENTIRE IF STATEMENT ONCE DAOS ARE DONE
    }
    else{
        res.status(404).send(`User ${username} not found`);
    }
})

/*
    CIS
*/
app.post('/cart/buy', function(req, res){
    const username = req.body.username;
    const password = req.body.password;
    const product = req.body.product;
    const sessionId = req.body.sessionId;

    //get user from username/password
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