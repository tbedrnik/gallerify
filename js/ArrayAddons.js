Array.prototype.sortByDistance = function() {
  if(navigator.geolocation) {
    this.sort(function(a,b){
      return a._distance - b._distance;
    });
  } else {
    console.warning("Geolocation unavaiable");
  }
}

Array.prototype.sortByLatest = function() {
  this.sort(function(a,b){
    return b.createdAt - a.createdAt;
  })
}
