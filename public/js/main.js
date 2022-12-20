// Put your client side JS code here

const CORS_PROXY_URL = "http://127.0.0.1:5000/"
const SHOP_API_URL = "https://wiki-shop.onrender.com"

const TEMPLATES = {}

function getCategories() {
    fetch(CORS_PROXY_URL + "/" + SHOP_API_URL + "/categories", { method: "GET" })
    .then(res => {
        if(!res.ok) {
            onError(res.status + res.statusText)
        } else {
            res.json().then(categories => {
                displayCategories({categories: categories})
            })
        }
    })

}

function displayCategories(categories) {
    console.log(categories);
    const categoriesContainer = document.getElementById("categories-container")
    template = document.getElementById("categories-template").textContent
    compiledTemplate = Handlebars.compile(template)
    categoriesContainer.innerHTML = compiledTemplate(categories)
    console.log("template printed");
    console.log(compiledTemplate(categories));
}

function onError(errorMessage) {
    console.log(errorMessage);
}

getCategories();

