// progressive-image.js
// by Craig Buckler, @craigbuckler
if (window.addEventListener && window.requestAnimationFrame && document.getElementsByClassName) {
    window.addEventListener('load', function () {
        'use strict';

        // start
        var pItem = document.getElementsByClassName('progressive replace'),
            pl_pItem = document.getElementsByClassName('progressive pre-load'),
            carousels = $("[data-ride]"),
            pCount,
            pl_pCount,
            timer,
            timer_two;
        // scroll and resize events
        window.addEventListener('scroll', scroller, false);
        window.addEventListener('resize', scroller, false);
        carousels.each(function () {
            var caros = this;
            caros.addEventListener('carousel.moveend', carouselChange, false);
            caros.addEventListener('carousel.picturechanged', carouselChange, false);
            caros.addEventListener('carousel.drag', carouselChange, false);
        });

        // DOM mutation observer
        if (MutationObserver) {
            var observer = new MutationObserver(function () {
                if (pItem.length !== pCount) inView();
                if (pl_pItem.length !== pl_pCount) inCarousel();
            });
            observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
        }
        // initial check
        inView();
        inCarousel();

        // throttled scroll/resize
        function scroller() {
            timer = timer || setTimeout(function () {
                timer = null;
                inView();
            }, 300);
        }

        // آماده سازی عکس های کاروسل ها با ورود به محدوده دید
        // carousel move/change item
        function carouselChange() {
            timer_two = timer_two || setTimeout(function () {
                timer_two = null;
                inCarousel();
            }, 300);
        }
        // image in carousel view-box ?
        function inCarousel() {
            if (pl_pItem.length) requestAnimationFrame(function () {
                var caros_view_box,
                    bL, bR, imgBCR, p = 0, i = 0,
                    loading_hrefs = [], item_href;
                while (p < pl_pItem.length) {
                    caros_view_box = $(pl_pItem).closest(".slider-cards-container")[0];
                    bL = caros_view_box ? caros_view_box.getBoundingClientRect().left : 0;
                    bR = caros_view_box ? caros_view_box.getBoundingClientRect().right : $(window).innerWidth();

                    imgBCR = pl_pItem[p].getBoundingClientRect();
                    if (imgBCR.right > bL && imgBCR.left < bR) {
                        item_href = pl_pItem[p].getAttribute('data-href') || pl_pItem[p].href;

                        if (item_href && loading_hrefs.indexOf(item_href) < 0) {
                            loading_hrefs.push(item_href);
                        }
                        // دستور زیر حتما باید بعد از مواردی که بستگی به عدد پی دارند بیاید!ااا
                        $(pl_pItem[p]).removeClass("pre-load").addClass("replace");
                    }
                    else p++;
                }
                // آماده سازی -تعویض نام کلاس- عکس های تکراری
                while (i < pl_pItem.length) {
                    item_href = pl_pItem[i].getAttribute('data-href') || pl_pItem[i].href;
                    if (item_href && loading_hrefs.indexOf(item_href) > -1) {
                        $(pl_pItem[i]).removeClass("pre-load").addClass("replace");
                    }
                    else i++;
                }
                pl_pCount = pl_pItem.length;
            });
        } //

        // image in view?
        function inView() {
            if (pItem.length) requestAnimationFrame(function () {
                var wH = window.innerHeight, cRect, cT, cH, p = 0;
                var loading_hrefs = [], item_href, i = 0;

                while (p < pItem.length) {
                    cRect = pItem[p].getBoundingClientRect();
                    cT = cRect.top;
                    cH = cRect.height;
                    if (0 < cT + cH && wH > cT) {
                        loadFullImage(pItem[p]);
                        // ایجاد آرایه نمونه آدرس ها
                        item_href = pItem[p].getAttribute('data-href') || pItem[p].href;
                        if (item_href && loading_hrefs.indexOf(item_href) < 0) {
                            loading_hrefs.push(item_href);
                        } // 

                        pItem[p].classList.remove('replace');
                    }
                    else p++;
                }
                // لود عکس های تکراری
                while (i < pItem.length) {
                    item_href = pItem[i].getAttribute('data-href') || pItem[i].href;
                    if (item_href && loading_hrefs.indexOf(item_href) > -1) {
                        loadFullImage(pItem[i]);
                        pItem[i].classList.remove('replace');
                    }
                    else i++;
                } // 
                pCount = pItem.length;
            });
        }

        // replace with full image
        function loadFullImage(item, retry) {
            var href = item && (item.getAttribute('data-href') || item.href);
            if (!href) return;
            // load image
            var img = new Image(),
                ds = item.dataset;
            if (ds) {
                if (ds.srcset) img.srcset = ds.srcset;
                if (ds.sizes) img.sizes = ds.sizes;
            }
            img.onload = addImg;
            retry = 1 + (retry || 0);
            if (retry < 3) img.onerror = function () {
                setTimeout(function () { loadFullImage(item, retry); }, retry * 3000);
            };
            img.className = 'reveal';
            img.src = href;

            // replace image
            function addImg() {
                requestAnimationFrame(function () {
                    // disable click
                    if (href === item.href) {
                        item.style.cursor = 'default';
                        item.addEventListener('click', function (e) { e.preventDefault(); }, false);
                    }
                    // preview image
                    var pImg = item.querySelector && item.querySelector('img.preview');

                    // add full image
                    item.insertBefore(img, pImg && pImg.nextSibling).addEventListener('animationend', function () {
                        // remove preview image
                        if (pImg) {
                            if (pImg.alt) img.alt = pImg.alt;
                            item.removeChild(pImg);
                        }
                        img.classList.remove('reveal');
                    });
                });
            }
        }
    }, false);
}
