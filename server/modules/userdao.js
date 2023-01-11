exports.userDao = class{


    constructor(users){
        this.users=users;
    }

    addUser(user){
        this.users.push(user);
    }

    getUserBySessionId(sessionId){
        for (let x in this.users){
            if (this.users[x].sessionId==sessionId){
                return this.users[x];
            }
        }
    }

    getUserByUsername(username){
        for (let x in this.users){
            if (this.users[x].username==username){
                return this.users[x];
            }
        }
    }

    checkSessionId(sId, user){
        return user.sessionId==sId;
    }

    checkPassword(username, password){
        if(this.getUserByUsername(username)){
            let user = this.getUserByUsername(username);
            if (user.password==password){
                return true;
            }
        }
        else{return false};
    }
}