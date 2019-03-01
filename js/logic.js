const DB_WORKER = new Worker("js/dbworker.js");
const ALLOWED_TYPES = ["image/jpeg","image/png","image/gif"];
let globalItem = new Item();
let globalReader = new FileReader();
let globalStream = null;
let IMG, CANVAS;

const dummyItem = `
  <div class="node-holder">
    <span style="font-size: 2em;"><i class="fas fa-times"></i> No pictures</span>
  </div>
`;
let video;

let currentData          = [],
    currentLatitude      = null,
    currentLongitude     = null,
    currentTime          = Date.now(),
    latestMarginLeft     = 0,
    latestBoundary       = 0,
    nearestMarginLeft    = 0,
    nearestBoundary      = 0,
    tagsMarginLeft       = 0,
    tagsBoundary         = 0;

DB_WORKER.onmessage = function(e){
  if(e.data.recieved) {
    if(Array.isArray(e.data.recieved)) {
      for(item of e.data.recieved) {
        addDistance(item);
        addTime(item);
        currentData.push(item);
      }
    } else {
      addDistance(e.data.recieved);
      addTime(e.data.recieved);
      currentData.push(e.data.recieved);
    }
    renderLatest();
    renderNearest();
  }
};

//Loads images from DB
DB_WORKER.postMessage({read:"all"});

function stopStream() {
  video.pause();
  video.src = "";
  if(globalStream) globalStream.getTracks().forEach(t=>(t.stop()));
}

document.addEventListener("DOMContentLoaded",function(){
  video = document.querySelector('video');
  canvas = document.querySelector("#form canvas");
  img = document.querySelector("#form img");

  //checks for video input device
  navigator.mediaDevices.enumerateDevices()
  .then(function(o){
    for(d of o) {
      if(d.kind=="videoinput") {
        document.querySelector("[data-mode=camera]").classList.remove("unavailable");
        document.querySelector("[data-mode=camera]").title = "Switch to camera mode";
        document.querySelector("[data-mode=camera]").addEventListener("click", function(){
          toggleMode("camera-mode");
          const constraints = { audio: false, video: { width: 640, height: 360 } };
          video.addEventListener("click",function(){
            globalItem.fromVideoElement(video, canvas);
            stopStream();
            toggleMode("form");
            updatePosition();
            globalItem.setPosition(currentLatitude, currentLongitude);
          });


          navigator.mediaDevices.getUserMedia(constraints)
          .then(function(mediaStream) {
            video.srcObject = mediaStream;
            video.onloadedmetadata = function(e) {
              video.play();
            };
            globalStream = mediaStream;
          })
          .catch(function(err) { console.log(err.name + ": " + err.message); }); // always check for errors at the end.
        });
        break;
      }
      document.querySelector("[data-mode=upload]").addEventListener("click",function(){
        toggleMode("upload-mode");
        stopStream();
      })
    }
  })
  .catch(console.error);

});

document.querySelector(".input span").addEventListener("click",function(){
  document.querySelector(".input input").click();
});

document.querySelector(".input input").addEventListener("change",function(e){
  storeImage(e.target.files[0]);
});

window.addEventListener("hashchange",handleHashChange);

function handleHashChange() {
  if(window.location.hash==""||window.location.hash=="#") {
    window.location.hash = "gallerify";
    return;
  }

  let mode = window.location.hash.split('-')[0];
  if(mode=="#image") {
    let url = `blob:${window.location.origin}/${window.location.hash.split('-').slice(1).reduce(function(tot, cur){
      return tot+"-"+cur;
    })}`;
    zoomImage(url);
    return;
  }
  if(mode=="#search") {
    let tag = window.location.hash.split('-')[1];
    console.log("krok1",tag);
    const MOUNT = document.querySelector(".tags-mode .nodes");
    let taggedItems = currentData.filter(function(item){
      return item.tags.includes(tag);
    });
    if(taggedItems.length>0) {
      MOUNT.innerHTML = "";
      taggedItems.forEach(function(item){
        let node = new ItemNode(item.name, item.image, null, null, item.tags, item.source);
        MOUNT.appendChild(node.renderForTags());
      });
    } else {
      MOUNT.innerHTML = `
        <div class="node-holder">
          <span style="font-size: 2em;"><i class="fas fa-times"></i> No results</span>
        </div>
      `
    }
    updateScrollTags();
  }
}

document.querySelector("label[for='search-toggle']").addEventListener("click", function(e){
  if(document.querySelector("#search-toggle").checked) {
    document.querySelector(".tags-mode").classList.remove("active");
  } else {
    document.querySelector(".tags-mode").classList.add("active");
    document.querySelector(".search-box").focus();
  }
});



document.querySelector(".search-box").addEventListener("keyup",function(e){
  if(e.key == "space") console.log("mezernik");
  let heading = "Write some tag";
  if(this.value.length>0) {
    heading = "#"+this.value;
    window.location.hash = "#search-"+this.value;
  } else {
    window.location.hash = "#gallerify";
  }

  document.querySelector(".tags-mode #tags").innerText = heading;
});


function zoomImage(url) {
  document.querySelector(".zoom-image-modal-mount").style.backgroundImage = `url('${url}')`;
  document.querySelector(".zoom-image-modal").classList.add("active");
}

window.addEventListener("resize",updateScrollLatest);
window.addEventListener("resize",updateScrollNearest);
window.addEventListener("resize",updateScrollTags);

document.querySelector(".zoom-image-modal").addEventListener("click",function(){
  this.classList.remove("active");
  window.history.back();
})

document.querySelector("#latest .nodes").addEventListener("wheel", function(e){
  let delta = e.deltaMode ? e.deltaY/3*100 : e.deltaY;
  if(latestMarginLeft-delta>0) {
    latestMarginLeft = 0;
  } else if(latestMarginLeft-delta<latestBoundary) {
    latestMarginLeft = latestBoundary;
  } else {
    latestMarginLeft -= delta;
  }
  this.style.transform = "translateX("+latestMarginLeft+"px)";
});

document.querySelector("#nearest .nodes").addEventListener("wheel", function(e){
  let delta = e.deltaMode ? e.deltaY/3*100 : e.deltaY;
  if(nearestMarginLeft-delta>0) {
    nearestMarginLeft = 0;
  } else if(nearestMarginLeft-delta<nearestBoundary) {
    nearestMarginLeft = nearestBoundary;
  } else {
    nearestMarginLeft -= delta;
  }
  this.style.transform = "translateX("+nearestMarginLeft+"px)";
});

document.querySelector(".tags-mode .nodes").addEventListener("wheel", function(e){
  let delta = e.deltaMode ? e.deltaY/3*100 : e.deltaY;
  if(tagsMarginLeft-delta>0) {
    tagsMarginLeft = 0;
  } else if(tagsMarginLeft-delta<tagsBoundary) {
    tagsMarginLeft = tagsBoundary;
  } else {
    tagsMarginLeft -= delta;
  }
  this.style.transform = "translateX("+tagsMarginLeft+"px)";
});

function renderLatest() {
  const ITEMS = Array.from(currentData);
  const MOUNT_POINT = document.querySelector("#latest .nodes");
  if(ITEMS.length==0) {
    MOUNT_POINT.innerHTML = dummyItem;
  } else {
    ITEMS.sortByLatest();
    MOUNT_POINT.innerHTML = "";
    for(item of ITEMS) {
      let node = new ItemNode(item.name, item.image, item._distance, item._time, item.tags, item.source);
      MOUNT_POINT.appendChild(node.renderForLatest());
    }
  }
  updateScrollLatest();
}

function updateScrollLatest() {
  let node_width = document.querySelector("#latest .nodes .node-holder").offsetWidth;
  let item_count = document.querySelectorAll("#latest .nodes .node-holder").length;
  latestBoundary = -1*((node_width*item_count)+(item_count+4)*0.07*node_width-window.outerWidth);
}

function renderNearest() {
  updatePosition();
  const ITEMS = currentData.filter(i => i._distance != null);
  const MOUNT_POINT = document.querySelector("#nearest .nodes");
  if(ITEMS.length==0) {
    MOUNT_POINT.innerHTML = dummyItem;
  } else {
    ITEMS.sortByDistance();
    MOUNT_POINT.innerHTML = "";
    for(item of ITEMS) {
      let node = new ItemNode(item.name, item.image, item._distance_text, item._time, item.tags, item.source);
      MOUNT_POINT.appendChild(node.renderForNearest());
    }
  }
  updateScrollNearest();
}

function updateScrollNearest() {
  let node_width = document.querySelector("#nearest .nodes .node-holder").offsetWidth;
  let item_count = document.querySelectorAll("#nearest .nodes .node-holder").length;
  nearestBoundary = -1*((node_width*item_count)+(item_count+4)*0.07*node_width-window.outerWidth);
}

function updateScrollTags() {
  let node_width = document.querySelector(".tags-mode .nodes .node-holder").offsetWidth;
  let item_count = document.querySelectorAll(".tags-mode .nodes .node-holder").length;
  tagsBoundary = -1*((node_width*item_count)+(item_count+4)*0.07*node_width-window.outerWidth);
  tagsMarginLeft = 0;
  document.querySelector(".tags-mode .nodes").style.transform = "translateX("+tagsMarginLeft+"px)";
}


// UPLOAD MODE: Drag'n'drop images
const uploadMode = document.querySelector("#upload-mode");
uploadMode.addEventListener("dragenter",function(e){
  e.preventDefault();
  uploadMode.classList.add("drag");
  uploadMode.querySelector("span").innerText = "Drop it";
});
uploadMode.addEventListener("dragleave",function(e){
  e.preventDefault();
  uploadMode.classList.remove("drag");
  uploadMode.querySelector("span").innerText = "Drag your image here";
});
uploadMode.addEventListener("drop", function(e){
  e.preventDefault();
  toggleMode("loading");
  storeImage(e.dataTransfer.files[0]);
});
uploadMode.addEventListener("dragover",function(e){
  e.preventDefault();
});

function updatePosition() {
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position){
      currentLatitude = position.coords.latitude;
      currentLongitude = position.coords.longitude;
    });
  } else {
    //Geographical middle of Earth
    currentLatitude = 30.0;
    currentLongitude = 31.0;
  }
}

function addDistance(item) {
  //FROM: https://www.movable-type.co.uk/scripts/latlong.html
  let R = 6371;
  let φ1 = Math.radians(currentLatitude);
  let φ2 = Math.radians(item.lat);
  let Δφ = Math.radians(item.lat-currentLatitude);
  let Δλ = Math.radians(item.lon-currentLongitude);
  let a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  let distance = R * c;
  item._distance = distance;

  if(distance==0) {
    item._distance_text = "Right here";
  } else if(distance<1) {
    item._distance_text = distance*1000+"m";
  } else {
    item._distance_text = Math.round(distance)+"km";
  }
}

function addTime(item) {
  let diff = currentTime - item.createdAt;

  const SECOND = 1000;
  const MINUTE = SECOND*60;
  const HOUR = MINUTE*60;
  const DAY = HOUR*24;
  const MONTH = DAY*30;
  const YEAR = MONTH*12;

  if(diff > YEAR) {
    item._time = Math.round(diff/YEAR)+" years ago";
  } else {
    if(diff > MONTH) {
      item._time = Math.round(diff/MONTH)+" months ago";
    } else {
      if(diff > DAY) {
        item._time = Math.round(diff/DAY)+" days ago";
      } else {
        if(diff > HOUR) {
          item._time = Math.round(diff/HOUR)+" hours ago";
        } else {
          if(diff > MINUTE) {
            item._time = Math.round(diff/MINUTE)+" minutes ago";
          } else {
            item._time = "just now";
          }
        }
      }
    }
  }
}

Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
}


function storeImage(file) {
  if(ALLOWED_TYPES.includes(file.type)) {
    globalReader.readAsDataURL(file);
    toggleMode("loading");
  } else {
    toggleMode("format-error");
  }
}

function toggleMode(mode) {
  document.querySelectorAll(".mode").forEach(el=>el.classList.toggle("active",el.id==mode));
  if(mode=="upload-mode") {
    canvas.classList.add("hidden");
    img.classList.remove("hidden");
  } else if(mode=="camera-mode") {
    img.classList.add("hidden");
    canvas.classList.remove("hidden");
  }
}

globalReader.addEventListener("load", function(e){
  globalItem.fromFile(globalReader.result);
  document.querySelector("#form img").src = URL.createObjectURL(dataURItoBlob(globalItem.image));
  toggleMode("form");
  updatePosition();
  globalItem.setPosition(currentLatitude, currentLongitude);
});

document.querySelector("form").addEventListener("submit", function(e){
  e.preventDefault();
  console.log(globalItem);

  let errors = 0;

  let i_name = document.querySelector("#uf_name");
  if(i_name.value==0) {
    i_name.classList.add("error");
    i_name.setAttribute("placeholder","Name longer than 0");
    errors++
  }
  else {
    i_name.classList.remove("error");
    globalItem.setName(i_name.value);
  }

  let i_tags = document.querySelector("#uf_tags");
  if(i_tags.value.length>0) {
    let tags = new Set();
    i_tags.value.split(' ').forEach(t=>tags.add(t));
    tags.forEach(t=>globalItem.addTag(t));
  }

  if(errors==0) {
    DB_WORKER.postMessage(JSON.parse(JSON.stringify({save:globalItem.toJSON()})));
    hideMode();
    toggleMode("upload-mode");
    globalItem = new Item();
    i_name.value = "";
    i_tags.value = "";
  }
});

document.querySelector(".resetbtn").addEventListener("click", e=>toggleMode("upload-mode"));

function hideMode() {
  document.querySelector("#add-toggle").checked = false;
  renderLatest();
  renderNearest();
}
