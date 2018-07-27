/**
 *
 * Funktiot ja oliot, joilla muokataan ja näytetään sanoja.
 *
 */


//Polku ajax-skriptit sisältävään kansioon
var loaderpath = "php/loaders";

//Jquery UI:n autocomplete-pluginin asetukset laulujen nimien täydennystä varten
var autocompsongtitle = {
    source: function(request, response){ $.getJSON(loaderpath + "/songtitles.php",{songname:request.term,fullname:"no"},response);},
            minLength: 0,
            select: function(event,input){CheckIfLyricsExist(event, input.item.value);}};


/**
 * Lisää uuden rivin laulujen listaan tai poistaa viimeisimmän rivin.
 */
function AddMultisongsRow(){
    var $table = $(this).parent().parent(".multisong-container");
    if($(this).hasClass('decreaser')){
        //Poista viimeisin, jos painettu miinuspainiketta ja jos vähintään 1 jäljellä
        if($table.find(".songslot").length>1) $table.find(".songslot").last().remove();
    }
    else{
        //Kopioi taulukon viimeinen rivi
        var $tr = $table.find(".songslot").last().clone(true);
        //Muuta kopioidun rivin numero niin, että se on yhden suurempi kuin alkuperäisessä rivissä
        var number = $tr.find("div:eq(0)").text().replace(/([^\d+]+ ?)(\d+)/,"$2")*1;
        var $newtr = $($tr.html().replace(new RegExp(number,"g"), number +1 ));
        //Tyhjennä itse laulun nimi ja lisää mukaan automaattiseen täydennykseen
        $newtr.find("input").attr({"value":""}).autocomplete(autocompsongtitle);
        //Syötä uusi rivi taulukkoon
        $newtr.insertAfter($table.find(".songslot").last()).wrapAll("<div class='songslot'></div>");
        $table.find(".songslot").last().find(".lyricsindicator").click(ShowLyricsWindow).html("&nbsp;");
        $(".songinput, select").on("change paste keyup",CheckIfLyricsExist);
    }
}



/**
 * Tarkkailee tekstikenttiä ja katsoo, onko tietokannassa laulua, jonka nimi vastaisi tekstikentän arvoa.
 */
function CheckIfLyricsExist(event, val){
    //Jos kutsuttiin näppäinpainalluksen seurauksena, ota tekstikentän arvo tapahtumasta
    if(val==undefined && event.hasOwnProperty("target")) val = event.target.value;
    //Ota talteen tekstikentän sisältävä solu riippuen siitä, kutsuttiinko each-loopista vai ei
    var $td = event.hasOwnProperty("target") ? $(event.target).parent() : event.parent();
    //Jos kyseessä pudostusvalikko eli liturginen laulu, hae id:n perusteella
    var queryparams = $td.find("select").length>0 ? {songname:val,fullname:"yes",byid:"yes"} : {songname:val,fullname:"yes"};
    //Säädä viereisen solun teksti riippuen siitä, onko laulua tietokannassa vai ei
    $.getJSON(loaderpath + "/songtitles.php",queryparams,function(data){
        if(data.length==0) $td.next(".lyricsindicator").text("Lisää sanat");
        else $td.next(".lyricsindicator").text("Katso sanoja"); if ((val=="") || val.match(/^(Valitse |--------)/)) $td.next(".lyricsindicator").html("&nbsp;");
    });
} 


/**
 *
 * Lataa sanat annetun otsikon perusteella
 *
 */
function LoadLyricsByTitle(title, byid){
        $(".sideroller").find("button").remove();
        var queryparams = {songname:title};
        if(byid) queryparams = {songname:title,byid:"yes"};
        $.getJSON(loaderpath + "/songcontent.php", queryparams,
                function(data){
                    $(".sideroller > h2").text(data.title);
                    verses = data.verses.split(new RegExp(/\n{2,}/));
                    $(".versedata").html("");
                    if(byid) $(".sideroller h2").attr("id",title);
                    $.each(verses,function(i,verse){
                        $(".versedata").append($("<p></p>").html(verse.replace(/\n{1}/g,"<br>")));
                    });
                //Poista tallennuspainikkeet
                $(".sideroller input").remove();
                //Näytä muokkauslinkki
                $("#editwordslink").parent().show();
                });
}
    //Poista tallennuspainikkeet
    $(".sideroller input").remove()

/**
 * Näyttää sanojen lisäysikkunan, kun käyttäjä klikkaa oikeanpuolimmaista taulukon
 * solua.
 */
function ShowLyricsWindow(){
    var songtitle = $(this).parent().find("[type='text']").val()
    var byid = false;
    if(!songtitle){
        var songtitle = $(this).parent().find("select").val()
        byid = true;
    }

    //Piilota muut kuin laulun sanat, jos pienempi näyttö
    if(!$("nav .dropdown").is(":visible")) $(".side-main").hide();
    //Näytä sanojen muokkausikkuna
    if($(this).text()!="") $(".sideroller").show();
    if($(this).text()=="Katso sanoja") LoadLyricsByTitle(songtitle, byid);
    else if($(this).text()=="Lisää sanat") AddLyrics(songtitle);
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
        if($(".sideroller").find("[type=button]").length==0) {
            $("<input type='button' value='Tallenna muutokset'>").appendTo(".sideroller").click(SaveLyrics)
        };
        $("#editwordslink").parent().hide();
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
    if($(".sideroller").find("[type=button]").length==0) {
        $("<input type='button' value='Tallenna muutokset'>").appendTo(".sideroller").click(SaveLyrics);
    }
    $("#editwordslink").parent().hide();
}


/**
 *
 * Lähettää ajax-kyselynä sanat palvelimelle
 *
 */
function SaveLyrics(){
        var queryparams = {songname:$(".sideroller > h2").text(),
                           editedverses:$("[name='editedsong']").val() };
        var byid=false;
        if($(".sideroller h2").attr("id")){
            queryparams = {songname:$(".sideroller h2").attr("id"),
                           editedverses:$("[name='editedsong']").val(),
                           byid:"yes"};
            var byid=true;
        }
        $.post(loaderpath + "/savelyrics.php",queryparams).done(function(data){
            LoadLyricsByTitle($(".sideroller > h2").text(), byid);
            $(".songinput, select").each(function(){CheckIfLyricsExist($(this),$(this).val())});
        }
        );
}

/**
 *
 * Sulkee sanojen hallintaikkunan
 *
 */
function CloseWordEdit(){
    $(".sideroller").hide()
    $(".side-main").show().find("h2").show();
    if($(".sideroller").hasClass("songlistview-is-on"))  $(".songlistview").show();
}

