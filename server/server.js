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

/*item1 = {'product': {title: 'sex', id: '132'}, quantity: 1};
item2 = {'product': {title: 'sex2', id: '11'}, quantity: 1};
userts.addToCart(item1);
userts.addToCart(item1);
console.log(userts)
userts.addToCart(item1);
console.log(userts)*///FOR DEBUGGING PURPOSES

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
        const user = userdao.getUserByUsername(username);
        const sessionId = {'sessionId': uuidv4()};
        user.sessionId=sessionId.sessionId;
        res.send(sessionId);
    }
    else{
        if(user){
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
    const item = {'product': product, quantity: 1}
    const sessionId = req.body.sessionId;
    const user = userdao.getUserByUsername(username);
    try{
        if(userdao.checkSessionID(sessionId, user)){
            user.addToCart(item);
            console.log(user);
            res.status(200).send(`User ${username} has bought item ${item.title}`);
        }
        else{
            res.status(401).send(`user and sessionID do not match`)
        }
    }
    catch(error){
        console.log(user);
        res.status(400).send('Item not buy(')
    }
})

/*
    CSS
*/
app.get('/cart/size/', function(req, res){
    try{
        const username = req.query.username;
        const sessionId = req.query.sessionID;
        const user = userdao.getUserByUsername(username);
        if(userdao.checkSessionID(sessionId, user)){
            console.log(user.cart);
            res.status(200).send(user.getCartSize());
        }
    }
    catch(error){
        res.status(400).send('Oopsie Woopsie, we made a fucky wucky >w<');
    }
    //get url search parameters
    //search username in users list
    //return cart size of said user (getCartSize) or return a 404 error
})

/*
    CRS
*/
app.get('/cart/current', function(req, res){
    try{
        const username = req.query.username;
        const sessionId = req.query.sessionID;
        const user = userdao.getUserByUsername(username);
        if(userdao.checkSessionID(sessionId, user)){
            console.log(user.cart);
            res.status(200).send(user.cart);
        }
    }
    catch(error){
        res.status(400).send('Oopsie Woopsie, we made a fucky wucky >w<');
    }
    //search username in users list
    //return cart
})