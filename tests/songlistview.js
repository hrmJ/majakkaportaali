var Nightmare = require('nightmare');
var $ = require('jquery');
var assert = require('chai').assert; 
const nightmare = new Nightmare({
  show: true,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 3000 // in ms
});


describe.only("Laululistaikkuna", function(){
  this.timeout( 2000 );
    it("avautuu, kun käyttäjä painaa 'Selaa laulujen listaa'",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/songs.php?id=2')
          .wait(".open-song-list")
          .click(".open-song-list")
          .evaluate(function(){
              return $(".songlistview").is(":visible");
          })
          .then((isvisible) => {
              assert.equal(isvisible,true)
              done();
          }).catch(done);
    });

    it("Käyttäjä valitsee katsoa lauluja kirjaimen V kohdalta");

});
