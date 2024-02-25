
function createCardElems() {
    var allCardPlh = $(".cards-temp-placeholder");
    var imagesUrlList = [
        'assets/images/sample-image-1.jpg',
        'assets/images/sample-image-2.jpg',
        'assets/images/sample-image-3.jpg',
        'assets/images/sample-image-4.jpg',
        'assets/images/sample-image-5.jpg',
        'assets/images/sample-image-6.jpg',
        'assets/images/sample-image-7.jpg',
        'assets/images/sample-image-8.jpg',
        'assets/images/sample-image-9.jpg',
        'assets/images/sample-image-10.jpg',
        'assets/images/sample-image-11.jpg',
        'assets/images/sample-image-12.jpg',
        'assets/images/sample-image-13.jpg',
        'assets/images/sample-image-14.jpg',
        'assets/images/sample-image-15.jpg',
        'assets/images/sample-image-16.jpg',
        'assets/images/sample-image-17.jpg',
        'assets/images/sample-image-18.jpg',
        'assets/images/sample-image-19.jpg',
        'assets/images/sample-image-20.jpg',
        'assets/images/sample-image-21.jpg'
    ];
    
    $(allCardPlh).each(function () {
        var cardPlh = this;
        var itemsConfig = cardPlh.dataset.itemsInfo;
        var carouselLazyLoad = cardPlh.dataset.carouselLazyload === false || cardPlh.dataset.carouselLazyload === "false" ? false : true;
        var lazyLoadingClass = carouselLazyLoad ? "pre-load" : "replace";

        var isCustomConfigSet = false;
        try {
            isCustomConfigSet = typeof itemsConfig === "string" && JSON.parse(itemsConfig) && Array.isArray(JSON.parse(itemsConfig));
        }
        catch (err) {
            isCustomConfigSet = false;
        }

        var slctdImages = isCustomConfigSet ?
            JSON.parse(itemsConfig).map(function (conf) {
                var img_index = conf.imageIndex && Math.max(parseInt(conf.imageIndex), 0);
                if (parseInt(conf.imageIndex) >= 0 && img_index <= imagesUrlList.length - 1) {
                    return imagesUrlList[img_index];
                }
            }).filter(function (item) {
                return item;
            }) : imagesUrlList;
        
        var opts = {
            type: cardPlh.dataset.type,
            images: slctdImages
        };

        var cards_html = ""; 
        opts.images.map(function (img_url, index) {
            var card_class = isCustomConfigSet && typeof JSON.parse(itemsConfig)[index] === "object" && JSON.parse(itemsConfig)[index].card_class || '';
            
            var card_number = index + 1;

            cards_html +=
                '<div class="card item carousel-card' + ' ' + card_class + '"> \n';
            
            if (opts.type !== "image") {
                cards_html +=
                    '<div class="card-inner"> \n';
            }

            cards_html +=
                        '<div class="card-img-cont"> \n' +
                            '<div class="progressive ' + lazyLoadingClass + '" data-href="' + img_url + '"> \n' +
                                '<img src="assets/images/default-placeholder-186x167.png" class="preview" alt="" width="186" height="167" /> \n' +
                            '</div> \n' +
                        '</div> \n';
            
            if (opts.type == "img-content" || opts.type == "img-number-content") {
                cards_html +=
                        '<div class="card-info"> \n';
                    
                if (opts.type == "img-number-content") {
                    cards_html +=
                            '<div style="font-size: 2rem; color: red;"> \n' +
                                card_number + ' \n' +
                            '</div> \n';
                }

                cards_html +=
                            '<p class="card-title"> \n' +
                                // '<a href="javascript:void(0)">Heading link ' + card_number + '</a> \n' +
                                '<a href="#">Heading link ' + card_number + '</a> \n' +
                            '</p> \n' +
                            '<p class="card-caption mb-0">Lorem Ipsum is simply dummy text of the printing and typesetting industry.</p> \n' +
                        '</div> \n';
            }
            else if (opts.type == "img-number") {
                cards_html +=
                        '<div class="card-info"> \n' +
                            card_number + ' \n' +
                        '</div> \n';
            }

            if (opts.type !== "image") {
                cards_html +=
                    '</div> \n';
            }

            cards_html +=
                '</div> \n';
        });

        $(cardPlh).parent()[0].innerHTML = cards_html;
        // $(cardPlh).remove();
    })
}

function getCurrentCustomOptions() {
    // var optionKeys = [
    //     "cardAlign",
    //     "rightToLeft",
    //     "friction",
    //     "freeScrollFriction",
    //     "selectedAttraction",
    //     "discretePlacement",
    //     "wrapAround",
    //     "scrollbar",
    //     "scrollbarMutualControl",
    //     "contain",
    //     "step",
    //     "onStepsPlacement",
    //     "initialIndex",
    //     "freeScroll",
    //     "nonUniSize",
    //     "accessibility",
    //     "adaptiveHeight",
    //     "setGallerySize",
    //     "cardSelector",

    //     "fade",
    //     "draggable": ">1" | true | false,
    //     "dragThreshold",
    //     "minScrollThumbWidth",
    //     "leftBtnIcon",
    //     "rightBtnIcon",
    //     "prevNextButtons",
    //     "pageDots",
    //     "asNavFor",
    //     "autoPlay",
    //     "pauseAutoPlayOnHover",
    //     "lazyLoad",
    //     "beforeLazyLoadPrepareClass",
    //     "afterLazyLoadPrepareClass",

    //     "namespaceJQueryEvents",
    // ];

    var options = {};

    var controlOptionFormElem = $("#controlOptionForm")[0];
    var controlOptionInputs = $(controlOptionFormElem).find("[data-option-control]");

    for (var i = 0; i < controlOptionInputs.length; i++) {
        var targetInput = controlOptionInputs[i];
        var optKey = $(targetInput).data("option-control");

        if (optKey === "nonUniSize") {
            var carouselCards = $("#sample_carousel_1").find(".item");
            if ($(targetInput)[0].checked) {
                $(carouselCards).each(function () {
                    var cardElem = this;
                    var randomWidth = getRandomArbitrary(0.3, 1.7);
                    $(cardElem).css("width", "");
                    $(cardElem).css("min-width", "");
                    var realCardWidth = $(cardElem).outerWidth();
                    $(cardElem).css("width", randomWidth * realCardWidth + "px");
                    $(cardElem).css("min-width", randomWidth * realCardWidth + "px");
                });
            }
            else {
                $(carouselCards).each(function () {
                    var cardElem = this;
                    $(cardElem).css("width", "");
                    $(cardElem).css("min-width", "");
                });
            }
        }

        if (optKey === "step") {
            var stepNumberInput = $("[data-option-control='step'][type='number']")[0];

            if ($(targetInput).val() === "p" && $(targetInput)[0].checked) {
                $(stepNumberInput).attr("disabled", "");
                options.step = $(targetInput).val();
            }
            else {
                $(stepNumberInput).removeAttr("disabled");
                options.step = $(stepNumberInput).val();
            }
        }
        else if (optKey === "rightToLeft") {
            var parentSection = $("#sample_carousel_1_section")[0];
            if ($(targetInput)[0].checked) {
                $(parentSection).css("direction", "rtl");
            }
            else {
                $(parentSection).css("direction", "ltr");
            }
        }
        else {
            if ($(targetInput).attr("type") === "text" || $(targetInput).attr("type") === "number" || $(targetInput).attr("type") === "range") {
                options[optKey] = $(targetInput).val();
            }
            else if ($(targetInput).attr("type") === "checkbox") {
                options[optKey] = $(targetInput)[0].checked;
            }
            else if ($(targetInput).attr("type") === "radio" && $(targetInput)[0].checked) {
                options[optKey] = $(targetInput).attr("value");
            }
        }
    }

    return options;
}

function reRunCarousel(carouselElem) {
    var carouselInstance = FCarousel.getInstance(carouselElem);
    carouselInstance.destroy();
    changeCarouselOptions(carouselElem);
}

function changeCarouselOptions(carouselElem) {
    var customOptions = getCurrentCustomOptions();
    new FCarousel(carouselElem, customOptions);
}

function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}

createCardElems();


$(document).ready(function () {

    $(".custom-tabs-box [data-tab]").on("click", function (evt) {
        var btnElem = this;
        var parentElem = $(btnElem).parents(".custom-tabs-box")[0];
        var tabBtns = $(parentElem).find("[data-tab]");
        var targetId = $(btnElem).data("tab");
        var tabElems = $(parentElem).find("[data-tab-id]");
        var targetTabElem = $(parentElem).find("[data-tab-id='" + targetId + "']")[0];

        $(tabBtns).removeClass("active");
        $(btnElem).addClass("active");

        $(tabElems).css("display", "none");
        $(targetTabElem).css("display", "");
    });
    
    
    var sampleCarouselElem = $("#sample_carousel_1")[0];
    var controlOptionFormElem = $("#controlOptionForm")[0];
    var controlOptionInputs = $(controlOptionFormElem).find("[data-option-control]");

    $(controlOptionInputs).on("change", function (event) {
        if (typeof FCarousel !== "function") {
            return;
        }
        // first destroy in order to reset all changes (sush as slider transform)
        // TODO: do something for reseting images load for seeing lazyload effect

        if ($(event.target).data("rerun") !== undefined) {
            reRunCarousel(sampleCarouselElem);
        }
        else {
            changeCarouselOptions(sampleCarouselElem);
        }
    });

    $("#resetOptionsBtn").on("click", function () {
        $(controlOptionFormElem)[0]?.reset();
        changeCarouselOptions(sampleCarouselElem);
    });

    $("#reRunBtn").on("click", function () {
        reRunCarousel(sampleCarouselElem);
    });

});

