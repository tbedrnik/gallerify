var ItemNode = function(name, url, distance, time, tags, source) {
  this.name = name || "Unnamed";
  this.url = url || null;
  this.distance = distance || undefined;
  this.time = time || Date.now();
  this.tags = tags || [];
  this.source = source || null;
}

ItemNode.prototype.renderForLatest = function() {
  let el = document.createElement("div");
  el.classList.add("node-holder");
  el.style.backgroundImage = "url("+this.url+")";
  let layout = document.createElement("div");
  layout.classList.add("node-layout");

  let heading = document.createElement("div");
  heading.classList.add("heading");
  let h2 = document.createElement("h2");
  h2.innerText = this.name;
  heading.appendChild(h2);

  let time = document.createElement("span");
  time.innerText = this.time;
  heading.appendChild(time);

  layout.appendChild(heading);

  let source = document.createElement("div");
  source.classList.add("source");
  let sourceIcon = document.createElement("i");
  sourceIcon.classList.add("fas");
  if(this.source == "file") sourceIcon.classList.add("fa-file-image");
  if(this.source == "camera") sourceIcon.classList.add("fa-camera");
  source.appendChild(sourceIcon);
  layout.appendChild(source);

  let zoom = document.createElement("div");
  zoom.classList.add("zoom");
  let zoomIcon = document.createElement("i");
  zoomIcon.classList.add("fas");
  zoomIcon.classList.add("fa-search");
  zoomIcon.classList.add("fa-2x");
  zoom.appendChild(zoomIcon);
  zoom.addEventListener("click",function(e){
    window.location.hash = "";
    window.location.hash = "image-"+this.url.split('/').slice(-1)[0];
  }.bind(this));
  layout.appendChild(zoom);

  let tags = document.createElement("div");
  tags.classList.add("tags");
  tags.innerText = this.tags;
  layout.appendChild(tags);

  el.appendChild(layout);
  return el;
}

ItemNode.prototype.renderForNearest = function() {
  let el = document.createElement("div");
  el.classList.add("node-holder");
  el.style.backgroundImage = "url("+this.url+")";
  let layout = document.createElement("div");
  layout.classList.add("node-layout");

  let heading = document.createElement("div");
  heading.classList.add("heading");
  let h2 = document.createElement("h2");
  h2.innerText = this.name;
  heading.appendChild(h2);

  let distance = document.createElement("span");
  distance.innerText = this.distance;
  heading.appendChild(distance);
  layout.appendChild(heading);

  let source = document.createElement("div");
  source.classList.add("source");
  let sourceIcon = document.createElement("i");
  sourceIcon.classList.add("fas");
  if(this.source == "file") sourceIcon.classList.add("fa-file-image");
  if(this.source == "camera") sourceIcon.classList.add("fa-camera");
  source.appendChild(sourceIcon);
  layout.appendChild(source);

  let zoom = document.createElement("div");
  zoom.classList.add("zoom");
  let zoomIcon = document.createElement("i");
  zoomIcon.classList.add("fas");
  zoomIcon.classList.add("fa-search");
  zoomIcon.classList.add("fa-2x");
  zoom.appendChild(zoomIcon);
  zoom.addEventListener("click",function(e){
    window.location.hash = "";
    window.location.hash = "image-"+this.url.split('/').slice(-1)[0];
  }.bind(this));
  layout.appendChild(zoom);

  let tags = document.createElement("div");
  tags.classList.add("tags");
  tags.innerText = this.tags;
  layout.appendChild(tags);

  el.appendChild(layout);
  return el;
}

ItemNode.prototype.renderForTags = function() {
  let el = document.createElement("div");
  el.classList.add("node-holder");
  el.style.backgroundImage = "url("+this.url+")";
  let layout = document.createElement("div");
  layout.classList.add("node-layout");

  let heading = document.createElement("div");
  heading.classList.add("heading");
  let h2 = document.createElement("h2");
  h2.innerText = this.name;
  heading.appendChild(h2);
  layout.appendChild(heading);


  let source = document.createElement("div");
  source.classList.add("source");
  let sourceIcon = document.createElement("i");
  sourceIcon.classList.add("fas");
  if(this.source == "file") sourceIcon.classList.add("fa-file-image");
  if(this.source == "camera") sourceIcon.classList.add("fa-camera");
  source.appendChild(sourceIcon);
  layout.appendChild(source);

  let zoom = document.createElement("div");
  zoom.classList.add("zoom");
  let zoomIcon = document.createElement("i");
  zoomIcon.classList.add("fas");
  zoomIcon.classList.add("fa-search");
  zoomIcon.classList.add("fa-2x");
  zoom.appendChild(zoomIcon);
  zoom.addEventListener("click",function(e){
    window.location.hash = "";
    window.location.hash = "image-"+this.url.split('/').slice(-1)[0];
  }.bind(this));
  layout.appendChild(zoom);

  el.appendChild(layout);
  return el;
}
