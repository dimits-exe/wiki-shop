exports.userDao = class{


    constructor(users){
        this.users=users;
    }

    addUser(user){
        this.users.push(user);
    }

    getUserByUsername(username){
        for (let x in this.users){
            if (this.users[x].username==username){
                return this.users[x];
            }
        }
    }

    checkSessionID(sID, user){
        return user.sessionId==sID;
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