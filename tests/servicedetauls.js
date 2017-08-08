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
    it("Käyttäjä kirjoittaa uuden kommentin",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/servicedetails.php?id=2')
          .wait(".datarow").wait(800)
          .type("#newcomment","").type("#newcomment","tadadaa!").wait(100)
          .evaluate(function(){
              return document.querySelector("#newcomment").value;
          })
          .then((inputval) => {
              assert.equal(inputval,"tadadaa!")
              done();
          }).catch(done);
    });

});
