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

