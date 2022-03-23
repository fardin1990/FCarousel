/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */
/* jshint unused: true, undef: true, strict: true */
(function (global, factory) {
    // // universal module definition
    // /* jshint strict: false */ /* globals define, module, window */
    // if ( typeof define == 'function' && define.amd ) {
    //   // AMD - RequireJS
    //   define( 'ev-emitter/ev-emitter',factory );
    // } else if ( typeof module == 'object' && module.exports ) {
    //   // CommonJS - Browserify, Webpack
    //   module.exports = factory();
    // } else {
    //   // Browser globals
    global.EvEmitter = factory();
    // }
})(typeof window != "undefined" ? window : this, function () {
    function EvEmitter() { }

    var proto = EvEmitter.prototype;

    proto.on = function (eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        // set events hash
        var events = (this._events = this._events || {});
        // set listeners array
        var listeners = (events[eventName] = events[eventName] || []);
        // only add once
        if (listeners.indexOf(listener) == -1) {
            listeners.push(listener);
        }

        return this;
    };
    proto.once = function (eventName, listener) {
        if (!eventName || !listener) {
            return;
        }
        // add event
        this.on(eventName, listener);
        // set once flag
        // set onceEvents hash
        var onceEvents = (this._onceEvents = this._onceEvents || {});
        // set onceListeners object
        var onceListeners = (onceEvents[eventName] = onceEvents[eventName] || {});
        // set flag
        onceListeners[listener] = true;

        return this;
    };
    proto.off = function (eventName, listener) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        var index = listeners.indexOf(listener);
        if (index != -1) {
            listeners.splice(index, 1);
        }

        return this;
    };
    proto.emitEvent = function (eventName, args) {
        var listeners = this._events && this._events[eventName];
        if (!listeners || !listeners.length) {
            return;
        }
        // copy over to avoid interference if .off() in listener
        listeners = listeners.slice(0);
        args = args || [];
        // once stuff
        var onceListeners = this._onceEvents && this._onceEvents[eventName];

        for (var i = 0; i < listeners.length; i++) {
            var listener = listeners[i];
            var isOnce = onceListeners && onceListeners[listener];
            if (isOnce) {
                // remove listener
                // remove before trigger to prevent recursion
                this.off(eventName, listener);
                // unset once flag
                delete onceListeners[listener];
            }
            // trigger listener
            listener.apply(this, args);
        }

        return this;
    };
    proto.allOff = function () {
        delete this._events;
        delete this._onceEvents;
    };

    return EvEmitter;
});

// utils
(function (window, factory) {
    window.utils = factory();
})(window, function factory() {
    var utils = {};

    // ----- handleEvent ----- //
    // enable .ontype to trigger from .addEventListener( elem, 'type' )
    utils.handleEvent = function (event) {
        var method = "on" + event.type;
        if (this[method]) {
            this[method](event);
        }
    };

    // ----- modulo ----- //
    utils.modulo = function (num, div) {
        return ((num % div) + div) % div;
    };

    // ----- makeArray ----- //
    var arraySlice = Array.prototype.slice;
    // turn element or nodeList into an array
    utils.makeArray = function (obj) {
        if (Array.isArray(obj)) {
            // use object if already an array
            return obj;
        }
        // return empty array if undefined or null. #6
        if (obj === null || obj === undefined) {
            return [];
        }

        var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
        if (isArrayLike) {
            // convert nodeList to array
            return arraySlice.call(obj);
        }
        // array of single index
        return [obj];
    };

    // ----- getQueryElement ----- //
    // use element as selector string
    utils.getQueryElement = function (elem) {
        if (typeof elem == 'string') {
            return document.querySelector(elem);
        }
        return elem;
    };

    utils.hasAllClasses = function (elem, classesStr) {
        var flag = true;

        classesStr.replace(/\s+/g, ' ').trim();
        var classesArr = classesStr.split(" ");

        // var i = 0;
        // while (i < classesArr.length) {
        //     if (classesArr[i] === '') {
        //         classesArr.splice(i,1);
        //     }
        //     else {
        //         i++;
        //     }
        // }

        for (var i = 0; i < classesArr.length; i++) {
            if (!$(elem).hasClass(classesArr[i])) {
                flag = false;
                break;
            }
        }
        return flag;
    };

    // ----- debounceMethod ----- //
    utils.debounceMethod = function (_class, methodName, threshold) {
        threshold = threshold || 100;
        // original method
        var method = _class.prototype[methodName];
        var timeoutName = methodName + 'Timeout';

        _class.prototype[methodName] = function () {
            var timeout = this[timeoutName];
            clearTimeout(timeout);

            var args = arguments;
            var _this = this;
            this[timeoutName] = setTimeout(function () {
                method.apply(_this, args);
                delete _this[timeoutName];
            }, threshold);
        };
    };

    return utils;
});

// get position
(function (window, factory) {
    window.getPosition = factory(window.utils);
})(window, function (utils) {

    var getPosition = function (element, isRtl) {

        element = utils.getQueryElement(element);
        // do not proceed on non-objects
        if (!element || typeof element != 'object' || !element.nodeType) {
            return;
        }

        var elmBCR = element.getBoundingClientRect();
        var position = {};
        position.start = isRtl ? elmBCR.right : elmBCR.left;
        position.end = isRtl ? elmBCR.left : elmBCR.right;

        return position;
    };

    return getPosition;
});

// get size
(function (window, factory) {
    // window.getSize = factory();
    window.getElemSize = factory(window.utils);
}(window, function (utils) {
    // var getElemSize = {};
    function getElemSize() { }

    function noop() { }

    var logError = typeof console == 'undefined' ? noop :
        function (message) {
            console.error(message);
        };

    // // get a number from a string, not a percentage
    // function getStyleSize( value ) {
    //   var num = parseFloat( value );
    //   // not a percent like '100%', and a number
    //   var isValid = value.indexOf('%') == -1 && !isNaN( num );
    //   return isValid && num;
    // }

    /**
     * getStyle, get style of element, check for Firefox bug
     * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
     */
    function getStyle(elem) {
        var style = getComputedStyle(elem);
        if (!style) {
            logError('Style returned ' + style +
                '. Are you running this code in a hidden iframe on Firefox? ' +
                'See https://bit.ly/getsizebug1');
        }
        return style;
    }

    var proto = getElemSize.prototype;

    proto.getInnerWidth = function (elem) {
        elem = utils.getQueryElement(elem);
        // do not proceed on non-objects
        if (!elem || typeof elem != 'object' || !elem.nodeType) {
            return;
        }
        var style = getStyle(elem),
            paddingRight = parseFloat(style.paddingRight),
            paddingLeft = parseFloat(style.paddingLeft);

        return elem.clientWidth - (paddingRight + paddingLeft);
    };
    proto.getOuterWidth = function (elem) {
        elem = utils.getQueryElement(elem);
        // do not proceed on non-objects
        if (!elem || typeof elem != 'object' || !elem.nodeType) {
            return;
        }
        var style = getStyle(elem),
            marginRight = parseFloat(style.marginRight),
            marginLeft = parseFloat(style.marginLeft);

        return elem.offsetWidth + marginRight + marginLeft;
    };
    proto.getInnerHeight = function (elem) {
        elem = utils.getQueryElement(elem);
        // do not proceed on non-objects
        if (!elem || typeof elem != 'object' || !elem.nodeType) {
            return;
        }
        var style = getStyle(elem),
            paddingTop = parseFloat(style.paddingTop),
            paddingBottom = parseFloat(style.paddingBottom);

        return elem.clientHeight - (paddingTop + paddingBottom);
    };
    proto.getOuterHeight = function (elem) {
        elem = utils.getQueryElement(elem);
        // do not proceed on non-objects
        if (!elem || typeof elem != 'object' || !elem.nodeType) {
            return;
        }
        var style = getStyle(elem),
            marginTop = parseFloat(style.marginTop),
            marginBottom = parseFloat(style.marginBottom);

        return elem.offsetHeight + marginTop + marginBottom;
    };

    // -------------------------- getSize -------------------------- //
    proto.getSize = function (elem) {
        elem = utils.getQueryElement(elem);
        // do not proceed on non-objects
        if (!elem || typeof elem != 'object' || !elem.nodeType) {
            return;
        }

        var measurements = [
            'paddingLeft',
            'paddingRight',
            'paddingTop',
            'paddingBottom',
            'marginLeft',
            'marginRight',
            'marginTop',
            'marginBottom',
            'borderLeftWidth',
            'borderRightWidth',
            'borderTopWidth',
            'borderBottomWidth'
        ];
        var measurementsLength = measurements.length,
            style = getStyle(elem),
            size = {};

        size.isBorderBox = style.boxSizing == 'border-box';

        // get all measurements
        if (style.display == 'none') {
            for (var i = 0; i < measurementsLength; i++) {
                var measurement = measurements[i];
                size[measurement] = 0;
            }
            size.innerWidth = size.outerWidth = size.innerHeight = size.outerHeight = 0;
        }
        else {
            for (var i = 0; i < measurementsLength; i++) {
                var measurement = measurements[i],
                    value = style[measurement],
                    num = parseFloat(value);
                // any 'auto', 'medium' value will be 0
                size[measurement] = !isNaN(num) ? num : 0;
            }
            size.innerWidth = this.getInnerWidth(elem);
            size.outerWidth = this.getOuterWidth(elem);
            size.innerHeight = this.getInnerHeight(elem);
            size.outerHeight = this.getOuterHeight(elem);
        }

        return size;
    };

    return getElemSize;
}));

// global drag animate (for Carousel & Scrollbar handle)
(function (window, factory) {
    window.dragAnimatePrototype = factory();
})(window, function () {
    var proto = {};

    proto.startAnimation = function () {
        // if (this.isAnimating) {
        if (this.isAnimatingDirectly) {
            return;
        }
        this.isAnimating = true;
        this.isAnimatingDirectly = true;
        if (this.positioningCompanion) {
            this.positioningCompanion.isAnimating = true;
            this.positioningCompanion.isAnimatingDirectly = false;
        }
        this.restingFrames = 0;
        this.animate();
    };
    proto.animate = function () {
        if (this.positioningCompanion && this.positioningCompanion.isAnimatingDirectly) {
            // this.isAnimating = false;
            this.isAnimatingDirectly = false;
            delete this.isFreeScrolling;
            delete this.lastVelocity;
            return;
        }

        this.applyDragForce();
        var previousX = this.x;
        this.integratePhysics();
        this.positionSlider();

        this.animateCompanion();

        this.settle(previousX);

        // animate next frame
        // if (this.isAnimating) {
        if (this.isAnimatingDirectly) {
            var _this = this;
            requestAnimationFrame(function animateFrame() {
                _this.animate();
            });
        }
    };
    proto.applyDragForce = function () {
        if (!this.isDraggable || !this.isPointerDown) {
            return;
        }
        // change the position to drag position by applying force
        var dragVelocity = this.dragX - this.x;
        var dragForce = dragVelocity - this.velocity;
        this.applyForce(dragForce);
    };
    proto.integratePhysics = function () {
        if (this.isAnimatingDirectly) {
            this.checkVelocityValidity();
        }
        this.x += this.velocity;

        var companion = this.positioningCompanion;
        if (companion) {
            companion.acquiredPositionX = companion.x + -this.velocity * companion.companionConversionFactor;
        }

        // if (!this.isPointerDown) {
        this.velocity *= this.getFrictionFactor();
        // }
    };
    proto.checkVelocityValidity = function () {
        // *********** add by fardin - کد از رفردین ************
        // تعیین اعتبار آخرین سرعت قبل از برداشته شدن دست از روی کلید موس در حالت استفاده از حالت لمسی تاچ پد 
        // (بدون استفاده از  دکمه های آن) و جایگزین کردن آن با مقدار اشتباه "صفر" برای جلوگیری از توقف نادرست
        // *** مهم :
        // این روش اصولی نیست - ولی من راه حل دیگری برای این مشکل در این پروژه پیدا نکرده ام
        // ***

        var posCompanion = this.positioningCompanion,
            isOnScrollHandleBounds = posCompanion && !this.isScrollbar
                && (posCompanion.x >= posCompanion.endBound || posCompanion.x <= 0),
            isFreeScrolling = !this.isPointerDown && this.isFreeScrolling && this.options.freeScrollFriction !== 1;

        if (isFreeScrolling && !isOnScrollHandleBounds && this.velocity === 0 && Math.abs(this.lastVelocity) >= 1) {
            this.velocity = this.lastVelocity;
        }
    };
    proto.applyForce = function (force) {
        // lastVelocity added by fardin - توسط خودم اضافه شده
        this.lastVelocity = this.velocity !== 0 ? this.velocity : this.lastVelocity;
        this.velocity += force;
    };
    proto.getFrictionFactor = function () {
        var friction = this.options.freeScrollFriction || 1;
        return (1 - friction);
    };
    proto.positionSlider = function () {
        var x = this.x;
        this.setTranslateX(x, this.isAnimating);

        // var _this = this.isScrollbar ? this.parent : this;
        // _this.dispatchScrollEvent();
    };
    proto.setTranslateX = function (x, is3d) {
        if (this.cursorPosition) {
            x += this.cursorPosition;
        }
        // reverse if right-to-left and using transform
        x = this.options.rightToLeft ? -x : x;
        var translateX = Math.round(x);
        // use 3D tranforms for hardware acceleration on iOS
        // but use 2D when settled, for better font-rendering
        this.slider.style.transform = is3d
            ? "translate3d(" + translateX + "px" + ",0,0)"
            : "translateX(" + translateX + "px" + ")";
    };

    // proto.dispatchScrollEvent = function() {
    //   var _this = this.isScrollbar ? this.parent : this;
    //   var firstCard = _this.cards[0];
    //   if ( !firstCard || _this.cards[_this.lastIndex].target - firstCard.target == 0 ) {
    //     return;
    //   }
    //   var positionX = -_this.x - firstCard.target;
    //   var progress = positionX / (_this.cards[_this.lastIndex].target - firstCard.target);
    //   this.dispatchEvent( 'scroll', null, [ progress, positionX ] );
    // };

    proto.animateCompanion = function () {
        var companion = this.positioningCompanion;
        // if (!companion || companion.isAnimatingDirectly) {
        if (!companion) {
            return;
        }
        // companion.setAcquiredPosition();
        companion.applyScrollForce(this);
        companion.integratePhysics();
        companion.positionSlider();
    };
    proto.applyScrollForce = function (companion) {
        // if (!companion.isPointerDown) {
        //   return;
        // }
        var scrollVelocity = this.acquiredPositionX - this.x;
        var scrollForce = scrollVelocity - this.velocity;
        this.applyForce(scrollForce);
    };

    proto.settle = function (previousX) {
        // keep track of frames where x hasn't moved
        if (!this.isPointerDown && Math.round(this.x * 100) == Math.round(previousX * 100)) {
            this.restingFrames++;
        }
        // stop animating if resting for 3 or more frames
        if (this.restingFrames > 2) {
            this.isAnimating = false;
            this.isAnimatingDirectly = false;
            delete this.isFreeScrolling;
            delete this.lastVelocity;

            // render position with translateX when settled
            this.positionSlider();

            var companion = this.positioningCompanion;
            if (companion) {
                companion.isAnimating = false;
                companion.isAnimatingDirectly = false;
                delete companion.isFreeScrolling;
                delete companion.lastVelocity;
                companion.positionSlider();
            }

            this.dispatchEvent('settle', null, [this.selectedIndex]);
        }
    };
    return proto;
});

// animate (for FCarousel)
(function (window, factory) {
    window.FCarousel = window.FCarousel || {};
    window.FCarousel.animatePrototype = factory(window.dragAnimatePrototype);
})(window, function (dragAnimatePrototype) {
    // var proto = {};
    var proto = Object.create(dragAnimatePrototype);

    // update (ovverride) or add new animation methodes for FCarousel
    proto.animate = function () {

        if (this.positioningCompanion && this.positioningCompanion.isAnimatingDirectly) {
            // this.isAnimating = false;
            this.isAnimatingDirectly = false;
            delete this.isFreeScrolling;
            delete this.lastVelocity;
            return;
        }

        this.applyDragForce();
        this.applySelectedAttraction();
        var previousX = this.x;
        this.integratePhysics();

        this.positionSlider();

        this.setQualifiedPhysicsForScrollbarThumb();
        this.animateCompanion();

        this.settle(previousX);

        // animate next frame
        // if (this.isAnimating) {
        if (this.isAnimatingDirectly) {
            var _this = this;
            requestAnimationFrame(function animateFrame() {
                _this.animate();
            });
        }
    };
    proto.applySelectedAttraction = function () {
        // do not attract if pointer down or no slides
        var dragDown = this.isDraggable && this.isPointerDown;

        // if "discretePlacement == true", enabling the "freescroll" option only affects the calculation of the displacement size (actually only determines the target)
        this.isFreeScrolling = this.isFreeScrolling && !this.options.discretePlacement;

        if (dragDown || this.isFreeScrolling || !this.cards.length) {
            return;
        }
        // var distance = this.selectedCard.originalTarget * -1 - this.x;
        var distance = this.selectedCard.target * -1 - this.x;
        var force = distance * this.options.selectedAttraction;
        this.applyForce(force);
    };
    proto.getFrictionFactor = function () {
        return (
            1 - this.options[this.isFreeScrolling ? "freeScrollFriction" : "friction"]
        );
    };
    proto.setQualifiedPhysicsForScrollbarThumb = function () {
        var companion = this.positioningCompanion;
        if (!companion) {
            return;
        }
        var IsGreaterThanEndBound = -this.x > this.cards[this.lastIndex].target,
            IsLessThanOriginBound = -this.x < this.cards[0].target,
            acquiredWidth;
        if (IsGreaterThanEndBound || IsLessThanOriginBound) {
            var cSWidth = this.cards[this.lastIndex].target - this.cards[0].target, // cSWidth: carousel sliding width
                slidingWidthChangeAmount;

            if (IsGreaterThanEndBound) {
                slidingWidthChangeAmount = Math.abs(-this.x - this.cards[this.lastIndex].target);
            }
            else if (IsLessThanOriginBound) {
                slidingWidthChangeAmount = Math.abs(-this.x - this.cards[0].target);
            }

            // acquiredWidth = companion.trackWidth * cVpWidth / iCSWidth;
            acquiredWidth = (cSWidth / (slidingWidthChangeAmount + cSWidth)) * companion.thumbWidth;
            this.scrollbar.setThumbWidth(acquiredWidth, true);
        }
        else {
            this.scrollbar.setThumbWidth(companion.thumbWidth);
        }

        var thmbWdth = acquiredWidth || companion.thumbWidth;
        if (IsGreaterThanEndBound) {
            companion.acquiredPositionX = companion.trackWidth - Math.round(thmbWdth);
        }
        else if (IsLessThanOriginBound) {
            companion.acquiredPositionX = 0;
        }
    };
    proto.getRestingPosition = function () {
        // my thanks to Steven Wittens, who simplified this math greatly
        this.checkVelocityValidity();
        return this.x + this.velocity / (1 - this.getFrictionFactor());
        // فرمول بالا در واقع جواب سری توانی زیر می باشد :
        // sum[ v*f^n {n, 0, infinity}]
        // که :
        // v=velocity , f=this.getFrictionFactor() , 0<f<1
        // جواب این سری برابر می شود با :
        // v/(1-f)
        // تست شده از :
        // www.wolframalpha.com
    };
    proto.positionSliderAtSelected = function () {
        if (!this.cards.length) {
            return;
        }
        // this.x = -this.selectedCard.originalTarget;
        this.x = -this.selectedCard.target;
        this.velocity = 0; // stop wobble
        delete this.lastVelocity;
        this.positionSlider();

        var companion = this.positioningCompanion;
        if (companion) {
            var originalX = -this.selectedCard.originalTarget;
            // companion.acquiredPositionX = -this.x * companion.companionConversionFactor;
            // companion.x = -this.x * companion.companionConversionFactor;
            companion.x = -originalX * companion.companionConversionFactor;
            companion.velocity = 0;
            delete companion.lastVelocity;
            companion.positionSlider();
        }
    };
    return proto;
});

// FCarousel card
(function (window, factory) {
    window.FCarousel = window.FCarousel || {};
    window.FCarousel.Card = factory(window.getPosition, window.getElemSize);
})(window, function (getPosition, getElemSize) {
    var Card = function (element, parent) {
        this.element = element;
        this.parent = parent;
        this.create();
    };

    var proto = Card.prototype;

    $.extend(proto, getElemSize.prototype);

    proto.create = function () {
        // this.element.style.position = 'absolute';
        // this.element.setAttribute( 'aria-hidden', 'true' );
        this.x = 0;
        this.originalTarget = 0;
        // this.lastIndexOfCardSlide = -1;
        this.shift = 0;

        // this.updateTarget();
        // this.getUsefulSizes();
    };

    proto.setPosition = function (x) {
        // this.x = x;
        this.originalTarget = x;

        var endMargin = this.parent.originSide == 'left' ? 'marginRight' : 'marginLeft';
        // this.originalEndTarget = x + this.width || this.getOuterWidth(this.element) - this[endMargin] || this.element.style[endMargin];
        this.originalEndTarget = x + this.width - this[endMargin];

        // this.updateTarget();
        this.renderPosition(x);
    };

    proto.updateTarget = function () {
        var startMarginProperty = this.parent.originSide == 'left' ? 'marginLeft' : 'marginRight';
        var endMarginProperty = this.parent.originSide == 'left' ? 'marginRight' : 'marginLeft';
        // // this.target = this.originalTarget + this[marginProperty] + this.width * this.parent.cardAlign;

        if (this.parent.wrapAround) {
            // 
        }
        else {
            var lastCardOfSlide = this.parent.cards[this.lastIndexOfCardSlide];

            var cardAlign = this.parent.cardAlign;
            // if (lastCardOfSlide[endMarginProperty]) debugger;
            var correctionAlignMargin = cardAlign < 1 ? this[startMarginProperty] 
                                                        : lastCardOfSlide[endMarginProperty];
            // this.target = this.originalTarget + this[marginProperty] + 
            //               (this.parent.cards[this.lastIndexOfCardSlide].originalEndTarget 
            //               - this.originalTarget) * this.parent.cardAlign;
            // this.target = this.originalTarget +
            //     (this.parent.cards[this.lastIndexOfCardSlide].originalEndTarget
            //         - this.originalTarget) * this.parent.cardAlign;
            this.target = this.originalTarget 
                         + (lastCardOfSlide.originalEndTarget + correctionAlignMargin - this.originalTarget)
                         * this.parent.cardAlign;
        }
    };
    proto.getDistanceFromStart = function () {
        var parent = this.parent,
            isRightToLeft = parent.options.rightToLeft,
            sliderStartPosition = getPosition(parent.slider, isRightToLeft).start,
            cardStartPosition = getPosition(this.element, isRightToLeft).start,
            startMargin = this.parent.originSide == 'left' ? 'marginLeft' : 'marginRight';

        return Math.abs(sliderStartPosition - cardStartPosition) - this[startMargin];
    };
    proto.updateLastIndexOfCardSlide = function (index) {
        this.lastIndexOfCardSlide = index;

        this.updateTarget();
    };
    proto.select = function () {
        this.element.classList.add('is-selected');
        // this.element.removeAttribute('aria-hidden');
    };
    proto.unselect = function () {
        this.element.classList.remove('is-selected');
        // this.element.setAttribute( 'aria-hidden', 'true' );
    };
    proto.renderPosition = function (x) {
        if (!this.parent.options.fade) {
            return;
        }
        this.element.style.position = 'absolute';
        // render position of card with in slider
        var side = this.parent.originSide;
        // this.element.style[ side ] = this.parent.getPositionValue( x );
        this.element.style[side] = Math.round(x) + 'px';
    };
    proto.getUsefulSizes = function () {
        // this.getWidth();
        // this.getHeight();
        // this.getMargins();
        var size = this.getSize(this.element);
        this.width = size.outerWidth;
        this.height = size.outerHeight;
        this.marginLeft = size.marginLeft;
        this.marginRight = size.marginRight;
    };
    // proto.getWidth = function () {
    //   this.width = this.getOuterWidth(this.element)
    // };
    // proto.getHeight = function () {
    //   this.height = this.getOuterHeight(this.element)
    // };
    // proto.getMargins = function () {
    //   var size = this.getSize();
    //   this.marginLeft = size.marginLeft;
    //   this.marginRight = size.marginRight;
    // };

    return Card;
});

// FCarousel main
(function (window, factory) {
    var _FCarousel = window.FCarousel;

    window.FCarousel = factory(
        window,
        window.EvEmitter,
        window.getPosition,
        window.getElemSize,
        _FCarousel.Card,
        _FCarousel.animatePrototype,
        window.utils
    );
})(window, function factory(window, EvEmitter, getPosition, getElemSize, Card, animatePrototype, utils) {

    // -------------------------- FCarousel -------------------------- //
    // globally unique identifiers
    var GUID = 0;
    // internal store of all FCarousel intances
    var instances = {};

    var FCarousel = function (element, options) {
        this.element = element;

        // do not initialize twice on same element
        if (this.element.fCarouselGUID) {
            var instance = instances[this.element.fCarouselGUID];
            instance.option(options);
            return instance;
        }

        var setting = JSON.parse(element.dataset.carousel),
            defaults = $.extend({}, this.constructor.defaults);
        this.options = $.extend(defaults, setting);
        this._create();
    };
    FCarousel.defaults = {
        cardAlign: "right",
        rightToLeft: true,
        friction: 0.28,          // friction when selecting
        freeScrollFriction: 0.075, // friction when free-scrolling
        selectedAttraction: 0.025,
        discretePlacement: true,
        wrapAround: false,
        // scrollbar: false,
        scrollbarMutualControl: true,
        contain: true,
        step: 1,
        initialIndex: 0
        // nonUniSize: false,
        // accessibility: true,
        // adaptiveHeight: false,
        // setGallerySize: true,
        // cardSelector: undefined
    };
    FCarousel.selectors = {
        viewport: ".slider-cards-container",
        slider: ".f-carousel-items",
        cards: ".card",
    };

    FCarousel.createMethods = [];

    var proto = FCarousel.prototype;

    // inherit EventEmitter
    $.extend(proto, EvEmitter.prototype);
    $.extend(proto, getElemSize.prototype);

    proto.option = function (opts) {
        // $.extend(this.option, opts);
        $.extend(this.options, opts);
    };
    proto._create = function () {
        // add id for FCarousel.data
        var id = this.guid = ++GUID;
        this.element.fCarouselGUID = id; // expando
        instances[id] = this; // associate via id

        // this.selectedIndex = this.constructor.defaults.initialIndex || 0;
        // this.selectedIndex = this.options.initialIndex || 0;
        this.selectedIndex = +this.options.initialIndex || 0;
        // how many frames slider has been in same position
        this.restingFrames = 0;
        // initial physics properties
        this.x = 0;
        this.velocity = 0;
        this.originSide = this.options.rightToLeft ? 'right' : 'left';

        // this.handles = [];

        // this.viewport = $(this.element).find(this.constructor.selectors.viewport)[0];
        // this.slider = this.addSlider();
        // this.cards = this.addCards();
        this.addViewport();
        this.addSlider();
        this.identifyCards();

        window.addEventListener('resize', this);
        this.element.addEventListener('changeDisplay', this);

        FCarousel.createMethods.forEach(function (method) {
            this[method]();
        }, this);

        this.activate();
    };
    proto.activate = function () {
        if (this.isActive) {
            return;
        }
        this.isActive = true;

        this.updateViewportWidth();
        this.setCardAlign();
        // this.updateSliderWidth();
        this.positionCards();
        this.setGallerySize();

        this.element.tabIndex = 0;
        if (this.options.accessibility) {
            // allow element to focusable
            this.element.tabIndex = 0;
            // listen for key presses
            this.element.addEventListener("keydown", this);
        }

        this.emitEvent("activate");
        this.selectInitialIndex();
        // flag for initial activation, for using initialIndex
        this.isInitActivated = true;
        // // ready event. #493
        // this.dispatchEvent('ready');
    };
    proto.addViewport = function () {
        var selector = this.constructor.selectors.viewport,
            viewportElem = $(this.element).find(selector)[0];
        this.viewport = viewportElem;
    };
    proto.addSlider = function () {
        var selector = this.constructor.selectors.slider,
            sliderElem = $(this.element).find(selector)[0];
        this.slider = sliderElem;
    };

    var cardAlignShorthands = {
        // card align, then based on origin side
        center: {
            left: 0.5,
            right: 0.5
        },
        left: {
            left: 0,
            right: 1
        },
        right: {
            right: 0,
            left: 1
        }
    };

    proto.setCardAlign = function () {
        var shorthand = cardAlignShorthands[this.options.cardAlign];
        this.cardAlign = shorthand[this.originSide];
        this.cursorPosition = this.viewportWidth * this.cardAlign;
    };
    proto.setGallerySize = function () {
        if (this.options.setGallerySize || this.options.fade) {
            var height = this.options.adaptiveHeight && this.selectedStaticSlide ?
                this.selectedStaticSlide.height : this.maxCardHeight;
            this.viewport.style.height = height + 'px';
        }
    };
    proto.identifyCards = function () {
        var selector = this.constructor.selectors.cards,
            // cardElems = $(this.element).find(selector),
            cardElems = $(this.slider).find(selector),
            _this = this;

        // get cards from children
        // this.cards = Array.from(cardElems).map(function (elem) {
        this.cards = utils.makeArray(cardElems).map(function (elem) {
            return new Card(elem, _this);
        });
    };
    proto.reloadCards = function () {
        // updateCards
        // this.identifyCards();
    };
    proto.updateViewportWidth = function () {
        this.viewportWidth = this.getInnerWidth(this.viewport);
    };
    proto.updateSliderWidth = function () {
        // this.slideableWidth = this.getSliderWidth();
        // this.slideableWidth = this.slider.scrollWidth;
        
        var lastCard = this.cards.length && this.cards[this.cards.length - 1],
            endMarginProperty = this.originSide == 'left' ? 'marginRight' : 'marginLeft',
            lCardEndMargin = lastCard ? lastCard[endMarginProperty] : 0;
        // this.slideableWidth = lastCard ? lastCard.originalTarget + lastCard.width + lCardEndMargin : 0;
        this.slideableWidth = lastCard ? lastCard.originalEndTarget + lCardEndMargin : 0;
    };
    // proto.getSliderWidth = function () {
    //   // var isRtl = this.options.rightToLeft;
    //   // var beginPadding = isRtl ? 'paddingRight' : 'paddingLeft';
    //   // return this.slider.scrollWidth - this.getSize(this.slider)[ beginPadding ];
    //   return this.slider.scrollWidth;
    // };

    // ----- contain ----- //
    // contain card targets so no excess sliding
    proto._containSlides = function () {
        if (!this.options.contain || this.options.wrapAround || !this.cards.length || this.options.fade) {
            return;
        }
        // var isRtl = this.options.rightToLeft,
            // beginMargin = isRtl ? 'marginRight' : 'marginLeft',
            // endMargin = isRtl ? 'marginLeft' : 'marginRight',
            // firstCardStartMargin = this.cards[0][beginMargin],
            // lastCardEndMargin = this.cards[this.cards.length - 1][endMargin],
            // contentWidth = this.slideableWidth - lastCardEndMargin;
        var contentWidth = this.slideableWidth,
            isContentSmaller = contentWidth < this.viewportWidth;

        if (!isContentSmaller) {
            // content is less than gallery size
            var lastSelectableCard = this.cards[this.lastIndex];
            // lastSelectableCard.originalTarget = contentWidth - this.viewportWidth;
            lastSelectableCard.target = contentWidth - this.viewportWidth + this.cursorPosition;
            this.cards[0].target = this.cursorPosition;
        }
    };

    // proto.getViewportSizeForSameCards = function () {
    //     if (this.cards.length < 2) {
    //         return 1;
    //     }
    //     var isRtl = this.options.rightToLeft,
    //         fCardPos = getPosition(this.cards[0].element, isRtl),
    //         sCardPos = getPosition(this.cards[1].element, isRtl),
    //         cardsDistance_ptp = Math.abs(sCardPos.start - fCardPos.start),
    //         cardsDistance_trgt = Math.abs(this.cards[1].originalTarget - this.cards[0].originalTarget),
    //         cardsDistance = Math.max(cardsDistance_ptp, cardsDistance_trgt),
    //         slideLength = Math.floor(this.viewportWidth / cardsDistance);

    //     return slideLength > 0 ? slideLength : 1;
    // };

    proto.updateLastSelectableIndex = function () {
        // این فانکشن آخرین ایندکسی که امکان انتخاب (select) شدن را دارد به ما می دهد.
        var lastIndex;
        // if (!this.options.nonUniSize) {
        //   // lastIndex = this.cards.length - this.slideCardsLength;
        //   lastIndex = this.cards.length - this.getViewportSizeForSameCards();
        //   lastIndex = lastIndex < 0 ? 0 : lastIndex;
        // }
        // else {
        var len = this.cards.length;
        for (var i = 0; i < len; i++) {
            var card = this.cards[i];
            if (card.lastIndexOfCardSlide == len - 1) {
                lastIndex = i;
                break;
            }
        }
        // }
        this.lastIndex = lastIndex;
    };

    proto.updateSlides = function () {
        // این فانکشن برای هر کارت در صورتی که آن کارت در موقعیت ابتدای کاروسل قرار گرفته باشد آخرین ایندکسی که در کادر اسلایدر به طور کامل جا می شوند را محاسبه می کند و سپس از این اطلاعات هم برای محاسبه آخرین ایندکس قابل انتخاب شدن در بین تمام کارتها استفاده می کند
        var len = this.cards.length;
        // if (!this.options.nonUniSize) {
        //   // در این حالت تعداد کارت هایی که در کادر اسلایدر به طور کامل جا می شوند را  بر اساس فاصله دو کارت اول کاروسل محاسبه می کند
        //   var viewportSize = this.getViewportSizeForSameCards();
        //   for (var i = 0; i < len; i++) {
        //     var index = Math.min(i + viewportSize - 1, len - 1)
        //     this.cards[i].updateLastIndexOfCardSlide(index);
        //   }
        // }
        // else {
        for (var i = 0; i < len; i++) {
            var lastIndexOfSlide = i,
                startCard = this.cards[i],
                cardElemsWidth = startCard.originalEndTarget - startCard.originalTarget;

            if (i + 1 < len && cardElemsWidth <= this.viewportWidth) {
                for (var j = i + 1; j < len; j++) {
                    cardElemsWidth = this.cards[j].originalEndTarget - startCard.originalTarget;
                    if (cardElemsWidth > this.viewportWidth) {
                        lastIndexOfSlide = j - 1;
                        break;
                    }
                    else if (j == len - 1) {
                        lastIndexOfSlide = j;
                    }
                }
            }
            startCard.updateLastIndexOfCardSlide(lastIndexOfSlide);
        }
        // }
        this.updateLastSelectableIndex();
        this.updateStaticSlideStartCardIndexes();
    };

    // -----  ----- //

    /**
    * emits events via eventEmitter and jQuery events
    * @param {String} type - name of event
    * @param {Event} event - original event
    * @param {Array} args - extra arguments
    */
    proto.dispatchEvent = function (type, event, args) {
        var emitArgs = event ? [event].concat(args) : args;
        this.emitEvent(type, emitArgs);

        // if ( jQuery && this.$element ) {
        //   // default trigger with type if no event
        //   type += this.options.namespaceJQueryEvents ? '.fCarousel' : '';
        //   var $event = type;
        //   if ( event ) {
        //     // create jQuery event
        //     var jQEvent = jQuery.Event( event );
        //     jQEvent.type = type;
        //     $event = jQEvent;
        //   }
        //   this.$element.trigger( $event, args );
        // }
    };

    proto.getIndexInRange = function (index) {
        index = parseInt(+index) || 0;
        index = Math.min(this.lastIndex, index);
        index = Math.max(0, index);
        return index;
    };

    proto.select = function (slideIndex, isWrap, isInstant) {
        if (this.options.wrapAround || isWrap) {
            // slideIndex = utils.modulo(slideIndex, this.cards.length);
            slideIndex = utils.modulo(slideIndex, this.lastIndex + 1);
        } else {
            slideIndex = this.getIndexInRange(slideIndex);
        }

        // bail if invalid index
        if (!this.cards[slideIndex]) {
            return;
        }

        var prevIndex = this.selectedIndex;
        this.selectedIndex = slideIndex;
        this.updateSelectedCard();
        this.updateInViewportCards();
        if (isInstant) {
            this.positionSliderAtSelected();
        } else {
            this.startAnimation();
        }

        // if ( this.options.adaptiveHeight ) {
        //   this.setGallerySize();
        // }
        // events
        this.dispatchEvent('select', null, [slideIndex]);
        // change event if new index
        if (slideIndex != prevIndex) {
            this.dispatchEvent('change', null, [slideIndex]);
        }
    };
    proto.prev = function (isWrap, isInstant) {
        var slctdIndx = this.selectedIndex;
        var step = +this.options.step ||
            (this.options.step == "p" ? this.getCurrentOrPreviousSlideCardsLength(slctdIndx, true) : 1);
        var index = slctdIndx - step;
        this.select(index, isWrap, isInstant);
    };
    proto.next = function (isWrap, isInstant) {
        var slctdIndx = this.selectedIndex;
        var step = +this.options.step ||
            (this.options.step == "p" ? this.getCurrentOrPreviousSlideCardsLength(slctdIndx) : 1);
        var index = slctdIndx + step;
        this.select(index, isWrap, isInstant);
    };
    proto.updateSelectedCard = function () {
        var card = this.cards[this.selectedIndex];
        if (!card) {
            return;
        }
        // unselect previous selected card
        this.unselectSelectedCard();
        // update new selected card
        this.selectedCard = card;
        card.select();
    };
    proto.updateInViewportCards = function () {
        var cardElems = [];
        // if (this.isPointerDown || this.isFreeScrolling) {
        //   // ....
        //   // this.inViewportCards = cardElems;
        //   // return;
        // }

        var selectedIndex = this.selectedIndex,
            len = this.cards.length,
            fCInVpT = this.cards[selectedIndex].originalTarget;   // originalTarget of first card in viewport

        for (var i = selectedIndex; i < len; i++) {
            var card = this.cards[i],
                cardElemsWidth = card.originalEndTarget - fCInVpT;
            if (cardElemsWidth <= this.viewportWidth || i == selectedIndex || selectedIndex == this.lastIndex) {
                cardElems = cardElems.concat(card);
            }
            else {
                break;
            }
        }
        this.inViewportCards = cardElems;
    };
    proto.getCurrentOrPreviousSlideCardsLength = function (index, isPreviousPageSlide) {
        // get length of cards for which slide that 
        // starts with 'card[index]' or slide which ends by 'card[index - 1]'
        if (isPreviousPageSlide) {
            var len = this.cards.length;
            for (var i = 0; i < len; i++) {
                var card = this.cards[i];
                if (card.lastIndexOfCardSlide >= index) {
                    return index - i + 1;
                }
            }
        }
        else {
            return this.cards[index].lastIndexOfCardSlide - index + 1;
        }
    };
    proto.unselectSelectedCard = function () {
        if (this.selectedCard) {
            this.selectedCard.unselect();
        }
    };
    proto.selectInitialIndex = function () {
        var initialIndex = this.options.initialIndex;
        // already activated, select previous selectedIndex
        if (this.isInitActivated) {
            this.select(this.selectedIndex, false, true);
            return;
        }
        // select with selector string
        if (initialIndex && typeof initialIndex == 'string') {
            var card = this.queryCard(initialIndex);
            if (card) {
                this.selectCard(initialIndex, false, true);
                return;
            }
        }
        // select with number
        initialIndex = this.getIndexInRange(this.options.initialIndex);
        // select instantly
        this.select(initialIndex, false, true);
    };
    proto.selectCard = function (value, isWrap, isInstant) {
        // get card
        var card = this.queryCard(value);
        if (!card) {
            return;
        }
        var index = this.cards.indexOf(card);
        this.select(index, isWrap, isInstant);
    };
    /**
        * select card from number or card element
        * @param {Element, Selector String, or Number} selector
        */
    proto.queryCard = function (selector) {
        if (typeof selector == 'number') {
            return this.cards[selector];
        }
        if (typeof selector == 'string') {
            // use string as selector, get element
            cardElem = $(this.element).find(selector + this.constructor.selectors.cards)[0];
        }
        // get card from element
        return this.getCard(cardElem);
    };
    proto.getCard = function (elem) {
        // loop through cards to get the one that matches
        for (var i = 0; i < this.cards.length; i++) {
            var card = this.cards[i];
            if (card.element == elem) {
                return card;
            }
        }
    };
    // proto.getCardIndex = function( card ) {
    //   // get index of card
    //   // for ( var i=0; i < this.cards.length; i++ ) {
    //   //   if ( this.cards[i] == card ) {
    //   //     return i;
    //   //   }
    //   // }
    //   this.cards.indexOf(card);
    // };
    /**
        * get card elements
        * @returns {Array} cardElems
        */
    proto.getCardElements = function () {
        return this.cards.map(function (card) {
            return card.element;
        });
    };
    /**
        * get parent card from an element
        * @param {Element} elem
        * @returns {FCarousel.Card} card
        */
    proto.getParentCard = function (elem) {
        // first check if elem is card
        var card = this.getCard(elem);
        if (card) {
            return card;
        }
        // try to get parent card elem
        elem = $(elem).parents(this.constructor.selectors.cards)[0];
        return this.getCard(elem);
    };
    /**
        * get cards adjacent to a slide
        * @param {Integer} adjCount - number of adjacent slides
        * @param {Integer} index - index of slide to start
        * @returns {Array} cards - array of Flickity.Cards
        */
    proto.getAdjacentCardElements = function (adjCount, index) {
        adjCount = adjCount || 0;
        index = index === undefined ? this.selectedIndex : index;

        var cLen = this.cards.length,
            iVpCLen = this.inViewportCards.length;
        if (iVpCLen + (adjCount * 2) >= cLen) {
            return this.getCardElements();
        }

        var cardElems = [];

        if (this.staticSlides) {
            var staticSlide = this.staticSlides[index];
            index = this.cards.indexOf(staticSlide.cards[0]);
        }

        var startIndex = index - adjCount,
            endIndex = index + iVpCLen - 1 + adjCount;
        startIndex = this.options.wrapAround ? utils.modulo(startIndex, cLen) : Math.max(startIndex, 0);
        endIndex = this.options.wrapAround ? utils.modulo(endIndex, cLen) : Math.min(endIndex, cLen - 1);

        for (var i = startIndex; i <= endIndex; i++) {
            var card = this.cards[i];
            cardElems = cardElems.concat(card.element);
        }
        return cardElems;
    };

    proto.updateStaticSlideStartCardIndexes = function () {
        var stSlSt_arr = [],
            lastIndex = this.lastIndex,
            step = this.options.step !== "p" ? Math.max(parseInt(this.options.step), 1) : "p";

        if (step === "p") {
            var index = 0;
            while (index <= lastIndex) {
                stSlSt_arr.push(index);
                index = this.cards[index].lastIndexOfCardSlide + 1;
            }
        }
        else {
            stSlSt_arr = this.cards.map(function (card, i) {
                return i;
            }).filter(function (i) {
                return i <= lastIndex && i % step === 0;
            });
        }
        if (stSlSt_arr.indexOf(lastIndex) < 0) {
            stSlSt_arr.push(lastIndex);
        }

        this.staticSlidesStartIndexes = stSlSt_arr;
    };

    // -------------------------- events -------------------------- //
    proto.uiChange = function () {
        this.emitEvent('uiChange');
    };

    // keep focus on element when child UI elements are clicked
    proto.childUIPointerDown = function(event) {
      // HACK iOS does not allow touch events to bubble up?!
      if (event.type != 'touchstart') {
        event.preventDefault();
      }
      this.focus();
    };

    // ----- resize ----- //
    proto.onresize = function () {
        this.resize();
    };
    proto.onchangeDisplay = function () {
        this.resize();
    };

    // utils.debounceMethod( FCarousel, 'onresize', 150 );
    utils.debounceMethod(FCarousel, 'onresize', 0);

    proto.resize = function () {
        if (!this.isActive) {
            return;
        }
        this.updateViewportWidth();
        this.cursorPosition = this.viewportWidth * this.cardAlign;
        this.positionCards();
        // this.updateSliderWidth();
        // wrap values
        // if ( this.options.wrapAround ) {
        //   this.x = utils.modulo( this.x, this.slideableWidth );
        // }
        // this._getWrapShiftCards();
        this.setGallerySize();

        this.emitEvent('resize');

        // // update selected index for group slides, instant
        // // TODO: position can be lost between groups of various numbers
        // var selectedElement = this.selectedElements && this.selectedElements[0];
        // this.selectCard( selectedElement, false, true );
        this.select(this.selectedIndex, false, true);
    };

    proto.updateCardsSize = function (cards) {
        // for (var i=0; i < this.cards.length; i++) {
        //   var card = this.cards[i];
        //   card.getUsefulSizes();
        // }
        cards.forEach(function (card) {
            card.getUsefulSizes();
        });
    };

    // positions all cards
    proto.positionCards = function () {
        // size all cards
        this.updateCardsSize(this.cards);
        // position all cards
        this._positionCards(0);
    };

    proto._positionCards = function (index) {
        index = index || 0;
        // also measure maxCardHeight
        // start 0 if positioning all cards
        this.maxCardHeight = index ? this.maxCardHeight || 0 : 0;
        var cardX = 0;

        // get startCardX
        if (index > 0) {
            // محاسبه تارگت کارت شروع (در صورتی که این کارت اولین کارت اسلایدر نباشد) بر
            // مبنای تارگت کارت قبلی خود و یا بر مبنای موقعیت خودش (در صورتی که همه ی کارتها به ترتیب
            // در موقعیت پشت سر هم قرار گرفته باشند)
            var card = this.cards[index],
                startCard = this.cards[index - 1],  // the 'startCard' here is actually the prior card
                cardX_exact = startCard.originalTarget + startCard.width,
                cardX_pointToPoint = card.getDistanceFromStart();
            cardX = this.options.fade ? cardX_exact : cardX_pointToPoint;
        }

        var len = this.cards.length;
        for (var i = index; i < len; i++) {
            var card = this.cards[i],
                nextCard = this.cards[i + 1],
                nextCardDistance;

            card.setPosition(cardX);

            nextCardDistance = nextCard ? nextCard.getDistanceFromStart() - card.originalTarget : 0;
            cardX += this.options.fade ? card.width : nextCardDistance;

            this.maxCardHeight = Math.max(card.height, this.maxCardHeight);
        }

        // if (this.options.nonUniSize) {
        this.updateSlides();
        // }

        // // keep track of cardX (all carousel cards width) for wrap-around
        // var lastCard = this.cards[this.cards.length - 1];
        // this.slideableWidth = lastCard ? lastCard.originalTarget + lastCard.width : 0;

        this.updateSliderWidth();

        // contain slides target
        this._containSlides();
    };

    // ----- focus ----- //
    proto.focus = function () {
        // TODO remove scrollTo once focus options gets more support
        // https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/focus#Browser_compatibility
        var prevScrollY = window.pageYOffset;
        this.element.focus({ preventScroll: true });
        // hack to fix scroll jump after focus, #76
        if (window.pageYOffset != prevScrollY) {
            window.scrollTo(window.pageXOffset, prevScrollY);
        }
    };

    // -------------------------- prototype -------------------------- //
    $.extend(proto, animatePrototype);

    // -------------------------- extras -------------------------- //
    /**
        * get FCarousel instance from element
        * @param {Element} elem
        * @returns {FCarousel}
        */
    FCarousel.data = function (elem) {
        elem = utils.getQueryElement(elem);
        var id = elem && elem.fCarouselGUID;
        return id && instances[id];
    };


    FCarousel.Card = Card;
    return FCarousel;
});

/*!
 * Unipointer v2.3.0
 * base class for doing one thing with pointer event
 * MIT license
 */
/*jshint browser: true, undef: true, unused: true, strict: true */
(function (window, factory) {
    // universal module definition
    /* jshint strict: false */ /*global define, module, require */
    if (typeof define == 'function' && define.amd) {
        // AMD
        define('unipointer/unipointer', [
            'ev-emitter/ev-emitter'
        ], function (EvEmitter) {
            return factory(window, EvEmitter);
        });
    } else if (typeof module == 'object' && module.exports) {
        // CommonJS
        module.exports = factory(
            window,
            require('ev-emitter')
        );
    } else {
        // browser global
        window.Unipointer = factory(
            window,
            window.EvEmitter
        );
    }

}(window, function factory(window, EvEmitter) {

    function noop() { }

    function Unipointer() { }

    // inherit EvEmitter
    var proto = Unipointer.prototype = Object.create(EvEmitter.prototype);

    proto.bindStartEvent = function (elem) {
        this._bindStartEvent(elem, true);
    };

    proto.unbindStartEvent = function (elem) {
        this._bindStartEvent(elem, false);
    };

    /**
     * Add or remove start event
     * @param {Boolean} isAdd - remove if falsey
     */
    proto._bindStartEvent = function (elem, isAdd) {
        // munge isAdd, default to true
        isAdd = isAdd === undefined ? true : isAdd;
        var bindMethod = isAdd ? 'addEventListener' : 'removeEventListener';

        // default to mouse events
        var startEvent = 'mousedown';
        if (window.PointerEvent) {
            // Pointer Events
            startEvent = 'pointerdown';
        } else if ('ontouchstart' in window) {
            // Touch Events. iOS Safari
            startEvent = 'touchstart';
        }
        elem[bindMethod](startEvent, this);
    };

    // trigger handler methods for events
    proto.handleEvent = function (event) {
        var method = 'on' + event.type;
        if (this[method]) {
            this[method](event);
        }
    };

    // returns the touch that we're keeping track of
    proto.getTouch = function (touches) {
        for (var i = 0; i < touches.length; i++) {
            var touch = touches[i];
            if (touch.identifier == this.pointerIdentifier) {
                return touch;
            }
        }
    };

    // ----- start event ----- //

    proto.onmousedown = function (event) {
        // dismiss clicks from right or middle buttons
        var button = event.button;
        if (button && (button !== 0 && button !== 1)) {
            return;
        }
        this._pointerDown(event, event);
    };

    proto.ontouchstart = function (event) {
        this._pointerDown(event, event.changedTouches[0]);
    };

    proto.onpointerdown = function (event) {
        this._pointerDown(event, event);
    };

    /**
     * pointer start
     * @param {Event} event
     * @param {Event or Touch} pointer
     */
    proto._pointerDown = function (event, pointer) {
        // dismiss right click and other pointers
        // button = 0 is okay, 1-4 not
        if (event.button || this.isPointerDown) {
            return;
        }

        this.isPointerDown = true;
        // save pointer identifier to match up touch events
        this.pointerIdentifier = pointer.pointerId !== undefined ?
            // pointerId for pointer events, touch.indentifier for touch events
            pointer.pointerId : pointer.identifier;
        this.pointerDown(event, pointer);
    };

    proto.pointerDown = function (event, pointer) {
        this._bindPostStartEvents(event);
        this.emitEvent('pointerDown', [event, pointer]);
    };

    // hash of events to be bound after start event
    var postStartEvents = {
        mousedown: ['mousemove', 'mouseup'],
        touchstart: ['touchmove', 'touchend', 'touchcancel'],
        pointerdown: ['pointermove', 'pointerup', 'pointercancel'],
    };

    proto._bindPostStartEvents = function (event) {
        if (!event) {
            return;
        }
        // get proper events to match start event
        var events = postStartEvents[event.type];
        // bind events to node
        events.forEach(function (eventName) {
            window.addEventListener(eventName, this);
        }, this);
        // save these arguments
        this._boundPointerEvents = events;
    };

    proto._unbindPostStartEvents = function () {
        // check for _boundEvents, in case dragEnd triggered twice (old IE8 bug)
        if (!this._boundPointerEvents) {
            return;
        }
        this._boundPointerEvents.forEach(function (eventName) {
            window.removeEventListener(eventName, this);
        }, this);

        delete this._boundPointerEvents;
    };

    // ----- move event ----- //

    proto.onmousemove = function (event) {
        this._pointerMove(event, event);
    };

    proto.onpointermove = function (event) {
        if (event.pointerId == this.pointerIdentifier) {
            this._pointerMove(event, event);
        }
    };

    proto.ontouchmove = function (event) {
        var touch = this.getTouch(event.changedTouches);
        if (touch) {
            this._pointerMove(event, touch);
        }
    };

    /**
     * pointer move
     * @param {Event} event
     * @param {Event or Touch} pointer
     * @private
     */
    proto._pointerMove = function (event, pointer) {
        this.pointerMove(event, pointer);
    };

    // public
    proto.pointerMove = function (event, pointer) {
        this.emitEvent('pointerMove', [event, pointer]);
    };

    // ----- end event ----- //


    proto.onmouseup = function (event) {
        this._pointerUp(event, event);
    };

    proto.onpointerup = function (event) {
        if (event.pointerId == this.pointerIdentifier) {
            this._pointerUp(event, event);
        }
    };

    proto.ontouchend = function (event) {
        var touch = this.getTouch(event.changedTouches);
        if (touch) {
            this._pointerUp(event, touch);
        }
    };

    /**
     * pointer up
     * @param {Event} event
     * @param {Event or Touch} pointer
     * @private
     */
    proto._pointerUp = function (event, pointer) {
        this._pointerDone();
        this.pointerUp(event, pointer);
    };

    // public
    proto.pointerUp = function (event, pointer) {
        this.emitEvent('pointerUp', [event, pointer]);
    };

    // ----- pointer done ----- //

    // triggered on pointer up & pointer cancel
    proto._pointerDone = function () {
        this._pointerReset();
        this._unbindPostStartEvents();
        this.pointerDone();
    };

    proto._pointerReset = function () {
        // reset properties
        this.isPointerDown = false;
        delete this.pointerIdentifier;
    };

    proto.pointerDone = noop;

    // ----- pointer cancel ----- //

    proto.onpointercancel = function (event) {
        if (event.pointerId == this.pointerIdentifier) {
            this._pointerCancel(event, event);
        }
    };

    proto.ontouchcancel = function (event) {
        var touch = this.getTouch(event.changedTouches);
        if (touch) {
            this._pointerCancel(event, touch);
        }
    };

    /**
     * pointer cancel
     * @param {Event} event
     * @param {Event or Touch} pointer
     * @private
     */
    proto._pointerCancel = function (event, pointer) {
        this._pointerDone();
        this.pointerCancel(event, pointer);
    };

    // public
    proto.pointerCancel = function (event, pointer) {
        this.emitEvent('pointerCancel', [event, pointer]);
    };

    // -----  ----- //

    // utility function for getting x/y coords from event
    Unipointer.getPointerPoint = function (pointer) {
        return {
            x: pointer.pageX,
            y: pointer.pageY
        };
    };

    // -----  ----- //

    return Unipointer;

}));

/*!
 * Unidragger v2.3.0
 * Draggable base class
 * MIT license
 */
/*jshint browser: true, unused: true, undef: true, strict: true */
(function (window, factory) {
    // universal module definition
    /*jshint strict: false */ /*globals define, module, require */

    if (typeof define == 'function' && define.amd) {
        // AMD
        define('unidragger/unidragger', [
            'unipointer/unipointer'
        ], function (Unipointer) {
            return factory(window, Unipointer);
        });
    } else if (typeof module == 'object' && module.exports) {
        // CommonJS
        module.exports = factory(
            window,
            require('unipointer')
        );
    } else {
        // browser global
        window.Unidragger = factory(
            window,
            window.Unipointer
        );
    }

}(window, function factory(window, Unipointer) {

    // -------------------------- Unidragger -------------------------- //

    function Unidragger() { }

    // inherit Unipointer & EvEmitter
    var proto = Unidragger.prototype = Object.create(Unipointer.prototype);

    // ----- bind start ----- //

    proto.bindHandles = function () {
        this._bindHandles(true);
    };

    proto.unbindHandles = function () {
        this._bindHandles(false);
    };

    /**
     * Add or remove start event
     * @param {Boolean} isAdd
     */
    proto._bindHandles = function (isAdd) {
        // munge isAdd, default to true
        isAdd = isAdd === undefined ? true : isAdd;
        // bind each handle
        var bindMethod = isAdd ? 'addEventListener' : 'removeEventListener';
        var touchAction = isAdd ? this._touchActionValue : '';
        for (var i = 0; i < this.handles.length; i++) {
            var handle = this.handles[i];
            this._bindStartEvent(handle, isAdd);
            handle[bindMethod]('click', this);
            // touch-action: none to override browser touch gestures.
            if (window.PointerEvent) {
                handle.style.touchAction = touchAction;
            }
        }
    };

    // prototype so it can be overwriteable
    proto._touchActionValue = 'none';

    // ----- start event ----- //

    /**
     * pointer start
     * @param {Event} event
     * @param {Event or Touch} pointer
     */
    proto.pointerDown = function (event, pointer) {
        var isOkay = this.okayPointerDown(event);
        if (!isOkay) {
            return;
        }
        // track start event position
        this.pointerDownPointer = pointer;

        event.preventDefault();
        this.pointerDownBlur();
        // bind move and end events
        this._bindPostStartEvents(event);
        this.emitEvent('pointerDown', [event, pointer]);
    };

    // nodes that have text fields
    var cursorNodes = {
        TEXTAREA: true,
        INPUT: true,
        SELECT: true,
        OPTION: true,
    };

    // input types that do not have text fields
    var clickTypes = {
        radio: true,
        checkbox: true,
        button: true,
        submit: true,
        image: true,
        file: true,
    };

    // dismiss inputs with text fields.
    proto.okayPointerDown = function (event) {
        var isCursorNode = cursorNodes[event.target.nodeName];
        var isClickType = clickTypes[event.target.type];
        var isOkay = !isCursorNode || isClickType;
        if (!isOkay) {
            this._pointerReset();
        }
        return isOkay;
    };

    // kludge to blur previously focused input
    proto.pointerDownBlur = function () {
        var focused = document.activeElement;
        // do not blur body for IE10
        var canBlur = focused && focused.blur && focused != document.body;
        if (canBlur) {
            focused.blur();
        }
    };

    // ----- move event ----- //

    /**
     * drag move
     * @param {Event} event
     * @param {Event or Touch} pointer
     */
    proto.pointerMove = function (event, pointer) {
        var moveVector = this._dragPointerMove(event, pointer);
        this.emitEvent('pointerMove', [event, pointer, moveVector]);
        this._dragMove(event, pointer, moveVector);
    };

    // base pointer move logic
    proto._dragPointerMove = function (event, pointer) {
        var moveVector = {
            x: pointer.pageX - this.pointerDownPointer.pageX,
            y: pointer.pageY - this.pointerDownPointer.pageY
        };
        // start drag if pointer has moved far enough to start drag
        if (!this.isDragging && this.hasDragStarted(moveVector)) {
            this._dragStart(event, pointer);
        }
        return moveVector;
    };

    // condition if pointer has moved far enough to start drag
    proto.hasDragStarted = function (moveVector) {
        return Math.abs(moveVector.x) > 3 || Math.abs(moveVector.y) > 3;
    };

    // ----- end event ----- //

    /**
     * pointer up
     * @param {Event} event
     * @param {Event or Touch} pointer
     */
    proto.pointerUp = function (event, pointer) {
        this.emitEvent('pointerUp', [event, pointer]);
        this._dragPointerUp(event, pointer);
    };

    proto._dragPointerUp = function (event, pointer) {
        if (this.isDragging) {
            this._dragEnd(event, pointer);
        } else {
            // pointer didn't move enough for drag to start
            this._staticClick(event, pointer);
        }
    };

    // -------------------------- drag -------------------------- //

    // dragStart
    proto._dragStart = function (event, pointer) {
        this.isDragging = true;
        // prevent clicks
        this.isPreventingClicks = true;
        this.dragStart(event, pointer);
    };

    proto.dragStart = function (event, pointer) {
        this.emitEvent('dragStart', [event, pointer]);
    };

    // dragMove
    proto._dragMove = function (event, pointer, moveVector) {
        // do not drag if not dragging yet
        if (!this.isDragging) {
            return;
        }

        this.dragMove(event, pointer, moveVector);
    };

    proto.dragMove = function (event, pointer, moveVector) {
        event.preventDefault();
        this.emitEvent('dragMove', [event, pointer, moveVector]);
    };

    // dragEnd
    proto._dragEnd = function (event, pointer) {
        // set flags
        this.isDragging = false;
        // re-enable clicking async
        setTimeout(function () {
            delete this.isPreventingClicks;
        }.bind(this));

        this.dragEnd(event, pointer);
    };

    proto.dragEnd = function (event, pointer) {
        this.emitEvent('dragEnd', [event, pointer]);
    };

    // ----- onclick ----- //

    // handle all clicks and prevent clicks when dragging
    proto.onclick = function (event) {
        if (this.isPreventingClicks) {
            event.preventDefault();
        }
    };

    // ----- staticClick ----- //

    // triggered after pointer down & up with no/tiny movement
    proto._staticClick = function (event, pointer) {
        // ignore emulated mouse up clicks
        if (this.isIgnoringMouseUp && event.type == 'mouseup') {
            return;
        }

        this.staticClick(event, pointer);

        // set flag for emulated clicks 300ms after touchend
        if (event.type != 'mouseup') {
            this.isIgnoringMouseUp = true;
            // reset flag after 300ms
            setTimeout(function () {
                delete this.isIgnoringMouseUp;
            }.bind(this), 400);
        }
    };

    proto.staticClick = function (event, pointer) {
        this.emitEvent('staticClick', [event, pointer]);
    };

    // ----- utils ----- //

    Unidragger.getPointerPoint = Unipointer.getPointerPoint;

    // -----  ----- //

    return Unidragger;

}));

// drag
(function (window, factory) {
    window.FCarousel = factory(
        window,
        window.FCarousel,
        window.Unidragger
    );
})(window, function (window, FCarousel, Unidragger) {
    // ----- defaults ----- //
    $.extend(FCarousel.defaults, {
        draggable: ">1",
        dragThreshold: 3,
    });

    // ----- create ----- //
    FCarousel.createMethods.push("_createDrag");

    // -------------------------- drag prototype -------------------------- //
    var proto = FCarousel.prototype;
    $.extend(proto, Unidragger.prototype);
    proto._touchActionValue = 'pan-y';

    // --------------------------  -------------------------- //

    var isTouch = 'createTouch' in document;
    var isTouchmoveScrollCanceled = false;

    proto._createDrag = function () {
        this.on("activate", this.onActivateDrag);
        this.on('uiChange', this._uiChangeDrag);
        this.on('deactivate', this.onDeactivateDrag);

        if (isTouch && !isTouchmoveScrollCanceled) {
            window.addEventListener('touchmove', function () { });
            isTouchmoveScrollCanceled = true;
        }
    };
    proto.onActivateDrag = function () {
        this.handles = [this.viewport];
        // this.handles.push(this.viewport);
        this.bindHandles();
        this.updateDraggable();
    };
    proto.onDeactivateDrag = function () {
        this.unbindHandles();
        this.element.classList.remove('is-draggable');
    };
    proto.updateDraggable = function () {
        // disable dragging if less than 2 cards.
        if (this.options.draggable == ">1") {
            this.isDraggable = this.lastIndex > 1;
        } else {
            this.isDraggable = this.options.draggable;
        }

        if (this.isDraggable) {
            this.element.classList.add("is-draggable");

            if (window.CSS && window.CSS.supports && typeof window.CSS.supports === "function") {
                if (!window.CSS.supports("touch-action", "pan-y")) {
                    this.slider.classList.add('not-scrollable-children');
                }
            }

        } else {
            this.element.classList.remove("is-draggable");
        }
    };

    proto._uiChangeDrag = function () {
        delete this.isFreeScrolling;
    };

    // -------------------------- pointer events -------------------------- //

    proto.pointerDown = function (event, pointer) {
        if (!this.isDraggable) {
            this._pointerDownDefault(event, pointer);
            return;
        }
        var isOkay = this.okayPointerDown(event);
        if (!isOkay) {
            return;
        }

        this._pointerDownPreventDefault(event);
        this.pointerDownFocus(event);
        // blur
        if (document.activeElement != this.element) {
            // do not blur if already focused
            this.pointerDownBlur();
        }

        // stop if it was moving
        this.dragX = this.x;
        this.viewport.classList.add('is-pointer-down');
        // track scrolling
        this.pointerDownScroll = getScrollPosition();
        window.addEventListener('scroll', this);

        this._pointerDownDefault(event, pointer);
    };

    // default pointerDown logic, used for staticClick
    proto._pointerDownDefault = function (event, pointer) {
        // track start event position
        // Safari 9 overrides pageX and pageY. These values needs to be copied. #779
        this.pointerDownPointer = {
            pageX: pointer.pageX,
            pageY: pointer.pageY,
        };
        // bind move and end events
        this._bindPostStartEvents(event);
        this.dispatchEvent('pointerDown', event, [pointer]);
    };

    var focusNodes = {
        INPUT: true,
        TEXTAREA: true,
        SELECT: true,
    };

    proto.pointerDownFocus = function (event) {
        var isFocusNode = focusNodes[event.target.nodeName];
        if (!isFocusNode) {
            this.focus();
        }
    };

    proto._pointerDownPreventDefault = function (event) {
        var isTouchStart = event.type == 'touchstart';
        var isTouchPointer = event.pointerType == 'touch';
        var isFocusNode = focusNodes[event.target.nodeName];
        if (!isTouchStart && !isTouchPointer && !isFocusNode) {
            event.preventDefault();
        }
    };

    // ----- move ----- //

    proto.hasDragStarted = function (moveVector) {
        return Math.abs(moveVector.x) > this.options.dragThreshold;
    };

    // ----- up ----- //

    proto.pointerUp = function (event, pointer) {
        // delete this.isTouchScrolling;
        this.viewport.classList.remove('is-pointer-down');
        // this.dispatchEvent( 'pointerUp', event, [ pointer ] );
        this._dragPointerUp(event, pointer);
    };

    proto.pointerDone = function () {
        window.removeEventListener('scroll', this);
        delete this.pointerDownScroll;
    };

    // -------------------------- dragging -------------------------- //

    proto.companionDragEnd = function () {
        this.dragEnd();
    };

    proto.dragStart = function (event, pointer) {
        if (!this.isDraggable) {
            return;
        }
        this.element.classList.add("is-dragging");
        this.dragStartPosition = this.x;

        this.startAnimation();
        window.removeEventListener('scroll', this);
        // this.dispatchEvent( 'dragStart', event, [ pointer ] );
    };

    proto.pointerMove = function (event, pointer) {
        var moveVector = this._dragPointerMove(event, pointer);
        // this.dispatchEvent( 'pointerMove', event, [ pointer, moveVector ] );
        this._dragMove(event, pointer, moveVector);
    };

    proto.dragMove = function (event, pointer, moveVector) {
        if (!this.isDraggable) {
            return;
        }
        event.preventDefault();

        this.previousDragX = this.dragX;
        // reverse if right-to-left
        var direction = this.options.rightToLeft ? -1 : 1;
        if (this.options.wrapAround) {
            // wrap around move. #589
            moveVector.x = moveVector.x % this.slideableWidth;
        }
        var dragX = this.dragStartPosition + moveVector.x * direction;

        if (!this.options.wrapAround && this.cards.length) {
            // slow drag
            // var originBound = Math.max( -this.cards[0].originalTarget, this.dragStartPosition );
            var originBound = Math.max(-this.cards[0].target, this.dragStartPosition);
            dragX = dragX > originBound ? (dragX + originBound) * 0.5 : dragX;
            // var endBound = Math.min( -this.getLastSelectableCard().originalTarget, this.dragStartPosition );
            var endBound = Math.min(-this.cards[this.lastIndex].target, this.dragStartPosition);
            dragX = dragX < endBound ? (dragX + endBound) * 0.5 : dragX;
        }

        this.dragX = dragX;

        this.dragMoveTime = new Date();
        // this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
    };

    proto.dragEnd = function (event, pointer) {
        if (!this.isDraggable) {
            return;
        }
        if (this.options.freeScroll) {
            this.isFreeScrolling = true;
        }
        // set selectedIndex based on where carousel will end up
        var index = this.dragEndRestingSelect();

        if (this.options.freeScroll && !this.options.wrapAround) {
            // if free-scroll & not wrap around
            // do not free-scroll if going outside of bounding slides
            // so bounding slides can attract slider, and keep it in bounds
            var restingX = this.getRestingPosition();
            // this.isFreeScrolling = -restingX > this.cards[0].originalTarget && -restingX < this.getLastSelectableCard().originalTarget;
            this.isFreeScrolling = -restingX > this.cards[0].target && -restingX < this.cards[this.lastIndex].target;
        }
        else if (!this.options.freeScroll && index == this.selectedIndex) {
            // boost selection if selected index has not changed
            index += this.dragEndBoostSelect();
        }
        delete this.previousDragX;
        // apply selection
        // TODO refactor this, selecting here feels weird
        // HACK, set flag so dragging stays in correct direction
        this.isDragSelect = this.options.wrapAround;
        this.select(index);
        delete this.isDragSelect;

        setTimeout(function () {
            this.element.classList.remove("is-dragging");
        }.bind(this));

        this.dispatchEvent('dragEnd', event, [pointer]);
    };

    proto.dragEndRestingSelect = function () {
        var restingX = this.getRestingPosition();
        // how far away from selected slide
        var distance = Math.abs(this.getSlideDistance(-restingX, this.selectedIndex));
        // get closet resting going up and going down
        var positiveResting = this._getClosestResting(restingX, distance, 1);
        var negativeResting = this._getClosestResting(restingX, distance, -1);
        // use closer resting for wrap-around
        var index = positiveResting.distance < negativeResting.distance ?
            positiveResting.index : negativeResting.index;
        return index;
    };

    /**
     * given resting X and distance to selected card
     * get the distance and index of the closest card
     * @param {Number} restingX - estimated post-flick resting position
     * @param {Number} distance - distance to selected card
     * @param {Integer} increment - +1 or -1, going up or down
     * @returns {Object} - { distance: {Number}, index: {Integer} }
     */
    proto._getClosestResting = function (restingX, distance, increment) {
        var index = this.selectedIndex;
        var minDistance = Infinity;

        // // if contain, keep going if distance is equal to minDistance
        // var condition = this.options.contain && !this.options.wrapAround ?
        //   function( d, md ) { return d <= md; } : function( d, md ) { return d < md; };

        /**************************************/
        // در شرایط ایجاد شرط زیر ممکن است تارگت دو کارت پشت سر هم یکی باشند
        // و فاصله هر دوی آنها از هر مقصدی به یک اندازه می شود که در این حالت ما نمی خواهیم
        // از حلقه ی پایین خارج شویم تا زمانی که واقعا به کارتی برسیم که فاصله کمتری 
        // تا مقصد داشته باشد و یا اصلا کارتی را به عنوان کارت نزدیکتر بهمان بر نگرداند
        /**************************************/
        // در شرط پایین زمانی تارگت دو کارت برابر می شود که مثلا دو کارت کنار هم 
        // عرض خیلی کمتری از کارتهای دیگر داشته باشند
        /**************************************/
        var condition = this.options.nonUniSize && this.cardAlign == 1 ?
            function (d, md) { return d <= md; } : function (d, md) { return d < md; };
        /**************************************/

        while (condition(distance, minDistance)) {
            // measure distance to next card
            index += increment;
            minDistance = distance;
            distance = this.getSlideDistance(-restingX, index);
            if (distance === null) {
                break;
            }
            distance = Math.abs(distance);
        }
        return {
            distance: minDistance,
            // selected was previous index
            index: index - increment
        };
    };

    /**
     * measure distance between x and a slide target
     * @param {Number} x
     * @param {Integer} index - slide index
     */
    proto.getSlideDistance = function (x, index) {
        // var len = this.slides.length;
        var len = this.cards.length;
        // wrap around if at least 2 slides
        var isWrapAround = this.options.wrapAround && len > 1;
        var slideIndex = isWrapAround ? utils.modulo(index, len) : index;
        // var slide = this.slides[ slideIndex ];
        var card = this.cards[slideIndex];
        if (!card) {
            return null;
        }
        // add distance for wrap-around slides
        var wrap = isWrapAround ? this.slideableWidth * Math.floor(index / len) : 0;
        // return x - ( card.originalTarget + wrap );
        return x - (card.target + wrap);
    };

    proto.dragEndBoostSelect = function () {
        // do not boost if no previousDragX or dragMoveTime
        if (this.previousDragX === undefined || !this.dragMoveTime ||
            // or if drag was held for 100 ms
            new Date() - this.dragMoveTime > 100) {
            return 0;
        }

        var distance = this.getSlideDistance(-this.dragX, this.selectedIndex);
        var delta = this.previousDragX - this.dragX;
        if (distance > 0 && delta > 0) {
            // boost to next if moving towards the right, and positive velocity
            return 1;
        } else if (distance < 0 && delta < 0) {
            // boost to previous if moving towards the left, and negative velocity
            return -1;
        }
        return 0;
    };

    // ----- staticClick ----- //
    proto.staticClick = function (event, pointer) {
        // get clickedCard, if card was clicked
        var clickedCard = this.getParentCard(event.target);
        var cardElem = clickedCard && clickedCard.element;
        var cardIndex = clickedCard && this.cards.indexOf(clickedCard);
        this.dispatchEvent('staticClick', event, [pointer, cardElem, cardIndex]);
    };

    // ----- scroll ----- //
    proto.onscroll = function () {
        var scroll = getScrollPosition();
        var scrollMoveX = this.pointerDownScroll.x - scroll.x;
        var scrollMoveY = this.pointerDownScroll.y - scroll.y;
        // cancel click/tap if scroll is too much
        if (Math.abs(scrollMoveX) > 3 || Math.abs(scrollMoveY) > 3) {
            this._pointerDone();
        }
    };

    // ----- utils ----- //
    function getScrollPosition() {
        return {
            x: window.pageXOffset,
            y: window.pageYOffset
        };
    }

    return FCarousel;
});

//FCarousel scroll handle
(function (window, factory) {
    factory(window, window.utils, window.FCarousel, window.dragAnimatePrototype, window.Unidragger);
}(window, function (window, utils, FCarousel, animatePrototype, Unidragger) {
    var ScrollHandle = function (parent) {
        this.parent = this.positioningCompanion = parent;
        this._create();
    };

    ScrollHandle.prototype._create = function () {
        // properties
        this.isEnabled = true;
        // var leftDirection = this.parent.options.rightToLeft ? 1 : -1;
        // this.isLeft = this.direction == leftDirection;

        var parent = this.parent,
            selectors = parent.constructor.selectors;

        parent.positioningCompanion = this;

        this.options = {};
        this.options.rightToLeft = parent.options.rightToLeft;
        // this.options.freeScrollFriction = parent.options.freeScrollFriction;
        // this.options.freeScroll = parent.options.freeScroll;
        this.isScrollbar = true;

        this.restingFrames = 0;
        // initial physics properties
        this.x = 0;
        this.velocity = 0;
        this.originSide = this.options.rightToLeft ? 'right' : 'left';

        this.scrollbarTrack = $(parent.element).find(selectors.scrollbarTrack)[0];
        this.scrollbarThumb = this.slider = $(parent.element).find(selectors.scrollbarThumb)[0];

        this.addStyles();

        // scrollbarTrack click event handler
        this.onScrollbarTrackClick = this.scrollbarTrackClick.bind(this);

        // // init as disabled
        // this.disable();

        // element.setAttribute( 'aria-label', 'Previous' );

        // window.addEventListener( 'resize', this );
        // this.activate();
    };

    ScrollHandle.prototype.activate = function () {
        this.handles = [this.scrollbarThumb];

        if (this.parent.options.scrollbarMutualControl) {
            this.bindHandles();
        }

        this.updateTrackSize();
        this.updateThumb();
        this.updatecompanionConversionFactor();
        this.updateDraggable();
        this.updateBounds();

        // this.element.addEventListener('click', this );
        if (this.parent.options.scrollbarMutualControl) {
            this.scrollbarTrack.addEventListener('click', this.onScrollbarTrackClick);
        }
    };

    ScrollHandle.prototype.handleEvent = utils.handleEvent;

    $.extend(ScrollHandle.prototype, Unidragger.prototype);
    $.extend(ScrollHandle.prototype, dragAnimatePrototype);

    ScrollHandle.prototype._touchActionValue = 'pan-y';

    // ScrollHandle.prototype.onclick = function () {
    //   // 
    // };
    ScrollHandle.prototype.scrollbarTrackClick = function (event) {
        if (event.target != this.scrollbarTrack) {
            return;
        }
        var thumbBCR = this.scrollbarThumb.getBoundingClientRect(),
            pointerDownX = event.pageX,
            isRight = pointerDownX > thumbBCR.right,
            isLeft = pointerDownX < thumbBCR.left,
            isRtl = this.options.rightToLeft;

        this.parent.uiChange();
        var method;
        if ((isRtl && isRight) || (!isRtl && isLeft)) {
            method = 'prev';
        }
        else if ((isRtl && isLeft) || (!isRtl && isRight)) {
            method = 'next';
        }
        method && this.parent[method]();
    };
    ScrollHandle.prototype.enable = function () {
        if (this.isEnabled) {
            return;
        }
        // this.element.disabled = false;
        this.scrollbarTrack.disabled = false;
        this.scrollbarThumb.disabled = false;
        this.isEnabled = true;
    };
    ScrollHandle.prototype.disable = function () {
        if (!this.isEnabled) {
            return;
        }
        // this.element.disabled = true;
        this.scrollbarTrack.disabled = true;
        this.scrollbarThumb.disabled = true;
        this.isEnabled = false;
    };

    ScrollHandle.prototype.updateTrackSize = function () {
        this.trackWidth = this.scrollbarTrack.clientWidth;
    };
    ScrollHandle.prototype.updateThumb = function () {
        var thmbWdth = this.calculateThumbWidth();
        this.setThumbWidth(thmbWdth);
    };
    ScrollHandle.prototype.calculateThumbWidth = function () {
        var parent = this.parent,
            cards = parent.cards,
            // cSWidth = parent.slideableWidth,                        // carousel slider width
            // cSWidth = cards[parent.lastIndex].originalTarget - cards[0].originalTarget,  // carousel sliding width
            cSWidth = cards.length ? cards[parent.lastIndex].target - cards[0].target : 0,  // carousel sliding width
            cVpWidth = parent.viewportWidth;                            // carousel viewport width
        return (this.trackWidth * cVpWidth / (cVpWidth + cSWidth));
    };
    ScrollHandle.prototype.setThumbWidth = function (thmbWdth, isImpermanent) {
        var minThumbWidth = +this.parent.options.minScrollThumbWidth || 20;
        thmbWdth = isImpermanent ? thmbWdth : Math.max(minThumbWidth, thmbWdth);
        thmbWdth = Math.min(this.trackWidth, thmbWdth);
        thmbWdth = Math.round(thmbWdth);

        if (!isImpermanent) {
            this.thumbWidth = thmbWdth;
        }
        // this.thumbStyleWidth = thmbWdth;
        this.scrollbarThumb.style.width = thmbWdth + "px";
    };
    ScrollHandle.prototype.updatecompanionConversionFactor = function () {
        var cards = this.parent.cards,
            // cSWidth = cards[this.parent.lastIndex].originalTarget - cards[0].originalTarget,  //carousel sliding width
            cSWidth = cards.length ? cards[this.parent.lastIndex].target - cards[0].target : 0,  //carousel sliding width
            sSWidth = this.trackWidth - this.thumbWidth;    //scrollThumb sliding width

        // در صورتی که دامنه جا به جایی لغزنده کاروسل صفر باشد دامنه حرکت شستی اسکرول هم صفر خواهد بود
        this.companionConversionFactor = cSWidth != 0 ? sSWidth / cSWidth : 1;
        this.parent.companionConversionFactor = sSWidth != 0 ? cSWidth / sSWidth : 1;
    };
    ScrollHandle.prototype.addStyles = function () {
        this.scrollbarTrack.style.position = "relative";
        this.scrollbarThumb.style.position = "absolute";
        this.scrollbarThumb.style.top = 0;
        this.scrollbarThumb.style[this.originSide] = 0;
    };
    ScrollHandle.prototype.updateBounds = function () {
        // this.originBound = 0;
        this.endBound = this.trackWidth - this.thumbWidth;
    };


    // ScrollHandle.prototype.onDeactivateDrag = function() {
    //   this.unbindHandles();
    //   this.element.classList.remove('is-draggable');
    // };

    ScrollHandle.prototype.updateDraggable = function () {
        // // disable dragging if less than 2 cards.
        // if (this.parent.options.draggable == ">1") {
        //   this.isDraggable = this.lastIndex > 1;
        // } else {
        //   this.isDraggable = this.parent.options.draggable;
        // }

        // this.isDraggable = this.parent.lastIndex > 1;
        this.isDraggable = true;
    };


    // -------------------------- pointer events -------------------------- //
    ScrollHandle.prototype.pointerDown = function (event, pointer) {
        if (!this.isDraggable) {
            this._pointerDownDefault(event, pointer);
            return;
        }
        var isOkay = this.okayPointerDown(event);
        if (!isOkay) {
            return;
        }
        this._pointerDownPreventDefault(event);

        // stop if it was moving
        this.dragX = this.x;
        // track scrolling
        this.pointerDownScroll = getScrollPosition();
        window.addEventListener('scroll', this);

        this._pointerDownDefault(event, pointer);
    };
    // default pointerDown logic, used for staticClick
    ScrollHandle.prototype._pointerDownDefault = function (event, pointer) {
        // track start event position
        // Safari 9 overrides pageX and pageY. These values needs to be copied. #779
        this.pointerDownPointer = {
            pageX: pointer.pageX,
            pageY: pointer.pageY,
        };
        // bind move and end events
        this._bindPostStartEvents(event);
        // this.dispatchEvent( 'pointerDown', event, [ pointer ] );
    };
    ScrollHandle.prototype._pointerDownPreventDefault = function (event) {
        var isTouchStart = event.type == 'touchstart';
        var isTouchPointer = event.pointerType == 'touch';
        if (!isTouchStart && !isTouchPointer) {
            event.preventDefault();
        }
    };
    // ----- move ----- //
    ScrollHandle.prototype.hasDragStarted = function (moveVector) {
        return Math.abs(moveVector.x) > this.parent.options.dragThreshold;
    };
    // ----- up ----- //
    ScrollHandle.prototype.pointerUp = function (event, pointer) {
        // delete this.isTouchScrolling;
        // this.dispatchEvent( 'pointerUp', event, [ pointer ] );
        this._dragPointerUp(event, pointer);
    };
    ScrollHandle.prototype.pointerDone = function () {
        window.removeEventListener('scroll', this);
        delete this.pointerDownScroll;
    };


    // -------------------------- dragging -------------------------- //
    ScrollHandle.prototype.dragStart = function (event, pointer) {
        if (!this.isDraggable) {
            return;
        }
        this.dragStartPosition = this.x;

        this.startAnimation();
        window.removeEventListener('scroll', this);
        // this.dispatchEvent( 'dragStart', event, [ pointer ] );
    };
    ScrollHandle.prototype.pointerMove = function (event, pointer) {
        var moveVector = this._dragPointerMove(event, pointer);
        // this.dispatchEvent( 'pointerMove', event, [ pointer, moveVector ] );
        this._dragMove(event, pointer, moveVector);
    };
    ScrollHandle.prototype.dragMove = function (event, pointer, moveVector) {
        if (!this.isDraggable) {
            return;
        }
        event.preventDefault();
        this.previousDragX = this.dragX;
        // reverse if right-to-left
        var direction = this.parent.options.rightToLeft ? -1 : 1;
        var dragX = this.dragStartPosition + moveVector.x * direction;

        if (this.parent.cards.length) {
            // stop drag
            var originBound = 0;
            dragX = dragX < originBound ? originBound : dragX;
            var endBound = this.trackWidth - this.thumbWidth;
            dragX = dragX > endBound ? endBound : dragX;
        }
        this.dragX = dragX;
        // this.dispatchEvent( 'dragMove', event, [ pointer, moveVector ] );
    };
    ScrollHandle.prototype.dragEnd = function (event, pointer) {
        if (!this.isDraggable) {
            return;
        }
        // if ( this.options.freeScroll ) {
        //   this.isFreeScrolling = true;
        // }
        delete this.previousDragX;
        this.parent.companionDragEnd();
        // this.dispatchEvent( 'dragEnd', event, [ pointer ] );
    };

    // ----- staticClick ----- //
    ScrollHandle.prototype.staticClick = function (event, pointer) {
        // get clickedCard, if card was clicked
        // var clickedCard = this.getParentCard( event.target );
        // var cardElem = clickedCard && clickedCard.element;
        // var cardIndex = clickedCard && this.cards.indexOf( clickedCard );
        // this.dispatchEvent( 'staticClick', event, [ pointer, cardElem, cardIndex ] );
    };

    // ----- scroll ----- //
    ScrollHandle.prototype.onscroll = function () {
        var scroll = getScrollPosition();
        var scrollMoveX = this.pointerDownScroll.x - scroll.x;
        var scrollMoveY = this.pointerDownScroll.y - scroll.y;
        // cancel click/tap if scroll is too much
        if (Math.abs(scrollMoveX) > 3 || Math.abs(scrollMoveY) > 3) {
            this._pointerDone();
        }
    };

    // ----- utils ----- //
    function getScrollPosition() {
        return {
            x: window.pageXOffset,
            y: window.pageYOffset
        };
    }


    // ----- FCarousel defaults ----- //
    $.extend(FCarousel.defaults, {
        minScrollThumbWidth: 20,
        // scrollHandle: false
    });
    $.extend(FCarousel.selectors, {
        scrollbarTrack: ".scroll-handle-Track",
        scrollbarThumb: ".scroll-handle"
    });

    // ----- create ----- //
    FCarousel.createMethods.push('_createScrollHandle');

    // -------------------------- FCarousel prototype -------------------------- //
    var proto = FCarousel.prototype;

    proto._createScrollHandle = function () {
        if (!this.options.scrollbar) {
            return;
        }
        this.scrollbar = new ScrollHandle(this);

        // this.parent.on("activate", this.onActivateScrollHandle.bind(this));
        this.on("activate", this.activateScrollHandle);
        this.on("resize", this.updateScrollHandle);
    };

    proto.activateScrollHandle = function () {
        this.scrollbar.activate();
        // this.on( 'deactivate', this.deactivateScrollHandle );
    };

    proto.updateScrollHandle = function () {
        this.scrollbar.updateTrackSize();
        this.scrollbar.updateThumb();
        this.scrollbar.updatecompanionConversionFactor();
        this.scrollbar.updateDraggable();
        this.scrollbar.updateBounds();
    };

    FCarousel.ScrollHandle = ScrollHandle;
    return FCarousel;
}));

//FCarousel previouse and next button
(function (window, factory) {
    factory(window, window.FCarousel, window.Unipointer, window.utils);
}(window, function (window, FCarousel, Unipointer, utils) {
    var PrevNextBtn = function (direction, parent) {
        this.parent = parent;
        this.direction = direction;
        this._create();
    };

    PrevNextBtn.prototype = Object.create(Unipointer.prototype);

    PrevNextBtn.prototype._create = function () {
        // properties
        this.isEnabled = true;
        this.isPrevious = this.direction == -1;
        var leftDirection = this.parent.options.rightToLeft ? 1 : -1;
        this.isLeft = this.direction == leftDirection;

        // var element = this.element = document.createElement('button');
        // element.className = 'carousel-control';
        // element.className += this.isPrevious ? ' carousel-control-prev' : ' carousel-control-next';
        // // prevent button from submitting form
        // element.setAttribute( 'type', 'button' );

        var parent = this.parent,
            selectors = parent.constructor.selectors,
            btnSelector = this.isPrevious ? selectors.previousButton : selectors.nextButton;

        // // this.controllButtons = $(parent.element).find(selectors.controllButtons)[0];
        // this.previousButton = $(parent.element).find(btnSelector)[0];

        var btnElem = this.element = $(parent.element).find(btnSelector)[0];

        // init as disabled
        this.disable();

        // element.setAttribute( 'aria-label', this.isPrevious ? 'Previous' : 'Next' );
        btnElem.setAttribute('aria-label', this.isPrevious ? 'Previous' : 'Next');

        // var leftIcon = this.parent.options.leftBtnIcon,
        //   rightIcon = this.parent.options.rightBtnIcon;
        // if (leftIcon && rightIcon) {
        //   var iconElem = document.createElement("span");
        //   iconElem.className = this.isLeft ? leftIcon : rightIcon;
        //   element.appendChild(iconElem);
        // }

        // if (false) {
        //   // create arrow
        //   var svg = this.createSVG();
        //   element.appendChild( svg );
        // }
        // this.parent.element.appendChild(element);

        // events
        this.parent.on('select', this.update.bind(this));

        // this.activate();
    };

    PrevNextBtn.prototype.activate = function () {
        this.bindStartEvent(this.element);
        // var parent = this.parent;

        // if (this.direction == -1) {
        //     // در صورت صورت استفاده از هر یک از این دو مورد پایینی عبارت "this" 
        //     // در "فانکشن مقصد" برابر با خود "تگ دکمه" می شود که در این صورت دسترسی به شی پرنت که حاوی
        //     // تگ کاروسل والد و همچنین آپشن ها و فانکشن های آن است وجود نخواهد داشت
        //     this.element.onclick = parent.prev;
        //     // $(this.element).on("click", parent.prev);
        // } else {
        //     // مشابه مورد بالایی
        // }

        // در حالت عادی در صورت استفاده از عبارتی مثل عبارت پایین، چون در
        // زمان تعریف (همین جا، چون این خطها در زمان لود اجرا می شوند) عبارت "this"
        // به شی دکمه (منظور از شی، تگ نیست) اشاره دارد که اصلا یک فانکشن هم نیست هیچ اتفاقی نمی افتد
        // پس برای هندل کردن درست عملکرد (فرستادن یک "دیس مناسب" و ارجاع به فانکشن مربوطه)
        // باید از "utils.handleEvent" کمک بگیریم
        this.element.addEventListener('click', this);
        // توضیحات بیشتر در این آدرس :
        // https://dev.to/rikschennink/the-fantastically-magical-handleevent-function-1bp4
        // توسط جستجوی این عبارت در گوگل
        // how the handleEvent in utils.handleEvent called

        // add to DOM
        // this.parent.element.appendChild(this.element);
    };

    PrevNextBtn.prototype.handleEvent = utils.handleEvent;

    PrevNextBtn.prototype.onclick = function () {
        if (!this.isEnabled) {
            return;
        }
        this.parent.uiChange();
        var method = this.isPrevious ? 'prev' : 'next';
        this.parent[method]();
    };

    PrevNextBtn.prototype.enable = function () {
        if (this.isEnabled) {
            return;
        }
        this.element.disabled = false;
        this.isEnabled = true;
    };
    PrevNextBtn.prototype.disable = function () {
        if (!this.isEnabled) {
            return;
        }
        this.element.disabled = true;
        this.isEnabled = false;
    };

    PrevNextBtn.prototype.update = function () {
        // // index of first or last slide, if previous or next
        // var slides = this.parent.slides;
        var parent = this.parent,
            // lastIndex = parent.lastIndex;
            lastIndex = parent.hasStaticSlide ? parent.staticSlides.length - 1 : parent.lastIndex;
        // enable is wrapAround and at least 2 selectable cards
        if (parent.options.wrapAround && lastIndex > 1) {
            this.enable();
            return;
        }
        // var lastIndex = slides.length ? slides.length - 1 : 0;
        var boundIndex = this.isPrevious ? 0 : lastIndex;
        var method = this.parent.selectedIndex == boundIndex ? 'disable' : 'enable';
        this[method]();
    };

    // -------------------------- FCarousel prototype -------------------------- //
    $.extend(FCarousel.defaults, {
        prevNextButtons: true,
        // arrowShape: {
        //   x0: 10,
        //   x1: 60, y1: 50,
        //   x2: 70, y2: 40,
        //   x3: 30
        // }
    });
    $.extend(FCarousel.selectors, {
        // controllButtons: ".carousel-control",
        previousButton: ".carousel-control-prev",
        nextButton: ".carousel-control-next"
    });

    FCarousel.createMethods.push('_createPrevNextButtons');
    var proto = FCarousel.prototype;

    proto._createPrevNextButtons = function () {
        if (!this.options.prevNextButtons) {
            return;
        }
        this.prevButton = new PrevNextBtn(-1, this);
        this.nextButton = new PrevNextBtn(1, this);

        this.on('activate', this.activatePrevNextButtons);
    };

    proto.activatePrevNextButtons = function () {
        this.prevButton.activate();
        this.nextButton.activate();
        this.on('deactivate', this.deactivatePrevNextButtons);
    };

    proto.deactivatePrevNextButtons = function () {
        this.prevButton.deactivate();
        this.nextButton.deactivate();
        this.off('deactivate', this.deactivatePrevNextButtons);
    };

    FCarousel.PrevNextBtn = PrevNextBtn;
    return FCarousel;
}));

// page dots
( function( window, factory ) {
    // browser global
    factory(
        window,
        window.FCarousel,
        window.Unipointer,
        window.utils
    );
}( window, function factory( window, FCarousel, Unipointer, utils ) {
  
    // -------------------------- PageDots -------------------------- //
    
    function PageDots( parent ) {
        this.parent = parent;
        this._create();
    }
    
    PageDots.prototype = Object.create( Unipointer.prototype );
    
    PageDots.prototype._create = function() {
        // create holder element
        this.holder = document.createElement('ol');
        this.holder.className = 'f-carousel-page-dots';
        // create dots, array of elements
        this.dots = [];
        // events
        this.handleClick = this.onClick.bind( this );
        this.on( 'pointerDown', this.parent.childUIPointerDown.bind( this.parent ) );
    };
    
    PageDots.prototype.activate = function() {
        this.setDots();
        this.holder.addEventListener( 'click', this.handleClick );
        this.bindStartEvent( this.holder );
        // add to DOM
        this.parent.element.appendChild( this.holder );
    };
    
    PageDots.prototype.deactivate = function() {
        this.holder.removeEventListener( 'click', this.handleClick );
        this.unbindStartEvent( this.holder );
        // remove from DOM
        this.parent.element.removeChild( this.holder );
    };
    
    PageDots.prototype.setDots = function() {
        // // get difference between number of slides and number of dots
        // var delta = this.parent.slides.length - this.dots.length;
        
        // get difference between number of cards and number of dots

        var staticSlides_length = this.parent.staticSlidesStartIndexes.length;

        // var delta = this.parent.lastIndex + 1 - this.dots.length;
        var delta = staticSlides_length - this.dots.length;

        if ( delta > 0 ) {
            this.addDots( delta );
        } else if ( delta < 0 ) {
            this.removeDots( -delta );
        }
    };
    
    PageDots.prototype.addDots = function( count ) {
        var fragment = document.createDocumentFragment();
        var newDots = [];
        var length = this.dots.length;
        var max = length + count;
    
        for ( var i = length; i < max; i++ ) {
            var dot = document.createElement('li');
            dot.className = 'dot';
            dot.setAttribute( 'aria-label', 'Page dot ' + ( i + 1 ) );
            fragment.appendChild( dot );
            newDots.push( dot );
        }
    
        this.holder.appendChild( fragment );
        this.dots = this.dots.concat( newDots );
    };
    
    PageDots.prototype.removeDots = function( count ) {
        // remove from this.dots collection
        var removeDots = this.dots.splice( this.dots.length - count, count );
        // remove from DOM
        removeDots.forEach( function( dot ) {
            this.holder.removeChild( dot );
        }, this );
    };
    
    PageDots.prototype.updateSelected = function() {
        // remove selected class on previous
        if ( this.selectedDot ) {
            this.selectedDot.className = 'dot';
            this.selectedDot.removeAttribute('aria-current');
        }
        // don't proceed if no dots
        if ( !this.dots.length ) {
            return;
        }

        var parent = this.parent,
            stSlSt_arr = parent.staticSlidesStartIndexes,
            selctd_ind = parent.selectedIndex,
            selectedDot_index;

        if (!this.parent.staticSlides) {
            selectedDot_index = stSlSt_arr.indexOf(selctd_ind);

            if (selectedDot_index < 0) {
                var prev_selectable_ind = selctd_ind - 1,
                    next_selectable_ind;

                while (prev_selectable_ind >= 0 && stSlSt_arr.indexOf(prev_selectable_ind) < 0) {
                    prev_selectable_ind--;
                }

                next_selectable_ind = stSlSt_arr.indexOf(prev_selectable_ind) + 1 < stSlSt_arr.length ? stSlSt_arr[stSlSt_arr.indexOf(prev_selectable_ind) + 1] : stSlSt_arr[stSlSt_arr.indexOf(prev_selectable_ind)];

                var down_diff = Math.abs(selctd_ind - prev_selectable_ind),
                    up_diff = Math.abs(selctd_ind - next_selectable_ind),
                    last_dot_ind = this.dots.indexOf(this.selectedDot);

                if (down_diff < up_diff) {
                    selectedDot_index = stSlSt_arr.indexOf(prev_selectable_ind);
                }
                else if (down_diff > up_diff) {
                    selectedDot_index = stSlSt_arr.indexOf(next_selectable_ind);
                }
                else {
                    selectedDot_index = Math.abs(last_dot_ind - prev_selectable_ind) < Math.abs(last_dot_ind - next_selectable_ind) ? stSlSt_arr.indexOf(prev_selectable_ind) : stSlSt_arr.indexOf(next_selectable_ind);
                }
            }
        }
        else {
            selectedDot_index = selctd_ind;
        }

        // this.selectedDot = this.dots[ this.parent.selectedIndex ];
        this.selectedDot = this.dots[ selectedDot_index ];
        this.selectedDot.className = 'dot is-selected';
        this.selectedDot.setAttribute( 'aria-current', 'step' );
    };
    
    PageDots.prototype.onClick = function( event ) {
        var target = event.target;
        // only care about dot clicks
        if ( target.nodeName != 'LI' ) {
            return;
        }
    
        this.parent.uiChange();

        var dot_index = this.dots.indexOf( target ),
            card_index;

        if (!this.parent.staticSlides) {
            card_index = this.parent.staticSlidesStartIndexes[dot_index];
        }
        else {
            card_index = dot_index;
        }

        this.parent.select( card_index );
    };
    
    PageDots.prototype.destroy = function() {
        this.deactivate();
        this.allOff();
    };
    
    FCarousel.PageDots = PageDots;
    
    // -------------------------- FCarousel -------------------------- //
    
    $.extend( FCarousel.defaults, {
        // pageDots: false,
    });
    
    FCarousel.createMethods.push('_createPageDots');
    
    var proto = FCarousel.prototype;
    
    proto._createPageDots = function() {
        if ( !this.options.pageDots ) {
        return;
        }
        this.pageDots = new PageDots( this );
        // events
        this.on( 'activate', this.activatePageDots );
        this.on( 'select', this.updateSelectedPageDots );
        // this.on( 'cardChange', this.updatePageDots );
        this.on( 'resize', this.updatePageDots );
        this.on( 'deactivate', this.deactivatePageDots );
    };
    
    proto.activatePageDots = function() {
        this.pageDots.activate();
    };
    
    proto.updateSelectedPageDots = function() {
        this.pageDots.updateSelected();
    };
    
    proto.updatePageDots = function() {
        this.pageDots.setDots();
    };
    
    proto.deactivatePageDots = function() {
        this.pageDots.deactivate();
    };
    
    // -----  ----- //
    
    FCarousel.PageDots = PageDots;
    
    return FCarousel;
    
}));

/*!
 * FCarousel asNavFor
 * enable asNavFor for FCarousel
 */
/*jshint browser: true, undef: true, unused: true, strict: true*/
(function (window, factory) {
    // browser global
    window.FCarousel = factory(
        window.FCarousel,
        window.utils
    );
}(window, function factory(FCarousel, utils) {

    // -------------------------- asNavFor prototype -------------------------- //
    // FCarousel.defaults.asNavFor = null;
    FCarousel.createMethods.push('_createAsNavFor');

    var proto = FCarousel.prototype;

    proto._createAsNavFor = function () {
        this.on('activate', this.activateAsNavFor);
        this.on('deactivate', this.deactivateAsNavFor);
        this.on('destroy', this.destroyAsNavFor);

        var asNavForOption = this.options.asNavFor;
        if (!asNavForOption) {
            return;
        }
        // HACK do async, give time for other fCarousel to be initalized
        var _this = this;
        setTimeout(function initNavCompanion() {
            _this.setNavCompanion(asNavForOption);
        });
    };

    proto.setNavCompanion = function (elem) {
        elem = utils.getQueryElement(elem);
        var companion = FCarousel.data(elem);
        // stop if no companion or companion is self
        if (!companion || companion == this) {
            return;
        }

        this.navCompanion = companion;
        // companion select
        var _this = this;
        this.onNavCompanionSelect = function () {
            _this.navCompanionSelect();
        };
        companion.on('select', this.onNavCompanionSelect);
        // click
        this.on('staticClick', this.onNavStaticClick);

        this.navCompanionSelect(true);
    };

    proto.navCompanionSelect = function (isInstant) {
        if (!this.navCompanion) {
            return;
        }
        // // select slide that matches first card of slide
        // var selectedCard = this.navCompanion.selectedCard;
        // var firstIndex = this.navCompanion.cards.indexOf(selectedCard);
        // var lastIndex = firstIndex + this.navCompanion.selectedCards.length - 1;
        // var selectIndex = Math.floor( lerp( firstIndex, lastIndex, this.navCompanion.cardAlign ) );
        // this.selectCard( selectIndex, false, isInstant );
        // // set nav selected class
        // this.removeNavSelectedElements();
        // // stop if companion has more cards than this one
        // if ( selectIndex >= this.cards.length ) {
        //   return;
        // }

        // var selectedCards = this.cards.slice( firstIndex, lastIndex + 1 );
        // this.navSelectedElements = selectedCards.map( function( card ) {
        //   return card.element;
        // });
        // this.changeNavSelectedClass('add');

        var companion = this.navCompanion;
        // stop if companion has more cards than this one
        if (companion.selectedIndex >= this.cards.length) {
            return;
        }

        var navSelectedIndex = companion.selectedIndex;
        var formerSlideFirstIndex = this.slideFirstIndex >= 0 ? this.slideFirstIndex : navSelectedIndex;

        this.updateSlideBounds();

        if (this.slideFirstIndex != formerSlideFirstIndex || navSelectedIndex < this.selectedIndex || navSelectedIndex > this.cards[this.selectedIndex].lastIndexOfCardSlide) {
            this.selectCard(this.slideFirstIndex, false, isInstant);
        }
        // set nav selected class
        this.removeNavSelectedElement();

        this.navSelectedIndex = navSelectedIndex;
        this.navSelectedElement = this.cards[navSelectedIndex].element;
        this.changeNavSelectedClass('add');
    };

    // function lerp( a, b, t ) {
    //   return ( b - a ) * t + a;
    // }

    proto.updateSlideBounds = function () {
        // sI : selectedIndex of main carousel for use in this carousel (navigation carousel)
        var sI = this.navCompanion.selectedIndex < this.cards.length ? this.navCompanion.selectedIndex : this.cards.length - 1;
        // slCardsLength : length of slide which starts with selected-card
        var slCardsLength = this.getCurrentOrPreviousSlideCardsLength(this.selectedIndex);

        if (!(this.slideFirstIndex >= 0)) {
            this.slideFirstIndex = sI;
            this.slideLastIndex = sI + slCardsLength <= this.cards.length ? sI + slCardsLength - 1 : this.cards.length - 1;
        }
        else if (sI >= this.selectedIndex && sI <= this.selectedIndex + slCardsLength - 1) {
            this.slideFirstIndex = this.selectedIndex;
            this.slideLastIndex = this.selectedIndex + slCardsLength <= this.cards.length ? this.selectedIndex + slCardsLength - 1 : this.cards.length - 1;
        }
        else {
            if (sI >= this.slideFirstIndex && sI <= this.slideLastIndex) {
                return;
            }
            else if (sI < this.slideFirstIndex) {
                this.slideFirstIndex = sI;
                this.slideLastIndex = sI + slCardsLength <= this.cards.length ? slCardsLength - 1 : this.cards.length - 1;
            }
            else if (sI > this.slideLastIndex) {
                this.slideFirstIndex = sI - slCardsLength + 1;
                this.slideLastIndex = sI;
            }
        }
    };

    proto.changeNavSelectedClass = function (method) {
        this.navSelectedElement.classList[method]('nav-selected');
    };

    proto.activateAsNavFor = function () {
        this.navCompanionSelect(true);
    };

    proto.removeNavSelectedElement = function () {
        if (!this.navSelectedElement) {
            return;
        }
        this.changeNavSelectedClass('remove');
        delete this.navSelectedElement;
    };

    proto.onNavStaticClick = function (event, pointer, cardElement, cardIndex) {
        if (typeof cardIndex == 'number') {
            this.navCompanion.selectCard(cardIndex);
        }
    };

    proto.deactivateAsNavFor = function () {
        this.removeNavSelectedElement();
    };

    proto.destroyAsNavFor = function () {
        if (!this.navCompanion) {
            return;
        }
        this.navCompanion.off('select', this.onNavCompanionSelect);
        this.off('staticClick', this.onNavStaticClick);
        delete this.navCompanion;
    };

    // -----  ----- //
    return FCarousel;
}));

// steady (static) slide
(function (window, factory) {
    // browser global
    window.FCarousel = window.FCarousel || {};
    window.FCarousel.StaticSlide = factory(window, window.utils, window.getPosition);

}(window, function factory(window, utils, getPosition) {
    'use strict';

    function StaticSlide(parent) {
        this.parent = parent;
        this.isOriginLeft = parent.originSide == 'left';
        this.cards = [];
        this.outerWidth = 0;
        this.height = 0;
    }

    StaticSlide.prototype.addCard = function (card) {
        this.cards.push(card);

        this.outerWidth += card.width;
        this.height = Math.max(card.height, this.height);

        // first card stuff
        if (this.cards.length == 1) {
            this.x = card.originalTarget; // x comes from first card
            var startMargin = this.isOriginLeft ? 'marginLeft' : 'marginRight';
            this.startMargin = card[startMargin];
            // this.target = card.originalTarget;
            this.target = card.target;
        }

        // this.updateSize();
    };

    // StaticSlide.prototype.updateSize = function() {
    //   if (this.cards.length) {
    //     var isRtl = !this.isOriginLeft,
    //         lastCard = this.cards[this.cards.length - 1];
    //     // this.outerWidth = getPosition(this.cards[lastCard].element, isRtl).end - this.target;
    //     this.outerWidth = getPosition(this.cards[lastCard].element, isRtl).end - getPosition(this.cards[0].element, isRtl).start;
    //   }
    // };

    StaticSlide.prototype.updateTarget = function () {
        var lastCard = this.cards[this.cards.length - 1],
            endMargin = this.isOriginLeft ? 'marginRight' : 'marginLeft',
            lastEndMargin = lastCard ? lastCard[endMargin] : 0,
            staticSlideWidth = this.outerWidth - (this.startMargin + lastEndMargin);
        this.target = this.x + this.startMargin + staticSlideWidth * this.parent.cardAlign;
    };

    StaticSlide.prototype.select = function () {
        this.cards.forEach(function (card) {
            card.select();
        });
    };

    StaticSlide.prototype.unselect = function () {
        this.cards.forEach(function (card) {
            card.unselect();
        });
    };

    StaticSlide.prototype.getCardElements = function () {
        return this.cards.map(function (card) {
            return card.element;
        });
    };



    // ----- create ----- //
    FCarousel.createMethods.push('_createStaticSlides');

    // -------------------------- FCarousel prototype -------------------------- //
    var proto = FCarousel.prototype;

    proto._createStaticSlides = function () {
        if (!this.options.fade) {
            return;
        }
        this.hasStaticSlide = true;
        this.on("activate", this.activateStaticSlide);
    };

    proto.activateStaticSlide = function () {
        // this.updateStaticSlides();
        this.emitEvent("activateStaticSlides");
    };

    var _positionCards = proto._positionCards;
    proto._positionCards = function (index) {
        _positionCards.apply(this, arguments);
        if (!this.options.fade) {
            return;
        }

        // // keep track of cardX (all carousel cards width) for wrap-around
        // var lastCard = this.cards[this.cards.length - 1];
        // this.slideableWidth = lastCard.originalTarget + lastCard.width;

        // در این مرحله ممکن است کاروسل سی اس اس اینلاینی برای تنظیم ارتفاع نگرفته باشد
        // و از آنجایی که پوزیشن همه ی کارتها اپسولوت است ارتفاعش صفر باشد؛ که این حالت باعث می شود متد
        // updateSliderWidth() مقدار undefined را برگرداند

        // slides
        // برای staticSlide ها هم باید مثل کارت ها متدی مثل 
        // متد _containSlides نوشته شود که البته احتمالا باید متدی جداگانه و متفاوت باشد
        this.updateStaticSlides();

        // this._containStaticSlides();

        // // update slidesWidth
        // this.slidesWidth = len ? this.getLastSlide().target - this.slides[0].target : 0;
    };

    proto._containStaticSlides = function () {
        // 
    };

    proto.updateStaticSlides = function () {
        this.staticSlides = [];
        if (!this.cards.length) {
            return;
        }

        var staticSlide = new StaticSlide(this);
        this.staticSlides.push(staticSlide);

        var isOriginLeft = this.originSide == 'left';
        var endMargin = isOriginLeft ? 'marginRight' : 'marginLeft';

        var canCardFit = this._getCanCardFit();

        this.cards.forEach(function (card, i) {
            // just add card if first card in staticSlide
            if (!staticSlide.cards.length) {
                staticSlide.addCard(card);
                return;
            }

            var staticSlideNextWidth = (staticSlide.outerWidth - staticSlide.startMargin) + (card.width - card[endMargin]);

            if (canCardFit.call(this, i, staticSlideNextWidth)) {
                staticSlide.addCard(card);
            } else {
                // doesn't fit, new staticSlide
                staticSlide.updateTarget();

                staticSlide = new StaticSlide(this);
                this.staticSlides.push(staticSlide);
                staticSlide.addCard(card);
            }
        }, this);
        // last staticSlide
        staticSlide.updateTarget();

        this.correctSelectedStaticSlideIndex();
        this.updateSelectedStaticSlide();
    };

    // correct the selected staticSlide on resize
    proto.correctSelectedStaticSlideIndex = function () {
        this.selectedIndex = Math.min(this.selectedIndex, this.staticSlides.length - 1);

        var prevSCIndex = this.cards.indexOf(this.selectedCard);    // previous selected card index
        if (prevSCIndex < 0) {
            return;
        }

        // fardin TODO :
        // این متد در حال حاضر بعد از ریسایز شدن صفحه ایندکس انتخاب شده جدید را بر مبنای 
        // شماره اولین کارت اسلاید انتخاب شده قبلی بدست می آورد ولی شاید بهتر باشد که بر مبنای 
        // این باشد که اسلاید انتخاب شده جدید آن اسلایدی باشد که از اسلایدهای دیگر
        // تعداد کارتهای مشترک بیشتری با اسلاید انتخاب شده قدیمی داشته باشد

        // یا شاید بهتر باشد در زمان ریسایز کردن با توجه به کوچکتر شدن یا بزرگتر شدن صفحه 
        // بر اساس اولین یاآخرین ایندکس داخل کادر محاسبات انجام بگیرد
        var staticSlidesLength = this.staticSlides.length;
        for (var i = 0; i < staticSlidesLength; i++) {
            var staticSlide = this.staticSlides[i];
            var firstCardIndex = this.cards.indexOf(staticSlide.cards[0]);
            if (prevSCIndex >= firstCardIndex && prevSCIndex < firstCardIndex + staticSlide.cards.length) {
                this.selectedIndex = i;
                break;
            }
        }
    };

    proto.updateSelectedStaticSlide = function () {
        var staticSlide = this.staticSlides[this.selectedIndex];
        // selectedIndex could be outside of staticSlides, if triggered before resize()
        if (!staticSlide) {
            return;
        }

        // unselect previous selected staticSlide
        this.unselectSelectedStaticSlide();
        // update new selected staticSlide
        this.selectedStaticSlide = staticSlide;
        staticSlide.select();
        this.selectedCards = staticSlide.cards;
        // this.selectedElements = staticSlide.getCardElements();

        // HACK: selectedCard & selectedElement is first card in slide, backwards compatibility
        this.selectedCard = staticSlide.cards[0];
        // this.selectedElement = this.selectedElements[0];
        // selectedCard
        // را به منظور استفاده در متد هایی که از 
        // selectedStaticSlide
        // استفاده نکرده اند، نیاز داریم، در واقع این کار باعث می شود در بعضی متد ها که به 
        // تارگت المان سلکت شده نیاز است می توان جایگزین بازنویسی یا تغییر آن متد شود
    };

    var updateInViewportCards = proto.updateInViewportCards;
    proto.updateInViewportCards = function () {
        if (!this.options.fade) {
            updateInViewportCards.apply(this, arguments);
            return;
        }

        // if (this.isPointerDown || this.isFreeScrolling) {
        //   // cardElems = [];
        //   // ....
        //   // this.inViewportCards = cardElems;
        //   // return;
        // }
        this.inViewportCards = this.selectedCards;
    };

    proto.unselectSelectedStaticSlide = function () {
        if (this.selectedStaticSlide) {
            this.selectedStaticSlide.unselect();
        }
    };

    proto._getCanCardFit = function () {
        // var groupCards = this.options.groupCards;
        var groupCards = this.options.fade;
        if (!groupCards) {
            return function () {
                return false;
            };
        }
        // default, group by width of staticSlide
        return function (i, staticSlideNextWidth) {
            // return staticSlideNextWidth <= ( this.size.innerWidth + 1 ) * percent;
            return staticSlideNextWidth <= this.viewportWidth;
        };
    };

    var getIndexInRange = proto.getIndexInRange;
    proto.getIndexInRange = function (index) {
        if (!this.options.fade) {
            return getIndexInRange.apply(this, arguments);
        }
        index = parseInt(+index) || 0;
        index = Math.min(this.staticSlides.length - 1, index);
        index = Math.max(0, index);
        return index;
    };

    var select = proto.select;
    proto.select = function (slideIndex, isWrap, isInstant) {
        if (!this.options.fade) {
            select.apply(this, arguments);
            return;
        }

        if (this.options.wrapAround || isWrap) {
            slideIndex = utils.modulo(slideIndex, this.staticSlides.length);
        } else {
            slideIndex = this.getIndexInRange(slideIndex);
        }

        // bail if invalid index
        if (!this.staticSlides[slideIndex]) {
            return;
        }

        var prevIndex = this.selectedIndex;
        this.selectedIndex = slideIndex;

        this.updateSelectedStaticSlide();
        this.updateInViewportCards();
        if (isInstant) {
            this.positionSliderAtSelected();
        } else {
            this.startAnimation();
        }

        // if ( this.options.adaptiveHeight ) {
        //   this.setGallerySize();
        // }
        // events
        this.dispatchEvent('select', null, [slideIndex]);
        // change event if new index
        if (slideIndex != prevIndex) {
            this.dispatchEvent('change', null, [slideIndex]);
        }
    };

    var prev = proto.prev;
    proto.prev = function () {
        if (!this.options.fade) {
            prev.apply(this, arguments);
            return;
        }
        var index = -1 + this.selectedIndex;
        this.select(index);
    };

    var next = proto.next;
    proto.next = function () {
        if (!this.options.fade) {
            next.apply(this, arguments);
            return;
        }

        var index = 1 + this.selectedIndex;
        this.select(index);
    };

    var selectInitialIndex = proto.selectInitialIndex;
    proto.selectInitialIndex = function () {
        if (!this.options.fade) {
            selectInitialIndex.apply(this, arguments);
            return;
        }
        var initialIndex = this.options.initialIndex;
        // already activated, select previous selectedIndex
        if (this.isInitActivated) {
            this.select(this.selectedIndex, false, true);
            return;
        }
        // select with number
        initialIndex = this.getIndexInRange(this.options.initialIndex);
        // select instantly
        this.select(initialIndex, false, true);
    };

    var dragEnd = proto.dragEnd;
    proto.dragEnd = function (event, pointer) {
        if (!this.options.fade) {
            dragEnd.apply(this, arguments);
            return;
        }

        if (!this.isDraggable) {
            return;
        }
        if (this.options.freeScroll) {
            this.isFreeScrolling = true;
        }
        // set selectedIndex based on where carousel will end up
        var index = this.dragEndRestingSelect();

        if (this.options.freeScroll && !this.options.wrapAround) {
            // if free-scroll & not wrap around
            // do not free-scroll if going outside of bounding slides
            // so bounding slides can attract slider, and keep it in bounds
            var restingX = this.getRestingPosition();
            this.isFreeScrolling = -restingX > this.staticSlides[0].target && -restingX < this.staticSlides[this.staticSlides.length - 1].target;
        }
        else if (!this.options.freeScroll && index == this.selectedIndex) {
            // boost selection if selected index has not changed
            index += this.dragEndBoostSelect();
        }
        delete this.previousDragX;
        // apply selection
        // TODO refactor this, selecting here feels weird
        // HACK, set flag so dragging stays in correct direction
        this.isDragSelect = this.options.wrapAround;
        this.select(index);
        delete this.isDragSelect;
        this.dispatchEvent('dragEnd', event, [pointer]);
    };

    var getSlideDistance = proto.getSlideDistance;
    proto.getSlideDistance = function (x, index) {
        if (!this.options.fade) {
            return getSlideDistance.apply(this, arguments);
        }

        // var len = this.slides.length;
        var len = this.staticSlides.length;
        // wrap around if at least 2 slides
        var isWrapAround = this.options.wrapAround && len > 1;
        var slideIndex = isWrapAround ? utils.modulo(index, len) : index;
        // var slide = this.slides[ slideIndex ];
        var staticSlide = this.staticSlides[slideIndex];
        if (!staticSlide) {
            return null;
        }
        // add distance for wrap-around slides
        var wrap = isWrapAround ? this.slideableWidth * Math.floor(index / len) : 0;
        return x - (staticSlide.target + wrap);
    };

    return StaticSlide;
}));

/**
 * FCarousel fade v1.0.0
 * Fade between FCarousel staticSlides
 */
/* jshint browser: true, undef: true, unused: true */
(function (window, factory) {
    // browser global
    factory(
        window.FCarousel,
        window.utils
    );

}(this, function factory(FCarousel, utils) {

    // ---- StaticSlide ---- //
    var StaticSlide = FCarousel.StaticSlide;

    // وقتی بخواهیم یک متد را override (overwrite ?)
    // کنیم و در جایی ازمتد جدید، متدی که قبلا موجود بوده را هم اجرا کنیم
    // باید قبل از بازنویسی متد، تعریف متد قدیمی آن را در یک متغییر ذخیره کنیم
    // تا در متد بازنویسی شده از همان استفاده کنیم
    // 
    // در این جا علاوه بر این عمل از apply
    // هم استفاده شده تا آرگومان ها و this
    // همین جا را به متد قدیمی هم اعمال کند
    // 
    var staticSlideUpdateTarget = StaticSlide.prototype.updateTarget;
    StaticSlide.prototype.updateTarget = function () {
        staticSlideUpdateTarget.apply(this, arguments);
        if (!this.parent.options.fade) {
            return;
        }
        // position cards at selected target
        var staticSlideTargetX = this.target - this.x;
        var firstCardX = this.cards[0].originalTarget;
        this.cards.forEach(function (card) {
            var targetX = card.originalTarget - firstCardX - staticSlideTargetX;
            card.renderPosition(targetX);
        });
    };

    StaticSlide.prototype.setOpacity = function (alpha) {
        this.cards.forEach(function (card) {
            card.element.style.opacity = alpha;
            // card.element.style.zIndex = Math.round(alpha);
        });
    };

    // ---- FCarousel ---- //
    var proto = FCarousel.prototype;

    FCarousel.createMethods.push('_createFade');

    proto._createFade = function () {
        if (!this.options.fade) {
            return;
        }
        this.on("activateStaticSlides", this.activateFade);
    };

    proto.activateFade = function () {
        this.fadeIndex = this.selectedIndex;
        this.prevSelectedIndex = this.selectedIndex;
        // this.on( 'select', this.onSelectFade );
        this.on('resize', this.onResizeFade);
        this.on('dragEnd', this.onDragEndFade);
        this.on('settle', this.onSettleFade);
        this.on('activate', this.onActivateFade);
        this.on('deactivate', this.onDeactivateFade);
    };

    var updateStaticSlides = proto.updateStaticSlides;
    proto.updateStaticSlides = function () {
        updateStaticSlides.apply(this, arguments);
        if (!this.options.fade) {
            return;
        }
        // set initial opacity
        // this.staticSlides.forEach( function( staticSlide, i ) {
        //   var alpha = i == this.selectedIndex ? 1 : 0;
        //   staticSlide.setOpacity( alpha );
        // }, this );
        this.setFadeInstantOpacity();
    };

    /* ---- events ---- */

    proto.onResizeFade = function () {
        // in case of resize, keep fadeIndex within current count
        this.fadeIndex = Math.min(this.prevSelectedIndex, this.staticSlides.length - 1);
        this.prevSelectedIndex = this.selectedIndex;
        this.setFadeInstantOpacity();
    };

    proto.setFadeInstantOpacity = function () {
        this.staticSlides.forEach(function (staticSlide, i) {
            var alpha = i == this.selectedIndex ? 1 : 0;
            staticSlide.setOpacity(alpha);
        }, this);
    };

    proto.onSelectFade = function () {
        // // in case of resize, keep fadeIndex within current count
        // this.fadeIndex = Math.min( this.prevSelectedIndex, this.staticSlides.length - 1 );
        // this.prevSelectedIndex = this.selectedIndex;
    };

    proto.onSettleFade = function () {
        delete this.didDragEnd;
        if (!this.options.fade) {
            return;
        }
        // // set full and 0 opacity on selected & faded staticSlides
        // this.selectedStaticSlide.setOpacity(1);
        // var fadedStaticSlide = this.staticSlides[this.fadeIndex];
        // if (fadedStaticSlide && this.fadeIndex != this.selectedIndex) {
        //   this.staticSlides[this.fadeIndex].setOpacity(0);
        // }

        this.setFadeInstantOpacity();
    };

    proto.onDragEndFade = function () {
        // set flag
        this.didDragEnd = true;
    };

    proto.onActivateFade = function () {
        if (this.options.fade) {
            this.element.classList.add('is-fade');
        }
    };

    proto.onDeactivateFade = function () {
        if (!this.options.fade) {
            return;
        }
        this.element.classList.remove('is-fade');
        // reset opacity
        this.staticSlides.forEach(function (staticSlide) {
            staticSlide.setOpacity('');
        });
    };

    /* ---- position & fading ---- */

    var positionSlider = proto.positionSlider;
    proto.positionSlider = function () {
        if (!this.options.fade) {
            positionSlider.apply(this, arguments);
            return;
        }

        this.fadeStaticSlides();
        // this.dispatchScrollEvent();
    };

    var positionSliderAtSelected = proto.positionSliderAtSelected;
    proto.positionSliderAtSelected = function () {
        if (this.options.fade) {
            // position fade slider at origin
            this.setTranslateX(0);
        }
        positionSliderAtSelected.apply(this, arguments);
    };

    proto.fadeStaticSlides = function () {
        if (this.staticSlides.length < 2) {
            return;
        }

        // get staticSlides to fade-in & fade-out
        var indexes = this.getFadeIndexes();
        var fadeStaticSlideA = this.staticSlides[indexes.a];
        var fadeStaticSlideB = this.staticSlides[indexes.b];
        var distance = this.wrapDifference(fadeStaticSlideA.target, fadeStaticSlideB.target);
        var progress = this.wrapDifference(fadeStaticSlideA.target, -this.x);
        progress = progress / distance;

        fadeStaticSlideA.setOpacity(1 - progress);
        fadeStaticSlideB.setOpacity(progress);

        // hide previous staticSlide
        var fadeHideIndex = indexes.a;
        if (this.isDragging) {
            fadeHideIndex = progress > 0.5 ? indexes.a : indexes.b;
        }

        if (this.fadeHideIndex > 0) {
            this.fadeHideIndex = Math.min(this.fadeHideIndex, this.staticSlides.length - 1);
        }

        var isNewHideIndex = this.fadeHideIndex != undefined &&
            this.fadeHideIndex != fadeHideIndex &&
            this.fadeHideIndex != indexes.a &&
            this.fadeHideIndex != indexes.b;
        if (isNewHideIndex) {
            // new fadeHideStaticSlide set, hide previous
            this.staticSlides[this.fadeHideIndex].setOpacity(0);
        }
        this.fadeHideIndex = fadeHideIndex;
    };

    proto.getFadeIndexes = function () {
        if (!this.isDragging && !this.didDragEnd) {
            return {
                a: this.fadeIndex,
                b: this.selectedIndex,
            };
        }
        if (this.options.wrapAround) {
            return this.getFadeDragWrapIndexes();
        } else {
            return this.getFadeDragLimitIndexes();
        }
    };

    proto.getFadeDragWrapIndexes = function () {
        var distances = this.staticSlides.map(function (staticSlide, i) {
            return this.getSlideDistance(-this.x, i);
        }, this);
        var absDistances = distances.map(function (distance) {
            return Math.abs(distance);
        });
        var minDistance = Math.min.apply(Math, absDistances);
        var closestIndex = absDistances.indexOf(minDistance);
        var distance = distances[closestIndex];
        var len = this.staticSlides.length;

        var delta = distance >= 0 ? 1 : -1;
        return {
            a: closestIndex,
            b: utils.modulo(closestIndex + delta, len),
        };
    };

    proto.getFadeDragLimitIndexes = function () {
        // calculate closest previous staticSlide
        var dragIndex = 0;
        for (var i = 0; i < this.staticSlides.length - 1; i++) {
            var staticSlide = this.staticSlides[i];
            if (-this.x < staticSlide.target) {
                break;
            }
            dragIndex = i;
        }
        return {
            a: dragIndex,
            b: dragIndex + 1,
        };
    };

    proto.wrapDifference = function (a, b) {
        var diff = b - a;

        if (!this.options.wrapAround) {
            return diff;
        }

        var diffPlus = diff + this.slideableWidth;
        var diffMinus = diff - this.slideableWidth;
        if (Math.abs(diffPlus) < Math.abs(diff)) {
            diff = diffPlus;
        }
        if (Math.abs(diffMinus) < Math.abs(diff)) {
            diff = diffMinus;
        }
        return diff;
    };

    // ---- wrapAround ---- //

    var _getWrapShiftCards = proto._getWrapShiftCards;
    proto._getWrapShiftCards = function () {
        if (!this.options.fade) {
            _getWrapShiftCards.apply(this, arguments);
        }
    };

    var shiftWrapCards = proto.shiftWrapCards;
    proto.shiftWrapCards = function () {
        if (!this.options.fade) {
            shiftWrapCards.apply(this, arguments);
        }
    };

    return FCarousel;
}));

// player & autoPlay
(function (window, factory) {
    // browser global
    factory(
        window.EvEmitter,
        window.utils,
        window.FCarousel
    );
}(window, function factory(EvEmitter, utils, FCarousel) {

    // -------------------------- Player -------------------------- //
    function Player(parent) {
        this.parent = parent;
        this.state = 'stopped';
        // visibility change event handler
        this.onVisibilityChange = this.visibilityChange.bind(this);
        this.onVisibilityPlay = this.visibilityPlay.bind(this);
    }

    Player.prototype = Object.create(EvEmitter.prototype);

    // start play
    Player.prototype.play = function () {
        if (this.state == 'playing') {
            return;
        }
        // do not play if page is hidden, start playing when page is visible
        var isPageHidden = document.hidden;
        if (isPageHidden) {
            document.addEventListener('visibilitychange', this.onVisibilityPlay);
            return;
        }

        this.state = 'playing';
        // listen to visibility change
        document.addEventListener('visibilitychange', this.onVisibilityChange);
        // start ticking
        this.tick();
    };

    Player.prototype.tick = function () {
        // do not tick if not playing
        if (this.state != 'playing') {
            return;
        }

        var time = this.parent.options.autoPlay;
        // default to 3 seconds
        time = typeof time == 'number' ? time : 3000;
        var _this = this;
        // HACK: reset ticks if stopped and started within interval
        this.clear();
        this.timeout = setTimeout(function () {
            _this.parent.next(true);
            _this.tick();
        }, time);
    };

    Player.prototype.stop = function () {
        this.state = 'stopped';
        this.clear();
        // remove visibility change event
        document.removeEventListener('visibilitychange', this.onVisibilityChange);
    };

    Player.prototype.clear = function () {
        clearTimeout(this.timeout);
    };

    Player.prototype.pause = function () {
        if (this.state == 'playing') {
            this.state = 'paused';
            this.clear();
        }
    };

    Player.prototype.unpause = function () {
        // re-start play if paused
        if (this.state == 'paused') {
            this.play();
        }
    };

    // pause if page visibility is hidden, unpause if visible
    Player.prototype.visibilityChange = function () {
        var isPageHidden = document.hidden;
        this[isPageHidden ? 'pause' : 'unpause']();
    };

    Player.prototype.visibilityPlay = function () {
        this.play();
        document.removeEventListener('visibilitychange', this.onVisibilityPlay);
    };

    // -------------------------- FCarousel -------------------------- //

    // utils.extend( FCarousel.defaults, {
    //   pauseAutoPlayOnHover: true
    // });
    $.extend(FCarousel.defaults, {
        pauseAutoPlayOnHover: true
    });

    FCarousel.createMethods.push('_createPlayer');

    var proto = FCarousel.prototype;
    proto._createPlayer = function () {
        if (!this.options.autoPlay) {
            return;
        }
        this.player = new Player(this);

        this.on('activate', this.activatePlayer);
        this.on('uiChange', this.stopPlayer);
        this.on('pointerDown', this.stopPlayer);
        this.on('deactivate', this.deactivatePlayer);
        
        this.on('settle', this.playPlayer);
    };

    proto.activatePlayer = function () {
        if (!this.options.autoPlay) {
            return;
        }
        this.player.play();
        this.element.addEventListener('mouseenter', this);
    };

    // Player API, don't hate the ... thanks I know where the door is

    proto.playPlayer = function () {
        this.player.play();
    };

    proto.stopPlayer = function () {
        this.player.stop();
    };

    proto.pausePlayer = function () {
        this.player.pause();
    };

    proto.unpausePlayer = function () {
        this.player.unpause();
    };

    proto.deactivatePlayer = function () {
        this.player.stop();
        this.element.removeEventListener('mouseenter', this);
    };

    // ----- mouseenter/leave ----- //

    // pause auto-play on hover
    proto.onmouseenter = function () {
        if (!this.options.pauseAutoPlayOnHover) {
            return;
        }
        this.player.pause();
        this.element.addEventListener('mouseleave', this);
    };

    // resume auto-play on hover off
    proto.onmouseleave = function () {
        this.player.unpause();
        this.element.removeEventListener('mouseleave', this);
    };

    // -----  ----- //

    FCarousel.Player = Player;

    return FCarousel;

}));

// ready for lazyload
(function (window, factory) {
    // browser global
    factory(
        window,
        window.FCarousel,
        window.utils
    );
}(window, function factory(window, FCarousel, utils) {
    'use strict';

    // -------------------------- LazyLoadPreparer -------------------------- //
    /**
     * class to handle loading images (prepar carousel images for lazy load)
     */
    function LazyLoadPreparer(imgItem, fCarousel) {
        this.imgItem = imgItem;
        this.fCarousel = fCarousel;
        this.prepareLazyload();
    };

    LazyLoadPreparer.prototype.prepareLazyload = function () {
        // change image item classNames
        var bPClassesArray = this.fCarousel.options.beforeLazyLoadPrepareClass.split(" "),
            aPClassesArray = this.fCarousel.options.afterLazyLoadPrepareClass.split(" "),
            elemClassList = this.imgItem.classList;

        // کد زیر درست عمل نمی کند چرا که فرمت درست برای آرگومان های
        // ارسالی به متدهای زیر به این صورت است:
        // htmlElem.classList.remove('progressive', 'pre-load')
        // this.imgItem.classList.remove.apply(bPClassesArray).add(aPClassesArray);

        elemClassList.remove.apply(elemClassList, bPClassesArray);
        elemClassList.add.apply(elemClassList, aPClassesArray);
    };

    // -------------------------- FCarousel -------------------------- //
    // ----- FCarousel defaults ----- //
    $.extend(FCarousel.defaults, {
        lazyLoad: true,
        beforeLazyLoadPrepareClass: 'progressive pre-load',
        afterLazyLoadPrepareClass: 'progressive replace'
    });

    // $.extend( FCarousel.selectors, {
    //   beforeLazyLoadPrepareClass: 'progressive pre-load',
    //   afterLazyLoadPrepareClass: 'progressive replace'
    // });

    FCarousel.createMethods.push('_createLazyloadPreparer');

    var proto = FCarousel.prototype;
    proto._createLazyloadPreparer = function () {
        this.on('select', this.readyToLazyLoading);
        // this.on( 'drag', this.readyToLazyLoading );
    };

    proto.readyToLazyLoading = function () {
        var lazyLoad = this.options.lazyLoad;
        if (!lazyLoad) {
            return;
        }
        // get adjacent cards, use lazyLoad option for adjacent count
        var adjCount = typeof lazyLoad == 'number' ? lazyLoad : 0;
        var cardElems = this.getAdjacentCardElements(adjCount);
        var bPClasses = this.options.beforeLazyLoadPrepareClass;

        // get lazy images in those cards
        var lazyImages = [];
        cardElems.forEach(function (cardElem) {
            var lazyCardImages = getCardLazyImages(cardElem, bPClasses);
            lazyImages = lazyImages.concat(lazyCardImages);
        });

        // load lazy images
        lazyImages.forEach(function (img) {
            new LazyLoadPreparer(img, this);
        }, this);
    };

    function getCardLazyImages(cardElem, bPClasses) {
        // check if card element is lazy image
        if (cardElem.nodeName == 'IMG' && utils.hasAllClasses(cardElem, bPClasses)) {
            return [cardElem];
        }

        // // select lazy images in card
        // var bPSelector = "." + bPClasses.replace(/\s+/g, ' ').trim().replace(" ", ".");
        // bPSelector = bPSelector.replace("..", ".");
        // var imgs = cardElem.querySelectorAll(bPSelector);

        // select lazy images in card
        var imgs = cardElem.getElementsByClassName(bPClasses);

        return utils.makeArray(imgs);
    }

    // -----  ----- //
    FCarousel.LazyLoadPreparer = LazyLoadPreparer;

    return FCarousel;
}));

// create carosels
(function (utils) {
    var my_carousels = $(".f-carousel");
    my_carousels = utils.makeArray(my_carousels).map(function (carousel) {
        return new FCarousel(carousel);
    });
})(window.utils);
