/**
 * A pseudo-dao class used by the server to store users/carts/sessionIds
 * @author Ioannis Gkionis
 */
exports.userDao = class{

    /**
     * Constructs an instance of userDao class (only gets called once every time the server is initialized)
     * @param {Array[User]} users an array of registered users.
     */
    constructor(users){
        this.users=users;
    }

    /**
     * Adds user to DAO
     * @param {User} user the user to be added
     */
    addUser(user){
        this.users.push(user);
    }

    /**
     * Gets a user fom the DAO based on their sessionId
     * @param {string} sessionId the sessionId
     * @returns the user with said sessionId
     */
    getUserBySessionId(sessionId){
        for (let x in this.users){
            if (this.users[x].sessionId==sessionId){
                return this.users[x];
            }
        }
    }

    /**
     * Gets a user fom the DAO based on their username
     * @param {string} username the username
     * @returns the user with said username
     */
    getUserByUsername(username){
        for (let x in this.users){
            if (this.users[x].username==username){
                return this.users[x];
            }
        }
    }

    /**
     * Checks whether a sessionId is valid for a user
     * @param {string} sId the sessionId
     * @param {User} user the user
     * @returns 
     */
    checkSessionId(sId, user){
        return user.sessionId==sId;
    }

    /**
     * Checks whether a username and password match
     * @param {string} username the username
     * @param {string} password the password
     * @returns true if they match, false if they don't
     */
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