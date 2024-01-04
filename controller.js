/**
 * Controller class for managing the interaction between the View and Model.
 * @class
 * @param {View} view - The View instance.
 * @param {Model} model - The Model instance.
 */
function Controller(view, model) {

    /**
     * Initializes the controller by setting up event listeners and fetching initial data.
     */
    this.init = () => {
        model.fetchStores()
            .then((stores) => {
                view.clearStoresList();
                view.generateStoresList(stores);
                this.addOnStoreListItemClickListener();
            });

        view.getSearchInput().addEventListener("input", function () {
            if (this.value !== "") {
                view.hideRefreshShowResetButtons();
            }
        });

        view.getSearchInput().addEventListener("focus", view.hideRefreshShowResetButtons);

        view.getSearchProductsInput().addEventListener("input", function () {
            if (this.value !== "") {
                view.hideRefreshShowResetProductsButtons();
            }
        });

        view.getSearchProductsInput().addEventListener("focus", view.hideRefreshShowResetProductsButtons);

        view.getSitebarMenu().addEventListener("scroll", view.handleSitebarMenuScroll);

        view.getStoreDetailsContainer().addEventListener("scroll", view.handleStoreDetailsContainerScroll);

        view.getSearchButton().addEventListener("click", this.onSearchButtonClick);

        view.getFilterButtonAll().addEventListener("click", this.onFilterButtonAllClick);

        view.getFilterButtonOk().addEventListener("click", () => this.onFilterButtonClick(view.getFilterButtonOk()));

        view.getFilterButtonStorage().addEventListener("click", () => this.onFilterButtonClick(view.getFilterButtonStorage()));

        view.getFilterButtonOutOfStock().addEventListener("click", () => this.onFilterButtonClick(view.getFilterButtonOutOfStock()));

        view.getSearchProductsButton().addEventListener("click", this.onSearchProductsButtonClick);

        view.getSearchProductsInput().addEventListener("keydown", (event) => this.onSearchProductsInputKeydown(event));

        view.getSearchInput().addEventListener("keydown", (event) => this.onSearchInputKeydown(event));

        view.getResetButton().addEventListener("click", this.onResetButtonClick);

        view.getResetProductsButton().addEventListener("click", this.onResetProductsButtonClick);

        view.getDeleteStoreButton().addEventListener("click", this.onDeleteStoreButtonClick);

        view.getHeaderItems().forEach(headerItem => {
            headerItem.addEventListener("click", () => this.onProductHeaderItemClick(headerItem));
        });

        view.getCreateStoreButton().addEventListener("click", () => view.getCreateStoreDialog().showModal());

        view.getCreateStoreForm().addEventListener("submit", this.onCreateStoreButtonPopup);

        view.getCreateStoreForm().addEventListener("reset", () => view.getCreateStoreDialog().close());

        view.getCreateProductButton().addEventListener("click", () => view.getCreateProductDialog().showModal());

        view.getCreateProductForm().addEventListener("submit", this.onCreateProductButtonPopupClick);

        view.getCreateProductForm().addEventListener("reset", () => view.getCreateProductDialog().close());

        view.getEditProductForm().addEventListener("submit", this.onSubmitEditProductClick);

        view.getEditProductForm().addEventListener("reset", () => view.getUpdateProductPopap().close());
    };

    /**
     * Handles the click event on the search button.
     */
    this.onSearchButtonClick = () => {
        const inputValue = view.getSearchInput().value.toLowerCase();

        if (inputValue) {
            model.fetchFilteredStores(inputValue).then(stores => {
                view.clearStoresList();
                view.generateStoresList(stores);
                this.addOnStoreListItemClickListener();
            });
        }

    };

    /**
     * Handles the click event on the "Filter All" button.
     */
    this.onFilterButtonAllClick = () => {
        view.setDefaultSortButtons();
        model.setCurrentOrderMode(null);

        view.resetFilterButtonsAttribute();
        view.shouldSetFilterButtonAllToTrue(true);

        model.setCurrentFilterStatus(null);
        this.refreshFilteredStoreProductsById(model.getCurrentStoreData().id);
    };

    /**
     * Handles the click event on filter buttons.
     * @param {HTMLElement} filterButton - The filter button element.
     */
    this.onFilterButtonClick = (filterButton) => {
        view.setDefaultSortButtons();
        model.setCurrentOrderMode(null);

        const currentStatus = filterButton.getAttribute("data-is-active");

        view.resetFilterButtonsAttribute();
        filterButton.setAttribute("data-is-active", currentStatus === "true" ? "false" : "true");

        view.shouldSetFilterButtonAllToTrue(currentStatus === "true");
        model.setCurrentFilterStatus(currentStatus === "false" ? filterButton.dataset.filterKey : null);

        this.refreshFilteredStoreProductsById(model.getCurrentStoreData().id);
    };

    /**
     * Handles the click event on the "Search Products" button.
     */
    this.onSearchProductsButtonClick = () => {
        const localInputValue = (view.getSearchProductsInput().value || "").trim().toLowerCase();

        view.setDefaultSortButtons();
        model.setCurrentProductsSearchInputValue(localInputValue);
        model.setCurrentOrderMode(null);

        this.refreshFilteredStoreProductsById(model.getCurrentStoreData().id);

    };

    /**
     * Handles the keydown event on the search products input.
     * @param {Event} event - The keydown event object.
     */
    this.onSearchProductsInputKeydown = (event) => {
        if (event.key === "Enter") {
            this.onSearchProductsButtonClick();
        }
    };

    /**
     * Handles the keydown event on the search input.
     * @param {Event} event - The keydown event object.
     */
    this.onSearchInputKeydown = (event) => {
        if (event.key === "Enter") {
            this.onSearchButtonClick();
        }
    };

    /**
     * Handles the click event on the reset button.
     */
    this.onResetButtonClick = () => {
        view.getSearchInput().value = "";
        model.fetchStores()
            .then((stores) => {
                view.clearStoresList();
                view.generateStoresList(stores);
                this.addOnStoreListItemClickListener();
            });

        view.hideResetShowRefreshButtons();
    };

    /**
     * Handles the click event on the reset products button.
     */
    this.onResetProductsButtonClick = () => {
        this.refreshStoreProductsById(model.getCurrentStoreData().id);
        view.hideResetShowRefreshProductsButtons();
    };

    /**
     * Handles the click event on the delete store button.
     */
    this.onDeleteStoreButtonClick = () => {
        const confirmed = confirm("Are you sure you want to remove the store?");
        if (confirmed) {
            model.deleteStoreById(model.getCurrentStoreData().id).then(response => {
                if (response.ok) {
                    model.setCurrentStoreData(null);
                    model.fetchStores().then((stores) => {
                        view.clearStoresList();
                        view.generateStoresList(stores);
                        this.addOnStoreListItemClickListener();
                    });
                    view.hideStoreDetails();
                }
            });
        }
    };

    /**
     * Handles the click event on a product header item.
     * @param {HTMLElement} headerItem - The header item element.
     */
    this.onProductHeaderItemClick = (headerItem) => {
        const headerNames = [
            "Name",
            "Price",
            "Specs",
            "SupplierInfo",
            "MadeIn",
            "ProductionCompanyName",
            "Rating"
        ];

        const sortButtons = headerItem.querySelectorAll(".sort-buttons div");
        const isAscending = headerItem.classList.contains("ascending");
        const isDescending = headerItem.classList.contains("descending");
        const columnIndex = Array.from(headerItem.parentElement.children).indexOf(headerItem);
        const currentStoreId = model.getCurrentStoreData().id;

        view.setDefaultSortButtons();

        sortButtons.forEach(button => button.classList.add(view.getHiddenClassName()));

        if (!isAscending && !isDescending) {
            headerItem.classList.add("ascending");
            sortButtons[1].classList.remove(view.getHiddenClassName());
            model.setCurrentOrderMode(`${headerNames[columnIndex]} Asc`);
        } else if (isAscending) {
            headerItem.classList.remove("ascending");
            headerItem.classList.add("descending");
            sortButtons[2].classList.remove(view.getHiddenClassName());
            model.setCurrentOrderMode(`${headerNames[columnIndex]} Desc`);
        } else {
            sortButtons[0].classList.remove(view.getHiddenClassName());
            model.setCurrentOrderMode(null);
        }

        this.refreshFilteredStoreProductsById(currentStoreId);
    };

    /**
     * Handles the click event on the create store button in the popup.
     */
    this.onCreateStoreButtonPopup = () => {
        model.createNewStore(view.getCreateNewStoreForm().elements).then(response => {
            if (response.ok) {
                model.fetchStores().then((stores) => {
                    view.clearStoresList();
                    view.generateStoresList(stores);
                    this.addOnStoreListItemClickListener();
                });
            }
        });
        view.getCreateStoreDialog().close();
    };

    /**
     * Handles the click event on the create product button in the popup.
     */
    this.onCreateProductButtonPopupClick = () => {
        model.createNewProduct(view.getCreateNewProductForm().elements).then(response => {
            if (response.ok) {
                this.refreshStoreProductsById(model.getCurrentStoreData().id);
            }
        });
        view.getCreateProductDialog().close();
    };

    /**
     * Adds event listeners for update product button clicks.
     */
    this.addOnUpdateProductButtonClickListener = () => {
        document.querySelectorAll(".update-products-btn").forEach((item) => {
            item.addEventListener("click", (event) => this.onUpdateProductButtonClick(event));
        });
    };

    /**
     * Adds event listeners for delete product button clicks.
     */
    this.addDeleteProductButtonClickListener = () => {
        document.querySelectorAll(".delete-products-btn").forEach((item) => {
            item.addEventListener("click", (event) => this.onDeleteProductButtonClick(event));
        });
    };

    /**
     * Handles the click event on the update product button.
     * @param {Event} event - The click event object.
     */
    this.onUpdateProductButtonClick = (event) => {
        const editProductPopup = view.getUpdateProductPopap();
        editProductPopup.showModal();
        const productId = +event.target.closest("[data-product-id]").getAttribute("data-product-id");
        model.setSelectedProductId(productId);
        model.getProductById(productId).then(data => view.fillFormProductData(data));
    };

    /**
     * Handles the submit event on the edit product form.
     */
    this.onSubmitEditProductClick = () => {
        const form = view.getEditProductForm();

        model.updateProduct(form.elements, model.getSelectedProductId()).then(response => {
            if (response.ok) {
                this.refreshStoreProductsById(model.getCurrentStoreData().id);
                form.reset();
            }
        });
    };

    /**
     * Handles the click event on the delete product button.
     * @param {Event} event - The click event object.
     */
    this.onDeleteProductButtonClick = (event) => {
        const confirmed = confirm("Are you sure you want to remove the product?");
        if (confirmed) {
            const productId = +event.target.closest("[data-product-id]").getAttribute("data-product-id");
            model.deleteProductFromStoreById(productId).then(response => {
                if (response.ok) {
                    this.refreshStoreProductsById(model.getCurrentStoreData().id);
                }
            });
        }
    };

    /**
     * Adds event listeners for store list item clicks.
     */
    this.addOnStoreListItemClickListener = () => {
        document.querySelectorAll(".store-list-item").forEach((item) => {
            item.addEventListener("click", (event) => {
                view.resetStoreListStyles();

                this.onStoreListItemClick(event.currentTarget.id);

                event.currentTarget.classList.add(view.getSelectedBackgroundClassName());
            });
        });
    };

    /**
     * Handles the click event on a store list item.
     * @param {string} id - The id of the clicked store list item.
     */
    this.onStoreListItemClick = (id) => {
        this.resetProductsFilterParams();

        const processedId = Number(id.replace("store-list-item-", ""));

        model.getStoreDataById(processedId).then((storeDetailsData) => {
            model.setCurrentStoreData(storeDetailsData);

            this.refreshStoreProductsById(model.getCurrentStoreData().id);

            view.displayStoreDetails(processedId);
            view.fillStoreDetails(storeDetailsData);
        });
    };

    /**
     * Resets the filter parameters for products.
     */
    this.resetProductsFilterParams = () => {
        model.setCurrentProductsSearchInputValue(null);
        model.setCurrentFilterStatus(null);
        model.setCurrentOrderMode(null);
    };

    /**
     * Refreshes the product list for the current store.
     * @param {number} currentStoreId - The id of the current store.
     */
    this.refreshStoreProductsById = (currentStoreId) => {
        model.fetchStoreProductsById(currentStoreId).then(products => {
            view.fillAmountFilter(products);
            view.clearProductsList();
            view.fillProductsList(products);
            this.addDeleteProductButtonClickListener();
            this.addOnUpdateProductButtonClickListener();

            this.resetProductsFilterParams();
            view.setDefaultSortButtons();
            view.resetFilterButtonsAttribute();
            view.shouldSetFilterButtonAllToTrue(true);
            view.getSearchProductsInput().value = "";
        });
    };

    /**
     * Refreshes the filtered product list for the current store based on search and filter criteria.
     * @param {number} currentStoreId - The id of the current store.
     */
    this.refreshFilteredStoreProductsById = (currentStoreId) => {
        model.fetchFilteredStoreProductsById(
            currentStoreId,
            model.getCurrentProductsSearchInputValue(),
            model.getCurrentFilterStatus(),
            model.getCurrentOrderMode())
            .then((products) => {
                view.clearProductsList();
                view.fillProductsList(products);
                this.addDeleteProductButtonClickListener();
                this.addOnUpdateProductButtonClickListener();
            });
    };
}

// Initialize the Controller with a new View and Model
new Controller(new View(), new Model()).init();