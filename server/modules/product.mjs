export class Product{
    constructor(title, cost, quantity){
        this.title=title;
        this.cost=cost;
        this.quantity=quantity;
    }

    get title(){
        return this.title;
    }

    get cost(){
        return this.cost;
    }

    get quantity(){
        return this.quantity;
    }

    set quantity(quantity){
        this.quantity=quantity;
    }

}