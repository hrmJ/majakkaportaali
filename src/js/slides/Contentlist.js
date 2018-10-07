Slides = Slides || {};

/**
 *
 * Esityksen sisällysluettelo, jota klikkaamalla pääsee
 * liikkumaan eri sisältökohteiden välillä.
 *
 * @param Presentation parent_presentation Esitys, johon widgetit liitetään.
 *
 */
Slides.ContentList = function(parent_presentation){

    this.pres = parent_presentation;
    this.info_classname = "event_info_at_beginning";
    var currently_dragged_no = undefined;

    /**
     * Hakee listan sisällöstä (esitysikkunan sisällön 
     * perusteella.)
     */
    this.GetContents = function(){
        var self = this,
            headingselector = "h1, h2, h3, h4, h5";
        this.headings = [];
        this.pres.d.find("section").each(function(){
            var $firstslide = $(this).find("article:eq(0)"),
                isinfo = false;
            if($(this).hasClass(self.info_classname)){
                isinfo = true;
            }
            if($(this).hasClass("addedcontent")){
                //Jos kyseessä spontaanisti lisätty sisältö, luo kuvaava selitysteksti
                var prefix = "";
                switch($firstslide.attr("class").split(" ")[0]){
                    case "added-text":
                        prefix = "Lisätty teksti: ";
                        break;
                }
                var identifier = prefix + $firstslide.text().substr(0,10) + "...";
            }
            else{
                if($(this).find("input[type='hidden']").length){
                    //Etsi ensin input-elementtiä, jossa olisi dian nimi
                    var identifier = $(this).find("input[type='hidden']").val();
                }
                else if(!$(this).find(headingselector).text()){
                    //..ota dian tekstin alku, jos ei ole otsikkoakaan
                    var identifier = $(this).find("div").text().substr(0, 10) + "...";
                }
                else{
                    //Muuten ota ensimmäinen otsikkoelementti
                    var identifier = $firstslide.find(headingselector).text();
                }
            }
            self.headings.push({"isinfo": isinfo, "identifier":identifier});
        })
        return this;
    };
    
    /**
     * Tulostaa (tai päivittää) listan sisällöistä navigointia varten
     */
    this.PrintContentList = function(){
        $("#original-content").html("");
        var $toc = $("<ul></ul>").prependTo("#original-content"),
            self = this,
            number_of_infos = this.pres.d.find("section." + self.info_classname).length,
            $li = undefined;
        //Hae kaikki esityksessä olevat osiot ja tee niistä sisällysluettelo
        $.each(this.headings,function(idx, heading){
            $li = $("<li draggable='true'></li>")
            .text(heading.identifier)
            .appendTo($toc)
            .attr({"id":"content_" + idx})
            .click(function(){self.MovePresentationToSection($(this));});
            if(heading.isinfo){
                $li.addClass("info");
            }
        });
        //Lisää raahaamisjärjestelyä varten sisällysluettelon li-elementtien väliin tyhjät li-elementit
        $("<li class='drop-target'>").insertBefore("#original-content li");
        $("<li class='drop-target'>").appendTo($toc);
        this.DragAndDropContent();
        return this;
    };

    /**
     * Liikuta esitystä käyttäjän haluamaan osioon
     *
     * @param object launcher li-elementti (jqueryolio), jota klikkaamalla liikkuminen käynnistettiin
     *
     */
    this.MovePresentationToSection = function(launcher){
        //Tyhjennä vanhat esikatselusäkeistöt
        $("#verselist").html("");
        //Etsi esityksestä sisällysluettelon id-attribuutin numeron mukainen section-elementti ja siirry sen ensinmmäiseen osioon
        this.pres.Activate(this.pres.d.find("section:eq(" + launcher.attr("id").replace("content_","") + ") article:eq(0)"));
        var self = this;

        if(this.pres.$section.hasClass("song") || 
            this.pres.$section.hasClass("bibletext") ||
            this.pres.$section.hasClass("ltext")) {
            this.PrintVerses();
        }
        this.HighlightCurrentContents();
    };

    /**
     * Liikuta esitystä käyttäjän haluamaan säkeistöön
     *
     * @param object launcher li-elementti (jqueryolio), jota klikkaamalla liikkuminen käynnistettiin
     *
     */
    this.MovePresentationToVerse = function(launcher){
        if(!launcher.find("textarea").length){
            //Etsi esityksestä sisällysluettelon id-attribuutin numeron mukainen section-elementti ja siirry sen ensinmmäiseen osioon
            var offset = 1;
            if(this.pres.$section.hasClass("bibletext") ||
                this.pres.$section.hasClass("ltext")){
                offset = 0;
            }
            this.pres.Activate(this.pres.d.find(".current")
                .removeClass("current")
                .parent().find("article:eq("+ (launcher.index() + offset) +")")
                .addClass("current"));
            this.HighlightCurrentContents();
        }
    };

    /**
     *
     * Korosta sisältölistasta esitysikkunassa aktiivisena oleva sisältö.
     *
     */
    this.HighlightCurrentContents = function(){
        //Etsitään ennen siirtymistä aktiivisena ollut segmentti
        var hlindex= NaN;
        var $hlsection = undefined;
        $("#original-content li:not(drop-target)").each(function(idx,li){ 
            if($(this).hasClass("highlight")){
                hlindex == idx; 
                $hlsection = $(li);
            }
        });
        if(hlindex!=this.pres.$section.index() || isNaN(hlindex)){
            //Jos siirrytty seuraavaan esityselementtiin  ta
            if($hlsection) $hlsection.removeClass("highlight");
            $("#original-content li:not(.drop-target):eq("+this.pres.$section.index()+")").addClass("highlight");
            if(hlindex!=this.pres.$section.index()){
                if(this.pres.$section.hasClass("song") ||
                    this.pres.$section.hasClass("bibletext") ||
                    this.pres.$section.hasClass("ltext")){

                     this.PrintVerses();
                }
                else $("#verselist").html("");
            }
            //Skrollaa keskellä scrollTo-pluginilla
            $("#original-content").scrollTo(".highlight",100, {offset:-$("#original-content").height()/2});
        }
        //Säkeistöjen ym. korostaminen
        var $hlverse = $("#verselist .highlight:eq(0)");
        $hlverse.removeClass("highlight");
        if(this.pres.$slide.attr("class").match("verse")){
            //Raamatunteksteillä + liturgisilla: huomioi, että otsikko ekassa diassa
            var offset = 1;
            if(this.pres.$section.hasClass("bibletext") ||
                this.pres.$section.hasClass("ltext")){
                offset = 0;
            }
            console.log(offset);
            $("#verselist div:eq("+ (this.pres.$slide.index() - offset) +")").addClass("highlight");
            $("#verselist").scrollTo(".highlight",100, {"offset":-$("#verselist").height()/2});
        }
    };

    /**
     *
     * Tulosta säkeistöjen (tai esim. raamatunkohdan osien) lista, jos siirrytty seuraavaan / edeliseen lauluun  (/raamatunkohtaan)
     *
     */
    this.PrintVerses = function(){
        var self = this,
            verseslides = ":gt(0)";
        if(this.pres.$section.hasClass("bibletext") || 
            this.pres.$section.hasClass("ltext")){
            //Raamatuntekstit ja liturgiset tekstit: aloita jo ekasta diasta

            verseslides = "";
        }
        $("#verselist").html("");
        this.pres.$section.find("article" + verseslides  + "").each(function(){
            var $editlink = $("<i class='fa fa-pencil'></i>").click(self.EditVerse.bind(self)),
                $removelink = $("<i class='fa fa-trash'></i>").click(self.RemoveVerse.bind(self));
            $("<div></div>")
            .html($(this).text().replace(/\n+/g,"<br>\n"))
            .appendTo("#verselist")
            .click(function(){self.MovePresentationToVerse($(this));})
            .append($editlink) 
            .append($removelink);
        });
    };

    /**
     *
     * Muokkaa (väliaikaisesti) säkeistöä ja sitä, miltä se näyttää esitysnäytöllä
     * TODO tallenna muutokset tietokantaan, jos niin halutaan
     *
     * @param ev tapahtuma
     *
     */
    this.EditVerse = function(ev){
        var $target = $(ev.target).parents("div:eq(0)"),
            text = $target.text().trim(),
            $button = $("<button>Tallenna</button>").click(this.SaveVerseEdit.bind(this));
        ev.stopPropagation();
        $target.html("")
            .append(`<textarea>${text}</textarea>`)
            .append($button);
    }

    /**
     *
     * Poista (väliaikaisesti) säkeistö esitysruudulta ja hallintaruudulta
     * TODO tallenna muutokset tietokantaan, jos niin halutaan
     *
     * @param ev tapahtuma
     *
     */
    this.RemoveVerse = function(ev){
        var $target = $(ev.target).parents("div:eq(0)"),
            verseindex = $target.index();

        ev.stopPropagation();

        if("laulu" == "laulu"){
            //TODO GetVerseIndex-funktio tms.
            verseindex += 1;
        }

        Slides.Presentation.GetCurrentPresentation()
            .$section.find("article:eq(" + verseindex + ")").remove();
        $target.remove();
    }

    /**
     *
     * Tallentaa säkeistöön tms. tehdyt muutokset näytettäväksi esityksessä
     *
     * @param ev tapahtuma
     *
     */
    this.SaveVerseEdit = function(ev){
        var $target = $(ev.target).parents("div:eq(0)"),
            text = $target.find("textarea").val().replace(/\n/g,"<br>\n"),
            html = "<p>" + text + "</p>",
            $editlink = $("<i class='fa fa-pencil'></i>").click(this.EditVerse.bind(this)),
            verseindex = $target.index();

        ev.stopPropagation();

        if("laulu" == "laulu"){
            //TODO
            verseindex += 1;
        }

        Slides.Presentation.GetCurrentPresentation()
            .$section.find("article:eq(" + verseindex + ")").html(html)
        $target.html(text).append($editlink);

    };

    /**
     *
     * Mahdollistaa sen, että esityksen sisältöä voidaan järjestellä
     * uudelleen drag and drop -tyylillä.
     *
     */
    this.DragAndDropContent = function (){
        var self = this;
        //Luodaan mahdollisuus muuttaa järjestystä raahaamalla
        $(".contentlist li:not(.drop-target)").on("dragstart",function(event){ 
            //FireFox tarvitsee seuraavan, jotta dd toimisi:
            event.originalEvent.dataTransfer.setData('text/plain', 'anything');
            $(".contentlist li").addClass("drop-hide");
            //currently_dragged_no = $(this).find(".slot-number").text() * 1;
            $(this).removeClass("drop-hide");
            $(this).addClass("drag-highlight");
            currently_dragged_no = $(this).attr("id").replace("content_","")*1;
        });
        $(".drop-target")
            .on("dragover",function(event){
                event.preventDefault();  
                event.stopPropagation();
                $(this).addClass("drop-highlight").text("<-- Siirrä tähän");
            })
            .on("dragleave",function(event){
                event.preventDefault();  
                event.stopPropagation();
                $(this).text("").removeClass("drop-highlight");
            })
            .on("drop",function(event){
                event.preventDefault();  
                event.stopPropagation();
                //Tallennetaan muistiin pudotusvälin yläpuolisen segmentin numero
                try{
                    var prevno = $(this).prev().attr("id").replace("content_","")*1;
                }
                catch(e){
                    prevno = -1;
                }
                var segments_by_new_order = {};
                console.log("PREVNO: " + prevno);
                $("#original-content li:not(.drop-target)").each(function(){
                    //Lasketaan jokaisesta sisällysluettelon osasta, mikä on sen siirron jälkeinen numero
                    var thisno = $(this).attr("id").replace("content_","")*1;
                    var newno = thisno;
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
                    //Kopioi sisällöt esityksestä uuden järjestyksen mukaisesti olioon
                    segments_by_new_order[newno] = self.pres.d.find("section:eq(" + thisno +")").clone(true);
                    });
                //Tyhjennä vanha sisältö
                self.pres.d.find("main").html("");
                //Lataa vanha sisältö uudelleen uudessa järjestyksessä
                for(var i=0;i<Object.keys(segments_by_new_order).length;i++){
                    self.pres.d.find("main").append(segments_by_new_order[i]);
                }
                self.pres.Activate(self.pres.d.find(".current"));
                self.GetContents().PrintContentList().HighlightCurrentContents();
            });
    }


};


