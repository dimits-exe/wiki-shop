"use strict";
const { User } = require('./modules/user.js')
const { userDao } = require('./modules/userdao.js');
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
const app = express();

// set port for server
const port = 8080;

// initialize DAO
const userdao = new userDao([]);

// create users and add them to dao
let testuser = new User("TestUser", "Admin1234");
let testuser2 = new User("NotTestUser", "Admin4321");
userdao.addUser(testuser);
userdao.addUser(testuser2);

// initialize server
app.listen(port, () => console.log(`listening at ${port}`));

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

// ================ SERVER HTTP REQUEST HANDLING FUNCTIONS =====================

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
    Handles login post requests and assigns a sessionId to a user if the username/password input is correct
    if not, it sends an error code based on what went wrong
*/
app.post('/account/login', function(req, res){
    try{
        const username = req.body.username;
        const password = req.body.password;
        console.log(`login request received from User ${username}`);
        if (userdao.checkPassword(username, password)){
            const user = userdao.getUserByUsername(username);
            const sessionId = {'sessionId': uuidv4()};
            user.sessionId=sessionId.sessionId;
            user.emptyCart(); //if a database was implemented we could use (username,sessionId) as the primary key and have 1 cart for each combination but for now we have to reset the cart array every time a new sessionId is assigned to a user
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
    }
    catch (error){
        res.status(400).send(`Unknown Error while logging in`);
    }
})

/*
    CIS
    Handles buy post requests by re-validating the user and if all goes well, adds item to user's cart and sends a success status code/message
    Else, sends error code based on what went wrong
*/
app.post('/cart/buy', function(req, res){
    const username = req.body.username;
    const product = req.body.product;
    const item = {product: product, quantity: 1}
    const sessionId = req.body.sessionId;
    const user = userdao.getUserBySessionId(sessionId);
    try{
        if(userdao.checkSessionId(sessionId, user)){
            user.addToCart(item);
            console.log(user);
            res.status(200).send(`User ${username} has bought item ${item.product.title}`);
        }
        else{
            res.status(401).send(`user and sessionId do not match`)
        }
    }
    catch(error){
        res.status(400).send('Unknown Error while buying item')
    }
})

/*
    CSS
    Handles get requests for the user's cart's size.
    Sends a success code and the user's cart size if the user's username and sessionId match with the server's DAO's info.
    Else, sends error code based on what went wrong
*/
app.get('/cart/size/', function(req, res){
    try{
        const username = req.query.username;
        const sessionId = req.query.sessionId;
        const user = userdao.getUserByUsername(username);
        if(userdao.checkSessionId(sessionId, user)){
            res.status(200).send(user.getCartSize());
        }
        else{
            res.status(401).send(`user and sessionId do not match`)
        }
    }
    catch(error){
        res.status(400).send('Unknown Error while showing cart size');
    }
})

/*
    CRS
    Handles get requests for the user's cart info.
    Sends a success code and a JS Object containing formatted information about the cart if the user's username and sessionId match with the server's DAO's info
    Else, sends error code based on what went wrong
*/
app.get('/cart/current', function(req, res){
    try{
        const username = req.query.username;
        const sessionId = req.query.sessionId;
        if(userdao.getUserByUsername(username)){
            const user = userdao.getUserByUsername(username);
            if(userdao.checkSessionId(sessionId, user)){
                res.status(200).send(user.generateCart());
                console.log(user.generateCart());
            }
            else{
                res.status(401).send(`User and SessionId do not match`);
            }
        }
        else{
            res.status(404).send(`User ${username} not found`);
        }
    }
    catch(error){
        res.status(400).send('Unknown Error while displaying cart');
    }
})