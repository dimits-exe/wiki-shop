// ============= UI FUNCTIONS ===============

/**
 * Display an object to the html page according to a handlebars template.
 * @param {string} template the handlebars template as text
 * @param {obj} obj the object to be used in the template
 * @param {HTMLElement} container the html container of the template
 */
export function displayTemplate(template, obj, container) {
    let compiledTemplate = Handlebars.compile(template)
    container.innerHTML = compiledTemplate(obj)
}


/**
 * Display a hidden HTML element.
 * @param {HTMLElement} label the HTML element to be displayed
 * @param {string} message an optional message to be displayed in the element
 */
export function showLabel(label, message = null) {
    if (message !== null) label.innerText = message

    label.style.visibility = "visible"
}

/**
 * Hide a visible HTML element.
 * @param {HTMLElement} label the HTML element to be hidden
 */
export function hideLabel(label) {
    label.style.visibility = "hidden"
}

export function checkValidity(formId) {
    let inputs = document.querySelectorAll(`#${formId} input`)

    for (let input of inputs) {
        if (!input.checkValidity()) {
            input.reportValidity()
            return false
        }
    }
    return true
}

/**
 * Switch a password field's text between hidden and visible.
 * @param {HTMLElement} passwordField the password field
 */
export function swapPasswordType(passwordField) {
    if (passwordField.type === "password")
        passwordField.type = "text";
    else
        passwordField.type = "password";
}