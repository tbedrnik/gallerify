//open request
var DBOpenRequest = indexedDB.open("gallerify", 1);
var db;
let isDatabaseReady = false;
let readsWaiting = [];

importScripts('Item.js', 'dataURItoBlob.js');

//Database conn is opened
DBOpenRequest.onsuccess = function(event) {
  console.log("DB initialised", event);
  db = DBOpenRequest.result;
  isDatabaseReady = true;
  readsWaiting.forEach(function(i){read(i)});
}

DBOpenRequest.onerror = function(event) {
  console.error(event);
}

//Database doesn't exist -> create DB
DBOpenRequest.onupgradeneeded = function(event) {
  db = event.target.result;
  db.onerror = function(e){console.error("Error loading database",e)};

  let objectStore = db.createObjectStore("gallerify", {autoIncrement:true});
      objectStore.createIndex("image","image"); //Image blob
      objectStore.createIndex("name","name"); //Image name
      objectStore.createIndex("source","source"); //Image source (camera, file)
      objectStore.createIndex("createdAt","createdAt"); //Time when created
      objectStore.createIndex("tags","tags",{multiEntry:true}); //Array of tags
      objectStore.createIndex("lat","lat"); //latitude coordinate
      objectStore.createIndex("lon","lon"); //longitude coordinate

  console.log("DB created");
}

function save(json) {
  if(isDatabaseReady) {
    let transaction = db.transaction(["gallerify"],"readwrite");
    transaction.oncomplete = function(e){postMessage({status:"Transaction completed"})};
    transaction.onerror = function(e){postMessage({status:"Transaction failed"})};
    let objectStore = transaction.objectStore("gallerify");
    let objectStoreResult = objectStore.add(json);
    objectStoreResult.onsuccess = function(e){postMessage({status:"Item saved"})};
    read("last");
  } else {
    console.error("Database is not ready!");
    return;
  }
}

function read(mode) {
  if(isDatabaseReady) {
    let t = db.transaction(["gallerify"],"readonly");
    let os = t.objectStore("gallerify");
    let osr = os.getAll();
    osr.onsuccess = function(e) {
      for(obj of e.target.result) {
        obj.image = URL.createObjectURL(dataURItoBlob(obj.image));
      }
      switch (mode) {
        case "all": postMessage({recieved:e.target.result}); break;
        case "last" : postMessage({recieved:e.target.result[e.target.result.length-1]}); break;
      }
    }
  } else {
    readsWaiting.push(mode);
  }
}

onmessage = function(e) {
  const recieved = e.data;

  if(recieved.save) {
    save(recieved.save);
  }

  if(recieved.read) {
    read(recieved.read);
  }

}
