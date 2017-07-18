/**
 *
 * Laululistan toimimiseen liittyvä javascript.
 *
 */

$(document).ready (function(){

    //Polku ajax-skriptit sisältävään kansioon
    var loaderpath = "php/loaders";


    /**
     * Tarkkailee tekstikenttiä ja katsoo, onko tietokannassa laulua, jonka nimi vastaisi tekstikentän arvoa.
     */
    function CheckIfLyricsExist(event, val){
        //Jos kutsuttiin näppäinpainalluksen seurauksena, ota tekstikentän arvo tapahtumasta
        if(val==undefined && event.hasOwnProperty("target")) val = event.target.value;
        //Ota talteen tekstikentän sisältävä solu riippuen siitä, kutsuttiinko each-loopista vai ei
        var $td = event.hasOwnProperty("target") ? $(event.target).parent() : event.parent();
        //Säädä viereisen solun teksti riippuen siitä, onko laulua tietokannassa vai ei
        $.getJSON(loaderpath + "/songtitles.php",{songname:val,fullname:"yes"},function(data){
            if(data.length==0) $td.next(".lyricsindicator").text("Lisää sanat");
            else $td.next(".lyricsindicator").text("Katso sanoja");
            if (val=="") $td.next(".lyricsindicator").text("");
        });
    } 


    /**
     *
     * Lataa sanat annetun otsikon perusteella
     *
     */

    function LoadLyricsByTitle(title){
            $(".sideroller").find("button").remove();
            $.getJSON(loaderpath + "/songcontent.php",
                    {songname:title},
                    function(data){
                        $(".sideroller > h2").text(data.title);
                        verses = data.verses.split(new RegExp(/\n{2,}/));
                        $(".versedata").html("");
                        $.each(verses,function(i,verse){
                            $(".versedata").append($("<p></p>").html(verse.replace(/\n{1}/g,"<br>")));
                        });
                    });
    }

    /**
     * Näytä sanojen lisäysikkuna, kun käyttäjä klikkaa oikeanpuolimmaista taulukon
     * solua.
     */
    function ShowLyricsWindow(){
        var songtitle = $(this).parent().find("[type='text']").val()
        if($(this).text()!="") $(".sideroller").show();
        if($(this).text()=="Katso sanoja"){
            LoadLyricsByTitle(songtitle);
        }
        else if($(this).text()=="Lisää sanat"){
            AddLyrics(songtitle);
        }
    }

    /**
     *
     * Muokkaa näytettyjä sanoja ja tallentaa muutokset.
     *
     */
    function EditLyrics(){
        if($(".sideroller").find("button").length==0){
            var verses = "";
            $.each($(".versedata").find("p"), function(idx,verse){ verses += "\n\n" + verse.innerHTML.replace(/<br>/g,"\n")});
            $(".versedata").html("");
            $("<textarea name='editedsong'></textarea>").text(verses.trim()).appendTo($(".versedata"));
            $("<button>Tallenna muutokset</button>").appendTo(".sideroller").click(SaveLyrics);
        }
    }

    /**
     *
     * Lisää sanat uuteen lauluun
     *
     */
    function AddLyrics(songtitle){
        $(".versedata").html("");
        $(".sideroller > h2").text(songtitle);
        $("<textarea name='editedsong'></textarea>").appendTo($(".versedata"));
        $("<button>Tallenna muutokset</button>").appendTo(".sideroller").click(SaveLyrics);
    }


    /**
     *
     * Lähettää ajax-kyselynä sanat palvelimelle
     *
     */
    function SaveLyrics(){
            console.log("moro");
            $.post(loaderpath + "/savelyrics.php",{
                songname:$(".sideroller > h2").text(),
                editedverses:$("[name='editedsong']").val()
            }).done(function(data){
                LoadLyricsByTitle($(".sideroller > h2").text());
                $(".songinput").each(function(){CheckIfLyricsExist($(this),$(this).val())});
            }
            );
    }

    //Jquery UI:n autocomplete-pluginin asetukset laulujen nimien täydennystä varten
    var autocompsongtitle = {
                source: function(request, response){ $.getJSON(loaderpath + "/songtitles.php",{songname:request.term},response);},
                minLength: 2,
                select: function(event,input){CheckIfLyricsExist(event, input.item.value);}};

    $(".songinput").autocomplete(autocompsongtitle);
    $(".songinput").on("change paste keyup",CheckIfLyricsExist);
    //Tarkista jo syötetyistä lauluista, onko niitä tietokannassa
    $(".songinput").each(function(){CheckIfLyricsExist($(this),$(this).val())});
    $(".lyricsindicator").click(ShowLyricsWindow);
    $(".sideroller").hide();
    $(".sideroller > p > a").click(EditLyrics);
    $(".multisongs [type='button']").click(
        /**
         * Lisää uusi rivi laulujen listaan tai poista viimeisin rivi.
         */
        function(){
            var $table = $(this).parent().prev("table");
            if($(this).hasClass('decreaser')){
                //Poista viimeisin, jos painettu miinuspainiketta ja jos vähintään 1 jäljellä
                if($table.find("tr").length>1) $table.find("tr:last-child").remove();
            }
            else{
                //Kopioi taulukon viimeinen rivi
                var $tr = $table.find("tr:last-child").clone(true);
                //Muuta kopioidun rivin numero niin, että se on yhden suurempi kuin alkuperäisessä rivissä
                var number = $tr.find("td:first-child").text().replace(/([^\d+]+ ?)(\d+)/,"$2")*1;
                var $newtr = $($tr.html().replace(new RegExp(number,"g"), number +1 ));
                //Tyhjennä itse laulun nimi ja lisää mukaan automaattiseen täydennykseen
                $newtr.find("input").attr({"value":""}).autocomplete(autocompsongtitle);
                //Syötä uusi rivi taulukkoon
                $newtr.insertAfter($table.find("tr:last-child")).wrapAll("<tr></tr>");
                $table.find("tr:last-child").find("td:last-child").click(ShowLyricsWindow);
            }
    });

});


