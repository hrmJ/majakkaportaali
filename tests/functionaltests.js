var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line
var assert = require('chai').assert; 


describe('Alkutestit', function() {

    before(function() {
        console.log("Aloitetaan testit.");
        this.nightmare = Nightmare({show:false});
    });

    after(function() {
        this.nightmare.end();
        console.log("Lopetetaan...");
      // ...
    });

    describe('Testaa, onko messulistasivu olemassa', function() {
      it('Käyttäjä näkee sivun otsikkona: Majakkaportaali', function(done) {
        this.timeout('10s');
        this.nightmare
            .goto('http://localhost/majakkaportaali/servicelist.php')
            .evaluate(function () {
                return document.title;
            })
            .then(function(title) {
                expect(title).to.equal('Majakkaportaali');
                done();
            }).catch(done);
      });
    });


});

