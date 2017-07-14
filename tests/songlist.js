
var Nightmare = require('nightmare');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: false,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 3000 // in ms
});


describe("Laulujen syöttö", function(){
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

    it("Käyttäjä lisää uuden ylistyslaulun painamalla +-nappia. Käyttäjä kirjoittaa laulun nimeksi 'Bless the Lord' ja tallentaa.",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/songs.php?service_id=2')
          .wait("table")
          .click(".multisongs.ws .increaser").wait("[name=ws_4]")
          .type("[name=ws_4]","").type("[name=ws_4]","Bless the Lord").click("[value='Tallenna']").wait("table")
          .evaluate(function(){
              return document.querySelector("[name=ws_4]").value;
          })
          .then((inputval) => {
              assert.equal(inputval,"Bless the Lord")
              done();
          }).catch(done);
    });

    it("Käyttäjä poistaa yhden ylistyslaulun",(done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/songs.php?service_id=2')
          .wait("table")
          .click(".multisongs.ws .decreaser").click(".multisongs.ws .decreaser").wait("[name=ws_2]")
          .click("[value='Tallenna']").wait("table")
          .evaluate(function(){
              return document.querySelector("[name=ws_3]");
          })
          .then((inputval) => {
              assert.isNull(inputval);
              done();
          }).catch(done);
    });

  it("Viimeistä ehtoollislaulua ei voi poistaa",(done)=>{
        nightmare
          .goto('http://localhost/majakkaportaali/songs.php?service_id=2')
          .wait("table")
          .click(".multisongs.com .decreaser").click(".multisongs.com .decreaser").click(".multisongs.com .decreaser").click(".multisongs.com .decreaser").wait("[name=com_1]")
          .click("[value='Tallenna']").wait("table")
          .evaluate(function(){
              return document.querySelector("[name=com_1]");
          })
          .then((inputval) => {
              assert.isNotNull(inputval);
              done();
          }).catch(done);
  });

 it("Näyttää viestin, jos yrittää poistaa viimeisen laulun");

});

describe.only("sanojen olemassaolon indikaattori",function(){
    this.timeout(3000);
    it("Laulurivien kolmannessa solussa ei lue mitään", (done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .evaluate(function(){
            return document.querySelectorAll(".lyricsindicator")[0].textContent;
        })
        .then((tdval)=>{
            assert.equal(tdval,"");
            done();
        }).catch(done);
    });
    it("Käyttäjä kirjoittaa 001, ja solussa lukee 'lisää sanat'",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .type("[name='alkulaulu']","001")
    });
    it("Käyttäjä kirjoittaa Virsi 001, ja solussa lukee 'katso sanoja'");
    it("Käyttäjä kirjoittaa 001, painaa alanuolta ja enteriä. Solussa lukee 'katso sanoja'");
});

