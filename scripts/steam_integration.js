let KZT;
let percent = 13;
let SearchTimeoutDone = 1000;

let WCB = false;
let Debug = false;
let DebugInfo = {"Debug": [], "Percent": percent, "Tenge Currency": 0};

window.onload = () => {
    fetch("https://www.cbr-xml-daily.ru/daily_json.js").then(
        (AllCurrencies) => {
            AllCurrencies.json().then((AllJSONed) => {
                KZT = AllJSONed.Valute.KZT.Value;

                chrome.storage.local.get().then((result) => {
                    percent = result.percent ? result.percent : percent;

                    if(result.debug) {
                        Debug = true;
                        DebugInfo["Percent"] = percent;
                        DebugInfo["Tenge Currency"] = KZT;
                    }

                    if(result.walletConvert) {
                        WCB = true;
                    }

                    init();
                });
            });
        }
    );
};

function init() {
    if(WCB){
        let wallet = document.getElementById("header_wallet_balance");
        if(wallet) {
            wallet.setAttribute('title', wallet.innerText)
            wallet.innerText = `${((parseInt(wallet.innerText) / 100) * KZT).toFixed(2)} ₽`;
        }
    }

    let SteamPriceElement = document
        .getElementsByClassName("game_purchase_price price")
        .item(0);
    ConvertPrice(SteamPriceElement);

    let SteamSubscribePrices = document.querySelector('span[id^="add_to_cart_"]');
    if(SteamSubscribePrices) {
        ConvertPrice(SteamSubscribePrices)
    }

    let SteamDiscountPrices = document.querySelectorAll(
        ".discount_final_price"
    );
    if (SteamDiscountPrices.length !== 0) {
        for (let i = 0; SteamDiscountPrices.length > i; i++) {
            ConvertPrice(SteamDiscountPrices.item(i));
        }
    }

    let SteamDiscountOriginalPrices = document.querySelectorAll(
        ".discount_original_price"
    );
    if (SteamDiscountOriginalPrices.length !== 0) {
        for (let i = 0; SteamDiscountOriginalPrices.length > i; i++) {
            ConvertPrice(SteamDiscountOriginalPrices.item(i));
        }
    }

    let SteamPurchasePrices = document.querySelectorAll(".game_purchase_price");
    if (SteamPurchasePrices.length !== 0) {
        for (let i = 0; SteamPurchasePrices.length > i; i++) {
            ConvertPrice(SteamPurchasePrices.item(i));
        }
    }

    let SteamDLCPrices = document.querySelectorAll(".game_area_dlc_price");
    if (SteamDLCPrices.length !== 0) {
        for (let i = 0; i < 5; i++) {
            ConvertPrice(SteamDLCPrices.item(i));
        }
    }

    let DLCFooter = document
        .getElementsByClassName("dlc_footer_element")
        .item(0);
    if (DLCFooter) {
        DLCFooter.addEventListener("click", () => {
            if (SteamDLCPrices.length !== 1) {
                for (let i = 5; SteamDLCPrices.length > i; i++) {
                    ConvertPrice(SteamDLCPrices.item(i));
                }
            }
        });
    }

    let Search = document.getElementById('store_nav_search_term');
    if(Search){
        let TimeoutID;

        Search.addEventListener("keyup", () => {
            clearTimeout(TimeoutID);
            TimeoutID = setTimeout(SearchConvert, SearchTimeoutDone);
        });

        Search.addEventListener('keydown', () => {
            clearTimeout(TimeoutID);
        })

        function SearchConvert() {
            let SearchPrice = document.querySelectorAll(".match_subtitle");
            if (SearchPrice.length !== 0) {
                for (let i = 0; i < 5; i++) {
                    ConvertPrice(SearchPrice.item(i));
                }
            }
        }
    }

    function DebugInfoCollector(Price, RUB, element, NormalizedText) {
        DebugInfo["Debug"].push({
            "Price": Price,
            "NewPrice": RUB,
            "Element value": element.innerText,
            "Element": element,
            "NormalizedText": NormalizedText
        });
    }

    function ConvertPrice(element) {
        if (!element) return;
        if(element.getAttribute('data-converted') === "1") return;

        let NormalizedText = String(element.innerText).replace(/\s/g, "").replace(/[^0-9,\u0440\u0443\u0431.\u20A0-\u20CF]/g,"");
        if (!/\d/g.test(NormalizedText)) return;
        
        if (NormalizedText.includes("₸")) {
            let Price = parseInt(NormalizedText);
            let RUB = Math.round(
                Math.round((Price / 100) * KZT) * 0.01 * percent +
                    Math.round((Price / 100) * KZT)
            );

            element.setAttribute("title", `${element.innerText}`);
            element.setAttribute("data-converted", 1);

            if(Debug) DebugInfoCollector(Price, RUB, element, NormalizedText);

            if(element.innerText.includes("Цена для вас:") || element.innerText.includes("Your Price:")) {
                element.innerHTML = `<div class="your_price_label">${chrome.i18n.getMessage('yourPrice')}</div><div>${RUB} ₽</div>`;
            } else if(element.innerText.includes("Начальная цена:") || element.innerText.includes("Starting at")) {
                element.innerText = `${chrome.i18n.getMessage('StartPrice')} ${RUB} ₽ / ${chrome.i18n.getMessage('month')}`;
            } else {
                element.innerText = `${RUB} ₽`;
            }

        } else if (element.innerText.match("уб.")) {
            let RUB = parseInt(NormalizedText);
            let NewRUB = Math.round(RUB * 0.01 * percent + RUB);

            element.setAttribute("title", `${element.innerText}`);
            element.setAttribute("data-converted", 1);

            if(Debug) DebugInfoCollector(RUB, NewRUB, element, NormalizedText);

            if(element.innerText.includes("Цена для вас:") || element.innerText.includes("Your Price:")) {
                element.innerHTML = `<div class="your_price_label">${chrome.i18n.getMessage('yourPrice')}</div><div>${NewRUB} ₽</div>`;
            } else if(element.innerText.includes("Начальная цена:") || element.innerText.includes("Starting at")) {
                element.innerText = `${chrome.i18n.getMessage('StartPrice')} ${NewRUB} ₽ / ${chrome.i18n.getMessage('month')}`;
            } else {
                element.innerText = `${NewRUB} ₽`;
            }
        }
    }

    if(Debug) {console.log(DebugInfo)};
}