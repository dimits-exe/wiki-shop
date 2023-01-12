import { HideableWrapper } from "./modules/ui.mjs"

const CART_TEMPLATE = document.getElementById("cart-template")
const CART_ERROR_MESSAGE = document.getElementById("cart-error-message")
const BUY_BUTTON = document.getElementById("buy-button")
const CART_TABLE_CONTAINER = document.getElementById("cart-table-container")

const SPINNER = new HideableWrapper(document.getElementById("loading-spinner"))

const BUY_SUCCESS_WRAPPER = new HideableWrapper(document.getElementById("success-container"), true)
const CART_FULL_WRAPPER = new HideableWrapper(document.getElementById("full-cart-container"), true)
const CART_EMPTY_WRAPPER = new HideableWrapper(document.getElementById("empty-cart-container"), true)
const CART_ERROR_WRAPPER = new HideableWrapper(document.getElementById("cart-error-container"), true)

const CART_CONTAINER_WRAPPER = new HideableWrapper(document.getElementById("cart-container"), true)

await initializePage()

async function initializePage() {
    BUY_BUTTON.onclick = e => {e.preventDefault(); buy()}

    const userDetails = getUserDetails()

    const res = await getCartRequest(userDetails.username, userDetails.sessionId)
    if(res.ok) {
        const cart = await res.json()
        displayCart(cart)
    } else {
        const text = await res.text()
        displayError(text)
    }
    SPINNER.hide()
    CART_CONTAINER_WRAPPER.show()
}

/**
 * Display an error page to the user
 * @param {string} errorMessage the message to be displayed to the user
 */
function displayError(errorMessage) {
    CART_ERROR_MESSAGE.innerText = errorMessage
    CART_EMPTY_WRAPPER.hide()
    CART_FULL_WRAPPER.hide()
    CART_ERROR_WRAPPER.show()
}

/**
 * Get the user details from the current URL.
 * @returns an object holding the username and current session ID
 */
function getUserDetails() {
    const url = document.URL.split("?")[1]
    const params = new URLSearchParams(url)

    const username = params.get("username")
    const sessionId = params.get("sessionId")
    return {username : username, sessionId: sessionId}
}

/**
 * Display the user's cart.
 * @param {obj} cart an object holding an array of products and their total cost
 */
function displayCart(cart) {
    if(cart.cartItems.length === 0)
        displayEmptyCart()
    else 
        displayFullCart(cart)
}

/**
 * Display a non-empty cart.
 * @param {obj} cart an object holding an array of products and their total cost
 */
function displayFullCart(cart) {
    const compiledTemplate = Handlebars.compile(CART_TEMPLATE.textContent)
    const html = compiledTemplate(cart)
    CART_TABLE_CONTAINER.innerHTML = html

    CART_EMPTY_WRAPPER.hide()
    CART_ERROR_WRAPPER.hide()
    CART_FULL_WRAPPER.show()
}

/**
 * Display a message telling the user their cart is empty.
 */
function displayEmptyCart() {
    CART_EMPTY_WRAPPER.show()
    CART_ERROR_WRAPPER.hide()
    CART_FULL_WRAPPER.hide()
}

/**
 * Get the current user's cart from the application server.
 * @param {string} username the username of the account making the purchase
 * @param {string} sessionId the current session ID
 * @returns a promise that returns the user's cart if resolved successfully
 */
function getCartRequest(username, sessionId) {
    const params = {username: username, sessionId: sessionId}
    const searchParams = new URLSearchParams(params)

    return fetch("/cart/current?" + searchParams, {
        method: "GET", headers: { "Content-Type": "application/json" }
    })
}

/**
 * Dummy function that would implement the purchase procedure.
 */
function buy() {
    BUY_SUCCESS_WRAPPER.show()
}