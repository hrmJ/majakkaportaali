var Nightmare = require('nightmare');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: false,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 3000 // in ms
});


describe.only("Messudetaljisivun lisätoiminnot", function(){
  this.timeout( 5000 );

    it("Käyttäjä painaa 'Lisää kommentti' -linkkiä");

});
