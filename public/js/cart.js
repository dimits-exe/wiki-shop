const CART_TEMPLATE = document.getElementById("cart-template")
const CART_CONTAINER = document.getElementById("cart-table-container")

await initializePage()

async function initializePage() {
    const userDetails = getUserDetails()

    const res = await getCartRequest(userDetails.username, userDetails.sessionId)
    if(res.ok) {
        const cart = await res.json()
        displayCart(cart)
    } else {
        const text = await res.text()
        displayError(text)
    }
}

/**
 * Display an error page to the user
 * @param {string} errorMessage the message to be displayed to the user
 */
function displayError(errorMessage) {
    console.error(errorMessage);
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
    const compiledTemplate = Handlebars.compile(CART_TEMPLATE.textContent)
    const html = compiledTemplate(cart)
    CART_CONTAINER.innerHTML = html
}

/**
 * Get the current user's cart from the application server.
 * @param {string} username the username of the account making the purchase
 * @param {string} sessionId the current session ID
 * @returns a promise that returns the user's cart if resolved successfully
 */
function getCartRequest(username, sessionId) {
    const requestURL = new URLSearchParams("/cart/current/")
    requestURL.set("username", username)
    requestURL.set("sessionId", sessionId)

    return fetch(requestURL, {
        method: "GET", headers: { "Content-Type": "application/json" }
    })
}