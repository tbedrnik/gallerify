var Item = function() {
  this.image = null;
  this.name = null;
  this.source = null;
  this.createdAt = Date.now();
  this.tags = [];
  this.lat = null;
  this.lon = null;
}

Item.prototype.setPosition = function(lat, lon) {
  this.lat = lat;
  this.lon = lon;
}

Item.fromJSON = function(json) {
  let i = new Item();
  i.name = json.name;
  this.image = json.image;
  this.name = json.name;
  this.source = json.source;
  this.createdAt = json.createdAt;
  this.tags = json.tags;
  this.lat = json.lat;
  this.lon = json.lon;
  return i;
}

Item.prototype.toJSON = function() {
  return {
    image: this.image,
    name: this.name,
    source: this.source,
    createdAt: this.createdAt,
    tags: this.tags,
    lat: this.lat,
    lon: this.lon
  }
}

Item.prototype.fromVideoElement = function(videoElement, canvasElement) {
  canvasElement.getContext("2d").drawImage(videoElement, 0, 0);
  this.image = canvasElement.toDataURL();
  this.source = "camera";
}

Item.prototype.fromFile = function(file) {
  this.source = "file";
  this.image = file;
}

Item.prototype.addTag = function(tag) {
  this.tags.push(tag);
}

Item.prototype.setName = function(name) {
  this.name = name;
}
