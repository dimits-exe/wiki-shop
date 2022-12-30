"use strict"

const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")

const SUBCATEGORY_TEMPLATE = document.getElementById("subcategory-template")
const STORE_CONTAINER = document.getElementById("store-container")

/**
 * Create a new store object which loads and holds data about categories,
 * subcategories and products
 * 
 * @dimits-exe
 */
class Store {
    #categories = {}
    #subcategories = {}
    #products = []

    /**
     * Returns a fully initialized store. Use this method instead of a constructor
     * to guarantee the data is loaded before they are accessed by other methods.
     * @returns a loaded store object
     */
    static async constructStore() {
        let store = new Store()
        await store.#initialize()

        console.log(store.categories);
        return store
    }

    /**
     * Do NOT use the default constructor, use the async 
     * constuctStore factory class method instead.
     */
    constructor() {}

    get categories() { return structuredClone(this.#categories) }

    get subcategories() { return structuredClone(this.#subcategories) }

    get products() { return structuredClone(this.#products) }

    loadFrontPage() {
        // if we are indeed on the front page
        // zafeiri xero oti einai apaisio pls min me skotoseis exo oikogeneia
        if (CATEGORY_CONTAINER !== null) {
            displayTemplate(CATEGORY_TEMPLATE.textContent, { categories: this.#categories }, CATEGORY_CONTAINER)
        }
    }

    /**
    * Display the selected category based on the url of the category page.  
    * @param {string} subset the id of the selected subcategory to be displayed or "all" to display all the subcategories
    */
    displayCategory(subset = "all") {
        let categoryId = parseInt(urlGetCategory())
        let category = this.#categories[categoryId]
        this.#displaySubCategories(category, subset)
    }

    /**
     * Display a subset or all of the subcategories 
     * @param {obj} category the category to be displayed
     * @param {string} subset the id of the selected subcategory to be displayed or "all" to display all the subcategories   
     */
    #displaySubCategories(category, subset = "all") {
        let selectedSubcategories = this.#subcategories[category.id + 1]

        // TODO: filter subcategories
        for (let subcategory of selectedSubcategories) {
            let selectedProducts = this.#products.filter(
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
    * Create a store object to hold information about the categories, subcategories
    * and products.
    */
    async #initialize() {
        try {
            this.#categories = await this.#loadCategories()
            await this.#loadSubcategories(this.#categories, this.#subcategories)
            await this.#loadProducts(this.#categories, this.#products)
            this.#products = this.#products.flat()
        } catch (error) {
            onError(error)
        }
    }

    /**
     * Get the subcategories of all categories.
     * @param {obj} categories a list of objects describng all the categories
     * @param {obj} subcategories an object to be filled by the subcategories
     * @returns a promise resolving when the subcategories object is filled
     */
    #loadSubcategories(categories, subcategories) {
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
    #loadProducts(categories, products) {
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
     * Get the main product categories from the remote server.
     * @returns a promise resolving into an object holding an array of all the categories
     */
    #loadCategories() {
        return fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories", { method: "GET" })
            .then(res => res.json())
    }
}

function main() {
    async function sex() {
        let store = await Store.constructStore()
        console.log(store.categories);

        store.loadFrontPage()
        store.displayCategory("all")
    }

    sex()
}



/**
 * Display an object to the html page according to a handlebars template.
 * @param {string} template the handlebars template as text
 * @param {obj} obj the object to be used in the template
 * @param {HTMLElement} container the html container of the template
 */
function displayTemplate(template, obj, container) {
    let compiledTemplate = Handlebars.compile(template)
    container.innerHTML = compiledTemplate(obj)
    console.log(compiledTemplate(obj));
}

/**
 * Query the URL to select the index of the selected category.
 * @returns the index of the selected category
 */
function urlGetCategory() {
    let url = document.URL.split("?")[1]
    let params = new URLSearchParams(url)
    return params.get("id") - 1 // index = id - 1 because the categories are placed sorted in an array
}


/**
 * Display an error message
 * @param {string} errorMessage the error message
 */
function onError(errorMessage) {
    console.log(errorMessage);
}


let store = {}
main()
