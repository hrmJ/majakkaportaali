
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

describe.only("Käyttäjien lisäämät messuissa näytettävät infot ja mainokset", function(){
  this.timeout( 5000 );
  it("Infodioja voi lisätä erillisestä menusta, niin että lisättäessä infosta voi klikata, missä kaikissa messuissa halutaan mainostaa tätä asiaa");
  it("Infon lisäyksessä mahdollista laittaa kuva ja lisäksi valita kuvan sijainti ja ehkä tehosteita (varjostus, reunat yms.)");
  it("Kevennetty markdown-syntaksi, niin että ainakin lihavointi ja kursivointi mahdollista...");
  it("Vakioboksi sille, kuka vastaa ja kehen voi ottaa yhteyttä.");
  it("Mahdollista, että yksi info kattaa useamman dian (ehkä...ei välttämättä hyvä asia)");
});
