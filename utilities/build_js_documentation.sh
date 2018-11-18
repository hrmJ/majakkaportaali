#!/bin/bash
# Launch at the project root

# Content

documentation build src/js/portal/content/Service.js --format html -o docs/js/portal/content/service
documentation build src/js/portal/content/Servicelist.js --format html -o docs/js/portal/content/servicelist
documentation build src/js/portal/content/ManageableLists.js --format html -o docs/js/portal/content/manageablelists
documentation build src/js/portal/content/Comments.js --format html -o docs/js/portal/content/comments
documentation build src/js/portal/content/AdditionalInfoBoxes --format html -o docs/js/portal/content/additionalinfoboxes
documentation build src/js/portal/content/listfactory/ --format html -o docs/js/portal/content/listfactory
documentation build src/js/portal/content/songs/Slots.js --format html -o docs/js/portal/content/songs/slots
documentation build src/js/portal/content/songs/Songlists.js --format html -o docs/js/portal/content/songs/songlists
documentation build src/js/portal/content/tabs/ --format html -o docs/js/portal/content/tabs

# Service structure

documentation build src/js/portal/service_structure/GeneralStructure.js --format html -o docs/js/portal/service_structure/generalstructure
documentation build src/js/portal/service_structure/DataLoading.js --format html -o docs/js/portal/service_structure/dataloading
documentation build src/js/portal/service_structure/DragAndDrop.js --format html -o docs/js/portal/service_structure/draganddrop
documentation build src/js/portal/service_structure/Headers.js --format html -o docs/js/portal/service_structure/headers
documentation build src/js/portal/service_structure/Images.js --format html -o docs/js/portal/service_structure/images
documentation build src/js/portal/service_structure/InjectableData.js --format html -o docs/js/portal/service_structure/injectabledata
documentation build src/js/portal/service_structure/LightBox.js --format html -o docs/js/portal/service_structure/lightbox
documentation build src/js/portal/service_structure/Preview.js --format html -o docs/js/portal/service_structure/preview
documentation build src/js/portal/service_structure/SlotFactory.js --format html -o docs/js/portal/service_structure/slotfactory
documentation build src/js/portal/service_structure/bibleslide.js --format html -o docs/js/portal/service_structure/bibleslide
documentation build src/js/portal/service_structure/infoslide.js --format html -o docs/js/portal/service_structure/infoslide
documentation build src/js/portal/service_structure/liturgicalslide.js --format html -o docs/js/portal/service_structure/liturgicalslide
documentation build src/js/portal/service_structure/songslide.js --format html -o docs/js/portal/service_structure/songslide


# Other portal related

documentation build src/js/portal/navigation/Menus.js --format html -o docs/js/portal/menus
documentation build src/js/portal/LoginForm.js --format html -o docs/js/portal/loginform
documentation build src/js/portal/plugins/BibleModule.js --format html -o docs/js/portal/plugins/biblemodule
documentation build src/js/portal/plugins/Credits.js --format html -o docs/js/portal/plugins/credits
documentation build src/js/portal/plugins/PercentBar.js --format html -o docs/js/portal/plugins/percentbar
documentation build src/js/portal/utils.js --format html -o docs/js/portal/utils


# Slides

documentation build src/js/slides/ContentLoader.js --format html -o docs/js/slides/contentloader
documentation build src/js/slides/Contentlist.js --format html -o docs/js/slides/contentlist
documentation build src/js/slides/Controls.js --format html -o docs/js/slides/controls
documentation build src/js/slides/Presentation.js --format html -o docs/js/slides/presentation
documentation build src/js/slides/styles/Controller.js --format html -o docs/js/slides/styles/controller
documentation build src/js/slides/styles/FontControllers.js --format html -o docs/js/slides/styles/fontcontroller
documentation build src/js/slides/widgets/Widgets.js --format html -o docs/js/slides/widgets
documentation build src/js/slides/widgets/stylewidgets/ --format html -o docs/js/slides/widgets/stylewidgets
documentation build src/js/slides/widgets/contentadders/ --format html -o docs/js/slides/widgets/contentadders

