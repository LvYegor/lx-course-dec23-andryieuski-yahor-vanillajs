const OK_STATUS = "OK";
const STORAGE_STATUS = "STORAGE";
const OUT_OF_STOCK_STATUS = "OUT_OF_STOCK";
const RATING_COLUMN_INDEX = 6;

const storeListItemClassName = "store-list-item";
const selectedBackgroundClassName = "selected-background";
const productsListItemClassName = "products-list__list-item";
const gridNameItemClassName = "grid-container__name-item";
const borderedHeaderClassName = "bordered-header";
const hiddenClassName = "hidden";

const storeDetailsContainer = document.querySelector("#store-details-container");
const searchInput = document.querySelector("#search-input");
const resetButton = document.querySelector("#reset-button");
const refreshButton = document.querySelector("#refresh-button");
const searchProductsInput = document.querySelector("#products-search-input");
const resetProductsButton = document.querySelector("#products-reset-button");
const refreshProductsButton = document.querySelector("#products-refresh-button");
const sitebarMenu = document.querySelector("#sitebar-menu");
const headerItems = document.querySelectorAll(".products-list__header-item");

const filterButtonAll = document.querySelector("#button-all");
const filterButtonOk = document.querySelector("#button-ok");
const filterButtonStorage = document.querySelector("#button-storage");
const filterButtonOutOfStock = document.querySelector("#button-out-of-stock");

let storesListData;
let currentStoreData = null;
let productsList;

fetchStores();

function fetchStores() {
    fetch("http://localhost:3000/api/Stores")
        .then(response => response.json())
        .then(data => (storesListData = data))
        .then(() => {
            clearStoresList();
            generateStoresList(storesListData);
        })
        .catch(console.error);
}

function fetchStoreProductsById(storeId) {
    return fetch(`http://localhost:3000/api/Stores/${storeId}/rel_Products`)
        .then(response => response.json())
        .then(data => (productsList = data));
}

function createNewStore(data) {
    const newStore = {
        Name: data.Name.value,
        Email: data.Email.value,
        PhoneNumber: data.PhoneNumber.value,
        Address: data.Address.value,
        Established: data.Date.value,
        FloorArea: data.FloorArea.value
    };
    fetch("http://localhost:3000/api/Stores", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(newStore)
    }).then(response => {
        if (response.ok) fetchStores();
    });
}

function createNewProduct(data) {
    const newStore = {
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
    fetch("http://localhost:3000/api/Products", {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8"
        },
        body: JSON.stringify(newStore)
    }).then(response => {
        if (response.ok) {
            fillAmountFilter(currentStoreData);
            clearProductsList();
            fillProductsList(currentStoreData);
        }
    });
}

function deleteProductFromStoreById(id) {
    const confirmed = confirm("Are you sure you want to remove the product?");
    if (confirmed) {
        fetch(`http://localhost:3000/api/Products/${id}`, {
            method: "DELETE"
        })
            .then(response => {
                if (response.ok) {
                    fillAmountFilter(currentStoreData);
                    clearProductsList();
                    fillProductsList(currentStoreData);
                }
            });
    }
}

function deleteStoreById(id){
    const confirmed = confirm("Are you sure you want to remove the store?");
    if (confirmed) {
        fetch(`http://localhost:3000/api/Stores/${id}`,
            {
                method: "DELETE"
            })
            .then(response => {
                if (response.ok) {
                    currentStoreData = null;
                    fetchStores();
                    hideStoreDetails();
                }
            });
    }
}

function hideRefreshShowResetButtons() {
    refreshButton.classList.add(hiddenClassName);
    resetButton.classList.remove(hiddenClassName);
}

searchInput.addEventListener("input", function () {
    if (this.value !== "") {
        hideRefreshShowResetButtons()
    }
});

searchInput.addEventListener("focus", function () {
    hideRefreshShowResetButtons()
});

searchInput.addEventListener("blur", function () {
    if (this.value === "") {
        refreshButton.classList.remove(hiddenClassName);
        resetButton.classList.add(hiddenClassName);
    }
});


searchProductsInput.addEventListener("input", function () {
    if (this.value !== "") {
        refreshProductsButton.classList.add(hiddenClassName);
        resetProductsButton.classList.remove(hiddenClassName);
    }
});

searchProductsInput.addEventListener("focus", function () {
    refreshProductsButton.classList.add(hiddenClassName);
    resetProductsButton.classList.remove(hiddenClassName);
});

searchProductsInput.addEventListener("blur", function () {
    if (this.value === "") {
        refreshProductsButton.classList.remove(hiddenClassName);
        resetProductsButton.classList.add(hiddenClassName);
    }
});

function handleEmptyStoresList(data) {
    const emptyStoresListIcon = document.querySelector("#empty-stores-list-icon");

    if (!data.length) {
        emptyStoresListIcon.classList.remove(hiddenClassName);
    } else {
        emptyStoresListIcon.classList.add(hiddenClassName);
    }
}

function handleSitebarMenuScroll() {
    const upButton = document.querySelector("#stores-list-up-button");
    const downButton = document.querySelector("#stores-list-down-button");
    const pinButton = document.querySelector("#stores-list-pin-button");
    const controlButtons = document.querySelector("#stores-list-control-buttons");
    const sitebarMenuHeader = document.querySelector("#sitebar-menu__header");

    const distanceFromTop = controlButtons.getBoundingClientRect().top;

    if (distanceFromTop <= 44) {
        upButton.classList.add(hiddenClassName);
        downButton.classList.remove(hiddenClassName);
        pinButton.classList.add(hiddenClassName);
        sitebarMenuHeader.classList.add(borderedHeaderClassName);
    } else {
        upButton.classList.remove(hiddenClassName);
        downButton.classList.add(hiddenClassName);
        pinButton.classList.remove(hiddenClassName);
        sitebarMenuHeader.classList.remove(borderedHeaderClassName);
    }
}

sitebarMenu.addEventListener("scroll", handleSitebarMenuScroll);

function handleStoreDetailsContainerScroll() {
    const upButton = document.querySelector("#stores-details-up-button");
    const downButton = document.querySelector("#stores-details-down-button");
    const pinButton = document.querySelector("#stores-details-pin-button");
    const controlButtons = document.querySelector("#control-buttons");

    const distanceFromTop = controlButtons.getBoundingClientRect().top;

    if (distanceFromTop <= 44) {
        upButton.classList.add(hiddenClassName);
        downButton.classList.remove(hiddenClassName);
        pinButton.classList.add(hiddenClassName);

    } else {
        upButton.classList.remove(hiddenClassName);
        downButton.classList.add(hiddenClassName);
        pinButton.classList.remove(hiddenClassName);

    }
}

storeDetailsContainer.addEventListener("scroll", handleStoreDetailsContainerScroll);

document.querySelector("#search-button").addEventListener("click", filterStoreItems);

filterButtonAll.addEventListener("click", () => {
    resetFilterButtonsAttribute();
    filterButtonAll.setAttribute("data-is-active", "true");

    filterProductsItems();
})

filterButtonOk.addEventListener("click", () => {
    setDefaultSortButtons();

    const currentStatus = filterButtonOk.getAttribute("data-is-active");

    resetFilterButtonsAttribute();
    filterButtonOk.setAttribute("data-is-active", currentStatus === "true" ? "false" : "true");

    shouldSetFilterButtonAllToTrue(currentStatus === "true");

    filterProductsItems();
})

filterButtonStorage.addEventListener("click", () => {
    setDefaultSortButtons();

    const currentStatus = filterButtonStorage.getAttribute("data-is-active");

    resetFilterButtonsAttribute();
    filterButtonStorage.setAttribute("data-is-active", currentStatus === "true" ? "false" : "true");

    shouldSetFilterButtonAllToTrue(currentStatus === "true");

    filterProductsItems();
})

filterButtonOutOfStock.addEventListener("click", () => {
    setDefaultSortButtons();

    const currentStatus = filterButtonOutOfStock.getAttribute("data-is-active");

    resetFilterButtonsAttribute();    
    filterButtonOutOfStock.setAttribute("data-is-active", currentStatus === "true" ? "false" : "true");

    shouldSetFilterButtonAllToTrue(currentStatus === "true");

    filterProductsItems();
})

const getActiveStatus = () => {
    const activeButton = [
        filterButtonAll, 
        filterButtonOk, 
        filterButtonStorage, 
        filterButtonOutOfStock].find(button => button.getAttribute("data-is-active") === "true");

    return activeButton.getAttribute("data-filter-key");
}

document.querySelector("#products-search-button").addEventListener("click", filterProductsItems);

searchProductsInput.addEventListener("keydown", function(event){
    if(event.key === "Enter"){
        filterProductsItems();
    }
});

searchInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        filterStoreItems();
    }
});

document.querySelector("#reset-button").addEventListener("click", function () {
    searchInput.value = "";

    clearStoresList();
    generateStoresList(storesListData);

    this.classList.add(hiddenClassName);
    document.querySelector("#refresh-button").classList.remove(hiddenClassName);
});

resetProductsButton.addEventListener("click", function () {
    searchProductsInput.value = "";

    resetFilterButtonsAttribute();

    clearProductsList();
    fillProductsList();

    this.classList.add(hiddenClassName);
    refreshProductsButton.classList.remove(hiddenClassName);
});

document.querySelector("#delete-store-button").addEventListener("click", function (){
    deleteStoreById(currentStoreData.id);
});

headerItems.forEach(headerItem => {
    headerItem.addEventListener("click", () => {
        const sortButtons = headerItem.querySelectorAll(".sort-buttons div");
        const isAscending = headerItem.classList.contains("ascending");
        const isDescending = headerItem.classList.contains("descending");

        setDefaultSortButtons();

        sortButtons.forEach(button => button.classList.add(hiddenClassName));

        if (!isAscending && !isDescending) {
            headerItem.classList.add("ascending");
            sortButtons[1].classList.remove(hiddenClassName);
            sortColumn(headerItem, "ascending");
        } else if (isAscending) {
            headerItem.classList.remove("ascending");
            headerItem.classList.add("descending");
            sortButtons[2].classList.remove(hiddenClassName);
            sortColumn(headerItem, "descending");
        } else {
            sortButtons[0].classList.remove(hiddenClassName);
            sortColumn(headerItem, "original");
        }
    });
});

function resetFilterButtonsAttribute() {
    filterButtonAll.setAttribute("data-is-active", "false");
    filterButtonOk.setAttribute("data-is-active", "false");
    filterButtonStorage.setAttribute("data-is-active", "false");
    filterButtonOutOfStock.setAttribute("data-is-active", "false");
}

function shouldSetFilterButtonAllToTrue(should) {
    if (should) {
        filterButtonAll.setAttribute("data-is-active", "true")
    }
}

function filterProductsItems(){
    const localInputValue = (searchProductsInput.value || "").trim().toLowerCase();
    const activeStatus = getActiveStatus();

    if (activeStatus === "ALL" && localInputValue === "") {
        clearProductsList();

        productsList.forEach(item => {
            const productRow = createProductRow(item);
            document.querySelector("#products-list").appendChild(productRow);
        })
    }

    const filteredData = productsList.filter(productRow => {
        const stringValues = [
            productRow.Name, 
            productRow.MadeIn, 
            productRow.SupplierInfo, 
            productRow.ProductionCompanyName, 
            productRow.Specs, 
            productRow.SupplierInfo
        ];

        const inputFilter = stringValues.some(i => i.toLowerCase().includes(localInputValue)) || String(productRow.Price) === localInputValue

        if (activeStatus !== "ALL") {
            return (productRow.Status === activeStatus) && inputFilter;
        } else {
            return inputFilter;
        }
    })

    clearProductsList();

    filteredData.forEach(item => {
        const productRow = createProductRow(item);
        document.querySelector("#products-list").appendChild(productRow);
    })
}

function setDefaultSortButtons() {
    headerItems.forEach(item => {
        item.classList.remove("ascending", "descending");

        const buttons = item.querySelectorAll(".sort-buttons div");
        buttons.forEach(button => button.classList.add(hiddenClassName));
        if (buttons && buttons.length > 0) {
            buttons[0].classList.remove(hiddenClassName);
        }
    });
}

function generateStoresList(data) {
    handleEmptyStoresList(data);

    const storesList = document.querySelector("#sitebar-menu__list");
    const activeStoreID = document.querySelector("#store-details-container").dataset.storeId;

    data.forEach(item => {
        const storesListItem = document.createElement("li");
        storesListItem.className = storeListItemClassName;
        storesListItem.id = `store-list-item-${item.id}`;


        if (+activeStoreID === +item.id) {
            storesListItem.classList.add(selectedBackgroundClassName)
        }


        const infoDiv = document.createElement("div");
        infoDiv.className = "store-list-item__info";

        const nameHeader = document.createElement("h4");
        nameHeader.textContent = item.Name;

        const locationParam = document.createElement("p");
        locationParam.className = "store-location";
        locationParam.textContent = item.Address;

        infoDiv.appendChild(nameHeader);
        infoDiv.appendChild(locationParam);

        const areaDiv = document.createElement("div");
        areaDiv.className = "store-list-item__area";

        const areaHeader = document.createElement("h4");
        areaHeader.textContent = item.FloorArea;

        const areaUnitPara = document.createElement("p");
        areaUnitPara.className = "area-unit";
        areaUnitPara.textContent = "sq.m";

        areaDiv.appendChild(areaHeader);
        areaDiv.appendChild(areaUnitPara);

        storesListItem.appendChild(infoDiv);
        storesListItem.appendChild(areaDiv);

        storesListItem.addEventListener("click", (event) => {
            resetStoreListStyles();

            onStoreListItemClick(event.currentTarget.id)

            event.currentTarget.classList.add(selectedBackgroundClassName);
        });

        storesList.appendChild(storesListItem);
    });
}

function resetStoreListStyles() {
    const storeItems = document.querySelectorAll(`.${storeListItemClassName}`);
    for (let i = 0; i < storeItems.length; i++) {
        storeItems[i].classList.remove(selectedBackgroundClassName);
    }
}

function onStoreListItemClick(id) {
    const processedId = Number(id.replace("store-list-item-", ""));
    const storeDetailsData = storesListData.find(item => item.id === processedId);
    currentStoreData = storeDetailsData;

    setDefaultSortButtons();
    resetFilterButtonsAttribute();
    filterButtonAll.setAttribute("data-is-active", "true");
    searchProductsInput.value = "";

    displayStoreDetails(processedId);
    fillStoreDetails(storeDetailsData);
    fillAmountFilter(storeDetailsData);
    clearProductsList();
    fillProductsList(storeDetailsData);
}

function displayStoreDetails(id) {
    storeDetailsContainer.dataset.storeId = id;

    const notSelectedDetailsTitle = document.querySelector("#not-selected-details-title");
    notSelectedDetailsTitle.classList.add(hiddenClassName);

    const detailsTitle = document.querySelector("#details-title");
    detailsTitle.classList.remove(hiddenClassName);

    const storeDetailsTableRequisitesLeft = document.querySelector("#store-details-table__requisites-left");
    storeDetailsTableRequisitesLeft.classList.remove(hiddenClassName);

    const storeDetailsTableRequisitesRight = document.querySelector("#store-details-table__requisites-right");
    storeDetailsTableRequisitesRight.classList.remove(hiddenClassName);

    const controlButtons = document.querySelector("#control-buttons");
    controlButtons.classList.remove(hiddenClassName);

    const storeDetails = document.querySelector("#store-details");
    storeDetails.classList.remove(hiddenClassName);

    const productsList = document.querySelector("#products-list");
    productsList.classList.remove(hiddenClassName);

    const notSelectedItemMessage = document.querySelector("#not-selected-item-message");
    notSelectedItemMessage.classList.add(hiddenClassName);

    const detailsFooter = document.querySelector("#footer-menu-details");
    detailsFooter.classList.remove(hiddenClassName);
}


function hideStoreDetails(id) {
    const notSelectedDetailsTitle = document.querySelector("#not-selected-details-title");
    notSelectedDetailsTitle.classList.remove(hiddenClassName);

    const detailsTitle = document.querySelector("#details-title");
    detailsTitle.classList.add(hiddenClassName);

    const storeDetailsTableRequisitesLeft = document.querySelector("#store-details-table__requisites-left");
    storeDetailsTableRequisitesLeft.classList.add(hiddenClassName);

    const storeDetailsTableRequisitesRight = document.querySelector("#store-details-table__requisites-right");
    storeDetailsTableRequisitesRight.classList.add(hiddenClassName);

    const controlButtons = document.querySelector("#control-buttons");
    controlButtons.classList.add(hiddenClassName);

    const storeDetails = document.querySelector("#store-details");
    storeDetails.classList.add(hiddenClassName);

    const productsList = document.querySelector("#products-list");
    productsList.classList.add(hiddenClassName);

    const notSelectedItemMessage = document.querySelector("#not-selected-item-message");
    notSelectedItemMessage.classList.remove(hiddenClassName);

    const detailsFooter = document.querySelector("#footer-menu-details");
    detailsFooter.classList.add(hiddenClassName);
}

function fillStoreDetails(storeDetailsData) {
    const emailElement = document.querySelector("#email");
    emailElement.textContent = storeDetailsData.Email;

    const phoneNumberElement = document.querySelector("#phone-number");
    phoneNumberElement.textContent = storeDetailsData.PhoneNumber;

    const addressElement = document.querySelector("#address");
    addressElement.textContent = storeDetailsData.Address;

    const establishedDateElement = document.querySelector("#established-date");
    const establishedDate = new Date(storeDetailsData.Established);
    establishedDateElement.textContent = establishedDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const floorAreaElement = document.querySelector("#floor-area");
    floorAreaElement.textContent = storeDetailsData.FloorArea;
}

function updateFilterElement(filterId, value) {
    const filterElement = document.querySelector(`#${filterId}`);
    if (filterElement) {
        filterElement.textContent = String(value);
    }
}

async function fillAmountFilter(storeDetailsData) {
    const storeId = storeDetailsContainer.dataset.storeId;
    const allFilter = document.querySelector("#amount-all-filter");

    let okAmount = 0;
    let storageAmount = 0;
    let outOfStockAmount = 0;

    const storeRelProducts = await fetchStoreProductsById(storeId);

    allFilter.textContent = String(storeRelProducts.length);
    storeRelProducts.forEach(item => {
        if (item.Status === OK_STATUS) {
            okAmount++;
        } else if (item.Status === STORAGE_STATUS) {
            storageAmount++;
        } else if (item.Status === OUT_OF_STOCK_STATUS) {
            outOfStockAmount++;
        }
    });

    updateFilterElement("amount-ok-filter", okAmount);
    updateFilterElement("amount-storage-filter", storageAmount);
    updateFilterElement("amount-out-of-stock-filter", outOfStockAmount);
}

function clearProductsList() {
    const productsList = document.querySelector("#products-list");

    const productRows = productsList.querySelectorAll(".products-list__list-row");

    productRows.forEach(row => {
        row.parentNode.removeChild(row);
    });
}

function createProductInfoDiv(productRow, item, property) {
    const productInfoDiv = document.createElement("div");
    productInfoDiv.className = "products-list__list-item ellipsis center-item";
    productInfoDiv.title = item[property];

    const productInfo = document.createElement("p");
    productInfo.className = "ellipsis";
    productInfo.textContent = item[property];

    productInfoDiv.appendChild(productInfo);

    productRow.appendChild(productInfoDiv);
}

function createProductNameDiv(productRow, item) {
    const productNameDiv = document.createElement("div");
    productNameDiv.className = `${productsListItemClassName} ${gridNameItemClassName}`;


    const productName = document.createElement("b");
    productName.className = "text-wrapping";
    productName.title = item.Name;
    productName.textContent = item.Name;

    const productID = document.createElement("p");
    productID.className = "product_id";
    productID.textContent = item.id;

    productNameDiv.appendChild(productName);
    productNameDiv.appendChild(productID);

    productRow.appendChild(productNameDiv);
}

function createProductPriceDiv(productRow, item) {
    const productPriceDiv = document.createElement("div");
    productPriceDiv.className = "products-list__list-item";
    productPriceDiv.title = `${item.Price} USD`;

    const productPrice = document.createElement("b");
    productPrice.textContent = item.Price;

    const productPriceUnit = document.createElement("p");
    productPriceUnit.textContent = "USD";

    productPriceDiv.appendChild(productPrice);
    productPriceDiv.appendChild(productPriceUnit);

    productRow.appendChild(productPriceDiv);
}

function createProductRatingDiv(productRow, item) {
    const productRatingDiv = document.createElement("div");
    productRatingDiv.className = "products-list__list-item product-rating center-item";
    productRatingDiv.title = item.Rating;
    productRatingDiv.dataset.rating = item.Rating;

    const emptyStartsAmount = 5 - item.Rating;

    for (let i = 0; i < item.Rating; i++) {
        const starFull = document.createElement("i");
        starFull.className = "star-size star-full fa-solid fa-star";
        productRatingDiv.appendChild(starFull);
    }

    for (let i = 0; i < emptyStartsAmount; i++) {
        let starRegular = document.createElement("i");
        starRegular.className = "star-size fa-regular fa-star";
        productRatingDiv.appendChild(starRegular);
    }

    productRow.appendChild(productRatingDiv);
}

function createArrowDiv(productRow) {
    const rowArrowDiv = document.createElement("div");
    rowArrowDiv.className = "products-list__list-item ellipsis center-item";

    const rowArrowIcon = document.createElement("i");
    rowArrowIcon.className = "fa-solid fa-chevron-right";

    rowArrowDiv.appendChild(rowArrowIcon);

    productRow.appendChild(rowArrowDiv);
}

function createDeleteProductDiv(productRow) {
    const deleteProductDiv = document.createElement("div");
    deleteProductDiv.className = "products-list__list-item ellipsis center-item";

    const deleteProductButton = document.createElement("button");
    deleteProductButton.type = "button";
    deleteProductButton.className = "delete-products-btn";
    deleteProductButton.id = productRow.id;

    const deleteProductIcon = document.createElement("i");
    deleteProductIcon.className = "fa-regular fa-circle-xmark";
    deleteProductButton.appendChild(deleteProductIcon);

    deleteProductDiv.appendChild(deleteProductButton);

    productRow.appendChild(deleteProductDiv);

    deleteProductButton.addEventListener("click", function (event) {
        const productId = +event.target.closest("[data-product-id]").getAttribute("data-product-id");

        deleteProductFromStoreById(productId);
    });
}

function createProductRow(item) {
    const productRow = document.createElement("div");
    productRow.className = "products-list__list-row";
    productRow.dataset.productId = item.id;

    createProductNameDiv(productRow, item);
    createProductPriceDiv(productRow, item);
    createProductInfoDiv(productRow, item, "Specs");
    createProductInfoDiv(productRow, item, "SupplierInfo");
    createProductInfoDiv(productRow, item, "MadeIn");
    createProductInfoDiv(productRow, item, "ProductionCompanyName");
    createProductRatingDiv(productRow, item);
    createArrowDiv(productRow);
    createDeleteProductDiv(productRow);

    return productRow;
}

async function fillProductsList(storeDetailsData) {
    const productsList = document.querySelector("#products-list");
    const storeId = storeDetailsContainer.dataset.storeId;

    const relProducts = await fetchStoreProductsById(storeId);

    relProducts.forEach(item => {
        const productRow = createProductRow(item);
        productsList.appendChild(productRow);
    });
}

function filterStoreItems() {
    const inputValue = searchInput.value.toLowerCase();
    const filteredStoreItems = [];

    storesListData.forEach(storeItem => {
        if (storeItem.Name.toLowerCase().includes(inputValue) ||
            storeItem.Address.toLowerCase().includes(inputValue) ||
            storeItem.FloorArea === +inputValue) {

            filteredStoreItems.push(storeItem);
        }
    });

    clearStoresList();
    generateStoresList(filteredStoreItems);
}

function clearStoresList() {
    const storesList = document.querySelector("#sitebar-menu__list");
    const storesItems = storesList.querySelectorAll(`.${storeListItemClassName}`);

    storesItems.forEach(item => {
        item.parentNode.removeChild(item);
    });
}

async function sortColumn(headerItem, order) {
    const columnIndex = Array.from(headerItem.parentElement.children).indexOf(headerItem);
    const rows = Array.from(document.querySelectorAll(".products-list__list-row"));
    const storeId = storeDetailsContainer.dataset.storeId;
    const storeRelProducts = await fetchStoreProductsById(storeId);


    rows.sort((a, b) => {
        const aValue = extractColumnValue(a, columnIndex);
        const bValue = extractColumnValue(b, columnIndex);

        const aId = a.getAttribute("data-product-id");
        const bId = b.getAttribute("data-product-id");

        switch (order) {
            case "ascending":
                return aValue.localeCompare(bValue);
            case "descending":
                return bValue.localeCompare(aValue);
            case "original":
                return storeRelProducts.findIndex(item => +item.id === +aId) - storeRelProducts.findIndex(item => +item.id === +bId);
        }
    });

    const productList = document.querySelector("#products-list");
    clearProductsList();

    rows.forEach(row => {
        productList.appendChild(row);
    });
}

function extractColumnValue(row, columnIndex) {
    const columns = row.querySelectorAll(".products-list__list-item");
    const column = columns[columnIndex];

    if (columnIndex === RATING_COLUMN_INDEX) {
        return column.dataset.rating;
    } else {
        return column.textContent.trim();
    }
}

function showModalStoreCreate() {
    const createBtn = document.querySelector("#create-store-button");
    let favDialog = document.querySelector("#create-store-popup");
    createBtn.addEventListener("click", () => favDialog.showModal());
    let cancelButtonPopup = document.querySelector(
        `#create-store-popup .popup-cancel-btn`
    );
    let createButtonPopup = document.querySelector(
        `#create-store-popup .popup-create-btn`
    );
    let form = document.querySelector(`#create-store-popup form`);

    createButtonPopup.addEventListener("click", () => {
        createNewStore(form.elements);
        favDialog.close();
    });
    cancelButtonPopup.addEventListener("click", () => favDialog.close());
}

function showModalProductCreate() {
    const createBtn = document.querySelector("#create-product-button");
    let favDialog = document.querySelector(`#create-product-popup`);
    createBtn.addEventListener("click", () => {
        favDialog.showModal();
    });
    let cancelButtonPopup = document.querySelector(
        `#create-product-popup .popup-cancel-btn`
    );
    let createButtonPopup = document.querySelector(
        `#create-product-popup .popup-create-btn`
    );
    let form = document.querySelector(`#create-product-popup form`);

    createButtonPopup.addEventListener("click", () => {
        createNewProduct(form.elements);
        favDialog.close();
    });
    cancelButtonPopup.addEventListener("click", () => favDialog.close());
}

showModalStoreCreate();
showModalProductCreate();