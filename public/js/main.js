"use strict"

const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")


getCategories().then(obj =>
    displayTemplate(CATEGORY_TEMPLATE.textContent, obj, CATEGORY_CONTAINER))

createStore()


/**
 * Display an object to the html page according to a handlebars template.
 * @param {string} template the handlebars template as text
 * @param {any} obj the object to be used in the template
 * @param {HTMLElement} container the html container of the template
 */
function displayTemplate(template, obj, container) {
    let compiledTemplate = Handlebars.compile(template)
    container.innerHTML = compiledTemplate(obj)
}

/**
 * Get the main product categories from the remote server.
 * @returns an object holding an array of all the categories
 */
function getCategories() {
    return fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories", { method: "GET" })
        .then(res => res.json()).then(obj => new Promise((resolve, reject) => {
            resolve({categories: obj})
        }))
}

/**
 * Create a store object to hold information about the categories, subcategories
 * and products.
 */
function getStore() {
    let subcategories = {}
    let products = {}
    let store = {}

    function assignStore(storeContents){
        store = storeContents
    }
    
    Promise.all([
        getCategories().then(obj => getSubcategories(obj, subcategories))
        .then(console.log(subcategories)),

        getCategories().then(obj => getProducts(obj, products))
        .then(console.log(products))
    ]).then(createStore(subcategories, products)).then(obj => assignStore(obj))

}

/**
 * Create the store object
 * @param {obj} subcategories an object holding the subcategories of each cateogory 
 * @param {*} products an object holding the products of each category
 * @returns a hierarchical object containing the products of each subcategory of
 * each category
 */
function createStore(subcategories, products) {
    for(let product in products) {
        
    }
    
}

/**
 * Get the subcategories of all categories.
 * @param {obj} categories all the categories
 * @param {obj} subcategories an object to be filled by the subcategories
 * @returns a promise resolving when the subcategories object is filled
 */
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

/**
 * Get the products of all categories.
 * @param {obj} categories all the categories
 * @param {obj} subcategories an object to be filled by the products
 * @returns a promise resolving when the subcategories object is filled
 */
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

/**
 * Display an error message
 * @param {string} errorMessage the error message
 */
function onError(errorMessage) {
    console.log(errorMessage);
}
