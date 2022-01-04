const stores = [
    {
        "_id": 1,
        "name": "Renuar",
        "discountPercentage": "10",
        "expiryDate": "20.1.2022",
        "type": "clothing",
        "address": "אלון עין שמר, Pardes Hanna-Karkur"
    }
];


function liClick(dialog) { dialog.show(); }


function createListItems(storesList) {

    const ul = document.getElementById("storesList"); 
    
    stores.forEach((store) => {
        let li = document.createElement('li');
        ul.appendChild(li);
        li.setAttribute('class', 'listItem');
    
        let dialog = document.createElement('dialog');
        li.appendChild(dialog);
    
        let closeButton = document.createElement('button');
        dialog.appendChild(closeButton);
        closeButton.setAttribute('class', 'closeDialog');
    
        let storeInfo = document.createElement('div');
        dialog.appendChild(storeInfo);
    
        let storeName = document.createElement('p');
        storeInfo.appendChild(storeName);
        storeName.innerText = store.name;
    
        let storeDiscountPerc = document.createElement('p');
        storeInfo.appendChild(storeDiscountPerc);
        storeDiscountPerc.innerText = 'Discount of ' + store.discountPercentage + '%';
    
        let expiryDate = document.createElement('p');
        storeInfo.appendChild(expiryDate);
        expiryDate.innerText = store.expiryDate;
    
        let storeType = document.createElement('p');
        storeInfo.appendChild(storeType);
        storeType.innerText = store.type;
    
        let storeAddress = document.createElement('p');
        storeInfo.appendChild(storeAddress);
        storeAddress.innerText = store.address;
        
        li.onclick = liClick(dialog);
        
    });
}

createListItems('storesList');

