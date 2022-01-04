// static user info
const userId = '61c19bb9269ad3414f882069';
let user;

// map controls
let map;
let locationMarker;
const panBtn = document.querySelector('#pan-btn');
const plusBtn = document.querySelector('#plus-btn');

// camera controls
const video = document.querySelector('#video');
const canvas = document.querySelector('#canvas');
let videoStream = null;
let qrScannerInterval = null;
const cameraOutput = document.querySelector('#camera-output');
const cameraPhoto = document.querySelector('#camera-photo');
const deletePhoto = document.querySelector('#delete-photo');
const captureButton = document.querySelector('#capture-btn');
const photoCanvas = document.querySelector('#photo-canvas');
const submitBtn = document.querySelector('#submit-btn');
let width = 320;
let height = 0;
let streaming = false;

// recycle bins & items
let bins = [];
let items = [];
const iconBase =
    "./images/icons/";
const binDict = {
    battery: {
        icon: iconBase + "battery-bin.png",
    },
    ewaste: {
        icon: iconBase + "ewaste-bin.png",
        info: "Batteries and electronic devices such as cables, chargers, calculators, phones, timepieces, electric shavers, lamps and battery-powered toys. At the large collection sites in the city, you can also discard big electric appliances such as washing machines and televisions.",
        imgUrl: "https://www.ramat-gan.muni.il/files/poi/battery_150.jpg",
    },
    glass: {
        icon: iconBase + "glass-bin.png",
        info: "Glass containers, such as olive oil bottles, perfume bottles, coffee jars, jam or honey jars, and baby food jars. The glass containers should be empty and their lids should be removed.",
        imgUrl: "https://www.ramat-gan.muni.il/files/poi/glass.jpg",
    },
    lightBulbs: {
        icon: iconBase + "light-bubls-bin.png",
    },
    metal: {
        icon: iconBase + "metal-bin.png",
    },
    organic: {
        icon: iconBase + "organic-bin.png",
        info: "Food scraps, excluding meat and dairy products.",
        imgUrl: "https://www.hiriya.co.il/prdPics/1011_ar_body_heb_3_1_1557146966.jpg",
    },
    paper: {
        icon: iconBase + "paper-bin.png",
        info: "Newspapers, brochures, books, cereal boxes, egg cartons (but not milk cartons!)",
        imgUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/%D7%90%D7%9E%D7%A0%D7%99%D7%A8.jpg/440px-%D7%90%D7%9E%D7%A0%D7%99%D7%A8.jpg",
    },
    plastic: {
        icon: iconBase + "plastic-bin.png",
        info: "Soft drink and mineral water bottles containing at least 1.5 liters, as well as plastic bottles containing cleaning agents or detergents, such as dishwashing liquid,  fabric softener,  shampoo, conditioner, et al.",
        imgUrl: "https://www.ramat-gan.muni.il/files/poi/bottles.jpg",
    },
    textile: {
        icon: iconBase + "textile-bin.png",
        info: "Old clothes, shoes, linens and cloth bags.",
        imgUrl: "https://www.ramat-gan.muni.il/files/poi/CLOTHS.jpg",
    },
    location: {
        icon: iconBase + "location.png",
    },
};

function getUser(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `https://greenpoints-server.herokuapp.com/api/users/${id}`,
            type: 'GET',
            success: (result) => {
                resolve(result);
            }
        })
    })
}

function getRecycleBins() {
    $.ajax({
        url: 'https://greenpoints-server.herokuapp.com/api/recycleBins/',
        type: 'GET',
        success: (result) => {
            bins = result;
            markBinsOnMap();
        }
    })
}

function getItems() {
    $.ajax({
        url: 'https://greenpoints-server.herokuapp.com/api/items/',
        type: 'GET',
        success: (result) => {
            items = result;
        }
    })
}
getItems();

function getRecycleBin(id) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: `https://greenpoints-server.herokuapp.com/api/recycleBins/${id}`,
            type: 'GET',
            success: (recycleBin) => {
                resolve(recycleBin);
            }
        })
    })
}

async function addActivityToUser(activity, id) {
    user = await getUser(id);
    let activities = []
    if (user.activities)
        activities = user.activities;
    activities.push(activity)
    $.ajax({
        url: `https://greenpoints-server.herokuapp.com/api/users/${id}`,
        type: 'PATCH',
        data: {
            "activities": activities
        },
        success: (result) => {
            alert('Thanks for recycling')
            resetSubmitFields()
        },
        error: (err) => {
            console.log(err)
            alert('Something happened with your submission, try again')
        }
    })
}

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 32.089433, lng: 34.80363 },
        zoom: 17,
        mapId: 'f0ee40db14646c1b',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: false,
    });

    locationMarker = new google.maps.Marker({
        position: { lat: 32.089433, lng: 34.80363 },
        icon: binDict['location'].icon,
        title: "Current location",
        map,
        animation: google.maps.Animation.DROP,
    });

    getRecycleBins();
}

function markBinsOnMap() {
    const binsMarkers = bins.map((bin, i) => {
        const marker = new google.maps.Marker({
            _id: bin._id,
            position: bin.location,
            type: bin.type,
            icon: binDict[bin.type].icon,
            title: `${bin.type} recycle bin`,
            maxCapacity: bin.maxCapacity,
            currentCapacity: bin.currentCapacity,
            imgUrl: bin.imgUrl ?? binDict[bin.type].imgUrl ?? null,
            map,
            animation: google.maps.Animation.DROP,
        });
        return marker;
    });

    // Add a marker clusterer to manage the markers.
    const markerCluster = new markerClusterer.MarkerClusterer({ map, markers: binsMarkers });
}

function handleLocationError(browserHasGeolocation, pos) {
    alert(browserHasGeolocation
        ? "Error: The Geolocation service failed."
        : "Error: Your browser doesn't support geolocation.");
}

function startCamera() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const constraints = {
            video: {
                facingMode: 'environment',
            },
            audio: false
        }

        navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            video.srcObject = stream;
            videoStream = stream;
        });
    }
    video.addEventListener('canplay', function (ev) {
        if (!streaming) {
            height = video.videoHeight / (video.videoWidth / width);

            if (isNaN(height)) {
                height = width / (4 / 3);
            }

            video.setAttribute('width', width);
            video.setAttribute('height', height);
            canvas.setAttribute('width', width);
            canvas.setAttribute('height', height);
            streaming = true;
        }
    })
}

function stopQRScan() {
    if (qrScannerInterval) {
        clearInterval(qrScannerInterval);
    }
    stopCamera();
    $('#camera-wrapper').hide();
}

function stopCamera() {
    videoStream.getTracks().forEach(function (track) {
        track.stop();
    });
}

function startQRScan() {
    if ('BarcodeDetector' in window) {
        const barcodeDetector = new BarcodeDetector({ formats: ['qr_code'] });
        const detectCode = () => {
            barcodeDetector.detect(video).then(codes => {
                if (codes.length === 0) return;

                for (const barcode of codes) {
                    $('#recycle-bin-id').val(barcode.rawValue);
                    stopQRScan();
                    updateTypesSelect(barcode.rawValue);
                }
            }).catch(err => {
                console.error(err);
            })
        }

        qrScannerInterval = setInterval(detectCode, 100);
    }
}

function takePicture() {
    let context = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    let data = canvas.toDataURL('image/png', 0.001);
    cameraPhoto.setAttribute('src', data);
}

$('#content-close').click(() => {
    $('#content').hide();
    $('#submit-wrapper').hide();
    $('#camera-wrapper').hide();
    $(captureButton).hide();
    stopCamera();
})

$('#start-qr').click(() => {
    $('#camera-wrapper').show();
    startCamera();
    startQRScan();
});

$('#start-camera').click(() => {
    $('#camera-wrapper').show();
    startCamera();
    $(captureButton).show();
});

panBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                map.setCenter(pos);
                locationMarker.setPosition(new google.maps.LatLng(pos.lat, pos.lng));
            },
            () => {
                handleLocationError(true, map.getCenter());
            }
        );
    } else {
        handleLocationError(false, map.getCenter());
    }
});

plusBtn.addEventListener("click", () => {
    $('#submit-wrapper').show();
    $('#content').show();
});

captureButton.addEventListener('click', function (ev) {
    takePicture();
    $('#camera-output').show();
    $('#camera-wrapper').hide();
    $(captureButton).hide();
    ev.preventDefault();
}, false);

deletePhoto.addEventListener('click', function (ev) {
    $('#camera-output').hide();
    cameraPhoto.removeAttribute('src');
    ev.preventDefault();
}, false);

function resetSubmitFields() {
    document.querySelector('#item-amount').value = 0;
    document.querySelector('#item-types').html = "";
    cameraPhoto.removeAttribute('src');
    $(cameraOutput).hide();
    $('#amount-select').hide();
    document.querySelector('#recycle-bin-id').value = "";

}

submitBtn.addEventListener('click', async function (ev) {
    const itemAmount = parseInt(document.querySelector('#item-amount').value);
    const typesSelect = document.querySelector('#item-types');
    const imgUrl = cameraPhoto.getAttribute('src');
    const binId = $('#recycle-bin-id').val();

    if (itemAmount && itemAmount > 0 && imgUrl && binId) {
        const selected = typesSelect.options[typesSelect.selectedIndex]
        const activity = {
            imgUrl,
            dateTime: new Date().toString(),
            recycleBinID: binId,
            items: [{
                itemId: selected.getAttribute('item-id'),
                quantity: itemAmount
            }]
        }
        const mybin = await getRecycleBin(binId);
        if ((mybin.currentCapacity + (itemAmount * selected.getAttribute('size'))) <= mybin.maxCapacity) {
            addActivityToUser(activity, userId);
            $('#content-close').click();
        }
        else {
            alert('Recycle bin is Full!')

        }
    }
    else {
        alert('wrong info!')
    }
    ev.preventDefault();
})

async function updateTypesSelect(binId) {
    let bin;
    try {
        bin = await getRecycleBin(binId);
    } catch (err) {
        console.error(err);
    }
    $('#recycle-bin-type').text(bin.type);
    const types = items.filter((item, i) => item.type == bin.type);
    typesSelect = $('#item-types');

    for (x of types) {
        item = document.createElement('option');
        item.value = x.name;
        item.text = x.name;
        item.setAttribute('size', x.size);
        item.setAttribute('item-id', x._id);
        typesSelect.append(item)
    }

    $('#amount-select').show();
}
