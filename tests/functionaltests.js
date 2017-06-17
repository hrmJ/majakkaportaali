var Nightmare = require('nightmare');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: true,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 10000 // in ms
});

describe("Messulistasivu", function(){
  this.timeout( 20000 );


  it('Käyttäjä näkee taulukon ja sen riveillä messujen päivämääriä ja aiheita', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .wait("table").wait(800)
      .evaluate(function(){
          var tds = document.querySelector("table tr").children;
          return {"date": tds[0].textContent,
                  "theme": tds[1].textContent};
      })
      .then((rowcontent) => {
          assert.match(rowcontent.date,/\d+/)
          assert.match(rowcontent.theme,/\w+/)
          done();
      }).catch(done);
  });

  it('Käyttäjä suodattaa messulistanäkymää niin, että siinä näkyy vain joka viikon juontaja.', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .wait("select").wait(800)
      .select("select", "juontaja").wait(900)
      .wait("[name=filteredchanges]")
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
      .wait("table")
      .type("[name='id_2']","")
      .type("[name='id_2']","Simo Lipsanen").wait(500)
      .click("[name='filteredchanges']")
      .wait("[name='id_2']").wait(500)
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
      .wait("#serviceid_3").wait(800)
      .click("#serviceid_3")
      .wait("h2").wait(600)
      .evaluate(function(){
          return document.title;
      })
      .then((title) => {
        assert.match(title, /Majakkamessu/);
        done();
      }).catch(done);
  });

});


describe("Messudetaljisivu", function(){
  this.timeout( 20000 );
  it('Käyttäjä näkee otsikkossa sanan Majakkamessu', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicedetails.php?id=1')
      .wait('h2').wait(300)
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
      .wait("table").wait(400)
      .type("[name='liturgi']","")
      .type("[name='liturgi']","Paul Copan")
      .click("[name=savedetails]")
      .wait("h2").wait(1000)
      .evaluate(function(){
          return document.querySelector("[name=liturgi]").value;
      })
      .then((liturgi) => {
        assert.equal(liturgi,"Paul Copan");
        done();
      }).catch(done);
  });

});

