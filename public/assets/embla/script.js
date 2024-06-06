var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.findInternal = function (a, e, f) {
    a instanceof String && (a = String(a));
    for (var g = a.length, b = 0; b < g; b++) {
        var m = a[b];
        if (e.call(f, m, b, a)) return {
            i: b,
            v: m
        }
    }
    return {
        i: -1,
        v: void 0
    }
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, e, f) {
    a != Array.prototype && a != Object.prototype && (a[e] = f.value)
};
$jscomp.getGlobal = function (a) {
    return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global : a
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function (a, e, f, g) {
    if (e) {
        f = $jscomp.global;
        a = a.split(".");
        for (g = 0; g < a.length - 1; g++) {
            var b = a[g];
            b in f || (f[b] = {});
            f = f[b]
        }
        a = a[a.length - 1];
        g = f[a];
        e = e(g);
        e != g && null != e && $jscomp.defineProperty(f, a, {
            configurable: !0,
            writable: !0,
            value: e
        })
    }
};
$jscomp.polyfill("Array.prototype.findIndex", function (a) {
    return a ? a : function (a, f) {
        return $jscomp.findInternal(this, a, f).i
    }
}, "es6", "es3");
$jscomp.arrayIteratorImpl = function (a) {
    var e = 0;
    return function () {
        return e < a.length ? {
            done: !1,
            value: a[e++]
        } : {
            done: !0
        }
    }
};
$jscomp.arrayIterator = function (a) {
    return {
        next: $jscomp.arrayIteratorImpl(a)
    }
};
$jscomp.makeIterator = function (a) {
    var e = "undefined" != typeof Symbol && Symbol.iterator && a[Symbol.iterator];
    return e ? e.call(a) : $jscomp.arrayIterator(a)
};
$jscomp.FORCE_POLYFILL_PROMISE = !1;
$jscomp.polyfill("Promise", function (a) {
    function e() {
        this.batch_ = null
    }

    function f(c) {
        return c instanceof b ? c : new b(function (a, d) {
            a(c)
        })
    }
    if (a && !$jscomp.FORCE_POLYFILL_PROMISE) return a;
    e.prototype.asyncExecute = function (c) {
        if (null == this.batch_) {
            this.batch_ = [];
            var a = this;
            this.asyncExecuteFunction(function () {
                a.executeBatch_()
            })
        }
        this.batch_.push(c)
    };
    var g = $jscomp.global.setTimeout;
    e.prototype.asyncExecuteFunction = function (c) {
        g(c, 0)
    };
    e.prototype.executeBatch_ = function () {
        for (; this.batch_ && this.batch_.length;) {
            var c =
                this.batch_;
            this.batch_ = [];
            for (var a = 0; a < c.length; ++a) {
                var d = c[a];
                c[a] = null;
                try {
                    d()
                } catch (n) {
                    this.asyncThrow_(n)
                }
            }
        }
        this.batch_ = null
    };
    e.prototype.asyncThrow_ = function (c) {
        this.asyncExecuteFunction(function () {
            throw c;
        })
    };
    var b = function (c) {
        this.state_ = 0;
        this.result_ = void 0;
        this.onSettledCallbacks_ = [];
        var a = this.createResolveAndReject_();
        try {
            c(a.resolve, a.reject)
        } catch (d) {
            a.reject(d)
        }
    };
    b.prototype.createResolveAndReject_ = function () {
        function a(a) {
            return function (c) {
                d || (d = !0, a.call(b, c))
            }
        }
        var b = this,
            d = !1;
        return {
            resolve: a(this.resolveTo_),
            reject: a(this.reject_)
        }
    };
    b.prototype.resolveTo_ = function (a) {
        if (a === this) this.reject_(new TypeError("A Promise cannot resolve to itself"));
        else if (a instanceof b) this.settleSameAsPromise_(a);
        else {
            a: switch (typeof a) {
                case "object":
                    var c = null != a;
                    break a;
                case "function":
                    c = !0;
                    break a;
                default:
                    c = !1
            }
            c ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a)
        }
    };
    b.prototype.resolveToNonPromiseObj_ = function (a) {
        var c = void 0;
        try {
            c = a.then
        } catch (d) {
            this.reject_(d);
            return
        }
        "function" == typeof c ?
            this.settleSameAsThenable_(c, a) : this.fulfill_(a)
    };
    b.prototype.reject_ = function (a) {
        this.settle_(2, a)
    };
    b.prototype.fulfill_ = function (a) {
        this.settle_(1, a)
    };
    b.prototype.settle_ = function (a, b) {
        if (0 != this.state_) throw Error("Cannot settle(" + a + ", " + b + "): Promise already settled in state" + this.state_);
        this.state_ = a;
        this.result_ = b;
        this.executeOnSettledCallbacks_()
    };
    b.prototype.executeOnSettledCallbacks_ = function () {
        if (null != this.onSettledCallbacks_) {
            for (var a = 0; a < this.onSettledCallbacks_.length; ++a) m.asyncExecute(this.onSettledCallbacks_[a]);
            this.onSettledCallbacks_ = null
        }
    };
    var m = new e;
    b.prototype.settleSameAsPromise_ = function (a) {
        var b = this.createResolveAndReject_();
        a.callWhenSettled_(b.resolve, b.reject)
    };
    b.prototype.settleSameAsThenable_ = function (a, b) {
        var d = this.createResolveAndReject_();
        try {
            a.call(b, d.resolve, d.reject)
        } catch (n) {
            d.reject(n)
        }
    };
    b.prototype.then = function (a, e) {
        function d(a, b) {
            return "function" == typeof a ? function (b) {
                try {
                    c(a(b))
                } catch (t) {
                    f(t)
                }
            } : b
        }
        var c, f, g = new b(function (a, b) {
            c = a;
            f = b
        });
        this.callWhenSettled_(d(a, c), d(e, f));
        return g
    };
    b.prototype.catch = function (a) {
        return this.then(void 0, a)
    };
    b.prototype.callWhenSettled_ = function (a, b) {
        function d() {
            switch (c.state_) {
                case 1:
                    a(c.result_);
                    break;
                case 2:
                    b(c.result_);
                    break;
                default:
                    throw Error("Unexpected state: " + c.state_);
            }
        }
        var c = this;
        null == this.onSettledCallbacks_ ? m.asyncExecute(d) : this.onSettledCallbacks_.push(d)
    };
    b.resolve = f;
    b.reject = function (a) {
        return new b(function (b, d) {
            d(a)
        })
    };
    b.race = function (a) {
        return new b(function (b, d) {
            for (var c = $jscomp.makeIterator(a), e = c.next(); !e.done; e = c.next()) f(e.value).callWhenSettled_(b,
                d)
        })
    };
    b.all = function (a) {
        var c = $jscomp.makeIterator(a),
            d = c.next();
        return d.done ? f([]) : new b(function (a, b) {
            function e(b) {
                return function (c) {
                    h[b] = c;
                    l--;
                    0 == l && a(h)
                }
            }
            var h = [],
                l = 0;
            do h.push(void 0), l++, f(d.value).callWhenSettled_(e(h.length - 1), b), d = c.next(); while (!d.done)
        })
    };
    return b
}, "es6", "es3");
$jscomp.owns = function (a, e) {
    return Object.prototype.hasOwnProperty.call(a, e)
};
$jscomp.assign = "function" == typeof Object.assign ? Object.assign : function (a, e) {
    for (var f = 1; f < arguments.length; f++) {
        var g = arguments[f];
        if (g)
            for (var b in g) $jscomp.owns(g, b) && (a[b] = g[b])
    }
    return a
};
$jscomp.polyfill("Object.assign", function (a) {
    return a || $jscomp.assign
}, "es6", "es3");
~ function () {
    function a(a, b, c) {
        return function () {
            c.canScrollPrev() ? a.removeAttribute("disabled") : a.setAttribute("disabled", "disabled");
            c.canScrollNext() ? b.removeAttribute("disabled") : b.setAttribute("disabled", "disabled")
        }
    }

    function e(a, b, c) {
        c = void 0 === c ? 0 : c;
        var e = d.findIndex(function (b) {
            return b.carouselId === a
        }); - 1 !== e && b && !d[e].intervalId && (d[e].intervalId = setInterval(function () {
            if (!document.hidden) {
                var b = d.findIndex(function (b) {
                    return b.carouselId === a
                }); - 1 !== b && (1 !== d[b].embla.scrollProgress() ? d[b].embla.scrollNext() :
                    d[b].embla.scrollTo(0))
            }
        }, 1E3 * c))
    }

    function f(b, c) {
        return new Promise(function (e, h) {
            var f = b.querySelector(".embla"),
                g = b.getAttribute("id"),
                l = f.querySelector(".embla__viewport");
            h = f.querySelector(".embla__button--prev");
            f = f.querySelector(".embla__button--next");
            if (-1 === d.findIndex(function (a) {
                    return a.carouselId === g
                })) {
                l = EmblaCarousel(l, c);
                var q = a(h, f, l);
                h.addEventListener("click", l.scrollPrev, !1);
                f.addEventListener("click", l.scrollNext, !1);
                l.on("select", q);
                l.on("init", q);
                d.push({
                    carouselId: g,
                    embla: l,
                    intervalId: null
                });
                e(l)
            }
        })
    }

    function g(a) {
        var b = {};
        [].forEach.call(a.attributes, function (a) {
            if (/^data-/.test(a.name)) {
                var c = a.name.substr(5).replace(/-(.)/g, function (a, b) {
                    return b.toUpperCase()
                });
                b[c] = m(a.value)
            }
        });
        return b
    }

    function b(a) {
        var b = d.findIndex(function (b) {
            return b.carouselId === a
        }); - 1 !== b && ("embla" in d[b] && d[b].embla.destroy(), clearInterval(d[b].intervalId), d.splice(b, 1))
    }

    function m(a) {
        return "true" === a ? !0 : a
    }

    function c(a, b) {
        var c = {},
            e;
        for (e in b) a[e] || (c[e] = !1);
        return c
    }
    var p = {
            align: "center",
            draggable: !1,
            skipSnaps: !0,
            loop: !1,
            autoPlay: !1,
            autoPlayInterval: 5
        },
        d = [],
        n = !1,
        r, u = "function" == typeof jQuery;
    u && (r = jQuery);
    if (document.querySelector("html").classList.contains("is-builder") && u) r(document).on("add.cards", function (a) {
        if (!r(a.target).hasClass("mbr-embla") || n) return Promise.resolve();
        var d = a.target.getAttribute("id");
        b(d);
        var h = g(a.target.querySelector(".embla")),
            t = c(h, p),
            k = Object.assign(h, t);
        k.draggable = !1;
        return f(a.target, k).then(function (a) {
            a.reInit(k);
            e(d, k.autoPlay, k.autoPlayInterval);
            n = !0;
            setTimeout(function () {
                n = !1
            }, 0)
        })
    }).on("delete.cards", function (a) {
        a = a.target.getAttribute("id");
        b(a)
    }).on("changeParameter.cards", function (a, d, q) {
        if (r(a.target).hasClass("mbr-embla")) {
            var h = a.target.getAttribute("id"),
                k = g(a.target.querySelector(".embla")),
                l = c(k, p);
            k = Object.assign(k, l);
            switch (d) {
                case "loop":
                    p.loop = q ? !0 : !1;
                    break;
                case "autoplay":
                    p.autoPlay = q;
                    break;
                case "interval":
                    p.autoPlayInterval = +q
            }
            b(h);
            k.draggable = !1;
            f(a.target, k);
            e(h, k.autoPlay, k.autoPlayInterval)
        }
    });
    else "undefined" === typeof window.initCarouseMultiplePlugin &&
        (window.initCarouseMultiplePlugin = !0, document.querySelectorAll(".mbr-embla").forEach(function (a) {
            var b = a.getAttribute("id"),
                d = g(a.querySelector(".embla")),
                h = c(d, p),
                k = Object.assign(d, h);
            f(a, Object.assign(d, h));
            e(b, k.autoPlay, +k.autoPlayInterval)
        }))
}();