// const FCarousel = require("../../FCarousel");


var getCurrentCustomOptions = function () {
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
    //     "cardSelector"
    // ];

    var options = {};

    var controlOptionFormElem = $("#controlOptionForm")[0];
    var controlOptionInputs = $(controlOptionFormElem).find("[data-option-control]");

    for (var i = 0; i < controlOptionInputs.length; i++) {
        var targetInput = controlOptionInputs[i];
        var optKey = $(targetInput).data("option-control");

        if (optKey !== "step") {
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
        else {
            var stepNumberInput = $("[data-option-control='step'][type='number']")[0];

            if ($(targetInput).val() === "page") {
                $(stepNumberInput).attr("disabled", "");
                options.step = "page";
            }
            else {
                $(stepNumberInput).removeAttr("disabled");
                options.step = $(stepNumberInput).val();
            }
        }
    }

    return options;
}

$(document).ready(function () {
    var sampleCarouselElem = $("#sample_carousel_1")[0];

    var controlOptionFormElem = $("#controlOptionForm")[0];
    var controlOptionInputs = $(controlOptionFormElem).find("[data-option-control]");

    sampleCarouselInstance = FCarousel.getInstance(sampleCarouselElem);


    $(controlOptionInputs).on("change", function (event) {
        if (typeof FCarousel !== "function") {
            return;
        }
        // var targetInput = event?.target;
        var customOptions = getCurrentCustomOptions();

        // first destroy in order to reset all changes (sush as slider transform)
        // TODO: do something for reseting images load for seeing lazyload effect
        new FCarousel(sampleCarouselElem, customOptions);
    });

    $("#resetOptionsBtn").on("click", function () {
        $(controlOptionFormElem)[0].reset();
        var customOptions = getCurrentCustomOptions();
        new FCarousel(sampleCarouselElem, customOptions);
    });

    $("#reRunBtn").on("click", function () {
        sampleCarouselInstance.destroy();
        var customOptions = getCurrentCustomOptions();
        new FCarousel(sampleCarouselElem, customOptions);
    });
});

