//Yleisluontoisia apufunktioita
//
var Utilities = function(){

    var ajax_path = "php/ajax";

    /**
     *
     * Asettaa oikean polun ajax-skriptien kansioon
     *
     * @param path uusi polku, huom, ei saa loppua /-merkkiin
     *
     */
    function SetAjaxPath(path){
        if (path.substr(-1) == "/"){
            path = path.substr(0, path.length-1);
        }

        ajax_path = path;
    
    }

    /**
     *
     * Hakee oikean polun ajax-skriptien kansioon
     *
     * @param fname mikä tiedosto kansiosta haetaan
     *
     */
    function GetAjaxPath(fname){
        fname = (fname ? "/" + fname : "");
        return ajax_path + "/" + fname;
    }


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
     * Luo esikatselukuvan esimerkiksi taustakuvalle tai muulle ulkoasussa muokatttavalle elementille.
     *
     * @param object $div elementti, jonka sisällä esikatselu toteutetaan
     * @param string  filename, tarkasteltavan elementin tiedostonimi
     *
     */
    function Preview($div, filename){
        if( filename.indexOf("Ei kuvaa") > -1 ){ 
            $div.find(".preview img").remove();
        }
        else{
            $("<img>").attr({"src":"assets/" + filename,
                "height":"100%",
                "width":"100%",
                "object-fit":"contain",
            }).appendTo($div.find(".preview").html(""));
        }
    }


    /**
     *
     * Olio lyhyiden viestien näyttämiseen hallintanäytöllä.
     *
     * @param msg näytettävä viesti
     * @param $parent_el jquery-elementti, jonka sisään viesti syötetään
     *
     */
    var Message = function(msg, $parent_el){
        console.log("new message created");
        this.$box = $("<div></div>").text(msg).attr({"class":"msgbox"});
        this.$parent_el = $parent_el || $("body");
    }

    Message.prototype = {
        background: "",
        color: "",

        /**
         * Näyttää viestilaatikon viesti käyttäjälle
         *
         * @param offtime millisekunteina se, kuinka kauan viesti näkyy (oletus 2 s)
         *
         */
        Show: function(offtime){
            var self = this;
            this.$parent_el.css({"position":"relative"});
            this.$box.appendTo(this.$parent_el).fadeIn("slow");
            if(offtime){
                setTimeout(function(){ self.Destroy(); },offtime);
            }
            this.$box.draggable();

            return this;
            //BlurContent(self.box);
        },

        /**
         *  Adds a title to the message 
         *
         *  @param text the text of the title.
         *
         */
        SetTitle: function(text){
            this.$box.find("h3").remove();
            this.$box.prepend($(`<h3>${text}</h3>`));
            return this;
        },


        /**
         *  Adds a footer to the message 
         *
         *  @param text the text of the footer.
         *
         */
        SetFooter: function(text){
            this.$box.find("footer").remove();
            this.$box.append($(`<footer>${text}</footer>`));
            return this;
        },

        
        /**
         *  Adds an "OK" button to the box
         *
         */
        AddOkButton: function(){
            $("<button class='okbutton'>OK</button>")
                .click(this.Destroy.bind(this))
                .appendTo(this.$box);
            return this;
        },

        /**
         *  Adds new text to the box
         *
         */
        Add: function(newtext){
            if(!this.$box.find("ul").length){
                var oldtext = this.$box.text();
                $("<ul></ul>").appendTo(this.$box.html(""));
                if(oldtext){
                    this.$box.find("ul").append(`<li>${oldtext}</li>`);
                }
            }
            this.$box.find("ul").append(`<li>${newtext}</li>`);
            return this;
        },

        /**
         *  Adds a close button 
         */
        AddCloseButton: function(){
            var $a = $("<a class='boxclose'></a>").click(this.Destroy.bind(this));
            this.$box.prepend($a);
            return this;
        },

        /**
         *  Adds an id , e.g. to prevent duplicates
         *  @param id  the id to be added
         */
        AddId: function(id){
            this.$box.attr({"id": id});
            return this;
        },

        /**
         *  Clears the text in the message box
         *
         */
        Clear: function(){
            this.$box.html("");
            return this;
        },

        /**
         *
         *  Changes the text of the last item of the message
         *
         *  @param text what to display
         *
         */
        Update: function(text){
            if(this.$box.find("ul").length){
                this.$box.find("li:last-of-type").text(text);
            }
            else{
                this.$box.text(text);
            }
            return this;
        },

        Destroy: function(){
            this.$box.html("").remove();
        }
    }

    return {

        Message,
        BlurContent,
        ScrollToCenter,
        SetAjaxPath,
        GetAjaxPath
    
    }

}();

