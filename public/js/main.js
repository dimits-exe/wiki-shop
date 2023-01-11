"use strict"

import { Store } from "./modules/store.mjs"
import { User } from "./modules/user.mjs"
import { displayTemplate, showLabel, hideLabel, checkValidity, swapPasswordType } from "./modules/ui.mjs"

const HOST_URL = "http://localhost:8080"
const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")

const SUBCATEGORY_TEMPLATE = document.getElementById("subcategory-template")
const STORE_CONTAINER = document.getElementById("store-container")
const MENU_CONTAINER = document.getElementById("subcategories-menu")
const MENU_TEMPLATE = document.getElementById("subcategories-menu-template")
const CART_SIZE_LABEL = document.getElementById("cart-size-label")

const loginSuccess = document.getElementById("success-label")
const loginForm = document.getElementById("login-form")
const loginNameField = document.getElementById("login-username")
const loginPassField = document.getElementById("login-password")
const loginErrorLabel = document.getElementById("login-error-label")
const loginButton = document.getElementById("login-button")
const loginShowPassButton = document.getElementById("login-show-pass")
const spinner = document.getElementById("login-loading")

let store = null
let user = new User()

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
    store = await Store.constructStore(CORS_PROXY_URL, SHOP_API_URL)

    if (document.URL === HOST_URL + "/index.html") {
        // display main page
        displayTemplate(CATEGORY_TEMPLATE.textContent, { categories: store.categories }, CATEGORY_CONTAINER)
    }


    // display category page
    if (document.URL.split("?")[0] === HOST_URL + "/category.html") {
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
    STORE_CONTAINER.innerHTML = ""
    for (let object of subcategoryObjects) {
        const container = document.createElement("div")
        displayTemplate(SUBCATEGORY_TEMPLATE.textContent, object, container)
        STORE_CONTAINER.appendChild(container)
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
    const requestURL = new URLSearchParams("/cart/size/")
    requestURL.set("username", user.username)
    requestURL.set("sessionId", user.sessionId)

    return fetch(requestURL, {
        method: "GET", headers: { "Content-Type": "application/json" }
    })
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
            hideLabel(loginSuccess)
            showLabel(loginErrorLabel, "Error while logging-in: " + errorMsg)
        } else {
            let sessionId = await res.json()
            user.username = loginNameField.value

            console.log(sessionId)
            user.sessionId = sessionId.sessionId

            hideLabel(loginErrorLabel)
            showLabel(loginSuccess, "Welcome " + user.username)
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

    return fetch(HOST_URL + "/account/login", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData)
    })
}

function onError(errorMessage) {
    alert(errorMessage)
}