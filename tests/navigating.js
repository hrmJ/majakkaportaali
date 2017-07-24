var Nightmare = require('nightmare');
var jquery = require('jquery');
var assert = require('chai').assert; 

const nightmare = new Nightmare({
  show: false,
  typeInterval: 20,
  pollInterval: 50,
  waitTimeout: 3000 // in ms
});


describe("Perusnavigointi ", function(){
  this.timeout( 20000 );
    it("Käyttäjä klikkaa menuikonia ja valitsee 'Laulujen syöttö'");
  });

