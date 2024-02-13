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
        this.refreshStores();

        view.getSearchInput().addEventListener("input", function () {
            if (this.value !== "") {
                view.switchButtons(view.getResetButton(), view.getRefreshButton());
            }
        });

        view.getSearchInput().addEventListener(
            "focus",
            () => view.switchButtons(view.getResetButton(), view.getRefreshButton())
        );

        view.getSearchProductsInput().addEventListener("input", function () {
            if (this.value !== "") {
                view.switchButtons(view.getResetProductsButton(), view.getRefreshProductsButton());
            }
        });

        view.getSearchProductsInput().addEventListener(
            "focus",
            () => view.switchButtons(view.getResetProductsButton(), view.getRefreshProductsButton())
        );

        view.getSidebarMenu().addEventListener("scroll", view.handleSidebarMenuScroll);

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

        view.getDeleteStoreButton().addEventListener("click", () => view.getDeleteStoreDialog().showModal());

        view.getDeleteStoreCancelButton().addEventListener("click", () => view.getDeleteStoreDialog().close());

        view.getDeleteStoreOkButton().addEventListener("click", () => this.onDeleteStoreOkButtonClick());

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

        view.getEditProductForm().addEventListener("reset", () => view.getUpdateProductPopup().close());
    };

    /**
     * Handles the click event on the search button.
     */
    this.onSearchButtonClick = () => {
        const inputValue = (view.getSearchInput().value || "").trim().toLowerCase();

        if (inputValue) {
            model.fetchFilteredStores(inputValue).then(stores => {
                view.clearStoresList();
                view.generateStoresList(stores);
                this.addOnStoreListItemClickListener();
            });
        } else {
            this.refreshStores();
        }
    };

    /**
     * Handles the click event on the "Filter All" button.
     */
    this.onFilterButtonAllClick = () => {
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
        model.setCurrentProductsSearchInputValue(localInputValue);
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
        this.refreshStores();
        view.switchButtons(view.getRefreshButton(), view.getResetButton());
    };

    /**
     * Handles the click event on the reset products button.
     */
    this.onResetProductsButtonClick = () => {
        model.setCurrentProductsSearchInputValue(null);
        view.getSearchProductsInput().value = "";
        this.refreshFilteredStoreProductsById(model.getCurrentStoreData().id);
        view.switchButtons(view.getRefreshProductsButton(), view.getResetProductsButton());
    };

    /**
     * Handles the click event on the delete store button.
     */
    this.onDeleteStoreOkButtonClick = () => {
        model.deleteStoreById(model.getCurrentStoreData().id).then(response => {
            if (response.ok) {
                model.setCurrentStoreData(null);
                this.refreshStores();
                view.hideStoreDetails();
                view.getDeleteStoreDialog().close()
                view.showToastNotificationWithAutoClose("The store has been successfully deleted!");
            }
        });
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

        const sortButtons = view.getSortButtons(headerItem);
        const isAscending = view.isContainsClassName(headerItem, "ascending");
        const isDescending = view.isContainsClassName(headerItem, "descending");
        const columnIndex = Array.from(headerItem.parentElement.children).indexOf(headerItem);
        const currentStoreId = model.getCurrentStoreData().id;

        view.setDefaultSortButtons();

        sortButtons.forEach(button => view.addClassName(button, view.getHiddenClassName()));

        if (!isAscending && !isDescending) {
            view.addClassName(headerItem, "ascending");
            view.removeClassName(sortButtons[1], view.getHiddenClassName());
            model.setCurrentOrderMode(`${headerNames[columnIndex]} Asc`);
        } else if (isAscending) {
            view.removeClassName(headerItem, "ascending");
            view.addClassName(headerItem, "descending");
            view.removeClassName(sortButtons[2], view.getHiddenClassName());
            model.setCurrentOrderMode(`${headerNames[columnIndex]} Desc`);
        } else {
            view.removeClassName(sortButtons[0], view.getHiddenClassName());
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
                this.refreshStores();
                view.getCreateStoreForm().reset();
                view.getCreateStoreDialog().close();
                view.showToastNotificationWithAutoClose("The store has been successfully created!");
            }
        });
    };

    /**
     * Handles the click event on the create product button in the popup.
     */
    this.onCreateProductButtonPopupClick = () => {
        model.createNewProduct(view.getCreateNewProductForm().elements).then(response => {
            if (response.ok) {
                this.refreshStoreProductsById(model.getCurrentStoreData().id);
                view.getCreateProductForm().reset();
                view.getCreateProductDialog().close();
                view.showToastNotificationWithAutoClose("The product has been successfully created!");
            }
        });
    };

    /**
     * Adds event listeners for update product button clicks.
     */
    this.addOnUpdateProductButtonClickListener = () => {
        view.getEditProductButtons().forEach((item) => {
            item.addEventListener("click", (event) => this.onUpdateProductButtonClick(event));
        });

    };

    /**
     * Adds event listeners for delete product button clicks.
     */
    this.addDeleteProductButtonClickListener = () => {
        view.getDeleteProductButtons().forEach((item) => {
            item.addEventListener("click", this.onDeleteProductButtonClick);
        });
    };

    view.getDeleteProductCancelButton().addEventListener("click", () => view.getDeleteProductDialog().close());

    view.getDeleteProductOkButton().addEventListener("click", () => this.onDeleteProductOkButtonClick());

    this.onDeleteProductButtonClick = (event) => {
        const productId = +event.target.closest("[data-product-id]").getAttribute("data-product-id");
        model.setSelectedProductId(productId);
        view.getDeleteProductDialog().showModal()
    };

    /**
     * Handles the click event on the update product button.
     * @param {Event} event - The click event object.
     */
    this.onUpdateProductButtonClick = (event) => {
        const editProductPopup = view.getUpdateProductPopup();
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
                view.showToastNotificationWithAutoClose("The product has been successfully updated!");
            }
        });
    };

    /**
     * Handles the click event on the delete product button.
     */
    this.onDeleteProductOkButtonClick = () => {
        model.deleteProductFromStoreById(model.getSelectedProductId()).then(response => {
            if (response.ok) {
                this.refreshFilteredStoreProductsById(model.getCurrentStoreData().id);
                view.getDeleteProductDialog().close();
                view.showToastNotificationWithAutoClose("The product has been successfully deleted!");
            }
        });
    };

    /**
     * Adds event listeners for store list item clicks.
     */
    this.addOnStoreListItemClickListener = () => {
        view.getStoreListItems().forEach((item) => {
            item.addEventListener("click", this.onStoreListItemClickCallback);
        });
    };

    /**
     * Callback function for store list item click.
     * @param {Event} event - The ID of the clicked store list item.
     */
    this.onStoreListItemClickCallback = (event) => {
        view.resetStoreListStyles();
        this.onStoreListItemClick(event.currentTarget.id);
        view.addClassName(event.currentTarget, view.getSelectedBackgroundClassName());
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

    /**
     * Refreshes the list of stores by fetching data from the model.
     */
    this.refreshStores = () => {
        model.fetchStores().then((stores) => {
            view.clearStoresList();
            view.generateStoresList(stores);
            this.addOnStoreListItemClickListener();
        });
    };
}


// Initialize the Controller with a new View and Model
new Controller(new View(), new Model()).init();