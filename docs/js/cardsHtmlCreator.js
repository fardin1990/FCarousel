
createCardElems();

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

            cards_html += '<div class="card item ' + card_class + '"> \n';
            
            if (opts.type !== "image") {
                cards_html +=   '<div class="card-outer"> \n' +
                                    '<div class="card-inner"> \n';
            }

            cards_html +=               '<div class="card-img-cont"> \n' +
                                            '<a href="#" class="progressive ' + lazyLoadingClass + '" data-href="' + img_url + '"> \n' +
                                                '<img src="assets/images/default-placeholder-186x167.png" class="preview" alt="" width="186" height="167" /> \n' +
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