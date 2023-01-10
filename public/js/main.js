"use strict"

import { Store } from "./modules/store.mjs"
import { displayTemplate,  showLabel, hideLabel, checkValidity, swapPasswordType} from "./modules/ui.mjs"

const HOST_URL = "http://localhost:8080"
const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"
const STORAGE_ID = "sessionId"

const CATEGORY_TEMPLATE = document.getElementById("categories-template")
const CATEGORY_CONTAINER = document.getElementById("categories-container")

const SUBCATEGORY_TEMPLATE = document.getElementById("subcategory-template")
const STORE_CONTAINER = document.getElementById("store-container")
const MENU_CONTAINER = document.getElementById("subcategories-menu")
const MENU_TEMPLATE = document.getElementById("subcategories-menu-template")

const loginSuccess =  document.getElementById("success-label")
const loginUsernameLabel = document.getElementById("username-label")
const loginForm = document.getElementById("login-form")
const loginNameField = document.getElementById("login-username")
const loginPassField = document.getElementById("login-password")
const loginErrorLabel = document.getElementById("login-error-label")
const loginButton = document.getElementById("login-button")
const loginShowPassButton = document.getElementById("login-show-pass")
const spinner = document.getElementById("login-loading")

let store = null

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

function addPurchaseHandlers() {
    const buttons = document.getElementsByClassName("purchase-button")

    for(let button of buttons) {
        button.onclick = () => addToCart(button.dataset.productId);
    }
}

function addToCart(productId) {
    console.log(productId);
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
            console.log(sessionId)
            saveSessionId(sessionId)

            hideLabel(loginErrorLabel)
            showLabel(loginSuccess, "Welcome " + loginNameField.value)
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