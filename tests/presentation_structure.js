//
var Nightmare = require('nightmare');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: false,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 10000 // in ms
});

var waitsmall = 0;
var waitbig = 500;

describe.only("Messun rakenne", function(){
  this.timeout( 5000 );

  it('Näytä syötettävien elementtien valikko', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/service_structure.php').wait(700)
      .wait(".structural-element-add")
      .click(".structural-element-add ul li li")
      .evaluate(function(){
          return document.querySelector(".structural-element-adder");
      })
      .then((adderwindow) => {
          assert.isNotNull(adderwindow,"Syötettävien elementtien valikko ei näy.")
          done();
      }).catch(done);
  });

  it('Valitse yksittäisen dian lisäys ja syötä tekstiä', (done) => {
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


  it('Tallenna yksittäisen dian lisäys tietokantaan ja sulje lisäysikkuna', (done) => {
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

});

