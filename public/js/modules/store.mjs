/**
 * An object which loads and holds data about categories, subcategories and products
 * 
 * @dimits-exe
 */
export class Store {
    #hostURL
    #corsProxyURL
    #shopAPIURL

    #categories = {}
    #subcategories = {}
    #products = []

    /**
     * Returns a fully initialized store. Use this method instead of a constructor
     * to guarantee the data is loaded before they are accessed by other methods.
     * @returns a loaded store object
     */
    static async constructStore(HOST_URL, CORS_PROXY_URL, SHOP_API_URL) {
        let store = new Store()
        await store.#initialize()

        return store
    }

    /**
     * Do NOT use the default constructor, use the async 
     * constuctStore factory class method instead.
     */
    constructor(HOST_URL, CORS_PROXY_URL, SHOP_API_URL) { 
        this.#hostURL = HOST_URL
        this.#corsProxyURL = CORS_PROXY_URL
        this.#shopAPIURL = SHOP_API_URL
    }

    get categories() { return structuredClone(this.#categories) }

    get subcategories() { return structuredClone(this.#subcategories) }

    get products() { return structuredClone(this.#products) }


    /**
     * Display the selected subcategories of the current category. Use loadCategoryPage to change
     * the currently displayed category.
     */
    displayCategory(subcategories) {
        let selectedSubCat = this.#getSelectedSubcategory()
        this.#displaySubcategories(subcategories, selectedSubCat)
    }

    /**
     * Query the URL to select the subcategories of the selected category
     * @returns the selected subcategories
     */
    getSubcategoriesFromURL() {
        let url = document.URL.split("?")[1]
        let params = new URLSearchParams(url)
        let categoryId = parseInt(params.get("id")) - 1

        let category = this.#categories[categoryId]
        let subcategories = this.#subcategories[category.id] // index = id - 1 because the categories are placed sorted in an array
        return subcategories
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

        if (subset === "all")
            selectedSubcategories = subcategories
        else
            selectedSubcategories = [subcategories[parseInt(subset) - 1]] // turn into array for uniform access

        // reset container contents
        const subcategoryObjects = []

        for (let subcategory of selectedSubcategories) {
            const selectedProducts = this.#products.filter(
                product => product.subcategory_id === subcategory.id)

            const subcategoryObject = {
                name: subcategory.title,
                products: selectedProducts
            }

           subcategoryObjects.append(subcategoryObject);
        }

        return subcategoryObjects
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
                resolve(fetch(this.#corsProxyURL + "/" + this.#shopAPIURL + "/categories/" + category.id
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
                resolve(fetch(this.#corsProxyURL + "/" + this.#shopAPIURL + "/categories/" + category.id
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
        return fetch(this.#corsProxyURL + "/" + this.#shopAPIURL + "/categories", { method: "GET" })
            .then(res => res.json())
    }
}