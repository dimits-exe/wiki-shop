export class dao{
    constructor(){
        this.users=[];
        this.products=[];
    }

    addProduct(prod){
        this.products.push(prod);
    }

    addUser(user){
        this.users.push(user);
    }

    getUserbyUsername(username){
        for (let user of this.users){
            if (user.username==username){
                return user;
            }
        }
    }

    checkPassword(username, password){
        let user = this.getUserbyUsername(username);
        if (user.password==password){
            return true;
        }
        else{return False};
    }
}

module.exports = dao;