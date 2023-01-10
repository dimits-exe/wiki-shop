export class User{
    constructor(username, password){
        this.username=username;
        this.password=password;
        this.sessionId=undefined;
        this.cart=[];
    }

    get cart(){
        return this.cart;
    }

    get username() {
        return this.username;
    }

    get password() {
        return this.password;
    }

    get sessionId() {
        return this.sessionId;
    }

    set sessionId(sId){
        this.sessionId=sId;
    }

    getCartSize(){
        const sizeObj = {"size": this.cart.length};
        return sizeObj;
    }

    addToCart(item){
        this.cart.push(item)
    }

}