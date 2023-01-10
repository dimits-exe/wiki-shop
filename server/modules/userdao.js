exports.userDao = class{


    constructor(users){
        this.users=users;
    }

    addUser(user){
        this.users.push(user);
    }

    getUserByUsername(username){
        for (let user of this.users){
            if (user.username==username){
                return user;
            }
        }
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