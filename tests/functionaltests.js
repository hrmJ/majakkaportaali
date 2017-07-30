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

describe.only("Messulistasivu", function(){
  this.timeout( 20000 );


  it('Käyttäjä näkee taulukon ja sen riveillä messujen päivämääriä ja aiheita', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .wait(".datarow").wait(waitbig)
      .evaluate(function(){
          var tds = document.querySelector(".datarow").children;
          return {"date": tds[0].textContent,
                  "theme": tds[1].textContent};
      })
      .then((rowcontent) => {
          assert.match(rowcontent.date,/\d+/)
          assert.match(rowcontent.theme,/\w+/)
          done();
      }).catch(done);
  });

  it.only('Käyttäjä suodattaa messulistanäkymää niin, että siinä näkyy vain joka viikon juontaja.', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .wait("select").wait(waitbig)
      .select("select", "juontaja").wait(waitbig)
      .wait("[name=filteredchanges]").wait(waitbig)
      .evaluate(function(){
          return document.querySelector("[name='id_2']").value;
      })
      .then((row) => {
        assert.match(row,/James/);
        done();
      }).catch(done);
  });


  it('Käyttäjä suodattaa näkyviin vain juontajat ja vaihtaa juontajan messuun 2', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php?filterby=juontaja')
      .wait(".datarow")
      .type("[name='id_2']","")
      .type("[name='id_2']","Simo Lipsanen").wait(waitsmall)
      .click("[name='filteredchanges']")
      .wait("[name='id_2']").wait(waitsmall)
      .evaluate(function(){
          return document.querySelector("[name='id_2']").value;
      })
      .then((field) => {
        assert.match(field,/Simo Lipsanen/);
        done();
      }).catch(done);
  });



  it('Käyttäjä klikkaa taulukon riviä ja siirtyy messudetaljisivulle.', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .wait("#serviceid_3").wait(waitbig)
      .click("#serviceid_3")
      .wait("h2").wait(waitbig)
      .evaluate(function(){
          return document.title;
      })
      .then((title) => {
        assert.match(title, /Majakkamessu/);
        done();
      }).catch(done);
  });

    it('Ennen helmikuun messuja on otsikko "Helmikuu"'), (done) => {
        nightmare
          .goto('http://localhost/majakkaportaali/servicelist.php')
          .wait("#serviceid_3").wait(waitbig)
          .wait("h2").wait(waitbig)
          .evaluate(function(){
              return document.title;
          })
          .then((title) => {
            assert.match(title, /Majakkamessu/);
            done();
          }).catch(done);
    )};

});


describe("Messudetaljisivu", function(){
  this.timeout( 00 );
  it('Käyttäjä näkee otsikkossa sanan Majakkamessu', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicedetails.php?id=1')
      .wait('h2').wait(waitsmall)
      .evaluate(function(){
          return document.title;
      })
      .then((title) => {
        assert.match(title,/Majakkamessu/);
        done();
      }).catch(done);
  });


  it('Käyttäjä huomaa, että vastuuhenkilöiden nimiä voi muokata. Hän muokkaa nimeä ja nimi on vaihtunut.', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicedetails.php?id=1')
      .wait(".datarow").wait(waitsmall)
      .type("[name='liturgi']","")
      .type("[name='liturgi']","Paul Copan")
      .click("[name=savedetails]")
      .wait("h2").wait(waitbig)
      .evaluate(function(){
          return document.querySelector("[name=liturgi]").value;
      })
      .then((liturgi) => {
        assert.equal(liturgi,"Paul Copan");
        done();
      }).catch(done);
  });


});

