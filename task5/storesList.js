const stores = require('../Data/stores.json');


document.getElementById("storeInfo").onclick = function() {dialog.show();}
document.getElementById("close").onclick = function() {dialog.hide();}

function createListItems() {
    let len = stores.length;
    for (let i=0; i<len; i++){
        let li = document.createElement('li');
        li.class = 'listItem';

        let dialog = document.createElement('dialog');
        li.appendChile(dialog);

        let closeButton = document.createElement('button');
        dialog.appendchile(closeButton);
        

        let storeInfo = document.createElement('div');
        dialog.appendChild(storeInfo);

    }
}
document.getElementById("name").innerHTML("Discount in: "+stores[0].name)
document.getElementById("discountPerc").innerHTML("Discount by "+stores[0].discountPercentage)


