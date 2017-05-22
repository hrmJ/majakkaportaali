var Nightmare = require('nightmare');
var expect = require('chai').expect; // jshint ignore:line
var assert = require('chai').assert; 


describe('Basic test suite', function() {

    before(function() {
        console.log("Aloitetaan testit. Kirjaudutaan sisään...");
        this.nightmare = Nightmare({show:true});
    });

    after(function() {
        this.nightmare.end();
        console.log("Lopetetaan...");
      // ...
    });

    describe('Some tests', function() {
      it('test 1', function(done) {
        this.timeout('2s');
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

