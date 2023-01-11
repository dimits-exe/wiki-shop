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

    emptyCart(){
        this.cart=[];
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
        this.cart.forEach(item => totalcost+=(item.product.cost*item.quantity));
        return totalcost;
    }

    generateCart(){
        return {'cartItems': this.cart, 'totalCost': this.calculateTotalCost()};
    }

}