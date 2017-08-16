var Nightmare = require('nightmare');
var $ = require('jquery');
var assert = require('chai').assert; 
const nightmare = new Nightmare({
  show: true,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 5000 // in ms
});


describe("Laululistaikkuna", function(){
  this.timeout( 5000 );
    it("avautuu, kun käyttäjä painaa 'Selaa laulujen listaa'",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/songs.php?id=2')
          .wait(".songlistview-toggle")
          .click(".songlistview-toggle")
          .evaluate(function(){
              return $(".songlistview").is(":visible");
          })
          .then((isvisible) => {
              assert.equal(isvisible,true)
              done();
          }).catch(done);
    });

    it("Käyttäjä valitsee katsoa lauluja kirjaimen V kohdalta",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/songs.php?id=2')
          .wait(".songlistview-toggle")
          .click(".songlistview-toggle")
          .select(".songlistview select","V").wait(600)
          .evaluate(function(){
              return $(".songnames-container").text();
          })
          .then((songlist) => {
              assert.match(songlist,/Virsi 00/)
              done();
          }).catch(done);
    });


    it("Käyttäjä hakee laulua nimellä");
    it("Käyttäjä klikkaa laulua ja valitsee avautuvasta menusta *katso sanoja*");
    it("Käyttäjä klikkaa laulua ja valitsee avautuvasta menusta *käytä tässä messussa*");
    it("Käyttäjä klikkaa peruuta-nappia, ja roolinvalintavalikko häviää");
    it("Käyttäjä näkee viestin jossa kerrotaan, että laulu on onnistuneesti asetettu alkulauluksi");

});
