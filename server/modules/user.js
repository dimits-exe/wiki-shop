exports.User = class {
    constructor(username, password){
        this.username=username;
        this.password=password;
        this.sessionId=undefined;
        this.cart=[];
    }

    getCartSize(){
        let size=0;
        if (this.cart.length>0){
            for (let x in this.cart){
                size += this.cart[x].quantity;
            }
        }
        return {'size': size};
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

    generateCart(){
        let cost = this.calculateTotalCost();
        let object = {cartItems: this.cart, totalCost: cost};
        return object;
    }

}