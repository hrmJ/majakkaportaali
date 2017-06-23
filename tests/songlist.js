
var Nightmare = require('nightmare');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: false,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 10000 // in ms
});

describe.only("Laulujen syöttö", function(){
  this.timeout( 20000 );

    it("Käyttäjä näkee kentän, johon voi syöttää alkulaulun ja kirjoittaa siihen Riihikirkkohymni",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/songs.php?service_id=2')
          .wait("table").wait(800)
          .type("[name='alkulaulu']","Riihikirkkohymni")
          .evaluate(function(){
              return document.querySelector("[name=alkulaulu]").value;
          })
          .then((inputval) => {
              assert.equal(inputval,"Riihikirkkohymni")
              done();
          }).catch(done);
    });
});

