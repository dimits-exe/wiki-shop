exports.User = class {
    constructor(username, password){
        this.username=username;
        this.password=password;
        this.sessionId=undefined;
        this.cart=[];
    }

    getCartSize(){
        const sizeObj = {"size": this.cart.length};
        return sizeObj;
    }

    addToCart(item){
        productTitle=item.title;
        var element={};
        element.product=item;
        element.quantity=1;
        let lett = this.cart.find(x => x.product.id==item.id);
        if (lett===undefined){
            this.cart.push(element);
        }
        else{
            lett.product.quantity++;
        }
    }

    calculateTotalCost(){
        let totalcost=0;
        for (i in this.cart){
            let cost = i.product.cost;
            totalcost = totalcost + cost*i.quantity;
        }
        return totalcost;
    }

}