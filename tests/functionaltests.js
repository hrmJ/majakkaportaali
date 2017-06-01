var Nightmare = require('nightmare');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: false,
  typeInterval: 20,
  pollInterval: 50,
});

describe("Messulistasivu", () => {
  it('Käyttäjä näkee otsikkona Majakkaportaali', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .evaluate(function(){
          return document.title;
      })
      .then((title) => {
        assert.equal(title, "Majakkaportaali");
        done();
      }).catch(done);
  });

  it('Käyttäjä näkee taulukon sivulla', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .exists('table')
      .then((table) => {
          assert.isTrue(table)
          done();
      }).catch(done);
  });


  it('Taulukossa on rivejä', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .evaluate(function(){
          return document.querySelector("table tr");
      })
      .then((row) => {
        assert.isNotNull(row);
        done();
      }).catch(done);
  });


  it('Taulukon riveillä on  messujen päivämääriä ja aiheita', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
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


  it('Käyttäjä klikkaa taulukon riviä ja siirtyy messudetaljisivulle.', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .click("#serviceid_162")
      .evaluate(function(){
          return document.title;
      })
      .then((title) => {
        assert.match(title, /Majakkamessu/);
        done();
      }).catch(done);
  });

});


describe("Messudetaljisivu", () => {
  it('Käyttäjä näkee otsikkossa sanan Majakkamessu', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicedetails.php')
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
      .goto('http://localhost/majakkaportaali/servicedetails.php')
      .type("[name='liturgi']","Justin Brierly")
      .click("#savedetails")
      .evaluate(function(){
          return document.querySelector("#liturgi").value;
      })
      .then((liturgi) => {
        assert.equal(liturgi,"Justin Brierly");
        done();
      }).catch(done);
  });

});

