var Slides = Slides || {};

/**
 *
 *
 * Moduuli, joka vastaa sisällön lataamisesta.
 *
 *
 */
Slides.ContentLoader = (function () {
  /**
   *
   * Lisää kaikki kauden messut select-elementtiin, josta käyttäjä voi
   * valita haluamansa päivän messun.
   *
   * @param services ajax-vastauksena saatu messujen lista muodossa [{"servicedate":xxx,"teme":...}]
   *
   */
  function AddServicesToSelect(services, pickedId) {
    var serviceIdMatch = document.location.search.match(/service_id=(\d+)/);
    var pickedId = null;
    if (serviceIdMatch && serviceIdMatch.length > 1) {
      var pickedId = serviceIdMatch[1] * 1;
    }
    var $sel = $("#service-select");
    $sel.find("option:gt(0)").remove();
    $sel.append(
      services.map(
        (service) =>
          `<option value='${service.id}' ${
            pickedId && pickedId == service.id ? "selected" : ""
          }>${service.servicedate} </option>`
      )
    );
    if (pickedId) {
      $sel.val(pickedId);
      $sel.selectmenu("refresh");
			Slides.Controls.ShowServiceInPortal(pickedId);
			Slides.Presentation.SetServiceId(pickedId);
    }
  }

  /**
   * Lataa näkyville listan messun lauluista
   *
   * @param int id sen messun id, jonka tietoja noudetaan.
   *
   */
  function LoadSongs(id) {
    $.getJSON("php/loadservices.php", { fetch: "songs", id: id }, function (
      data
    ) {
      var $songs = $("<div></div>");
      $.each(data, function (idx, songtitle) {
        $("<div class='flexrow'><div>" + songtitle + "</div></div>").appendTo(
          $songs
        );
      });
      $("#songdata").html("<h3>Laulut</h3>").append($songs);
    });
  }

  return {
    AddServicesToSelect,
  };
})();
