window.onload = async () => {
  let percent = 13;

  chrome.storage.local.get().then((result) => {
    percent = result.percent ? result.percent : percent;

    let price = parseInt(document.querySelector('.price-line[data-cc="kz"]').parentElement.children.item(2).innerText.split("₽"));
    if (!price) console.error("Price not found");
    let NewPrice;
  
    let blocked = document.querySelector('.table-prices-current').children.item(2).innerText;
    if(blocked == "N/A") {
      NewPrice = `${Math.round(price * 0.01 * percent + price)} ₽`;
    } else {
      NewPrice = `${Math.round(parseInt(blocked) * 0.01 * percent) + parseInt(blocked)} ₽`;
    }
  
    let table = document.querySelector('table').children.item(0);
  
    let line = document.createElement('tr');
  
    let lineName = document.createElement('td');
    lineName.innerText = "Rubles price";
  
    let linePrice = document.createElement('td');
    linePrice.innerText = NewPrice;
  
    line.appendChild(lineName);
    line.appendChild(linePrice);
    table.appendChild(line);
  });
};
