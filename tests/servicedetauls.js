var Nightmare = require('nightmare');
var assert = require('chai').assert; 
const nightmare = new Nightmare({
  show: false,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 3000 // in ms
});


describe.only("Messudetaljisivun lisätoiminnot", function(){
  this.timeout( 4000 );
    it("Käyttäjä kirjoittaa uuden kommentin, ei vielä tallenna",(done) => {
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

    it("Käyttäjä asettaa kommentin aiheeksi 'juontaja'",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/servicedetails.php?id=2')
          .wait(".datarow").wait(800)
          .type("#newcomment","").wait(100)
          .select("select","juontaja")
          .evaluate(function(){
              return document.querySelector("select").value;
          })
          .then((inputval) => {
              assert.equal(inputval,"juontaja")
              done();
          }).catch(done);
    });


    it("Sivulle latautuu tietokannasta messua koskevia kommentteja",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/servicedetails.php?id=2')
          .wait(".datarow").wait(800)
          .evaluate(function(){
              return document.querySelector(".comment")[0].textContent;
          })
          .then((inputval) => {
              assert.match(inputval,/että messussa on/)
              done();
          }).catch(done);
    });
});
