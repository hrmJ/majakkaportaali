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

    /**
     * Hakee listan sisällöstä (esitysikkunan sisällön 
     * perusteella.)
     */
    this.GetContents = function(){
        this.headings = [];
        var self = this;
        this.pres.d.find("section").each(function(){
            var $firstslide = $(this).find("article:eq(0)");
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
                if($(this).hasClass("infocontent")){
                    //Jos kyseessä infodia, etsi kuvausta ja jos ei löydy, ota
                    //alimman tason otsikko. Jos ei sitäkään löydy, ota pala tekstiä.
                    if($(this).find("input[type='hidden']").length)
                        var identifier = $(this).find("input[type='hidden']").val();
                    else if ($(this).find("h3").text()!="")
                        var identifier = $(this).find("h3").text();
                    else
                        var identifier = $(this).find("div").text().substr(0, 10) + "...";
                }
                else{
                //Muuten ota ensimmäinen otsikkoelementti
                var identifier = $firstslide.find("h1, h2, h3, h4, h5").text();
                }
            }
            self.headings.push(identifier);
        })
        return this;
    };
    
    /**
     * Tulostaa (tai päivittää) listan sisällöistä navigointia varten
     */
    this.PrintContentList = function(){
        $("#original-content").html("");
        var $toc = $("<ul></ul>").prependTo("#original-content");
        var self = this;
        //Hae kaikki esityksessä olevat osiot ja tee niistä sisällysluettelo
        $.each(this.headings,function(idx, heading){
            $("<li draggable='true'></li>")
            .text(heading)
            .appendTo($toc)
            .attr({"id":"content_" + idx})
            .click(function(){self.MovePresentationToSection($(this));});
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
        if(this.pres.$section.hasClass("song") || this.pres.$section.hasClass("bibletext")) this.PrintVerses();
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
            var offset = this.pres.$section.hasClass("bibletext") ? 0 : 1;
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
                if(this.pres.$section.hasClass("song") || this.pres.$section.hasClass("bibletext")) this.PrintVerses();
                else $("#verselist").html("");
            }
        }
        //Säkeistöjen ym. korostaminen
        var $hlverse = $("#verselist .highlight:eq(0)");
        $hlverse.removeClass("highlight");
        console.log(this.pres.$slide);
        if(this.pres.$slide.attr("class").match("verse")){
            //Raamatunteksteillä: huomioi, että otsikko ekassa diassa
            var offset = this.pres.$slide.hasClass("bibleverse") ? 0 : 1;
            $("#verselist div:eq("+ (this.pres.$slide.index() - offset) +")").addClass("highlight");
        }
    };

    /**
     *
     * Tulosta säkeistöjen (tai esim. raamatunkohdan osien) lista, jos siirrytty seuraavaan / edeliseen lauluun  (/raamatunkohtaan)
     *
     */
    this.PrintVerses = function(){
        var self = this;
        $("#verselist").html("");
        //Raamatuntekstit: aloita jo ekasta diasta
        var verseslides = this.pres.$section.hasClass("bibletext") ? "" : ":gt(0)";
        this.pres.$section.find("article" + verseslides  + "").each(function(){
            var $editlink = $("<i class='fa fa-pencil'></i>").click(self.EditVerse.bind(self));
            $("<div></div>")
            .text($(this).text())
            .appendTo("#verselist")
            .click(function(){self.MovePresentationToVerse($(this));})
            .append($editlink) ;
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
     * Tallentaa säkeistöön tms. tehdyt muutokset näytettäväksi esityksessä
     *
     * @param ev tapahtuma
     *
     */
    this.SaveVerseEdit = function(ev){
        var $target = $(ev.target).parents("div:eq(0)"),
            text = $target.find("textarea").val(),
            html = "<p>" + text.replace(/\n/g,"<br>") + "</p>",
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
        console.log($target.index());

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
        $(".contentlist li:not(.drop-target)").on("dragstart",function(){ 
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
                for(i=0;i<Object.keys(segments_by_new_order).length;i++){
                    self.pres.d.find("main").append(segments_by_new_order[i]);
                }
                self.pres.Activate(self.pres.d.find(".current"));
                self.GetContents().PrintContentList().HighlightCurrentContents();
            });
    }


};


