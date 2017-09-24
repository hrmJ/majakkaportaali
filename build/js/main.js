/**
 *
 * Valikoihin liittyvä js.
 *
 */
$(document).ready(function(){
    $(".hamburger").click(function(){$(this).next(".dropdown").slideToggle();});
});

/**
*
* Sisältää javascript-koodin messudetaljisivua varten.
*
*/

$(document).ready(function(){
    if($("body").hasClass("servicelist")){
        //Siirtyminen messudetaljinäkymään
        $(".datarow").click(function(){
            if($("#respfilter").val()=="Yleisnäkymä") window.location="servicedetails.php?id=" + this.id.replace(/[^_]+_/,"");
        });
        //Suodattaminen vastuun mukaan
        $("#respfilter") .change(function(){
            if(!this.value.match(/----/)) window.location="servicelist.php?filterby=" + this.value;
        });

        //Lisää jaottelu kuukausien mukaan
        var months = ['Tammikuu', 'Helmikuu', 'Maaliskuu', 'Huhtikuu', 'Toukokuu', 'Kesäkuu', 'Heinäkuu', 'Elokuu', 'Syyskuu', 'Lokakuu', 'Marraskuu', 'Joulukuu'];
        $(".servicedate").each(function(){
            var thismonth = months[$(this).text().split(".")[1] *1-1];
            if($(document).find("h2:contains("+ thismonth + ")").length==0) $(this).parents(".datarow").before("<h2>"+ thismonth + "</h2>");
        });
    }
});

//Yleisluontoisia apufunktioita
//
//


/**
 *
 * Skrollaa jokin elementti keskelle ruutua
 *
 * @param object $el jquery-olio, joka halutaan keskelle
 *
 */
function ScrollToCenter($el){
  //https://stackoverflow.com/questions/18150090/jquery-scroll-element-to-the-middle-of-the-screen-instead-of-to-the-top-with-a
  var elOffset = $el.offset().top;
  var elHeight = $el.height();
  var windowHeight = $(window).height();
  var offset;
  if (elHeight < windowHeight) {
    offset = elOffset - ((windowHeight / 2) - (elHeight / 2));
  }
  else {
    offset = elOffset;
  }
  console.log(offset);
  var speed = 700;
  $('html, body').animate({scrollTop:offset}, speed);

}

/**
 *
 * Sumenna tausta esim. kelluvan valikon alta
 *
 */
function BlurContent(){
    $(".blurcover").remove();
    $("<div class='blurcover'></div>").css({height:$("body").height(),width:$("body").width()}).prependTo($("body"));
}

/**
 * Periytymisen järjestämistä helpottava funktio.
 * https://stackoverflow.com/questions/4152931/javascript-inheritance-call-super-constructor-or-use-prototype-chain
 *
 * @param function base olio, joka peritään
 * @param function sub olio, joka perii
 *
 */
function extend(base, sub) {
  var origProto = sub.prototype;
  sub.prototype = Object.create(base.prototype);
  for (var key in origProto)  {
     sub.prototype[key] = origProto[key];
  }
  // The constructor property was set wrong, let's fix it
  Object.defineProperty(sub.prototype, 'constructor', { 
    enumerable: false, 
    value: sub 
  });
}


/**
*
* Sisältää javascript-koodin 
* kommenttien prosessoimista varten
*
*/

var loaderpath = "php/loaders";


/**
 *
 * Laajenna näkyviin uuden kommentin kirjoituskenttä
 *
 */
function ExpandCommentField(){
    $(this).animate({"height":"6em"}); 
    var $details = $(this).parent().parent().find(".commentdetails:eq(0)");
    $details.show();
    ScrollToCenter($details);
}



/**
 *
 * Lataa kaikki kommentit tietokannasta dokumenttiin
 *
 */
function LoadComments(){
    $.post(loaderpath + "/loadcomments.php", {id:$("#service_id").val()}, function(data){
        $(".loadedcomments").html(data);
        $(".newcomment").val("");
        $(".commentator").val("");
        $(".newcomment:eq(0)").height("3em");
        $(".comment comment-insert-controls").hide()
        $(".comment comment-insert-controls").hide()
        $(".commentdetails").hide()
        $("select").prop('selectedIndex',0);
        $(".comment-answer-link")
            .click(CreateCommentAnswerField)
            .each(function(){
            //Muuta vastauslinkin tekstiä ketjujen osalta
            if($(this).parent().parent().find(".comment").length>0) $(this).text("Jatka viestiketjua");
        });
        $(".savecomment").click(SaveComment);
        $(".newcomment:eq(0)").click(ExpandCommentField);
    });
}

/**
 *
 * Tallenna syötetty kommentti
 *
 */
function SaveComment(){
    $container = $(this).parent().parent().parent();
    var theme = "";
    var replyto = 0;
    var id = $container.parent().attr("id");
    if(id){
        replyto = id.replace(/c_/,"");
    }
    if($container.find("select").length>0){
        theme = $container.find("select").get(0).selectedIndex>1 ? $container.find("select").val() : "";
    }
    var queryparams = {id:$("#service_id").val(),
                       theme: theme,
                       content:$container.find(".newcomment").val(),
                       commentator:$container.find(".commentator").val(),
                       replyto:replyto
                      };
    $.post(loaderpath + "/savecomment.php",queryparams).done(LoadComments);
}

/**
 *
 * Syötä tekstikenttä kommenttiin tai viestiketjuun
 * vastaamista varten.
 *
 */
function CreateCommentAnswerField(){
    console.log("l");
    $(this).parent().next().slideDown().children().show();
}



/**
*
* Sisältää javascript-koodin messudetaljisivulla näytettäviä
* kommentteja varten
*
*/
$(document).ready(function(){
    if($("body").hasClass("servicedetails")){
        //Kommentit
        LoadComments();
    }
});

/**
 * Tapahtumat, jotka liittyvät messurakenteen määrittelyyn
 */

var adder = undefined;
var currently_dragged_no = undefined;

/**
 * Lisää kaikkiin messun segmentteihin muokkaus- ja poisto-ominaisuudet
 */
function UpdateAdderEvents(){
    $(".slot:last-of-type").after("<div class='drop-target'></div>");
    $(".edit-link").click(function(){
        switch($(this).parents(".slot").find(".slot_type").val()){
            default:
                adder = new InfoSlideAdder($(this).parents(".slot"));
                break;
        }
        adder.LoadParams($(this).parents(".slot").find(".content_id").val());
        adder.ShowWindow();
    });
    $(".remove-link").click(function(){console.log("ssssssremove") });

    //slottien siirtely
    $(".slot").on("dragstart",function(){ 
        $(".slot").addClass("drop-hide");
        $(this).removeClass("drop-hide");
        currently_dragged_no = $(this).find(".slot-number").text() * 1;
    });
    $(".drop-target")
        .on("dragover",function(event){
            event.preventDefault();  
            event.stopPropagation();
            $(this).addClass("drop-highlight").text("Siirrä tähän");
        })
        .on("dragleave",function(event){
            event.preventDefault();  
            event.stopPropagation();
            $(this).text("").removeClass("drop-highlight");
        })
        .on("drop",function(event){
            event.preventDefault();  
            event.stopPropagation();
            var prevno = $(this).prev().find(".slot-number").text();
            if(prevno=="") prevno = 0;
            var newids = [];
            console.log("PREVNO: " + prevno);
            $(".slot").each(function(){
                //console.log($(this).text());
                var thisno = $(this).find(".slot-number").text()*1;
                var id = $(this).find(".slot_id").val()*1;
                var newno = thisno*1;
                if(thisno == currently_dragged_no){
                    newno = prevno*1 + 1;
                    if(prevno > currently_dragged_no)
                        newno -= 1;
                }
                else if(thisno>currently_dragged_no && thisno > prevno) newno = thisno;
                else if(thisno>currently_dragged_no && thisno <= prevno) newno = thisno -1;
                else if(thisno>prevno && thisno != currently_dragged_no) newno = thisno*1 +1;
                else if(thisno==prevno && thisno >currently_dragged_no) newno = thisno*1 -1;
                else if(thisno==prevno) newno = thisno;
                newids.push({"slot_id":id,"newnumber":newno});
                });
            $.post("php/loaders/save_structure_slide.php",{"slideclass":"update_numbers","newids":newids}, function(data){ $(".structural-slots").load("php/loaders/loadslots.php",UpdateAdderEvents); });
        });
}

/**
 *
 * Valitse, mitä sisältöä ryhdytään lisäämään. 
 * Valintamenun  (jqueryui menu) callback.
 *
 */
function SelectTheContentToAdd(e, u){
    if(u.item.find("span").length==0){
        switch(u.item.text()){
            //case "Yksittäinen dia":
            //    break;
            case "Laulu":
                adder = new SongSlideAdder(u.item.parents(".structural-element-add"));
                break;
            case "Infodia":
                adder = new InfoSlideAdder(u.item.parents(".structural-element-add"));
                break;
        }
        if (adder != undefined) adder.ShowWindow();
    }
}


$(document).ready(function(){
    if($("body").hasClass("service_structure")){

        $(".menu").menu({ position: { my: "bottom", at: "right-5 top+5" }, select: SelectTheContentToAdd});
        UpdateAdderEvents();

        //Vain testaamista varten: lisäillään vähän id:itä
        $(".menu").find("li").each(function(){if($(this).text()=="Laulu")$(this).attr({"id":"addsongmenu"});});

    }
    }
);

/**
 *
 * Olio, jolla lisätään uusia esitykseen liittyviä messun rakenneosia.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var StructuralElementAdder = function($container){
        this.$lightbox = $("<div class='my-lightbox structural-element-adder'></div>");
        this.$preview_window = $("<div class='preview-window'><iframe scrolling='no' frameBorder='0'></iframe><button>Sulje esikatselu</button></div>");
        this.$container = $container;
        this.previewparams = {};
        this.previewhtml = "";
}

StructuralElementAdder.prototype = {

    /**
     *  Näytä ikkuna, jossa käyttäjä voi valita lisättävän messun osan tyypin
     */
    ShowWindow: function(){
        var self = this
        this.$container
            .prepend(this.$lightbox.append($("<div><button id='cancelbutton'>Sulje tallentamatta</button></div>")))
            .prepend(this.$lightbox.append($("<div><button id='savebutton'>Tallenna</button></div>")));
        if(this.slideclass==".infoslide"){
            this.$container.prepend(this.$lightbox.append($("<div><button id='previewbutton'>Esikatsele</button></div>")));
            $("#previewbutton").click(function(){self.PreviewSlide()});
        }
        $("#cancelbutton").click(function(){ self.$lightbox.html("").hide(); });
        $("#savebutton").click(function(){self.SaveAndClose();});
        $(".slidetext").on("change paste keyup",function(){self.InjectServiceData()});
        $("[value='multisong']").click(function(){self.$container.find(".multisongheader").toggle(); });
    },

    /**
     * Nollaa lisäysvalikon sisältö ja syötä uusi sisältö.
     *
     * @param object $el jquery-olio, joka syötetään  lightbox-ikkunan sisään
     *
     */
    SetLightBox: function($el){
        this.$lightbox.html("").prepend($(this.slideclass).clone(true));
        this.$lightbox.css({"width":$(".innercontent").width(),"top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"}).show();
    },


    /**
     * Nollaa esikatseluikkunan sisältö ja syötä uusi sisältö.
     *
     */
    SetPreviewWindow: function($el){
        this.$preview_window.css({"width":$(".innercontent").width(),"top":  $("nav .dropdown").is(":visible") ? "-250px" : "-50px"}).show();
        this.$preview_window.find("iframe").attr({"width":$(".innercontent").width()-30 + "px", "height":($(".innercontent").width()-30)/4*3+"px","border":"0"}).show();
    },

    /**
     *  Sulkee lisäysvalikkoikkunan ja tallentaa muutokset. Lataa myös tehdyt muutokset sivulle näkyviin.
     */
    SaveAndClose: function(){
        this.SetPreviewParams();
        $.post("php/loaders/save_structure_slide.php",this.previewparams,function(html){
            $(".structural-slots").load("php/loaders/loadslots.php",UpdateAdderEvents);
        });
        this.$lightbox.html("").hide();
    },

    /**
     *
     * Syötä valitsin, jolla voi liittää diaan tietoja messusta. Esimerkiksi sen, kuka on juontaja, kuka liturgi jne.
     *
     */
    InjectServiceData: function(){
        var atsings = this.$lightbox.find(".infoslidetext").val().match(/@/g);
        var number_of_atsings = atsings ? atsings.length : 0;
        if(this.$lightbox.find("select").length<number_of_atsings){
            //Laske ät-merkkien määrä ja vertaa select-elementtien määrään
            var $select = $("<select></select>");
            $.getJSON("php/loaders/load_data_for_injection.php",{fetch:"responsibilities"},
                function(data){$.each(data,function(idx,el){ $select.append("<option>" + el + "</option>")})});
            $select.appendTo(this.$lightbox.find(".injected-data"));
        }
        else if(this.$lightbox.find("select").length>number_of_atsings){
            while (this.$lightbox.find("select").length>number_of_atsings){
                this.$lightbox.find("select:last-of-type").remove();
                atsings = this.$lightbox.find(".slidetext").val().match(/@/g);
                number_of_atsings = atsings ? atsings.length : 0;
            }
        }
    },

    /**
     * Avaa ikkuna, jossa voi esikatsella diaa.
     */
    PreviewSlide: function(){
        var self = this;
        this.SetPreviewParams();
        this.$container.prepend(this.$preview_window);
        this.SetPreviewWindow();
        this.$preview_window.find("button").click(function(){self.$preview_window.hide()});
        $.post("php/loaders/slides_preview.php",this.previewparams,function(html){
            self.previewhtml = html;
            console.log(html);
            $(".preview-window iframe").attr({"src":"slides.html"});
        });
    },

    /**
     * Kun esikatseluikkuna latautunut, päivitä sen sisältö.
     */
    SetPreviewContent: function(){
        $(".preview-window iframe").contents().find("main").html(this.previewhtml);
    },


}


/**
 *
 * Laulusisällön lisäävä olio.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var SongSlideAdder = function($container){
    StructuralElementAdder.call(this, $container);
    this.slideclass = ".songslide";
    this.SetLightBox();
    return this;
}

SongSlideAdder.prototype = {
    /**
     * Kerää tallennusta varten tarvittavat tiedot
     */
    SetPreviewParams: function(){
        var self = this;
        this.previewparams = {
            multiname: this.$lightbox.find(".multisongheader").val(),
            restricted_to: "",
            slideclass: "songsegment",
            songdescription: this.$lightbox.find(".songdescription").val(),
            slot_number: self.slot_number==undefined ? $(".slot").length + 1 : self.slot_number,
            slot_name:this.$lightbox.find(".segment-name").val()};
    },
}

/**
 *
 * Yksittäisen diasisällön lisäävä olio.
 *
 * @param object $container jquery-oliona se div, jonka sisältä valittiin syöttää uusi elementti
 *
 */
var InfoSlideAdder = function($container){
    StructuralElementAdder.call(this, $container);
    this.slideclass = ".infoslide";
    this.SetLightBox();
    return this;
}


InfoSlideAdder.prototype = {
    /**
     * Muodosta dia esikatselua varten
     */
    SetPreviewParams: function(){
        var self = this;
        var maintext = this.$lightbox.find(".slidetext").val();
        //korvaa ät-merkit halutuilla arvoilla
        this.$lightbox.find("select").each(function(){maintext = maintext.replace(/@/," [" + $(this).val() + "] ")});
        this.previewparams = {
            slideclass: "infosegment",
            maintext:maintext,
            genheader: self.$lightbox.find("[type='checkbox']").get(0).checked ? "Majakkamessu" : "",
            subgenheader: self.$lightbox.find("[type='checkbox']").get(0).checked ? "Messun aihe" : "",
            slot_number: self.slot_number==undefined ? $(".slot").length + 1 : self.slot_number,
            slot_name:this.$lightbox.find(".segment-name").val() ,
            header:this.$lightbox.find(".slide-header").val()};
    },

    /**
     * Hae dian sisältötiedot tietokannasta
     *
     * @param int id haettavan sisällön id infosegments-taulussa
     */
    LoadParams: function(id){
        this.slot_number = this.$container.find(".slot-number").text();
        this.slot_name = this.$container.find(".slot_name_orig").val();
        var self = this;
        $.getJSON("php/loaders/fetch_slide_content.php",{"slideclass":"infosegment","id":id},function(data){
            self.$lightbox.find(".slide-header").val(data.header);
            self.$lightbox.find(".infoslidetext").val(data.maintext);
            self.$lightbox.find(".segment-name").val(self.slot_name);
            if(data.genheader != "")
                self.$lightbox.find("[value='show-upper-header']").get(0).checked=true;
            }
        );
    }
}


extend(StructuralElementAdder, InfoSlideAdder);
extend(StructuralElementAdder, SongSlideAdder);

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
 * Lisää uusi rivi laulujen listaan tai poista viimeisin rivi.
 */
function AddMultisongsRow(){
    var $table = $(this).parent().parent(".data-container");
    if($(this).hasClass('decreaser')){
        //Poista viimeisin, jos painettu miinuspainiketta ja jos vähintään 1 jäljellä
        if($table.find(".datarow").length>1) $table.find(".datarow").last().remove();
    }
    else{
        //Kopioi taulukon viimeinen rivi
        var $tr = $table.find(".datarow").last().clone(true);
        //Muuta kopioidun rivin numero niin, että se on yhden suurempi kuin alkuperäisessä rivissä
        var number = $tr.find(".data-left").text().replace(/([^\d+]+ ?)(\d+)/,"$2")*1;
        var $newtr = $($tr.html().replace(new RegExp(number,"g"), number +1 ));
        //Tyhjennä itse laulun nimi ja lisää mukaan automaattiseen täydennykseen
        $newtr.find("input").attr({"value":""}).autocomplete(autocompsongtitle);
        //Syötä uusi rivi taulukkoon
        $newtr.insertAfter($table.find(".datarow").last()).wrapAll("<div class='datarow'></div>");
        $table.find(".datarow").last().find(".lyricsindicator").click(ShowLyricsWindow).html("&nbsp;");
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
 * Näytä sanojen lisäysikkuna, kun käyttäjä klikkaa oikeanpuolimmaista taulukon
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
    if($(this).text()!="") $(".sideroller").show("slide");
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
 * Sulje sanojen hallintaikkuna
 *
 */
function CloseWordEdit(){
    $(".sideroller").hide()
    var show_this = $(".sideroller").hasClass("songlistview-is-on")  ? ".songlistview" : ".side-main";
    $(show_this).show();
}


/**
 *
 * Erillinen katselunäkymä lauluille ja niiden sanoille
 *
 */

var loaderpath = "php/loaders";

/**
 *
 * Laululistanäkymä
 *
 **/
SongListView = function(){
    this.$container = $(".songlistview");
    this.$servicesonglist = $(".side-main");
    var self = this;
    /**
     * Näyttää sanalistanäkymän ja piilota messukohtaisen näkymän.
     */
    this.Toggle = function(){
        $(".sideroller").hide();
        self.$servicesonglist.toggle()
        self.$container.toggle()
        $(".sideroller").toggleClass("songlistview-is-on");
        //if(!$("#number-of-songs").text()){
        //    $.
        //}
    };


    /**
     *
     * Näyttä valitsimen, jossa käyttäjä voi päättää, haluaako katsoa
     * laulun sanoa vai käyttää laulua esim. alkulauluna
     *
     * @param object launcher linkki, joka ikkunan käynnistää
     *
     */
    this.SelectAction = function(launcher){
        //Lisää himmennin muulle näytölle
        BlurContent();
        //Tallenna laulun nimi käyttöä varten
        self.active_launcher = launcher;
        launcher.parent()
            .addClass("songname-select")
            .append($("<div class='songname-select-option'>Katso sanoja</div>").click(self.ToggleLyricsView))
            .append($("<div class='songname-select-option'>Käytä laulua</div>").click(self.ToggleRoleSelect))
            .find("a,div").wrapAll("<div class='option-container'></div>")
            .slideDown("slow");
    };

    /**
     *
     * Palauttaa mäppinä css:ää varten tapahtuman käynnistäneen elementin
     * sijainti + elementin pituus
     *
     */
    this.GetActiveLauncherPosition = function(){
        var par = ($(".songname-select"));
        if(($(".container").width() - (par.position().left + par.width()))<300){
            var pos = {left:-par.position().left + "px", top:"-50px", width:$(".container").width()}
            //Pienellä näytöllä piilota alta pois valintalinkit
            $(".option-container").hide();
        }
        else{
            var pos = {left:par.width()+40+"px", top:"-50px", width:"300px"}
        }
        return pos;
    }

    /**
     *
     * Piilottaa kaikki kelluvat valitsinikkunat
     *
     * @param boolean removeblur poistetaanko taustan himmennys
     *
     */
    this.HideActionSelectors = function(removeblur){
        if(removeblur) $(".blurcover").remove();
        $(".songname-select-option").remove();
        $(".songrole-select").remove();
        $(".songnames-container div").removeClass("songname-select");
    }

    /**
     *
     * Lataa suodatetut laulujen nimet
     *
     * @param jQueryDom  launcher elementti, joka käynnistää latauksen
     *
     */
    this.LoadData = function(launcher){
        if(launcher[0].tagName == "LI" && launcher.find("li").length==0){
            //Etsi jquery UI-menun alin listataso
            if(launcher.find("span").length>0){
                //Jos kirjainjaettu alakohtiin, suodata niiden mukaan (esim. virsi 001-virsi 051)
                $.getJSON(loaderpath + "/songtitles.php",{songname:"",firstspan:launcher.find("span:eq(0)").text(),lastspan:launcher.find("span:eq(1)").text()},this.InsertData);
            }
            else{
                $.getJSON(loaderpath + "/songtitles.php",{songname:launcher.text(),fullname:"first-letter"},this.InsertData);
            }
        }
    };

    /**
     *
     * Syötä filtteröidyt laulut linkeiksi laululistasivulle
     *
     * @param Array data ajax-kyselyllä ladattu taulukko laulujen nimistä
     *
     */
    this.InsertData = function(data){
        $(".songnames-container").html("");
        $.each(data,function(key, item){
            $("<div><a href='javascript:void(0)'>" + item + "</a></div>").appendTo(".songnames-container");
            //$("<div><a href='javascript:void(0)'>" + item + "</a></div>").appendTo(".songnames-container");
        });
        $(".songnames-container a").click(function(){self.SelectAction($(this))});
    };

    /**
     *
     * Näytä ikkuna sanojen katselemista varten (ja mobiilitilassa sulje muut ikkunat)
     *
     *
     */
    this.ToggleLyricsView = function(){
        LoadLyricsByTitle(self.active_launcher.text(),false);
        self.HideActionSelectors(true);
        //Piilota muut kuin laulun sanat, jos pienempi näyttö
        if(!$("nav .dropdown").is(":visible")) self.$container.hide();
        //Lisää sanannäyttödiviin luokka sen tunnistamiseksi, että kutsuttu laulujen nimi-näkymästä
        $(".sideroller").show();
    };

    /**
     * 
     * Avaa ikkuna ja valitse, mikä rooli laululle annetaan messussa.
     *
     */
    this.ToggleRoleSelect = function(){
        var $roleselector = $("<div class='songrole-select'></div>").css(self.GetActiveLauncherPosition()).prependTo($(".songname-select"));
        $(".data-left").each(function(){ $("<div>" + $(this).text() + "</div>").appendTo($roleselector).click(self.SetSongRole)});
    };
    
    /**
     * 
     * Aseta laululle rooli
     *
     */
    this.SetSongRole = function(){
        //Vaihda uusi laulu tekstikenttään
        $('.data-left:contains("' + $(this).text().trim() + '")').next().find("input").val(self.active_launcher.text());
        self.HideActionSelectors(true);
    };

}


/**
 *
 * Interaktio ja layout-muokkaus laululistasivulle.
 *
 */

$(document).ready (function(){
    if($("body").hasClass("songs")){
        $(".songinput").autocomplete(autocompsongtitle);
        $(".songinput, select").on("change paste keyup",CheckIfLyricsExist);
        //Tarkista jo syötetyistä lauluista, onko niitä tietokannassa
        $(".songinput, select").each(function(){CheckIfLyricsExist($(this),$(this).val())});
        $(".lyricsindicator").click(ShowLyricsWindow);
        $(".sideroller").hide();
        $(".menu").menu({position: { my: "bottom", at: "right-5 top+5" }});
        $("#editwordslink").click(EditLyrics);
        $("#closewordeditlink").click(CloseWordEdit);
        $(".multisongs [type='button']").click(AddMultisongsRow);
        //Tavuta laulutyypit soft-hypheneilla.
        $(".data-left").each(function(){ $(this).html($(this).html().replace(/([^ ])(laul)/,"$1&shy;$2").replace(/ (\d+)/,"&nbsp;$1"))});

        //Sanojen katseluikkuna
        var slv = new SongListView();
        $(".songlistview-toggle").click(function(){slv.Toggle()});
        $("#alpha-select li").click(function(){slv.LoadData($(this))});
    }
});

