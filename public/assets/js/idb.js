//create variable to hold db connection
let db;

//establish connect to IndexedDB database called 'pizza_hunt', set to version 1
const request = indexedDB.open('pizza_hunt', 1);

//the event will emit if database version changes (ie non-existant to v1, v1 to v2, etc)
request.onupgradeneeded = function (event) {
    //save reference to database
    const db = event.target.result;
    //create object store (table) called 'new_pizza', set to auto increment primary key of sorts
    db.createObjectStore('new_pizza', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    //checks if app is online, runs if true to send all local db data to api
    if (navigator.onLine) {
        uploadPizza();
    }
};

request.onerror = function (event) {
    //logs error
    console.log(event.target.errorCode);
};

//function to execute if attempting to submit new pizza with no internet connection
function saveRecord(record) {
    //open new transaction with database with read/write permissions
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access object store for 'new_pizza'
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //add record to store with add method
    pizzaObjectStore.add(record);
}

function uploadPizza() {
    //open transaction to db
    const transaction = db.transaction(['new_pizza'], 'readwrite');

    //access object store
    const pizzaObjectStore = transaction.objectStore('new_pizza');

    //get all records from store and set to variable
    const getAll = pizzaObjectStore.getAll();

    //upon successful getAll() execution, runs this function
    getAll.onsuccess = function () {
        //if there was data in indexedDB store, send to api server
        if (getAll.result.length > 0) {
            fetch('/api/pizzas', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    //open one more transaction
                    const transaction = db.transaction(['new_pizza'], 'readwrite');
                    //access new_pizza object store
                    const pizzaObjectStore = transaction.objectStore('new_pizza');
                    //clear all items in store
                    pizzaObjectStore.clear();

                    alert('All saved pizza data have been submitted!');
                })
                .catch(err => {
                    console.log(err)
                });
        }
    };
}

//listen for app coming back online
window.addEventListener('online', uploadPizza);