
var Nightmare = require('nightmare');
var jquery = require('jquery');
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

describe("sanojen olemassaolon indikaattori",function(){
    this.timeout(5000);
    it("Laulurivien kolmannessa solussa ei lue mitään, jos solu on tyhjä", (done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .type("[name='alkulaulu']","").wait(500)
        .click("[value='Tallenna']").wait("[name='alkulaulu']").wait(2000)
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
        .type("[name='alkulaulu']","").type("[name='alkulaulu']","001")
        .evaluate(function(){
            return document.querySelectorAll(".lyricsindicator")[0].textContent;
        })
        .then((tdval)=>{
            assert.equal(tdval,"Lisää sanat")
            done();
        }).catch(done);
    });
    it("Käyttäjä kirjoittaa Virsi 001, ja solussa lukee 'katso sanoja'",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .type("[name='alkulaulu']","").type("[name='alkulaulu']","Virsi 001")
        .evaluate(function(){
            return document.querySelectorAll(".lyricsindicator")[0].textContent;
        })
        .then((tdval)=>{
            assert.equal(tdval,"Katso sanoja")
            done();
        }).catch(done);
    });
    it("Käyttäjä kirjoittaa 001, painaa alanuolta ja enteriä. Solussa lukee 'katso sanoja'");
});


describe("Sanojen katselu ja lisääminen",function(){
    this.timeout(7000);
    it("Käyttäjä klikkaa 'Katso sanoja' -solua ja se tuo näkyviin kyseisen laulun sanat",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .type("[name='alkulaulu']","").type("[name='alkulaulu']","Virsi 001")
        .click("table  tr:first-child td:last-child")
        .evaluate(function(){
            return document.querySelector(".sideroller h2").textContent;
        })
        .then((header)=>{
            assert.equal(header,"Virsi 001");
            done();
        }).catch(done);
    });

    it("Käyttäjä klikkaa 'Muokkaa sanoja' -linkkiä ja sanoja voi muokata",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .type("[name='alkulaulu']","").type("[name='alkulaulu']","Virsi 001")
        .click("table  tr:first-child td:last-child")
        .click(".sideroller a")
        .evaluate(function(){
            return document.querySelector(".sideroller textarea").name;
        })
        .then((fieldname)=>{
            assert.equal(fieldname,"editedsong");
            done();
        }).catch(done);
    });

    it("Käyttäjä klikkaa 'Muokkaa sanoja' -linkkiä ja sanoja voi muokata",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .type("[name='alkulaulu']","").type("[name='alkulaulu']","Virsi 001")
        .click("table  tr:first-child td:last-child")
        .click(".sideroller a")
        .evaluate(function(){
            return document.querySelector(".sideroller textarea").name;
        })
        .then((fieldname)=>{
            assert.equal(fieldname,"editedsong");
            done();
        }).catch(done);
    });

    it("Käyttäjä tallentaa muutoksensa ja tiedot ovat vaihtuneet",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .type("[name='alkulaulu']","").type("[name='alkulaulu']","Virsi 001").wait(300)
        .click("table  tr:first-child td:last-child")
        .click(".sideroller a")
        .type(".sideroller textarea", "Kirjoitin uudet sanat.").wait(500)
        .click(".sideroller button").wait(".versedata").wait(1500)
        .evaluate(function(){
            return document.querySelector(".versedata").textContent;
        })
        .then((versedata)=>{
            assert.match(versedata,/Kirjoitin uudet sanat/);
            done();
        }).catch(done);
    });

    it("Käyttäjä painaa lisää saat -linkkiä ja tallentaa sanat uuteen lauluun nimeltä Katson autiota autobaanaa",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("table")
        .type("[name='alkulaulu']","").type("[name='alkulaulu']","Katson autiota autobaanaa")
        .click("table  tr:first-child td:last-child")
        .click(".sideroller a")
        .type(".sideroller textarea", "Taas saavuin vanhaan autokahvilaan.\n\nSe ennen viimeistä kierrosta laalaalaa..\n\nLaalaalaa.").wait(500)
        .click(".sideroller button").wait(".versedata").wait(300)
        .evaluate(function(){
            return document.querySelector(".versedata").textContent;
        })
        .then((versedata)=>{
            assert.match(versedata,/Taas saavuin vanhaan/);
            done();
        }).catch(done);
    });

});

describe("Liturgiset laulut", function(){
  this.timeout( 20000 );
    it("Käyttäjä klikkaa pudotusvalikkoa valitakseen Jumalan Karitsa -hymniksi riemumessuversion. ",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("select")
        .select("#jkselect", "10").wait(200)
        .evaluate(function(){
            return document.querySelector("#jkselect").options[document.querySelector("#jkselect").selectedIndex].textContent;
        })
        .then((title)=>{
            assert.match(title,/iemumessu/);
            done();
        }).catch(done);
    });

    it("Käyttäjä klikkaa pudotusvalikkoa valitakseen pyhähymniksi virren 134. ",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("select")
        .select("#pyhselect", "5").wait(200)
        .evaluate(function(){
            return document.querySelector("#pyhselect").options[document.querySelector("#pyhselect").selectedIndex].textContent;
        })
        .then((title)=>{
            assert.match(title,/Virsi 134/);
            done();
        }).catch(done);
    });


    it("Käyttäjä katsoo virren 134 sanoja",(done)=>{
        nightmare.goto('http://localhost/majakkaportaali/songs.php?service_id=2').wait("select")
        .select("#pyhselect", "5").wait(200)
        .click(".pyhlyr").wait(".sideroller h2")
        .evaluate(function(){
            return document.querySelector(".sideroller h2").textContent;
        })
        .then((title)=>{
            assert.match(title,/Virsi 134/);
            done();
        }).catch(done);
    });

    it("Käyttäjä muokkaa virren 134 sanoja, niin että ne sisältävät sanan KUKKULUURUU");
    it("Käyttäjä lisää uuden laulun (Uusi hieno JK) Jumalan karitsa -hymniksi, lisää siihen sanat ja tallentaa.");
    it("Uusi hieno JK on yksi vaihtoehdoista select-valitsimessa.");
    it("Käyttäjä lisää uuden Pyhä-hymnin version jostakin jo olemassa olevasta laulusta (Pyhä ja puhdas vapahtaja)");
});

