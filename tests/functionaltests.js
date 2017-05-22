var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line
var assert = require('chai').assert; 


describe('Alkutestit', function() {

    before(function() {
        console.log("Aloitetaan testit. Kirjaudutaan sisään...");
        this.nightmare = Nightmare({show:true});
    });

    after(function() {
        this.nightmare.end();
        console.log("Lopetetaan...");
      // ...
    });

    describe('Testaa, onko etusivu pystyssä', function() {
      it('Käyttäjä näkee sivun otsikkona: Majakkaportaali', function(done) {
        this.timeout('10s');
        this.nightmare
            .goto('http://localhost/majakkaportaali/index.php')
            .evaluate(function () {
                return document.querySelector('title').textContent;
            })
            .then(function(title) {
                expect(title).to.equal('Majakkaportaali');
                done();
            }).catch(done);
      });
    });


});

