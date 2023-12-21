import {default as STORES} from "./data.js"

const OK_STATUS = "OK";
const STORAGE_STATUS = "STORAGE";
const OUT_OF_STOCK_STATUS = "OUT_OF_STOCK";
const RATING_COLUMN_INDEX = 6;
document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("search-input");
    const resetButton = document.getElementById("reset-button");
    const refreshButton = document.getElementById("refresh-button");

    searchInput.addEventListener("input", function () {
        if (this.value !== "") {
            refreshButton.classList.add("hidden");
            resetButton.classList.remove("hidden");
        }
    });

    searchInput.addEventListener("focus", function () {
        refreshButton.classList.add("hidden");
        resetButton.classList.remove("hidden");
    });

    searchInput.addEventListener("blur", function () {
        if (this.value === "") {
            refreshButton.classList.remove("hidden");
            resetButton.classList.add("hidden");
        }
    });


});

function generateStoresList(data) {
    const storesList = document.getElementById("sitebar-menu__list");

    data.forEach(item => {
        const storesListItem = document.createElement("li");
        storesListItem.className = "store-list-item";
        storesListItem.id = `store-list-item-${item.id}`;

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

            event.currentTarget.style.backgroundColor = "#eff4f8";
        });

        storesList.appendChild(storesListItem);
    });
}

function resetStoreListStyles() {
    let storeItems = document.getElementsByClassName("store-list-item");
    for (let i = 0; i < storeItems.length; i++) {
        storeItems[i].style.backgroundColor = ""; // Сброс цвета
    }
}

generateStoresList(STORES);

function onStoreListItemClick(id) {
    const processedId = Number(id.replace("store-list-item-", ""));
    const storeDetailsData = STORES.find(item => item.id === processedId);

    displayStoreDetails();
    fillStoreDetails(storeDetailsData);
    fillAmountFilter(storeDetailsData);
    clearProductsList();
    fillProductsList(storeDetailsData);
}

function displayStoreDetails() {
    const notSelectedDetailsTitle = document.getElementById("not-selected-details-title");
    notSelectedDetailsTitle.classList.add("hidden");

    const detailsTitle = document.getElementById("details-title");
    detailsTitle.classList.remove("hidden");

    const storeDetailsTableRequisitesLeft = document.getElementById("store-details-table__requisites-left");
    storeDetailsTableRequisitesLeft.classList.remove("hidden");

    const storeDetailsTableRequisitesRight = document.getElementById("store-details-table__requisites-right");
    storeDetailsTableRequisitesRight.classList.remove("hidden");

    const controlButtons = document.getElementById("control-buttons");
    controlButtons.classList.remove("hidden");

    const storeDetails = document.getElementById("store-details");
    storeDetails.classList.remove("hidden");

    const productsList = document.getElementById("products-list");
    productsList.classList.remove("hidden");

    const notSelectedItemMessage = document.getElementById("not-selected-item-message");
    notSelectedItemMessage.classList.add("hidden");

    const detailsFooter = document.getElementById("footer-menu-details");
    detailsFooter.classList.remove("hidden");
}

function fillStoreDetails(storeDetailsData) {
    const emailElement = document.getElementById("email");
    emailElement.textContent = storeDetailsData.Email;

    const phoneNumberElement = document.getElementById("phone-number");
    phoneNumberElement.textContent = storeDetailsData.PhoneNumber;

    const addressElement = document.getElementById("address");
    addressElement.textContent = storeDetailsData.Address;

    const establishedDateElement = document.getElementById("established-date");
    const establishedDate = new Date(storeDetailsData.Established);
    establishedDateElement.textContent = establishedDate.toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });

    const floorAreaElement = document.getElementById("floor-area");
    floorAreaElement.textContent = storeDetailsData.FloorArea;
}

function fillAmountFilter(storeDetailsData) {
    const allFilter = document.getElementById("amount-all-filter");
    allFilter.textContent = String(storeDetailsData.rel_Products.length);

    let okAmount = 0;
    let storageAmount = 0;
    let outOfStockAmount = 0;

    storeDetailsData.rel_Products.forEach(item => {
        if (item.Status === OK_STATUS) {
            okAmount++;
        } else if (item.Status === STORAGE_STATUS) {
            storageAmount++;
        } else if (item.Status === OUT_OF_STOCK_STATUS) {
            outOfStockAmount++;
        }
    });

    const okFilter = document.getElementById("amount-ok-filter");
    okFilter.textContent = String(okAmount);
    const storageFilter = document.getElementById("amount-storage-filter");
    storageFilter.textContent = String(storageAmount);
    const outOfStockFilter = document.getElementById("amount-out-of-stock-filter");
    outOfStockFilter.textContent = String(outOfStockAmount);
}

function clearProductsList() {
    const productsList = document.getElementById("products-list");

    const productRows = productsList.getElementsByClassName("products-list__list-row");
    while (productRows.length > 0) {
        productRows[0].parentNode.removeChild(productRows[0]);
    }
}

function createProductNameDiv(productRow, item) {
    const productNameDiv = document.createElement("div");
    productNameDiv.className = "products-list__list-item grid-container__name-item";
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

function createProductSpecsDiv(productRow, item) {
    const productSpecsDiv = document.createElement("div");
    productSpecsDiv.className = "products-list__list-item ellipsis center-item";
    productSpecsDiv.title = item.Specs;
    const productSpecs = document.createElement("p");
    productSpecs.className = "ellipsis";
    productSpecs.textContent = item.Specs;

    productSpecsDiv.appendChild(productSpecs);

    productRow.appendChild(productSpecsDiv);
}

function createProductSupplierInfoDiv(productRow, item) {
    const productSupplierInfoDiv = document.createElement("div");
    productSupplierInfoDiv.className = "products-list__list-item ellipsis center-item";
    productSupplierInfoDiv.title = item.SupplierInfo;
    const productSupplierInfo = document.createElement("p");
    productSupplierInfo.className = "ellipsis";
    productSupplierInfo.textContent = item.SupplierInfo;

    productSupplierInfoDiv.appendChild(productSupplierInfo);

    productRow.appendChild(productSupplierInfoDiv);
}

function createProductCountryOfOriginDiv(productRow, item) {
    const productCountryOfOriginDiv = document.createElement("div");
    productCountryOfOriginDiv.className = "products-list__list-item ellipsis center-item";
    productCountryOfOriginDiv.title = item.MadeIn;
    const productCountryOfOrigin = document.createElement("p");
    productCountryOfOrigin.className = "ellipsis";
    productCountryOfOrigin.textContent = item.MadeIn;

    productCountryOfOriginDiv.appendChild(productCountryOfOrigin);

    productRow.appendChild(productCountryOfOriginDiv);
}

function createProductProdCompanyDiv(productRow, item) {
    const productProdCompanyDiv = document.createElement("div");
    productProdCompanyDiv.className = "products-list__list-item ellipsis center-item";
    productProdCompanyDiv.title = item.ProductionCompanyName;
    const productProdCompany = document.createElement("p");
    productProdCompany.className = "ellipsis";
    productProdCompany.textContent = item.ProductionCompanyName;

    productProdCompanyDiv.appendChild(productProdCompany);

    productRow.appendChild(productProdCompanyDiv);
}

function createProductRatingDiv(productRow, item) {
    const productRatingDiv = document.createElement("div");
    productRatingDiv.className = "products-list__list-item product-rating center-item";
    productRatingDiv.title = item.Rating;
    productRatingDiv.dataset.rating = item.Rating;

    for (let i = 0; i < item.Rating; i++) {
        const starFull = document.createElement("i");
        starFull.className = "star-size star-full fa-solid fa-star";
        productRatingDiv.appendChild(starFull);
    }

    for (let i = 0; i < 5 - item.Rating; i++) {
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

function fillProductsList(storeDetailsData) {
    const productsList = document.getElementById("products-list");

    storeDetailsData.rel_Products.forEach(item => {
        const productRow = document.createElement("div");
        productRow.className = "products-list__list-row";
        productRow.id = `product-id-${item.id}`;

        createProductNameDiv(productRow, item);
        createProductPriceDiv(productRow, item);
        createProductSpecsDiv(productRow, item);
        createProductSupplierInfoDiv(productRow, item)
        createProductCountryOfOriginDiv(productRow, item);
        createProductProdCompanyDiv(productRow, item);
        createProductRatingDiv(productRow, item);
        createArrowDiv(productRow);

        productsList.appendChild(productRow);
    });
}

const sitebarMenu = document.getElementById("sitebar-menu");
sitebarMenu.addEventListener("scroll", function () {
    const upButton = document.getElementById("stores-list-up-button");
    const downButton = document.getElementById("stores-list-down-button");
    const pinButton = document.getElementById("stores-list-pin-button");
    const controlButtons = document.getElementById("stores-list-control-buttons");
    const sitebarMenuHeader = document.getElementById("sitebar-menu__header");

    const distanceFromTop = controlButtons.getBoundingClientRect().top;

    if (distanceFromTop <= 44) {
        upButton.classList.add("hidden");
        downButton.classList.remove("hidden");
        pinButton.style.display = "none";
        sitebarMenuHeader.style.borderBottom = "solid 1px #afcfe7";
    } else {
        upButton.classList.remove("hidden");
        downButton.classList.add("hidden");
        pinButton.style.display = "block";
        sitebarMenuHeader.style.borderBottom = "";
    }
});

const storeDetailsContainer = document.getElementById("store-details-container");

storeDetailsContainer.addEventListener("scroll", function () {
    const upButton = document.getElementById("stores-details-up-button");
    const downButton = document.getElementById("stores-details-down-button");
    const pinButton = document.getElementById("stores-details-pin-button");
    const controlButtons = document.getElementById("control-buttons");

    const distanceFromTop = controlButtons.getBoundingClientRect().top;

    if (distanceFromTop <= 44) {
        upButton.classList.add("hidden");
        downButton.classList.remove("hidden");
        pinButton.style.display = "none";
    } else {
        upButton.classList.remove("hidden");
        downButton.classList.add("hidden");
        pinButton.style.display = "block";

    }
});

const searchInput = document.getElementById("search-input");

function filterStoreItems() {
    const inputValue = searchInput.value.toLowerCase();
    const filteredStoreItems = [];

    STORES.forEach(storeItem => {
        if (storeItem.Name.toLowerCase().includes(inputValue) ||
            storeItem.Address.toLowerCase().includes(inputValue) ||
            storeItem.FloorArea.toString().includes(inputValue)) {

            filteredStoreItems.push(storeItem);
        }
    });

    clearStoresList()
    generateStoresList(filteredStoreItems);
}

document.getElementById("search-button").addEventListener("click", filterStoreItems);

searchInput.addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        filterStoreItems();
    }
});

document.getElementById("reset-button").addEventListener("click", function() {
    searchInput.value = "";
    clearStoresList();
    generateStoresList(STORES);
    this.classList.add("hidden");
    document.getElementById("refresh-button").classList.remove("hidden");
});

function clearStoresList() {
    const storesList = document.getElementById("sitebar-menu__list");
    const storesItems = storesList.getElementsByClassName("store-list-item");
    while (storesItems.length > 0) {
        storesItems[0].parentNode.removeChild(storesItems[0]);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    const headerItems = document.querySelectorAll(".products-list__header-item");

    headerItems.forEach(headerItem => {
        headerItem.addEventListener("click", () => {
            const sortButtons = headerItem.querySelectorAll(".sort-buttons div");
            const isAscending = headerItem.classList.contains("ascending");
            const isDescending = headerItem.classList.contains("descending");

            headerItems.forEach(item => {
                item.classList.remove("ascending", "descending");

                const buttons = item.querySelectorAll(".sort-buttons div");
                buttons.forEach(button => button.classList.add("hidden"));
                if (buttons && buttons.length > 0) {
                    buttons[0].classList.remove("hidden");
                }
            });

            sortButtons.forEach(button => button.classList.add("hidden"));

            if (!isAscending && !isDescending) {
                headerItem.classList.add("ascending");
                sortButtons[1].classList.remove("hidden");
                sortColumn(headerItem, "ascending");
            } else if (isAscending) {
                headerItem.classList.remove("ascending");
                headerItem.classList.add("descending");
                sortButtons[2].classList.remove("hidden");
                sortColumn(headerItem, "descending");
            } else {
                sortButtons[0].classList.remove("hidden");
                sortColumn(headerItem, "original");
            }
        });
    });
});

function sortColumn(headerItem, order) {
    const columnIndex = Array.from(headerItem.parentElement.children).indexOf(headerItem);
    const rows = Array.from(document.querySelectorAll(".products-list__list-row"));

    console.log(rows);

    rows.sort((a, b) => {
        const aValue = extractColumnValue(a, columnIndex);
        const bValue = extractColumnValue(b, columnIndex);

        if (order === "ascending") {
            return aValue.localeCompare(bValue);
        } else if (order === "descending") {
            return bValue.localeCompare(aValue);
        } else {
            return 0;
        }
    });

    const productList = document.getElementById("products-list");
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