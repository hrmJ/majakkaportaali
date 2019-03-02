var Slides = Slides || {};


/**
 *
 * Varsinaisen hallittavan diaesityksen käsittävä moduuli
 *
 */
Slides.Presentation = function(){

    var current_presentation = undefined;

    /**
     * Kontrolloi esitystä ja esitysikkunaa.
     *
     * @param object d Esitysikkunan DOM jquery-oliona
     * @param object dom Esitysikkunan DOM natiivi-js:nä
     * @param object $slide Tällä hetkellä aktiivisena oleva esityselementti (laulu, otsikko, raamatunteksti)
     * @param object $section Tällä hetkellä aktiivisena oleva dia
     * @param int service_id tunniste ulkopuolisena diojen lähteenä olevaan messuun
     * @param Array text_levels Mitä eri tekstitasoja esitykessä on käytössä (otsikot, leipäteksti yms.)
     * @param int looptime kuinka pitkään (ms) oletuksena näytetään luupattavaa diaa
     * @param integer loop_id luupattavan intervallin id, jota tarvitaan pysäyttämistä varten
     * @param boolean loop_is_on onko diojen luuppaus päällä
     * @param Array loopedslides taulukko luuppauksen kohteena olevista dioista
     * @param boolean  fade_is_on toteutetaanko diasiirtymä feidaten
     * @param boolean  initial_load_ready tallentaa teidon siitä, onko käyttöliittymä ladattu
     *
     */
    var Presentation = function(){
        this.d = undefined;
        this.dom = undefined;
        this.styles = undefined;
        this.$controller_window = $("main");
        this.fade_is_on = false;
        this.fadetime = 500;

        this.looptime = 7500;
        this.loop_is_on = false;
        this.loop_id = undefined;
        this.loopedslides = [];

        this.service_id = NaN;
        this.$section = $("");
        this.$slide = $("");
        this.text_levels = {"body":"kaikki",
            "h1":"1-otsikko","h2":"2-otsikko",
            "h3":"3-otsikko",
            "p":"leipäteksti",
            "ul":"lista",
            "img":"kuvat",
            "header":"ylätunniste",
            "aside":"sivutunniste",
        };

        this.initial_load_ready = false;

        self = this;


        /**
         * Avaa esityksen erilliseen ikkunaan (=esitysikkuna). Jos esitys jo auki, sulkee ikkunan.
         */
        this.ToggleOpen = function(){
            var abort = false;
            var wasclosed = false;
            $(".nav_below").toggle();
            if($("#launchlink").text()=="Sulje esitys"){
                this.view.close();
                $("#original-content").html("");
                $("#verselist").html("");
                $("#launchlink").text("Avaa esitys");
                wasclosed = true;
            }
            else {
                this.service_id = $("#service-select").val()*1;
                //JUST FOR TESTING purposes:
                //this.service_id = 2;
                if(!isNaN(this.service_id)){
                    this.view = window.open('content.html','_blank', 'toolbar=0,location=0,menubar=0');
                    $("#launchlink").text("Sulje esitys");
                }
                else{
                    alert("Valitse ensin näytettävä messu");
                    $(".nav_below").hide();
                    abort = true;
                }
            }
            if(!abort){
                //Vaihda sitä, näytetäänkö messunvalintadialogi vai esityksen ohjailu
                $(".preloader, .contentlist").toggle();
                //Piilota tai näytä tarpeen mukaan esityksen ohjaukseen liittyvät linkit
                $("#controllink, #addcontentlink, #layoutlink, #slide_type_link").parent().toggle();
                if(wasclosed){
                    //Piilota mahdollisesti aukijääneet sivumenut
                    $(".side-menu-left, .side-menu-right").hide();
                    $(".preloader").show();
                }
            }
        };


        /**
         *
         * Hakee esityksen sisällön, tyylit ja muun tarvittavan.  
         *
         */
        this.SetContent = function(){
            this.d = $(this.view.document).contents();
            this.dom = this.view.document;
            //Lataa sisältö ulkoisesta lähteestä
            return $.when(this.LoadSlides()).done( () => {
                    this.d = $(this.view.document).contents();
                    this.Activate(this.d.find(".current"));
                    ////Käy diat läpi ja poimi kaikki siellä esiintyvät luokat
                    this.LoadSlideClasses();
                    $.when(this.SetStyles()).done(() => this.LoadControlsAndContent());
                    // Varmista interaktio muokattavien messutietojen kanssa
                    if(!Slides.Controls.GetCurrentService().GetControlledByPresentation()){
                        Slides.Controls.GetCurrentService().SetControlledByPresentation(this);
                    }
                });
        };


        /**
         *
         * Hakee  esityksen sisällön tietokannasta
         *
         */
        this.LoadSlides = function(){
            var path = Utilities.GetAjaxPath("Loader.php");
            return $.get(path, {
                "service_id":this.service_id,
                "action": "load_slides_to_presentation"
                }, (html) => this.d.find("main").html(html));
        };
                    
        /**
         *
         * Päivittää esityksen tyylit tietokannasta
         *
         * TODO: default --> ?
         *
         */
        this.SetStyles = function(){
            var path = Utilities.GetAjaxPath("Loader.php");
            return $.get(path, 
                {
                    "action": "load_styles",
                    //"classes":this.classes,
                    "stylesheet":"default"
                }, (stylestring) => this.d.find("#updated_styles").html(stylestring));
        };


        /**
         *
         * Käy kaikki diat läpi ja talleta muistiin, mitä eri dialuokkia
         * on käytössä.
         *
         */
        this.LoadSlideClasses = function(){
            var self = this;
            this.classes = [];
            this.d.find("section").each(function(){
                var section_classes = $(this).attr("class").split(" ");
                //Lisää jälkimmäinen kahdesta section-elementin luokasta niiden
                //css-luokkien joukkoon, joita määrittävät tyylit ladataan.
                if(self.classes.indexOf(section_classes[1]) == -1){
                    //...vain, jos samaa luokkaa ei ole jo lisätty
                    self.classes.push(section_classes[1]);
                };
            });
            //Jätetty vain yhteensopivuuden vuoksi (TODO)
            self.segment_types = self.classes;
        
        };


        /**
         * Lataa hallintapainikkeet ja esityksen sisällön
         *
         */
        this.LoadControlsAndContent = function(){
            //Tähän styles-attribuuttiin on tallennettu esityksen alkuperäiset ja muokatut tyylit
            this.styles = new Slides.Styles.Controller.StyleController(this);
            this.styles.GetOriginalStyles();


            console.log("What????");
            if(!this.initial_load_ready){

                //Tähän controls-attribuuttiin on listattu kaikki 
                //sisältöä / ulkoasua tuottavat tai muokkaavat widgetit
                this.controls = {
                    contentlist: new Slides.ContentList(this),
                    textcontentadder: new Slides.Widgets.ContentAdders.TextContentAdder(this),
                    biblecontentadder: new Slides.Widgets.ContentAdders.BibleContentAdder(this),
                    songcontentadder: new Slides.Widgets.ContentAdders.SongContentAdder(this),
                    imageadder: new Slides.Widgets.ContentAdders.ImageAdder(this),
                    youtubeadder: new Slides.Widgets.ContentAdders.YoutubeAdder(this),
                }
                this.controls.biblecontentadder.Initialize();
                this.controls.imageadder.Initialize();

                //Lataa sisältö ja päivitä tieto tällä hetkellä aktiivisena olevasta segmentistä
                this.controls.contentlist.GetContents().PrintContentList().HighlightCurrentContents();
                var self = this;
                $("#songsearch").autocomplete(this.controls.songcontentadder.autocomp);
                $("#songsearch").on("change paste keyup",function(){self.controls.songcontentadder.CreateContent()});
                this.UpdateSegmentListForLayoutEditing();

                //Lisää vielä tyylienmuokkauswidgetit (nämä on lisättävä vasta segmenttilistan päivityksen jälkeen)

                this.controls.backgroundchanger = new Slides.Widgets.StyleWidgets.BackgroundChanger(this);
                this.controls.backgroundchanger.LoadLocalBackgrounds();
                this.controls.backgroundchanger.InitializeEvents();
        
                this.controls.fontchanger = new Slides.Widgets.StyleWidgets.FontChanger(this);
                this.controls.fontchanger.CreateFontControllers();
                Slides.Styles.Controller.UpdateControllers(this);

                this.controls.positionchanger = new Slides.Widgets.StyleWidgets.PositionChanger(this);
                this.controls.positionchanger.CreateControllers();

                this.controls.layoutloader = new Slides.Widgets.StyleWidgets.LayoutLoader(this);
                this.controls.layoutloader.UpdateStyleSheets();
                this.controls.layoutloader.InitializeEvents();


                this.SetControlActions();
                //Merkitse, että peruskäyttöliittymä ladattu, jottei päivitettäessä
                //sisältöä tehtäisi tätä uudestaan
            }
            else if (this.controls){
                if(this.controls.contentlist){
                    //Lataa  kuitenkin sulkemisen jälkeen sisältö
                    console.log("Heheeheheeyyyyy!!");
                    this.controls.contentlist.GetContents().PrintContentList().HighlightCurrentContents();
                }
            }

            // Lopuksi muita ladattavia plugineja
            Portal.PercentBar.InitializePercentBars(this.d);
            Portal.PercentBar.UpdateStyles();
            Portal.Credits.InitializeCredits(this.d);
            this.initial_load_ready = true;

        };

        /**
         *
         * Alustaa diojen hallintaan liittyvän toiminnallisuuden, kun sisältölista ladattu
         *
         */
        this.SetControlActions = function(){
            $("#infolooplink").click(this.ToggleInfoLoop.bind(this));
            $("#loop_settings_block")
                .slider({
                            min: 0,
                            max: 15000,
                            step: 500,
                            value: this.looptime,
                            slide: (ev, ui) => {
                                this.looptime = ui.value;
                                $(".nav_slider .indicator").text(" (" + ui.value/1000 + " s) ");
                                clearInterval(this.loop_id);
                                this.LoopSlides(".event_info_at_beginning");
                            }
                        });
            $("#anim_settings_block")
                .slider({
                            min: 0,
                            max: 10000,
                            step: 250,
                            value: this.fadetime,
                            slide: (ev, ui) => {
                                this.fadetime = ui.value;
                                $(".fade_slider .indicator").text(" (" + ui.value/1000 + " s) ");
                            }
                        });
            $("#bslink").click(this.ToggleBlackScreen.bind(this));
            $("#animatelink").click(this.ToggleFadeOn.bind(this));
            $("#nextlink").click(this.Next.bind(this));
            $("#prevlink").click(this.Prev.bind(this));
            $(".nav_slider, .fade_slider").hide();
        }

        /**
         *
         * Määrittää sen, tehdäänkö häivitystä siirryttäessä uuteen diaan
         *
         * @param ev klikkaustapahtuma
         *
         */
        this.ToggleFadeOn = function(ev){
            this.fade_is_on = this.fade_is_on ? false : true;
            $(ev.target).parent().toggleClass("bs_active");
            $(".fade_slider").toggle();
        }


        /**
         *
         * Peittää esitys näytön mustalla laatikolla
         *
         * @param ev klikkaustapahtuma
         *
         */
        this.ToggleBlackScreen = function(ev){
            var $bs = $("<div class='blankscreen'></div>");
            $bs.css({
                "width": "200%",
                "height": "200%",
                "position": "absolute",
                "z-index": "999999",
                "background": "#000000",
                "top": "-10px",
                "left": "-10px",
                "display": "none"
            });
            if(!this.d.find(".blankscreen").length){
                this.d.find("body").prepend($bs);
                $(ev.target).parent().addClass("bs_active");
                //Animointi
                if(!this.fade_is_on){
                    $bs.show();
                }
                else{
                    $bs.fadeIn(this.fadetime);
                }
            }
            else{
                //Animointi

                if(this.fade_is_on){
                    this.d.find(".blankscreen").fadeOut(this.fadetime, () => {
                        this.d.find(".blankscreen").remove();
                        $(ev.target).parent().removeClass("bs_active");
                    });
                }
                else{
                    this.d.find(".blankscreen").remove();
                    $(ev.target).parent().removeClass("bs_active");
                }
            }
        }


        /**
         *
         * Käynnistää infodiojen luuppauksen
         *
         * @param ev klikkaustapahtuma
         *
         */
        this.ToggleInfoLoop = function(ev){
            var current_text = $(ev.target).text(),
                new_text = (current_text == "Luuppaa infodioja" ?
                    "Lopeta luuppaus" : "Luuppaa infodioja");
            $(ev.target).text(new_text);
            $(".nav_slider").toggle();
            this.loop_is_on = (this.loop_is_on ? false : true);
            if (this.loop_is_on){
                this.LoopSlides(".event_info_at_beginning");
            }
            else{
                clearInterval(this.loop_id);
            }
        }

        /**
         *
         * Päivittää sisältölistauksen ulkoasupaneeliin, jotta ulkoasua voidaan säätää tarkemmin
         *
         */
        this.UpdateSegmentListForLayoutEditing = function(){
            var self = this;
            self.segment_types = [];
            //Tyhjennä ensin mahdollisesti jo olemassaoleva sisältö
            $("#layout-target_select").html("<option>Koko esitys</option>");
            var $types_group  = $("<optgroup>").attr({"label":"Aseta dialuokan mukaan"});
            $.each(this.classes,function(idx,thisclass){
                //Käy sitten läpi kaikki esityksestä löytyvät segmenttityypit ja lisää ne listaan
                $("<option>").text(thisclass).appendTo($types_group);
            });
            //Lisää lopuksi jokainen segmentti valittavaksi erikseen
            //var $segments_group  = $("<optgroup>").attr({"label":"Aseta segmenttikohtaisesti"})
            //$.each(this.controls.contentlist.headings,function(idx, heading){
            //    $("<option>").text(heading).appendTo($segments_group);
            //})
            //Lisää vielä valintatapahtuma ja muuta jquery-ui-menuksi
            $("#layout-target_select")
                .append($types_group)
                .on("change",function(){self.styles.SetEditTarget($(this))});
            $("#layout-target_select").selectmenu();
            $("#layout-target_select").selectmenu("refresh");
        };

        /**
         * Määrittele tällä hetkellä aktiivisena oleva sisältö.
         * Diojen näkyminen tai piilossa oleminen on toteutettu simppelisti ja
         * on lopulta css-tason kysymys.
         * Kaikki article-elementit (jokainen <article> on aina yksi "näytöllinen")
         * ovat lähtökohtaisesti piilotettuja *paitsi* jos niissä on css-luokka current.
         *
         * @param object $target se esityksen dia, joka on (tai josta tulee) aktiivinen
         *
         */
        this.Activate = function($target){
            //Piilota lähtökohtaisesti kaikki segmentit (ja poista piilotus erikseen nyt aktiivisesta)
            this.d.find("section, article").hide();
            this.$slide.removeClass("current");
            this.$slide = $target.addClass("current");
            this.$section = this.$slide.parent();
            this.$section.show();
            this.AdjustLayout();
            //Hieman häkkäilyn makua, mutta display-attribuutti jäi jostain syystä block-arvoon, vaikka
            //jqueryn hide-metodin pitäisi säilyttää alkuperäiset arvot. Tämän vuoksi määritellään erikseen
            //display: flex;
            if(!this.fade_is_on){
                this.$slide.show();
            }
            else{
                this.$slide.fadeIn(this.fadetime);
            }
            this.$slide.css({"display":"flex"});
            //Quick, hacky fix for credit lists
            if(!this.$slide.find(".credits_list").length) {
                this.FixOverFlow();
            }
        };


        /**
         *
         * Nollaa nykyisen dian kohdalta tehdyt fonttien koon automaattiset korjaukset.
         *
         */
        this.ResetOverflowCorrectionInSlide = function(){
        }


        /**
         *
         * Varmista, että sisältö mahtuu ruudulle
         *
         */
        this.FixOverFlow = function(){
        
                //Varmista, että kaikki leipäteksti mahtuu ruudulle
                var fixer = (idx, el)=>{
                    var $el = $(el),
                        height_needed = $el.get(0).scrollHeight,
                        height_available = $el.innerHeight(),
                        i = 0,
                        oldsize = undefined;
                    while(height_available < height_needed ){
                        oldsize = $(el).css("font-size");
                        $el.css({"font-size": (oldsize.replace("px","")*1-2) + "px"});
                        height_needed = $el.get(0).scrollHeight;
                        height_available = $el.innerHeight();
                        i++;
                        if(i>20){
                            break;
                        }
                    }
                };
                this.$slide.find("p").each(fixer);
                this.$slide.find("h1,h2,h3,h4").each(fixer);
        };

        /**
         *
         * Viimeistele näytettävän dian ulkoasu esimerkiksi säätämällä
         * ylätunnisteen marginaali ja piilottamalla tyhjät elementit.
         *
         */
        this.AdjustLayout = function(){
            //Varmista, että tyhjät elementit eivät vie tilaa esityksen kankaalta:
            this.d.find("div,h1,h2,h3,h4,p").each(function(){
                if(
                    $(this).text().trim()=="" && 
                    !$(this).find("img,iframe").length && 
                    !$(this).hasClass("percent_bar") &&
                    !$(this).hasClass("denominator") &&
                    !$(this).hasClass("numerator") &&
                    !$(this).find(".credits_list").length &&
                    !$(this).hasClass("blankscreen")
                ){
                    $(this).hide();
                } 
            });
            //Hack to preserve credit lists inside p tags
            this.d.find(".credits_list").each(function(){
                if(!$(this).parents("p").length){
                    $(this).wrap("<p></p>");
                }
            });
            //
            var $header = this.$section.find("header");
            if($header.length){ 
                //Muokkaa sisällön marginaalia ylhäältä kattamaan ylätunniste ja lisä vielä 5px väliä
                this.$section.find("article").css({"margin-top":
                    $header.css("height").replace("px","")*1 + 5 + "px"});
            }
            var $aside = this.$section.find("aside");
            if($aside.length){ 
                //Muokkaa sisällön marginaalia ylhäältä kattamaan sivutunniste ja lisä' vielä 5px väliä
                this.$section.find("article").css({"margin-left":
                    $aside.css("width").replace("px","")*1 + 5 + "px"});
            }

        };

        /**
         *
         * Siirtyy seuraavaan diaan
         *
         */
        this.Next = function(){ 
            this.Move("next"); 
        };


        /**
         *
         * Siirtyy edelliseen diaan
         *
         */
        this.Prev = function(){ 
            this.Move("prev"); 
        };


        /**
         *
         * Suorittaa Next- tai Prev-metodeilla määritellyn siirtymisen
         * @param where string Suunta, johon liikutaan (prev/next)
         *
         */
        this.Move = function(where){
            this.Activate(this.d.find(".current"));
            //1. Liiku sisarelementtiin eli esimerkiksi saman laulun seuraavaan säkeistöön
            var $target = this.$slide[where]("article");
            //Jos viimeinen sisarelementti, siirry uuden laulun (tai otsikon tms.)
            //ensimmäiseen lapsielementtiin, jos taas ensimmäinen, siirry edellisen viimeiseen
            var first_or_last = where=="prev" ? "last-of-type" : "first-of-type";
            if($target.length==0) $target = this.$section[where]().find("article:" + first_or_last); 
            if($target.length>0){
                this.Activate($target);
                this.controls.contentlist.HighlightCurrentContents();
            } 
        };

        /**
         *
         * Toistaa tiettyjä dioja  vaihtamalla automaattisesti seuraavaan
         *
         * TODO: ota huomioon useasta diasta koostuvat, esim laulut
         *
         * @param byclass jos luuppaus tehdään css-luokan perusteella
         * @param byno jos luuppaus tehdään css-luokan perusteella
         *
         */
        this.LoopSlides = function(byclass, byno){
            var active_idx = undefined,
                $target = undefined;

            this.loop_id = setInterval(() => {
                if(byclass){
                    var sections = this.d.find("section" + byclass);
                    $.each(sections,(idx, t) => {
                        if($(t).html() == this.$section.html()){
                            active_idx = idx;
                        }
                    });
                    if(active_idx !== undefined && (active_idx +1) < sections.length){
                        //Jos jäljellä luupattavien listassa dioja, siirry seuraavaan
                        $target = $($(sections[active_idx+1]).find("article:eq(0)"));
                    }
                    else{
                        // Muussa tapauksessa aloita alusta
                        $target = $($(sections[0]).find("article:eq(0)"));
                    }
                    this.Activate($target);
                    this.controls.contentlist.HighlightCurrentContents();
                }
            }, this.looptime);
        };


        /**
         *
         * Päivittää esityksen sisällön esimerkiksi sen jälkeen, kun näytettävän messun tietoja
         * tai rakennetta muutettu
         *
         */
        this.Update = function(){
            var pres_position = {
                sec_idx : this.$section.index(),
                slide_idx: this.$slide.index()
            };
            return $.when(this.SetContent()).done(()=>{
                var new_msg = new Utilities.Message("Diaesitys päivitetty", this.$controller_window),
                    $sec = undefined,
                    $slide = undefined;
                if(this.d.find("section").length >= pres_position.sec_idx){
                    $sec = this.d.find("section:eq(" + pres_position.sec_idx + ")");
                    if($sec.find("arcticle").length >= pres_position.slide_idx){
                        $slide = $sec.find("article:eq(" + pres_position.slide_idx + ")");
                        if($slide.length){
                            this.Activate($slide);
                        }
                        else{
                            this.Activate($sec.find("article:eq(0)"));
                        }
                    }
                }
                new_msg.Show(2000);
                this.controls.contentlist.GetContents().PrintContentList().HighlightCurrentContents();
                //this.Activate(pres_position);
            });
        
        }

    };


    /**
     *
     * Hallitsee näppäinpainalluksia ohjainikkunassa ja esitysikkunassa
     * esityksen liikuttamiseksi
     *
     */
    function KeyHandler(e) {

        e = e || window.event;

        switch(e.keyCode){
            case 37:
                //nuoli ylös
            case 38:
                //nuoli vasemmalle
                Slides.Presentation.GetCurrentPresentation().Prev();
                break;
            case 39:
                //nuoli alas
            case 40:
                //nuoli oikealle
                Slides.Presentation.GetCurrentPresentation().Next();
                break;
        } 

    };

    /**
     *
     * Palauttaa esitysolion
     *
     */
    function GetCurrentPresentation(){
        return current_presentation;
    }

    /**
     *
     * Käynnistää esityksen
     *
     */
    function Initialize(){
        current_presentation = current_presentation || new Presentation();
        current_presentation.ToggleOpen();
    }

    /**
     * 
     * Asettaa käyttöliittymälle tumman tai vaalean ulkoasun
     *
     */
    function ToggleDarkMode(){
        console.log("toggling dm")
        $("body").toggleClass("darkmode");
    }




    return {
    
        Initialize,
        GetCurrentPresentation,
        KeyHandler,
        ToggleDarkMode
    
    }

}();

    
