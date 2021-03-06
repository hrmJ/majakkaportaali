var Slides = Slides || {};

/**
 *
 * Diaesityksen hallinta, ohjaus ja elementit
 *
 */
Slides.Controls = (function () {
  var current_service = undefined;

  /**
   *
   * Lisää toiminnot oikean puolen (tyylien) hallintaelementteihin
   *
   */
  function AddRightControlsFunctionality() {
    //Sellaiset tyylisäätimet, joissa on vaihtoehtona joko säädeltävä arvo tai automaattinen arvo
    $(".control-toggler").parent().next("div").hide();
    $(".control-toggler").click(function () {
      $(this).parent().next("div").slideToggle();
      $(this)
        .parent()
        .next("div")
        .find("section")
        .toggleClass("controller-not-in-use");
      if (
        !$(this)
          .parent()
          .next("div")
          .find("section")
          .hasClass("controller-not-in-usel")
      ) {
        Slides.Styles.Controller.UpdateControllers(
          Slides.Presentation.GetCurrentPresentation()
        );
      }
    });

    //Muuta fonttimuokkausten kohdetta, kun tätä säätelevää pudotusvalikkoa käytetään
    $("#layout-target_select").on("selectmenuchange", () =>
      Slides.Styles.Controller.UpdateControllers(
        Slides.Presentation.GetCurrentPresentation()
      )
    );

    //TODO: anna spectrum-funktion argumenttina palette-niminen taulukoiden taulukko, jossa on käytössä olevat värit
    //align-items:center;
  }

  /**
   *
   * Lisää toiminnot vasemman puolen hallintaelementteihin
   *
   */
  function AddLeftControlsFunctionality() {
    $(".contentadder-heading").click(function () {
      //Avaa haluttu sisällönlisäysikkuna
      Slides.Presentation.GetCurrentPresentation().controls[
        $(this).parent().attr("class").split(" ")[1]
      ].OpenWidget($(this));
    });

    //Lisää widgettien lisäyslinkit kaikkiin vasemman valikon widgetteihin kerralla
    $(".side-menu-left .contentadder-open")
      .append(`<div class='addtoprescontrols'>
                    <a class='addtopreslink' href='javascript:void(0)'>Lisää esitykseen</a> 
                    <!--<a class='shownowlink' href='javascript:void(0)'> Näytä nyt</a> --></div>`);
    //Huolehdi siitä, että navigointipalkin linkkien klikkaus aktivoi oikeanpuolimmaisen menun
    $(".addtopreslink").click(function () {
      //avaa haluttu sisällönlisäysikkuna
      Slides.Presentation.GetCurrentPresentation().controls[
        $(this).parents(".contentadder").attr("class").split(" ")[1]
      ].AddToPres();
    });
    $(".contentadder-open").hide();
    //Piilota menut ja linkit joita ei vielä käytetä
    $("#controllink, #addcontentlink, #layoutlink").parent().hide();
    //Jos esitys käynnissä, luo mahdollisuus vaihtaa esityksen hallinnan ja sisällön lisäyksen välillä
    $("#controllink").click(function () {
      $(".preloader, .contentlist").toggle();
      if ($(this).text() == "Valitse sisältö")
        $(this).text("Hallitse esitystä");
      else $(this).text("Valitse sisältö");
    });
  }

  /**
   *
   *
   * Näyttää suoraan valitun messun portaalinäkymässä
   *
   */
  function ShowServiceInPortal(id) {
    //var iframe = document.getElementById("service-data-iframe");
    var id = id || $(this).val();
    $("#service-data-iframe").on("load", function () {
      this.contentWindow.Portal.Service.SetServiceId(id);
      //this.contentWindow.Portal.Service.Initialize();
      this.contentWindow.Portal.Service.SetControlledByPresentation(
        Slides.Presentation.GetCurrentPresentation()
      );
      this.contentWindow.Utilities.HideUpperMenu();
      current_service = this.contentWindow.Portal.Service;
    });
    $("#service-data-iframe").attr(
      "src",
      "../service.php?service_id=" + id + "&tab=Details"
    );
  }

  /**
   *
   * Alustaa yleiset esitykseen liittyvät toiminnot
   *
   */
  function AddGeneralFunctionality() {
    $("#service-select").selectmenu();
    $("#service-select").on("selectmenuchange", ShowServiceInPortal);
    $(".side-menu-left, .side-menu-right, .nav_below").hide();
    $(".addlink").click(OpenMenu);
    $("#launchlink").click(Slides.Presentation.Initialize);
    $("#darkmodelink").click(Slides.Presentation.ToggleDarkMode);
    var serviceIdMatch = document.location.search.match(/service_id=(\d+)/);
    if (serviceIdMatch && serviceIdMatch.length > 1) {
      var serviceId = serviceIdMatch[1];
      if (serviceId) {
				//$('#service-select').val(serviceId);
        //$('#service-select').selectmenu("refresh");
				console.log('aaal', serviceId);
				//ShowServiceInPortal();
      }
    }
  }

  /**
   *
   * Avaa vasemman taai oikean päämenun
   *
   */
  function OpenMenu() {
    $(".nav_below").toggle();
    if ($(this).parents("ul").hasClass("leftmenu")) {
      $(".side-menu-left").toggle();
    } else {
      $(".side-menu-right").toggle();
    }
    $(this).parent().toggleClass("active-menutab");
  }

  /**
   *
   * Hakee käytettäväksi aktiivisen messun yksityiskohdat Portal.Service-oliona
   *
   */
  function GetCurrentService() {
    return current_service;
  }

  /**
   *
   * Alustaa hallintaelementit käyttöön
   *
   *
   */
  function Initialize() {
    AddLeftControlsFunctionality();
    AddRightControlsFunctionality();
    AddGeneralFunctionality();
  }

  return {
    Initialize,
    GetCurrentService,
		ShowServiceInPortal
  };
})();
