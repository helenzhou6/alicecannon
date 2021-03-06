!(function() {
  "use strict";
  function t(i) {
    if (!i) throw new Error("No options passed to Waypoint constructor");
    if (!i.element)
      throw new Error("No element option passed to Waypoint constructor");
    if (!i.handler)
      throw new Error("No handler option passed to Waypoint constructor");
    (this.key = "waypoint-" + e),
      (this.options = t.Adapter.extend({}, t.defaults, i)),
      (this.element = this.options.element),
      (this.adapter = new t.Adapter(this.element)),
      (this.callback = i.handler),
      (this.axis = this.options.horizontal ? "horizontal" : "vertical"),
      (this.enabled = this.options.enabled),
      (this.triggerPoint = null),
      (this.group = t.Group.findOrCreate({
        name: this.options.group,
        axis: this.axis
      })),
      (this.context = t.Context.findOrCreateByElement(this.options.context)),
      t.offsetAliases[this.options.offset] &&
        (this.options.offset = t.offsetAliases[this.options.offset]),
      this.group.add(this),
      this.context.add(this),
      (n[this.key] = this),
      (e += 1);
  }
  var e = 0,
    n = {};
  (t.prototype.queueTrigger = function(t) {
    this.group.queueTrigger(this, t);
  }),
    (t.prototype.trigger = function(t) {
      this.enabled && this.callback && this.callback.apply(this, t);
    }),
    (t.prototype.destroy = function() {
      this.context.remove(this), this.group.remove(this), delete n[this.key];
    }),
    (t.prototype.disable = function() {
      return (this.enabled = !1), this;
    }),
    (t.prototype.enable = function() {
      return this.context.refresh(), (this.enabled = !0), this;
    }),
    (t.prototype.next = function() {
      return this.group.next(this);
    }),
    (t.prototype.previous = function() {
      return this.group.previous(this);
    }),
    (t.invokeAll = function(t) {
      var e = [];
      for (var i in n) e.push(n[i]);
      for (var o = 0, r = e.length; r > o; o++) e[o][t]();
    }),
    (t.destroyAll = function() {
      t.invokeAll("destroy");
    }),
    (t.disableAll = function() {
      t.invokeAll("disable");
    }),
    (t.enableAll = function() {
      t.Context.refreshAll();
      for (var e in n) n[e].enabled = !0;
      return this;
    }),
    (t.refreshAll = function() {
      t.Context.refreshAll();
    }),
    (t.viewportHeight = function() {
      return window.innerHeight || document.documentElement.clientHeight;
    }),
    (t.viewportWidth = function() {
      return document.documentElement.clientWidth;
    }),
    (t.adapters = []),
    (t.defaults = {
      context: window,
      continuous: !0,
      enabled: !0,
      group: "default",
      horizontal: !1,
      offset: 0
    }),
    (t.offsetAliases = {
      "bottom-in-view": function() {
        return this.context.innerHeight() - this.adapter.outerHeight();
      },
      "right-in-view": function() {
        return this.context.innerWidth() - this.adapter.outerWidth();
      }
    }),
    (window.Waypoint = t);
})(),
  (function() {
    "use strict";
    function t(t) {
      window.setTimeout(t, 1e3 / 60);
    }
    function e(t) {
      (this.element = t),
        (this.Adapter = o.Adapter),
        (this.adapter = new this.Adapter(t)),
        (this.key = "waypoint-context-" + n),
        (this.didScroll = !1),
        (this.didResize = !1),
        (this.oldScroll = {
          x: this.adapter.scrollLeft(),
          y: this.adapter.scrollTop()
        }),
        (this.waypoints = { vertical: {}, horizontal: {} }),
        (t.waypointContextKey = this.key),
        (i[t.waypointContextKey] = this),
        (n += 1),
        o.windowContext ||
          ((o.windowContext = !0), (o.windowContext = new e(window))),
        this.createThrottledScrollHandler(),
        this.createThrottledResizeHandler();
    }
    var n = 0,
      i = {},
      o = window.Waypoint,
      r = window.onload;
    (e.prototype.add = function(t) {
      var e = t.options.horizontal ? "horizontal" : "vertical";
      (this.waypoints[e][t.key] = t), this.refresh();
    }),
      (e.prototype.checkEmpty = function() {
        var t = this.Adapter.isEmptyObject(this.waypoints.horizontal),
          e = this.Adapter.isEmptyObject(this.waypoints.vertical),
          n = this.element == this.element.window;
        t && e && !n && (this.adapter.off(".waypoints"), delete i[this.key]);
      }),
      (e.prototype.createThrottledResizeHandler = function() {
        function t() {
          e.handleResize(), (e.didResize = !1);
        }
        var e = this;
        this.adapter.on("resize.waypoints", function() {
          e.didResize || ((e.didResize = !0), o.requestAnimationFrame(t));
        });
      }),
      (e.prototype.createThrottledScrollHandler = function() {
        function t() {
          e.handleScroll(), (e.didScroll = !1);
        }
        var e = this;
        this.adapter.on("scroll.waypoints", function() {
          (!e.didScroll || o.isTouch) &&
            ((e.didScroll = !0), o.requestAnimationFrame(t));
        });
      }),
      (e.prototype.handleResize = function() {
        o.Context.refreshAll();
      }),
      (e.prototype.handleScroll = function() {
        var t = {},
          e = {
            horizontal: {
              newScroll: this.adapter.scrollLeft(),
              oldScroll: this.oldScroll.x,
              forward: "right",
              backward: "left"
            },
            vertical: {
              newScroll: this.adapter.scrollTop(),
              oldScroll: this.oldScroll.y,
              forward: "down",
              backward: "up"
            }
          };
        for (var n in e) {
          var i = e[n],
            o = i.newScroll > i.oldScroll,
            r = o ? i.forward : i.backward;
          for (var s in this.waypoints[n]) {
            var a = this.waypoints[n][s];
            if (null !== a.triggerPoint) {
              var l = i.oldScroll < a.triggerPoint,
                c = i.newScroll >= a.triggerPoint,
                u = l && c,
                d = !l && !c;
              (u || d) && (a.queueTrigger(r), (t[a.group.id] = a.group));
            }
          }
        }
        for (var f in t) t[f].flushTriggers();
        this.oldScroll = { x: e.horizontal.newScroll, y: e.vertical.newScroll };
      }),
      (e.prototype.innerHeight = function() {
        return this.element == this.element.window
          ? o.viewportHeight()
          : this.adapter.innerHeight();
      }),
      (e.prototype.remove = function(t) {
        delete this.waypoints[t.axis][t.key], this.checkEmpty();
      }),
      (e.prototype.innerWidth = function() {
        return this.element == this.element.window
          ? o.viewportWidth()
          : this.adapter.innerWidth();
      }),
      (e.prototype.destroy = function() {
        var t = [];
        for (var e in this.waypoints)
          for (var n in this.waypoints[e]) t.push(this.waypoints[e][n]);
        for (var i = 0, o = t.length; o > i; i++) t[i].destroy();
      }),
      (e.prototype.refresh = function() {
        var t,
          e = this.element == this.element.window,
          n = e ? void 0 : this.adapter.offset(),
          i = {};
        this.handleScroll(),
          (t = {
            horizontal: {
              contextOffset: e ? 0 : n.left,
              contextScroll: e ? 0 : this.oldScroll.x,
              contextDimension: this.innerWidth(),
              oldScroll: this.oldScroll.x,
              forward: "right",
              backward: "left",
              offsetProp: "left"
            },
            vertical: {
              contextOffset: e ? 0 : n.top,
              contextScroll: e ? 0 : this.oldScroll.y,
              contextDimension: this.innerHeight(),
              oldScroll: this.oldScroll.y,
              forward: "down",
              backward: "up",
              offsetProp: "top"
            }
          });
        for (var r in t) {
          var s = t[r];
          for (var a in this.waypoints[r]) {
            var l,
              c,
              u,
              d,
              f,
              p = this.waypoints[r][a],
              h = p.options.offset,
              m = p.triggerPoint,
              y = 0,
              g = null == m;
            p.element !== p.element.window &&
              (y = p.adapter.offset()[s.offsetProp]),
              "function" == typeof h
                ? (h = h.apply(p))
                : "string" == typeof h &&
                  ((h = parseFloat(h)),
                  p.options.offset.indexOf("%") > -1 &&
                    (h = Math.ceil(s.contextDimension * h / 100))),
              (l = s.contextScroll - s.contextOffset),
              (p.triggerPoint = Math.floor(y + l - h)),
              (c = m < s.oldScroll),
              (u = p.triggerPoint >= s.oldScroll),
              (d = c && u),
              (f = !c && !u),
              !g && d
                ? (p.queueTrigger(s.backward), (i[p.group.id] = p.group))
                : !g && f
                  ? (p.queueTrigger(s.forward), (i[p.group.id] = p.group))
                  : g &&
                    s.oldScroll >= p.triggerPoint &&
                    (p.queueTrigger(s.forward), (i[p.group.id] = p.group));
          }
        }
        return (
          o.requestAnimationFrame(function() {
            for (var t in i) i[t].flushTriggers();
          }),
          this
        );
      }),
      (e.findOrCreateByElement = function(t) {
        return e.findByElement(t) || new e(t);
      }),
      (e.refreshAll = function() {
        for (var t in i) i[t].refresh();
      }),
      (e.findByElement = function(t) {
        return i[t.waypointContextKey];
      }),
      (window.onload = function() {
        r && r(), e.refreshAll();
      }),
      (o.requestAnimationFrame = function(e) {
        (
          window.requestAnimationFrame ||
          window.mozRequestAnimationFrame ||
          window.webkitRequestAnimationFrame ||
          t
        ).call(window, e);
      }),
      (o.Context = e);
  })(),
  (function() {
    "use strict";
    function t(t, e) {
      return t.triggerPoint - e.triggerPoint;
    }
    function e(t, e) {
      return e.triggerPoint - t.triggerPoint;
    }
    function n(t) {
      (this.name = t.name),
        (this.axis = t.axis),
        (this.id = this.name + "-" + this.axis),
        (this.waypoints = []),
        this.clearTriggerQueues(),
        (i[this.axis][this.name] = this);
    }
    var i = { vertical: {}, horizontal: {} },
      o = window.Waypoint;
    (n.prototype.add = function(t) {
      this.waypoints.push(t);
    }),
      (n.prototype.clearTriggerQueues = function() {
        this.triggerQueues = { up: [], down: [], left: [], right: [] };
      }),
      (n.prototype.flushTriggers = function() {
        for (var n in this.triggerQueues) {
          var i = this.triggerQueues[n],
            o = "up" === n || "left" === n;
          i.sort(o ? e : t);
          for (var r = 0, s = i.length; s > r; r += 1) {
            var a = i[r];
            (a.options.continuous || r === i.length - 1) && a.trigger([n]);
          }
        }
        this.clearTriggerQueues();
      }),
      (n.prototype.next = function(e) {
        this.waypoints.sort(t);
        var n = o.Adapter.inArray(e, this.waypoints);
        return n === this.waypoints.length - 1 ? null : this.waypoints[n + 1];
      }),
      (n.prototype.previous = function(e) {
        this.waypoints.sort(t);
        var n = o.Adapter.inArray(e, this.waypoints);
        return n ? this.waypoints[n - 1] : null;
      }),
      (n.prototype.queueTrigger = function(t, e) {
        this.triggerQueues[e].push(t);
      }),
      (n.prototype.remove = function(t) {
        var e = o.Adapter.inArray(t, this.waypoints);
        e > -1 && this.waypoints.splice(e, 1);
      }),
      (n.prototype.first = function() {
        return this.waypoints[0];
      }),
      (n.prototype.last = function() {
        return this.waypoints[this.waypoints.length - 1];
      }),
      (n.findOrCreate = function(t) {
        return i[t.axis][t.name] || new n(t);
      }),
      (o.Group = n);
  })(),
  (function() {
    "use strict";
    function t(t) {
      return t === t.window;
    }
    function e(e) {
      return t(e) ? e : e.defaultView;
    }
    function n(t) {
      (this.element = t), (this.handlers = {});
    }
    var i = window.Waypoint;
    (n.prototype.innerHeight = function() {
      return t(this.element)
        ? this.element.innerHeight
        : this.element.clientHeight;
    }),
      (n.prototype.innerWidth = function() {
        return t(this.element)
          ? this.element.innerWidth
          : this.element.clientWidth;
      }),
      (n.prototype.off = function(t, e) {
        function n(t, e, n) {
          for (var i = 0, o = e.length - 1; o > i; i++) {
            var r = e[i];
            (n && n !== r) || t.removeEventListener(r);
          }
        }
        var i = t.split("."),
          o = i[0],
          r = i[1],
          s = this.element;
        if (r && this.handlers[r] && o)
          n(s, this.handlers[r][o], e), (this.handlers[r][o] = []);
        else if (o)
          for (var a in this.handlers)
            n(s, this.handlers[a][o] || [], e), (this.handlers[a][o] = []);
        else if (r && this.handlers[r]) {
          for (var l in this.handlers[r]) n(s, this.handlers[r][l], e);
          this.handlers[r] = {};
        }
      }),
      (n.prototype.offset = function() {
        if (!this.element.ownerDocument) return null;
        var t = this.element.ownerDocument.documentElement,
          n = e(this.element.ownerDocument),
          i = { top: 0, left: 0 };
        return (
          this.element.getBoundingClientRect &&
            (i = this.element.getBoundingClientRect()),
          {
            top: i.top + n.pageYOffset - t.clientTop,
            left: i.left + n.pageXOffset - t.clientLeft
          }
        );
      }),
      (n.prototype.on = function(t, e) {
        var n = t.split("."),
          i = n[0],
          o = n[1] || "__default",
          r = (this.handlers[o] = this.handlers[o] || {});
        (r[i] = r[i] || []).push(e), this.element.addEventListener(i, e);
      }),
      (n.prototype.outerHeight = function(e) {
        var n,
          i = this.innerHeight();
        return (
          e &&
            !t(this.element) &&
            ((n = window.getComputedStyle(this.element)),
            (i += parseInt(n.marginTop, 10)),
            (i += parseInt(n.marginBottom, 10))),
          i
        );
      }),
      (n.prototype.outerWidth = function(e) {
        var n,
          i = this.innerWidth();
        return (
          e &&
            !t(this.element) &&
            ((n = window.getComputedStyle(this.element)),
            (i += parseInt(n.marginLeft, 10)),
            (i += parseInt(n.marginRight, 10))),
          i
        );
      }),
      (n.prototype.scrollLeft = function() {
        var t = e(this.element);
        return t ? t.pageXOffset : this.element.scrollLeft;
      }),
      (n.prototype.scrollTop = function() {
        var t = e(this.element);
        return t ? t.pageYOffset : this.element.scrollTop;
      }),
      (n.extend = function() {
        function t(t, e) {
          if ("object" == typeof t && "object" == typeof e)
            for (var n in e) e.hasOwnProperty(n) && (t[n] = e[n]);
          return t;
        }
        for (
          var e = Array.prototype.slice.call(arguments), n = 1, i = e.length;
          i > n;
          n++
        )
          t(e[0], e[n]);
        return e[0];
      }),
      (n.inArray = function(t, e, n) {
        return null == e ? -1 : e.indexOf(t, n);
      }),
      (n.isEmptyObject = function(t) {
        for (var e in t) return !1;
        return !0;
      }),
      i.adapters.push({ name: "noframework", Adapter: n }),
      (i.Adapter = n);
  })(),
  (function(t, e) {
    var n = e(t, t.document);
    (t.lazySizes = n),
      "object" == typeof module && module.exports && (module.exports = n);
  })(window, function(t, e) {
    "use strict";
    if (e.getElementsByClassName) {
      var n,
        i,
        o = e.documentElement,
        r = t.Date,
        s = t.HTMLPictureElement,
        a = "addEventListener",
        l = "getAttribute",
        c = t[a],
        u = t.setTimeout,
        d = t.requestAnimationFrame || u,
        f = t.requestIdleCallback,
        p = /^picture$/i,
        h = ["load", "error", "lazyincluded", "_lazyloaded"],
        m = {},
        y = Array.prototype.forEach,
        g = function(t, e) {
          return (
            m[e] || (m[e] = new RegExp("(\\s|^)" + e + "(\\s|$)")),
            m[e].test(t[l]("class") || "") && m[e]
          );
        },
        w = function(t, e) {
          g(t, e) ||
            t.setAttribute("class", (t[l]("class") || "").trim() + " " + e);
        },
        v = function(t, e) {
          var n;
          (n = g(t, e)) &&
            t.setAttribute("class", (t[l]("class") || "").replace(n, " "));
        },
        b = function(t, e, n) {
          var i = n ? a : "removeEventListener";
          n && b(t, e),
            h.forEach(function(n) {
              t[i](n, e);
            });
        },
        x = function(t, i, o, r, s) {
          var a = e.createEvent("CustomEvent");
          return (
            o || (o = {}),
            (o.instance = n),
            a.initCustomEvent(i, !r, !s, o),
            t.dispatchEvent(a),
            a
          );
        },
        A = function(e, n) {
          var o;
          !s && (o = t.picturefill || i.pf)
            ? o({ reevaluate: !0, elements: [e] })
            : n && n.src && (e.src = n.src);
        },
        z = function(t, e) {
          return (getComputedStyle(t, null) || {})[e];
        },
        E = function(t, e, n) {
          for (
            n = n || t.offsetWidth;
            n < i.minSize && e && !t._lazysizesWidth;

          )
            (n = e.offsetWidth), (e = e.parentNode);
          return n;
        },
        S = (function() {
          var t,
            n,
            i = [],
            o = [],
            r = i,
            s = function() {
              var e = r;
              for (r = i.length ? o : i, t = !0, n = !1; e.length; )
                e.shift()();
              t = !1;
            },
            a = function(i, o) {
              t && !o
                ? i.apply(this, arguments)
                : (r.push(i), n || ((n = !0), (e.hidden ? u : d)(s)));
            };
          return (a._lsFlush = s), a;
        })(),
        C = function(t, e) {
          return e
            ? function() {
                S(t);
              }
            : function() {
                var e = this,
                  n = arguments;
                S(function() {
                  t.apply(e, n);
                });
              };
        },
        q = function(t) {
          var e,
            n = 0,
            i = 125,
            o = 666,
            s = 666,
            a = function() {
              (e = !1), (n = r.now()), t();
            },
            l = f
              ? function() {
                  f(a, { timeout: s }), 666 !== s && (s = 666);
                }
              : C(function() {
                  u(a);
                }, !0);
          return function(t) {
            var i;
            (t = !0 === t) && (s = 44),
              e ||
                ((e = !0),
                (i = 125 - (r.now() - n)),
                0 > i && (i = 0),
                t || (9 > i && f) ? l() : u(l, i));
          };
        },
        k = function(t) {
          var e,
            n,
            i = 99,
            o = function() {
              (e = null), t();
            },
            s = function() {
              var t = r.now() - n;
              99 > t ? u(s, 99 - t) : (f || o)(o);
            };
          return function() {
            (n = r.now()), e || (e = u(s, 99));
          };
        },
        T = (function() {
          var n,
            s,
            d,
            f,
            h,
            m,
            E,
            T,
            L,
            W,
            N,
            R,
            _,
            H,
            j,
            M = /^img$/i,
            P = /^iframe$/i,
            F = "onscroll" in t && !/glebot/.test(navigator.userAgent),
            D = 0,
            B = 0,
            I = 0,
            Q = -1,
            X = function(t) {
              I--,
                t && t.target && b(t.target, X),
                (!t || 0 > I || !t.target) && (I = 0);
            },
            Y = function(t, n) {
              var i,
                r = t,
                s =
                  "hidden" == z(e.body, "visibility") ||
                  "hidden" != z(t, "visibility");
              for (
                L -= n, R += n, W -= n, N += n;
                s && (r = r.offsetParent) && r != e.body && r != o;

              )
                (s = (z(r, "opacity") || 1) > 0) &&
                  "visible" != z(r, "overflow") &&
                  ((i = r.getBoundingClientRect()),
                  (s =
                    N > i.left &&
                    W < i.right &&
                    R > i.top - 1 &&
                    L < i.bottom + 1));
              return s;
            },
            K = function() {
              var t, r, a, c, u, f, p, m, y;
              if ((h = i.loadMode) && 8 > I && (t = n.length)) {
                (r = 0),
                  Q++,
                  null == H &&
                    ("expand" in i ||
                      (i.expand =
                        o.clientHeight > 500 && o.clientWidth > 500
                          ? 500
                          : 370),
                    (_ = i.expand),
                    (H = _ * i.expFactor)),
                  H > B && 1 > I && Q > 2 && h > 2 && !e.hidden
                    ? ((B = H), (Q = 0))
                    : (B = h > 1 && Q > 1 && 6 > I ? _ : 0);
                for (; t > r; r++)
                  if (n[r] && !n[r]._lazyRace)
                    if (F)
                      if (
                        (((m = n[r][l]("data-expand")) && (f = 1 * m)) ||
                          (f = B),
                        y !== f &&
                          ((E = innerWidth + f * j),
                          (T = innerHeight + f),
                          (p = -1 * f),
                          (y = f)),
                        (a = n[r].getBoundingClientRect()),
                        (R = a.bottom) >= p &&
                          (L = a.top) <= T &&
                          (N = a.right) >= p * j &&
                          (W = a.left) <= E &&
                          (R || N || W || L) &&
                          (i.loadHidden || "hidden" != z(n[r], "visibility")) &&
                          ((d && 3 > I && !m && (3 > h || 4 > Q)) ||
                            Y(n[r], f)))
                      ) {
                        if ((et(n[r]), (u = !0), I > 9)) break;
                      } else
                        !u &&
                          d &&
                          !c &&
                          4 > I &&
                          4 > Q &&
                          h > 2 &&
                          (s[0] || i.preloadAfterLoad) &&
                          (s[0] ||
                            (!m &&
                              (R ||
                                N ||
                                W ||
                                L ||
                                "auto" != n[r][l](i.sizesAttr)))) &&
                          (c = s[0] || n[r]);
                    else et(n[r]);
                c && !u && et(c);
              }
            },
            G = q(K),
            Z = function(t) {
              w(t.target, i.loadedClass),
                v(t.target, i.loadingClass),
                b(t.target, J);
            },
            V = C(Z),
            J = function(t) {
              V({ target: t.target });
            },
            $ = function(t, e) {
              try {
                t.contentWindow.location.replace(e);
              } catch (n) {
                t.src = e;
              }
            },
            U = function(t) {
              var e,
                n = t[l](i.srcsetAttr);
              (e = i.customMedia[t[l]("data-media") || t[l]("media")]) &&
                t.setAttribute("media", e),
                n && t.setAttribute("srcset", n);
            },
            tt = C(function(t, e, n, o, r) {
              var s, a, c, d, h, m;
              (h = x(t, "lazybeforeunveil", e)).defaultPrevented ||
                (o && (n ? w(t, i.autosizesClass) : t.setAttribute("sizes", o)),
                (a = t[l](i.srcsetAttr)),
                (s = t[l](i.srcAttr)),
                r && ((c = t.parentNode), (d = c && p.test(c.nodeName || ""))),
                (m = e.firesLoad || ("src" in t && (a || s || d))),
                (h = { target: t }),
                m &&
                  (b(t, X, !0),
                  clearTimeout(f),
                  (f = u(X, 2500)),
                  w(t, i.loadingClass),
                  b(t, J, !0)),
                d && y.call(c.getElementsByTagName("source"), U),
                a
                  ? t.setAttribute("srcset", a)
                  : s && !d && (P.test(t.nodeName) ? $(t, s) : (t.src = s)),
                r && (a || d) && A(t, { src: s })),
                t._lazyRace && delete t._lazyRace,
                v(t, i.lazyClass),
                S(function() {
                  (!m || (t.complete && t.naturalWidth > 1)) &&
                    (m ? X(h) : I--, Z(h));
                }, !0);
            }),
            et = function(t) {
              var e,
                n = M.test(t.nodeName),
                o = n && (t[l](i.sizesAttr) || t[l]("sizes")),
                r = "auto" == o;
              ((!r && d) ||
                !n ||
                (!t.src && !t.srcset) ||
                t.complete ||
                g(t, i.errorClass)) &&
                ((e = x(t, "lazyunveilread").detail),
                r && O.updateElem(t, !0, t.offsetWidth),
                (t._lazyRace = !0),
                I++,
                tt(t, e, r, o, n));
            },
            nt = function() {
              if (!d) {
                if (r.now() - m < 999) return void u(nt, 999);
                var t = k(function() {
                  (i.loadMode = 3), G();
                });
                (d = !0),
                  (i.loadMode = 3),
                  G(),
                  c(
                    "scroll",
                    function() {
                      3 == i.loadMode && (i.loadMode = 2), t();
                    },
                    !0
                  );
              }
            };
          return {
            _: function() {
              (m = r.now()),
                (n = e.getElementsByClassName(i.lazyClass)),
                (s = e.getElementsByClassName(
                  i.lazyClass + " " + i.preloadClass
                )),
                (j = i.hFac),
                c("scroll", G, !0),
                c("resize", G, !0),
                t.MutationObserver
                  ? new MutationObserver(G).observe(o, {
                      childList: !0,
                      subtree: !0,
                      attributes: !0
                    })
                  : (o[a]("DOMNodeInserted", G, !0),
                    o[a]("DOMAttrModified", G, !0),
                    setInterval(G, 999)),
                c("hashchange", G, !0),
                [
                  "focus",
                  "mouseover",
                  "click",
                  "load",
                  "transitionend",
                  "animationend",
                  "webkitAnimationEnd"
                ].forEach(function(t) {
                  e[a](t, G, !0);
                }),
                /d$|^c/.test(e.readyState)
                  ? nt()
                  : (c("load", nt), e[a]("DOMContentLoaded", G), u(nt, 2e4)),
                n.length ? (K(), S._lsFlush()) : G();
            },
            checkElems: G,
            unveil: et
          };
        })(),
        O = (function() {
          var t,
            n = C(function(t, e, n, i) {
              var o, r, s;
              if (
                ((t._lazysizesWidth = i),
                (i += "px"),
                t.setAttribute("sizes", i),
                p.test(e.nodeName || ""))
              )
                for (
                  o = e.getElementsByTagName("source"), r = 0, s = o.length;
                  s > r;
                  r++
                )
                  o[r].setAttribute("sizes", i);
              n.detail.dataAttr || A(t, n.detail);
            }),
            o = function(t, e, i) {
              var o,
                r = t.parentNode;
              r &&
                ((i = E(t, r, i)),
                (o = x(t, "lazybeforesizes", { width: i, dataAttr: !!e })),
                o.defaultPrevented ||
                  ((i = o.detail.width) &&
                    i !== t._lazysizesWidth &&
                    n(t, r, o, i)));
            },
            r = function() {
              var e,
                n = t.length;
              if (n) for (e = 0; n > e; e++) o(t[e]);
            },
            s = k(r);
          return {
            _: function() {
              (t = e.getElementsByClassName(i.autosizesClass)), c("resize", s);
            },
            checkElems: s,
            updateElem: o
          };
        })(),
        L = function() {
          L.i || ((L.i = !0), O._(), T._());
        };
      return (
        (function() {
          var e,
            n = {
              lazyClass: "lazyload",
              loadedClass: "lazyloaded",
              loadingClass: "lazyloading",
              preloadClass: "lazypreload",
              errorClass: "lazyerror",
              autosizesClass: "lazyautosizes",
              srcAttr: "data-src",
              srcsetAttr: "data-srcset",
              sizesAttr: "data-sizes",
              minSize: 40,
              customMedia: {},
              init: !0,
              expFactor: 1.5,
              hFac: 0.8,
              loadMode: 2,
              loadHidden: !0
            };
          i = t.lazySizesConfig || t.lazysizesConfig || {};
          for (e in n) e in i || (i[e] = n[e]);
          (t.lazySizesConfig = i),
            u(function() {
              i.init && L();
            });
        })(),
        (n = {
          cfg: i,
          autoSizer: O,
          loader: T,
          init: L,
          uP: A,
          aC: w,
          rC: v,
          hC: g,
          fire: x,
          gW: E,
          rAF: S
        })
      );
    }
  }),
  (function() {
    "use strict";
    function t(n) {
      return void 0 === this || Object.getPrototypeOf(this) !== t.prototype
        ? new t(n)
        : ((E = this),
          (E.version = "3.3.4"),
          (E.tools = new z()),
          E.isSupported()
            ? (E.tools.extend(E.defaults, n || {}),
              (E.defaults.container = e(E.defaults)),
              (E.store = { elements: {}, containers: [] }),
              (E.sequences = {}),
              (E.history = []),
              (E.uid = 0),
              (E.initialized = !1))
            : "undefined" != typeof console && console,
          E);
    }
    function e(t) {
      if (t && t.container) {
        if ("string" == typeof t.container)
          return window.document.documentElement.querySelector(t.container);
        if (E.tools.isNode(t.container)) return t.container;
      }
      return E.defaults.container;
    }
    function n(t, e) {
      return "string" == typeof t
        ? Array.prototype.slice.call(e.querySelectorAll(t))
        : E.tools.isNode(t)
          ? [t]
          : E.tools.isNodeList(t) ? Array.prototype.slice.call(t) : [];
    }
    function i() {
      return ++E.uid;
    }
    function o(t, e, n) {
      e.container && (e.container = n),
        t.config
          ? (t.config = E.tools.extendClone(t.config, e))
          : (t.config = E.tools.extendClone(E.defaults, e)),
        "top" === t.config.origin || "bottom" === t.config.origin
          ? (t.config.axis = "Y")
          : (t.config.axis = "X");
    }
    function r(t) {
      var e = window.getComputedStyle(t.domEl);
      t.styles ||
        ((t.styles = { transition: {}, transform: {}, computed: {} }),
        (t.styles.inline = t.domEl.getAttribute("style") || ""),
        (t.styles.inline += "; visibility: visible; "),
        (t.styles.computed.opacity = e.opacity),
        e.transition && "all 0s ease 0s" !== e.transition
          ? (t.styles.computed.transition = e.transition + ", ")
          : (t.styles.computed.transition = "")),
        (t.styles.transition.instant = s(t, 0)),
        (t.styles.transition.delayed = s(t, t.config.delay)),
        (t.styles.transform.initial = " -webkit-transform:"),
        (t.styles.transform.target = " -webkit-transform:"),
        a(t),
        (t.styles.transform.initial += "transform:"),
        (t.styles.transform.target += "transform:"),
        a(t);
    }
    function s(t, e) {
      var n = t.config;
      return (
        "-webkit-transition: " +
        t.styles.computed.transition +
        "-webkit-transform " +
        n.duration / 1e3 +
        "s " +
        n.easing +
        " " +
        e / 1e3 +
        "s, opacity " +
        n.duration / 1e3 +
        "s " +
        n.easing +
        " " +
        e / 1e3 +
        "s; transition: " +
        t.styles.computed.transition +
        "transform " +
        n.duration / 1e3 +
        "s " +
        n.easing +
        " " +
        e / 1e3 +
        "s, opacity " +
        n.duration / 1e3 +
        "s " +
        n.easing +
        " " +
        e / 1e3 +
        "s; "
      );
    }
    function a(t) {
      var e,
        n = t.config,
        i = t.styles.transform;
      (e =
        "top" === n.origin || "left" === n.origin
          ? /^-/.test(n.distance) ? n.distance.substr(1) : "-" + n.distance
          : n.distance),
        parseInt(n.distance) &&
          ((i.initial += " translate" + n.axis + "(" + e + ")"),
          (i.target += " translate" + n.axis + "(0)")),
        n.scale &&
          ((i.initial += " scale(" + n.scale + ")"), (i.target += " scale(1)")),
        n.rotate.x &&
          ((i.initial += " rotateX(" + n.rotate.x + "deg)"),
          (i.target += " rotateX(0)")),
        n.rotate.y &&
          ((i.initial += " rotateY(" + n.rotate.y + "deg)"),
          (i.target += " rotateY(0)")),
        n.rotate.z &&
          ((i.initial += " rotateZ(" + n.rotate.z + "deg)"),
          (i.target += " rotateZ(0)")),
        (i.initial += "; opacity: " + n.opacity + ";"),
        (i.target += "; opacity: " + t.styles.computed.opacity + ";");
    }
    function l(t) {
      var e = t.config.container;
      e &&
        -1 === E.store.containers.indexOf(e) &&
        E.store.containers.push(t.config.container),
        (E.store.elements[t.id] = t);
    }
    function c(t, e, n) {
      var i = { target: t, config: e, interval: n };
      E.history.push(i);
    }
    function u() {
      if (E.isSupported()) {
        p();
        for (var t = 0; t < E.store.containers.length; t++)
          E.store.containers[t].addEventListener("scroll", d),
            E.store.containers[t].addEventListener("resize", d);
        E.initialized ||
          (window.addEventListener("scroll", d),
          window.addEventListener("resize", d),
          (E.initialized = !0));
      }
      return E;
    }
    function d() {
      S(p);
    }
    function f() {
      var t, e, n, i;
      E.tools.forOwn(E.sequences, function(o) {
        (i = E.sequences[o]), (t = !1);
        for (var r = 0; r < i.elemIds.length; r++)
          (n = i.elemIds[r]), (e = E.store.elements[n]), A(e) && !t && (t = !0);
        i.active = t;
      });
    }
    function p() {
      var t, e;
      f(),
        E.tools.forOwn(E.store.elements, function(n) {
          (e = E.store.elements[n]),
            (t = g(e)),
            y(e)
              ? (e.config.beforeReveal(e.domEl),
                t
                  ? e.domEl.setAttribute(
                      "style",
                      e.styles.inline +
                        e.styles.transform.target +
                        e.styles.transition.delayed
                    )
                  : e.domEl.setAttribute(
                      "style",
                      e.styles.inline +
                        e.styles.transform.target +
                        e.styles.transition.instant
                    ),
                m("reveal", e, t),
                (e.revealing = !0),
                (e.seen = !0),
                e.sequence && h(e, t))
              : w(e) &&
                (e.config.beforeReset(e.domEl),
                e.domEl.setAttribute(
                  "style",
                  e.styles.inline +
                    e.styles.transform.initial +
                    e.styles.transition.instant
                ),
                m("reset", e),
                (e.revealing = !1));
        });
    }
    function h(t, e) {
      var n = 0,
        i = 0,
        o = E.sequences[t.sequence.id];
      (o.blocked = !0),
        e && "onload" === t.config.useDelay && (i = t.config.delay),
        t.sequence.timer &&
          ((n = Math.abs(t.sequence.timer.started - new Date())),
          window.clearTimeout(t.sequence.timer)),
        (t.sequence.timer = { started: new Date() }),
        (t.sequence.timer.clock = window.setTimeout(function() {
          (o.blocked = !1), (t.sequence.timer = null), d();
        }, Math.abs(o.interval) + i - n));
    }
    function m(t, e, n) {
      var i = 0,
        o = 0,
        r = "after";
      switch (t) {
        case "reveal":
          (o = e.config.duration), n && (o += e.config.delay), (r += "Reveal");
          break;
        case "reset":
          (o = e.config.duration), (r += "Reset");
      }
      e.timer &&
        ((i = Math.abs(e.timer.started - new Date())),
        window.clearTimeout(e.timer.clock)),
        (e.timer = { started: new Date() }),
        (e.timer.clock = window.setTimeout(function() {
          e.config[r](e.domEl), (e.timer = null);
        }, o - i));
    }
    function y(t) {
      if (t.sequence) {
        var e = E.sequences[t.sequence.id];
        return e.active && !e.blocked && !t.revealing && !t.disabled;
      }
      return A(t) && !t.revealing && !t.disabled;
    }
    function g(t) {
      var e = t.config.useDelay;
      return (
        "always" === e ||
        ("onload" === e && !E.initialized) ||
        ("once" === e && !t.seen)
      );
    }
    function w(t) {
      if (t.sequence) {
        return (
          !E.sequences[t.sequence.id].active &&
          t.config.reset &&
          t.revealing &&
          !t.disabled
        );
      }
      return !A(t) && t.config.reset && t.revealing && !t.disabled;
    }
    function v(t) {
      return { width: t.clientWidth, height: t.clientHeight };
    }
    function b(t) {
      if (t && t !== window.document.documentElement) {
        var e = x(t);
        return { x: t.scrollLeft + e.left, y: t.scrollTop + e.top };
      }
      return { x: window.pageXOffset, y: window.pageYOffset };
    }
    function x(t) {
      var e = 0,
        n = 0,
        i = t.offsetHeight,
        o = t.offsetWidth;
      do {
        isNaN(t.offsetTop) || (e += t.offsetTop),
          isNaN(t.offsetLeft) || (n += t.offsetLeft),
          (t = t.offsetParent);
      } while (t);
      return { top: e, left: n, height: i, width: o };
    }
    function A(t) {
      function e() {
        var e = c + a * s,
          n = u + l * s,
          i = d - a * s,
          p = f - l * s,
          h = r.y + t.config.viewOffset.top,
          m = r.x + t.config.viewOffset.left,
          y = r.y - t.config.viewOffset.bottom + o.height,
          g = r.x - t.config.viewOffset.right + o.width;
        return e < y && i > h && n > m && p < g;
      }
      function n() {
        return "fixed" === window.getComputedStyle(t.domEl).position;
      }
      var i = x(t.domEl),
        o = v(t.config.container),
        r = b(t.config.container),
        s = t.config.viewFactor,
        a = i.height,
        l = i.width,
        c = i.top,
        u = i.left,
        d = c + a,
        f = u + l;
      return e() || n();
    }
    function z() {}
    var E, S;
    (t.prototype.defaults = {
      origin: "bottom",
      distance: "20px",
      duration: 500,
      delay: 0,
      rotate: { x: 0, y: 0, z: 0 },
      opacity: 0,
      scale: 0.9,
      easing: "cubic-bezier(0.6, 0.2, 0.1, 1)",
      container: window.document.documentElement,
      mobile: !0,
      reset: !1,
      useDelay: "always",
      viewFactor: 0.2,
      viewOffset: { top: 0, right: 0, bottom: 0, left: 0 },
      beforeReveal: function(t) {},
      beforeReset: function(t) {},
      afterReveal: function(t) {},
      afterReset: function(t) {}
    }),
      (t.prototype.isSupported = function() {
        var t = document.documentElement.style;
        return (
          ("WebkitTransition" in t && "WebkitTransform" in t) ||
          ("transition" in t && "transform" in t)
        );
      }),
      (t.prototype.reveal = function(t, s, a, d) {
        var f, p, h, m, y, g;
        if (
          (void 0 !== s && "number" == typeof s
            ? ((a = s), (s = {}))
            : (void 0 !== s && null !== s) || (s = {}),
          (f = e(s)),
          (p = n(t, f)),
          !p.length)
        )
          return E;
        a &&
          "number" == typeof a &&
          ((g = i()),
          (y = E.sequences[g] = {
            id: g,
            interval: a,
            elemIds: [],
            active: !1
          }));
        for (var w = 0; w < p.length; w++)
          (m = p[w].getAttribute("data-sr-id")),
            m
              ? (h = E.store.elements[m])
              : ((h = { id: i(), domEl: p[w], seen: !1, revealing: !1 }),
                h.domEl.setAttribute("data-sr-id", h.id)),
            y &&
              ((h.sequence = { id: y.id, index: y.elemIds.length }),
              y.elemIds.push(h.id)),
            o(h, s, f),
            r(h),
            l(h),
            (E.tools.isMobile() && !h.config.mobile) || !E.isSupported()
              ? (h.domEl.setAttribute("style", h.styles.inline),
                (h.disabled = !0))
              : h.revealing ||
                h.domEl.setAttribute(
                  "style",
                  h.styles.inline + h.styles.transform.initial
                );
        return (
          !d &&
            E.isSupported() &&
            (c(t, s, a),
            E.initTimeout && window.clearTimeout(E.initTimeout),
            (E.initTimeout = window.setTimeout(u, 0))),
          E
        );
      }),
      (t.prototype.sync = function() {
        if (E.history.length && E.isSupported()) {
          for (var t = 0; t < E.history.length; t++) {
            var e = E.history[t];
            E.reveal(e.target, e.config, e.interval, !0);
          }
          u();
        }
        return E;
      }),
      (z.prototype.isObject = function(t) {
        return null !== t && "object" == typeof t && t.constructor === Object;
      }),
      (z.prototype.isNode = function(t) {
        return "object" == typeof window.Node
          ? t instanceof window.Node
          : t &&
              "object" == typeof t &&
              "number" == typeof t.nodeType &&
              "string" == typeof t.nodeName;
      }),
      (z.prototype.isNodeList = function(t) {
        var e = Object.prototype.toString.call(t),
          n = /^\[object (HTMLCollection|NodeList|Object)\]$/;
        return "object" == typeof window.NodeList
          ? t instanceof window.NodeList
          : t &&
              "object" == typeof t &&
              n.test(e) &&
              "number" == typeof t.length &&
              (0 === t.length || this.isNode(t[0]));
      }),
      (z.prototype.forOwn = function(t, e) {
        if (!this.isObject(t))
          throw new TypeError(
            'Expected "object", but received "' + typeof t + '".'
          );
        for (var n in t) t.hasOwnProperty(n) && e(n);
      }),
      (z.prototype.extend = function(t, e) {
        return (
          this.forOwn(
            e,
            function(n) {
              this.isObject(e[n])
                ? ((t[n] && this.isObject(t[n])) || (t[n] = {}),
                  this.extend(t[n], e[n]))
                : (t[n] = e[n]);
            }.bind(this)
          ),
          t
        );
      }),
      (z.prototype.extendClone = function(t, e) {
        return this.extend(this.extend({}, t), e);
      }),
      (z.prototype.isMobile = function() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        );
      }),
      (S =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        function(t) {
          window.setTimeout(t, 1e3 / 60);
        }),
      "function" == typeof define && "object" == typeof define.amd && define.amd
        ? define(function() {
            return t;
          })
        : "undefined" != typeof module && module.exports
          ? (module.exports = t)
          : (window.ScrollReveal = t);
  })(),
  document.addEventListener("DOMContentLoaded", function() {
    function t(t) {
      var e = document.querySelector(".nav__link--is-current");
      e && e.classList.remove("nav__link--is-current"),
        o[t].classList.add("nav__link--is-current");
    }
    (window.sr = ScrollReveal({ scale: 1, delay: 200 })),
      sr.reveal(".js-reveal");
    var e = document.querySelector("#contact"),
      n = e.querySelector(".submit"),
      i = document.querySelector(".js-contact-response");
    var o = (function() {
      var t = document.querySelectorAll(".nav__link"),
        e = {};
      return (
        [].forEach.call(t, function(t) {
          e[t.getAttribute("data-section")] = t;
        }),
        e
      );
    })();
    new Waypoint({
      element: document.querySelector(".main__about"),
      handler: function(t) {
        "down" === t
          ? document.querySelector(".heading").classList.add("heading--active")
          : document
              .querySelector(".heading")
              .classList.remove("heading--active");
      },
      offset: -25
    }),
      new Waypoint({
        element: document.querySelector("body"),
        handler: function(t) {
          console.log(t),
            document
              .querySelector(".heading")
              .classList["down" == t ? "add" : "remove"]("heading--fixed");
        },
        offset: -16
      });
    var r = {
      about: {
        elem: document.querySelector(".main__about"),
        onEnter: function() {
          console.log("arrive about");
        },
        onLeave: function() {
          console.log("leave about");
        }
      },
      process: {
        elem: document.querySelector(".main__process"),
        onEnter: function() {
          console.log("arrive process");
        },
        onLeave: function() {
          console.log("leave process");
        }
      },
      contact: {
        elem: document.querySelector(".contact-background"),
        onEnter: function() {
          console.log("arrive contact");
        },
        onLeave: function() {
          console.log("arrive contact");
        }
      }
    };
    Object.keys(r).forEach(function(e) {
      var n = r[e].elem.getAttribute("data-section");
      new Waypoint({
        element: r[e].elem,
        offset: 480,
        handler: function(i) {
          "down" == i && t(n), r[e].onEnter && r[e].onEnter.call(r[e].elem);
        }
      }),
        new Waypoint({
          element: r[e].elem,
          handler: function(i) {
            "up" == i && t(n), r[e].onLeave && r[e].onLeave.call(r[e].elem);
          },
          offset: function() {
            return 240 - this.element.clientHeight;
          }
        });
    });
  });
