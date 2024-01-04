/**
 * Represents a model for interacting with the store and product data.
 * @constructor
 */
function Model() {
    /**
     * Base URL for API requests.
     * @private
     * @type {string}
     */
    const hostURL = "http://localhost:3000/api/";

    /**
     * Current store data.
     * @private
     * @type {Object|null}
     */
    let currentStoreData = null;

    /**
     * ID of the selected product.
     * @private
     * @type {string|null}
     */
    let selectedProductId = null;

    /**
     * Current value of the products search input.
     * @private
     * @type {string|null}
     */
    let currentProductsSearchInputValue = null;

    /**
     * Current filter status for products.
     * @private
     * @type {string|null}
     */
    let currentFilterStatus = null;

    /**
     * Current order mode for products.
     * @private
     * @type {string|null}
     */
    let currentOrderMode = null;

    /**
     * Get the current value of the products search input.
     * @returns {string|null} The current products search input value.
     */
    this.getCurrentProductsSearchInputValue = () => {
        return currentProductsSearchInputValue;
    };

    /**
     * Set the current value of the products search input.
     * @param {string|null} value - The new value for the products search input.
     */
    this.setCurrentProductsSearchInputValue = (value) => {
        currentProductsSearchInputValue = value;
    };

    /**
     * Get the current filter status for products.
     * @returns {string|null} The current filter status.
     */
    this.getCurrentFilterStatus = () => {
        return currentFilterStatus;
    };

    /**
     * Set the current filter status for products.
     * @param {string|null} status - The new filter status for products.
     */
    this.setCurrentFilterStatus = (status) => {
        currentFilterStatus = status;
    };

    /**
     * Get the current order mode for products.
     * @returns {string|null} The current order mode.
     */
    this.getCurrentOrderMode = () => {
        return currentOrderMode;
    };

    /**
     * Set the current order mode for products.
     * @param {string|null} mode - The new order mode for products.
     */
    this.setCurrentOrderMode = (mode) => {
        currentOrderMode = mode;
    };

    /**
     * Set the ID of the selected product.
     * @param {number|null} id - The ID of the selected product.
     */
    this.setSelectedProductId = (id) => {
        selectedProductId = id;
    };

    /**
     * Get the ID of the selected product.
     * @returns {string|null} The ID of the selected product.
     */
    this.getSelectedProductId = () => {
        return selectedProductId;
    };

    /**
     * Get the current store data.
     * @returns {Object|null} The current store data.
     */
    this.getCurrentStoreData = () => {
        return currentStoreData;
    };

    /**
     * Set the current store data.
     * @param {Object|null} data - The new store data.
     */
    this.setCurrentStoreData = (data) => {
        currentStoreData = data;
    };

    /**
     * Fetch all stores.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.fetchStores = () => {
        return fetch(hostURL + "Stores")
            .then(response => response.json())
            .catch(console.error);
    };

    /**
     * Fetch filtered stores based on the provided filter value.
     * @param {string} filterValue - The filter value for store names, addresses, or floor areas.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.fetchFilteredStores = (filterValue) => {
        const filter = {
            "where": {
                "or": [
                    {"Name": {"ilike": filterValue}},
                    {"Address": {"ilike": filterValue}},
                    {"FloorArea": filterValue}
                ]
            }
        };
        const queryParams = new URLSearchParams({filter: JSON.stringify(filter)});
        const urlWithParams = `${hostURL}Stores?${queryParams.toString()}`;

        return fetch(urlWithParams)
            .then(response => response.json())
            .catch(console.error);
    };

    /**
     * Fetch products for a specific store.
     * @param {number} storeId - The ID of the store.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.fetchStoreProductsById = (storeId) => {
        return fetch(hostURL + `Stores/${storeId}/rel_Products`)
            .then(response => response.json())
            .catch(console.error);
    };

    /**
     * Fetch filtered products for a specific store based on various parameters.
     * @param {number} storeId - The ID of the store.
     * @param {string|null} inputValue - The input value for filtering product attributes.
     * @param {string|null} filterStatus - The status for filtering products.
     * @param {string|null} orderBy - The field to use for sorting products.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.fetchFilteredStoreProductsById = (storeId, inputValue = null, filterStatus = null, orderBy = null) => {
        const filter = {
            "where": {},
            "order": orderBy,
        };

        if (inputValue) {
            filter.where.or = [
                {"Name": {"ilike": inputValue}},
                {"Price": inputValue},
                {"Specs": {"ilike": inputValue}},
                {"SupplierInfo": {"ilike": inputValue}},
                {"MadeIn": {"ilike": inputValue}},
                {"ProductionCompanyName": {"ilike": inputValue}}
            ];
        }

        if (filterStatus) {
            filter.where.Status = filterStatus;
        }

        const queryParams = new URLSearchParams({filter: JSON.stringify(filter)});
        const urlWithParams = `${hostURL}Stores/${storeId}/rel_Products?${queryParams.toString()}`;

        return fetch(urlWithParams)
            .then(response => response.json())
            .catch(console.error);
    };

    /**
     * Fetch product details by ID.
     * @param {string} id - The ID of the product.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.getProductById = (id) => {
        return fetch(hostURL + `Products/${id}`)
            .then(response => response.json())
            .catch(console.error);
    };

    /**
     * Fetch store data by ID.
     * @param {number} id - The ID of the store.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.getStoreDataById = (id) => {
        return fetch(hostURL + `Stores/${id}`)
            .then(response => response.json())
            .catch(console.error);
    };

    /**
     * Create a new store.
     * @param {Object} data - The data for the new store.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.createNewStore = (data) => {
        const newStore = {
            Name: data.Name.value,
            Email: data.Email.value,
            PhoneNumber: data.PhoneNumber.value,
            Address: data.Address.value,
            Established: data.Date.value,
            FloorArea: data.FloorArea.value
        };
        return fetch(hostURL + "Stores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newStore)
        }).catch(console.error);
    };

    /**
     * Delete a store by ID.
     * @param {number} id - The ID of the store to delete.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.deleteStoreById = (id) => {
        return fetch(hostURL + `Stores/${id}`, {method: "DELETE"}).catch(console.error);
    };

    /**
     * Create a new product for the current store.
     * @param {Object} data - The data for the new product.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.createNewProduct = (data) => {
        const newProduct = {
            Name: data.Name.value,
            Price: data.Price.value,
            Photo: null,
            Specs: data.Specs.value,
            Rating: data.Rating.value,
            SupplierInfo: data.SupplierInfo.value,
            MadeIn: data.MadeIn.value,
            ProductionCompanyName: data.ProductionCompanyName.value,
            Status: data.Status.value,
            StoreId: currentStoreData.id
        };
        return fetch(hostURL + "Products", {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(newProduct)
        }).catch(console.error);
    };

    /**
     * Update a product by ID.
     * @param {Object} data - The updated data for the product.
     * @param {string} productId - The ID of the product to update.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.updateProduct = (data, productId) => {
        const updatedProduct = {
            Name: data.Name.value,
            Price: data.Price.value,
            Photo: null,
            Specs: data.Specs.value,
            Rating: data.Rating.value,
            SupplierInfo: data.SupplierInfo.value,
            MadeIn: data.MadeIn.value,
            ProductionCompanyName: data.ProductionCompanyName.value,
            Status: data.Status.value,
            StoreId: currentStoreData.id,
            id: productId
        };
        return fetch(hostURL + "Products", {
            method: "PUT",
            headers: {
                "Content-Type": "application/json;charset=utf-8"
            },
            body: JSON.stringify(updatedProduct)
        }).catch(console.error);
    };

    /**
     * Delete a product from the current store by ID.
     * @param {number} id - The ID of the product to delete.
     * @returns {Promise} A promise that resolves with the response data or rejects with an error.
     */
    this.deleteProductFromStoreById = (id) => {
        return fetch(hostURL + `Products/${id}`, {method: "DELETE"}).catch(console.error);
        ;
    };
}
