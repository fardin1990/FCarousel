// progressive-image.js
// by Craig Buckler, @craigbuckler
if (window.addEventListener && window.requestAnimationFrame && document.getElementsByClassName) {
    window.addEventListener('load', function () {
        'use strict';

        // start
        var pItem = document.getElementsByClassName('progressive replace'),
            pCount,
            timer;
        // scroll and resize events
        window.addEventListener('scroll', scroller, false);
        window.addEventListener('resize', scroller, false);

        // DOM mutation observer
        if (MutationObserver) {
            var observer = new MutationObserver(function () {
                if (pItem.length !== pCount) inView();
            });
            observer.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true });
        }
        // initial check
        inView();

        var waiting,
            endScrollHandle;
        // throttled scroll/resize
        function scroller() {
            //timer = timer || setTimeout(function () {
            //    timer = null;
            //    inView();
            //}, 300);

            // با این روش (به نسبت روش بالا -همان که از متغییر تایمر استفاده کرده-) مزیت اطمینان از عملکرد بعد از آخرین تغییرات را خواهیم داشت
            if (waiting) {
                return;
            }
            waiting = true;
            // clear previous scheduled endScrollHandle
            clearTimeout(endScrollHandle);

            inView();

            setTimeout(function () {
                waiting = false;
            }, 300);

            // schedule an extra execution of scroll() after 200ms
            // in case the scrolling stops in next 100ms
            endScrollHandle = setTimeout(function () {
                inView();
            }, 600);
        }

        // image in view?
        function inView() {
            if (pItem.length) requestAnimationFrame(function () {
                var wH = window.innerHeight, cRect, cT, cH, p = 0;
                var loading_hrefs = [], item_href, i = 0;  // added by fardin

                while (p < pItem.length) {
                    item_href = pItem[p].getAttribute('data-href') || pItem[p].href;
                    cRect = pItem[p].getBoundingClientRect();
                    cT = cRect.top;
                    cH = cRect.height;
                    if (0 < cT + cH && wH > cT) {
                        loadFullImage(pItem[p]);
                        pItem[p].classList.remove('replace');

                        // added by fardin
                        if (item_href && loading_hrefs.indexOf(item_href) < 0) {
                            loading_hrefs.push(item_href);
                        } // end of fardin code
                    }
                    else p++;
                }
                // added by fardin
                while (i < pItem.length) {
                    item_href = pItem[i].getAttribute('data-href') || pItem[i].href;
                    if (item_href && loading_hrefs.indexOf(item_href) > -1) {

                        loadFullImage(pItem[i], undefined, true);
                        pItem[i].classList.remove('replace');
                    }
                    else i++;
                } // end of fardin code
                pCount = pItem.length;
            });
        }

        // replace with full image
        function loadFullImage(item, retry, isRepetitiveImage) {
            var href = item && (item.getAttribute('data-href') || item.href);
            if (!href) return;
            // load image
            var img = new Image(),
                ds = item.dataset;
            if (ds) {
                if (ds.srcset) img.srcset = ds.srcset;
                if (ds.sizes) img.sizes = ds.sizes;
                if (ds.width) img.width = ds.width;
                if (ds.height) img.height = ds.height;
                if (ds.sizes) img.alt = ds.alt;
            }
            img.onload = addImg;
            retry = 1 + (retry || 0);
            if (retry < 3) img.onerror = function () {
                item.classList.add("img-load-err");
                setTimeout(function () { loadFullImage(item, retry, isRepetitiveImage); }, retry * 3000);
            };
            else if (!isRepetitiveImage) img.onerror = function () {
                //UnitEs.imageNotLoaded(img.src, item);
                UnitEs.imageNotLoaded(img.src);
            };
            img.className = 'reveal';
            img.src = href;

            // replace image
            function addImg() {
                requestAnimationFrame(function () {
                    item.classList.remove("img-load-err");

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