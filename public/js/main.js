"use strict"

import { Store } from "./modules/store.mjs"
import { User } from "./modules/user.mjs"
import { HideableWrapper, displayTemplate, showLabel, hideLabel, checkValidity, swapPasswordType } from "./modules/ui.mjs"

const HOST_URL = "http://localhost:8080"
const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")

const SUBCATEGORY_TEMPLATE = document.getElementById("subcategory-template")
const PRODUCTS_CONTAINER = document.getElementById("products-container")
const MENU_CONTAINER = document.getElementById("subcategories-menu")
const MENU_TEMPLATE = document.getElementById("subcategories-menu-template")
const CART_SIZE_LABEL = document.getElementById("cart-size-label")
const CHECKOUT_BUTTON = document.getElementById("checkout-button")

const LOGIN_SUCCESS = document.getElementById("login-success-label")
const LOGIN_FORM = document.getElementById("login-form")
const LOGIN_NAME_FIELD = document.getElementById("login-username")
const LOGIN_PASS_FIELD = document.getElementById("login-password")
const LOGIN_ERROR_LABEL = document.getElementById("login-error-label")
const LOGIN_BUTTON = document.getElementById("login-button")
const LOGIN_SHOW_PASS_BUTTON = document.getElementById("login-show-pass")

const SPINNER = new HideableWrapper(document.getElementById("loading-spinner"))

let store = null
let user = new User()


initializePage()

async function initializePage() {
    // load the rest of the UI before waiting for store to get loaded 
    
    if (document.URL === HOST_URL + "/index.html") {
        store = await Store.constructStore(CORS_PROXY_URL, SHOP_API_URL)
        // display main page
        displayTemplate(CATEGORY_TEMPLATE.textContent, { categories: store.categories }, CATEGORY_CONTAINER)
        SPINNER.hide()
    }

    // display category page
    if (document.URL.split("?")[0] === HOST_URL + "/category.html") {
        const STORE_WRAPPER = new HideableWrapper(document.getElementById("store-container"), true)
        
        LOGIN_SHOW_PASS_BUTTON.onclick = e => {
            e.preventDefault()
            swapPasswordType(LOGIN_PASS_FIELD)
        }
    
        LOGIN_BUTTON.onclick = async e => {
            SPINNER.show()
            e.preventDefault()
            await login()
            SPINNER.hide()
        }

        CHECKOUT_BUTTON.onclick = e => {e.preventDefault(); goToCart();}
        CHECKOUT_BUTTON.disabled = true // becomes enabled when logged in

        store = await Store.constructStore(CORS_PROXY_URL, SHOP_API_URL)
        SPINNER.hide()
        STORE_WRAPPER.show()
        
        const subcategories = store.getSubcategoriesFromURL()

        // build menu
        displayTemplate(MENU_TEMPLATE.textContent, { subcategories: subcategories }, MENU_CONTAINER)
        const SELECT_SUBCATEGORY_BUTTON = document.getElementById("select-subcategory-button")
        SELECT_SUBCATEGORY_BUTTON.onclick = () => displayCategory()

        // build page with all subcategories
        displayCategory()
    }

}

function displayCategory() {
    const subcategories = store.getSubcategoriesFromURL()

    // build category
    const subcategoryObjects = store.displayCategory(subcategories)
    PRODUCTS_CONTAINER.innerHTML = ""
    for (let object of subcategoryObjects) {
        const container = document.createElement("div")
        displayTemplate(SUBCATEGORY_TEMPLATE.textContent, object, container)
        PRODUCTS_CONTAINER.appendChild(container)
    }

    addPurchaseHandlers()
}

// ============= CART FUNCTIONS ===============

/**
 * Add handlers for the purchase buttons of each product.
 */
function addPurchaseHandlers() {
    const buttons = document.getElementsByClassName("purchase-button")

    for (let button of buttons) {
        button.onclick = async () => await addToCart(button.dataset.productId)
    }
}

/**
 * Sends a request to the server to add a product to the user's cart.
 * @param {string | int} productId product id
 */
async function addToCart(productId) {
    if (!user.isLoggedIn()) {
        onError("Please log in your account to purchase products")
    } else {
        const product = store.getProductById(parseInt(productId));

        const res = await addToCartRequest(product)
    
        if (!res.ok) {
            const text = await res.text()
            onError(text)
        } else {
            refreshCartSize()
        }
    }
}

/**
 * Construct a request that updates the user's cart with the provided product.
 * @param {obj} product the product object
 * @returns a promise which when resolved shows if the update request was successfull
 */
function addToCartRequest(product) {
    const formData = {
        username: user.username, sessionId: user.sessionId, product: product
    }

    return fetch(HOST_URL + "/cart/buy/", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
    })
}

/**
 * Refresh the cart displayed on the category page.
 */
async function refreshCartSize() {
    const res = await cartSizeRequest()

    if(res.ok) {
        const sizeObj = await res.json()
        CART_SIZE_LABEL.innerText = parseInt(sizeObj.size)
    } else {
        const text = res.text()
        // silently ignore error
        console.error(text)
    }
}

function cartSizeRequest() {
    const params = {username: user.username, sessionId: user.sessionId}
    const searchParams = new URLSearchParams(params)

    return fetch("/cart/size?" + searchParams, {
        method: "GET", headers: { "Content-Type": "application/json" }
    })
}

// ============= LOGIN FUNCTIONS ===============

/**
 * Implements the login procedure for a user.
 */
async function login() {
    if (checkValidity(LOGIN_FORM.id)) {
        let res = await loginRequest()

        if (!res.ok) {
            CHECKOUT_BUTTON.disabled = true

            let errorMsg = await res.text()
            hideLabel(LOGIN_SUCCESS)
            showLabel(LOGIN_ERROR_LABEL, "Error while logging-in: " + errorMsg)
            
        } else {
            CHECKOUT_BUTTON.disabled = false

            let sessionId = await res.json()
            user.username = LOGIN_NAME_FIELD.value

            console.log(sessionId)
            user.sessionId = sessionId.sessionId

            hideLabel(LOGIN_ERROR_LABEL)
            showLabel(LOGIN_SUCCESS, "Welcome " + user.username)
        }

    }
}

/**
 * Send a request to the server to authenticate an existing user.
 * @returns a promise that contains a sessionId or a error when resolved
 */
function loginRequest() {
    const formData = {
        username: LOGIN_NAME_FIELD.value, password: LOGIN_PASS_FIELD.value,
    }

    return fetch(HOST_URL + "/account/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
    })
}

/**
 * Send the user to the cart page with his login details encoded in the URL.
 */
function goToCart() {
    const params = {username: user.username, sessionId: user.sessionId}
    const searchParams = new URLSearchParams(params)

    window.location = `${HOST_URL}/cart.html?${searchParams}`
}

function onError(errorMessage) {
    alert(errorMessage)
}