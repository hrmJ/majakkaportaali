var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: false,
  typeInterval: 20,
  pollInterval: 50,
  timeout: 4000,
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
      })
  });

  it('Käyttäjä näkee taulukon sivulla', (done) => {
    nightmare
      .goto('http://localhost/majakkaportaali/servicelist.php')
      .exists('table')
      .then((table) => {
          assert.equal(table,true);
          done();
      });
  });
});


