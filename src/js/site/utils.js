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
    this.$box = $("<div></div>").text(msg).attr({"class":"msgbox"});
    this.$parent_el = $parent_el || $("body");
    return this;
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
        var offtime = offtime || 2000;
        this.$parent_el.css({"position":"relative"});
        this.$box.appendTo(this.$parent_el).fadeIn("slow");
        setTimeout(function(){
            self.$parent_el.find(".msgbox").fadeOut("slow",function(){
                self.$parent_el.find(".msgbox").remove();
            });
        },offtime)
        
        //BlurContent(self.box);
    },
}

