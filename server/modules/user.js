/**
 * A class that keeps track of the user's details.
 * @author Ioannis Gkionis
 */
exports.User = class {
    /**
     * Constructs an instance of the user class
     * @param {string} username the user's name
     * @param {string} password the user's password
     */
    constructor(username, password){
        this.username=username;
        this.password=password;
        this.sessionId=undefined;
        this.cart=[];
    }

    /**
     * gets a user's cart size
     * @returns a JS object that contains the user's cart size
     */
    getCartSize(){
        let size=0;
        if (this.cart.length>0){
            for (let x in this.cart){
                size += this.cart[x].quantity;
            }
        }
        return {'size': size};
    }

    /**
     * Empties the user's cart, called by the server every time a new sessionId is assigned to a user
     */
    emptyCart(){
        this.cart=[];
    }

    /**
     * Adds item to user's cart
     * @param {Object} item the item to be added to the cart
     */
    addToCart(item){
        const index = this.cart.findIndex(object => object.product.id === item.product.id);
        if(index === -1){
            this.cart.push(item);
        }
        else{
            this.cart[index].quantity++;
        }
    }

    /**
     * Calculates the total cost of the items in a user's cart
     * @returns (int) the total cost of the user's cart
     */
    calculateTotalCost(){
        let totalcost=0;
        this.cart.forEach(item => totalcost+=(item.product.cost*item.quantity));
        return totalcost;
    }

    /**
     * Method used by the server to generate a user's cart info, used by CRS to send and later display cart data
     * @returns correctly formatted data about user's cart
     */
    generateCart(){
        return {'cartItems': this.cart, 'totalCost': this.calculateTotalCost()};
    }

}