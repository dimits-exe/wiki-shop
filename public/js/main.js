"use strict"

const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")

loadFrontPage()


function loadFrontPage() {
    let load = categories => displayTemplate(CATEGORY_TEMPLATE.textContent, {categories: categories}, CATEGORY_CONTAINER)
    getCategories().then(categories => load(categories), err => onError(err))
}

/**
 * Display an object to the html page according to a handlebars template.
 * @param {string} template the handlebars template as text
 * @param {any} obj the object to be used in the template
 * @param {HTMLElement} container the html container of the template
 */
function displayTemplate(template, obj, container) {
    console.log(obj);
    let compiledTemplate = Handlebars.compile(template)
    container.innerHTML = compiledTemplate(obj)
    console.log(compiledTemplate(obj));
}

/**
 * Get the main product categories from the remote server.
 * @returns a promise resolving into an object holding an array of all the categories
 */
function getCategories() {
    return fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories", { method: "GET" })
        .then(res => res.json())
}

/**
 * Create a store object to hold information about the categories, subcategories
 * and products.
 */
function displayStore() {
    let subcategories = {}
    let products = {}

    Promise.all([
        getCategories().then(categories => getSubcategories(categories, subcategories)),
        getCategories().then(categories => getProducts(categories, products))
    ])
    .then(getCategories().then(categories => displayStore(categories, subcategories, products))) // this is idiotic and an antipattern 
    
}

function displayCategory(categories, subcategories, products, filter = undefined) {
    let category = categories[0] //TODO: make this filterable from link
    displaySubCategories(category, subcategories, products, filter)
}

function displaySubCategories(category, subcategories, products, filter = undefined){
    let selectedSubcategories = subcategories[category.id]
    // filter subcategories
    // handlebars code goes here
    for(let subcategoryId in selectedSubcategories) {
        displayProducts(products.filter(
            product => product.subcategory_id === subcategoryId))
    }
}

function displayProducts(products) {
    for(let product of products) {
        //handlebars code goes here
    }
}

/**
 * Get the subcategories of all categories.
 * @param {obj} categories a list of objects describng all the categories
 * @param {obj} subcategories an object to be filled by the subcategories
 * @returns a promise resolving when the subcategories object is filled
 */
function getSubcategories(categories, subcategories) {
    let promises = []

    /**
     * A curried function that adds a subCategory object to the index of its
     * respective category.
     * @param {obj} contents the subcategory object
     */
    function addSubCategory(contents) {
        let id = contents[0].category_id
        subcategories[id] = contents
    }

    for (let category of categories) {
        promises.push(new Promise(() =>
            fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories/" + category.id
                + "/subcategories", { method: "GET" })
                .then(obj => obj.json())
                .then(subCategoryList => addSubCategory(subCategoryList)))
        )
    }

    return Promise.all(promises)
}

/**
 * Get an object containing all the products by category.
 * @param {obj} categories all the categories
 * @param {obj} subcategories an object to be filled by the products
 * @returns a promise resolving when the product array is filled
 */
function getProducts(categories, products) {
    let promises = []

    /**
     * A curried function that adds a poduct object to the index of its
     * respective category.
     * @param {obj} productList an array of product objects
     */
    function addProducts(categoryId, productList) {
        products[categoryId] = productList
    }

    for (let category of categories) {
        let addProductsToCategory = products => addProducts(category.id, products)

        promises.push(new Promise(() =>
            fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories/" + category.id
                + "/products", { method: "GET" })
                .then(res => res.json())
                .then(productList => addProductsToCategory(productList)))
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
