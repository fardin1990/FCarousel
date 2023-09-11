
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


$(document).ready(function () {
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
        $(controlOptionFormElem)[0].reset();
        changeCarouselOptions(sampleCarouselElem);
    });

    $("#reRunBtn").on("click", function () {
        reRunCarousel(sampleCarouselElem);
    });
});

