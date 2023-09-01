
createCardElems();

function createCardElems() {
    var allCardPlh = $(".cards-temp-placeholder");
    var imagesUrlList = [
        '../images/186x167/image-1.jpg',
        '../images/186x167/image-2.jpg',
        '../images/186x167/image-3.jpg',
        '../images/186x167/image-4.jpg',
        '../images/186x167/image-5.jpg',
        '../images/186x167/image-6.jpg',
        '../images/186x167/image-7.jpg',
        '../images/186x167/image-8.jpg',
        '../images/186x167/image-9.jpg',
        '../images/186x167/image-10.jpg',
        '../images/186x167/image-11.jpg',
        '../images/186x167/image-12.jpg',
        '../images/186x167/image-13.jpg',
        '../images/186x167/image-14.jpg',
        '../images/186x167/image-15.png'
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

            cards_html += '<div class="card item ' + card_class + '"> \n';
            
            if (opts.type !== "image") {
                cards_html +=   '<div class="card-outer"> \n' +
                                    '<div class="card-inner"> \n';
            }

            cards_html +=               '<div class="card-img-cont"> \n' +
                                            '<a href="#" class="progressive ' + lazyLoadingClass + '" data-href="' + img_url + '"> \n' +
                                                '<img src="../images/default-placeholder-186x167.png" class="preview" alt="" width="186" height="167" /> \n' +
                                            '</a> \n' +
                                        '</div> \n';
            
            if (opts.type == "img-content" || opts.type == "img-number-content") {
                cards_html +=           '<div class="card-info"> \n' +
                                            '<div> \n';
                    
                if (opts.type == "img-number-content") {
                    cards_html +=               '<div style="font-size: 2rem; color: red;"> \n' +
                                                    card_number + ' \n' +
                                                '</div> \n';
                }

                    cards_html +=               '<p class="product-name"> \n' +
                                                    '<a href="#">دریل پیچ گوشتی شارژی چکشی لیتیوم 18 ولت</a> \n' +
                                                '</p> \n' +
                                                '<p class="product-branding"> \n' +
                                                    '<a asp-controller="product" asp-action="index">محصولات آاگ</a> \n' +
                                                '</p> \n' +
                                                '<p class="product-category"> \n' +
                                                    'مصالح ساختمانی / سنگ نما \n' +
                                                '</p> \n' +
                                            '</div> \n' +
                                            '<div class="product-price"> \n' +
                                                '<em class="price">380,000</em> \n' +
                                                '<span>تومان </span> \n' +
                                            '</div> \n' +
                                        '</div> \n';
            }
            else if (opts.type == "img-number") {
                cards_html +=           '<div class="card-info"> \n' +
                                            card_number + ' \n' +
                                        '</div> \n';
            }

            if (opts.type !== "image") {
                cards_html +=       '</div> \n' +
                                '</div> \n';
            }

            cards_html +=   '</div> \n';
        });

        $(cardPlh).parent()[0].innerHTML = cards_html;
        // $(cardPlh).remove();
    })
}