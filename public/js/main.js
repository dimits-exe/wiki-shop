"use strict"

const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")


getCategories().then(obj =>
    displayTemplate(CATEGORY_TEMPLATE.textContent, obj, CATEGORY_CONTAINER))

createStore()


function displayTemplate(template, obj, container) {
    let compiledTemplate = Handlebars.compile(template)
    container.innerHTML = compiledTemplate(obj)
}


function getCategories() {
    return fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories", { method: "GET" })
        .then(res => res.json()).then(obj => new Promise((resolve, reject) => {
            resolve({categories: obj})
        }))
}

function createStore() {
    let subcategories = {}
    let products = {}
    let store = {}
    
    Promise.all([
        getCategories().then(obj => getSubcategories(obj, subcategories))
        .then(console.log(subcategories)),

        getCategories().then(obj => getProducts(obj, products))
        .then(console.log(products))
    ]).then(console.log("sex"))

    console.log("finished");

}

function createStore(subcategories, products){
    
}


function getSubcategories(categories, subcategories) {
    let promises = []
    subcategories.category = []

    function sex(contents) {
        subcategories.category.push(contents)
    }

    for (let category of categories.categories) {
        promises.push(new Promise(() =>
            fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories/" + category.id
                + "/subcategories", { method: "GET" })
                .then(obj => obj.json())
                .then(subCategoryList => sex(subCategoryList)))
        )
    }

    return Promise.all(promises)
}


function getProducts(categories, products) {
    products.category = []
    function sex(contents) {
        products.category.push(contents)
    }
    let promises = []

    for (let category of categories.categories) {
        promises.push(new Promise(() =>
            fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories/" + category.id
                + "/products", { method: "GET" })
                .then(res => res.json())
                .then(productList => sex(productList)))
        )
    }

    return Promise.all(promises)
}


function onError(errorMessage) {
    console.log(errorMessage);
}
