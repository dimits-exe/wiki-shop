"use strict"

const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")

const SUBCATEGORY_TEMPLATE = document.getElementById("subcategory-template")
const STORE_CONTAINER = document.getElementById("store-container")

loadFrontPage()
displayStore()


function loadFrontPage() {
    // if we are indeed on the front page
    // zafeiri xero oti einai apaisio pls min me skotoseis exo oikogeneia
    if (CATEGORY_CONTAINER !== null) {
        let load = categories => displayTemplate(CATEGORY_TEMPLATE.textContent, { categories: categories }, CATEGORY_CONTAINER)
        getCategories().then(categories => load(categories), err => onError(err))
    }
}

/**
 * Display an object to the html page according to a handlebars template.
 * @param {string} template the handlebars template as text
 * @param {any} obj the object to be used in the template
 * @param {HTMLElement} container the html container of the template
 */
function displayTemplate(template, obj, container) {
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
async function displayStore() {
    let subcategories = {}
    let products = []
    let categories

    try {
        categories = await getCategories()
        await getSubcategories(categories, subcategories)
        await getProducts(categories, products)
        displayCategory(categories, subcategories, products)
    } catch (error) {
        onError(error)
    }

}

function displayCategory(categories, subcategories, products, filter = undefined) {
    let category = categories[0] //TODO: make this filterable from link
    displaySubCategories(category, subcategories, products, filter)
}

function displaySubCategories(category, subcategories, products, filter = undefined) {
    let selectedSubcategories = subcategories[category.id]

    // TODO: filter subcategories
    for (let subcategory of selectedSubcategories) {
        let selectedProducts = products.flat().filter(
            product => product.subcategory_id === subcategory.id)

        let subcategoryDisplay = {
            name: subcategory.title,
            products: selectedProducts
        }

        const container = document.createElement("div")
        displayTemplate(SUBCATEGORY_TEMPLATE.textContent, subcategoryDisplay, container)
        console.log(container.innerHTML);
        STORE_CONTAINER.appendChild(container)
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
        promises.push(new Promise(resolve =>
            resolve(fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories/" + category.id
                    + "/subcategories", { method: "GET" })
                    .then(obj => obj.json())
                    .then(subCategoryList => addSubCategory(subCategoryList))))
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
    function addProducts(productList) {
        products.push(productList)
    }

    for (let category of categories) {
        let addProductsToCategory = products => addProducts(products)

        promises.push(new Promise(resolve =>
            resolve(fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories/" + category.id
                + "/products", { method: "GET" })
                .then(res => res.json())
                .then(productList => addProductsToCategory(productList))))
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
