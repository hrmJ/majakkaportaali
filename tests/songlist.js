
var Nightmare = require('nightmare');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: true,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 10000 // in ms
});

describe.only("Laulujen syöttö", function(){
  this.timeout( 20000 );

    it("Käyttäjä näkee kentän, johon voi syöttää alkulaulun ja kirjoittaa siihen Taivas varjele. Käyttäjä painaa tallenna, ja arvo on vaihtunut.",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/songs.php?service_id=2')
          .wait("table").wait(800)
          .type("[name='alkulaulu']","")
          .type("[name='alkulaulu']","Taivas varjele")
          .click("[value='Tallenna']").wait("[name=alkulaulu]")
          .evaluate(function(){
              return document.querySelector("[name=alkulaulu]").value;
          })
          .then((inputval) => {
              assert.equal(inputval,"Taivas varjele")
              done();
          }).catch(done);
    });
});

