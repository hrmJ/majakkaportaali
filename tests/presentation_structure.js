//
var Nightmare = require('nightmare');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: true,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 10000 // in ms
});

var waitsmall = 0;
var waitbig = 500;

describe("Messun rakenne", function(){
  this.timeout( 5000 );

  it('Näytä syötettävien elementtien valikko', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(700)
      .wait(".structural-element-add")
      .click(".structural-element-add ul li li li")
      .evaluate(function(){
          return document.querySelector(".structural-element-adder");
      })
      .then((adderwindow) => {
          assert.isNotNull(adderwindow,"Syötettävien elementtien valikko ei näy.")
          done();
      }).catch(done);
  });

  it('Valitse infodian lisäys ja syötä tekstiä', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(700)
      .wait(".structural-element-add")
      .click(".structural-element-add ul li li")
      .wait(".structural-element-adder textarea")
      .type(".structural-element-adder textarea","")
      .type(".structural-element-adder textarea","Tämä infosisältö näytetään aina, kun esityksessä tulee vuoroon se kohta, jossa plaablaablasd ja sitten on niin, että Mars.")
      .evaluate(function(){
          return document.querySelector(".structural-element-adder textarea").value;
      })
      .then((text) => {
          assert.match(text,/näytetään aina, kun/)
          done();
      }).catch(done);
  });


  it('Sulje lisäysikkuna', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(100)
      .wait(".structural-element-add")
      .click(".structural-element-add ul li li")
      .wait(".structural-element-adder textarea")
      .type(".structural-element-adder textarea","")
      .type(".structural-element-adder textarea","Tämä infosisältö näytetään aina, kun esityksessä tulee vuoroon se kohta, jossa plaablaablasd ja sitten on niin, että Mars.")
      .wait("#savebutton")
      .click("#savebutton").wait(400)
      .evaluate(function(){
          return document.querySelector(".structural-element-adder").innerHTML;
      })
      .then((adderwindow_html) => {
          assert.equal(adderwindow_html,"");
          done();
      }).catch(done);
  });

  it('Kun käyttäjä kirjoittaa ät-merkin, oikealle avautuu valikko, josta voi valita messuvastuita', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(100)
      .wait(".structural-element-add")
      .click(".structural-element-add ul li li")
      .wait(".structural-element-adder textarea")
      .type(".structural-element-adder textarea","")
      .type(".structural-element-adder textarea","Tässä messussa juontajana on @ ja lapsia kaitsee pyhisvastaava @")
      .wait("#savebutton")
      .evaluate(function(){
          return document.querySelector(".injected-data select");
      })
      .then((injectselect) => {
          assert.isNotNull(injectselect,"Valintaikkuna ei ilmestynyt");
          done();
      }).catch(done);
  });

  it.skip('Kun käyttäjä poistaa ät-merkin, oikealta poistetaan select-elementti', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(100)
      .wait(".structural-element-add")
      .click(".structural-element-add ul li li li")
      .wait(".structural-element-adder textarea")
      .type(".structural-element-adder textarea","")
      .type(".structural-element-adder textarea","Tässä messussa juontajana on @ ja lapsia kaitsee pyhisvastaava @")
      .type(".structural-element-adder textarea","")
      .wait("#savebutton")
      .evaluate(function(){
          return document.querySelector(".injected-data select");
      })
      .then((injectselect) => {
          assert.isNull(injectselect,"Valintaikkuna ei ilmestynyt");
          done();
      }).catch(done);
  });

  it('Käyttäjä muokkaa olemassaolevan segmentin nimeä', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(100)
      .wait(".slot")
      .click(".slot .edit-link")
      .wait(".segment-name")
      .type(".segment-name","")
      .type(".segment-name","tadaa, uusi nimi")
      .click("#savebutton")
      .wait(".slot")
      .evaluate(function(){
          return document.querySelector(".slot .slot-name").textContent;
      })
      .then((firstslot) => {
          assert.equal(firstslot,"tadaa, uusi nimi");
          done();
      }).catch(done);
  });

  it.skip('Käyttäjä liikuttaa segmentin nro 3 segmentiksi nro 1', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(100)
      .wait(".slot")
      .click(".slot .edit-link")
      .wait(".segment-name")
      .type(".segment-name","")
      .type(".segment-name","tadaa, uusi nimi")
      .click("#savebutton")
      .wait(".slot")
      .evaluate(function(){
          return document.querySelector(".slot .slot-name").textContent;
      })
      .then((firstslot) => {
          assert.equal(firstslot,"tadaa, uusi nimi");
          done();
      }).catch(done);
  });

  it('Syöttää laulun ja antaa sille nimeksi Alkulaulu', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(700)
      .wait(".menu")
      .click("#addsongmenu").wait(200)
      .type(".segment-name","Alkulaulu")
      .evaluate(function(){
          return document.querySelector(".segment-name").value;
      })
      .then((text) => {
          assert.equal(text,"Alkulaulu")
          done();
      }).catch(done);
  });


  it('Syöttää laulun ja valitsee, että kyseisen tyyppisiä lauluja voi olla monta. Asettaa laulujen yläotsikoksi: Ylistyslaulut', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(700)
      .wait(".menu")
      .click("#addsongmenu").wait(200)
      .click("[value='multisong']")
      .wait(".multisongheader")
      .type(".multisongheader","Ylistyslaulut")
      .evaluate(function(){
          return document.querySelector(".multisongheader").value;
      })
      .then((text) => {
          assert.equal(text,"Ylistyslaulut")
          done();
      }).catch(done);
  });

  it("Rakenteesta voi poistaa elementin");

  it("Syöttää lauluelementin, jossa rajoitettu mahdolliset laulut");

});

