document.getElementById('percentLabel').textContent= chrome.i18n.getMessage('percentLabel');
document.getElementById('walletConvertLabel').textContent= chrome.i18n.getMessage('walletConvertLabel');
document.getElementById('debugLabel').textContent= chrome.i18n.getMessage('debugLabel');

let percentInput = document.getElementById('percent');
let walletConvertInput = document.getElementById('WCInput');
let debugInput = document.getElementById('debugInput');

chrome.storage.local.get().then((result) => {
    if(result.walletConvert) {
        walletConvertInput.checked = result.walletConvert;
    }

    if(result.debug === true) {
        debugInput.checked = true;
    }

    if(result.percent) {
        percentInput.value = result.percent;
    } else {
        percentInput.value = 13;
    }
});

walletConvertInput.addEventListener('change', () => {
    chrome.storage.local.set({ walletConvert: walletConvertInput.checked });
});

debugInput.addEventListener('change', () => {
    chrome.storage.local.set({ debug: debugInput.checked });
});

percentInput.addEventListener('change', () => {
    chrome.storage.local.set({ percent: percentInput.value });
});