"use strict"

const HOST_URL = "http://localhost:8080" 
const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"
const STORAGE_ID = "sessionId";

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")

const SUBCATEGORY_TEMPLATE = document.getElementById("subcategory-template")
const STORE_CONTAINER = document.getElementById("store-container")
const MENU_CONTAINER = document.getElementById("subcategories-menu")
const MENU_TEMPLATE = document.getElementById("subcategories-menu-template")

const loginForm = document.getElementById("login-form")
const loginNameField = document.getElementById("login-username")
const loginPassField = document.getElementById("login-password")
const loginErrorLabel = document.getElementById("login-error-label")
const loginButton = document.getElementById("login-button")
const loginShowPassButton = document.getElementById("login-show-pass")
const spinner = document.getElementById("login-loading")

let store = null


/**
 * An object which loads and holds data about categories, subcategories and products
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

        return store
    }

    /**
     * Do NOT use the default constructor, use the async 
     * constuctStore factory class method instead.
     */
    constructor() {}

    // getters mostly for debug

    get categories() { return structuredClone(this.#categories) }

    get subcategories() { return structuredClone(this.#subcategories) }

    get products() { return structuredClone(this.#products) }

    /**
     * Load the main categories and display them to the front page.
     */
    loadFrontPage() {
        // if we are indeed on the front page
        // TODO: refactor
        if (CATEGORY_CONTAINER !== null) {
            displayTemplate(CATEGORY_TEMPLATE.textContent, { categories: this.#categories }, CATEGORY_CONTAINER)
        }
    }

    /**
     * (Re-)Initialize the store page based on the url of the category page.  
     */
    loadCategoryPage() {
        let subcategories = this.#getSubcategoriesFromURL()

        this.#buildCategoryMenu(subcategories)
        this.displayCategory(subcategories)
    }

    /**
     * Display the selected subcategories of the current category. Use loadCategoryPage to change
     * the currently displayed category.
     */
    displayCategory() {
        let subcategories = this.#getSubcategoriesFromURL()
        let selectedSubCat = this.#getSelectedSubcategory()
        this.#displaySubcategories(subcategories, selectedSubCat)
    }


    /**
     * Initialize the menu for the selected category.
     * @param {obj} subcategories the subcategories for the currently selected category 
     */
    #buildCategoryMenu(subcategories) {
        displayTemplate(MENU_TEMPLATE.textContent, {subcategories: subcategories}, MENU_CONTAINER)
    }

    /**
     * Get the id of the selected subcategory from the side menu.
     * @returns the id of the selected subcategory
     */
    #getSelectedSubcategory() {
        const selected = document.querySelector("input[name='categories']:checked")
        return selected.value
    }

    /**
     * Display a subset or all of the subcategories 
     * @param {[obj]} subcategories the subcategories to be displayed
     * @param {string} subset the id of the selected subcategory to be displayed or "all" to display all the subcategories   
     */
    #displaySubcategories(subcategories, subset = "all") {
        let selectedSubcategories

        if(subset === "all") 
            selectedSubcategories = subcategories
        else 
            selectedSubcategories = [subcategories[parseInt(subset) - 1]] // turn into array for uniform access
        
        // reset container contents
        STORE_CONTAINER.innerHTML = ""

        for (let subcategory of selectedSubcategories) {
            let selectedProducts = this.#products.filter(
                product => product.subcategory_id === subcategory.id)

            let subcategoryDisplay = {
                name: subcategory.title,
                products: selectedProducts
            }

            const container = document.createElement("div")
            displayTemplate(SUBCATEGORY_TEMPLATE.textContent, subcategoryDisplay, container)
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

    /**
     * Query the URL to select the subcategories of the selected category
     * @returns the selected subcategories
     */
    #getSubcategoriesFromURL() {
        let url = document.URL.split("?")[1]
        let params = new URLSearchParams(url)
        let categoryId = parseInt(params.get("id")) - 1

        let category = this.#categories[categoryId]
        let subcategories = this.#subcategories[category.id] // index = id - 1 because the categories are placed sorted in an array
        return subcategories
    }
}

initializePage() 

if (loginButton !== null) {
    loginShowPassButton.onclick = e => {
        e.preventDefault() 
        swapPasswordType(loginPassField) 
    }

    loginButton.onclick = async e => {
        showLabel(spinner) 
        e.preventDefault() 
        await login() 
        hideLabel(spinner) 
    }
}


async function initializePage() {
    store = await Store.constructStore()

    store.loadFrontPage()
    store.loadCategoryPage()
}

// ============= LOGIN FUNCTIONS ===============

/**
 * Implements the login procedure for a user.
 */
async function login() {
    if (checkValidity(loginForm.id)) {
        let res = await loginRequest() 

        if (!res.ok) {
            let errorMsg = await res.text() 
            showLabel(loginErrorLabel, "Error while logging-in: " + errorMsg) 
        } else {
            let resObj = await res.json() 
            console.log(resObj) 
            saveSessionId(resObj) 

            hideLabel(loginErrorLabel) 
            window.location = "index.html" 
        }

    }
}

/**
 * Send a request to the server to authenticate an existing user.
 * @returns a promise that contains a sessionId or a error when resolved
 */
function loginRequest() {
    const formData = {
        username: loginNameField.value, password: loginPassField.value,
    }

    return fetch(HOST_URL + "/user/login", {
        method: "POST", headers: {"Content-Type": "application/json"}, body: JSON.stringify(formData)
    }) 
}

/**
 * Save the current session ID.
 * @param {string} sessionId the newly acquired session ID
 */
function saveSessionId(sessionId) {
    window.sessionStorage.setItem(STORAGE_ID, sessionId);
}

/**
 * Get the last saved session ID.
 * @returns the last session ID
 */
function getSessionId() {
    return window.sessionStorage.getItem(STORAGE_ID);
}

/**
 * Delete the last session ID.
 */
function resetSessionId() {
    window.sessionStorage.removeItem(STORAGE_ID);
}

// ============= UI FUNCTIONS ===============

/**
 * Display an object to the html page according to a handlebars template.
 * @param {string} template the handlebars template as text
 * @param {obj} obj the object to be used in the template
 * @param {HTMLElement} container the html container of the template
 */
function displayTemplate(template, obj, container) {
    let compiledTemplate = Handlebars.compile(template)
    container.innerHTML = compiledTemplate(obj)
}


/**
 * Display an error message
 * @param {string} errorMessage the error message
 */
function onError(errorMessage) {
    console.log(errorMessage) 
}

/**
 * Display a hidden HTML element.
 * @param {HTMLElement} label the HTML element to be displayed
 * @param {string} message an optional message to be displayed in the element
 */
function showLabel(label, message = null) {
    if (message !== null) label.innerText = message 

    label.style.display = "block" 
}

/**
 * Hide a visible HTML element.
 * @param {HTMLElement} label the HTML element to be hidden
 */
function hideLabel(label) {
    label.style.display = "none" 
}

function checkValidity(formId) {
    let inputs = document.querySelectorAll(`#${formId} input`) 

    for (let input of inputs) {
        if (!input.checkValidity()) {
            input.reportValidity() 
            return false 
        }
    }
    return true 
}