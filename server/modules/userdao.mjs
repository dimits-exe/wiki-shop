export class userDao{

    static async constructEmptyDao() {
        let dao = new userDao([],[]);
        await dao.#initialize();
        return dao;
    }

    constructor(users){
        this.users=users;
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