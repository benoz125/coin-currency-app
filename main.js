let allCoinsObj = {};
let allCoins = [];
let moreInfoObject = {};
let searchCoinArray = [];
let arrayOfSelctedCoins = [];
let arrayOfSelctedCoinsForChart = [];
let slideCounter = 0;
let firstCoin = false;
let firstUpdate = false;
let options = {};
let optionsTemplate = {
    animationEnabled: true,
    axisX: {
        title: "Update Every Two Seconds",
        titleFontColor: "#4F81BC",
        labelFontColor: "#4F81BC",
    },
    backgroundColor: "",
    axisY: {
        title: "Value In USD",
        titleFontColor: "#4F81BC",
        lineColor: "#4F81BC",
        labelFontColor: "#4F81BC",
        tickColor: "#4F81BC",
    },
    toolTip: {
        shared: true,
    },
    data: [
        {
            type: "line",
            dataPoints: [],
        },
    ],
};

const loadAllCoins = async () => {
    try {
        allCoins = await getAllCoins();
        for (let i = 0; i < allCoins.length; i++) {
            allCoinsObj[allCoins[i].id] = allCoins[i];
        }

        //// update the dom with all coins
        updateDomAllCoins(allCoins);
    } catch (err) {
        alert("updateDomAllCoins went wrong", err);
    }
};

//// api request for getting all coins
const getAllCoins = () => {
    return $.ajax({
        method: "GET",
        url: "https://api.coingecko.com/api/v3/coins",
    });
};

const searchCoin = () => {
    let searchInputValue = $(".search-input").val();
    if (searchInputValue == "") {
        alert("type coin name");
    } else {
        let divForSearchResult = document.querySelector(".coin-from-search");
        for (let i = 0; i < allCoins.length; i++) {
            if (allCoins[i].id == searchInputValue) {
                divForSearchResult.innerHTML = `<div class="each-coin-from-search">
                <p class="id-from-search">${allCoins[i].id}</p>
                <p class="symbol-from-search">${allCoins[i].symbol}</p>
                <img class="icon-from-search" src="${allCoins[i].image.small}">
                </div>`;

                divForSearchResult.appendChild(".each-coin-from-search");
            }
        }
    }
};

const updateSearchArea = (searchData) => {
    let divForCoinFromSearch = document.querySelector(".coin-from-search");
    let DivOfEachCoinFromSearch = document.createElement("div");
    DivOfEachCoinFromSearch.className = "coin-from-search";
    DivOfEachCoinFromSearch.innerHTML = `
    <p>${searchData.id}</p>`;
    divForCoinFromSearch.appendChild(DivOfEachCoinFromSearch);
};

//// start function for getting chart info
const start = async () => {
    try {
        drawChart();
    } catch (err) {
        alert("wrong", err);
    }
};

//// update the dom with all the coins
const updateDomAllCoins = (allCoins) => {
    const coinsShowDiv = document.querySelector(".coins-show");
    for (let i = 0; i < allCoins.length; i++) {
        const cardDiv = document.createElement("div");
        cardDiv.id = `id-coin-container-${allCoins[i].symbol}`;
        cardDiv.className = `coin-container`;
        cardDiv.innerHTML = `
        <h3 id="id-coin-code-name-${allCoins[i].symbol}" class="coin-code-name coin-code-name-${allCoins[i].symbol}">${allCoins[i].symbol}</h3>
        <div id="usd-currency-more-info-${allCoins[i].symbol}" class="usd-currency-more-info"></div>
        <div id="eur-currency-more-info-${allCoins[i].symbol}" class="eur-currency-more-info"></div>
        <div id="ils-currency-more-info-${allCoins[i].symbol}" class="ils-currency-more-info"></div>
        <p class="coin-name coin-name-${allCoins[i].symbol}">${allCoins[i].id}</p>
        <button class="btn btn-primary more-info" data-id="${allCoins[i].id}" data-symbol="${allCoins[i].symbol}">More Info</button>
        <div class="form-check form-switch">
        <input
        class="form-check-input"
        type="checkbox"
        id="flexSwitchCheckDefault-${allCoins[i].id}"
        data-id="${allCoins[i].id}"
        data-symbol="${allCoins[i].symbol}"
        />
        </div>`;
        coinsShowDiv.appendChild(cardDiv);
    }
    //// event "click" on toggle buttons
    $(".form-check-input").click(function (e) {
        addToArrayOfSelctedCoins(e.target.dataset.id, e.target.dataset.symbol);
    });

    //// event "click" on more info buttons
    $(".more-info").click(function (e) {
        showMoreInfo(e.target.dataset.id, e.target.dataset.symbol);
    });
};

const showMoreInfo = async (id, symbol) => {
    try {
        let dataForMoreInfo;
        if (moreInfoObject[id]) {
            let d = new Date() - moreInfoObject[id].date;
            d = Math.floor(d / 1000 / 60);
            dataForMoreInfo =
                d > 2 ? await moreInfoRequest(id) : moreInfoObject[id];
        } else {
            dataForMoreInfo = await moreInfoRequest(id);
        }
        toggleInfo(symbol);
        buildInfoInDiv(symbol, dataForMoreInfo);
    } catch (err) {
        alert("show more info went wrong", err);
    }
};

const toggleInfo = (symbol) => {
    $(`#id-coin-container-${symbol}`).toggleClass("coin-info-toggle");
    $(`#id-coin-container-${symbol}`).toggleClass("coin-container");
};

const buildInfoInDiv = (symbol, dataForMoreInfo) => {
    if ($(`#id-coin-container-${symbol}`).hasClass("coin-info-toggle")) {
        $(`#usd-currency-more-info-${symbol}`).text(
            dataForMoreInfo.market_data.current_price.usd + " $"
        );
        $(`#eur-currency-more-info-${symbol}`).text(
            dataForMoreInfo.market_data.current_price.eur + " €"
        );
        $(`#ils-currency-more-info-${symbol}`).text(
            dataForMoreInfo.market_data.current_price.ils + " ₪"
        );
    } else {
        $(`#usd-currency-more-info-${symbol}`).text("");
        $(`#eur-currency-more-info-${symbol}`).text("");
        $(`#ils-currency-more-info-${symbol}`).text("");
    }
};

const moreInfoRequest = (id) => {
    return $.ajax({
        method: "GET",
        url: `https://api.coingecko.com/api/v3/coins/${id}`,
        success: (coin) =>
            (moreInfoObject[coin.id] = { ...coin, date: new Date() }),
    });
};

//// update coins in aside area
updateCoinInAside = () => {
    const asideDivForSelectedCoins = document.querySelector(
        ".choosen-coins-aside-area-div"
    );
    asideDivForSelectedCoins.innerHTML = "";
    for (let i = 0; i < arrayOfSelctedCoins.length; i++) {
        let currentCoinInAside = allCoinsObj[arrayOfSelctedCoins[i]];
        const divForEachAsideCoin = document.createElement("div");
        divForEachAsideCoin.className = "aside-each-coin-div";
        divForEachAsideCoin.innerHTML = `<p class="coin-code-name-aside"> ${currentCoinInAside.id}</p> <img class="coin-icon" src="${currentCoinInAside.image.small}">
        `;
        asideDivForSelectedCoins.appendChild(divForEachAsideCoin);
    }
};

const drawChart = async () => {
    options = JSON.parse(JSON.stringify(optionsTemplate));
    $("#chartContainer").CanvasJSChart(options);

    if (!firstUpdate) {
        updateData();
        firstUpdate = true;
    }
};

function updateData() {
    $.ajax({
        method: "GET",
        url: `https://min-api.cryptocompare.com/data/pricemulti?fsyms=${
            allCoinsObj[arrayOfSelctedCoins[slideCounter]].symbol
        }&tsyms=USD`,
    })
        .done(function (result) {
            addData(result);
        })
        .fail((err) => console.log("err", err));
}

function addData(data) {
    let coinValue = Object.values(data);
    let coinData = {
        x: new Date(),
        y: coinValue[0].USD,
    };
    options.data[0].dataPoints.push(coinData);

    $("#chartContainer").CanvasJSChart().render();
    setTimeout(updateData, 2000);
}

const slideRight = () => {
    if (slideCounter < 5) {
        slideCounter++;
    }
    if (allCoinsObj[arrayOfSelctedCoins[slideCounter]] == undefined) {
        slideCounter--;
    }
    updateInfoArea();
};
const slideLeft = () => {
    if (slideCounter > 0) {
        slideCounter--;
    }
    updateInfoArea();
};

const updateInfoArea = () => {
    const currencyInUSD = document.querySelector(".Currency-rate-usd p");
    const currencyInEUR = document.querySelector(".Currency-rate-eur p");
    const currencyInILS = document.querySelector(".Currency-rate-ils p");
    const coinName = document.querySelector(".chart-header-coin-name");
    const coinIcon = document.querySelector(".chart-header-coin-icon");

    if (arrayOfSelctedCoins[slideCounter]) {
        let currentCoin = allCoinsObj[arrayOfSelctedCoins[slideCounter]];
        currencyInUSD.innerHTML = `${currentCoin.market_data.current_price.usd} <span class="D-E-I">$</span>`;
        currencyInEUR.innerHTML = `${currentCoin.market_data.current_price.eur} <span class="D-E-I">&#x20AC;</span>`;
        currencyInILS.innerHTML = `${currentCoin.market_data.current_price.ils} <span class="D-E-I">&#8362;</span>`;
        coinName.innerHTML = currentCoin.name;
        coinIcon.innerHTML = `<img class="chart-coin-icon" src="${currentCoin.image.small}">`;

        start();
    } else if (arrayOfSelctedCoins.length == 0) {
        currencyInUSD.innerHTML = "";
        currencyInEUR.innerHTML = "";
        currencyInILS.innerHTML = "";
        coinName.innerHTML = "";
        coinIcon.innerHTML = "";
    }
};

const addToArrayOfSelctedCoins = (id, symbol) => {
    if ($(`#flexSwitchCheckDefault-${id}`).is(":checked")) {
        if (arrayOfSelctedCoins.length == 5) {
            if (arrayOfSelctedCoins.includes(id)) {
                //remove selected coin from array
                arrayOfSelctedCoins = arrayOfSelctedCoins.filter(
                    (coin) => coin !== id
                );
            }
            //toggle off
            $(`#flexSwitchCheckDefault-${id}`).prop("checked", false);
        } else {
            $(`#flexSwitchCheckDefault-${id}`).prop("checked", true);
            arrayOfSelctedCoins.push(id);
            arrayOfSelctedCoinsForChart.push(symbol);
        }
    } else if (!$(`#flexSwitchCheckDefault-${id}`).is(":checked")) {
        arrayOfSelctedCoins = arrayOfSelctedCoins.filter((coin) => coin !== id);
    }

    if (!firstCoin) {
        updateInfoArea();
        firstCoin = true;
    }
    updateCoinInAside();
};

loadAllCoins();

function burgerToggle(x) {
    x.classList.toggle("change");
}

$(".container").click(function () {
    $(".hide-about-me-main-div").toggle("a-about-me-main-div");
});
