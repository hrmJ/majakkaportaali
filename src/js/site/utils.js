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
 *
 */
function BlurContent(){
    $(".blurcover").remove();
    $("<div class='blurcover'></div>").css({height:$("body").height(),width:$("body").width()}).prependTo($("body"));
}
