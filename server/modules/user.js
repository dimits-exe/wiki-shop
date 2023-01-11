const e = require("express");

exports.User = class {
    constructor(username, password){
        this.username=username;
        this.password=password;
        this.sessionId=undefined;
        this.cart=[];
    }

    getCartSize(){
        const sizeObj = {'size': this.cart.length};
        return sizeObj;
    }


    addToCart(item){
        const index = this.cart.findIndex(object => object.product.id === item.product.id);
        if(index === -1){
            this.cart.push(item);
        }
        else{
            this.cart[index].quantity++;
        }
    }

    calculateTotalCost(){
        let totalcost=0;
        for (i in this.cart){
            let cost = this.cart[i].product.cost;
            totalcost = totalcost + cost*i.quantity;
        }
        return totalcost;
    }

}