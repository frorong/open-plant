var hp = Object.defineProperty;
var mp = (e, t, n) => t in e ? hp(e, t, { enumerable: !0, configurable: !0, writable: !0, value: n }) : e[t] = n;
var R = (e, t, n) => mp(e, typeof t != "symbol" ? t + "" : t, n);
var ed = { exports: {} }, ps = {}, td = { exports: {} }, ce = {};
/**
 * @license React
 * react.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var Ni = Symbol.for("react.element"), pp = Symbol.for("react.portal"), gp = Symbol.for("react.fragment"), yp = Symbol.for("react.strict_mode"), vp = Symbol.for("react.profiler"), wp = Symbol.for("react.provider"), xp = Symbol.for("react.context"), Sp = Symbol.for("react.forward_ref"), Ep = Symbol.for("react.suspense"), Cp = Symbol.for("react.memo"), Rp = Symbol.for("react.lazy"), za = Symbol.iterator;
function Pp(e) {
  return e === null || typeof e != "object" ? null : (e = za && e[za] || e["@@iterator"], typeof e == "function" ? e : null);
}
var nd = { isMounted: function() {
  return !1;
}, enqueueForceUpdate: function() {
}, enqueueReplaceState: function() {
}, enqueueSetState: function() {
} }, rd = Object.assign, id = {};
function Nr(e, t, n) {
  this.props = e, this.context = t, this.refs = id, this.updater = n || nd;
}
Nr.prototype.isReactComponent = {};
Nr.prototype.setState = function(e, t) {
  if (typeof e != "object" && typeof e != "function" && e != null) throw Error("setState(...): takes an object of state variables to update or a function which returns an object of state variables.");
  this.updater.enqueueSetState(this, e, t, "setState");
};
Nr.prototype.forceUpdate = function(e) {
  this.updater.enqueueForceUpdate(this, e, "forceUpdate");
};
function od() {
}
od.prototype = Nr.prototype;
function Mu(e, t, n) {
  this.props = e, this.context = t, this.refs = id, this.updater = n || nd;
}
var Tu = Mu.prototype = new od();
Tu.constructor = Mu;
rd(Tu, Nr.prototype);
Tu.isPureReactComponent = !0;
var Ua = Array.isArray, sd = Object.prototype.hasOwnProperty, Au = { current: null }, ld = { key: !0, ref: !0, __self: !0, __source: !0 };
function ud(e, t, n) {
  var r, i = {}, o = null, s = null;
  if (t != null) for (r in t.ref !== void 0 && (s = t.ref), t.key !== void 0 && (o = "" + t.key), t) sd.call(t, r) && !ld.hasOwnProperty(r) && (i[r] = t[r]);
  var l = arguments.length - 2;
  if (l === 1) i.children = n;
  else if (1 < l) {
    for (var u = Array(l), a = 0; a < l; a++) u[a] = arguments[a + 2];
    i.children = u;
  }
  if (e && e.defaultProps) for (r in l = e.defaultProps, l) i[r] === void 0 && (i[r] = l[r]);
  return { $$typeof: Ni, type: e, key: o, ref: s, props: i, _owner: Au.current };
}
function Mp(e, t) {
  return { $$typeof: Ni, type: e.type, key: t, ref: e.ref, props: e.props, _owner: e._owner };
}
function _u(e) {
  return typeof e == "object" && e !== null && e.$$typeof === Ni;
}
function Tp(e) {
  var t = { "=": "=0", ":": "=2" };
  return "$" + e.replace(/[=:]/g, function(n) {
    return t[n];
  });
}
var Ba = /\/+/g;
function Fs(e, t) {
  return typeof e == "object" && e !== null && e.key != null ? Tp("" + e.key) : t.toString(36);
}
function wo(e, t, n, r, i) {
  var o = typeof e;
  (o === "undefined" || o === "boolean") && (e = null);
  var s = !1;
  if (e === null) s = !0;
  else switch (o) {
    case "string":
    case "number":
      s = !0;
      break;
    case "object":
      switch (e.$$typeof) {
        case Ni:
        case pp:
          s = !0;
      }
  }
  if (s) return s = e, i = i(s), e = r === "" ? "." + Fs(s, 0) : r, Ua(i) ? (n = "", e != null && (n = e.replace(Ba, "$&/") + "/"), wo(i, t, n, "", function(a) {
    return a;
  })) : i != null && (_u(i) && (i = Mp(i, n + (!i.key || s && s.key === i.key ? "" : ("" + i.key).replace(Ba, "$&/") + "/") + e)), t.push(i)), 1;
  if (s = 0, r = r === "" ? "." : r + ":", Ua(e)) for (var l = 0; l < e.length; l++) {
    o = e[l];
    var u = r + Fs(o, l);
    s += wo(o, t, n, u, i);
  }
  else if (u = Pp(e), typeof u == "function") for (e = u.call(e), l = 0; !(o = e.next()).done; ) o = o.value, u = r + Fs(o, l++), s += wo(o, t, n, u, i);
  else if (o === "object") throw t = String(e), Error("Objects are not valid as a React child (found: " + (t === "[object Object]" ? "object with keys {" + Object.keys(e).join(", ") + "}" : t) + "). If you meant to render a collection of children, use an array instead.");
  return s;
}
function Xi(e, t, n) {
  if (e == null) return e;
  var r = [], i = 0;
  return wo(e, r, "", "", function(o) {
    return t.call(n, o, i++);
  }), r;
}
function Ap(e) {
  if (e._status === -1) {
    var t = e._result;
    t = t(), t.then(function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 1, e._result = n);
    }, function(n) {
      (e._status === 0 || e._status === -1) && (e._status = 2, e._result = n);
    }), e._status === -1 && (e._status = 0, e._result = t);
  }
  if (e._status === 1) return e._result.default;
  throw e._result;
}
var ut = { current: null }, xo = { transition: null }, _p = { ReactCurrentDispatcher: ut, ReactCurrentBatchConfig: xo, ReactCurrentOwner: Au };
function ad() {
  throw Error("act(...) is not supported in production builds of React.");
}
ce.Children = { map: Xi, forEach: function(e, t, n) {
  Xi(e, function() {
    t.apply(this, arguments);
  }, n);
}, count: function(e) {
  var t = 0;
  return Xi(e, function() {
    t++;
  }), t;
}, toArray: function(e) {
  return Xi(e, function(t) {
    return t;
  }) || [];
}, only: function(e) {
  if (!_u(e)) throw Error("React.Children.only expected to receive a single React element child.");
  return e;
} };
ce.Component = Nr;
ce.Fragment = gp;
ce.Profiler = vp;
ce.PureComponent = Mu;
ce.StrictMode = yp;
ce.Suspense = Ep;
ce.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = _p;
ce.act = ad;
ce.cloneElement = function(e, t, n) {
  if (e == null) throw Error("React.cloneElement(...): The argument must be a React element, but you passed " + e + ".");
  var r = rd({}, e.props), i = e.key, o = e.ref, s = e._owner;
  if (t != null) {
    if (t.ref !== void 0 && (o = t.ref, s = Au.current), t.key !== void 0 && (i = "" + t.key), e.type && e.type.defaultProps) var l = e.type.defaultProps;
    for (u in t) sd.call(t, u) && !ld.hasOwnProperty(u) && (r[u] = t[u] === void 0 && l !== void 0 ? l[u] : t[u]);
  }
  var u = arguments.length - 2;
  if (u === 1) r.children = n;
  else if (1 < u) {
    l = Array(u);
    for (var a = 0; a < u; a++) l[a] = arguments[a + 2];
    r.children = l;
  }
  return { $$typeof: Ni, type: e.type, key: i, ref: o, props: r, _owner: s };
};
ce.createContext = function(e) {
  return e = { $$typeof: xp, _currentValue: e, _currentValue2: e, _threadCount: 0, Provider: null, Consumer: null, _defaultValue: null, _globalName: null }, e.Provider = { $$typeof: wp, _context: e }, e.Consumer = e;
};
ce.createElement = ud;
ce.createFactory = function(e) {
  var t = ud.bind(null, e);
  return t.type = e, t;
};
ce.createRef = function() {
  return { current: null };
};
ce.forwardRef = function(e) {
  return { $$typeof: Sp, render: e };
};
ce.isValidElement = _u;
ce.lazy = function(e) {
  return { $$typeof: Rp, _payload: { _status: -1, _result: e }, _init: Ap };
};
ce.memo = function(e, t) {
  return { $$typeof: Cp, type: e, compare: t === void 0 ? null : t };
};
ce.startTransition = function(e) {
  var t = xo.transition;
  xo.transition = {};
  try {
    e();
  } finally {
    xo.transition = t;
  }
};
ce.unstable_act = ad;
ce.useCallback = function(e, t) {
  return ut.current.useCallback(e, t);
};
ce.useContext = function(e) {
  return ut.current.useContext(e);
};
ce.useDebugValue = function() {
};
ce.useDeferredValue = function(e) {
  return ut.current.useDeferredValue(e);
};
ce.useEffect = function(e, t) {
  return ut.current.useEffect(e, t);
};
ce.useId = function() {
  return ut.current.useId();
};
ce.useImperativeHandle = function(e, t, n) {
  return ut.current.useImperativeHandle(e, t, n);
};
ce.useInsertionEffect = function(e, t) {
  return ut.current.useInsertionEffect(e, t);
};
ce.useLayoutEffect = function(e, t) {
  return ut.current.useLayoutEffect(e, t);
};
ce.useMemo = function(e, t) {
  return ut.current.useMemo(e, t);
};
ce.useReducer = function(e, t, n) {
  return ut.current.useReducer(e, t, n);
};
ce.useRef = function(e) {
  return ut.current.useRef(e);
};
ce.useState = function(e) {
  return ut.current.useState(e);
};
ce.useSyncExternalStore = function(e, t, n) {
  return ut.current.useSyncExternalStore(e, t, n);
};
ce.useTransition = function() {
  return ut.current.useTransition();
};
ce.version = "18.3.1";
td.exports = ce;
var S = td.exports;
/**
 * @license React
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var kp = S, Ip = Symbol.for("react.element"), bp = Symbol.for("react.fragment"), Lp = Object.prototype.hasOwnProperty, Fp = kp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, Np = { key: !0, ref: !0, __self: !0, __source: !0 };
function cd(e, t, n) {
  var r, i = {}, o = null, s = null;
  n !== void 0 && (o = "" + n), t.key !== void 0 && (o = "" + t.key), t.ref !== void 0 && (s = t.ref);
  for (r in t) Lp.call(t, r) && !Np.hasOwnProperty(r) && (i[r] = t[r]);
  if (e && e.defaultProps) for (r in t = e.defaultProps, t) i[r] === void 0 && (i[r] = t[r]);
  return { $$typeof: Ip, type: e, key: o, ref: s, props: i, _owner: Fp.current };
}
ps.Fragment = bp;
ps.jsx = cd;
ps.jsxs = cd;
ed.exports = ps;
var At = ed.exports, gl = {}, fd = { exports: {} }, Ct = {}, dd = { exports: {} }, hd = {};
/**
 * @license React
 * scheduler.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
(function(e) {
  function t(_, D) {
    var q = _.length;
    _.push(D);
    e: for (; 0 < q; ) {
      var ne = q - 1 >>> 1, le = _[ne];
      if (0 < i(le, D)) _[ne] = D, _[q] = le, q = ne;
      else break e;
    }
  }
  function n(_) {
    return _.length === 0 ? null : _[0];
  }
  function r(_) {
    if (_.length === 0) return null;
    var D = _[0], q = _.pop();
    if (q !== D) {
      _[0] = q;
      e: for (var ne = 0, le = _.length, F = le >>> 1; ne < F; ) {
        var b = 2 * (ne + 1) - 1, V = _[b], ue = b + 1, re = _[ue];
        if (0 > i(V, q)) ue < le && 0 > i(re, V) ? (_[ne] = re, _[ue] = q, ne = ue) : (_[ne] = V, _[b] = q, ne = b);
        else if (ue < le && 0 > i(re, q)) _[ne] = re, _[ue] = q, ne = ue;
        else break e;
      }
    }
    return D;
  }
  function i(_, D) {
    var q = _.sortIndex - D.sortIndex;
    return q !== 0 ? q : _.id - D.id;
  }
  if (typeof performance == "object" && typeof performance.now == "function") {
    var o = performance;
    e.unstable_now = function() {
      return o.now();
    };
  } else {
    var s = Date, l = s.now();
    e.unstable_now = function() {
      return s.now() - l;
    };
  }
  var u = [], a = [], f = 1, c = null, d = 3, h = !1, g = !1, y = !1, x = typeof setTimeout == "function" ? setTimeout : null, p = typeof clearTimeout == "function" ? clearTimeout : null, m = typeof setImmediate < "u" ? setImmediate : null;
  typeof navigator < "u" && navigator.scheduling !== void 0 && navigator.scheduling.isInputPending !== void 0 && navigator.scheduling.isInputPending.bind(navigator.scheduling);
  function v(_) {
    for (var D = n(a); D !== null; ) {
      if (D.callback === null) r(a);
      else if (D.startTime <= _) r(a), D.sortIndex = D.expirationTime, t(u, D);
      else break;
      D = n(a);
    }
  }
  function w(_) {
    if (y = !1, v(_), !g) if (n(u) !== null) g = !0, Y(E);
    else {
      var D = n(a);
      D !== null && Q(w, D.startTime - _);
    }
  }
  function E(_, D) {
    g = !1, y && (y = !1, p(M), M = -1), h = !0;
    var q = d;
    try {
      for (v(D), c = n(u); c !== null && (!(c.expirationTime > D) || _ && !B()); ) {
        var ne = c.callback;
        if (typeof ne == "function") {
          c.callback = null, d = c.priorityLevel;
          var le = ne(c.expirationTime <= D);
          D = e.unstable_now(), typeof le == "function" ? c.callback = le : c === n(u) && r(u), v(D);
        } else r(u);
        c = n(u);
      }
      if (c !== null) var F = !0;
      else {
        var b = n(a);
        b !== null && Q(w, b.startTime - D), F = !1;
      }
      return F;
    } finally {
      c = null, d = q, h = !1;
    }
  }
  var C = !1, A = null, M = -1, N = 5, I = -1;
  function B() {
    return !(e.unstable_now() - I < N);
  }
  function O() {
    if (A !== null) {
      var _ = e.unstable_now();
      I = _;
      var D = !0;
      try {
        D = A(!0, _);
      } finally {
        D ? L() : (C = !1, A = null);
      }
    } else C = !1;
  }
  var L;
  if (typeof m == "function") L = function() {
    m(O);
  };
  else if (typeof MessageChannel < "u") {
    var G = new MessageChannel(), $ = G.port2;
    G.port1.onmessage = O, L = function() {
      $.postMessage(null);
    };
  } else L = function() {
    x(O, 0);
  };
  function Y(_) {
    A = _, C || (C = !0, L());
  }
  function Q(_, D) {
    M = x(function() {
      _(e.unstable_now());
    }, D);
  }
  e.unstable_IdlePriority = 5, e.unstable_ImmediatePriority = 1, e.unstable_LowPriority = 4, e.unstable_NormalPriority = 3, e.unstable_Profiling = null, e.unstable_UserBlockingPriority = 2, e.unstable_cancelCallback = function(_) {
    _.callback = null;
  }, e.unstable_continueExecution = function() {
    g || h || (g = !0, Y(E));
  }, e.unstable_forceFrameRate = function(_) {
    0 > _ || 125 < _ ? console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported") : N = 0 < _ ? Math.floor(1e3 / _) : 5;
  }, e.unstable_getCurrentPriorityLevel = function() {
    return d;
  }, e.unstable_getFirstCallbackNode = function() {
    return n(u);
  }, e.unstable_next = function(_) {
    switch (d) {
      case 1:
      case 2:
      case 3:
        var D = 3;
        break;
      default:
        D = d;
    }
    var q = d;
    d = D;
    try {
      return _();
    } finally {
      d = q;
    }
  }, e.unstable_pauseExecution = function() {
  }, e.unstable_requestPaint = function() {
  }, e.unstable_runWithPriority = function(_, D) {
    switch (_) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
        break;
      default:
        _ = 3;
    }
    var q = d;
    d = _;
    try {
      return D();
    } finally {
      d = q;
    }
  }, e.unstable_scheduleCallback = function(_, D, q) {
    var ne = e.unstable_now();
    switch (typeof q == "object" && q !== null ? (q = q.delay, q = typeof q == "number" && 0 < q ? ne + q : ne) : q = ne, _) {
      case 1:
        var le = -1;
        break;
      case 2:
        le = 250;
        break;
      case 5:
        le = 1073741823;
        break;
      case 4:
        le = 1e4;
        break;
      default:
        le = 5e3;
    }
    return le = q + le, _ = { id: f++, callback: D, priorityLevel: _, startTime: q, expirationTime: le, sortIndex: -1 }, q > ne ? (_.sortIndex = q, t(a, _), n(u) === null && _ === n(a) && (y ? (p(M), M = -1) : y = !0, Q(w, q - ne))) : (_.sortIndex = le, t(u, _), g || h || (g = !0, Y(E))), _;
  }, e.unstable_shouldYield = B, e.unstable_wrapCallback = function(_) {
    var D = d;
    return function() {
      var q = d;
      d = D;
      try {
        return _.apply(this, arguments);
      } finally {
        d = q;
      }
    };
  };
})(hd);
dd.exports = hd;
var Dp = dd.exports;
/**
 * @license React
 * react-dom.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var zp = S, Et = Dp;
function k(e) {
  for (var t = "https://reactjs.org/docs/error-decoder.html?invariant=" + e, n = 1; n < arguments.length; n++) t += "&args[]=" + encodeURIComponent(arguments[n]);
  return "Minified React error #" + e + "; visit " + t + " for the full message or use the non-minified dev environment for full errors and additional helpful warnings.";
}
var md = /* @__PURE__ */ new Set(), fi = {};
function Qn(e, t) {
  Tr(e, t), Tr(e + "Capture", t);
}
function Tr(e, t) {
  for (fi[e] = t, e = 0; e < t.length; e++) md.add(t[e]);
}
var sn = !(typeof window > "u" || typeof window.document > "u" || typeof window.document.createElement > "u"), yl = Object.prototype.hasOwnProperty, Up = /^[:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD][:A-Z_a-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\-.0-9\u00B7\u0300-\u036F\u203F-\u2040]*$/, Oa = {}, Wa = {};
function Bp(e) {
  return yl.call(Wa, e) ? !0 : yl.call(Oa, e) ? !1 : Up.test(e) ? Wa[e] = !0 : (Oa[e] = !0, !1);
}
function Op(e, t, n, r) {
  if (n !== null && n.type === 0) return !1;
  switch (typeof t) {
    case "function":
    case "symbol":
      return !0;
    case "boolean":
      return r ? !1 : n !== null ? !n.acceptsBooleans : (e = e.toLowerCase().slice(0, 5), e !== "data-" && e !== "aria-");
    default:
      return !1;
  }
}
function Wp(e, t, n, r) {
  if (t === null || typeof t > "u" || Op(e, t, n, r)) return !0;
  if (r) return !1;
  if (n !== null) switch (n.type) {
    case 3:
      return !t;
    case 4:
      return t === !1;
    case 5:
      return isNaN(t);
    case 6:
      return isNaN(t) || 1 > t;
  }
  return !1;
}
function at(e, t, n, r, i, o, s) {
  this.acceptsBooleans = t === 2 || t === 3 || t === 4, this.attributeName = r, this.attributeNamespace = i, this.mustUseProperty = n, this.propertyName = e, this.type = t, this.sanitizeURL = o, this.removeEmptyString = s;
}
var qe = {};
"children dangerouslySetInnerHTML defaultValue defaultChecked innerHTML suppressContentEditableWarning suppressHydrationWarning style".split(" ").forEach(function(e) {
  qe[e] = new at(e, 0, !1, e, null, !1, !1);
});
[["acceptCharset", "accept-charset"], ["className", "class"], ["htmlFor", "for"], ["httpEquiv", "http-equiv"]].forEach(function(e) {
  var t = e[0];
  qe[t] = new at(t, 1, !1, e[1], null, !1, !1);
});
["contentEditable", "draggable", "spellCheck", "value"].forEach(function(e) {
  qe[e] = new at(e, 2, !1, e.toLowerCase(), null, !1, !1);
});
["autoReverse", "externalResourcesRequired", "focusable", "preserveAlpha"].forEach(function(e) {
  qe[e] = new at(e, 2, !1, e, null, !1, !1);
});
"allowFullScreen async autoFocus autoPlay controls default defer disabled disablePictureInPicture disableRemotePlayback formNoValidate hidden loop noModule noValidate open playsInline readOnly required reversed scoped seamless itemScope".split(" ").forEach(function(e) {
  qe[e] = new at(e, 3, !1, e.toLowerCase(), null, !1, !1);
});
["checked", "multiple", "muted", "selected"].forEach(function(e) {
  qe[e] = new at(e, 3, !0, e, null, !1, !1);
});
["capture", "download"].forEach(function(e) {
  qe[e] = new at(e, 4, !1, e, null, !1, !1);
});
["cols", "rows", "size", "span"].forEach(function(e) {
  qe[e] = new at(e, 6, !1, e, null, !1, !1);
});
["rowSpan", "start"].forEach(function(e) {
  qe[e] = new at(e, 5, !1, e.toLowerCase(), null, !1, !1);
});
var ku = /[\-:]([a-z])/g;
function Iu(e) {
  return e[1].toUpperCase();
}
"accent-height alignment-baseline arabic-form baseline-shift cap-height clip-path clip-rule color-interpolation color-interpolation-filters color-profile color-rendering dominant-baseline enable-background fill-opacity fill-rule flood-color flood-opacity font-family font-size font-size-adjust font-stretch font-style font-variant font-weight glyph-name glyph-orientation-horizontal glyph-orientation-vertical horiz-adv-x horiz-origin-x image-rendering letter-spacing lighting-color marker-end marker-mid marker-start overline-position overline-thickness paint-order panose-1 pointer-events rendering-intent shape-rendering stop-color stop-opacity strikethrough-position strikethrough-thickness stroke-dasharray stroke-dashoffset stroke-linecap stroke-linejoin stroke-miterlimit stroke-opacity stroke-width text-anchor text-decoration text-rendering underline-position underline-thickness unicode-bidi unicode-range units-per-em v-alphabetic v-hanging v-ideographic v-mathematical vector-effect vert-adv-y vert-origin-x vert-origin-y word-spacing writing-mode xmlns:xlink x-height".split(" ").forEach(function(e) {
  var t = e.replace(
    ku,
    Iu
  );
  qe[t] = new at(t, 1, !1, e, null, !1, !1);
});
"xlink:actuate xlink:arcrole xlink:role xlink:show xlink:title xlink:type".split(" ").forEach(function(e) {
  var t = e.replace(ku, Iu);
  qe[t] = new at(t, 1, !1, e, "http://www.w3.org/1999/xlink", !1, !1);
});
["xml:base", "xml:lang", "xml:space"].forEach(function(e) {
  var t = e.replace(ku, Iu);
  qe[t] = new at(t, 1, !1, e, "http://www.w3.org/XML/1998/namespace", !1, !1);
});
["tabIndex", "crossOrigin"].forEach(function(e) {
  qe[e] = new at(e, 1, !1, e.toLowerCase(), null, !1, !1);
});
qe.xlinkHref = new at("xlinkHref", 1, !1, "xlink:href", "http://www.w3.org/1999/xlink", !0, !1);
["src", "href", "action", "formAction"].forEach(function(e) {
  qe[e] = new at(e, 1, !1, e.toLowerCase(), null, !0, !0);
});
function bu(e, t, n, r) {
  var i = qe.hasOwnProperty(t) ? qe[t] : null;
  (i !== null ? i.type !== 0 : r || !(2 < t.length) || t[0] !== "o" && t[0] !== "O" || t[1] !== "n" && t[1] !== "N") && (Wp(t, n, i, r) && (n = null), r || i === null ? Bp(t) && (n === null ? e.removeAttribute(t) : e.setAttribute(t, "" + n)) : i.mustUseProperty ? e[i.propertyName] = n === null ? i.type === 3 ? !1 : "" : n : (t = i.attributeName, r = i.attributeNamespace, n === null ? e.removeAttribute(t) : (i = i.type, n = i === 3 || i === 4 && n === !0 ? "" : "" + n, r ? e.setAttributeNS(r, t, n) : e.setAttribute(t, n))));
}
var cn = zp.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED, Hi = Symbol.for("react.element"), lr = Symbol.for("react.portal"), ur = Symbol.for("react.fragment"), Lu = Symbol.for("react.strict_mode"), vl = Symbol.for("react.profiler"), pd = Symbol.for("react.provider"), gd = Symbol.for("react.context"), Fu = Symbol.for("react.forward_ref"), wl = Symbol.for("react.suspense"), xl = Symbol.for("react.suspense_list"), Nu = Symbol.for("react.memo"), pn = Symbol.for("react.lazy"), yd = Symbol.for("react.offscreen"), Ya = Symbol.iterator;
function Or(e) {
  return e === null || typeof e != "object" ? null : (e = Ya && e[Ya] || e["@@iterator"], typeof e == "function" ? e : null);
}
var Fe = Object.assign, Ns;
function qr(e) {
  if (Ns === void 0) try {
    throw Error();
  } catch (n) {
    var t = n.stack.trim().match(/\n( *(at )?)/);
    Ns = t && t[1] || "";
  }
  return `
` + Ns + e;
}
var Ds = !1;
function zs(e, t) {
  if (!e || Ds) return "";
  Ds = !0;
  var n = Error.prepareStackTrace;
  Error.prepareStackTrace = void 0;
  try {
    if (t) if (t = function() {
      throw Error();
    }, Object.defineProperty(t.prototype, "props", { set: function() {
      throw Error();
    } }), typeof Reflect == "object" && Reflect.construct) {
      try {
        Reflect.construct(t, []);
      } catch (a) {
        var r = a;
      }
      Reflect.construct(e, [], t);
    } else {
      try {
        t.call();
      } catch (a) {
        r = a;
      }
      e.call(t.prototype);
    }
    else {
      try {
        throw Error();
      } catch (a) {
        r = a;
      }
      e();
    }
  } catch (a) {
    if (a && r && typeof a.stack == "string") {
      for (var i = a.stack.split(`
`), o = r.stack.split(`
`), s = i.length - 1, l = o.length - 1; 1 <= s && 0 <= l && i[s] !== o[l]; ) l--;
      for (; 1 <= s && 0 <= l; s--, l--) if (i[s] !== o[l]) {
        if (s !== 1 || l !== 1)
          do
            if (s--, l--, 0 > l || i[s] !== o[l]) {
              var u = `
` + i[s].replace(" at new ", " at ");
              return e.displayName && u.includes("<anonymous>") && (u = u.replace("<anonymous>", e.displayName)), u;
            }
          while (1 <= s && 0 <= l);
        break;
      }
    }
  } finally {
    Ds = !1, Error.prepareStackTrace = n;
  }
  return (e = e ? e.displayName || e.name : "") ? qr(e) : "";
}
function Yp(e) {
  switch (e.tag) {
    case 5:
      return qr(e.type);
    case 16:
      return qr("Lazy");
    case 13:
      return qr("Suspense");
    case 19:
      return qr("SuspenseList");
    case 0:
    case 2:
    case 15:
      return e = zs(e.type, !1), e;
    case 11:
      return e = zs(e.type.render, !1), e;
    case 1:
      return e = zs(e.type, !0), e;
    default:
      return "";
  }
}
function Sl(e) {
  if (e == null) return null;
  if (typeof e == "function") return e.displayName || e.name || null;
  if (typeof e == "string") return e;
  switch (e) {
    case ur:
      return "Fragment";
    case lr:
      return "Portal";
    case vl:
      return "Profiler";
    case Lu:
      return "StrictMode";
    case wl:
      return "Suspense";
    case xl:
      return "SuspenseList";
  }
  if (typeof e == "object") switch (e.$$typeof) {
    case gd:
      return (e.displayName || "Context") + ".Consumer";
    case pd:
      return (e._context.displayName || "Context") + ".Provider";
    case Fu:
      var t = e.render;
      return e = e.displayName, e || (e = t.displayName || t.name || "", e = e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef"), e;
    case Nu:
      return t = e.displayName || null, t !== null ? t : Sl(e.type) || "Memo";
    case pn:
      t = e._payload, e = e._init;
      try {
        return Sl(e(t));
      } catch {
      }
  }
  return null;
}
function Vp(e) {
  var t = e.type;
  switch (e.tag) {
    case 24:
      return "Cache";
    case 9:
      return (t.displayName || "Context") + ".Consumer";
    case 10:
      return (t._context.displayName || "Context") + ".Provider";
    case 18:
      return "DehydratedFragment";
    case 11:
      return e = t.render, e = e.displayName || e.name || "", t.displayName || (e !== "" ? "ForwardRef(" + e + ")" : "ForwardRef");
    case 7:
      return "Fragment";
    case 5:
      return t;
    case 4:
      return "Portal";
    case 3:
      return "Root";
    case 6:
      return "Text";
    case 16:
      return Sl(t);
    case 8:
      return t === Lu ? "StrictMode" : "Mode";
    case 22:
      return "Offscreen";
    case 12:
      return "Profiler";
    case 21:
      return "Scope";
    case 13:
      return "Suspense";
    case 19:
      return "SuspenseList";
    case 25:
      return "TracingMarker";
    case 1:
    case 0:
    case 17:
    case 2:
    case 14:
    case 15:
      if (typeof t == "function") return t.displayName || t.name || null;
      if (typeof t == "string") return t;
  }
  return null;
}
function bn(e) {
  switch (typeof e) {
    case "boolean":
    case "number":
    case "string":
    case "undefined":
      return e;
    case "object":
      return e;
    default:
      return "";
  }
}
function vd(e) {
  var t = e.type;
  return (e = e.nodeName) && e.toLowerCase() === "input" && (t === "checkbox" || t === "radio");
}
function Xp(e) {
  var t = vd(e) ? "checked" : "value", n = Object.getOwnPropertyDescriptor(e.constructor.prototype, t), r = "" + e[t];
  if (!e.hasOwnProperty(t) && typeof n < "u" && typeof n.get == "function" && typeof n.set == "function") {
    var i = n.get, o = n.set;
    return Object.defineProperty(e, t, { configurable: !0, get: function() {
      return i.call(this);
    }, set: function(s) {
      r = "" + s, o.call(this, s);
    } }), Object.defineProperty(e, t, { enumerable: n.enumerable }), { getValue: function() {
      return r;
    }, setValue: function(s) {
      r = "" + s;
    }, stopTracking: function() {
      e._valueTracker = null, delete e[t];
    } };
  }
}
function Gi(e) {
  e._valueTracker || (e._valueTracker = Xp(e));
}
function wd(e) {
  if (!e) return !1;
  var t = e._valueTracker;
  if (!t) return !0;
  var n = t.getValue(), r = "";
  return e && (r = vd(e) ? e.checked ? "true" : "false" : e.value), e = r, e !== n ? (t.setValue(e), !0) : !1;
}
function Do(e) {
  if (e = e || (typeof document < "u" ? document : void 0), typeof e > "u") return null;
  try {
    return e.activeElement || e.body;
  } catch {
    return e.body;
  }
}
function El(e, t) {
  var n = t.checked;
  return Fe({}, t, { defaultChecked: void 0, defaultValue: void 0, value: void 0, checked: n ?? e._wrapperState.initialChecked });
}
function Va(e, t) {
  var n = t.defaultValue == null ? "" : t.defaultValue, r = t.checked != null ? t.checked : t.defaultChecked;
  n = bn(t.value != null ? t.value : n), e._wrapperState = { initialChecked: r, initialValue: n, controlled: t.type === "checkbox" || t.type === "radio" ? t.checked != null : t.value != null };
}
function xd(e, t) {
  t = t.checked, t != null && bu(e, "checked", t, !1);
}
function Cl(e, t) {
  xd(e, t);
  var n = bn(t.value), r = t.type;
  if (n != null) r === "number" ? (n === 0 && e.value === "" || e.value != n) && (e.value = "" + n) : e.value !== "" + n && (e.value = "" + n);
  else if (r === "submit" || r === "reset") {
    e.removeAttribute("value");
    return;
  }
  t.hasOwnProperty("value") ? Rl(e, t.type, n) : t.hasOwnProperty("defaultValue") && Rl(e, t.type, bn(t.defaultValue)), t.checked == null && t.defaultChecked != null && (e.defaultChecked = !!t.defaultChecked);
}
function Xa(e, t, n) {
  if (t.hasOwnProperty("value") || t.hasOwnProperty("defaultValue")) {
    var r = t.type;
    if (!(r !== "submit" && r !== "reset" || t.value !== void 0 && t.value !== null)) return;
    t = "" + e._wrapperState.initialValue, n || t === e.value || (e.value = t), e.defaultValue = t;
  }
  n = e.name, n !== "" && (e.name = ""), e.defaultChecked = !!e._wrapperState.initialChecked, n !== "" && (e.name = n);
}
function Rl(e, t, n) {
  (t !== "number" || Do(e.ownerDocument) !== e) && (n == null ? e.defaultValue = "" + e._wrapperState.initialValue : e.defaultValue !== "" + n && (e.defaultValue = "" + n));
}
var Kr = Array.isArray;
function Sr(e, t, n, r) {
  if (e = e.options, t) {
    t = {};
    for (var i = 0; i < n.length; i++) t["$" + n[i]] = !0;
    for (n = 0; n < e.length; n++) i = t.hasOwnProperty("$" + e[n].value), e[n].selected !== i && (e[n].selected = i), i && r && (e[n].defaultSelected = !0);
  } else {
    for (n = "" + bn(n), t = null, i = 0; i < e.length; i++) {
      if (e[i].value === n) {
        e[i].selected = !0, r && (e[i].defaultSelected = !0);
        return;
      }
      t !== null || e[i].disabled || (t = e[i]);
    }
    t !== null && (t.selected = !0);
  }
}
function Pl(e, t) {
  if (t.dangerouslySetInnerHTML != null) throw Error(k(91));
  return Fe({}, t, { value: void 0, defaultValue: void 0, children: "" + e._wrapperState.initialValue });
}
function Ha(e, t) {
  var n = t.value;
  if (n == null) {
    if (n = t.children, t = t.defaultValue, n != null) {
      if (t != null) throw Error(k(92));
      if (Kr(n)) {
        if (1 < n.length) throw Error(k(93));
        n = n[0];
      }
      t = n;
    }
    t == null && (t = ""), n = t;
  }
  e._wrapperState = { initialValue: bn(n) };
}
function Sd(e, t) {
  var n = bn(t.value), r = bn(t.defaultValue);
  n != null && (n = "" + n, n !== e.value && (e.value = n), t.defaultValue == null && e.defaultValue !== n && (e.defaultValue = n)), r != null && (e.defaultValue = "" + r);
}
function Ga(e) {
  var t = e.textContent;
  t === e._wrapperState.initialValue && t !== "" && t !== null && (e.value = t);
}
function Ed(e) {
  switch (e) {
    case "svg":
      return "http://www.w3.org/2000/svg";
    case "math":
      return "http://www.w3.org/1998/Math/MathML";
    default:
      return "http://www.w3.org/1999/xhtml";
  }
}
function Ml(e, t) {
  return e == null || e === "http://www.w3.org/1999/xhtml" ? Ed(t) : e === "http://www.w3.org/2000/svg" && t === "foreignObject" ? "http://www.w3.org/1999/xhtml" : e;
}
var $i, Cd = function(e) {
  return typeof MSApp < "u" && MSApp.execUnsafeLocalFunction ? function(t, n, r, i) {
    MSApp.execUnsafeLocalFunction(function() {
      return e(t, n, r, i);
    });
  } : e;
}(function(e, t) {
  if (e.namespaceURI !== "http://www.w3.org/2000/svg" || "innerHTML" in e) e.innerHTML = t;
  else {
    for ($i = $i || document.createElement("div"), $i.innerHTML = "<svg>" + t.valueOf().toString() + "</svg>", t = $i.firstChild; e.firstChild; ) e.removeChild(e.firstChild);
    for (; t.firstChild; ) e.appendChild(t.firstChild);
  }
});
function di(e, t) {
  if (t) {
    var n = e.firstChild;
    if (n && n === e.lastChild && n.nodeType === 3) {
      n.nodeValue = t;
      return;
    }
  }
  e.textContent = t;
}
var ti = {
  animationIterationCount: !0,
  aspectRatio: !0,
  borderImageOutset: !0,
  borderImageSlice: !0,
  borderImageWidth: !0,
  boxFlex: !0,
  boxFlexGroup: !0,
  boxOrdinalGroup: !0,
  columnCount: !0,
  columns: !0,
  flex: !0,
  flexGrow: !0,
  flexPositive: !0,
  flexShrink: !0,
  flexNegative: !0,
  flexOrder: !0,
  gridArea: !0,
  gridRow: !0,
  gridRowEnd: !0,
  gridRowSpan: !0,
  gridRowStart: !0,
  gridColumn: !0,
  gridColumnEnd: !0,
  gridColumnSpan: !0,
  gridColumnStart: !0,
  fontWeight: !0,
  lineClamp: !0,
  lineHeight: !0,
  opacity: !0,
  order: !0,
  orphans: !0,
  tabSize: !0,
  widows: !0,
  zIndex: !0,
  zoom: !0,
  fillOpacity: !0,
  floodOpacity: !0,
  stopOpacity: !0,
  strokeDasharray: !0,
  strokeDashoffset: !0,
  strokeMiterlimit: !0,
  strokeOpacity: !0,
  strokeWidth: !0
}, Hp = ["Webkit", "ms", "Moz", "O"];
Object.keys(ti).forEach(function(e) {
  Hp.forEach(function(t) {
    t = t + e.charAt(0).toUpperCase() + e.substring(1), ti[t] = ti[e];
  });
});
function Rd(e, t, n) {
  return t == null || typeof t == "boolean" || t === "" ? "" : n || typeof t != "number" || t === 0 || ti.hasOwnProperty(e) && ti[e] ? ("" + t).trim() : t + "px";
}
function Pd(e, t) {
  e = e.style;
  for (var n in t) if (t.hasOwnProperty(n)) {
    var r = n.indexOf("--") === 0, i = Rd(n, t[n], r);
    n === "float" && (n = "cssFloat"), r ? e.setProperty(n, i) : e[n] = i;
  }
}
var Gp = Fe({ menuitem: !0 }, { area: !0, base: !0, br: !0, col: !0, embed: !0, hr: !0, img: !0, input: !0, keygen: !0, link: !0, meta: !0, param: !0, source: !0, track: !0, wbr: !0 });
function Tl(e, t) {
  if (t) {
    if (Gp[e] && (t.children != null || t.dangerouslySetInnerHTML != null)) throw Error(k(137, e));
    if (t.dangerouslySetInnerHTML != null) {
      if (t.children != null) throw Error(k(60));
      if (typeof t.dangerouslySetInnerHTML != "object" || !("__html" in t.dangerouslySetInnerHTML)) throw Error(k(61));
    }
    if (t.style != null && typeof t.style != "object") throw Error(k(62));
  }
}
function Al(e, t) {
  if (e.indexOf("-") === -1) return typeof t.is == "string";
  switch (e) {
    case "annotation-xml":
    case "color-profile":
    case "font-face":
    case "font-face-src":
    case "font-face-uri":
    case "font-face-format":
    case "font-face-name":
    case "missing-glyph":
      return !1;
    default:
      return !0;
  }
}
var _l = null;
function Du(e) {
  return e = e.target || e.srcElement || window, e.correspondingUseElement && (e = e.correspondingUseElement), e.nodeType === 3 ? e.parentNode : e;
}
var kl = null, Er = null, Cr = null;
function $a(e) {
  if (e = Ui(e)) {
    if (typeof kl != "function") throw Error(k(280));
    var t = e.stateNode;
    t && (t = xs(t), kl(e.stateNode, e.type, t));
  }
}
function Md(e) {
  Er ? Cr ? Cr.push(e) : Cr = [e] : Er = e;
}
function Td() {
  if (Er) {
    var e = Er, t = Cr;
    if (Cr = Er = null, $a(e), t) for (e = 0; e < t.length; e++) $a(t[e]);
  }
}
function Ad(e, t) {
  return e(t);
}
function _d() {
}
var Us = !1;
function kd(e, t, n) {
  if (Us) return e(t, n);
  Us = !0;
  try {
    return Ad(e, t, n);
  } finally {
    Us = !1, (Er !== null || Cr !== null) && (_d(), Td());
  }
}
function hi(e, t) {
  var n = e.stateNode;
  if (n === null) return null;
  var r = xs(n);
  if (r === null) return null;
  n = r[t];
  e: switch (t) {
    case "onClick":
    case "onClickCapture":
    case "onDoubleClick":
    case "onDoubleClickCapture":
    case "onMouseDown":
    case "onMouseDownCapture":
    case "onMouseMove":
    case "onMouseMoveCapture":
    case "onMouseUp":
    case "onMouseUpCapture":
    case "onMouseEnter":
      (r = !r.disabled) || (e = e.type, r = !(e === "button" || e === "input" || e === "select" || e === "textarea")), e = !r;
      break e;
    default:
      e = !1;
  }
  if (e) return null;
  if (n && typeof n != "function") throw Error(k(231, t, typeof n));
  return n;
}
var Il = !1;
if (sn) try {
  var Wr = {};
  Object.defineProperty(Wr, "passive", { get: function() {
    Il = !0;
  } }), window.addEventListener("test", Wr, Wr), window.removeEventListener("test", Wr, Wr);
} catch {
  Il = !1;
}
function $p(e, t, n, r, i, o, s, l, u) {
  var a = Array.prototype.slice.call(arguments, 3);
  try {
    t.apply(n, a);
  } catch (f) {
    this.onError(f);
  }
}
var ni = !1, zo = null, Uo = !1, bl = null, jp = { onError: function(e) {
  ni = !0, zo = e;
} };
function Zp(e, t, n, r, i, o, s, l, u) {
  ni = !1, zo = null, $p.apply(jp, arguments);
}
function qp(e, t, n, r, i, o, s, l, u) {
  if (Zp.apply(this, arguments), ni) {
    if (ni) {
      var a = zo;
      ni = !1, zo = null;
    } else throw Error(k(198));
    Uo || (Uo = !0, bl = a);
  }
}
function Jn(e) {
  var t = e, n = e;
  if (e.alternate) for (; t.return; ) t = t.return;
  else {
    e = t;
    do
      t = e, t.flags & 4098 && (n = t.return), e = t.return;
    while (e);
  }
  return t.tag === 3 ? n : null;
}
function Id(e) {
  if (e.tag === 13) {
    var t = e.memoizedState;
    if (t === null && (e = e.alternate, e !== null && (t = e.memoizedState)), t !== null) return t.dehydrated;
  }
  return null;
}
function ja(e) {
  if (Jn(e) !== e) throw Error(k(188));
}
function Kp(e) {
  var t = e.alternate;
  if (!t) {
    if (t = Jn(e), t === null) throw Error(k(188));
    return t !== e ? null : e;
  }
  for (var n = e, r = t; ; ) {
    var i = n.return;
    if (i === null) break;
    var o = i.alternate;
    if (o === null) {
      if (r = i.return, r !== null) {
        n = r;
        continue;
      }
      break;
    }
    if (i.child === o.child) {
      for (o = i.child; o; ) {
        if (o === n) return ja(i), e;
        if (o === r) return ja(i), t;
        o = o.sibling;
      }
      throw Error(k(188));
    }
    if (n.return !== r.return) n = i, r = o;
    else {
      for (var s = !1, l = i.child; l; ) {
        if (l === n) {
          s = !0, n = i, r = o;
          break;
        }
        if (l === r) {
          s = !0, r = i, n = o;
          break;
        }
        l = l.sibling;
      }
      if (!s) {
        for (l = o.child; l; ) {
          if (l === n) {
            s = !0, n = o, r = i;
            break;
          }
          if (l === r) {
            s = !0, r = o, n = i;
            break;
          }
          l = l.sibling;
        }
        if (!s) throw Error(k(189));
      }
    }
    if (n.alternate !== r) throw Error(k(190));
  }
  if (n.tag !== 3) throw Error(k(188));
  return n.stateNode.current === n ? e : t;
}
function bd(e) {
  return e = Kp(e), e !== null ? Ld(e) : null;
}
function Ld(e) {
  if (e.tag === 5 || e.tag === 6) return e;
  for (e = e.child; e !== null; ) {
    var t = Ld(e);
    if (t !== null) return t;
    e = e.sibling;
  }
  return null;
}
var Fd = Et.unstable_scheduleCallback, Za = Et.unstable_cancelCallback, Qp = Et.unstable_shouldYield, Jp = Et.unstable_requestPaint, Ue = Et.unstable_now, eg = Et.unstable_getCurrentPriorityLevel, zu = Et.unstable_ImmediatePriority, Nd = Et.unstable_UserBlockingPriority, Bo = Et.unstable_NormalPriority, tg = Et.unstable_LowPriority, Dd = Et.unstable_IdlePriority, gs = null, jt = null;
function ng(e) {
  if (jt && typeof jt.onCommitFiberRoot == "function") try {
    jt.onCommitFiberRoot(gs, e, void 0, (e.current.flags & 128) === 128);
  } catch {
  }
}
var Yt = Math.clz32 ? Math.clz32 : og, rg = Math.log, ig = Math.LN2;
function og(e) {
  return e >>>= 0, e === 0 ? 32 : 31 - (rg(e) / ig | 0) | 0;
}
var ji = 64, Zi = 4194304;
function Qr(e) {
  switch (e & -e) {
    case 1:
      return 1;
    case 2:
      return 2;
    case 4:
      return 4;
    case 8:
      return 8;
    case 16:
      return 16;
    case 32:
      return 32;
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return e & 4194240;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return e & 130023424;
    case 134217728:
      return 134217728;
    case 268435456:
      return 268435456;
    case 536870912:
      return 536870912;
    case 1073741824:
      return 1073741824;
    default:
      return e;
  }
}
function Oo(e, t) {
  var n = e.pendingLanes;
  if (n === 0) return 0;
  var r = 0, i = e.suspendedLanes, o = e.pingedLanes, s = n & 268435455;
  if (s !== 0) {
    var l = s & ~i;
    l !== 0 ? r = Qr(l) : (o &= s, o !== 0 && (r = Qr(o)));
  } else s = n & ~i, s !== 0 ? r = Qr(s) : o !== 0 && (r = Qr(o));
  if (r === 0) return 0;
  if (t !== 0 && t !== r && !(t & i) && (i = r & -r, o = t & -t, i >= o || i === 16 && (o & 4194240) !== 0)) return t;
  if (r & 4 && (r |= n & 16), t = e.entangledLanes, t !== 0) for (e = e.entanglements, t &= r; 0 < t; ) n = 31 - Yt(t), i = 1 << n, r |= e[n], t &= ~i;
  return r;
}
function sg(e, t) {
  switch (e) {
    case 1:
    case 2:
    case 4:
      return t + 250;
    case 8:
    case 16:
    case 32:
    case 64:
    case 128:
    case 256:
    case 512:
    case 1024:
    case 2048:
    case 4096:
    case 8192:
    case 16384:
    case 32768:
    case 65536:
    case 131072:
    case 262144:
    case 524288:
    case 1048576:
    case 2097152:
      return t + 5e3;
    case 4194304:
    case 8388608:
    case 16777216:
    case 33554432:
    case 67108864:
      return -1;
    case 134217728:
    case 268435456:
    case 536870912:
    case 1073741824:
      return -1;
    default:
      return -1;
  }
}
function lg(e, t) {
  for (var n = e.suspendedLanes, r = e.pingedLanes, i = e.expirationTimes, o = e.pendingLanes; 0 < o; ) {
    var s = 31 - Yt(o), l = 1 << s, u = i[s];
    u === -1 ? (!(l & n) || l & r) && (i[s] = sg(l, t)) : u <= t && (e.expiredLanes |= l), o &= ~l;
  }
}
function Ll(e) {
  return e = e.pendingLanes & -1073741825, e !== 0 ? e : e & 1073741824 ? 1073741824 : 0;
}
function zd() {
  var e = ji;
  return ji <<= 1, !(ji & 4194240) && (ji = 64), e;
}
function Bs(e) {
  for (var t = [], n = 0; 31 > n; n++) t.push(e);
  return t;
}
function Di(e, t, n) {
  e.pendingLanes |= t, t !== 536870912 && (e.suspendedLanes = 0, e.pingedLanes = 0), e = e.eventTimes, t = 31 - Yt(t), e[t] = n;
}
function ug(e, t) {
  var n = e.pendingLanes & ~t;
  e.pendingLanes = t, e.suspendedLanes = 0, e.pingedLanes = 0, e.expiredLanes &= t, e.mutableReadLanes &= t, e.entangledLanes &= t, t = e.entanglements;
  var r = e.eventTimes;
  for (e = e.expirationTimes; 0 < n; ) {
    var i = 31 - Yt(n), o = 1 << i;
    t[i] = 0, r[i] = -1, e[i] = -1, n &= ~o;
  }
}
function Uu(e, t) {
  var n = e.entangledLanes |= t;
  for (e = e.entanglements; n; ) {
    var r = 31 - Yt(n), i = 1 << r;
    i & t | e[r] & t && (e[r] |= t), n &= ~i;
  }
}
var we = 0;
function Ud(e) {
  return e &= -e, 1 < e ? 4 < e ? e & 268435455 ? 16 : 536870912 : 4 : 1;
}
var Bd, Bu, Od, Wd, Yd, Fl = !1, qi = [], Cn = null, Rn = null, Pn = null, mi = /* @__PURE__ */ new Map(), pi = /* @__PURE__ */ new Map(), yn = [], ag = "mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset submit".split(" ");
function qa(e, t) {
  switch (e) {
    case "focusin":
    case "focusout":
      Cn = null;
      break;
    case "dragenter":
    case "dragleave":
      Rn = null;
      break;
    case "mouseover":
    case "mouseout":
      Pn = null;
      break;
    case "pointerover":
    case "pointerout":
      mi.delete(t.pointerId);
      break;
    case "gotpointercapture":
    case "lostpointercapture":
      pi.delete(t.pointerId);
  }
}
function Yr(e, t, n, r, i, o) {
  return e === null || e.nativeEvent !== o ? (e = { blockedOn: t, domEventName: n, eventSystemFlags: r, nativeEvent: o, targetContainers: [i] }, t !== null && (t = Ui(t), t !== null && Bu(t)), e) : (e.eventSystemFlags |= r, t = e.targetContainers, i !== null && t.indexOf(i) === -1 && t.push(i), e);
}
function cg(e, t, n, r, i) {
  switch (t) {
    case "focusin":
      return Cn = Yr(Cn, e, t, n, r, i), !0;
    case "dragenter":
      return Rn = Yr(Rn, e, t, n, r, i), !0;
    case "mouseover":
      return Pn = Yr(Pn, e, t, n, r, i), !0;
    case "pointerover":
      var o = i.pointerId;
      return mi.set(o, Yr(mi.get(o) || null, e, t, n, r, i)), !0;
    case "gotpointercapture":
      return o = i.pointerId, pi.set(o, Yr(pi.get(o) || null, e, t, n, r, i)), !0;
  }
  return !1;
}
function Vd(e) {
  var t = Wn(e.target);
  if (t !== null) {
    var n = Jn(t);
    if (n !== null) {
      if (t = n.tag, t === 13) {
        if (t = Id(n), t !== null) {
          e.blockedOn = t, Yd(e.priority, function() {
            Od(n);
          });
          return;
        }
      } else if (t === 3 && n.stateNode.current.memoizedState.isDehydrated) {
        e.blockedOn = n.tag === 3 ? n.stateNode.containerInfo : null;
        return;
      }
    }
  }
  e.blockedOn = null;
}
function So(e) {
  if (e.blockedOn !== null) return !1;
  for (var t = e.targetContainers; 0 < t.length; ) {
    var n = Nl(e.domEventName, e.eventSystemFlags, t[0], e.nativeEvent);
    if (n === null) {
      n = e.nativeEvent;
      var r = new n.constructor(n.type, n);
      _l = r, n.target.dispatchEvent(r), _l = null;
    } else return t = Ui(n), t !== null && Bu(t), e.blockedOn = n, !1;
    t.shift();
  }
  return !0;
}
function Ka(e, t, n) {
  So(e) && n.delete(t);
}
function fg() {
  Fl = !1, Cn !== null && So(Cn) && (Cn = null), Rn !== null && So(Rn) && (Rn = null), Pn !== null && So(Pn) && (Pn = null), mi.forEach(Ka), pi.forEach(Ka);
}
function Vr(e, t) {
  e.blockedOn === t && (e.blockedOn = null, Fl || (Fl = !0, Et.unstable_scheduleCallback(Et.unstable_NormalPriority, fg)));
}
function gi(e) {
  function t(i) {
    return Vr(i, e);
  }
  if (0 < qi.length) {
    Vr(qi[0], e);
    for (var n = 1; n < qi.length; n++) {
      var r = qi[n];
      r.blockedOn === e && (r.blockedOn = null);
    }
  }
  for (Cn !== null && Vr(Cn, e), Rn !== null && Vr(Rn, e), Pn !== null && Vr(Pn, e), mi.forEach(t), pi.forEach(t), n = 0; n < yn.length; n++) r = yn[n], r.blockedOn === e && (r.blockedOn = null);
  for (; 0 < yn.length && (n = yn[0], n.blockedOn === null); ) Vd(n), n.blockedOn === null && yn.shift();
}
var Rr = cn.ReactCurrentBatchConfig, Wo = !0;
function dg(e, t, n, r) {
  var i = we, o = Rr.transition;
  Rr.transition = null;
  try {
    we = 1, Ou(e, t, n, r);
  } finally {
    we = i, Rr.transition = o;
  }
}
function hg(e, t, n, r) {
  var i = we, o = Rr.transition;
  Rr.transition = null;
  try {
    we = 4, Ou(e, t, n, r);
  } finally {
    we = i, Rr.transition = o;
  }
}
function Ou(e, t, n, r) {
  if (Wo) {
    var i = Nl(e, t, n, r);
    if (i === null) Zs(e, t, r, Yo, n), qa(e, r);
    else if (cg(i, e, t, n, r)) r.stopPropagation();
    else if (qa(e, r), t & 4 && -1 < ag.indexOf(e)) {
      for (; i !== null; ) {
        var o = Ui(i);
        if (o !== null && Bd(o), o = Nl(e, t, n, r), o === null && Zs(e, t, r, Yo, n), o === i) break;
        i = o;
      }
      i !== null && r.stopPropagation();
    } else Zs(e, t, r, null, n);
  }
}
var Yo = null;
function Nl(e, t, n, r) {
  if (Yo = null, e = Du(r), e = Wn(e), e !== null) if (t = Jn(e), t === null) e = null;
  else if (n = t.tag, n === 13) {
    if (e = Id(t), e !== null) return e;
    e = null;
  } else if (n === 3) {
    if (t.stateNode.current.memoizedState.isDehydrated) return t.tag === 3 ? t.stateNode.containerInfo : null;
    e = null;
  } else t !== e && (e = null);
  return Yo = e, null;
}
function Xd(e) {
  switch (e) {
    case "cancel":
    case "click":
    case "close":
    case "contextmenu":
    case "copy":
    case "cut":
    case "auxclick":
    case "dblclick":
    case "dragend":
    case "dragstart":
    case "drop":
    case "focusin":
    case "focusout":
    case "input":
    case "invalid":
    case "keydown":
    case "keypress":
    case "keyup":
    case "mousedown":
    case "mouseup":
    case "paste":
    case "pause":
    case "play":
    case "pointercancel":
    case "pointerdown":
    case "pointerup":
    case "ratechange":
    case "reset":
    case "resize":
    case "seeked":
    case "submit":
    case "touchcancel":
    case "touchend":
    case "touchstart":
    case "volumechange":
    case "change":
    case "selectionchange":
    case "textInput":
    case "compositionstart":
    case "compositionend":
    case "compositionupdate":
    case "beforeblur":
    case "afterblur":
    case "beforeinput":
    case "blur":
    case "fullscreenchange":
    case "focus":
    case "hashchange":
    case "popstate":
    case "select":
    case "selectstart":
      return 1;
    case "drag":
    case "dragenter":
    case "dragexit":
    case "dragleave":
    case "dragover":
    case "mousemove":
    case "mouseout":
    case "mouseover":
    case "pointermove":
    case "pointerout":
    case "pointerover":
    case "scroll":
    case "toggle":
    case "touchmove":
    case "wheel":
    case "mouseenter":
    case "mouseleave":
    case "pointerenter":
    case "pointerleave":
      return 4;
    case "message":
      switch (eg()) {
        case zu:
          return 1;
        case Nd:
          return 4;
        case Bo:
        case tg:
          return 16;
        case Dd:
          return 536870912;
        default:
          return 16;
      }
    default:
      return 16;
  }
}
var xn = null, Wu = null, Eo = null;
function Hd() {
  if (Eo) return Eo;
  var e, t = Wu, n = t.length, r, i = "value" in xn ? xn.value : xn.textContent, o = i.length;
  for (e = 0; e < n && t[e] === i[e]; e++) ;
  var s = n - e;
  for (r = 1; r <= s && t[n - r] === i[o - r]; r++) ;
  return Eo = i.slice(e, 1 < r ? 1 - r : void 0);
}
function Co(e) {
  var t = e.keyCode;
  return "charCode" in e ? (e = e.charCode, e === 0 && t === 13 && (e = 13)) : e = t, e === 10 && (e = 13), 32 <= e || e === 13 ? e : 0;
}
function Ki() {
  return !0;
}
function Qa() {
  return !1;
}
function Rt(e) {
  function t(n, r, i, o, s) {
    this._reactName = n, this._targetInst = i, this.type = r, this.nativeEvent = o, this.target = s, this.currentTarget = null;
    for (var l in e) e.hasOwnProperty(l) && (n = e[l], this[l] = n ? n(o) : o[l]);
    return this.isDefaultPrevented = (o.defaultPrevented != null ? o.defaultPrevented : o.returnValue === !1) ? Ki : Qa, this.isPropagationStopped = Qa, this;
  }
  return Fe(t.prototype, { preventDefault: function() {
    this.defaultPrevented = !0;
    var n = this.nativeEvent;
    n && (n.preventDefault ? n.preventDefault() : typeof n.returnValue != "unknown" && (n.returnValue = !1), this.isDefaultPrevented = Ki);
  }, stopPropagation: function() {
    var n = this.nativeEvent;
    n && (n.stopPropagation ? n.stopPropagation() : typeof n.cancelBubble != "unknown" && (n.cancelBubble = !0), this.isPropagationStopped = Ki);
  }, persist: function() {
  }, isPersistent: Ki }), t;
}
var Dr = { eventPhase: 0, bubbles: 0, cancelable: 0, timeStamp: function(e) {
  return e.timeStamp || Date.now();
}, defaultPrevented: 0, isTrusted: 0 }, Yu = Rt(Dr), zi = Fe({}, Dr, { view: 0, detail: 0 }), mg = Rt(zi), Os, Ws, Xr, ys = Fe({}, zi, { screenX: 0, screenY: 0, clientX: 0, clientY: 0, pageX: 0, pageY: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, getModifierState: Vu, button: 0, buttons: 0, relatedTarget: function(e) {
  return e.relatedTarget === void 0 ? e.fromElement === e.srcElement ? e.toElement : e.fromElement : e.relatedTarget;
}, movementX: function(e) {
  return "movementX" in e ? e.movementX : (e !== Xr && (Xr && e.type === "mousemove" ? (Os = e.screenX - Xr.screenX, Ws = e.screenY - Xr.screenY) : Ws = Os = 0, Xr = e), Os);
}, movementY: function(e) {
  return "movementY" in e ? e.movementY : Ws;
} }), Ja = Rt(ys), pg = Fe({}, ys, { dataTransfer: 0 }), gg = Rt(pg), yg = Fe({}, zi, { relatedTarget: 0 }), Ys = Rt(yg), vg = Fe({}, Dr, { animationName: 0, elapsedTime: 0, pseudoElement: 0 }), wg = Rt(vg), xg = Fe({}, Dr, { clipboardData: function(e) {
  return "clipboardData" in e ? e.clipboardData : window.clipboardData;
} }), Sg = Rt(xg), Eg = Fe({}, Dr, { data: 0 }), ec = Rt(Eg), Cg = {
  Esc: "Escape",
  Spacebar: " ",
  Left: "ArrowLeft",
  Up: "ArrowUp",
  Right: "ArrowRight",
  Down: "ArrowDown",
  Del: "Delete",
  Win: "OS",
  Menu: "ContextMenu",
  Apps: "ContextMenu",
  Scroll: "ScrollLock",
  MozPrintableKey: "Unidentified"
}, Rg = {
  8: "Backspace",
  9: "Tab",
  12: "Clear",
  13: "Enter",
  16: "Shift",
  17: "Control",
  18: "Alt",
  19: "Pause",
  20: "CapsLock",
  27: "Escape",
  32: " ",
  33: "PageUp",
  34: "PageDown",
  35: "End",
  36: "Home",
  37: "ArrowLeft",
  38: "ArrowUp",
  39: "ArrowRight",
  40: "ArrowDown",
  45: "Insert",
  46: "Delete",
  112: "F1",
  113: "F2",
  114: "F3",
  115: "F4",
  116: "F5",
  117: "F6",
  118: "F7",
  119: "F8",
  120: "F9",
  121: "F10",
  122: "F11",
  123: "F12",
  144: "NumLock",
  145: "ScrollLock",
  224: "Meta"
}, Pg = { Alt: "altKey", Control: "ctrlKey", Meta: "metaKey", Shift: "shiftKey" };
function Mg(e) {
  var t = this.nativeEvent;
  return t.getModifierState ? t.getModifierState(e) : (e = Pg[e]) ? !!t[e] : !1;
}
function Vu() {
  return Mg;
}
var Tg = Fe({}, zi, { key: function(e) {
  if (e.key) {
    var t = Cg[e.key] || e.key;
    if (t !== "Unidentified") return t;
  }
  return e.type === "keypress" ? (e = Co(e), e === 13 ? "Enter" : String.fromCharCode(e)) : e.type === "keydown" || e.type === "keyup" ? Rg[e.keyCode] || "Unidentified" : "";
}, code: 0, location: 0, ctrlKey: 0, shiftKey: 0, altKey: 0, metaKey: 0, repeat: 0, locale: 0, getModifierState: Vu, charCode: function(e) {
  return e.type === "keypress" ? Co(e) : 0;
}, keyCode: function(e) {
  return e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
}, which: function(e) {
  return e.type === "keypress" ? Co(e) : e.type === "keydown" || e.type === "keyup" ? e.keyCode : 0;
} }), Ag = Rt(Tg), _g = Fe({}, ys, { pointerId: 0, width: 0, height: 0, pressure: 0, tangentialPressure: 0, tiltX: 0, tiltY: 0, twist: 0, pointerType: 0, isPrimary: 0 }), tc = Rt(_g), kg = Fe({}, zi, { touches: 0, targetTouches: 0, changedTouches: 0, altKey: 0, metaKey: 0, ctrlKey: 0, shiftKey: 0, getModifierState: Vu }), Ig = Rt(kg), bg = Fe({}, Dr, { propertyName: 0, elapsedTime: 0, pseudoElement: 0 }), Lg = Rt(bg), Fg = Fe({}, ys, {
  deltaX: function(e) {
    return "deltaX" in e ? e.deltaX : "wheelDeltaX" in e ? -e.wheelDeltaX : 0;
  },
  deltaY: function(e) {
    return "deltaY" in e ? e.deltaY : "wheelDeltaY" in e ? -e.wheelDeltaY : "wheelDelta" in e ? -e.wheelDelta : 0;
  },
  deltaZ: 0,
  deltaMode: 0
}), Ng = Rt(Fg), Dg = [9, 13, 27, 32], Xu = sn && "CompositionEvent" in window, ri = null;
sn && "documentMode" in document && (ri = document.documentMode);
var zg = sn && "TextEvent" in window && !ri, Gd = sn && (!Xu || ri && 8 < ri && 11 >= ri), nc = " ", rc = !1;
function $d(e, t) {
  switch (e) {
    case "keyup":
      return Dg.indexOf(t.keyCode) !== -1;
    case "keydown":
      return t.keyCode !== 229;
    case "keypress":
    case "mousedown":
    case "focusout":
      return !0;
    default:
      return !1;
  }
}
function jd(e) {
  return e = e.detail, typeof e == "object" && "data" in e ? e.data : null;
}
var ar = !1;
function Ug(e, t) {
  switch (e) {
    case "compositionend":
      return jd(t);
    case "keypress":
      return t.which !== 32 ? null : (rc = !0, nc);
    case "textInput":
      return e = t.data, e === nc && rc ? null : e;
    default:
      return null;
  }
}
function Bg(e, t) {
  if (ar) return e === "compositionend" || !Xu && $d(e, t) ? (e = Hd(), Eo = Wu = xn = null, ar = !1, e) : null;
  switch (e) {
    case "paste":
      return null;
    case "keypress":
      if (!(t.ctrlKey || t.altKey || t.metaKey) || t.ctrlKey && t.altKey) {
        if (t.char && 1 < t.char.length) return t.char;
        if (t.which) return String.fromCharCode(t.which);
      }
      return null;
    case "compositionend":
      return Gd && t.locale !== "ko" ? null : t.data;
    default:
      return null;
  }
}
var Og = { color: !0, date: !0, datetime: !0, "datetime-local": !0, email: !0, month: !0, number: !0, password: !0, range: !0, search: !0, tel: !0, text: !0, time: !0, url: !0, week: !0 };
function ic(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t === "input" ? !!Og[e.type] : t === "textarea";
}
function Zd(e, t, n, r) {
  Md(r), t = Vo(t, "onChange"), 0 < t.length && (n = new Yu("onChange", "change", null, n, r), e.push({ event: n, listeners: t }));
}
var ii = null, yi = null;
function Wg(e) {
  sh(e, 0);
}
function vs(e) {
  var t = dr(e);
  if (wd(t)) return e;
}
function Yg(e, t) {
  if (e === "change") return t;
}
var qd = !1;
if (sn) {
  var Vs;
  if (sn) {
    var Xs = "oninput" in document;
    if (!Xs) {
      var oc = document.createElement("div");
      oc.setAttribute("oninput", "return;"), Xs = typeof oc.oninput == "function";
    }
    Vs = Xs;
  } else Vs = !1;
  qd = Vs && (!document.documentMode || 9 < document.documentMode);
}
function sc() {
  ii && (ii.detachEvent("onpropertychange", Kd), yi = ii = null);
}
function Kd(e) {
  if (e.propertyName === "value" && vs(yi)) {
    var t = [];
    Zd(t, yi, e, Du(e)), kd(Wg, t);
  }
}
function Vg(e, t, n) {
  e === "focusin" ? (sc(), ii = t, yi = n, ii.attachEvent("onpropertychange", Kd)) : e === "focusout" && sc();
}
function Xg(e) {
  if (e === "selectionchange" || e === "keyup" || e === "keydown") return vs(yi);
}
function Hg(e, t) {
  if (e === "click") return vs(t);
}
function Gg(e, t) {
  if (e === "input" || e === "change") return vs(t);
}
function $g(e, t) {
  return e === t && (e !== 0 || 1 / e === 1 / t) || e !== e && t !== t;
}
var Xt = typeof Object.is == "function" ? Object.is : $g;
function vi(e, t) {
  if (Xt(e, t)) return !0;
  if (typeof e != "object" || e === null || typeof t != "object" || t === null) return !1;
  var n = Object.keys(e), r = Object.keys(t);
  if (n.length !== r.length) return !1;
  for (r = 0; r < n.length; r++) {
    var i = n[r];
    if (!yl.call(t, i) || !Xt(e[i], t[i])) return !1;
  }
  return !0;
}
function lc(e) {
  for (; e && e.firstChild; ) e = e.firstChild;
  return e;
}
function uc(e, t) {
  var n = lc(e);
  e = 0;
  for (var r; n; ) {
    if (n.nodeType === 3) {
      if (r = e + n.textContent.length, e <= t && r >= t) return { node: n, offset: t - e };
      e = r;
    }
    e: {
      for (; n; ) {
        if (n.nextSibling) {
          n = n.nextSibling;
          break e;
        }
        n = n.parentNode;
      }
      n = void 0;
    }
    n = lc(n);
  }
}
function Qd(e, t) {
  return e && t ? e === t ? !0 : e && e.nodeType === 3 ? !1 : t && t.nodeType === 3 ? Qd(e, t.parentNode) : "contains" in e ? e.contains(t) : e.compareDocumentPosition ? !!(e.compareDocumentPosition(t) & 16) : !1 : !1;
}
function Jd() {
  for (var e = window, t = Do(); t instanceof e.HTMLIFrameElement; ) {
    try {
      var n = typeof t.contentWindow.location.href == "string";
    } catch {
      n = !1;
    }
    if (n) e = t.contentWindow;
    else break;
    t = Do(e.document);
  }
  return t;
}
function Hu(e) {
  var t = e && e.nodeName && e.nodeName.toLowerCase();
  return t && (t === "input" && (e.type === "text" || e.type === "search" || e.type === "tel" || e.type === "url" || e.type === "password") || t === "textarea" || e.contentEditable === "true");
}
function jg(e) {
  var t = Jd(), n = e.focusedElem, r = e.selectionRange;
  if (t !== n && n && n.ownerDocument && Qd(n.ownerDocument.documentElement, n)) {
    if (r !== null && Hu(n)) {
      if (t = r.start, e = r.end, e === void 0 && (e = t), "selectionStart" in n) n.selectionStart = t, n.selectionEnd = Math.min(e, n.value.length);
      else if (e = (t = n.ownerDocument || document) && t.defaultView || window, e.getSelection) {
        e = e.getSelection();
        var i = n.textContent.length, o = Math.min(r.start, i);
        r = r.end === void 0 ? o : Math.min(r.end, i), !e.extend && o > r && (i = r, r = o, o = i), i = uc(n, o);
        var s = uc(
          n,
          r
        );
        i && s && (e.rangeCount !== 1 || e.anchorNode !== i.node || e.anchorOffset !== i.offset || e.focusNode !== s.node || e.focusOffset !== s.offset) && (t = t.createRange(), t.setStart(i.node, i.offset), e.removeAllRanges(), o > r ? (e.addRange(t), e.extend(s.node, s.offset)) : (t.setEnd(s.node, s.offset), e.addRange(t)));
      }
    }
    for (t = [], e = n; e = e.parentNode; ) e.nodeType === 1 && t.push({ element: e, left: e.scrollLeft, top: e.scrollTop });
    for (typeof n.focus == "function" && n.focus(), n = 0; n < t.length; n++) e = t[n], e.element.scrollLeft = e.left, e.element.scrollTop = e.top;
  }
}
var Zg = sn && "documentMode" in document && 11 >= document.documentMode, cr = null, Dl = null, oi = null, zl = !1;
function ac(e, t, n) {
  var r = n.window === n ? n.document : n.nodeType === 9 ? n : n.ownerDocument;
  zl || cr == null || cr !== Do(r) || (r = cr, "selectionStart" in r && Hu(r) ? r = { start: r.selectionStart, end: r.selectionEnd } : (r = (r.ownerDocument && r.ownerDocument.defaultView || window).getSelection(), r = { anchorNode: r.anchorNode, anchorOffset: r.anchorOffset, focusNode: r.focusNode, focusOffset: r.focusOffset }), oi && vi(oi, r) || (oi = r, r = Vo(Dl, "onSelect"), 0 < r.length && (t = new Yu("onSelect", "select", null, t, n), e.push({ event: t, listeners: r }), t.target = cr)));
}
function Qi(e, t) {
  var n = {};
  return n[e.toLowerCase()] = t.toLowerCase(), n["Webkit" + e] = "webkit" + t, n["Moz" + e] = "moz" + t, n;
}
var fr = { animationend: Qi("Animation", "AnimationEnd"), animationiteration: Qi("Animation", "AnimationIteration"), animationstart: Qi("Animation", "AnimationStart"), transitionend: Qi("Transition", "TransitionEnd") }, Hs = {}, eh = {};
sn && (eh = document.createElement("div").style, "AnimationEvent" in window || (delete fr.animationend.animation, delete fr.animationiteration.animation, delete fr.animationstart.animation), "TransitionEvent" in window || delete fr.transitionend.transition);
function ws(e) {
  if (Hs[e]) return Hs[e];
  if (!fr[e]) return e;
  var t = fr[e], n;
  for (n in t) if (t.hasOwnProperty(n) && n in eh) return Hs[e] = t[n];
  return e;
}
var th = ws("animationend"), nh = ws("animationiteration"), rh = ws("animationstart"), ih = ws("transitionend"), oh = /* @__PURE__ */ new Map(), cc = "abort auxClick cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");
function Nn(e, t) {
  oh.set(e, t), Qn(t, [e]);
}
for (var Gs = 0; Gs < cc.length; Gs++) {
  var $s = cc[Gs], qg = $s.toLowerCase(), Kg = $s[0].toUpperCase() + $s.slice(1);
  Nn(qg, "on" + Kg);
}
Nn(th, "onAnimationEnd");
Nn(nh, "onAnimationIteration");
Nn(rh, "onAnimationStart");
Nn("dblclick", "onDoubleClick");
Nn("focusin", "onFocus");
Nn("focusout", "onBlur");
Nn(ih, "onTransitionEnd");
Tr("onMouseEnter", ["mouseout", "mouseover"]);
Tr("onMouseLeave", ["mouseout", "mouseover"]);
Tr("onPointerEnter", ["pointerout", "pointerover"]);
Tr("onPointerLeave", ["pointerout", "pointerover"]);
Qn("onChange", "change click focusin focusout input keydown keyup selectionchange".split(" "));
Qn("onSelect", "focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));
Qn("onBeforeInput", ["compositionend", "keypress", "textInput", "paste"]);
Qn("onCompositionEnd", "compositionend focusout keydown keypress keyup mousedown".split(" "));
Qn("onCompositionStart", "compositionstart focusout keydown keypress keyup mousedown".split(" "));
Qn("onCompositionUpdate", "compositionupdate focusout keydown keypress keyup mousedown".split(" "));
var Jr = "abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "), Qg = new Set("cancel close invalid load scroll toggle".split(" ").concat(Jr));
function fc(e, t, n) {
  var r = e.type || "unknown-event";
  e.currentTarget = n, qp(r, t, void 0, e), e.currentTarget = null;
}
function sh(e, t) {
  t = (t & 4) !== 0;
  for (var n = 0; n < e.length; n++) {
    var r = e[n], i = r.event;
    r = r.listeners;
    e: {
      var o = void 0;
      if (t) for (var s = r.length - 1; 0 <= s; s--) {
        var l = r[s], u = l.instance, a = l.currentTarget;
        if (l = l.listener, u !== o && i.isPropagationStopped()) break e;
        fc(i, l, a), o = u;
      }
      else for (s = 0; s < r.length; s++) {
        if (l = r[s], u = l.instance, a = l.currentTarget, l = l.listener, u !== o && i.isPropagationStopped()) break e;
        fc(i, l, a), o = u;
      }
    }
  }
  if (Uo) throw e = bl, Uo = !1, bl = null, e;
}
function Te(e, t) {
  var n = t[Yl];
  n === void 0 && (n = t[Yl] = /* @__PURE__ */ new Set());
  var r = e + "__bubble";
  n.has(r) || (lh(t, e, 2, !1), n.add(r));
}
function js(e, t, n) {
  var r = 0;
  t && (r |= 4), lh(n, e, r, t);
}
var Ji = "_reactListening" + Math.random().toString(36).slice(2);
function wi(e) {
  if (!e[Ji]) {
    e[Ji] = !0, md.forEach(function(n) {
      n !== "selectionchange" && (Qg.has(n) || js(n, !1, e), js(n, !0, e));
    });
    var t = e.nodeType === 9 ? e : e.ownerDocument;
    t === null || t[Ji] || (t[Ji] = !0, js("selectionchange", !1, t));
  }
}
function lh(e, t, n, r) {
  switch (Xd(t)) {
    case 1:
      var i = dg;
      break;
    case 4:
      i = hg;
      break;
    default:
      i = Ou;
  }
  n = i.bind(null, t, n, e), i = void 0, !Il || t !== "touchstart" && t !== "touchmove" && t !== "wheel" || (i = !0), r ? i !== void 0 ? e.addEventListener(t, n, { capture: !0, passive: i }) : e.addEventListener(t, n, !0) : i !== void 0 ? e.addEventListener(t, n, { passive: i }) : e.addEventListener(t, n, !1);
}
function Zs(e, t, n, r, i) {
  var o = r;
  if (!(t & 1) && !(t & 2) && r !== null) e: for (; ; ) {
    if (r === null) return;
    var s = r.tag;
    if (s === 3 || s === 4) {
      var l = r.stateNode.containerInfo;
      if (l === i || l.nodeType === 8 && l.parentNode === i) break;
      if (s === 4) for (s = r.return; s !== null; ) {
        var u = s.tag;
        if ((u === 3 || u === 4) && (u = s.stateNode.containerInfo, u === i || u.nodeType === 8 && u.parentNode === i)) return;
        s = s.return;
      }
      for (; l !== null; ) {
        if (s = Wn(l), s === null) return;
        if (u = s.tag, u === 5 || u === 6) {
          r = o = s;
          continue e;
        }
        l = l.parentNode;
      }
    }
    r = r.return;
  }
  kd(function() {
    var a = o, f = Du(n), c = [];
    e: {
      var d = oh.get(e);
      if (d !== void 0) {
        var h = Yu, g = e;
        switch (e) {
          case "keypress":
            if (Co(n) === 0) break e;
          case "keydown":
          case "keyup":
            h = Ag;
            break;
          case "focusin":
            g = "focus", h = Ys;
            break;
          case "focusout":
            g = "blur", h = Ys;
            break;
          case "beforeblur":
          case "afterblur":
            h = Ys;
            break;
          case "click":
            if (n.button === 2) break e;
          case "auxclick":
          case "dblclick":
          case "mousedown":
          case "mousemove":
          case "mouseup":
          case "mouseout":
          case "mouseover":
          case "contextmenu":
            h = Ja;
            break;
          case "drag":
          case "dragend":
          case "dragenter":
          case "dragexit":
          case "dragleave":
          case "dragover":
          case "dragstart":
          case "drop":
            h = gg;
            break;
          case "touchcancel":
          case "touchend":
          case "touchmove":
          case "touchstart":
            h = Ig;
            break;
          case th:
          case nh:
          case rh:
            h = wg;
            break;
          case ih:
            h = Lg;
            break;
          case "scroll":
            h = mg;
            break;
          case "wheel":
            h = Ng;
            break;
          case "copy":
          case "cut":
          case "paste":
            h = Sg;
            break;
          case "gotpointercapture":
          case "lostpointercapture":
          case "pointercancel":
          case "pointerdown":
          case "pointermove":
          case "pointerout":
          case "pointerover":
          case "pointerup":
            h = tc;
        }
        var y = (t & 4) !== 0, x = !y && e === "scroll", p = y ? d !== null ? d + "Capture" : null : d;
        y = [];
        for (var m = a, v; m !== null; ) {
          v = m;
          var w = v.stateNode;
          if (v.tag === 5 && w !== null && (v = w, p !== null && (w = hi(m, p), w != null && y.push(xi(m, w, v)))), x) break;
          m = m.return;
        }
        0 < y.length && (d = new h(d, g, null, n, f), c.push({ event: d, listeners: y }));
      }
    }
    if (!(t & 7)) {
      e: {
        if (d = e === "mouseover" || e === "pointerover", h = e === "mouseout" || e === "pointerout", d && n !== _l && (g = n.relatedTarget || n.fromElement) && (Wn(g) || g[ln])) break e;
        if ((h || d) && (d = f.window === f ? f : (d = f.ownerDocument) ? d.defaultView || d.parentWindow : window, h ? (g = n.relatedTarget || n.toElement, h = a, g = g ? Wn(g) : null, g !== null && (x = Jn(g), g !== x || g.tag !== 5 && g.tag !== 6) && (g = null)) : (h = null, g = a), h !== g)) {
          if (y = Ja, w = "onMouseLeave", p = "onMouseEnter", m = "mouse", (e === "pointerout" || e === "pointerover") && (y = tc, w = "onPointerLeave", p = "onPointerEnter", m = "pointer"), x = h == null ? d : dr(h), v = g == null ? d : dr(g), d = new y(w, m + "leave", h, n, f), d.target = x, d.relatedTarget = v, w = null, Wn(f) === a && (y = new y(p, m + "enter", g, n, f), y.target = v, y.relatedTarget = x, w = y), x = w, h && g) t: {
            for (y = h, p = g, m = 0, v = y; v; v = rr(v)) m++;
            for (v = 0, w = p; w; w = rr(w)) v++;
            for (; 0 < m - v; ) y = rr(y), m--;
            for (; 0 < v - m; ) p = rr(p), v--;
            for (; m--; ) {
              if (y === p || p !== null && y === p.alternate) break t;
              y = rr(y), p = rr(p);
            }
            y = null;
          }
          else y = null;
          h !== null && dc(c, d, h, y, !1), g !== null && x !== null && dc(c, x, g, y, !0);
        }
      }
      e: {
        if (d = a ? dr(a) : window, h = d.nodeName && d.nodeName.toLowerCase(), h === "select" || h === "input" && d.type === "file") var E = Yg;
        else if (ic(d)) if (qd) E = Gg;
        else {
          E = Xg;
          var C = Vg;
        }
        else (h = d.nodeName) && h.toLowerCase() === "input" && (d.type === "checkbox" || d.type === "radio") && (E = Hg);
        if (E && (E = E(e, a))) {
          Zd(c, E, n, f);
          break e;
        }
        C && C(e, d, a), e === "focusout" && (C = d._wrapperState) && C.controlled && d.type === "number" && Rl(d, "number", d.value);
      }
      switch (C = a ? dr(a) : window, e) {
        case "focusin":
          (ic(C) || C.contentEditable === "true") && (cr = C, Dl = a, oi = null);
          break;
        case "focusout":
          oi = Dl = cr = null;
          break;
        case "mousedown":
          zl = !0;
          break;
        case "contextmenu":
        case "mouseup":
        case "dragend":
          zl = !1, ac(c, n, f);
          break;
        case "selectionchange":
          if (Zg) break;
        case "keydown":
        case "keyup":
          ac(c, n, f);
      }
      var A;
      if (Xu) e: {
        switch (e) {
          case "compositionstart":
            var M = "onCompositionStart";
            break e;
          case "compositionend":
            M = "onCompositionEnd";
            break e;
          case "compositionupdate":
            M = "onCompositionUpdate";
            break e;
        }
        M = void 0;
      }
      else ar ? $d(e, n) && (M = "onCompositionEnd") : e === "keydown" && n.keyCode === 229 && (M = "onCompositionStart");
      M && (Gd && n.locale !== "ko" && (ar || M !== "onCompositionStart" ? M === "onCompositionEnd" && ar && (A = Hd()) : (xn = f, Wu = "value" in xn ? xn.value : xn.textContent, ar = !0)), C = Vo(a, M), 0 < C.length && (M = new ec(M, e, null, n, f), c.push({ event: M, listeners: C }), A ? M.data = A : (A = jd(n), A !== null && (M.data = A)))), (A = zg ? Ug(e, n) : Bg(e, n)) && (a = Vo(a, "onBeforeInput"), 0 < a.length && (f = new ec("onBeforeInput", "beforeinput", null, n, f), c.push({ event: f, listeners: a }), f.data = A));
    }
    sh(c, t);
  });
}
function xi(e, t, n) {
  return { instance: e, listener: t, currentTarget: n };
}
function Vo(e, t) {
  for (var n = t + "Capture", r = []; e !== null; ) {
    var i = e, o = i.stateNode;
    i.tag === 5 && o !== null && (i = o, o = hi(e, n), o != null && r.unshift(xi(e, o, i)), o = hi(e, t), o != null && r.push(xi(e, o, i))), e = e.return;
  }
  return r;
}
function rr(e) {
  if (e === null) return null;
  do
    e = e.return;
  while (e && e.tag !== 5);
  return e || null;
}
function dc(e, t, n, r, i) {
  for (var o = t._reactName, s = []; n !== null && n !== r; ) {
    var l = n, u = l.alternate, a = l.stateNode;
    if (u !== null && u === r) break;
    l.tag === 5 && a !== null && (l = a, i ? (u = hi(n, o), u != null && s.unshift(xi(n, u, l))) : i || (u = hi(n, o), u != null && s.push(xi(n, u, l)))), n = n.return;
  }
  s.length !== 0 && e.push({ event: t, listeners: s });
}
var Jg = /\r\n?/g, e0 = /\u0000|\uFFFD/g;
function hc(e) {
  return (typeof e == "string" ? e : "" + e).replace(Jg, `
`).replace(e0, "");
}
function eo(e, t, n) {
  if (t = hc(t), hc(e) !== t && n) throw Error(k(425));
}
function Xo() {
}
var Ul = null, Bl = null;
function Ol(e, t) {
  return e === "textarea" || e === "noscript" || typeof t.children == "string" || typeof t.children == "number" || typeof t.dangerouslySetInnerHTML == "object" && t.dangerouslySetInnerHTML !== null && t.dangerouslySetInnerHTML.__html != null;
}
var Wl = typeof setTimeout == "function" ? setTimeout : void 0, t0 = typeof clearTimeout == "function" ? clearTimeout : void 0, mc = typeof Promise == "function" ? Promise : void 0, n0 = typeof queueMicrotask == "function" ? queueMicrotask : typeof mc < "u" ? function(e) {
  return mc.resolve(null).then(e).catch(r0);
} : Wl;
function r0(e) {
  setTimeout(function() {
    throw e;
  });
}
function qs(e, t) {
  var n = t, r = 0;
  do {
    var i = n.nextSibling;
    if (e.removeChild(n), i && i.nodeType === 8) if (n = i.data, n === "/$") {
      if (r === 0) {
        e.removeChild(i), gi(t);
        return;
      }
      r--;
    } else n !== "$" && n !== "$?" && n !== "$!" || r++;
    n = i;
  } while (n);
  gi(t);
}
function Mn(e) {
  for (; e != null; e = e.nextSibling) {
    var t = e.nodeType;
    if (t === 1 || t === 3) break;
    if (t === 8) {
      if (t = e.data, t === "$" || t === "$!" || t === "$?") break;
      if (t === "/$") return null;
    }
  }
  return e;
}
function pc(e) {
  e = e.previousSibling;
  for (var t = 0; e; ) {
    if (e.nodeType === 8) {
      var n = e.data;
      if (n === "$" || n === "$!" || n === "$?") {
        if (t === 0) return e;
        t--;
      } else n === "/$" && t++;
    }
    e = e.previousSibling;
  }
  return null;
}
var zr = Math.random().toString(36).slice(2), $t = "__reactFiber$" + zr, Si = "__reactProps$" + zr, ln = "__reactContainer$" + zr, Yl = "__reactEvents$" + zr, i0 = "__reactListeners$" + zr, o0 = "__reactHandles$" + zr;
function Wn(e) {
  var t = e[$t];
  if (t) return t;
  for (var n = e.parentNode; n; ) {
    if (t = n[ln] || n[$t]) {
      if (n = t.alternate, t.child !== null || n !== null && n.child !== null) for (e = pc(e); e !== null; ) {
        if (n = e[$t]) return n;
        e = pc(e);
      }
      return t;
    }
    e = n, n = e.parentNode;
  }
  return null;
}
function Ui(e) {
  return e = e[$t] || e[ln], !e || e.tag !== 5 && e.tag !== 6 && e.tag !== 13 && e.tag !== 3 ? null : e;
}
function dr(e) {
  if (e.tag === 5 || e.tag === 6) return e.stateNode;
  throw Error(k(33));
}
function xs(e) {
  return e[Si] || null;
}
var Vl = [], hr = -1;
function Dn(e) {
  return { current: e };
}
function _e(e) {
  0 > hr || (e.current = Vl[hr], Vl[hr] = null, hr--);
}
function Ce(e, t) {
  hr++, Vl[hr] = e.current, e.current = t;
}
var Ln = {}, rt = Dn(Ln), mt = Dn(!1), Gn = Ln;
function Ar(e, t) {
  var n = e.type.contextTypes;
  if (!n) return Ln;
  var r = e.stateNode;
  if (r && r.__reactInternalMemoizedUnmaskedChildContext === t) return r.__reactInternalMemoizedMaskedChildContext;
  var i = {}, o;
  for (o in n) i[o] = t[o];
  return r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = t, e.__reactInternalMemoizedMaskedChildContext = i), i;
}
function pt(e) {
  return e = e.childContextTypes, e != null;
}
function Ho() {
  _e(mt), _e(rt);
}
function gc(e, t, n) {
  if (rt.current !== Ln) throw Error(k(168));
  Ce(rt, t), Ce(mt, n);
}
function uh(e, t, n) {
  var r = e.stateNode;
  if (t = t.childContextTypes, typeof r.getChildContext != "function") return n;
  r = r.getChildContext();
  for (var i in r) if (!(i in t)) throw Error(k(108, Vp(e) || "Unknown", i));
  return Fe({}, n, r);
}
function Go(e) {
  return e = (e = e.stateNode) && e.__reactInternalMemoizedMergedChildContext || Ln, Gn = rt.current, Ce(rt, e), Ce(mt, mt.current), !0;
}
function yc(e, t, n) {
  var r = e.stateNode;
  if (!r) throw Error(k(169));
  n ? (e = uh(e, t, Gn), r.__reactInternalMemoizedMergedChildContext = e, _e(mt), _e(rt), Ce(rt, e)) : _e(mt), Ce(mt, n);
}
var Jt = null, Ss = !1, Ks = !1;
function ah(e) {
  Jt === null ? Jt = [e] : Jt.push(e);
}
function s0(e) {
  Ss = !0, ah(e);
}
function zn() {
  if (!Ks && Jt !== null) {
    Ks = !0;
    var e = 0, t = we;
    try {
      var n = Jt;
      for (we = 1; e < n.length; e++) {
        var r = n[e];
        do
          r = r(!0);
        while (r !== null);
      }
      Jt = null, Ss = !1;
    } catch (i) {
      throw Jt !== null && (Jt = Jt.slice(e + 1)), Fd(zu, zn), i;
    } finally {
      we = t, Ks = !1;
    }
  }
  return null;
}
var mr = [], pr = 0, $o = null, jo = 0, Mt = [], Tt = 0, $n = null, en = 1, tn = "";
function Bn(e, t) {
  mr[pr++] = jo, mr[pr++] = $o, $o = e, jo = t;
}
function ch(e, t, n) {
  Mt[Tt++] = en, Mt[Tt++] = tn, Mt[Tt++] = $n, $n = e;
  var r = en;
  e = tn;
  var i = 32 - Yt(r) - 1;
  r &= ~(1 << i), n += 1;
  var o = 32 - Yt(t) + i;
  if (30 < o) {
    var s = i - i % 5;
    o = (r & (1 << s) - 1).toString(32), r >>= s, i -= s, en = 1 << 32 - Yt(t) + i | n << i | r, tn = o + e;
  } else en = 1 << o | n << i | r, tn = e;
}
function Gu(e) {
  e.return !== null && (Bn(e, 1), ch(e, 1, 0));
}
function $u(e) {
  for (; e === $o; ) $o = mr[--pr], mr[pr] = null, jo = mr[--pr], mr[pr] = null;
  for (; e === $n; ) $n = Mt[--Tt], Mt[Tt] = null, tn = Mt[--Tt], Mt[Tt] = null, en = Mt[--Tt], Mt[Tt] = null;
}
var St = null, xt = null, ke = !1, Bt = null;
function fh(e, t) {
  var n = _t(5, null, null, 0);
  n.elementType = "DELETED", n.stateNode = t, n.return = e, t = e.deletions, t === null ? (e.deletions = [n], e.flags |= 16) : t.push(n);
}
function vc(e, t) {
  switch (e.tag) {
    case 5:
      var n = e.type;
      return t = t.nodeType !== 1 || n.toLowerCase() !== t.nodeName.toLowerCase() ? null : t, t !== null ? (e.stateNode = t, St = e, xt = Mn(t.firstChild), !0) : !1;
    case 6:
      return t = e.pendingProps === "" || t.nodeType !== 3 ? null : t, t !== null ? (e.stateNode = t, St = e, xt = null, !0) : !1;
    case 13:
      return t = t.nodeType !== 8 ? null : t, t !== null ? (n = $n !== null ? { id: en, overflow: tn } : null, e.memoizedState = { dehydrated: t, treeContext: n, retryLane: 1073741824 }, n = _t(18, null, null, 0), n.stateNode = t, n.return = e, e.child = n, St = e, xt = null, !0) : !1;
    default:
      return !1;
  }
}
function Xl(e) {
  return (e.mode & 1) !== 0 && (e.flags & 128) === 0;
}
function Hl(e) {
  if (ke) {
    var t = xt;
    if (t) {
      var n = t;
      if (!vc(e, t)) {
        if (Xl(e)) throw Error(k(418));
        t = Mn(n.nextSibling);
        var r = St;
        t && vc(e, t) ? fh(r, n) : (e.flags = e.flags & -4097 | 2, ke = !1, St = e);
      }
    } else {
      if (Xl(e)) throw Error(k(418));
      e.flags = e.flags & -4097 | 2, ke = !1, St = e;
    }
  }
}
function wc(e) {
  for (e = e.return; e !== null && e.tag !== 5 && e.tag !== 3 && e.tag !== 13; ) e = e.return;
  St = e;
}
function to(e) {
  if (e !== St) return !1;
  if (!ke) return wc(e), ke = !0, !1;
  var t;
  if ((t = e.tag !== 3) && !(t = e.tag !== 5) && (t = e.type, t = t !== "head" && t !== "body" && !Ol(e.type, e.memoizedProps)), t && (t = xt)) {
    if (Xl(e)) throw dh(), Error(k(418));
    for (; t; ) fh(e, t), t = Mn(t.nextSibling);
  }
  if (wc(e), e.tag === 13) {
    if (e = e.memoizedState, e = e !== null ? e.dehydrated : null, !e) throw Error(k(317));
    e: {
      for (e = e.nextSibling, t = 0; e; ) {
        if (e.nodeType === 8) {
          var n = e.data;
          if (n === "/$") {
            if (t === 0) {
              xt = Mn(e.nextSibling);
              break e;
            }
            t--;
          } else n !== "$" && n !== "$!" && n !== "$?" || t++;
        }
        e = e.nextSibling;
      }
      xt = null;
    }
  } else xt = St ? Mn(e.stateNode.nextSibling) : null;
  return !0;
}
function dh() {
  for (var e = xt; e; ) e = Mn(e.nextSibling);
}
function _r() {
  xt = St = null, ke = !1;
}
function ju(e) {
  Bt === null ? Bt = [e] : Bt.push(e);
}
var l0 = cn.ReactCurrentBatchConfig;
function Hr(e, t, n) {
  if (e = n.ref, e !== null && typeof e != "function" && typeof e != "object") {
    if (n._owner) {
      if (n = n._owner, n) {
        if (n.tag !== 1) throw Error(k(309));
        var r = n.stateNode;
      }
      if (!r) throw Error(k(147, e));
      var i = r, o = "" + e;
      return t !== null && t.ref !== null && typeof t.ref == "function" && t.ref._stringRef === o ? t.ref : (t = function(s) {
        var l = i.refs;
        s === null ? delete l[o] : l[o] = s;
      }, t._stringRef = o, t);
    }
    if (typeof e != "string") throw Error(k(284));
    if (!n._owner) throw Error(k(290, e));
  }
  return e;
}
function no(e, t) {
  throw e = Object.prototype.toString.call(t), Error(k(31, e === "[object Object]" ? "object with keys {" + Object.keys(t).join(", ") + "}" : e));
}
function xc(e) {
  var t = e._init;
  return t(e._payload);
}
function hh(e) {
  function t(p, m) {
    if (e) {
      var v = p.deletions;
      v === null ? (p.deletions = [m], p.flags |= 16) : v.push(m);
    }
  }
  function n(p, m) {
    if (!e) return null;
    for (; m !== null; ) t(p, m), m = m.sibling;
    return null;
  }
  function r(p, m) {
    for (p = /* @__PURE__ */ new Map(); m !== null; ) m.key !== null ? p.set(m.key, m) : p.set(m.index, m), m = m.sibling;
    return p;
  }
  function i(p, m) {
    return p = kn(p, m), p.index = 0, p.sibling = null, p;
  }
  function o(p, m, v) {
    return p.index = v, e ? (v = p.alternate, v !== null ? (v = v.index, v < m ? (p.flags |= 2, m) : v) : (p.flags |= 2, m)) : (p.flags |= 1048576, m);
  }
  function s(p) {
    return e && p.alternate === null && (p.flags |= 2), p;
  }
  function l(p, m, v, w) {
    return m === null || m.tag !== 6 ? (m = il(v, p.mode, w), m.return = p, m) : (m = i(m, v), m.return = p, m);
  }
  function u(p, m, v, w) {
    var E = v.type;
    return E === ur ? f(p, m, v.props.children, w, v.key) : m !== null && (m.elementType === E || typeof E == "object" && E !== null && E.$$typeof === pn && xc(E) === m.type) ? (w = i(m, v.props), w.ref = Hr(p, m, v), w.return = p, w) : (w = ko(v.type, v.key, v.props, null, p.mode, w), w.ref = Hr(p, m, v), w.return = p, w);
  }
  function a(p, m, v, w) {
    return m === null || m.tag !== 4 || m.stateNode.containerInfo !== v.containerInfo || m.stateNode.implementation !== v.implementation ? (m = ol(v, p.mode, w), m.return = p, m) : (m = i(m, v.children || []), m.return = p, m);
  }
  function f(p, m, v, w, E) {
    return m === null || m.tag !== 7 ? (m = Hn(v, p.mode, w, E), m.return = p, m) : (m = i(m, v), m.return = p, m);
  }
  function c(p, m, v) {
    if (typeof m == "string" && m !== "" || typeof m == "number") return m = il("" + m, p.mode, v), m.return = p, m;
    if (typeof m == "object" && m !== null) {
      switch (m.$$typeof) {
        case Hi:
          return v = ko(m.type, m.key, m.props, null, p.mode, v), v.ref = Hr(p, null, m), v.return = p, v;
        case lr:
          return m = ol(m, p.mode, v), m.return = p, m;
        case pn:
          var w = m._init;
          return c(p, w(m._payload), v);
      }
      if (Kr(m) || Or(m)) return m = Hn(m, p.mode, v, null), m.return = p, m;
      no(p, m);
    }
    return null;
  }
  function d(p, m, v, w) {
    var E = m !== null ? m.key : null;
    if (typeof v == "string" && v !== "" || typeof v == "number") return E !== null ? null : l(p, m, "" + v, w);
    if (typeof v == "object" && v !== null) {
      switch (v.$$typeof) {
        case Hi:
          return v.key === E ? u(p, m, v, w) : null;
        case lr:
          return v.key === E ? a(p, m, v, w) : null;
        case pn:
          return E = v._init, d(
            p,
            m,
            E(v._payload),
            w
          );
      }
      if (Kr(v) || Or(v)) return E !== null ? null : f(p, m, v, w, null);
      no(p, v);
    }
    return null;
  }
  function h(p, m, v, w, E) {
    if (typeof w == "string" && w !== "" || typeof w == "number") return p = p.get(v) || null, l(m, p, "" + w, E);
    if (typeof w == "object" && w !== null) {
      switch (w.$$typeof) {
        case Hi:
          return p = p.get(w.key === null ? v : w.key) || null, u(m, p, w, E);
        case lr:
          return p = p.get(w.key === null ? v : w.key) || null, a(m, p, w, E);
        case pn:
          var C = w._init;
          return h(p, m, v, C(w._payload), E);
      }
      if (Kr(w) || Or(w)) return p = p.get(v) || null, f(m, p, w, E, null);
      no(m, w);
    }
    return null;
  }
  function g(p, m, v, w) {
    for (var E = null, C = null, A = m, M = m = 0, N = null; A !== null && M < v.length; M++) {
      A.index > M ? (N = A, A = null) : N = A.sibling;
      var I = d(p, A, v[M], w);
      if (I === null) {
        A === null && (A = N);
        break;
      }
      e && A && I.alternate === null && t(p, A), m = o(I, m, M), C === null ? E = I : C.sibling = I, C = I, A = N;
    }
    if (M === v.length) return n(p, A), ke && Bn(p, M), E;
    if (A === null) {
      for (; M < v.length; M++) A = c(p, v[M], w), A !== null && (m = o(A, m, M), C === null ? E = A : C.sibling = A, C = A);
      return ke && Bn(p, M), E;
    }
    for (A = r(p, A); M < v.length; M++) N = h(A, p, M, v[M], w), N !== null && (e && N.alternate !== null && A.delete(N.key === null ? M : N.key), m = o(N, m, M), C === null ? E = N : C.sibling = N, C = N);
    return e && A.forEach(function(B) {
      return t(p, B);
    }), ke && Bn(p, M), E;
  }
  function y(p, m, v, w) {
    var E = Or(v);
    if (typeof E != "function") throw Error(k(150));
    if (v = E.call(v), v == null) throw Error(k(151));
    for (var C = E = null, A = m, M = m = 0, N = null, I = v.next(); A !== null && !I.done; M++, I = v.next()) {
      A.index > M ? (N = A, A = null) : N = A.sibling;
      var B = d(p, A, I.value, w);
      if (B === null) {
        A === null && (A = N);
        break;
      }
      e && A && B.alternate === null && t(p, A), m = o(B, m, M), C === null ? E = B : C.sibling = B, C = B, A = N;
    }
    if (I.done) return n(
      p,
      A
    ), ke && Bn(p, M), E;
    if (A === null) {
      for (; !I.done; M++, I = v.next()) I = c(p, I.value, w), I !== null && (m = o(I, m, M), C === null ? E = I : C.sibling = I, C = I);
      return ke && Bn(p, M), E;
    }
    for (A = r(p, A); !I.done; M++, I = v.next()) I = h(A, p, M, I.value, w), I !== null && (e && I.alternate !== null && A.delete(I.key === null ? M : I.key), m = o(I, m, M), C === null ? E = I : C.sibling = I, C = I);
    return e && A.forEach(function(O) {
      return t(p, O);
    }), ke && Bn(p, M), E;
  }
  function x(p, m, v, w) {
    if (typeof v == "object" && v !== null && v.type === ur && v.key === null && (v = v.props.children), typeof v == "object" && v !== null) {
      switch (v.$$typeof) {
        case Hi:
          e: {
            for (var E = v.key, C = m; C !== null; ) {
              if (C.key === E) {
                if (E = v.type, E === ur) {
                  if (C.tag === 7) {
                    n(p, C.sibling), m = i(C, v.props.children), m.return = p, p = m;
                    break e;
                  }
                } else if (C.elementType === E || typeof E == "object" && E !== null && E.$$typeof === pn && xc(E) === C.type) {
                  n(p, C.sibling), m = i(C, v.props), m.ref = Hr(p, C, v), m.return = p, p = m;
                  break e;
                }
                n(p, C);
                break;
              } else t(p, C);
              C = C.sibling;
            }
            v.type === ur ? (m = Hn(v.props.children, p.mode, w, v.key), m.return = p, p = m) : (w = ko(v.type, v.key, v.props, null, p.mode, w), w.ref = Hr(p, m, v), w.return = p, p = w);
          }
          return s(p);
        case lr:
          e: {
            for (C = v.key; m !== null; ) {
              if (m.key === C) if (m.tag === 4 && m.stateNode.containerInfo === v.containerInfo && m.stateNode.implementation === v.implementation) {
                n(p, m.sibling), m = i(m, v.children || []), m.return = p, p = m;
                break e;
              } else {
                n(p, m);
                break;
              }
              else t(p, m);
              m = m.sibling;
            }
            m = ol(v, p.mode, w), m.return = p, p = m;
          }
          return s(p);
        case pn:
          return C = v._init, x(p, m, C(v._payload), w);
      }
      if (Kr(v)) return g(p, m, v, w);
      if (Or(v)) return y(p, m, v, w);
      no(p, v);
    }
    return typeof v == "string" && v !== "" || typeof v == "number" ? (v = "" + v, m !== null && m.tag === 6 ? (n(p, m.sibling), m = i(m, v), m.return = p, p = m) : (n(p, m), m = il(v, p.mode, w), m.return = p, p = m), s(p)) : n(p, m);
  }
  return x;
}
var kr = hh(!0), mh = hh(!1), Zo = Dn(null), qo = null, gr = null, Zu = null;
function qu() {
  Zu = gr = qo = null;
}
function Ku(e) {
  var t = Zo.current;
  _e(Zo), e._currentValue = t;
}
function Gl(e, t, n) {
  for (; e !== null; ) {
    var r = e.alternate;
    if ((e.childLanes & t) !== t ? (e.childLanes |= t, r !== null && (r.childLanes |= t)) : r !== null && (r.childLanes & t) !== t && (r.childLanes |= t), e === n) break;
    e = e.return;
  }
}
function Pr(e, t) {
  qo = e, Zu = gr = null, e = e.dependencies, e !== null && e.firstContext !== null && (e.lanes & t && (ht = !0), e.firstContext = null);
}
function It(e) {
  var t = e._currentValue;
  if (Zu !== e) if (e = { context: e, memoizedValue: t, next: null }, gr === null) {
    if (qo === null) throw Error(k(308));
    gr = e, qo.dependencies = { lanes: 0, firstContext: e };
  } else gr = gr.next = e;
  return t;
}
var Yn = null;
function Qu(e) {
  Yn === null ? Yn = [e] : Yn.push(e);
}
function ph(e, t, n, r) {
  var i = t.interleaved;
  return i === null ? (n.next = n, Qu(t)) : (n.next = i.next, i.next = n), t.interleaved = n, un(e, r);
}
function un(e, t) {
  e.lanes |= t;
  var n = e.alternate;
  for (n !== null && (n.lanes |= t), n = e, e = e.return; e !== null; ) e.childLanes |= t, n = e.alternate, n !== null && (n.childLanes |= t), n = e, e = e.return;
  return n.tag === 3 ? n.stateNode : null;
}
var gn = !1;
function Ju(e) {
  e.updateQueue = { baseState: e.memoizedState, firstBaseUpdate: null, lastBaseUpdate: null, shared: { pending: null, interleaved: null, lanes: 0 }, effects: null };
}
function gh(e, t) {
  e = e.updateQueue, t.updateQueue === e && (t.updateQueue = { baseState: e.baseState, firstBaseUpdate: e.firstBaseUpdate, lastBaseUpdate: e.lastBaseUpdate, shared: e.shared, effects: e.effects });
}
function rn(e, t) {
  return { eventTime: e, lane: t, tag: 0, payload: null, callback: null, next: null };
}
function Tn(e, t, n) {
  var r = e.updateQueue;
  if (r === null) return null;
  if (r = r.shared, he & 2) {
    var i = r.pending;
    return i === null ? t.next = t : (t.next = i.next, i.next = t), r.pending = t, un(e, n);
  }
  return i = r.interleaved, i === null ? (t.next = t, Qu(r)) : (t.next = i.next, i.next = t), r.interleaved = t, un(e, n);
}
function Ro(e, t, n) {
  if (t = t.updateQueue, t !== null && (t = t.shared, (n & 4194240) !== 0)) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Uu(e, n);
  }
}
function Sc(e, t) {
  var n = e.updateQueue, r = e.alternate;
  if (r !== null && (r = r.updateQueue, n === r)) {
    var i = null, o = null;
    if (n = n.firstBaseUpdate, n !== null) {
      do {
        var s = { eventTime: n.eventTime, lane: n.lane, tag: n.tag, payload: n.payload, callback: n.callback, next: null };
        o === null ? i = o = s : o = o.next = s, n = n.next;
      } while (n !== null);
      o === null ? i = o = t : o = o.next = t;
    } else i = o = t;
    n = { baseState: r.baseState, firstBaseUpdate: i, lastBaseUpdate: o, shared: r.shared, effects: r.effects }, e.updateQueue = n;
    return;
  }
  e = n.lastBaseUpdate, e === null ? n.firstBaseUpdate = t : e.next = t, n.lastBaseUpdate = t;
}
function Ko(e, t, n, r) {
  var i = e.updateQueue;
  gn = !1;
  var o = i.firstBaseUpdate, s = i.lastBaseUpdate, l = i.shared.pending;
  if (l !== null) {
    i.shared.pending = null;
    var u = l, a = u.next;
    u.next = null, s === null ? o = a : s.next = a, s = u;
    var f = e.alternate;
    f !== null && (f = f.updateQueue, l = f.lastBaseUpdate, l !== s && (l === null ? f.firstBaseUpdate = a : l.next = a, f.lastBaseUpdate = u));
  }
  if (o !== null) {
    var c = i.baseState;
    s = 0, f = a = u = null, l = o;
    do {
      var d = l.lane, h = l.eventTime;
      if ((r & d) === d) {
        f !== null && (f = f.next = {
          eventTime: h,
          lane: 0,
          tag: l.tag,
          payload: l.payload,
          callback: l.callback,
          next: null
        });
        e: {
          var g = e, y = l;
          switch (d = t, h = n, y.tag) {
            case 1:
              if (g = y.payload, typeof g == "function") {
                c = g.call(h, c, d);
                break e;
              }
              c = g;
              break e;
            case 3:
              g.flags = g.flags & -65537 | 128;
            case 0:
              if (g = y.payload, d = typeof g == "function" ? g.call(h, c, d) : g, d == null) break e;
              c = Fe({}, c, d);
              break e;
            case 2:
              gn = !0;
          }
        }
        l.callback !== null && l.lane !== 0 && (e.flags |= 64, d = i.effects, d === null ? i.effects = [l] : d.push(l));
      } else h = { eventTime: h, lane: d, tag: l.tag, payload: l.payload, callback: l.callback, next: null }, f === null ? (a = f = h, u = c) : f = f.next = h, s |= d;
      if (l = l.next, l === null) {
        if (l = i.shared.pending, l === null) break;
        d = l, l = d.next, d.next = null, i.lastBaseUpdate = d, i.shared.pending = null;
      }
    } while (!0);
    if (f === null && (u = c), i.baseState = u, i.firstBaseUpdate = a, i.lastBaseUpdate = f, t = i.shared.interleaved, t !== null) {
      i = t;
      do
        s |= i.lane, i = i.next;
      while (i !== t);
    } else o === null && (i.shared.lanes = 0);
    Zn |= s, e.lanes = s, e.memoizedState = c;
  }
}
function Ec(e, t, n) {
  if (e = t.effects, t.effects = null, e !== null) for (t = 0; t < e.length; t++) {
    var r = e[t], i = r.callback;
    if (i !== null) {
      if (r.callback = null, r = n, typeof i != "function") throw Error(k(191, i));
      i.call(r);
    }
  }
}
var Bi = {}, Zt = Dn(Bi), Ei = Dn(Bi), Ci = Dn(Bi);
function Vn(e) {
  if (e === Bi) throw Error(k(174));
  return e;
}
function ea(e, t) {
  switch (Ce(Ci, t), Ce(Ei, e), Ce(Zt, Bi), e = t.nodeType, e) {
    case 9:
    case 11:
      t = (t = t.documentElement) ? t.namespaceURI : Ml(null, "");
      break;
    default:
      e = e === 8 ? t.parentNode : t, t = e.namespaceURI || null, e = e.tagName, t = Ml(t, e);
  }
  _e(Zt), Ce(Zt, t);
}
function Ir() {
  _e(Zt), _e(Ei), _e(Ci);
}
function yh(e) {
  Vn(Ci.current);
  var t = Vn(Zt.current), n = Ml(t, e.type);
  t !== n && (Ce(Ei, e), Ce(Zt, n));
}
function ta(e) {
  Ei.current === e && (_e(Zt), _e(Ei));
}
var be = Dn(0);
function Qo(e) {
  for (var t = e; t !== null; ) {
    if (t.tag === 13) {
      var n = t.memoizedState;
      if (n !== null && (n = n.dehydrated, n === null || n.data === "$?" || n.data === "$!")) return t;
    } else if (t.tag === 19 && t.memoizedProps.revealOrder !== void 0) {
      if (t.flags & 128) return t;
    } else if (t.child !== null) {
      t.child.return = t, t = t.child;
      continue;
    }
    if (t === e) break;
    for (; t.sibling === null; ) {
      if (t.return === null || t.return === e) return null;
      t = t.return;
    }
    t.sibling.return = t.return, t = t.sibling;
  }
  return null;
}
var Qs = [];
function na() {
  for (var e = 0; e < Qs.length; e++) Qs[e]._workInProgressVersionPrimary = null;
  Qs.length = 0;
}
var Po = cn.ReactCurrentDispatcher, Js = cn.ReactCurrentBatchConfig, jn = 0, Le = null, Ve = null, He = null, Jo = !1, si = !1, Ri = 0, u0 = 0;
function Qe() {
  throw Error(k(321));
}
function ra(e, t) {
  if (t === null) return !1;
  for (var n = 0; n < t.length && n < e.length; n++) if (!Xt(e[n], t[n])) return !1;
  return !0;
}
function ia(e, t, n, r, i, o) {
  if (jn = o, Le = t, t.memoizedState = null, t.updateQueue = null, t.lanes = 0, Po.current = e === null || e.memoizedState === null ? d0 : h0, e = n(r, i), si) {
    o = 0;
    do {
      if (si = !1, Ri = 0, 25 <= o) throw Error(k(301));
      o += 1, He = Ve = null, t.updateQueue = null, Po.current = m0, e = n(r, i);
    } while (si);
  }
  if (Po.current = es, t = Ve !== null && Ve.next !== null, jn = 0, He = Ve = Le = null, Jo = !1, t) throw Error(k(300));
  return e;
}
function oa() {
  var e = Ri !== 0;
  return Ri = 0, e;
}
function Gt() {
  var e = { memoizedState: null, baseState: null, baseQueue: null, queue: null, next: null };
  return He === null ? Le.memoizedState = He = e : He = He.next = e, He;
}
function bt() {
  if (Ve === null) {
    var e = Le.alternate;
    e = e !== null ? e.memoizedState : null;
  } else e = Ve.next;
  var t = He === null ? Le.memoizedState : He.next;
  if (t !== null) He = t, Ve = e;
  else {
    if (e === null) throw Error(k(310));
    Ve = e, e = { memoizedState: Ve.memoizedState, baseState: Ve.baseState, baseQueue: Ve.baseQueue, queue: Ve.queue, next: null }, He === null ? Le.memoizedState = He = e : He = He.next = e;
  }
  return He;
}
function Pi(e, t) {
  return typeof t == "function" ? t(e) : t;
}
function el(e) {
  var t = bt(), n = t.queue;
  if (n === null) throw Error(k(311));
  n.lastRenderedReducer = e;
  var r = Ve, i = r.baseQueue, o = n.pending;
  if (o !== null) {
    if (i !== null) {
      var s = i.next;
      i.next = o.next, o.next = s;
    }
    r.baseQueue = i = o, n.pending = null;
  }
  if (i !== null) {
    o = i.next, r = r.baseState;
    var l = s = null, u = null, a = o;
    do {
      var f = a.lane;
      if ((jn & f) === f) u !== null && (u = u.next = { lane: 0, action: a.action, hasEagerState: a.hasEagerState, eagerState: a.eagerState, next: null }), r = a.hasEagerState ? a.eagerState : e(r, a.action);
      else {
        var c = {
          lane: f,
          action: a.action,
          hasEagerState: a.hasEagerState,
          eagerState: a.eagerState,
          next: null
        };
        u === null ? (l = u = c, s = r) : u = u.next = c, Le.lanes |= f, Zn |= f;
      }
      a = a.next;
    } while (a !== null && a !== o);
    u === null ? s = r : u.next = l, Xt(r, t.memoizedState) || (ht = !0), t.memoizedState = r, t.baseState = s, t.baseQueue = u, n.lastRenderedState = r;
  }
  if (e = n.interleaved, e !== null) {
    i = e;
    do
      o = i.lane, Le.lanes |= o, Zn |= o, i = i.next;
    while (i !== e);
  } else i === null && (n.lanes = 0);
  return [t.memoizedState, n.dispatch];
}
function tl(e) {
  var t = bt(), n = t.queue;
  if (n === null) throw Error(k(311));
  n.lastRenderedReducer = e;
  var r = n.dispatch, i = n.pending, o = t.memoizedState;
  if (i !== null) {
    n.pending = null;
    var s = i = i.next;
    do
      o = e(o, s.action), s = s.next;
    while (s !== i);
    Xt(o, t.memoizedState) || (ht = !0), t.memoizedState = o, t.baseQueue === null && (t.baseState = o), n.lastRenderedState = o;
  }
  return [o, r];
}
function vh() {
}
function wh(e, t) {
  var n = Le, r = bt(), i = t(), o = !Xt(r.memoizedState, i);
  if (o && (r.memoizedState = i, ht = !0), r = r.queue, sa(Eh.bind(null, n, r, e), [e]), r.getSnapshot !== t || o || He !== null && He.memoizedState.tag & 1) {
    if (n.flags |= 2048, Mi(9, Sh.bind(null, n, r, i, t), void 0, null), Ge === null) throw Error(k(349));
    jn & 30 || xh(n, t, i);
  }
  return i;
}
function xh(e, t, n) {
  e.flags |= 16384, e = { getSnapshot: t, value: n }, t = Le.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, Le.updateQueue = t, t.stores = [e]) : (n = t.stores, n === null ? t.stores = [e] : n.push(e));
}
function Sh(e, t, n, r) {
  t.value = n, t.getSnapshot = r, Ch(t) && Rh(e);
}
function Eh(e, t, n) {
  return n(function() {
    Ch(t) && Rh(e);
  });
}
function Ch(e) {
  var t = e.getSnapshot;
  e = e.value;
  try {
    var n = t();
    return !Xt(e, n);
  } catch {
    return !0;
  }
}
function Rh(e) {
  var t = un(e, 1);
  t !== null && Vt(t, e, 1, -1);
}
function Cc(e) {
  var t = Gt();
  return typeof e == "function" && (e = e()), t.memoizedState = t.baseState = e, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: Pi, lastRenderedState: e }, t.queue = e, e = e.dispatch = f0.bind(null, Le, e), [t.memoizedState, e];
}
function Mi(e, t, n, r) {
  return e = { tag: e, create: t, destroy: n, deps: r, next: null }, t = Le.updateQueue, t === null ? (t = { lastEffect: null, stores: null }, Le.updateQueue = t, t.lastEffect = e.next = e) : (n = t.lastEffect, n === null ? t.lastEffect = e.next = e : (r = n.next, n.next = e, e.next = r, t.lastEffect = e)), e;
}
function Ph() {
  return bt().memoizedState;
}
function Mo(e, t, n, r) {
  var i = Gt();
  Le.flags |= e, i.memoizedState = Mi(1 | t, n, void 0, r === void 0 ? null : r);
}
function Es(e, t, n, r) {
  var i = bt();
  r = r === void 0 ? null : r;
  var o = void 0;
  if (Ve !== null) {
    var s = Ve.memoizedState;
    if (o = s.destroy, r !== null && ra(r, s.deps)) {
      i.memoizedState = Mi(t, n, o, r);
      return;
    }
  }
  Le.flags |= e, i.memoizedState = Mi(1 | t, n, o, r);
}
function Rc(e, t) {
  return Mo(8390656, 8, e, t);
}
function sa(e, t) {
  return Es(2048, 8, e, t);
}
function Mh(e, t) {
  return Es(4, 2, e, t);
}
function Th(e, t) {
  return Es(4, 4, e, t);
}
function Ah(e, t) {
  if (typeof t == "function") return e = e(), t(e), function() {
    t(null);
  };
  if (t != null) return e = e(), t.current = e, function() {
    t.current = null;
  };
}
function _h(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Es(4, 4, Ah.bind(null, t, e), n);
}
function la() {
}
function kh(e, t) {
  var n = bt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ra(t, r[1]) ? r[0] : (n.memoizedState = [e, t], e);
}
function Ih(e, t) {
  var n = bt();
  t = t === void 0 ? null : t;
  var r = n.memoizedState;
  return r !== null && t !== null && ra(t, r[1]) ? r[0] : (e = e(), n.memoizedState = [e, t], e);
}
function bh(e, t, n) {
  return jn & 21 ? (Xt(n, t) || (n = zd(), Le.lanes |= n, Zn |= n, e.baseState = !0), t) : (e.baseState && (e.baseState = !1, ht = !0), e.memoizedState = n);
}
function a0(e, t) {
  var n = we;
  we = n !== 0 && 4 > n ? n : 4, e(!0);
  var r = Js.transition;
  Js.transition = {};
  try {
    e(!1), t();
  } finally {
    we = n, Js.transition = r;
  }
}
function Lh() {
  return bt().memoizedState;
}
function c0(e, t, n) {
  var r = _n(e);
  if (n = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null }, Fh(e)) Nh(t, n);
  else if (n = ph(e, t, n, r), n !== null) {
    var i = lt();
    Vt(n, e, r, i), Dh(n, t, r);
  }
}
function f0(e, t, n) {
  var r = _n(e), i = { lane: r, action: n, hasEagerState: !1, eagerState: null, next: null };
  if (Fh(e)) Nh(t, i);
  else {
    var o = e.alternate;
    if (e.lanes === 0 && (o === null || o.lanes === 0) && (o = t.lastRenderedReducer, o !== null)) try {
      var s = t.lastRenderedState, l = o(s, n);
      if (i.hasEagerState = !0, i.eagerState = l, Xt(l, s)) {
        var u = t.interleaved;
        u === null ? (i.next = i, Qu(t)) : (i.next = u.next, u.next = i), t.interleaved = i;
        return;
      }
    } catch {
    } finally {
    }
    n = ph(e, t, i, r), n !== null && (i = lt(), Vt(n, e, r, i), Dh(n, t, r));
  }
}
function Fh(e) {
  var t = e.alternate;
  return e === Le || t !== null && t === Le;
}
function Nh(e, t) {
  si = Jo = !0;
  var n = e.pending;
  n === null ? t.next = t : (t.next = n.next, n.next = t), e.pending = t;
}
function Dh(e, t, n) {
  if (n & 4194240) {
    var r = t.lanes;
    r &= e.pendingLanes, n |= r, t.lanes = n, Uu(e, n);
  }
}
var es = { readContext: It, useCallback: Qe, useContext: Qe, useEffect: Qe, useImperativeHandle: Qe, useInsertionEffect: Qe, useLayoutEffect: Qe, useMemo: Qe, useReducer: Qe, useRef: Qe, useState: Qe, useDebugValue: Qe, useDeferredValue: Qe, useTransition: Qe, useMutableSource: Qe, useSyncExternalStore: Qe, useId: Qe, unstable_isNewReconciler: !1 }, d0 = { readContext: It, useCallback: function(e, t) {
  return Gt().memoizedState = [e, t === void 0 ? null : t], e;
}, useContext: It, useEffect: Rc, useImperativeHandle: function(e, t, n) {
  return n = n != null ? n.concat([e]) : null, Mo(
    4194308,
    4,
    Ah.bind(null, t, e),
    n
  );
}, useLayoutEffect: function(e, t) {
  return Mo(4194308, 4, e, t);
}, useInsertionEffect: function(e, t) {
  return Mo(4, 2, e, t);
}, useMemo: function(e, t) {
  var n = Gt();
  return t = t === void 0 ? null : t, e = e(), n.memoizedState = [e, t], e;
}, useReducer: function(e, t, n) {
  var r = Gt();
  return t = n !== void 0 ? n(t) : t, r.memoizedState = r.baseState = t, e = { pending: null, interleaved: null, lanes: 0, dispatch: null, lastRenderedReducer: e, lastRenderedState: t }, r.queue = e, e = e.dispatch = c0.bind(null, Le, e), [r.memoizedState, e];
}, useRef: function(e) {
  var t = Gt();
  return e = { current: e }, t.memoizedState = e;
}, useState: Cc, useDebugValue: la, useDeferredValue: function(e) {
  return Gt().memoizedState = e;
}, useTransition: function() {
  var e = Cc(!1), t = e[0];
  return e = a0.bind(null, e[1]), Gt().memoizedState = e, [t, e];
}, useMutableSource: function() {
}, useSyncExternalStore: function(e, t, n) {
  var r = Le, i = Gt();
  if (ke) {
    if (n === void 0) throw Error(k(407));
    n = n();
  } else {
    if (n = t(), Ge === null) throw Error(k(349));
    jn & 30 || xh(r, t, n);
  }
  i.memoizedState = n;
  var o = { value: n, getSnapshot: t };
  return i.queue = o, Rc(Eh.bind(
    null,
    r,
    o,
    e
  ), [e]), r.flags |= 2048, Mi(9, Sh.bind(null, r, o, n, t), void 0, null), n;
}, useId: function() {
  var e = Gt(), t = Ge.identifierPrefix;
  if (ke) {
    var n = tn, r = en;
    n = (r & ~(1 << 32 - Yt(r) - 1)).toString(32) + n, t = ":" + t + "R" + n, n = Ri++, 0 < n && (t += "H" + n.toString(32)), t += ":";
  } else n = u0++, t = ":" + t + "r" + n.toString(32) + ":";
  return e.memoizedState = t;
}, unstable_isNewReconciler: !1 }, h0 = {
  readContext: It,
  useCallback: kh,
  useContext: It,
  useEffect: sa,
  useImperativeHandle: _h,
  useInsertionEffect: Mh,
  useLayoutEffect: Th,
  useMemo: Ih,
  useReducer: el,
  useRef: Ph,
  useState: function() {
    return el(Pi);
  },
  useDebugValue: la,
  useDeferredValue: function(e) {
    var t = bt();
    return bh(t, Ve.memoizedState, e);
  },
  useTransition: function() {
    var e = el(Pi)[0], t = bt().memoizedState;
    return [e, t];
  },
  useMutableSource: vh,
  useSyncExternalStore: wh,
  useId: Lh,
  unstable_isNewReconciler: !1
}, m0 = { readContext: It, useCallback: kh, useContext: It, useEffect: sa, useImperativeHandle: _h, useInsertionEffect: Mh, useLayoutEffect: Th, useMemo: Ih, useReducer: tl, useRef: Ph, useState: function() {
  return tl(Pi);
}, useDebugValue: la, useDeferredValue: function(e) {
  var t = bt();
  return Ve === null ? t.memoizedState = e : bh(t, Ve.memoizedState, e);
}, useTransition: function() {
  var e = tl(Pi)[0], t = bt().memoizedState;
  return [e, t];
}, useMutableSource: vh, useSyncExternalStore: wh, useId: Lh, unstable_isNewReconciler: !1 };
function zt(e, t) {
  if (e && e.defaultProps) {
    t = Fe({}, t), e = e.defaultProps;
    for (var n in e) t[n] === void 0 && (t[n] = e[n]);
    return t;
  }
  return t;
}
function $l(e, t, n, r) {
  t = e.memoizedState, n = n(r, t), n = n == null ? t : Fe({}, t, n), e.memoizedState = n, e.lanes === 0 && (e.updateQueue.baseState = n);
}
var Cs = { isMounted: function(e) {
  return (e = e._reactInternals) ? Jn(e) === e : !1;
}, enqueueSetState: function(e, t, n) {
  e = e._reactInternals;
  var r = lt(), i = _n(e), o = rn(r, i);
  o.payload = t, n != null && (o.callback = n), t = Tn(e, o, i), t !== null && (Vt(t, e, i, r), Ro(t, e, i));
}, enqueueReplaceState: function(e, t, n) {
  e = e._reactInternals;
  var r = lt(), i = _n(e), o = rn(r, i);
  o.tag = 1, o.payload = t, n != null && (o.callback = n), t = Tn(e, o, i), t !== null && (Vt(t, e, i, r), Ro(t, e, i));
}, enqueueForceUpdate: function(e, t) {
  e = e._reactInternals;
  var n = lt(), r = _n(e), i = rn(n, r);
  i.tag = 2, t != null && (i.callback = t), t = Tn(e, i, r), t !== null && (Vt(t, e, r, n), Ro(t, e, r));
} };
function Pc(e, t, n, r, i, o, s) {
  return e = e.stateNode, typeof e.shouldComponentUpdate == "function" ? e.shouldComponentUpdate(r, o, s) : t.prototype && t.prototype.isPureReactComponent ? !vi(n, r) || !vi(i, o) : !0;
}
function zh(e, t, n) {
  var r = !1, i = Ln, o = t.contextType;
  return typeof o == "object" && o !== null ? o = It(o) : (i = pt(t) ? Gn : rt.current, r = t.contextTypes, o = (r = r != null) ? Ar(e, i) : Ln), t = new t(n, o), e.memoizedState = t.state !== null && t.state !== void 0 ? t.state : null, t.updater = Cs, e.stateNode = t, t._reactInternals = e, r && (e = e.stateNode, e.__reactInternalMemoizedUnmaskedChildContext = i, e.__reactInternalMemoizedMaskedChildContext = o), t;
}
function Mc(e, t, n, r) {
  e = t.state, typeof t.componentWillReceiveProps == "function" && t.componentWillReceiveProps(n, r), typeof t.UNSAFE_componentWillReceiveProps == "function" && t.UNSAFE_componentWillReceiveProps(n, r), t.state !== e && Cs.enqueueReplaceState(t, t.state, null);
}
function jl(e, t, n, r) {
  var i = e.stateNode;
  i.props = n, i.state = e.memoizedState, i.refs = {}, Ju(e);
  var o = t.contextType;
  typeof o == "object" && o !== null ? i.context = It(o) : (o = pt(t) ? Gn : rt.current, i.context = Ar(e, o)), i.state = e.memoizedState, o = t.getDerivedStateFromProps, typeof o == "function" && ($l(e, t, o, n), i.state = e.memoizedState), typeof t.getDerivedStateFromProps == "function" || typeof i.getSnapshotBeforeUpdate == "function" || typeof i.UNSAFE_componentWillMount != "function" && typeof i.componentWillMount != "function" || (t = i.state, typeof i.componentWillMount == "function" && i.componentWillMount(), typeof i.UNSAFE_componentWillMount == "function" && i.UNSAFE_componentWillMount(), t !== i.state && Cs.enqueueReplaceState(i, i.state, null), Ko(e, n, i, r), i.state = e.memoizedState), typeof i.componentDidMount == "function" && (e.flags |= 4194308);
}
function br(e, t) {
  try {
    var n = "", r = t;
    do
      n += Yp(r), r = r.return;
    while (r);
    var i = n;
  } catch (o) {
    i = `
Error generating stack: ` + o.message + `
` + o.stack;
  }
  return { value: e, source: t, stack: i, digest: null };
}
function nl(e, t, n) {
  return { value: e, source: null, stack: n ?? null, digest: t ?? null };
}
function Zl(e, t) {
  try {
    console.error(t.value);
  } catch (n) {
    setTimeout(function() {
      throw n;
    });
  }
}
var p0 = typeof WeakMap == "function" ? WeakMap : Map;
function Uh(e, t, n) {
  n = rn(-1, n), n.tag = 3, n.payload = { element: null };
  var r = t.value;
  return n.callback = function() {
    ns || (ns = !0, ou = r), Zl(e, t);
  }, n;
}
function Bh(e, t, n) {
  n = rn(-1, n), n.tag = 3;
  var r = e.type.getDerivedStateFromError;
  if (typeof r == "function") {
    var i = t.value;
    n.payload = function() {
      return r(i);
    }, n.callback = function() {
      Zl(e, t);
    };
  }
  var o = e.stateNode;
  return o !== null && typeof o.componentDidCatch == "function" && (n.callback = function() {
    Zl(e, t), typeof r != "function" && (An === null ? An = /* @__PURE__ */ new Set([this]) : An.add(this));
    var s = t.stack;
    this.componentDidCatch(t.value, { componentStack: s !== null ? s : "" });
  }), n;
}
function Tc(e, t, n) {
  var r = e.pingCache;
  if (r === null) {
    r = e.pingCache = new p0();
    var i = /* @__PURE__ */ new Set();
    r.set(t, i);
  } else i = r.get(t), i === void 0 && (i = /* @__PURE__ */ new Set(), r.set(t, i));
  i.has(n) || (i.add(n), e = _0.bind(null, e, t, n), t.then(e, e));
}
function Ac(e) {
  do {
    var t;
    if ((t = e.tag === 13) && (t = e.memoizedState, t = t !== null ? t.dehydrated !== null : !0), t) return e;
    e = e.return;
  } while (e !== null);
  return null;
}
function _c(e, t, n, r, i) {
  return e.mode & 1 ? (e.flags |= 65536, e.lanes = i, e) : (e === t ? e.flags |= 65536 : (e.flags |= 128, n.flags |= 131072, n.flags &= -52805, n.tag === 1 && (n.alternate === null ? n.tag = 17 : (t = rn(-1, 1), t.tag = 2, Tn(n, t, 1))), n.lanes |= 1), e);
}
var g0 = cn.ReactCurrentOwner, ht = !1;
function ot(e, t, n, r) {
  t.child = e === null ? mh(t, null, n, r) : kr(t, e.child, n, r);
}
function kc(e, t, n, r, i) {
  n = n.render;
  var o = t.ref;
  return Pr(t, i), r = ia(e, t, n, r, o, i), n = oa(), e !== null && !ht ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, an(e, t, i)) : (ke && n && Gu(t), t.flags |= 1, ot(e, t, r, i), t.child);
}
function Ic(e, t, n, r, i) {
  if (e === null) {
    var o = n.type;
    return typeof o == "function" && !pa(o) && o.defaultProps === void 0 && n.compare === null && n.defaultProps === void 0 ? (t.tag = 15, t.type = o, Oh(e, t, o, r, i)) : (e = ko(n.type, null, r, t, t.mode, i), e.ref = t.ref, e.return = t, t.child = e);
  }
  if (o = e.child, !(e.lanes & i)) {
    var s = o.memoizedProps;
    if (n = n.compare, n = n !== null ? n : vi, n(s, r) && e.ref === t.ref) return an(e, t, i);
  }
  return t.flags |= 1, e = kn(o, r), e.ref = t.ref, e.return = t, t.child = e;
}
function Oh(e, t, n, r, i) {
  if (e !== null) {
    var o = e.memoizedProps;
    if (vi(o, r) && e.ref === t.ref) if (ht = !1, t.pendingProps = r = o, (e.lanes & i) !== 0) e.flags & 131072 && (ht = !0);
    else return t.lanes = e.lanes, an(e, t, i);
  }
  return ql(e, t, n, r, i);
}
function Wh(e, t, n) {
  var r = t.pendingProps, i = r.children, o = e !== null ? e.memoizedState : null;
  if (r.mode === "hidden") if (!(t.mode & 1)) t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, Ce(vr, wt), wt |= n;
  else {
    if (!(n & 1073741824)) return e = o !== null ? o.baseLanes | n : n, t.lanes = t.childLanes = 1073741824, t.memoizedState = { baseLanes: e, cachePool: null, transitions: null }, t.updateQueue = null, Ce(vr, wt), wt |= e, null;
    t.memoizedState = { baseLanes: 0, cachePool: null, transitions: null }, r = o !== null ? o.baseLanes : n, Ce(vr, wt), wt |= r;
  }
  else o !== null ? (r = o.baseLanes | n, t.memoizedState = null) : r = n, Ce(vr, wt), wt |= r;
  return ot(e, t, i, n), t.child;
}
function Yh(e, t) {
  var n = t.ref;
  (e === null && n !== null || e !== null && e.ref !== n) && (t.flags |= 512, t.flags |= 2097152);
}
function ql(e, t, n, r, i) {
  var o = pt(n) ? Gn : rt.current;
  return o = Ar(t, o), Pr(t, i), n = ia(e, t, n, r, o, i), r = oa(), e !== null && !ht ? (t.updateQueue = e.updateQueue, t.flags &= -2053, e.lanes &= ~i, an(e, t, i)) : (ke && r && Gu(t), t.flags |= 1, ot(e, t, n, i), t.child);
}
function bc(e, t, n, r, i) {
  if (pt(n)) {
    var o = !0;
    Go(t);
  } else o = !1;
  if (Pr(t, i), t.stateNode === null) To(e, t), zh(t, n, r), jl(t, n, r, i), r = !0;
  else if (e === null) {
    var s = t.stateNode, l = t.memoizedProps;
    s.props = l;
    var u = s.context, a = n.contextType;
    typeof a == "object" && a !== null ? a = It(a) : (a = pt(n) ? Gn : rt.current, a = Ar(t, a));
    var f = n.getDerivedStateFromProps, c = typeof f == "function" || typeof s.getSnapshotBeforeUpdate == "function";
    c || typeof s.UNSAFE_componentWillReceiveProps != "function" && typeof s.componentWillReceiveProps != "function" || (l !== r || u !== a) && Mc(t, s, r, a), gn = !1;
    var d = t.memoizedState;
    s.state = d, Ko(t, r, s, i), u = t.memoizedState, l !== r || d !== u || mt.current || gn ? (typeof f == "function" && ($l(t, n, f, r), u = t.memoizedState), (l = gn || Pc(t, n, l, r, d, u, a)) ? (c || typeof s.UNSAFE_componentWillMount != "function" && typeof s.componentWillMount != "function" || (typeof s.componentWillMount == "function" && s.componentWillMount(), typeof s.UNSAFE_componentWillMount == "function" && s.UNSAFE_componentWillMount()), typeof s.componentDidMount == "function" && (t.flags |= 4194308)) : (typeof s.componentDidMount == "function" && (t.flags |= 4194308), t.memoizedProps = r, t.memoizedState = u), s.props = r, s.state = u, s.context = a, r = l) : (typeof s.componentDidMount == "function" && (t.flags |= 4194308), r = !1);
  } else {
    s = t.stateNode, gh(e, t), l = t.memoizedProps, a = t.type === t.elementType ? l : zt(t.type, l), s.props = a, c = t.pendingProps, d = s.context, u = n.contextType, typeof u == "object" && u !== null ? u = It(u) : (u = pt(n) ? Gn : rt.current, u = Ar(t, u));
    var h = n.getDerivedStateFromProps;
    (f = typeof h == "function" || typeof s.getSnapshotBeforeUpdate == "function") || typeof s.UNSAFE_componentWillReceiveProps != "function" && typeof s.componentWillReceiveProps != "function" || (l !== c || d !== u) && Mc(t, s, r, u), gn = !1, d = t.memoizedState, s.state = d, Ko(t, r, s, i);
    var g = t.memoizedState;
    l !== c || d !== g || mt.current || gn ? (typeof h == "function" && ($l(t, n, h, r), g = t.memoizedState), (a = gn || Pc(t, n, a, r, d, g, u) || !1) ? (f || typeof s.UNSAFE_componentWillUpdate != "function" && typeof s.componentWillUpdate != "function" || (typeof s.componentWillUpdate == "function" && s.componentWillUpdate(r, g, u), typeof s.UNSAFE_componentWillUpdate == "function" && s.UNSAFE_componentWillUpdate(r, g, u)), typeof s.componentDidUpdate == "function" && (t.flags |= 4), typeof s.getSnapshotBeforeUpdate == "function" && (t.flags |= 1024)) : (typeof s.componentDidUpdate != "function" || l === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof s.getSnapshotBeforeUpdate != "function" || l === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), t.memoizedProps = r, t.memoizedState = g), s.props = r, s.state = g, s.context = u, r = a) : (typeof s.componentDidUpdate != "function" || l === e.memoizedProps && d === e.memoizedState || (t.flags |= 4), typeof s.getSnapshotBeforeUpdate != "function" || l === e.memoizedProps && d === e.memoizedState || (t.flags |= 1024), r = !1);
  }
  return Kl(e, t, n, r, o, i);
}
function Kl(e, t, n, r, i, o) {
  Yh(e, t);
  var s = (t.flags & 128) !== 0;
  if (!r && !s) return i && yc(t, n, !1), an(e, t, o);
  r = t.stateNode, g0.current = t;
  var l = s && typeof n.getDerivedStateFromError != "function" ? null : r.render();
  return t.flags |= 1, e !== null && s ? (t.child = kr(t, e.child, null, o), t.child = kr(t, null, l, o)) : ot(e, t, l, o), t.memoizedState = r.state, i && yc(t, n, !0), t.child;
}
function Vh(e) {
  var t = e.stateNode;
  t.pendingContext ? gc(e, t.pendingContext, t.pendingContext !== t.context) : t.context && gc(e, t.context, !1), ea(e, t.containerInfo);
}
function Lc(e, t, n, r, i) {
  return _r(), ju(i), t.flags |= 256, ot(e, t, n, r), t.child;
}
var Ql = { dehydrated: null, treeContext: null, retryLane: 0 };
function Jl(e) {
  return { baseLanes: e, cachePool: null, transitions: null };
}
function Xh(e, t, n) {
  var r = t.pendingProps, i = be.current, o = !1, s = (t.flags & 128) !== 0, l;
  if ((l = s) || (l = e !== null && e.memoizedState === null ? !1 : (i & 2) !== 0), l ? (o = !0, t.flags &= -129) : (e === null || e.memoizedState !== null) && (i |= 1), Ce(be, i & 1), e === null)
    return Hl(t), e = t.memoizedState, e !== null && (e = e.dehydrated, e !== null) ? (t.mode & 1 ? e.data === "$!" ? t.lanes = 8 : t.lanes = 1073741824 : t.lanes = 1, null) : (s = r.children, e = r.fallback, o ? (r = t.mode, o = t.child, s = { mode: "hidden", children: s }, !(r & 1) && o !== null ? (o.childLanes = 0, o.pendingProps = s) : o = Ms(s, r, 0, null), e = Hn(e, r, n, null), o.return = t, e.return = t, o.sibling = e, t.child = o, t.child.memoizedState = Jl(n), t.memoizedState = Ql, e) : ua(t, s));
  if (i = e.memoizedState, i !== null && (l = i.dehydrated, l !== null)) return y0(e, t, s, r, l, i, n);
  if (o) {
    o = r.fallback, s = t.mode, i = e.child, l = i.sibling;
    var u = { mode: "hidden", children: r.children };
    return !(s & 1) && t.child !== i ? (r = t.child, r.childLanes = 0, r.pendingProps = u, t.deletions = null) : (r = kn(i, u), r.subtreeFlags = i.subtreeFlags & 14680064), l !== null ? o = kn(l, o) : (o = Hn(o, s, n, null), o.flags |= 2), o.return = t, r.return = t, r.sibling = o, t.child = r, r = o, o = t.child, s = e.child.memoizedState, s = s === null ? Jl(n) : { baseLanes: s.baseLanes | n, cachePool: null, transitions: s.transitions }, o.memoizedState = s, o.childLanes = e.childLanes & ~n, t.memoizedState = Ql, r;
  }
  return o = e.child, e = o.sibling, r = kn(o, { mode: "visible", children: r.children }), !(t.mode & 1) && (r.lanes = n), r.return = t, r.sibling = null, e !== null && (n = t.deletions, n === null ? (t.deletions = [e], t.flags |= 16) : n.push(e)), t.child = r, t.memoizedState = null, r;
}
function ua(e, t) {
  return t = Ms({ mode: "visible", children: t }, e.mode, 0, null), t.return = e, e.child = t;
}
function ro(e, t, n, r) {
  return r !== null && ju(r), kr(t, e.child, null, n), e = ua(t, t.pendingProps.children), e.flags |= 2, t.memoizedState = null, e;
}
function y0(e, t, n, r, i, o, s) {
  if (n)
    return t.flags & 256 ? (t.flags &= -257, r = nl(Error(k(422))), ro(e, t, s, r)) : t.memoizedState !== null ? (t.child = e.child, t.flags |= 128, null) : (o = r.fallback, i = t.mode, r = Ms({ mode: "visible", children: r.children }, i, 0, null), o = Hn(o, i, s, null), o.flags |= 2, r.return = t, o.return = t, r.sibling = o, t.child = r, t.mode & 1 && kr(t, e.child, null, s), t.child.memoizedState = Jl(s), t.memoizedState = Ql, o);
  if (!(t.mode & 1)) return ro(e, t, s, null);
  if (i.data === "$!") {
    if (r = i.nextSibling && i.nextSibling.dataset, r) var l = r.dgst;
    return r = l, o = Error(k(419)), r = nl(o, r, void 0), ro(e, t, s, r);
  }
  if (l = (s & e.childLanes) !== 0, ht || l) {
    if (r = Ge, r !== null) {
      switch (s & -s) {
        case 4:
          i = 2;
          break;
        case 16:
          i = 8;
          break;
        case 64:
        case 128:
        case 256:
        case 512:
        case 1024:
        case 2048:
        case 4096:
        case 8192:
        case 16384:
        case 32768:
        case 65536:
        case 131072:
        case 262144:
        case 524288:
        case 1048576:
        case 2097152:
        case 4194304:
        case 8388608:
        case 16777216:
        case 33554432:
        case 67108864:
          i = 32;
          break;
        case 536870912:
          i = 268435456;
          break;
        default:
          i = 0;
      }
      i = i & (r.suspendedLanes | s) ? 0 : i, i !== 0 && i !== o.retryLane && (o.retryLane = i, un(e, i), Vt(r, e, i, -1));
    }
    return ma(), r = nl(Error(k(421))), ro(e, t, s, r);
  }
  return i.data === "$?" ? (t.flags |= 128, t.child = e.child, t = k0.bind(null, e), i._reactRetry = t, null) : (e = o.treeContext, xt = Mn(i.nextSibling), St = t, ke = !0, Bt = null, e !== null && (Mt[Tt++] = en, Mt[Tt++] = tn, Mt[Tt++] = $n, en = e.id, tn = e.overflow, $n = t), t = ua(t, r.children), t.flags |= 4096, t);
}
function Fc(e, t, n) {
  e.lanes |= t;
  var r = e.alternate;
  r !== null && (r.lanes |= t), Gl(e.return, t, n);
}
function rl(e, t, n, r, i) {
  var o = e.memoizedState;
  o === null ? e.memoizedState = { isBackwards: t, rendering: null, renderingStartTime: 0, last: r, tail: n, tailMode: i } : (o.isBackwards = t, o.rendering = null, o.renderingStartTime = 0, o.last = r, o.tail = n, o.tailMode = i);
}
function Hh(e, t, n) {
  var r = t.pendingProps, i = r.revealOrder, o = r.tail;
  if (ot(e, t, r.children, n), r = be.current, r & 2) r = r & 1 | 2, t.flags |= 128;
  else {
    if (e !== null && e.flags & 128) e: for (e = t.child; e !== null; ) {
      if (e.tag === 13) e.memoizedState !== null && Fc(e, n, t);
      else if (e.tag === 19) Fc(e, n, t);
      else if (e.child !== null) {
        e.child.return = e, e = e.child;
        continue;
      }
      if (e === t) break e;
      for (; e.sibling === null; ) {
        if (e.return === null || e.return === t) break e;
        e = e.return;
      }
      e.sibling.return = e.return, e = e.sibling;
    }
    r &= 1;
  }
  if (Ce(be, r), !(t.mode & 1)) t.memoizedState = null;
  else switch (i) {
    case "forwards":
      for (n = t.child, i = null; n !== null; ) e = n.alternate, e !== null && Qo(e) === null && (i = n), n = n.sibling;
      n = i, n === null ? (i = t.child, t.child = null) : (i = n.sibling, n.sibling = null), rl(t, !1, i, n, o);
      break;
    case "backwards":
      for (n = null, i = t.child, t.child = null; i !== null; ) {
        if (e = i.alternate, e !== null && Qo(e) === null) {
          t.child = i;
          break;
        }
        e = i.sibling, i.sibling = n, n = i, i = e;
      }
      rl(t, !0, n, null, o);
      break;
    case "together":
      rl(t, !1, null, null, void 0);
      break;
    default:
      t.memoizedState = null;
  }
  return t.child;
}
function To(e, t) {
  !(t.mode & 1) && e !== null && (e.alternate = null, t.alternate = null, t.flags |= 2);
}
function an(e, t, n) {
  if (e !== null && (t.dependencies = e.dependencies), Zn |= t.lanes, !(n & t.childLanes)) return null;
  if (e !== null && t.child !== e.child) throw Error(k(153));
  if (t.child !== null) {
    for (e = t.child, n = kn(e, e.pendingProps), t.child = n, n.return = t; e.sibling !== null; ) e = e.sibling, n = n.sibling = kn(e, e.pendingProps), n.return = t;
    n.sibling = null;
  }
  return t.child;
}
function v0(e, t, n) {
  switch (t.tag) {
    case 3:
      Vh(t), _r();
      break;
    case 5:
      yh(t);
      break;
    case 1:
      pt(t.type) && Go(t);
      break;
    case 4:
      ea(t, t.stateNode.containerInfo);
      break;
    case 10:
      var r = t.type._context, i = t.memoizedProps.value;
      Ce(Zo, r._currentValue), r._currentValue = i;
      break;
    case 13:
      if (r = t.memoizedState, r !== null)
        return r.dehydrated !== null ? (Ce(be, be.current & 1), t.flags |= 128, null) : n & t.child.childLanes ? Xh(e, t, n) : (Ce(be, be.current & 1), e = an(e, t, n), e !== null ? e.sibling : null);
      Ce(be, be.current & 1);
      break;
    case 19:
      if (r = (n & t.childLanes) !== 0, e.flags & 128) {
        if (r) return Hh(e, t, n);
        t.flags |= 128;
      }
      if (i = t.memoizedState, i !== null && (i.rendering = null, i.tail = null, i.lastEffect = null), Ce(be, be.current), r) break;
      return null;
    case 22:
    case 23:
      return t.lanes = 0, Wh(e, t, n);
  }
  return an(e, t, n);
}
var Gh, eu, $h, jh;
Gh = function(e, t) {
  for (var n = t.child; n !== null; ) {
    if (n.tag === 5 || n.tag === 6) e.appendChild(n.stateNode);
    else if (n.tag !== 4 && n.child !== null) {
      n.child.return = n, n = n.child;
      continue;
    }
    if (n === t) break;
    for (; n.sibling === null; ) {
      if (n.return === null || n.return === t) return;
      n = n.return;
    }
    n.sibling.return = n.return, n = n.sibling;
  }
};
eu = function() {
};
$h = function(e, t, n, r) {
  var i = e.memoizedProps;
  if (i !== r) {
    e = t.stateNode, Vn(Zt.current);
    var o = null;
    switch (n) {
      case "input":
        i = El(e, i), r = El(e, r), o = [];
        break;
      case "select":
        i = Fe({}, i, { value: void 0 }), r = Fe({}, r, { value: void 0 }), o = [];
        break;
      case "textarea":
        i = Pl(e, i), r = Pl(e, r), o = [];
        break;
      default:
        typeof i.onClick != "function" && typeof r.onClick == "function" && (e.onclick = Xo);
    }
    Tl(n, r);
    var s;
    n = null;
    for (a in i) if (!r.hasOwnProperty(a) && i.hasOwnProperty(a) && i[a] != null) if (a === "style") {
      var l = i[a];
      for (s in l) l.hasOwnProperty(s) && (n || (n = {}), n[s] = "");
    } else a !== "dangerouslySetInnerHTML" && a !== "children" && a !== "suppressContentEditableWarning" && a !== "suppressHydrationWarning" && a !== "autoFocus" && (fi.hasOwnProperty(a) ? o || (o = []) : (o = o || []).push(a, null));
    for (a in r) {
      var u = r[a];
      if (l = i?.[a], r.hasOwnProperty(a) && u !== l && (u != null || l != null)) if (a === "style") if (l) {
        for (s in l) !l.hasOwnProperty(s) || u && u.hasOwnProperty(s) || (n || (n = {}), n[s] = "");
        for (s in u) u.hasOwnProperty(s) && l[s] !== u[s] && (n || (n = {}), n[s] = u[s]);
      } else n || (o || (o = []), o.push(
        a,
        n
      )), n = u;
      else a === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, l = l ? l.__html : void 0, u != null && l !== u && (o = o || []).push(a, u)) : a === "children" ? typeof u != "string" && typeof u != "number" || (o = o || []).push(a, "" + u) : a !== "suppressContentEditableWarning" && a !== "suppressHydrationWarning" && (fi.hasOwnProperty(a) ? (u != null && a === "onScroll" && Te("scroll", e), o || l === u || (o = [])) : (o = o || []).push(a, u));
    }
    n && (o = o || []).push("style", n);
    var a = o;
    (t.updateQueue = a) && (t.flags |= 4);
  }
};
jh = function(e, t, n, r) {
  n !== r && (t.flags |= 4);
};
function Gr(e, t) {
  if (!ke) switch (e.tailMode) {
    case "hidden":
      t = e.tail;
      for (var n = null; t !== null; ) t.alternate !== null && (n = t), t = t.sibling;
      n === null ? e.tail = null : n.sibling = null;
      break;
    case "collapsed":
      n = e.tail;
      for (var r = null; n !== null; ) n.alternate !== null && (r = n), n = n.sibling;
      r === null ? t || e.tail === null ? e.tail = null : e.tail.sibling = null : r.sibling = null;
  }
}
function Je(e) {
  var t = e.alternate !== null && e.alternate.child === e.child, n = 0, r = 0;
  if (t) for (var i = e.child; i !== null; ) n |= i.lanes | i.childLanes, r |= i.subtreeFlags & 14680064, r |= i.flags & 14680064, i.return = e, i = i.sibling;
  else for (i = e.child; i !== null; ) n |= i.lanes | i.childLanes, r |= i.subtreeFlags, r |= i.flags, i.return = e, i = i.sibling;
  return e.subtreeFlags |= r, e.childLanes = n, t;
}
function w0(e, t, n) {
  var r = t.pendingProps;
  switch ($u(t), t.tag) {
    case 2:
    case 16:
    case 15:
    case 0:
    case 11:
    case 7:
    case 8:
    case 12:
    case 9:
    case 14:
      return Je(t), null;
    case 1:
      return pt(t.type) && Ho(), Je(t), null;
    case 3:
      return r = t.stateNode, Ir(), _e(mt), _e(rt), na(), r.pendingContext && (r.context = r.pendingContext, r.pendingContext = null), (e === null || e.child === null) && (to(t) ? t.flags |= 4 : e === null || e.memoizedState.isDehydrated && !(t.flags & 256) || (t.flags |= 1024, Bt !== null && (uu(Bt), Bt = null))), eu(e, t), Je(t), null;
    case 5:
      ta(t);
      var i = Vn(Ci.current);
      if (n = t.type, e !== null && t.stateNode != null) $h(e, t, n, r, i), e.ref !== t.ref && (t.flags |= 512, t.flags |= 2097152);
      else {
        if (!r) {
          if (t.stateNode === null) throw Error(k(166));
          return Je(t), null;
        }
        if (e = Vn(Zt.current), to(t)) {
          r = t.stateNode, n = t.type;
          var o = t.memoizedProps;
          switch (r[$t] = t, r[Si] = o, e = (t.mode & 1) !== 0, n) {
            case "dialog":
              Te("cancel", r), Te("close", r);
              break;
            case "iframe":
            case "object":
            case "embed":
              Te("load", r);
              break;
            case "video":
            case "audio":
              for (i = 0; i < Jr.length; i++) Te(Jr[i], r);
              break;
            case "source":
              Te("error", r);
              break;
            case "img":
            case "image":
            case "link":
              Te(
                "error",
                r
              ), Te("load", r);
              break;
            case "details":
              Te("toggle", r);
              break;
            case "input":
              Va(r, o), Te("invalid", r);
              break;
            case "select":
              r._wrapperState = { wasMultiple: !!o.multiple }, Te("invalid", r);
              break;
            case "textarea":
              Ha(r, o), Te("invalid", r);
          }
          Tl(n, o), i = null;
          for (var s in o) if (o.hasOwnProperty(s)) {
            var l = o[s];
            s === "children" ? typeof l == "string" ? r.textContent !== l && (o.suppressHydrationWarning !== !0 && eo(r.textContent, l, e), i = ["children", l]) : typeof l == "number" && r.textContent !== "" + l && (o.suppressHydrationWarning !== !0 && eo(
              r.textContent,
              l,
              e
            ), i = ["children", "" + l]) : fi.hasOwnProperty(s) && l != null && s === "onScroll" && Te("scroll", r);
          }
          switch (n) {
            case "input":
              Gi(r), Xa(r, o, !0);
              break;
            case "textarea":
              Gi(r), Ga(r);
              break;
            case "select":
            case "option":
              break;
            default:
              typeof o.onClick == "function" && (r.onclick = Xo);
          }
          r = i, t.updateQueue = r, r !== null && (t.flags |= 4);
        } else {
          s = i.nodeType === 9 ? i : i.ownerDocument, e === "http://www.w3.org/1999/xhtml" && (e = Ed(n)), e === "http://www.w3.org/1999/xhtml" ? n === "script" ? (e = s.createElement("div"), e.innerHTML = "<script><\/script>", e = e.removeChild(e.firstChild)) : typeof r.is == "string" ? e = s.createElement(n, { is: r.is }) : (e = s.createElement(n), n === "select" && (s = e, r.multiple ? s.multiple = !0 : r.size && (s.size = r.size))) : e = s.createElementNS(e, n), e[$t] = t, e[Si] = r, Gh(e, t, !1, !1), t.stateNode = e;
          e: {
            switch (s = Al(n, r), n) {
              case "dialog":
                Te("cancel", e), Te("close", e), i = r;
                break;
              case "iframe":
              case "object":
              case "embed":
                Te("load", e), i = r;
                break;
              case "video":
              case "audio":
                for (i = 0; i < Jr.length; i++) Te(Jr[i], e);
                i = r;
                break;
              case "source":
                Te("error", e), i = r;
                break;
              case "img":
              case "image":
              case "link":
                Te(
                  "error",
                  e
                ), Te("load", e), i = r;
                break;
              case "details":
                Te("toggle", e), i = r;
                break;
              case "input":
                Va(e, r), i = El(e, r), Te("invalid", e);
                break;
              case "option":
                i = r;
                break;
              case "select":
                e._wrapperState = { wasMultiple: !!r.multiple }, i = Fe({}, r, { value: void 0 }), Te("invalid", e);
                break;
              case "textarea":
                Ha(e, r), i = Pl(e, r), Te("invalid", e);
                break;
              default:
                i = r;
            }
            Tl(n, i), l = i;
            for (o in l) if (l.hasOwnProperty(o)) {
              var u = l[o];
              o === "style" ? Pd(e, u) : o === "dangerouslySetInnerHTML" ? (u = u ? u.__html : void 0, u != null && Cd(e, u)) : o === "children" ? typeof u == "string" ? (n !== "textarea" || u !== "") && di(e, u) : typeof u == "number" && di(e, "" + u) : o !== "suppressContentEditableWarning" && o !== "suppressHydrationWarning" && o !== "autoFocus" && (fi.hasOwnProperty(o) ? u != null && o === "onScroll" && Te("scroll", e) : u != null && bu(e, o, u, s));
            }
            switch (n) {
              case "input":
                Gi(e), Xa(e, r, !1);
                break;
              case "textarea":
                Gi(e), Ga(e);
                break;
              case "option":
                r.value != null && e.setAttribute("value", "" + bn(r.value));
                break;
              case "select":
                e.multiple = !!r.multiple, o = r.value, o != null ? Sr(e, !!r.multiple, o, !1) : r.defaultValue != null && Sr(
                  e,
                  !!r.multiple,
                  r.defaultValue,
                  !0
                );
                break;
              default:
                typeof i.onClick == "function" && (e.onclick = Xo);
            }
            switch (n) {
              case "button":
              case "input":
              case "select":
              case "textarea":
                r = !!r.autoFocus;
                break e;
              case "img":
                r = !0;
                break e;
              default:
                r = !1;
            }
          }
          r && (t.flags |= 4);
        }
        t.ref !== null && (t.flags |= 512, t.flags |= 2097152);
      }
      return Je(t), null;
    case 6:
      if (e && t.stateNode != null) jh(e, t, e.memoizedProps, r);
      else {
        if (typeof r != "string" && t.stateNode === null) throw Error(k(166));
        if (n = Vn(Ci.current), Vn(Zt.current), to(t)) {
          if (r = t.stateNode, n = t.memoizedProps, r[$t] = t, (o = r.nodeValue !== n) && (e = St, e !== null)) switch (e.tag) {
            case 3:
              eo(r.nodeValue, n, (e.mode & 1) !== 0);
              break;
            case 5:
              e.memoizedProps.suppressHydrationWarning !== !0 && eo(r.nodeValue, n, (e.mode & 1) !== 0);
          }
          o && (t.flags |= 4);
        } else r = (n.nodeType === 9 ? n : n.ownerDocument).createTextNode(r), r[$t] = t, t.stateNode = r;
      }
      return Je(t), null;
    case 13:
      if (_e(be), r = t.memoizedState, e === null || e.memoizedState !== null && e.memoizedState.dehydrated !== null) {
        if (ke && xt !== null && t.mode & 1 && !(t.flags & 128)) dh(), _r(), t.flags |= 98560, o = !1;
        else if (o = to(t), r !== null && r.dehydrated !== null) {
          if (e === null) {
            if (!o) throw Error(k(318));
            if (o = t.memoizedState, o = o !== null ? o.dehydrated : null, !o) throw Error(k(317));
            o[$t] = t;
          } else _r(), !(t.flags & 128) && (t.memoizedState = null), t.flags |= 4;
          Je(t), o = !1;
        } else Bt !== null && (uu(Bt), Bt = null), o = !0;
        if (!o) return t.flags & 65536 ? t : null;
      }
      return t.flags & 128 ? (t.lanes = n, t) : (r = r !== null, r !== (e !== null && e.memoizedState !== null) && r && (t.child.flags |= 8192, t.mode & 1 && (e === null || be.current & 1 ? Xe === 0 && (Xe = 3) : ma())), t.updateQueue !== null && (t.flags |= 4), Je(t), null);
    case 4:
      return Ir(), eu(e, t), e === null && wi(t.stateNode.containerInfo), Je(t), null;
    case 10:
      return Ku(t.type._context), Je(t), null;
    case 17:
      return pt(t.type) && Ho(), Je(t), null;
    case 19:
      if (_e(be), o = t.memoizedState, o === null) return Je(t), null;
      if (r = (t.flags & 128) !== 0, s = o.rendering, s === null) if (r) Gr(o, !1);
      else {
        if (Xe !== 0 || e !== null && e.flags & 128) for (e = t.child; e !== null; ) {
          if (s = Qo(e), s !== null) {
            for (t.flags |= 128, Gr(o, !1), r = s.updateQueue, r !== null && (t.updateQueue = r, t.flags |= 4), t.subtreeFlags = 0, r = n, n = t.child; n !== null; ) o = n, e = r, o.flags &= 14680066, s = o.alternate, s === null ? (o.childLanes = 0, o.lanes = e, o.child = null, o.subtreeFlags = 0, o.memoizedProps = null, o.memoizedState = null, o.updateQueue = null, o.dependencies = null, o.stateNode = null) : (o.childLanes = s.childLanes, o.lanes = s.lanes, o.child = s.child, o.subtreeFlags = 0, o.deletions = null, o.memoizedProps = s.memoizedProps, o.memoizedState = s.memoizedState, o.updateQueue = s.updateQueue, o.type = s.type, e = s.dependencies, o.dependencies = e === null ? null : { lanes: e.lanes, firstContext: e.firstContext }), n = n.sibling;
            return Ce(be, be.current & 1 | 2), t.child;
          }
          e = e.sibling;
        }
        o.tail !== null && Ue() > Lr && (t.flags |= 128, r = !0, Gr(o, !1), t.lanes = 4194304);
      }
      else {
        if (!r) if (e = Qo(s), e !== null) {
          if (t.flags |= 128, r = !0, n = e.updateQueue, n !== null && (t.updateQueue = n, t.flags |= 4), Gr(o, !0), o.tail === null && o.tailMode === "hidden" && !s.alternate && !ke) return Je(t), null;
        } else 2 * Ue() - o.renderingStartTime > Lr && n !== 1073741824 && (t.flags |= 128, r = !0, Gr(o, !1), t.lanes = 4194304);
        o.isBackwards ? (s.sibling = t.child, t.child = s) : (n = o.last, n !== null ? n.sibling = s : t.child = s, o.last = s);
      }
      return o.tail !== null ? (t = o.tail, o.rendering = t, o.tail = t.sibling, o.renderingStartTime = Ue(), t.sibling = null, n = be.current, Ce(be, r ? n & 1 | 2 : n & 1), t) : (Je(t), null);
    case 22:
    case 23:
      return ha(), r = t.memoizedState !== null, e !== null && e.memoizedState !== null !== r && (t.flags |= 8192), r && t.mode & 1 ? wt & 1073741824 && (Je(t), t.subtreeFlags & 6 && (t.flags |= 8192)) : Je(t), null;
    case 24:
      return null;
    case 25:
      return null;
  }
  throw Error(k(156, t.tag));
}
function x0(e, t) {
  switch ($u(t), t.tag) {
    case 1:
      return pt(t.type) && Ho(), e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 3:
      return Ir(), _e(mt), _e(rt), na(), e = t.flags, e & 65536 && !(e & 128) ? (t.flags = e & -65537 | 128, t) : null;
    case 5:
      return ta(t), null;
    case 13:
      if (_e(be), e = t.memoizedState, e !== null && e.dehydrated !== null) {
        if (t.alternate === null) throw Error(k(340));
        _r();
      }
      return e = t.flags, e & 65536 ? (t.flags = e & -65537 | 128, t) : null;
    case 19:
      return _e(be), null;
    case 4:
      return Ir(), null;
    case 10:
      return Ku(t.type._context), null;
    case 22:
    case 23:
      return ha(), null;
    case 24:
      return null;
    default:
      return null;
  }
}
var io = !1, nt = !1, S0 = typeof WeakSet == "function" ? WeakSet : Set, X = null;
function yr(e, t) {
  var n = e.ref;
  if (n !== null) if (typeof n == "function") try {
    n(null);
  } catch (r) {
    De(e, t, r);
  }
  else n.current = null;
}
function tu(e, t, n) {
  try {
    n();
  } catch (r) {
    De(e, t, r);
  }
}
var Nc = !1;
function E0(e, t) {
  if (Ul = Wo, e = Jd(), Hu(e)) {
    if ("selectionStart" in e) var n = { start: e.selectionStart, end: e.selectionEnd };
    else e: {
      n = (n = e.ownerDocument) && n.defaultView || window;
      var r = n.getSelection && n.getSelection();
      if (r && r.rangeCount !== 0) {
        n = r.anchorNode;
        var i = r.anchorOffset, o = r.focusNode;
        r = r.focusOffset;
        try {
          n.nodeType, o.nodeType;
        } catch {
          n = null;
          break e;
        }
        var s = 0, l = -1, u = -1, a = 0, f = 0, c = e, d = null;
        t: for (; ; ) {
          for (var h; c !== n || i !== 0 && c.nodeType !== 3 || (l = s + i), c !== o || r !== 0 && c.nodeType !== 3 || (u = s + r), c.nodeType === 3 && (s += c.nodeValue.length), (h = c.firstChild) !== null; )
            d = c, c = h;
          for (; ; ) {
            if (c === e) break t;
            if (d === n && ++a === i && (l = s), d === o && ++f === r && (u = s), (h = c.nextSibling) !== null) break;
            c = d, d = c.parentNode;
          }
          c = h;
        }
        n = l === -1 || u === -1 ? null : { start: l, end: u };
      } else n = null;
    }
    n = n || { start: 0, end: 0 };
  } else n = null;
  for (Bl = { focusedElem: e, selectionRange: n }, Wo = !1, X = t; X !== null; ) if (t = X, e = t.child, (t.subtreeFlags & 1028) !== 0 && e !== null) e.return = t, X = e;
  else for (; X !== null; ) {
    t = X;
    try {
      var g = t.alternate;
      if (t.flags & 1024) switch (t.tag) {
        case 0:
        case 11:
        case 15:
          break;
        case 1:
          if (g !== null) {
            var y = g.memoizedProps, x = g.memoizedState, p = t.stateNode, m = p.getSnapshotBeforeUpdate(t.elementType === t.type ? y : zt(t.type, y), x);
            p.__reactInternalSnapshotBeforeUpdate = m;
          }
          break;
        case 3:
          var v = t.stateNode.containerInfo;
          v.nodeType === 1 ? v.textContent = "" : v.nodeType === 9 && v.documentElement && v.removeChild(v.documentElement);
          break;
        case 5:
        case 6:
        case 4:
        case 17:
          break;
        default:
          throw Error(k(163));
      }
    } catch (w) {
      De(t, t.return, w);
    }
    if (e = t.sibling, e !== null) {
      e.return = t.return, X = e;
      break;
    }
    X = t.return;
  }
  return g = Nc, Nc = !1, g;
}
function li(e, t, n) {
  var r = t.updateQueue;
  if (r = r !== null ? r.lastEffect : null, r !== null) {
    var i = r = r.next;
    do {
      if ((i.tag & e) === e) {
        var o = i.destroy;
        i.destroy = void 0, o !== void 0 && tu(t, n, o);
      }
      i = i.next;
    } while (i !== r);
  }
}
function Rs(e, t) {
  if (t = t.updateQueue, t = t !== null ? t.lastEffect : null, t !== null) {
    var n = t = t.next;
    do {
      if ((n.tag & e) === e) {
        var r = n.create;
        n.destroy = r();
      }
      n = n.next;
    } while (n !== t);
  }
}
function nu(e) {
  var t = e.ref;
  if (t !== null) {
    var n = e.stateNode;
    switch (e.tag) {
      case 5:
        e = n;
        break;
      default:
        e = n;
    }
    typeof t == "function" ? t(e) : t.current = e;
  }
}
function Zh(e) {
  var t = e.alternate;
  t !== null && (e.alternate = null, Zh(t)), e.child = null, e.deletions = null, e.sibling = null, e.tag === 5 && (t = e.stateNode, t !== null && (delete t[$t], delete t[Si], delete t[Yl], delete t[i0], delete t[o0])), e.stateNode = null, e.return = null, e.dependencies = null, e.memoizedProps = null, e.memoizedState = null, e.pendingProps = null, e.stateNode = null, e.updateQueue = null;
}
function qh(e) {
  return e.tag === 5 || e.tag === 3 || e.tag === 4;
}
function Dc(e) {
  e: for (; ; ) {
    for (; e.sibling === null; ) {
      if (e.return === null || qh(e.return)) return null;
      e = e.return;
    }
    for (e.sibling.return = e.return, e = e.sibling; e.tag !== 5 && e.tag !== 6 && e.tag !== 18; ) {
      if (e.flags & 2 || e.child === null || e.tag === 4) continue e;
      e.child.return = e, e = e.child;
    }
    if (!(e.flags & 2)) return e.stateNode;
  }
}
function ru(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.nodeType === 8 ? n.parentNode.insertBefore(e, t) : n.insertBefore(e, t) : (n.nodeType === 8 ? (t = n.parentNode, t.insertBefore(e, n)) : (t = n, t.appendChild(e)), n = n._reactRootContainer, n != null || t.onclick !== null || (t.onclick = Xo));
  else if (r !== 4 && (e = e.child, e !== null)) for (ru(e, t, n), e = e.sibling; e !== null; ) ru(e, t, n), e = e.sibling;
}
function iu(e, t, n) {
  var r = e.tag;
  if (r === 5 || r === 6) e = e.stateNode, t ? n.insertBefore(e, t) : n.appendChild(e);
  else if (r !== 4 && (e = e.child, e !== null)) for (iu(e, t, n), e = e.sibling; e !== null; ) iu(e, t, n), e = e.sibling;
}
var $e = null, Ut = !1;
function hn(e, t, n) {
  for (n = n.child; n !== null; ) Kh(e, t, n), n = n.sibling;
}
function Kh(e, t, n) {
  if (jt && typeof jt.onCommitFiberUnmount == "function") try {
    jt.onCommitFiberUnmount(gs, n);
  } catch {
  }
  switch (n.tag) {
    case 5:
      nt || yr(n, t);
    case 6:
      var r = $e, i = Ut;
      $e = null, hn(e, t, n), $e = r, Ut = i, $e !== null && (Ut ? (e = $e, n = n.stateNode, e.nodeType === 8 ? e.parentNode.removeChild(n) : e.removeChild(n)) : $e.removeChild(n.stateNode));
      break;
    case 18:
      $e !== null && (Ut ? (e = $e, n = n.stateNode, e.nodeType === 8 ? qs(e.parentNode, n) : e.nodeType === 1 && qs(e, n), gi(e)) : qs($e, n.stateNode));
      break;
    case 4:
      r = $e, i = Ut, $e = n.stateNode.containerInfo, Ut = !0, hn(e, t, n), $e = r, Ut = i;
      break;
    case 0:
    case 11:
    case 14:
    case 15:
      if (!nt && (r = n.updateQueue, r !== null && (r = r.lastEffect, r !== null))) {
        i = r = r.next;
        do {
          var o = i, s = o.destroy;
          o = o.tag, s !== void 0 && (o & 2 || o & 4) && tu(n, t, s), i = i.next;
        } while (i !== r);
      }
      hn(e, t, n);
      break;
    case 1:
      if (!nt && (yr(n, t), r = n.stateNode, typeof r.componentWillUnmount == "function")) try {
        r.props = n.memoizedProps, r.state = n.memoizedState, r.componentWillUnmount();
      } catch (l) {
        De(n, t, l);
      }
      hn(e, t, n);
      break;
    case 21:
      hn(e, t, n);
      break;
    case 22:
      n.mode & 1 ? (nt = (r = nt) || n.memoizedState !== null, hn(e, t, n), nt = r) : hn(e, t, n);
      break;
    default:
      hn(e, t, n);
  }
}
function zc(e) {
  var t = e.updateQueue;
  if (t !== null) {
    e.updateQueue = null;
    var n = e.stateNode;
    n === null && (n = e.stateNode = new S0()), t.forEach(function(r) {
      var i = I0.bind(null, e, r);
      n.has(r) || (n.add(r), r.then(i, i));
    });
  }
}
function Nt(e, t) {
  var n = t.deletions;
  if (n !== null) for (var r = 0; r < n.length; r++) {
    var i = n[r];
    try {
      var o = e, s = t, l = s;
      e: for (; l !== null; ) {
        switch (l.tag) {
          case 5:
            $e = l.stateNode, Ut = !1;
            break e;
          case 3:
            $e = l.stateNode.containerInfo, Ut = !0;
            break e;
          case 4:
            $e = l.stateNode.containerInfo, Ut = !0;
            break e;
        }
        l = l.return;
      }
      if ($e === null) throw Error(k(160));
      Kh(o, s, i), $e = null, Ut = !1;
      var u = i.alternate;
      u !== null && (u.return = null), i.return = null;
    } catch (a) {
      De(i, t, a);
    }
  }
  if (t.subtreeFlags & 12854) for (t = t.child; t !== null; ) Qh(t, e), t = t.sibling;
}
function Qh(e, t) {
  var n = e.alternate, r = e.flags;
  switch (e.tag) {
    case 0:
    case 11:
    case 14:
    case 15:
      if (Nt(t, e), Ht(e), r & 4) {
        try {
          li(3, e, e.return), Rs(3, e);
        } catch (y) {
          De(e, e.return, y);
        }
        try {
          li(5, e, e.return);
        } catch (y) {
          De(e, e.return, y);
        }
      }
      break;
    case 1:
      Nt(t, e), Ht(e), r & 512 && n !== null && yr(n, n.return);
      break;
    case 5:
      if (Nt(t, e), Ht(e), r & 512 && n !== null && yr(n, n.return), e.flags & 32) {
        var i = e.stateNode;
        try {
          di(i, "");
        } catch (y) {
          De(e, e.return, y);
        }
      }
      if (r & 4 && (i = e.stateNode, i != null)) {
        var o = e.memoizedProps, s = n !== null ? n.memoizedProps : o, l = e.type, u = e.updateQueue;
        if (e.updateQueue = null, u !== null) try {
          l === "input" && o.type === "radio" && o.name != null && xd(i, o), Al(l, s);
          var a = Al(l, o);
          for (s = 0; s < u.length; s += 2) {
            var f = u[s], c = u[s + 1];
            f === "style" ? Pd(i, c) : f === "dangerouslySetInnerHTML" ? Cd(i, c) : f === "children" ? di(i, c) : bu(i, f, c, a);
          }
          switch (l) {
            case "input":
              Cl(i, o);
              break;
            case "textarea":
              Sd(i, o);
              break;
            case "select":
              var d = i._wrapperState.wasMultiple;
              i._wrapperState.wasMultiple = !!o.multiple;
              var h = o.value;
              h != null ? Sr(i, !!o.multiple, h, !1) : d !== !!o.multiple && (o.defaultValue != null ? Sr(
                i,
                !!o.multiple,
                o.defaultValue,
                !0
              ) : Sr(i, !!o.multiple, o.multiple ? [] : "", !1));
          }
          i[Si] = o;
        } catch (y) {
          De(e, e.return, y);
        }
      }
      break;
    case 6:
      if (Nt(t, e), Ht(e), r & 4) {
        if (e.stateNode === null) throw Error(k(162));
        i = e.stateNode, o = e.memoizedProps;
        try {
          i.nodeValue = o;
        } catch (y) {
          De(e, e.return, y);
        }
      }
      break;
    case 3:
      if (Nt(t, e), Ht(e), r & 4 && n !== null && n.memoizedState.isDehydrated) try {
        gi(t.containerInfo);
      } catch (y) {
        De(e, e.return, y);
      }
      break;
    case 4:
      Nt(t, e), Ht(e);
      break;
    case 13:
      Nt(t, e), Ht(e), i = e.child, i.flags & 8192 && (o = i.memoizedState !== null, i.stateNode.isHidden = o, !o || i.alternate !== null && i.alternate.memoizedState !== null || (fa = Ue())), r & 4 && zc(e);
      break;
    case 22:
      if (f = n !== null && n.memoizedState !== null, e.mode & 1 ? (nt = (a = nt) || f, Nt(t, e), nt = a) : Nt(t, e), Ht(e), r & 8192) {
        if (a = e.memoizedState !== null, (e.stateNode.isHidden = a) && !f && e.mode & 1) for (X = e, f = e.child; f !== null; ) {
          for (c = X = f; X !== null; ) {
            switch (d = X, h = d.child, d.tag) {
              case 0:
              case 11:
              case 14:
              case 15:
                li(4, d, d.return);
                break;
              case 1:
                yr(d, d.return);
                var g = d.stateNode;
                if (typeof g.componentWillUnmount == "function") {
                  r = d, n = d.return;
                  try {
                    t = r, g.props = t.memoizedProps, g.state = t.memoizedState, g.componentWillUnmount();
                  } catch (y) {
                    De(r, n, y);
                  }
                }
                break;
              case 5:
                yr(d, d.return);
                break;
              case 22:
                if (d.memoizedState !== null) {
                  Bc(c);
                  continue;
                }
            }
            h !== null ? (h.return = d, X = h) : Bc(c);
          }
          f = f.sibling;
        }
        e: for (f = null, c = e; ; ) {
          if (c.tag === 5) {
            if (f === null) {
              f = c;
              try {
                i = c.stateNode, a ? (o = i.style, typeof o.setProperty == "function" ? o.setProperty("display", "none", "important") : o.display = "none") : (l = c.stateNode, u = c.memoizedProps.style, s = u != null && u.hasOwnProperty("display") ? u.display : null, l.style.display = Rd("display", s));
              } catch (y) {
                De(e, e.return, y);
              }
            }
          } else if (c.tag === 6) {
            if (f === null) try {
              c.stateNode.nodeValue = a ? "" : c.memoizedProps;
            } catch (y) {
              De(e, e.return, y);
            }
          } else if ((c.tag !== 22 && c.tag !== 23 || c.memoizedState === null || c === e) && c.child !== null) {
            c.child.return = c, c = c.child;
            continue;
          }
          if (c === e) break e;
          for (; c.sibling === null; ) {
            if (c.return === null || c.return === e) break e;
            f === c && (f = null), c = c.return;
          }
          f === c && (f = null), c.sibling.return = c.return, c = c.sibling;
        }
      }
      break;
    case 19:
      Nt(t, e), Ht(e), r & 4 && zc(e);
      break;
    case 21:
      break;
    default:
      Nt(
        t,
        e
      ), Ht(e);
  }
}
function Ht(e) {
  var t = e.flags;
  if (t & 2) {
    try {
      e: {
        for (var n = e.return; n !== null; ) {
          if (qh(n)) {
            var r = n;
            break e;
          }
          n = n.return;
        }
        throw Error(k(160));
      }
      switch (r.tag) {
        case 5:
          var i = r.stateNode;
          r.flags & 32 && (di(i, ""), r.flags &= -33);
          var o = Dc(e);
          iu(e, o, i);
          break;
        case 3:
        case 4:
          var s = r.stateNode.containerInfo, l = Dc(e);
          ru(e, l, s);
          break;
        default:
          throw Error(k(161));
      }
    } catch (u) {
      De(e, e.return, u);
    }
    e.flags &= -3;
  }
  t & 4096 && (e.flags &= -4097);
}
function C0(e, t, n) {
  X = e, Jh(e);
}
function Jh(e, t, n) {
  for (var r = (e.mode & 1) !== 0; X !== null; ) {
    var i = X, o = i.child;
    if (i.tag === 22 && r) {
      var s = i.memoizedState !== null || io;
      if (!s) {
        var l = i.alternate, u = l !== null && l.memoizedState !== null || nt;
        l = io;
        var a = nt;
        if (io = s, (nt = u) && !a) for (X = i; X !== null; ) s = X, u = s.child, s.tag === 22 && s.memoizedState !== null ? Oc(i) : u !== null ? (u.return = s, X = u) : Oc(i);
        for (; o !== null; ) X = o, Jh(o), o = o.sibling;
        X = i, io = l, nt = a;
      }
      Uc(e);
    } else i.subtreeFlags & 8772 && o !== null ? (o.return = i, X = o) : Uc(e);
  }
}
function Uc(e) {
  for (; X !== null; ) {
    var t = X;
    if (t.flags & 8772) {
      var n = t.alternate;
      try {
        if (t.flags & 8772) switch (t.tag) {
          case 0:
          case 11:
          case 15:
            nt || Rs(5, t);
            break;
          case 1:
            var r = t.stateNode;
            if (t.flags & 4 && !nt) if (n === null) r.componentDidMount();
            else {
              var i = t.elementType === t.type ? n.memoizedProps : zt(t.type, n.memoizedProps);
              r.componentDidUpdate(i, n.memoizedState, r.__reactInternalSnapshotBeforeUpdate);
            }
            var o = t.updateQueue;
            o !== null && Ec(t, o, r);
            break;
          case 3:
            var s = t.updateQueue;
            if (s !== null) {
              if (n = null, t.child !== null) switch (t.child.tag) {
                case 5:
                  n = t.child.stateNode;
                  break;
                case 1:
                  n = t.child.stateNode;
              }
              Ec(t, s, n);
            }
            break;
          case 5:
            var l = t.stateNode;
            if (n === null && t.flags & 4) {
              n = l;
              var u = t.memoizedProps;
              switch (t.type) {
                case "button":
                case "input":
                case "select":
                case "textarea":
                  u.autoFocus && n.focus();
                  break;
                case "img":
                  u.src && (n.src = u.src);
              }
            }
            break;
          case 6:
            break;
          case 4:
            break;
          case 12:
            break;
          case 13:
            if (t.memoizedState === null) {
              var a = t.alternate;
              if (a !== null) {
                var f = a.memoizedState;
                if (f !== null) {
                  var c = f.dehydrated;
                  c !== null && gi(c);
                }
              }
            }
            break;
          case 19:
          case 17:
          case 21:
          case 22:
          case 23:
          case 25:
            break;
          default:
            throw Error(k(163));
        }
        nt || t.flags & 512 && nu(t);
      } catch (d) {
        De(t, t.return, d);
      }
    }
    if (t === e) {
      X = null;
      break;
    }
    if (n = t.sibling, n !== null) {
      n.return = t.return, X = n;
      break;
    }
    X = t.return;
  }
}
function Bc(e) {
  for (; X !== null; ) {
    var t = X;
    if (t === e) {
      X = null;
      break;
    }
    var n = t.sibling;
    if (n !== null) {
      n.return = t.return, X = n;
      break;
    }
    X = t.return;
  }
}
function Oc(e) {
  for (; X !== null; ) {
    var t = X;
    try {
      switch (t.tag) {
        case 0:
        case 11:
        case 15:
          var n = t.return;
          try {
            Rs(4, t);
          } catch (u) {
            De(t, n, u);
          }
          break;
        case 1:
          var r = t.stateNode;
          if (typeof r.componentDidMount == "function") {
            var i = t.return;
            try {
              r.componentDidMount();
            } catch (u) {
              De(t, i, u);
            }
          }
          var o = t.return;
          try {
            nu(t);
          } catch (u) {
            De(t, o, u);
          }
          break;
        case 5:
          var s = t.return;
          try {
            nu(t);
          } catch (u) {
            De(t, s, u);
          }
      }
    } catch (u) {
      De(t, t.return, u);
    }
    if (t === e) {
      X = null;
      break;
    }
    var l = t.sibling;
    if (l !== null) {
      l.return = t.return, X = l;
      break;
    }
    X = t.return;
  }
}
var R0 = Math.ceil, ts = cn.ReactCurrentDispatcher, aa = cn.ReactCurrentOwner, kt = cn.ReactCurrentBatchConfig, he = 0, Ge = null, We = null, Ze = 0, wt = 0, vr = Dn(0), Xe = 0, Ti = null, Zn = 0, Ps = 0, ca = 0, ui = null, dt = null, fa = 0, Lr = 1 / 0, Qt = null, ns = !1, ou = null, An = null, oo = !1, Sn = null, rs = 0, ai = 0, su = null, Ao = -1, _o = 0;
function lt() {
  return he & 6 ? Ue() : Ao !== -1 ? Ao : Ao = Ue();
}
function _n(e) {
  return e.mode & 1 ? he & 2 && Ze !== 0 ? Ze & -Ze : l0.transition !== null ? (_o === 0 && (_o = zd()), _o) : (e = we, e !== 0 || (e = window.event, e = e === void 0 ? 16 : Xd(e.type)), e) : 1;
}
function Vt(e, t, n, r) {
  if (50 < ai) throw ai = 0, su = null, Error(k(185));
  Di(e, n, r), (!(he & 2) || e !== Ge) && (e === Ge && (!(he & 2) && (Ps |= n), Xe === 4 && vn(e, Ze)), gt(e, r), n === 1 && he === 0 && !(t.mode & 1) && (Lr = Ue() + 500, Ss && zn()));
}
function gt(e, t) {
  var n = e.callbackNode;
  lg(e, t);
  var r = Oo(e, e === Ge ? Ze : 0);
  if (r === 0) n !== null && Za(n), e.callbackNode = null, e.callbackPriority = 0;
  else if (t = r & -r, e.callbackPriority !== t) {
    if (n != null && Za(n), t === 1) e.tag === 0 ? s0(Wc.bind(null, e)) : ah(Wc.bind(null, e)), n0(function() {
      !(he & 6) && zn();
    }), n = null;
    else {
      switch (Ud(r)) {
        case 1:
          n = zu;
          break;
        case 4:
          n = Nd;
          break;
        case 16:
          n = Bo;
          break;
        case 536870912:
          n = Dd;
          break;
        default:
          n = Bo;
      }
      n = lm(n, em.bind(null, e));
    }
    e.callbackPriority = t, e.callbackNode = n;
  }
}
function em(e, t) {
  if (Ao = -1, _o = 0, he & 6) throw Error(k(327));
  var n = e.callbackNode;
  if (Mr() && e.callbackNode !== n) return null;
  var r = Oo(e, e === Ge ? Ze : 0);
  if (r === 0) return null;
  if (r & 30 || r & e.expiredLanes || t) t = is(e, r);
  else {
    t = r;
    var i = he;
    he |= 2;
    var o = nm();
    (Ge !== e || Ze !== t) && (Qt = null, Lr = Ue() + 500, Xn(e, t));
    do
      try {
        T0();
        break;
      } catch (l) {
        tm(e, l);
      }
    while (!0);
    qu(), ts.current = o, he = i, We !== null ? t = 0 : (Ge = null, Ze = 0, t = Xe);
  }
  if (t !== 0) {
    if (t === 2 && (i = Ll(e), i !== 0 && (r = i, t = lu(e, i))), t === 1) throw n = Ti, Xn(e, 0), vn(e, r), gt(e, Ue()), n;
    if (t === 6) vn(e, r);
    else {
      if (i = e.current.alternate, !(r & 30) && !P0(i) && (t = is(e, r), t === 2 && (o = Ll(e), o !== 0 && (r = o, t = lu(e, o))), t === 1)) throw n = Ti, Xn(e, 0), vn(e, r), gt(e, Ue()), n;
      switch (e.finishedWork = i, e.finishedLanes = r, t) {
        case 0:
        case 1:
          throw Error(k(345));
        case 2:
          On(e, dt, Qt);
          break;
        case 3:
          if (vn(e, r), (r & 130023424) === r && (t = fa + 500 - Ue(), 10 < t)) {
            if (Oo(e, 0) !== 0) break;
            if (i = e.suspendedLanes, (i & r) !== r) {
              lt(), e.pingedLanes |= e.suspendedLanes & i;
              break;
            }
            e.timeoutHandle = Wl(On.bind(null, e, dt, Qt), t);
            break;
          }
          On(e, dt, Qt);
          break;
        case 4:
          if (vn(e, r), (r & 4194240) === r) break;
          for (t = e.eventTimes, i = -1; 0 < r; ) {
            var s = 31 - Yt(r);
            o = 1 << s, s = t[s], s > i && (i = s), r &= ~o;
          }
          if (r = i, r = Ue() - r, r = (120 > r ? 120 : 480 > r ? 480 : 1080 > r ? 1080 : 1920 > r ? 1920 : 3e3 > r ? 3e3 : 4320 > r ? 4320 : 1960 * R0(r / 1960)) - r, 10 < r) {
            e.timeoutHandle = Wl(On.bind(null, e, dt, Qt), r);
            break;
          }
          On(e, dt, Qt);
          break;
        case 5:
          On(e, dt, Qt);
          break;
        default:
          throw Error(k(329));
      }
    }
  }
  return gt(e, Ue()), e.callbackNode === n ? em.bind(null, e) : null;
}
function lu(e, t) {
  var n = ui;
  return e.current.memoizedState.isDehydrated && (Xn(e, t).flags |= 256), e = is(e, t), e !== 2 && (t = dt, dt = n, t !== null && uu(t)), e;
}
function uu(e) {
  dt === null ? dt = e : dt.push.apply(dt, e);
}
function P0(e) {
  for (var t = e; ; ) {
    if (t.flags & 16384) {
      var n = t.updateQueue;
      if (n !== null && (n = n.stores, n !== null)) for (var r = 0; r < n.length; r++) {
        var i = n[r], o = i.getSnapshot;
        i = i.value;
        try {
          if (!Xt(o(), i)) return !1;
        } catch {
          return !1;
        }
      }
    }
    if (n = t.child, t.subtreeFlags & 16384 && n !== null) n.return = t, t = n;
    else {
      if (t === e) break;
      for (; t.sibling === null; ) {
        if (t.return === null || t.return === e) return !0;
        t = t.return;
      }
      t.sibling.return = t.return, t = t.sibling;
    }
  }
  return !0;
}
function vn(e, t) {
  for (t &= ~ca, t &= ~Ps, e.suspendedLanes |= t, e.pingedLanes &= ~t, e = e.expirationTimes; 0 < t; ) {
    var n = 31 - Yt(t), r = 1 << n;
    e[n] = -1, t &= ~r;
  }
}
function Wc(e) {
  if (he & 6) throw Error(k(327));
  Mr();
  var t = Oo(e, 0);
  if (!(t & 1)) return gt(e, Ue()), null;
  var n = is(e, t);
  if (e.tag !== 0 && n === 2) {
    var r = Ll(e);
    r !== 0 && (t = r, n = lu(e, r));
  }
  if (n === 1) throw n = Ti, Xn(e, 0), vn(e, t), gt(e, Ue()), n;
  if (n === 6) throw Error(k(345));
  return e.finishedWork = e.current.alternate, e.finishedLanes = t, On(e, dt, Qt), gt(e, Ue()), null;
}
function da(e, t) {
  var n = he;
  he |= 1;
  try {
    return e(t);
  } finally {
    he = n, he === 0 && (Lr = Ue() + 500, Ss && zn());
  }
}
function qn(e) {
  Sn !== null && Sn.tag === 0 && !(he & 6) && Mr();
  var t = he;
  he |= 1;
  var n = kt.transition, r = we;
  try {
    if (kt.transition = null, we = 1, e) return e();
  } finally {
    we = r, kt.transition = n, he = t, !(he & 6) && zn();
  }
}
function ha() {
  wt = vr.current, _e(vr);
}
function Xn(e, t) {
  e.finishedWork = null, e.finishedLanes = 0;
  var n = e.timeoutHandle;
  if (n !== -1 && (e.timeoutHandle = -1, t0(n)), We !== null) for (n = We.return; n !== null; ) {
    var r = n;
    switch ($u(r), r.tag) {
      case 1:
        r = r.type.childContextTypes, r != null && Ho();
        break;
      case 3:
        Ir(), _e(mt), _e(rt), na();
        break;
      case 5:
        ta(r);
        break;
      case 4:
        Ir();
        break;
      case 13:
        _e(be);
        break;
      case 19:
        _e(be);
        break;
      case 10:
        Ku(r.type._context);
        break;
      case 22:
      case 23:
        ha();
    }
    n = n.return;
  }
  if (Ge = e, We = e = kn(e.current, null), Ze = wt = t, Xe = 0, Ti = null, ca = Ps = Zn = 0, dt = ui = null, Yn !== null) {
    for (t = 0; t < Yn.length; t++) if (n = Yn[t], r = n.interleaved, r !== null) {
      n.interleaved = null;
      var i = r.next, o = n.pending;
      if (o !== null) {
        var s = o.next;
        o.next = i, r.next = s;
      }
      n.pending = r;
    }
    Yn = null;
  }
  return e;
}
function tm(e, t) {
  do {
    var n = We;
    try {
      if (qu(), Po.current = es, Jo) {
        for (var r = Le.memoizedState; r !== null; ) {
          var i = r.queue;
          i !== null && (i.pending = null), r = r.next;
        }
        Jo = !1;
      }
      if (jn = 0, He = Ve = Le = null, si = !1, Ri = 0, aa.current = null, n === null || n.return === null) {
        Xe = 1, Ti = t, We = null;
        break;
      }
      e: {
        var o = e, s = n.return, l = n, u = t;
        if (t = Ze, l.flags |= 32768, u !== null && typeof u == "object" && typeof u.then == "function") {
          var a = u, f = l, c = f.tag;
          if (!(f.mode & 1) && (c === 0 || c === 11 || c === 15)) {
            var d = f.alternate;
            d ? (f.updateQueue = d.updateQueue, f.memoizedState = d.memoizedState, f.lanes = d.lanes) : (f.updateQueue = null, f.memoizedState = null);
          }
          var h = Ac(s);
          if (h !== null) {
            h.flags &= -257, _c(h, s, l, o, t), h.mode & 1 && Tc(o, a, t), t = h, u = a;
            var g = t.updateQueue;
            if (g === null) {
              var y = /* @__PURE__ */ new Set();
              y.add(u), t.updateQueue = y;
            } else g.add(u);
            break e;
          } else {
            if (!(t & 1)) {
              Tc(o, a, t), ma();
              break e;
            }
            u = Error(k(426));
          }
        } else if (ke && l.mode & 1) {
          var x = Ac(s);
          if (x !== null) {
            !(x.flags & 65536) && (x.flags |= 256), _c(x, s, l, o, t), ju(br(u, l));
            break e;
          }
        }
        o = u = br(u, l), Xe !== 4 && (Xe = 2), ui === null ? ui = [o] : ui.push(o), o = s;
        do {
          switch (o.tag) {
            case 3:
              o.flags |= 65536, t &= -t, o.lanes |= t;
              var p = Uh(o, u, t);
              Sc(o, p);
              break e;
            case 1:
              l = u;
              var m = o.type, v = o.stateNode;
              if (!(o.flags & 128) && (typeof m.getDerivedStateFromError == "function" || v !== null && typeof v.componentDidCatch == "function" && (An === null || !An.has(v)))) {
                o.flags |= 65536, t &= -t, o.lanes |= t;
                var w = Bh(o, l, t);
                Sc(o, w);
                break e;
              }
          }
          o = o.return;
        } while (o !== null);
      }
      im(n);
    } catch (E) {
      t = E, We === n && n !== null && (We = n = n.return);
      continue;
    }
    break;
  } while (!0);
}
function nm() {
  var e = ts.current;
  return ts.current = es, e === null ? es : e;
}
function ma() {
  (Xe === 0 || Xe === 3 || Xe === 2) && (Xe = 4), Ge === null || !(Zn & 268435455) && !(Ps & 268435455) || vn(Ge, Ze);
}
function is(e, t) {
  var n = he;
  he |= 2;
  var r = nm();
  (Ge !== e || Ze !== t) && (Qt = null, Xn(e, t));
  do
    try {
      M0();
      break;
    } catch (i) {
      tm(e, i);
    }
  while (!0);
  if (qu(), he = n, ts.current = r, We !== null) throw Error(k(261));
  return Ge = null, Ze = 0, Xe;
}
function M0() {
  for (; We !== null; ) rm(We);
}
function T0() {
  for (; We !== null && !Qp(); ) rm(We);
}
function rm(e) {
  var t = sm(e.alternate, e, wt);
  e.memoizedProps = e.pendingProps, t === null ? im(e) : We = t, aa.current = null;
}
function im(e) {
  var t = e;
  do {
    var n = t.alternate;
    if (e = t.return, t.flags & 32768) {
      if (n = x0(n, t), n !== null) {
        n.flags &= 32767, We = n;
        return;
      }
      if (e !== null) e.flags |= 32768, e.subtreeFlags = 0, e.deletions = null;
      else {
        Xe = 6, We = null;
        return;
      }
    } else if (n = w0(n, t, wt), n !== null) {
      We = n;
      return;
    }
    if (t = t.sibling, t !== null) {
      We = t;
      return;
    }
    We = t = e;
  } while (t !== null);
  Xe === 0 && (Xe = 5);
}
function On(e, t, n) {
  var r = we, i = kt.transition;
  try {
    kt.transition = null, we = 1, A0(e, t, n, r);
  } finally {
    kt.transition = i, we = r;
  }
  return null;
}
function A0(e, t, n, r) {
  do
    Mr();
  while (Sn !== null);
  if (he & 6) throw Error(k(327));
  n = e.finishedWork;
  var i = e.finishedLanes;
  if (n === null) return null;
  if (e.finishedWork = null, e.finishedLanes = 0, n === e.current) throw Error(k(177));
  e.callbackNode = null, e.callbackPriority = 0;
  var o = n.lanes | n.childLanes;
  if (ug(e, o), e === Ge && (We = Ge = null, Ze = 0), !(n.subtreeFlags & 2064) && !(n.flags & 2064) || oo || (oo = !0, lm(Bo, function() {
    return Mr(), null;
  })), o = (n.flags & 15990) !== 0, n.subtreeFlags & 15990 || o) {
    o = kt.transition, kt.transition = null;
    var s = we;
    we = 1;
    var l = he;
    he |= 4, aa.current = null, E0(e, n), Qh(n, e), jg(Bl), Wo = !!Ul, Bl = Ul = null, e.current = n, C0(n), Jp(), he = l, we = s, kt.transition = o;
  } else e.current = n;
  if (oo && (oo = !1, Sn = e, rs = i), o = e.pendingLanes, o === 0 && (An = null), ng(n.stateNode), gt(e, Ue()), t !== null) for (r = e.onRecoverableError, n = 0; n < t.length; n++) i = t[n], r(i.value, { componentStack: i.stack, digest: i.digest });
  if (ns) throw ns = !1, e = ou, ou = null, e;
  return rs & 1 && e.tag !== 0 && Mr(), o = e.pendingLanes, o & 1 ? e === su ? ai++ : (ai = 0, su = e) : ai = 0, zn(), null;
}
function Mr() {
  if (Sn !== null) {
    var e = Ud(rs), t = kt.transition, n = we;
    try {
      if (kt.transition = null, we = 16 > e ? 16 : e, Sn === null) var r = !1;
      else {
        if (e = Sn, Sn = null, rs = 0, he & 6) throw Error(k(331));
        var i = he;
        for (he |= 4, X = e.current; X !== null; ) {
          var o = X, s = o.child;
          if (X.flags & 16) {
            var l = o.deletions;
            if (l !== null) {
              for (var u = 0; u < l.length; u++) {
                var a = l[u];
                for (X = a; X !== null; ) {
                  var f = X;
                  switch (f.tag) {
                    case 0:
                    case 11:
                    case 15:
                      li(8, f, o);
                  }
                  var c = f.child;
                  if (c !== null) c.return = f, X = c;
                  else for (; X !== null; ) {
                    f = X;
                    var d = f.sibling, h = f.return;
                    if (Zh(f), f === a) {
                      X = null;
                      break;
                    }
                    if (d !== null) {
                      d.return = h, X = d;
                      break;
                    }
                    X = h;
                  }
                }
              }
              var g = o.alternate;
              if (g !== null) {
                var y = g.child;
                if (y !== null) {
                  g.child = null;
                  do {
                    var x = y.sibling;
                    y.sibling = null, y = x;
                  } while (y !== null);
                }
              }
              X = o;
            }
          }
          if (o.subtreeFlags & 2064 && s !== null) s.return = o, X = s;
          else e: for (; X !== null; ) {
            if (o = X, o.flags & 2048) switch (o.tag) {
              case 0:
              case 11:
              case 15:
                li(9, o, o.return);
            }
            var p = o.sibling;
            if (p !== null) {
              p.return = o.return, X = p;
              break e;
            }
            X = o.return;
          }
        }
        var m = e.current;
        for (X = m; X !== null; ) {
          s = X;
          var v = s.child;
          if (s.subtreeFlags & 2064 && v !== null) v.return = s, X = v;
          else e: for (s = m; X !== null; ) {
            if (l = X, l.flags & 2048) try {
              switch (l.tag) {
                case 0:
                case 11:
                case 15:
                  Rs(9, l);
              }
            } catch (E) {
              De(l, l.return, E);
            }
            if (l === s) {
              X = null;
              break e;
            }
            var w = l.sibling;
            if (w !== null) {
              w.return = l.return, X = w;
              break e;
            }
            X = l.return;
          }
        }
        if (he = i, zn(), jt && typeof jt.onPostCommitFiberRoot == "function") try {
          jt.onPostCommitFiberRoot(gs, e);
        } catch {
        }
        r = !0;
      }
      return r;
    } finally {
      we = n, kt.transition = t;
    }
  }
  return !1;
}
function Yc(e, t, n) {
  t = br(n, t), t = Uh(e, t, 1), e = Tn(e, t, 1), t = lt(), e !== null && (Di(e, 1, t), gt(e, t));
}
function De(e, t, n) {
  if (e.tag === 3) Yc(e, e, n);
  else for (; t !== null; ) {
    if (t.tag === 3) {
      Yc(t, e, n);
      break;
    } else if (t.tag === 1) {
      var r = t.stateNode;
      if (typeof t.type.getDerivedStateFromError == "function" || typeof r.componentDidCatch == "function" && (An === null || !An.has(r))) {
        e = br(n, e), e = Bh(t, e, 1), t = Tn(t, e, 1), e = lt(), t !== null && (Di(t, 1, e), gt(t, e));
        break;
      }
    }
    t = t.return;
  }
}
function _0(e, t, n) {
  var r = e.pingCache;
  r !== null && r.delete(t), t = lt(), e.pingedLanes |= e.suspendedLanes & n, Ge === e && (Ze & n) === n && (Xe === 4 || Xe === 3 && (Ze & 130023424) === Ze && 500 > Ue() - fa ? Xn(e, 0) : ca |= n), gt(e, t);
}
function om(e, t) {
  t === 0 && (e.mode & 1 ? (t = Zi, Zi <<= 1, !(Zi & 130023424) && (Zi = 4194304)) : t = 1);
  var n = lt();
  e = un(e, t), e !== null && (Di(e, t, n), gt(e, n));
}
function k0(e) {
  var t = e.memoizedState, n = 0;
  t !== null && (n = t.retryLane), om(e, n);
}
function I0(e, t) {
  var n = 0;
  switch (e.tag) {
    case 13:
      var r = e.stateNode, i = e.memoizedState;
      i !== null && (n = i.retryLane);
      break;
    case 19:
      r = e.stateNode;
      break;
    default:
      throw Error(k(314));
  }
  r !== null && r.delete(t), om(e, n);
}
var sm;
sm = function(e, t, n) {
  if (e !== null) if (e.memoizedProps !== t.pendingProps || mt.current) ht = !0;
  else {
    if (!(e.lanes & n) && !(t.flags & 128)) return ht = !1, v0(e, t, n);
    ht = !!(e.flags & 131072);
  }
  else ht = !1, ke && t.flags & 1048576 && ch(t, jo, t.index);
  switch (t.lanes = 0, t.tag) {
    case 2:
      var r = t.type;
      To(e, t), e = t.pendingProps;
      var i = Ar(t, rt.current);
      Pr(t, n), i = ia(null, t, r, e, i, n);
      var o = oa();
      return t.flags |= 1, typeof i == "object" && i !== null && typeof i.render == "function" && i.$$typeof === void 0 ? (t.tag = 1, t.memoizedState = null, t.updateQueue = null, pt(r) ? (o = !0, Go(t)) : o = !1, t.memoizedState = i.state !== null && i.state !== void 0 ? i.state : null, Ju(t), i.updater = Cs, t.stateNode = i, i._reactInternals = t, jl(t, r, e, n), t = Kl(null, t, r, !0, o, n)) : (t.tag = 0, ke && o && Gu(t), ot(null, t, i, n), t = t.child), t;
    case 16:
      r = t.elementType;
      e: {
        switch (To(e, t), e = t.pendingProps, i = r._init, r = i(r._payload), t.type = r, i = t.tag = L0(r), e = zt(r, e), i) {
          case 0:
            t = ql(null, t, r, e, n);
            break e;
          case 1:
            t = bc(null, t, r, e, n);
            break e;
          case 11:
            t = kc(null, t, r, e, n);
            break e;
          case 14:
            t = Ic(null, t, r, zt(r.type, e), n);
            break e;
        }
        throw Error(k(
          306,
          r,
          ""
        ));
      }
      return t;
    case 0:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : zt(r, i), ql(e, t, r, i, n);
    case 1:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : zt(r, i), bc(e, t, r, i, n);
    case 3:
      e: {
        if (Vh(t), e === null) throw Error(k(387));
        r = t.pendingProps, o = t.memoizedState, i = o.element, gh(e, t), Ko(t, r, null, n);
        var s = t.memoizedState;
        if (r = s.element, o.isDehydrated) if (o = { element: r, isDehydrated: !1, cache: s.cache, pendingSuspenseBoundaries: s.pendingSuspenseBoundaries, transitions: s.transitions }, t.updateQueue.baseState = o, t.memoizedState = o, t.flags & 256) {
          i = br(Error(k(423)), t), t = Lc(e, t, r, n, i);
          break e;
        } else if (r !== i) {
          i = br(Error(k(424)), t), t = Lc(e, t, r, n, i);
          break e;
        } else for (xt = Mn(t.stateNode.containerInfo.firstChild), St = t, ke = !0, Bt = null, n = mh(t, null, r, n), t.child = n; n; ) n.flags = n.flags & -3 | 4096, n = n.sibling;
        else {
          if (_r(), r === i) {
            t = an(e, t, n);
            break e;
          }
          ot(e, t, r, n);
        }
        t = t.child;
      }
      return t;
    case 5:
      return yh(t), e === null && Hl(t), r = t.type, i = t.pendingProps, o = e !== null ? e.memoizedProps : null, s = i.children, Ol(r, i) ? s = null : o !== null && Ol(r, o) && (t.flags |= 32), Yh(e, t), ot(e, t, s, n), t.child;
    case 6:
      return e === null && Hl(t), null;
    case 13:
      return Xh(e, t, n);
    case 4:
      return ea(t, t.stateNode.containerInfo), r = t.pendingProps, e === null ? t.child = kr(t, null, r, n) : ot(e, t, r, n), t.child;
    case 11:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : zt(r, i), kc(e, t, r, i, n);
    case 7:
      return ot(e, t, t.pendingProps, n), t.child;
    case 8:
      return ot(e, t, t.pendingProps.children, n), t.child;
    case 12:
      return ot(e, t, t.pendingProps.children, n), t.child;
    case 10:
      e: {
        if (r = t.type._context, i = t.pendingProps, o = t.memoizedProps, s = i.value, Ce(Zo, r._currentValue), r._currentValue = s, o !== null) if (Xt(o.value, s)) {
          if (o.children === i.children && !mt.current) {
            t = an(e, t, n);
            break e;
          }
        } else for (o = t.child, o !== null && (o.return = t); o !== null; ) {
          var l = o.dependencies;
          if (l !== null) {
            s = o.child;
            for (var u = l.firstContext; u !== null; ) {
              if (u.context === r) {
                if (o.tag === 1) {
                  u = rn(-1, n & -n), u.tag = 2;
                  var a = o.updateQueue;
                  if (a !== null) {
                    a = a.shared;
                    var f = a.pending;
                    f === null ? u.next = u : (u.next = f.next, f.next = u), a.pending = u;
                  }
                }
                o.lanes |= n, u = o.alternate, u !== null && (u.lanes |= n), Gl(
                  o.return,
                  n,
                  t
                ), l.lanes |= n;
                break;
              }
              u = u.next;
            }
          } else if (o.tag === 10) s = o.type === t.type ? null : o.child;
          else if (o.tag === 18) {
            if (s = o.return, s === null) throw Error(k(341));
            s.lanes |= n, l = s.alternate, l !== null && (l.lanes |= n), Gl(s, n, t), s = o.sibling;
          } else s = o.child;
          if (s !== null) s.return = o;
          else for (s = o; s !== null; ) {
            if (s === t) {
              s = null;
              break;
            }
            if (o = s.sibling, o !== null) {
              o.return = s.return, s = o;
              break;
            }
            s = s.return;
          }
          o = s;
        }
        ot(e, t, i.children, n), t = t.child;
      }
      return t;
    case 9:
      return i = t.type, r = t.pendingProps.children, Pr(t, n), i = It(i), r = r(i), t.flags |= 1, ot(e, t, r, n), t.child;
    case 14:
      return r = t.type, i = zt(r, t.pendingProps), i = zt(r.type, i), Ic(e, t, r, i, n);
    case 15:
      return Oh(e, t, t.type, t.pendingProps, n);
    case 17:
      return r = t.type, i = t.pendingProps, i = t.elementType === r ? i : zt(r, i), To(e, t), t.tag = 1, pt(r) ? (e = !0, Go(t)) : e = !1, Pr(t, n), zh(t, r, i), jl(t, r, i, n), Kl(null, t, r, !0, e, n);
    case 19:
      return Hh(e, t, n);
    case 22:
      return Wh(e, t, n);
  }
  throw Error(k(156, t.tag));
};
function lm(e, t) {
  return Fd(e, t);
}
function b0(e, t, n, r) {
  this.tag = e, this.key = n, this.sibling = this.child = this.return = this.stateNode = this.type = this.elementType = null, this.index = 0, this.ref = null, this.pendingProps = t, this.dependencies = this.memoizedState = this.updateQueue = this.memoizedProps = null, this.mode = r, this.subtreeFlags = this.flags = 0, this.deletions = null, this.childLanes = this.lanes = 0, this.alternate = null;
}
function _t(e, t, n, r) {
  return new b0(e, t, n, r);
}
function pa(e) {
  return e = e.prototype, !(!e || !e.isReactComponent);
}
function L0(e) {
  if (typeof e == "function") return pa(e) ? 1 : 0;
  if (e != null) {
    if (e = e.$$typeof, e === Fu) return 11;
    if (e === Nu) return 14;
  }
  return 2;
}
function kn(e, t) {
  var n = e.alternate;
  return n === null ? (n = _t(e.tag, t, e.key, e.mode), n.elementType = e.elementType, n.type = e.type, n.stateNode = e.stateNode, n.alternate = e, e.alternate = n) : (n.pendingProps = t, n.type = e.type, n.flags = 0, n.subtreeFlags = 0, n.deletions = null), n.flags = e.flags & 14680064, n.childLanes = e.childLanes, n.lanes = e.lanes, n.child = e.child, n.memoizedProps = e.memoizedProps, n.memoizedState = e.memoizedState, n.updateQueue = e.updateQueue, t = e.dependencies, n.dependencies = t === null ? null : { lanes: t.lanes, firstContext: t.firstContext }, n.sibling = e.sibling, n.index = e.index, n.ref = e.ref, n;
}
function ko(e, t, n, r, i, o) {
  var s = 2;
  if (r = e, typeof e == "function") pa(e) && (s = 1);
  else if (typeof e == "string") s = 5;
  else e: switch (e) {
    case ur:
      return Hn(n.children, i, o, t);
    case Lu:
      s = 8, i |= 8;
      break;
    case vl:
      return e = _t(12, n, t, i | 2), e.elementType = vl, e.lanes = o, e;
    case wl:
      return e = _t(13, n, t, i), e.elementType = wl, e.lanes = o, e;
    case xl:
      return e = _t(19, n, t, i), e.elementType = xl, e.lanes = o, e;
    case yd:
      return Ms(n, i, o, t);
    default:
      if (typeof e == "object" && e !== null) switch (e.$$typeof) {
        case pd:
          s = 10;
          break e;
        case gd:
          s = 9;
          break e;
        case Fu:
          s = 11;
          break e;
        case Nu:
          s = 14;
          break e;
        case pn:
          s = 16, r = null;
          break e;
      }
      throw Error(k(130, e == null ? e : typeof e, ""));
  }
  return t = _t(s, n, t, i), t.elementType = e, t.type = r, t.lanes = o, t;
}
function Hn(e, t, n, r) {
  return e = _t(7, e, r, t), e.lanes = n, e;
}
function Ms(e, t, n, r) {
  return e = _t(22, e, r, t), e.elementType = yd, e.lanes = n, e.stateNode = { isHidden: !1 }, e;
}
function il(e, t, n) {
  return e = _t(6, e, null, t), e.lanes = n, e;
}
function ol(e, t, n) {
  return t = _t(4, e.children !== null ? e.children : [], e.key, t), t.lanes = n, t.stateNode = { containerInfo: e.containerInfo, pendingChildren: null, implementation: e.implementation }, t;
}
function F0(e, t, n, r, i) {
  this.tag = t, this.containerInfo = e, this.finishedWork = this.pingCache = this.current = this.pendingChildren = null, this.timeoutHandle = -1, this.callbackNode = this.pendingContext = this.context = null, this.callbackPriority = 0, this.eventTimes = Bs(0), this.expirationTimes = Bs(-1), this.entangledLanes = this.finishedLanes = this.mutableReadLanes = this.expiredLanes = this.pingedLanes = this.suspendedLanes = this.pendingLanes = 0, this.entanglements = Bs(0), this.identifierPrefix = r, this.onRecoverableError = i, this.mutableSourceEagerHydrationData = null;
}
function ga(e, t, n, r, i, o, s, l, u) {
  return e = new F0(e, t, n, l, u), t === 1 ? (t = 1, o === !0 && (t |= 8)) : t = 0, o = _t(3, null, null, t), e.current = o, o.stateNode = e, o.memoizedState = { element: r, isDehydrated: n, cache: null, transitions: null, pendingSuspenseBoundaries: null }, Ju(o), e;
}
function N0(e, t, n) {
  var r = 3 < arguments.length && arguments[3] !== void 0 ? arguments[3] : null;
  return { $$typeof: lr, key: r == null ? null : "" + r, children: e, containerInfo: t, implementation: n };
}
function um(e) {
  if (!e) return Ln;
  e = e._reactInternals;
  e: {
    if (Jn(e) !== e || e.tag !== 1) throw Error(k(170));
    var t = e;
    do {
      switch (t.tag) {
        case 3:
          t = t.stateNode.context;
          break e;
        case 1:
          if (pt(t.type)) {
            t = t.stateNode.__reactInternalMemoizedMergedChildContext;
            break e;
          }
      }
      t = t.return;
    } while (t !== null);
    throw Error(k(171));
  }
  if (e.tag === 1) {
    var n = e.type;
    if (pt(n)) return uh(e, n, t);
  }
  return t;
}
function am(e, t, n, r, i, o, s, l, u) {
  return e = ga(n, r, !0, e, i, o, s, l, u), e.context = um(null), n = e.current, r = lt(), i = _n(n), o = rn(r, i), o.callback = t ?? null, Tn(n, o, i), e.current.lanes = i, Di(e, i, r), gt(e, r), e;
}
function Ts(e, t, n, r) {
  var i = t.current, o = lt(), s = _n(i);
  return n = um(n), t.context === null ? t.context = n : t.pendingContext = n, t = rn(o, s), t.payload = { element: e }, r = r === void 0 ? null : r, r !== null && (t.callback = r), e = Tn(i, t, s), e !== null && (Vt(e, i, s, o), Ro(e, i, s)), s;
}
function os(e) {
  if (e = e.current, !e.child) return null;
  switch (e.child.tag) {
    case 5:
      return e.child.stateNode;
    default:
      return e.child.stateNode;
  }
}
function Vc(e, t) {
  if (e = e.memoizedState, e !== null && e.dehydrated !== null) {
    var n = e.retryLane;
    e.retryLane = n !== 0 && n < t ? n : t;
  }
}
function ya(e, t) {
  Vc(e, t), (e = e.alternate) && Vc(e, t);
}
function D0() {
  return null;
}
var cm = typeof reportError == "function" ? reportError : function(e) {
  console.error(e);
};
function va(e) {
  this._internalRoot = e;
}
As.prototype.render = va.prototype.render = function(e) {
  var t = this._internalRoot;
  if (t === null) throw Error(k(409));
  Ts(e, t, null, null);
};
As.prototype.unmount = va.prototype.unmount = function() {
  var e = this._internalRoot;
  if (e !== null) {
    this._internalRoot = null;
    var t = e.containerInfo;
    qn(function() {
      Ts(null, e, null, null);
    }), t[ln] = null;
  }
};
function As(e) {
  this._internalRoot = e;
}
As.prototype.unstable_scheduleHydration = function(e) {
  if (e) {
    var t = Wd();
    e = { blockedOn: null, target: e, priority: t };
    for (var n = 0; n < yn.length && t !== 0 && t < yn[n].priority; n++) ;
    yn.splice(n, 0, e), n === 0 && Vd(e);
  }
};
function wa(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11);
}
function _s(e) {
  return !(!e || e.nodeType !== 1 && e.nodeType !== 9 && e.nodeType !== 11 && (e.nodeType !== 8 || e.nodeValue !== " react-mount-point-unstable "));
}
function Xc() {
}
function z0(e, t, n, r, i) {
  if (i) {
    if (typeof r == "function") {
      var o = r;
      r = function() {
        var a = os(s);
        o.call(a);
      };
    }
    var s = am(t, r, e, 0, null, !1, !1, "", Xc);
    return e._reactRootContainer = s, e[ln] = s.current, wi(e.nodeType === 8 ? e.parentNode : e), qn(), s;
  }
  for (; i = e.lastChild; ) e.removeChild(i);
  if (typeof r == "function") {
    var l = r;
    r = function() {
      var a = os(u);
      l.call(a);
    };
  }
  var u = ga(e, 0, !1, null, null, !1, !1, "", Xc);
  return e._reactRootContainer = u, e[ln] = u.current, wi(e.nodeType === 8 ? e.parentNode : e), qn(function() {
    Ts(t, u, n, r);
  }), u;
}
function ks(e, t, n, r, i) {
  var o = n._reactRootContainer;
  if (o) {
    var s = o;
    if (typeof i == "function") {
      var l = i;
      i = function() {
        var u = os(s);
        l.call(u);
      };
    }
    Ts(t, s, e, i);
  } else s = z0(n, t, e, i, r);
  return os(s);
}
Bd = function(e) {
  switch (e.tag) {
    case 3:
      var t = e.stateNode;
      if (t.current.memoizedState.isDehydrated) {
        var n = Qr(t.pendingLanes);
        n !== 0 && (Uu(t, n | 1), gt(t, Ue()), !(he & 6) && (Lr = Ue() + 500, zn()));
      }
      break;
    case 13:
      qn(function() {
        var r = un(e, 1);
        if (r !== null) {
          var i = lt();
          Vt(r, e, 1, i);
        }
      }), ya(e, 1);
  }
};
Bu = function(e) {
  if (e.tag === 13) {
    var t = un(e, 134217728);
    if (t !== null) {
      var n = lt();
      Vt(t, e, 134217728, n);
    }
    ya(e, 134217728);
  }
};
Od = function(e) {
  if (e.tag === 13) {
    var t = _n(e), n = un(e, t);
    if (n !== null) {
      var r = lt();
      Vt(n, e, t, r);
    }
    ya(e, t);
  }
};
Wd = function() {
  return we;
};
Yd = function(e, t) {
  var n = we;
  try {
    return we = e, t();
  } finally {
    we = n;
  }
};
kl = function(e, t, n) {
  switch (t) {
    case "input":
      if (Cl(e, n), t = n.name, n.type === "radio" && t != null) {
        for (n = e; n.parentNode; ) n = n.parentNode;
        for (n = n.querySelectorAll("input[name=" + JSON.stringify("" + t) + '][type="radio"]'), t = 0; t < n.length; t++) {
          var r = n[t];
          if (r !== e && r.form === e.form) {
            var i = xs(r);
            if (!i) throw Error(k(90));
            wd(r), Cl(r, i);
          }
        }
      }
      break;
    case "textarea":
      Sd(e, n);
      break;
    case "select":
      t = n.value, t != null && Sr(e, !!n.multiple, t, !1);
  }
};
Ad = da;
_d = qn;
var U0 = { usingClientEntryPoint: !1, Events: [Ui, dr, xs, Md, Td, da] }, $r = { findFiberByHostInstance: Wn, bundleType: 0, version: "18.3.1", rendererPackageName: "react-dom" }, B0 = { bundleType: $r.bundleType, version: $r.version, rendererPackageName: $r.rendererPackageName, rendererConfig: $r.rendererConfig, overrideHookState: null, overrideHookStateDeletePath: null, overrideHookStateRenamePath: null, overrideProps: null, overridePropsDeletePath: null, overridePropsRenamePath: null, setErrorHandler: null, setSuspenseHandler: null, scheduleUpdate: null, currentDispatcherRef: cn.ReactCurrentDispatcher, findHostInstanceByFiber: function(e) {
  return e = bd(e), e === null ? null : e.stateNode;
}, findFiberByHostInstance: $r.findFiberByHostInstance || D0, findHostInstancesForRefresh: null, scheduleRefresh: null, scheduleRoot: null, setRefreshHandler: null, getCurrentFiber: null, reconcilerVersion: "18.3.1-next-f1338f8080-20240426" };
if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ < "u") {
  var so = __REACT_DEVTOOLS_GLOBAL_HOOK__;
  if (!so.isDisabled && so.supportsFiber) try {
    gs = so.inject(B0), jt = so;
  } catch {
  }
}
Ct.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = U0;
Ct.createPortal = function(e, t) {
  var n = 2 < arguments.length && arguments[2] !== void 0 ? arguments[2] : null;
  if (!wa(t)) throw Error(k(200));
  return N0(e, t, null, n);
};
Ct.createRoot = function(e, t) {
  if (!wa(e)) throw Error(k(299));
  var n = !1, r = "", i = cm;
  return t != null && (t.unstable_strictMode === !0 && (n = !0), t.identifierPrefix !== void 0 && (r = t.identifierPrefix), t.onRecoverableError !== void 0 && (i = t.onRecoverableError)), t = ga(e, 1, !1, null, null, n, !1, r, i), e[ln] = t.current, wi(e.nodeType === 8 ? e.parentNode : e), new va(t);
};
Ct.findDOMNode = function(e) {
  if (e == null) return null;
  if (e.nodeType === 1) return e;
  var t = e._reactInternals;
  if (t === void 0)
    throw typeof e.render == "function" ? Error(k(188)) : (e = Object.keys(e).join(","), Error(k(268, e)));
  return e = bd(t), e = e === null ? null : e.stateNode, e;
};
Ct.flushSync = function(e) {
  return qn(e);
};
Ct.hydrate = function(e, t, n) {
  if (!_s(t)) throw Error(k(200));
  return ks(null, e, t, !0, n);
};
Ct.hydrateRoot = function(e, t, n) {
  if (!wa(e)) throw Error(k(405));
  var r = n != null && n.hydratedSources || null, i = !1, o = "", s = cm;
  if (n != null && (n.unstable_strictMode === !0 && (i = !0), n.identifierPrefix !== void 0 && (o = n.identifierPrefix), n.onRecoverableError !== void 0 && (s = n.onRecoverableError)), t = am(t, null, e, 1, n ?? null, i, !1, o, s), e[ln] = t.current, wi(e), r) for (e = 0; e < r.length; e++) n = r[e], i = n._getVersion, i = i(n._source), t.mutableSourceEagerHydrationData == null ? t.mutableSourceEagerHydrationData = [n, i] : t.mutableSourceEagerHydrationData.push(
    n,
    i
  );
  return new As(t);
};
Ct.render = function(e, t, n) {
  if (!_s(t)) throw Error(k(200));
  return ks(null, e, t, !1, n);
};
Ct.unmountComponentAtNode = function(e) {
  if (!_s(e)) throw Error(k(40));
  return e._reactRootContainer ? (qn(function() {
    ks(null, null, e, !1, function() {
      e._reactRootContainer = null, e[ln] = null;
    });
  }), !0) : !1;
};
Ct.unstable_batchedUpdates = da;
Ct.unstable_renderSubtreeIntoContainer = function(e, t, n, r) {
  if (!_s(n)) throw Error(k(200));
  if (e == null || e._reactInternals === void 0) throw Error(k(38));
  return ks(e, t, n, !1, r);
};
Ct.version = "18.3.1-next-f1338f8080-20240426";
function fm() {
  if (!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ > "u" || typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE != "function"))
    try {
      __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(fm);
    } catch (e) {
      console.error(e);
    }
}
fm(), fd.exports = Ct;
var O0 = fd.exports, Hc = O0;
gl.createRoot = Hc.createRoot, gl.hydrateRoot = Hc.hydrateRoot;
function Gc(e, t, n) {
  const r = e.createShader(t);
  if (!r)
    throw new Error("Failed to create shader.");
  if (e.shaderSource(r, n), e.compileShader(r), !e.getShaderParameter(r, e.COMPILE_STATUS)) {
    const o = e.getShaderInfoLog(r) ?? "unknown shader error";
    throw e.deleteShader(r), new Error(o);
  }
  return r;
}
function Ai(e, t, n) {
  const r = Gc(e, e.VERTEX_SHADER, t), i = Gc(e, e.FRAGMENT_SHADER, n), o = e.createProgram();
  if (!o)
    throw e.deleteShader(r), e.deleteShader(i), new Error("Failed to create program.");
  if (e.attachShader(o, r), e.attachShader(o, i), e.linkProgram(o), e.deleteShader(r), e.deleteShader(i), !e.getProgramParameter(o, e.LINK_STATUS)) {
    const l = e.getProgramInfoLog(o) ?? "unknown link error";
    throw e.deleteProgram(o), new Error(l);
  }
  return o;
}
function st(e, t, n) {
  const r = e.getUniformLocation(t, n);
  if (!r)
    throw new Error(`Failed to get uniform location: ${n}`);
  return r;
}
function W0(e) {
  const t = e.getContext("webgl2", {
    alpha: !1,
    antialias: !1,
    depth: !1,
    stencil: !1,
    preserveDrawingBuffer: !1,
    powerPreference: "high-performance"
  });
  if (!t)
    throw new Error("WebGL2 is not available.");
  return t;
}
function sl(e) {
  return e * Math.PI / 180;
}
class dm {
  constructor() {
    R(this, "viewportWidth", 1);
    R(this, "viewportHeight", 1);
    R(this, "viewState", {
      offsetX: 0,
      offsetY: 0,
      zoom: 1,
      rotationDeg: 0
    });
  }
  setViewport(t, n) {
    this.viewportWidth = Math.max(1, t), this.viewportHeight = Math.max(1, n);
  }
  getViewportSize() {
    return {
      width: this.viewportWidth,
      height: this.viewportHeight
    };
  }
  setViewState(t) {
    t.offsetX !== void 0 && (this.viewState.offsetX = t.offsetX), t.offsetY !== void 0 && (this.viewState.offsetY = t.offsetY), t.zoom !== void 0 && (this.viewState.zoom = Math.max(1e-4, t.zoom)), typeof t.rotationDeg == "number" && Number.isFinite(t.rotationDeg) && (this.viewState.rotationDeg = t.rotationDeg);
  }
  getViewState() {
    return { ...this.viewState };
  }
  getCenter() {
    const t = Math.max(1e-6, this.viewState.zoom);
    return [
      this.viewState.offsetX + this.viewportWidth / (2 * t),
      this.viewState.offsetY + this.viewportHeight / (2 * t)
    ];
  }
  setCenter(t, n) {
    const r = Math.max(1e-6, this.viewState.zoom);
    this.viewState.offsetX = t - this.viewportWidth / (2 * r), this.viewState.offsetY = n - this.viewportHeight / (2 * r);
  }
  screenToWorld(t, n) {
    const r = Math.max(1e-6, this.viewState.zoom), [i, o] = this.getCenter(), s = this.viewState.rotationDeg ?? 0, l = (t - this.viewportWidth * 0.5) / r, u = (n - this.viewportHeight * 0.5) / r, a = sl(s), f = Math.cos(a), c = Math.sin(a);
    return [i + l * f - u * c, o + l * c + u * f];
  }
  worldToScreen(t, n) {
    const r = Math.max(1e-6, this.viewState.zoom), [i, o] = this.getCenter(), s = this.viewState.rotationDeg ?? 0, l = t - i, u = n - o, a = sl(s), f = Math.cos(a), c = Math.sin(a), d = l * f + u * c, h = -l * c + u * f;
    return [
      this.viewportWidth * 0.5 + d * r,
      this.viewportHeight * 0.5 + h * r
    ];
  }
  getViewCorners() {
    const t = this.viewportWidth, n = this.viewportHeight;
    return [
      this.screenToWorld(0, 0),
      this.screenToWorld(t, 0),
      this.screenToWorld(t, n),
      this.screenToWorld(0, n)
    ];
  }
  getMatrix() {
    const t = Math.max(1e-6, this.viewState.zoom), n = this.viewState.rotationDeg ?? 0;
    if (n === 0) {
      const g = this.viewportWidth / t, y = this.viewportHeight / t, x = 2 / g, p = -2 / y, m = -1 - this.viewState.offsetX * x, v = 1 - this.viewState.offsetY * p;
      return new Float32Array([x, 0, 0, 0, p, 0, m, v, 1]);
    }
    const [r, i] = this.getCenter(), o = sl(n), s = Math.cos(o), l = Math.sin(o), u = 2 * t * s / this.viewportWidth, a = 2 * t * l / this.viewportWidth, f = 2 * t * l / this.viewportHeight, c = -2 * t * s / this.viewportHeight, d = -(u * r + a * i), h = -(f * r + c * i);
    return new Float32Array([u, f, 0, a, c, 0, d, h, 1]);
  }
}
const Y0 = `#version 300 es
precision highp float;

in vec2 aUnit;
in vec2 aUv;

uniform mat3 uCamera;
uniform vec4 uBounds;

out vec2 vUv;

void main() {
  vec2 world = vec2(
    mix(uBounds.x, uBounds.z, aUnit.x),
    mix(uBounds.y, uBounds.w, aUnit.y)
  );
  vec3 clip = uCamera * vec3(world, 1.0);
  gl_Position = vec4(clip.xy, 0.0, 1.0);
  vUv = aUv;
}
`, V0 = `#version 300 es
precision highp float;

in vec2 vUv;
uniform sampler2D uTexture;

out vec4 outColor;

void main() {
  outColor = texture(uTexture, vUv);
}
`;
class hm {
  constructor(t) {
    R(this, "canvas");
    R(this, "gl");
    R(this, "camera", new dm());
    R(this, "imageWidth");
    R(this, "imageHeight");
    R(this, "clearColor");
    R(this, "program");
    R(this, "vao");
    R(this, "quadBuffer");
    R(this, "uCameraLocation");
    R(this, "uBoundsLocation");
    R(this, "uTextureLocation");
    R(this, "resizeObserver");
    R(this, "tiles", []);
    R(this, "frameId", null);
    R(this, "loadVersion", 0);
    R(this, "destroyed", !1);
    R(this, "fitted", !1);
    R(this, "controlledViewState", !1);
    this.canvas = t.canvas, this.imageWidth = Math.max(1, t.imageWidth), this.imageHeight = Math.max(1, t.imageHeight), this.clearColor = t.clearColor ?? [0.03, 0.05, 0.08, 1], this.gl = W0(this.canvas), this.program = Ai(this.gl, Y0, V0);
    const n = this.gl.createVertexArray(), r = this.gl.createBuffer();
    if (!n || !r)
      throw new Error("Failed to create WebGL buffers.");
    this.vao = n, this.quadBuffer = r, this.gl.bindVertexArray(this.vao), this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.quadBuffer);
    const i = new Float32Array([
      0,
      0,
      0,
      0,
      1,
      0,
      1,
      0,
      0,
      1,
      0,
      1,
      1,
      1,
      1,
      1
    ]);
    this.gl.bufferData(this.gl.ARRAY_BUFFER, i, this.gl.STATIC_DRAW);
    const o = this.gl.getAttribLocation(this.program, "aUnit"), s = this.gl.getAttribLocation(this.program, "aUv");
    if (o < 0 || s < 0)
      throw new Error("Failed to get attribute locations.");
    const l = 4 * Float32Array.BYTES_PER_ELEMENT;
    this.gl.enableVertexAttribArray(o), this.gl.vertexAttribPointer(
      o,
      2,
      this.gl.FLOAT,
      !1,
      l,
      0
    ), this.gl.enableVertexAttribArray(s), this.gl.vertexAttribPointer(
      s,
      2,
      this.gl.FLOAT,
      !1,
      l,
      2 * Float32Array.BYTES_PER_ELEMENT
    ), this.gl.bindVertexArray(null), this.gl.bindBuffer(this.gl.ARRAY_BUFFER, null), this.uCameraLocation = st(
      this.gl,
      this.program,
      "uCamera"
    ), this.uBoundsLocation = st(
      this.gl,
      this.program,
      "uBounds"
    ), this.uTextureLocation = st(
      this.gl,
      this.program,
      "uTexture"
    ), t.initialViewState && (this.controlledViewState = !0, this.camera.setViewState(t.initialViewState)), this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    }), this.resizeObserver.observe(this.canvas), this.resize();
  }
  async setTiles(t) {
    if (this.destroyed)
      return;
    const n = ++this.loadVersion, r = await Promise.all(
      t.map(async (i) => await this.loadTile(i, n))
    );
    if (this.destroyed || n !== this.loadVersion) {
      for (const i of r)
        i && this.gl.deleteTexture(i.texture);
      return;
    }
    this.disposeTiles(this.tiles), this.tiles = r.filter((i) => i !== null), this.requestRender();
  }
  setViewState(t) {
    this.controlledViewState = !0, this.camera.setViewState(t), this.requestRender();
  }
  getViewState() {
    return this.camera.getViewState();
  }
  destroy() {
    this.destroyed || (this.destroyed = !0, this.loadVersion += 1, this.frameId !== null && (cancelAnimationFrame(this.frameId), this.frameId = null), this.resizeObserver.disconnect(), this.disposeTiles(this.tiles), this.tiles = [], this.gl.deleteBuffer(this.quadBuffer), this.gl.deleteVertexArray(this.vao), this.gl.deleteProgram(this.program));
  }
  async loadTile(t, n) {
    try {
      const r = await fetch(t.url);
      if (!r.ok)
        throw new Error(
          `Tile fetch failed: ${r.status} ${r.statusText}`
        );
      const i = await r.blob(), o = await createImageBitmap(i);
      if (this.destroyed || n !== this.loadVersion)
        return o.close(), null;
      const s = this.gl.createTexture();
      if (!s)
        throw o.close(), new Error("Failed to create tile texture.");
      return this.gl.bindTexture(this.gl.TEXTURE_2D, s), this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1), this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      ), this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      ), this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR
      ), this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.LINEAR
      ), this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        o
      ), this.gl.bindTexture(this.gl.TEXTURE_2D, null), o.close(), {
        id: t.id,
        bounds: t.bounds,
        texture: s
      };
    } catch (r) {
      return console.error(`[M1TileRenderer] tile load failed: ${t.id}`, r), null;
    }
  }
  resize() {
    if (this.destroyed)
      return;
    const t = this.canvas.getBoundingClientRect(), n = Math.max(1, t.width || this.canvas.clientWidth || 1), r = Math.max(1, t.height || this.canvas.clientHeight || 1), i = Math.max(1, window.devicePixelRatio || 1), o = Math.max(1, Math.round(n * i)), s = Math.max(1, Math.round(r * i));
    (this.canvas.width !== o || this.canvas.height !== s) && (this.canvas.width = o, this.canvas.height = s), this.camera.setViewport(n, r), this.gl.viewport(0, 0, this.canvas.width, this.canvas.height), !this.fitted && !this.controlledViewState && (this.fitToImage(), this.fitted = !0), this.requestRender();
  }
  fitToImage() {
    const t = this.camera.getViewportSize(), n = Math.min(
      t.width / this.imageWidth,
      t.height / this.imageHeight
    ), r = Number.isFinite(n) && n > 0 ? n : 1, i = t.width / r, o = t.height / r, s = (this.imageWidth - i) * 0.5, l = (this.imageHeight - o) * 0.5;
    this.camera.setViewState({
      zoom: r,
      offsetX: s,
      offsetY: l
    });
  }
  requestRender() {
    this.frameId !== null || this.destroyed || (this.frameId = requestAnimationFrame(() => {
      this.frameId = null, this.render();
    }));
  }
  render() {
    if (!this.destroyed) {
      this.gl.clearColor(
        this.clearColor[0],
        this.clearColor[1],
        this.clearColor[2],
        this.clearColor[3]
      ), this.gl.clear(this.gl.COLOR_BUFFER_BIT), this.gl.useProgram(this.program), this.gl.bindVertexArray(this.vao), this.gl.uniformMatrix3fv(
        this.uCameraLocation,
        !1,
        this.camera.getMatrix()
      ), this.gl.uniform1i(this.uTextureLocation, 0);
      for (const t of this.tiles)
        this.gl.activeTexture(this.gl.TEXTURE0), this.gl.bindTexture(this.gl.TEXTURE_2D, t.texture), this.gl.uniform4f(
          this.uBoundsLocation,
          t.bounds[0],
          t.bounds[1],
          t.bounds[2],
          t.bounds[3]
        ), this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);
      this.gl.bindTexture(this.gl.TEXTURE_2D, null), this.gl.bindVertexArray(null);
    }
  }
  disposeTiles(t) {
    for (const n of t)
      this.gl.deleteTexture(n.texture);
  }
}
class Fn {
  constructor(t, n) {
    this.next = null, this.key = t, this.data = n, this.left = null, this.right = null;
  }
}
function X0(e, t) {
  return e > t ? 1 : e < t ? -1 : 0;
}
function wn(e, t, n) {
  const r = new Fn(null, null);
  let i = r, o = r;
  for (; ; ) {
    const s = n(e, t.key);
    if (s < 0) {
      if (t.left === null) break;
      if (n(e, t.left.key) < 0) {
        const l = t.left;
        if (t.left = l.right, l.right = t, t = l, t.left === null) break;
      }
      o.left = t, o = t, t = t.left;
    } else if (s > 0) {
      if (t.right === null) break;
      if (n(e, t.right.key) > 0) {
        const l = t.right;
        if (t.right = l.left, l.left = t, t = l, t.right === null) break;
      }
      i.right = t, i = t, t = t.right;
    } else break;
  }
  return i.right = t.left, o.left = t.right, t.left = r.right, t.right = r.left, t;
}
function ll(e, t, n, r) {
  const i = new Fn(e, t);
  if (n === null)
    return i.left = i.right = null, i;
  n = wn(e, n, r);
  const o = r(e, n.key);
  return o < 0 ? (i.left = n.left, i.right = n, n.left = null) : o >= 0 && (i.right = n.right, i.left = n, n.right = null), i;
}
function $c(e, t, n) {
  let r = null, i = null;
  if (t) {
    t = wn(e, t, n);
    const o = n(t.key, e);
    o === 0 ? (r = t.left, i = t.right) : o < 0 ? (i = t.right, t.right = null, r = t) : (r = t.left, t.left = null, i = t);
  }
  return { left: r, right: i };
}
function H0(e, t, n) {
  return t === null ? e : (e === null || (t = wn(e.key, t, n), t.left = e), t);
}
function au(e, t, n, r, i) {
  if (e) {
    r(`${t}${n ? "└── " : "├── "}${i(e)}
`);
    const o = t + (n ? "    " : "│   ");
    e.left && au(e.left, o, !1, r, i), e.right && au(e.right, o, !0, r, i);
  }
}
class xa {
  constructor(t = X0) {
    this._root = null, this._size = 0, this._comparator = t;
  }
  /**
   * Inserts a key, allows duplicates
   */
  insert(t, n) {
    return this._size++, this._root = ll(t, n, this._root, this._comparator);
  }
  /**
   * Adds a key, if it is not present in the tree
   */
  add(t, n) {
    const r = new Fn(t, n);
    this._root === null && (r.left = r.right = null, this._size++, this._root = r);
    const i = this._comparator, o = wn(t, this._root, i), s = i(t, o.key);
    return s === 0 ? this._root = o : (s < 0 ? (r.left = o.left, r.right = o, o.left = null) : s > 0 && (r.right = o.right, r.left = o, o.right = null), this._size++, this._root = r), this._root;
  }
  /**
   * @param  {Key} key
   * @return {Node|null}
   */
  remove(t) {
    this._root = this._remove(t, this._root, this._comparator);
  }
  /**
   * Deletes i from the tree if it's there
   */
  _remove(t, n, r) {
    let i;
    return n === null ? null : (n = wn(t, n, r), r(t, n.key) === 0 ? (n.left === null ? i = n.right : (i = wn(t, n.left, r), i.right = n.right), this._size--, i) : n);
  }
  /**
   * Removes and returns the node with smallest key
   */
  pop() {
    let t = this._root;
    if (t) {
      for (; t.left; ) t = t.left;
      return this._root = wn(t.key, this._root, this._comparator), this._root = this._remove(t.key, this._root, this._comparator), { key: t.key, data: t.data };
    }
    return null;
  }
  /**
   * Find without splaying
   */
  findStatic(t) {
    let n = this._root;
    const r = this._comparator;
    for (; n; ) {
      const i = r(t, n.key);
      if (i === 0) return n;
      i < 0 ? n = n.left : n = n.right;
    }
    return null;
  }
  find(t) {
    return this._root && (this._root = wn(t, this._root, this._comparator), this._comparator(t, this._root.key) !== 0) ? null : this._root;
  }
  contains(t) {
    let n = this._root;
    const r = this._comparator;
    for (; n; ) {
      const i = r(t, n.key);
      if (i === 0) return !0;
      i < 0 ? n = n.left : n = n.right;
    }
    return !1;
  }
  forEach(t, n) {
    let r = this._root;
    const i = [];
    let o = !1;
    for (; !o; )
      r !== null ? (i.push(r), r = r.left) : i.length !== 0 ? (r = i.pop(), t.call(n, r), r = r.right) : o = !0;
    return this;
  }
  /**
   * Walk key range from `low` to `high`. Stops if `fn` returns a value.
   */
  range(t, n, r, i) {
    const o = [], s = this._comparator;
    let l = this._root, u;
    for (; o.length !== 0 || l; )
      if (l)
        o.push(l), l = l.left;
      else {
        if (l = o.pop(), u = s(l.key, n), u > 0)
          break;
        if (s(l.key, t) >= 0 && r.call(i, l))
          return this;
        l = l.right;
      }
    return this;
  }
  /**
   * Returns array of keys
   */
  keys() {
    const t = [];
    return this.forEach(({ key: n }) => {
      t.push(n);
    }), t;
  }
  /**
   * Returns array of all the data in the nodes
   */
  values() {
    const t = [];
    return this.forEach(({ data: n }) => {
      t.push(n);
    }), t;
  }
  min() {
    return this._root ? this.minNode(this._root).key : null;
  }
  max() {
    return this._root ? this.maxNode(this._root).key : null;
  }
  minNode(t = this._root) {
    if (t) for (; t.left; ) t = t.left;
    return t;
  }
  maxNode(t = this._root) {
    if (t) for (; t.right; ) t = t.right;
    return t;
  }
  /**
   * Returns node at given index
   */
  at(t) {
    let n = this._root, r = !1, i = 0;
    const o = [];
    for (; !r; )
      if (n)
        o.push(n), n = n.left;
      else if (o.length > 0) {
        if (n = o.pop(), i === t) return n;
        i++, n = n.right;
      } else r = !0;
    return null;
  }
  next(t) {
    let n = this._root, r = null;
    if (t.right) {
      for (r = t.right; r.left; ) r = r.left;
      return r;
    }
    const i = this._comparator;
    for (; n; ) {
      const o = i(t.key, n.key);
      if (o === 0) break;
      o < 0 ? (r = n, n = n.left) : n = n.right;
    }
    return r;
  }
  prev(t) {
    let n = this._root, r = null;
    if (t.left !== null) {
      for (r = t.left; r.right; ) r = r.right;
      return r;
    }
    const i = this._comparator;
    for (; n; ) {
      const o = i(t.key, n.key);
      if (o === 0) break;
      o < 0 ? n = n.left : (r = n, n = n.right);
    }
    return r;
  }
  clear() {
    return this._root = null, this._size = 0, this;
  }
  toList() {
    return $0(this._root);
  }
  /**
   * Bulk-load items. Both array have to be same size
   */
  load(t, n = [], r = !1) {
    let i = t.length;
    const o = this._comparator;
    if (r && du(t, n, 0, i - 1, o), this._root === null)
      this._root = cu(t, n, 0, i), this._size = i;
    else {
      const s = j0(
        this.toList(),
        G0(t, n),
        o
      );
      i = this._size + i, this._root = fu({ head: s }, 0, i);
    }
    return this;
  }
  isEmpty() {
    return this._root === null;
  }
  get size() {
    return this._size;
  }
  get root() {
    return this._root;
  }
  toString(t = (n) => String(n.key)) {
    const n = [];
    return au(this._root, "", !0, (r) => n.push(r), t), n.join("");
  }
  update(t, n, r) {
    const i = this._comparator;
    let { left: o, right: s } = $c(t, this._root, i);
    i(t, n) < 0 ? s = ll(n, r, s, i) : o = ll(n, r, o, i), this._root = H0(o, s, i);
  }
  split(t) {
    return $c(t, this._root, this._comparator);
  }
  *[Symbol.iterator]() {
    let t = this._root;
    const n = [];
    let r = !1;
    for (; !r; )
      t !== null ? (n.push(t), t = t.left) : n.length !== 0 ? (t = n.pop(), yield t, t = t.right) : r = !0;
  }
}
function cu(e, t, n, r) {
  const i = r - n;
  if (i > 0) {
    const o = n + Math.floor(i / 2), s = e[o], l = t[o], u = new Fn(s, l);
    return u.left = cu(e, t, n, o), u.right = cu(e, t, o + 1, r), u;
  }
  return null;
}
function G0(e, t) {
  const n = new Fn(null, null);
  let r = n;
  for (let i = 0; i < e.length; i++)
    r = r.next = new Fn(e[i], t[i]);
  return r.next = null, n.next;
}
function $0(e) {
  let t = e;
  const n = [];
  let r = !1;
  const i = new Fn(null, null);
  let o = i;
  for (; !r; )
    t ? (n.push(t), t = t.left) : n.length > 0 ? (t = o = o.next = n.pop(), t = t.right) : r = !0;
  return o.next = null, i.next;
}
function fu(e, t, n) {
  const r = n - t;
  if (r > 0) {
    const i = t + Math.floor(r / 2), o = fu(e, t, i), s = e.head;
    return s.left = o, e.head = e.head.next, s.right = fu(e, i + 1, n), s;
  }
  return null;
}
function j0(e, t, n) {
  const r = new Fn(null, null);
  let i = r, o = e, s = t;
  for (; o !== null && s !== null; )
    n(o.key, s.key) < 0 ? (i.next = o, o = o.next) : (i.next = s, s = s.next), i = i.next;
  return o !== null ? i.next = o : s !== null && (i.next = s), r.next;
}
function du(e, t, n, r, i) {
  if (n >= r) return;
  const o = e[n + r >> 1];
  let s = n - 1, l = r + 1;
  for (; ; ) {
    do
      s++;
    while (i(e[s], o) < 0);
    do
      l--;
    while (i(e[l], o) > 0);
    if (s >= l) break;
    let u = e[s];
    e[s] = e[l], e[l] = u, u = t[s], t[s] = t[l], t[l] = u;
  }
  du(e, t, n, l, i), du(e, t, l + 1, r, i);
}
const on = 11102230246251565e-32, et = 134217729, Z0 = (3 + 8 * on) * on;
function ul(e, t, n, r, i) {
  let o, s, l, u, a = t[0], f = r[0], c = 0, d = 0;
  f > a == f > -a ? (o = a, a = t[++c]) : (o = f, f = r[++d]);
  let h = 0;
  if (c < e && d < n)
    for (f > a == f > -a ? (s = a + o, l = o - (s - a), a = t[++c]) : (s = f + o, l = o - (s - f), f = r[++d]), o = s, l !== 0 && (i[h++] = l); c < e && d < n; )
      f > a == f > -a ? (s = o + a, u = s - o, l = o - (s - u) + (a - u), a = t[++c]) : (s = o + f, u = s - o, l = o - (s - u) + (f - u), f = r[++d]), o = s, l !== 0 && (i[h++] = l);
  for (; c < e; )
    s = o + a, u = s - o, l = o - (s - u) + (a - u), a = t[++c], o = s, l !== 0 && (i[h++] = l);
  for (; d < n; )
    s = o + f, u = s - o, l = o - (s - u) + (f - u), f = r[++d], o = s, l !== 0 && (i[h++] = l);
  return (o !== 0 || h === 0) && (i[h++] = o), h;
}
function q0(e, t) {
  let n = t[0];
  for (let r = 1; r < e; r++) n += t[r];
  return n;
}
function Oi(e) {
  return new Float64Array(e);
}
const K0 = (3 + 16 * on) * on, Q0 = (2 + 12 * on) * on, J0 = (9 + 64 * on) * on * on, ir = Oi(4), jc = Oi(8), Zc = Oi(12), qc = Oi(16), it = Oi(4);
function ey(e, t, n, r, i, o, s) {
  let l, u, a, f, c, d, h, g, y, x, p, m, v, w, E, C, A, M;
  const N = e - i, I = n - i, B = t - o, O = r - o;
  w = N * O, d = et * N, h = d - (d - N), g = N - h, d = et * O, y = d - (d - O), x = O - y, E = g * x - (w - h * y - g * y - h * x), C = B * I, d = et * B, h = d - (d - B), g = B - h, d = et * I, y = d - (d - I), x = I - y, A = g * x - (C - h * y - g * y - h * x), p = E - A, c = E - p, ir[0] = E - (p + c) + (c - A), m = w + p, c = m - w, v = w - (m - c) + (p - c), p = v - C, c = v - p, ir[1] = v - (p + c) + (c - C), M = m + p, c = M - m, ir[2] = m - (M - c) + (p - c), ir[3] = M;
  let L = q0(4, ir), G = Q0 * s;
  if (L >= G || -L >= G || (c = e - N, l = e - (N + c) + (c - i), c = n - I, a = n - (I + c) + (c - i), c = t - B, u = t - (B + c) + (c - o), c = r - O, f = r - (O + c) + (c - o), l === 0 && u === 0 && a === 0 && f === 0) || (G = J0 * s + Z0 * Math.abs(L), L += N * f + O * l - (B * a + I * u), L >= G || -L >= G)) return L;
  w = l * O, d = et * l, h = d - (d - l), g = l - h, d = et * O, y = d - (d - O), x = O - y, E = g * x - (w - h * y - g * y - h * x), C = u * I, d = et * u, h = d - (d - u), g = u - h, d = et * I, y = d - (d - I), x = I - y, A = g * x - (C - h * y - g * y - h * x), p = E - A, c = E - p, it[0] = E - (p + c) + (c - A), m = w + p, c = m - w, v = w - (m - c) + (p - c), p = v - C, c = v - p, it[1] = v - (p + c) + (c - C), M = m + p, c = M - m, it[2] = m - (M - c) + (p - c), it[3] = M;
  const $ = ul(4, ir, 4, it, jc);
  w = N * f, d = et * N, h = d - (d - N), g = N - h, d = et * f, y = d - (d - f), x = f - y, E = g * x - (w - h * y - g * y - h * x), C = B * a, d = et * B, h = d - (d - B), g = B - h, d = et * a, y = d - (d - a), x = a - y, A = g * x - (C - h * y - g * y - h * x), p = E - A, c = E - p, it[0] = E - (p + c) + (c - A), m = w + p, c = m - w, v = w - (m - c) + (p - c), p = v - C, c = v - p, it[1] = v - (p + c) + (c - C), M = m + p, c = M - m, it[2] = m - (M - c) + (p - c), it[3] = M;
  const Y = ul($, jc, 4, it, Zc);
  w = l * f, d = et * l, h = d - (d - l), g = l - h, d = et * f, y = d - (d - f), x = f - y, E = g * x - (w - h * y - g * y - h * x), C = u * a, d = et * u, h = d - (d - u), g = u - h, d = et * a, y = d - (d - a), x = a - y, A = g * x - (C - h * y - g * y - h * x), p = E - A, c = E - p, it[0] = E - (p + c) + (c - A), m = w + p, c = m - w, v = w - (m - c) + (p - c), p = v - C, c = v - p, it[1] = v - (p + c) + (c - C), M = m + p, c = M - m, it[2] = m - (M - c) + (p - c), it[3] = M;
  const Q = ul(Y, Zc, 4, it, qc);
  return qc[Q - 1];
}
function ty(e, t, n, r, i, o) {
  const s = (t - o) * (n - i), l = (e - i) * (r - o), u = s - l, a = Math.abs(s + l);
  return Math.abs(u) >= K0 * a ? u : -ey(e, t, n, r, i, o, a);
}
const jr = (e, t) => e.ll.x <= t.x && t.x <= e.ur.x && e.ll.y <= t.y && t.y <= e.ur.y, hu = (e, t) => {
  if (t.ur.x < e.ll.x || e.ur.x < t.ll.x || t.ur.y < e.ll.y || e.ur.y < t.ll.y) return null;
  const n = e.ll.x < t.ll.x ? t.ll.x : e.ll.x, r = e.ur.x < t.ur.x ? e.ur.x : t.ur.x, i = e.ll.y < t.ll.y ? t.ll.y : e.ll.y, o = e.ur.y < t.ur.y ? e.ur.y : t.ur.y;
  return {
    ll: {
      x: n,
      y: i
    },
    ur: {
      x: r,
      y: o
    }
  };
};
let En = Number.EPSILON;
En === void 0 && (En = Math.pow(2, -52));
const ny = En * En, Kc = (e, t) => {
  if (-En < e && e < En && -En < t && t < En)
    return 0;
  const n = e - t;
  return n * n < ny * e * t ? 0 : e < t ? -1 : 1;
};
class ry {
  constructor() {
    this.reset();
  }
  reset() {
    this.xRounder = new Qc(), this.yRounder = new Qc();
  }
  round(t, n) {
    return {
      x: this.xRounder.round(t),
      y: this.yRounder.round(n)
    };
  }
}
class Qc {
  constructor() {
    this.tree = new xa(), this.round(0);
  }
  // Note: this can rounds input values backwards or forwards.
  //       You might ask, why not restrict this to just rounding
  //       forwards? Wouldn't that allow left endpoints to always
  //       remain left endpoints during splitting (never change to
  //       right). No - it wouldn't, because we snap intersections
  //       to endpoints (to establish independence from the segment
  //       angle for t-intersections).
  round(t) {
    const n = this.tree.add(t), r = this.tree.prev(n);
    if (r !== null && Kc(n.key, r.key) === 0)
      return this.tree.remove(t), r.key;
    const i = this.tree.next(n);
    return i !== null && Kc(n.key, i.key) === 0 ? (this.tree.remove(t), i.key) : t;
  }
}
const _i = new ry(), Io = (e, t) => e.x * t.y - e.y * t.x, mm = (e, t) => e.x * t.x + e.y * t.y, Jc = (e, t, n) => {
  const r = ty(e.x, e.y, t.x, t.y, n.x, n.y);
  return r > 0 ? -1 : r < 0 ? 1 : 0;
}, ss = (e) => Math.sqrt(mm(e, e)), iy = (e, t, n) => {
  const r = {
    x: t.x - e.x,
    y: t.y - e.y
  }, i = {
    x: n.x - e.x,
    y: n.y - e.y
  };
  return Io(i, r) / ss(i) / ss(r);
}, oy = (e, t, n) => {
  const r = {
    x: t.x - e.x,
    y: t.y - e.y
  }, i = {
    x: n.x - e.x,
    y: n.y - e.y
  };
  return mm(i, r) / ss(i) / ss(r);
}, ef = (e, t, n) => t.y === 0 ? null : {
  x: e.x + t.x / t.y * (n - e.y),
  y: n
}, tf = (e, t, n) => t.x === 0 ? null : {
  x: n,
  y: e.y + t.y / t.x * (n - e.x)
}, sy = (e, t, n, r) => {
  if (t.x === 0) return tf(n, r, e.x);
  if (r.x === 0) return tf(e, t, n.x);
  if (t.y === 0) return ef(n, r, e.y);
  if (r.y === 0) return ef(e, t, n.y);
  const i = Io(t, r);
  if (i == 0) return null;
  const o = {
    x: n.x - e.x,
    y: n.y - e.y
  }, s = Io(o, t) / i, l = Io(o, r) / i, u = e.x + l * t.x, a = n.x + s * r.x, f = e.y + l * t.y, c = n.y + s * r.y, d = (u + a) / 2, h = (f + c) / 2;
  return {
    x: d,
    y: h
  };
};
class Pt {
  // for ordering sweep events in the sweep event queue
  static compare(t, n) {
    const r = Pt.comparePoints(t.point, n.point);
    return r !== 0 ? r : (t.point !== n.point && t.link(n), t.isLeft !== n.isLeft ? t.isLeft ? 1 : -1 : In.compare(t.segment, n.segment));
  }
  // for ordering points in sweep line order
  static comparePoints(t, n) {
    return t.x < n.x ? -1 : t.x > n.x ? 1 : t.y < n.y ? -1 : t.y > n.y ? 1 : 0;
  }
  // Warning: 'point' input will be modified and re-used (for performance)
  constructor(t, n) {
    t.events === void 0 ? t.events = [this] : t.events.push(this), this.point = t, this.isLeft = n;
  }
  link(t) {
    if (t.point === this.point)
      throw new Error("Tried to link already linked events");
    const n = t.point.events;
    for (let r = 0, i = n.length; r < i; r++) {
      const o = n[r];
      this.point.events.push(o), o.point = this.point;
    }
    this.checkForConsuming();
  }
  /* Do a pass over our linked events and check to see if any pair
   * of segments match, and should be consumed. */
  checkForConsuming() {
    const t = this.point.events.length;
    for (let n = 0; n < t; n++) {
      const r = this.point.events[n];
      if (r.segment.consumedBy === void 0)
        for (let i = n + 1; i < t; i++) {
          const o = this.point.events[i];
          o.consumedBy === void 0 && r.otherSE.point.events === o.otherSE.point.events && r.segment.consume(o.segment);
        }
    }
  }
  getAvailableLinkedEvents() {
    const t = [];
    for (let n = 0, r = this.point.events.length; n < r; n++) {
      const i = this.point.events[n];
      i !== this && !i.segment.ringOut && i.segment.isInResult() && t.push(i);
    }
    return t;
  }
  /**
   * Returns a comparator function for sorting linked events that will
   * favor the event that will give us the smallest left-side angle.
   * All ring construction starts as low as possible heading to the right,
   * so by always turning left as sharp as possible we'll get polygons
   * without uncessary loops & holes.
   *
   * The comparator function has a compute cache such that it avoids
   * re-computing already-computed values.
   */
  getLeftmostComparator(t) {
    const n = /* @__PURE__ */ new Map(), r = (i) => {
      const o = i.otherSE;
      n.set(i, {
        sine: iy(this.point, t.point, o.point),
        cosine: oy(this.point, t.point, o.point)
      });
    };
    return (i, o) => {
      n.has(i) || r(i), n.has(o) || r(o);
      const {
        sine: s,
        cosine: l
      } = n.get(i), {
        sine: u,
        cosine: a
      } = n.get(o);
      return s >= 0 && u >= 0 ? l < a ? 1 : l > a ? -1 : 0 : s < 0 && u < 0 ? l < a ? -1 : l > a ? 1 : 0 : u < s ? -1 : u > s ? 1 : 0;
    };
  }
}
let ly = 0;
class In {
  /* This compare() function is for ordering segments in the sweep
   * line tree, and does so according to the following criteria:
   *
   * Consider the vertical line that lies an infinestimal step to the
   * right of the right-more of the two left endpoints of the input
   * segments. Imagine slowly moving a point up from negative infinity
   * in the increasing y direction. Which of the two segments will that
   * point intersect first? That segment comes 'before' the other one.
   *
   * If neither segment would be intersected by such a line, (if one
   * or more of the segments are vertical) then the line to be considered
   * is directly on the right-more of the two left inputs.
   */
  static compare(t, n) {
    const r = t.leftSE.point.x, i = n.leftSE.point.x, o = t.rightSE.point.x, s = n.rightSE.point.x;
    if (s < r) return 1;
    if (o < i) return -1;
    const l = t.leftSE.point.y, u = n.leftSE.point.y, a = t.rightSE.point.y, f = n.rightSE.point.y;
    if (r < i) {
      if (u < l && u < a) return 1;
      if (u > l && u > a) return -1;
      const c = t.comparePoint(n.leftSE.point);
      if (c < 0) return 1;
      if (c > 0) return -1;
      const d = n.comparePoint(t.rightSE.point);
      return d !== 0 ? d : -1;
    }
    if (r > i) {
      if (l < u && l < f) return -1;
      if (l > u && l > f) return 1;
      const c = n.comparePoint(t.leftSE.point);
      if (c !== 0) return c;
      const d = t.comparePoint(n.rightSE.point);
      return d < 0 ? 1 : d > 0 ? -1 : 1;
    }
    if (l < u) return -1;
    if (l > u) return 1;
    if (o < s) {
      const c = n.comparePoint(t.rightSE.point);
      if (c !== 0) return c;
    }
    if (o > s) {
      const c = t.comparePoint(n.rightSE.point);
      if (c < 0) return 1;
      if (c > 0) return -1;
    }
    if (o !== s) {
      const c = a - l, d = o - r, h = f - u, g = s - i;
      if (c > d && h < g) return 1;
      if (c < d && h > g) return -1;
    }
    return o > s ? 1 : o < s || a < f ? -1 : a > f ? 1 : t.id < n.id ? -1 : t.id > n.id ? 1 : 0;
  }
  /* Warning: a reference to ringWindings input will be stored,
   *  and possibly will be later modified */
  constructor(t, n, r, i) {
    this.id = ++ly, this.leftSE = t, t.segment = this, t.otherSE = n, this.rightSE = n, n.segment = this, n.otherSE = t, this.rings = r, this.windings = i;
  }
  static fromRing(t, n, r) {
    let i, o, s;
    const l = Pt.comparePoints(t, n);
    if (l < 0)
      i = t, o = n, s = 1;
    else if (l > 0)
      i = n, o = t, s = -1;
    else throw new Error(`Tried to create degenerate segment at [${t.x}, ${t.y}]`);
    const u = new Pt(i, !0), a = new Pt(o, !1);
    return new In(u, a, [r], [s]);
  }
  /* When a segment is split, the rightSE is replaced with a new sweep event */
  replaceRightSE(t) {
    this.rightSE = t, this.rightSE.segment = this, this.rightSE.otherSE = this.leftSE, this.leftSE.otherSE = this.rightSE;
  }
  bbox() {
    const t = this.leftSE.point.y, n = this.rightSE.point.y;
    return {
      ll: {
        x: this.leftSE.point.x,
        y: t < n ? t : n
      },
      ur: {
        x: this.rightSE.point.x,
        y: t > n ? t : n
      }
    };
  }
  /* A vector from the left point to the right */
  vector() {
    return {
      x: this.rightSE.point.x - this.leftSE.point.x,
      y: this.rightSE.point.y - this.leftSE.point.y
    };
  }
  isAnEndpoint(t) {
    return t.x === this.leftSE.point.x && t.y === this.leftSE.point.y || t.x === this.rightSE.point.x && t.y === this.rightSE.point.y;
  }
  /* Compare this segment with a point.
   *
   * A point P is considered to be colinear to a segment if there
   * exists a distance D such that if we travel along the segment
   * from one * endpoint towards the other a distance D, we find
   * ourselves at point P.
   *
   * Return value indicates:
   *
   *   1: point lies above the segment (to the left of vertical)
   *   0: point is colinear to segment
   *  -1: point lies below the segment (to the right of vertical)
   */
  comparePoint(t) {
    if (this.isAnEndpoint(t)) return 0;
    const n = this.leftSE.point, r = this.rightSE.point, i = this.vector();
    if (n.x === r.x)
      return t.x === n.x ? 0 : t.x < n.x ? 1 : -1;
    const o = (t.y - n.y) / i.y, s = n.x + o * i.x;
    if (t.x === s) return 0;
    const l = (t.x - n.x) / i.x, u = n.y + l * i.y;
    return t.y === u ? 0 : t.y < u ? -1 : 1;
  }
  /**
   * Given another segment, returns the first non-trivial intersection
   * between the two segments (in terms of sweep line ordering), if it exists.
   *
   * A 'non-trivial' intersection is one that will cause one or both of the
   * segments to be split(). As such, 'trivial' vs. 'non-trivial' intersection:
   *
   *   * endpoint of segA with endpoint of segB --> trivial
   *   * endpoint of segA with point along segB --> non-trivial
   *   * endpoint of segB with point along segA --> non-trivial
   *   * point along segA with point along segB --> non-trivial
   *
   * If no non-trivial intersection exists, return null
   * Else, return null.
   */
  getIntersection(t) {
    const n = this.bbox(), r = t.bbox(), i = hu(n, r);
    if (i === null) return null;
    const o = this.leftSE.point, s = this.rightSE.point, l = t.leftSE.point, u = t.rightSE.point, a = jr(n, l) && this.comparePoint(l) === 0, f = jr(r, o) && t.comparePoint(o) === 0, c = jr(n, u) && this.comparePoint(u) === 0, d = jr(r, s) && t.comparePoint(s) === 0;
    if (f && a)
      return d && !c ? s : !d && c ? u : null;
    if (f)
      return c && o.x === u.x && o.y === u.y ? null : o;
    if (a)
      return d && s.x === l.x && s.y === l.y ? null : l;
    if (d && c) return null;
    if (d) return s;
    if (c) return u;
    const h = sy(o, this.vector(), l, t.vector());
    return h === null || !jr(i, h) ? null : _i.round(h.x, h.y);
  }
  /**
   * Split the given segment into multiple segments on the given points.
   *  * Each existing segment will retain its leftSE and a new rightSE will be
   *    generated for it.
   *  * A new segment will be generated which will adopt the original segment's
   *    rightSE, and a new leftSE will be generated for it.
   *  * If there are more than two points given to split on, new segments
   *    in the middle will be generated with new leftSE and rightSE's.
   *  * An array of the newly generated SweepEvents will be returned.
   *
   * Warning: input array of points is modified
   */
  split(t) {
    const n = [], r = t.events !== void 0, i = new Pt(t, !0), o = new Pt(t, !1), s = this.rightSE;
    this.replaceRightSE(o), n.push(o), n.push(i);
    const l = new In(i, s, this.rings.slice(), this.windings.slice());
    return Pt.comparePoints(l.leftSE.point, l.rightSE.point) > 0 && l.swapEvents(), Pt.comparePoints(this.leftSE.point, this.rightSE.point) > 0 && this.swapEvents(), r && (i.checkForConsuming(), o.checkForConsuming()), n;
  }
  /* Swap which event is left and right */
  swapEvents() {
    const t = this.rightSE;
    this.rightSE = this.leftSE, this.leftSE = t, this.leftSE.isLeft = !0, this.rightSE.isLeft = !1;
    for (let n = 0, r = this.windings.length; n < r; n++)
      this.windings[n] *= -1;
  }
  /* Consume another segment. We take their rings under our wing
   * and mark them as consumed. Use for perfectly overlapping segments */
  consume(t) {
    let n = this, r = t;
    for (; n.consumedBy; ) n = n.consumedBy;
    for (; r.consumedBy; ) r = r.consumedBy;
    const i = In.compare(n, r);
    if (i !== 0) {
      if (i > 0) {
        const o = n;
        n = r, r = o;
      }
      if (n.prev === r) {
        const o = n;
        n = r, r = o;
      }
      for (let o = 0, s = r.rings.length; o < s; o++) {
        const l = r.rings[o], u = r.windings[o], a = n.rings.indexOf(l);
        a === -1 ? (n.rings.push(l), n.windings.push(u)) : n.windings[a] += u;
      }
      r.rings = null, r.windings = null, r.consumedBy = n, r.leftSE.consumedBy = n.leftSE, r.rightSE.consumedBy = n.rightSE;
    }
  }
  /* The first segment previous segment chain that is in the result */
  prevInResult() {
    return this._prevInResult !== void 0 ? this._prevInResult : (this.prev ? this.prev.isInResult() ? this._prevInResult = this.prev : this._prevInResult = this.prev.prevInResult() : this._prevInResult = null, this._prevInResult);
  }
  beforeState() {
    if (this._beforeState !== void 0) return this._beforeState;
    if (!this.prev) this._beforeState = {
      rings: [],
      windings: [],
      multiPolys: []
    };
    else {
      const t = this.prev.consumedBy || this.prev;
      this._beforeState = t.afterState();
    }
    return this._beforeState;
  }
  afterState() {
    if (this._afterState !== void 0) return this._afterState;
    const t = this.beforeState();
    this._afterState = {
      rings: t.rings.slice(0),
      windings: t.windings.slice(0),
      multiPolys: []
    };
    const n = this._afterState.rings, r = this._afterState.windings, i = this._afterState.multiPolys;
    for (let l = 0, u = this.rings.length; l < u; l++) {
      const a = this.rings[l], f = this.windings[l], c = n.indexOf(a);
      c === -1 ? (n.push(a), r.push(f)) : r[c] += f;
    }
    const o = [], s = [];
    for (let l = 0, u = n.length; l < u; l++) {
      if (r[l] === 0) continue;
      const a = n[l], f = a.poly;
      if (s.indexOf(f) === -1)
        if (a.isExterior) o.push(f);
        else {
          s.indexOf(f) === -1 && s.push(f);
          const c = o.indexOf(a.poly);
          c !== -1 && o.splice(c, 1);
        }
    }
    for (let l = 0, u = o.length; l < u; l++) {
      const a = o[l].multiPoly;
      i.indexOf(a) === -1 && i.push(a);
    }
    return this._afterState;
  }
  /* Is this segment part of the final result? */
  isInResult() {
    if (this.consumedBy) return !1;
    if (this._isInResult !== void 0) return this._isInResult;
    const t = this.beforeState().multiPolys, n = this.afterState().multiPolys;
    switch (Wt.type) {
      case "union": {
        const r = t.length === 0, i = n.length === 0;
        this._isInResult = r !== i;
        break;
      }
      case "intersection": {
        let r, i;
        t.length < n.length ? (r = t.length, i = n.length) : (r = n.length, i = t.length), this._isInResult = i === Wt.numMultiPolys && r < i;
        break;
      }
      case "xor": {
        const r = Math.abs(t.length - n.length);
        this._isInResult = r % 2 === 1;
        break;
      }
      case "difference": {
        const r = (i) => i.length === 1 && i[0].isSubject;
        this._isInResult = r(t) !== r(n);
        break;
      }
      default:
        throw new Error(`Unrecognized operation type found ${Wt.type}`);
    }
    return this._isInResult;
  }
}
class nf {
  constructor(t, n, r) {
    if (!Array.isArray(t) || t.length === 0)
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    if (this.poly = n, this.isExterior = r, this.segments = [], typeof t[0][0] != "number" || typeof t[0][1] != "number")
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    const i = _i.round(t[0][0], t[0][1]);
    this.bbox = {
      ll: {
        x: i.x,
        y: i.y
      },
      ur: {
        x: i.x,
        y: i.y
      }
    };
    let o = i;
    for (let s = 1, l = t.length; s < l; s++) {
      if (typeof t[s][0] != "number" || typeof t[s][1] != "number")
        throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
      let u = _i.round(t[s][0], t[s][1]);
      u.x === o.x && u.y === o.y || (this.segments.push(In.fromRing(o, u, this)), u.x < this.bbox.ll.x && (this.bbox.ll.x = u.x), u.y < this.bbox.ll.y && (this.bbox.ll.y = u.y), u.x > this.bbox.ur.x && (this.bbox.ur.x = u.x), u.y > this.bbox.ur.y && (this.bbox.ur.y = u.y), o = u);
    }
    (i.x !== o.x || i.y !== o.y) && this.segments.push(In.fromRing(o, i, this));
  }
  getSweepEvents() {
    const t = [];
    for (let n = 0, r = this.segments.length; n < r; n++) {
      const i = this.segments[n];
      t.push(i.leftSE), t.push(i.rightSE);
    }
    return t;
  }
}
class uy {
  constructor(t, n) {
    if (!Array.isArray(t))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    this.exteriorRing = new nf(t[0], this, !0), this.bbox = {
      ll: {
        x: this.exteriorRing.bbox.ll.x,
        y: this.exteriorRing.bbox.ll.y
      },
      ur: {
        x: this.exteriorRing.bbox.ur.x,
        y: this.exteriorRing.bbox.ur.y
      }
    }, this.interiorRings = [];
    for (let r = 1, i = t.length; r < i; r++) {
      const o = new nf(t[r], this, !1);
      o.bbox.ll.x < this.bbox.ll.x && (this.bbox.ll.x = o.bbox.ll.x), o.bbox.ll.y < this.bbox.ll.y && (this.bbox.ll.y = o.bbox.ll.y), o.bbox.ur.x > this.bbox.ur.x && (this.bbox.ur.x = o.bbox.ur.x), o.bbox.ur.y > this.bbox.ur.y && (this.bbox.ur.y = o.bbox.ur.y), this.interiorRings.push(o);
    }
    this.multiPoly = n;
  }
  getSweepEvents() {
    const t = this.exteriorRing.getSweepEvents();
    for (let n = 0, r = this.interiorRings.length; n < r; n++) {
      const i = this.interiorRings[n].getSweepEvents();
      for (let o = 0, s = i.length; o < s; o++)
        t.push(i[o]);
    }
    return t;
  }
}
class rf {
  constructor(t, n) {
    if (!Array.isArray(t))
      throw new Error("Input geometry is not a valid Polygon or MultiPolygon");
    try {
      typeof t[0][0][0] == "number" && (t = [t]);
    } catch {
    }
    this.polys = [], this.bbox = {
      ll: {
        x: Number.POSITIVE_INFINITY,
        y: Number.POSITIVE_INFINITY
      },
      ur: {
        x: Number.NEGATIVE_INFINITY,
        y: Number.NEGATIVE_INFINITY
      }
    };
    for (let r = 0, i = t.length; r < i; r++) {
      const o = new uy(t[r], this);
      o.bbox.ll.x < this.bbox.ll.x && (this.bbox.ll.x = o.bbox.ll.x), o.bbox.ll.y < this.bbox.ll.y && (this.bbox.ll.y = o.bbox.ll.y), o.bbox.ur.x > this.bbox.ur.x && (this.bbox.ur.x = o.bbox.ur.x), o.bbox.ur.y > this.bbox.ur.y && (this.bbox.ur.y = o.bbox.ur.y), this.polys.push(o);
    }
    this.isSubject = n;
  }
  getSweepEvents() {
    const t = [];
    for (let n = 0, r = this.polys.length; n < r; n++) {
      const i = this.polys[n].getSweepEvents();
      for (let o = 0, s = i.length; o < s; o++)
        t.push(i[o]);
    }
    return t;
  }
}
class ls {
  /* Given the segments from the sweep line pass, compute & return a series
   * of closed rings from all the segments marked to be part of the result */
  static factory(t) {
    const n = [];
    for (let r = 0, i = t.length; r < i; r++) {
      const o = t[r];
      if (!o.isInResult() || o.ringOut) continue;
      let s = null, l = o.leftSE, u = o.rightSE;
      const a = [l], f = l.point, c = [];
      for (; s = l, l = u, a.push(l), l.point !== f; )
        for (; ; ) {
          const d = l.getAvailableLinkedEvents();
          if (d.length === 0) {
            const y = a[0].point, x = a[a.length - 1].point;
            throw new Error(`Unable to complete output ring starting at [${y.x}, ${y.y}]. Last matching segment found ends at [${x.x}, ${x.y}].`);
          }
          if (d.length === 1) {
            u = d[0].otherSE;
            break;
          }
          let h = null;
          for (let y = 0, x = c.length; y < x; y++)
            if (c[y].point === l.point) {
              h = y;
              break;
            }
          if (h !== null) {
            const y = c.splice(h)[0], x = a.splice(y.index);
            x.unshift(x[0].otherSE), n.push(new ls(x.reverse()));
            continue;
          }
          c.push({
            index: a.length,
            point: l.point
          });
          const g = l.getLeftmostComparator(s);
          u = d.sort(g)[0].otherSE;
          break;
        }
      n.push(new ls(a));
    }
    return n;
  }
  constructor(t) {
    this.events = t;
    for (let n = 0, r = t.length; n < r; n++)
      t[n].segment.ringOut = this;
    this.poly = null;
  }
  getGeom() {
    let t = this.events[0].point;
    const n = [t];
    for (let a = 1, f = this.events.length - 1; a < f; a++) {
      const c = this.events[a].point, d = this.events[a + 1].point;
      Jc(c, t, d) !== 0 && (n.push(c), t = c);
    }
    if (n.length === 1) return null;
    const r = n[0], i = n[1];
    Jc(r, t, i) === 0 && n.shift(), n.push(n[0]);
    const o = this.isExteriorRing() ? 1 : -1, s = this.isExteriorRing() ? 0 : n.length - 1, l = this.isExteriorRing() ? n.length : -1, u = [];
    for (let a = s; a != l; a += o) u.push([n[a].x, n[a].y]);
    return u;
  }
  isExteriorRing() {
    if (this._isExteriorRing === void 0) {
      const t = this.enclosingRing();
      this._isExteriorRing = t ? !t.isExteriorRing() : !0;
    }
    return this._isExteriorRing;
  }
  enclosingRing() {
    return this._enclosingRing === void 0 && (this._enclosingRing = this._calcEnclosingRing()), this._enclosingRing;
  }
  /* Returns the ring that encloses this one, if any */
  _calcEnclosingRing() {
    let t = this.events[0];
    for (let i = 1, o = this.events.length; i < o; i++) {
      const s = this.events[i];
      Pt.compare(t, s) > 0 && (t = s);
    }
    let n = t.segment.prevInResult(), r = n ? n.prevInResult() : null;
    for (; ; ) {
      if (!n) return null;
      if (!r) return n.ringOut;
      if (r.ringOut !== n.ringOut)
        return r.ringOut.enclosingRing() !== n.ringOut ? n.ringOut : n.ringOut.enclosingRing();
      n = r.prevInResult(), r = n ? n.prevInResult() : null;
    }
  }
}
class of {
  constructor(t) {
    this.exteriorRing = t, t.poly = this, this.interiorRings = [];
  }
  addInterior(t) {
    this.interiorRings.push(t), t.poly = this;
  }
  getGeom() {
    const t = [this.exteriorRing.getGeom()];
    if (t[0] === null) return null;
    for (let n = 0, r = this.interiorRings.length; n < r; n++) {
      const i = this.interiorRings[n].getGeom();
      i !== null && t.push(i);
    }
    return t;
  }
}
class ay {
  constructor(t) {
    this.rings = t, this.polys = this._composePolys(t);
  }
  getGeom() {
    const t = [];
    for (let n = 0, r = this.polys.length; n < r; n++) {
      const i = this.polys[n].getGeom();
      i !== null && t.push(i);
    }
    return t;
  }
  _composePolys(t) {
    const n = [];
    for (let r = 0, i = t.length; r < i; r++) {
      const o = t[r];
      if (!o.poly)
        if (o.isExteriorRing()) n.push(new of(o));
        else {
          const s = o.enclosingRing();
          s.poly || n.push(new of(s)), s.poly.addInterior(o);
        }
    }
    return n;
  }
}
class cy {
  constructor(t) {
    let n = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : In.compare;
    this.queue = t, this.tree = new xa(n), this.segments = [];
  }
  process(t) {
    const n = t.segment, r = [];
    if (t.consumedBy)
      return t.isLeft ? this.queue.remove(t.otherSE) : this.tree.remove(n), r;
    const i = t.isLeft ? this.tree.add(n) : this.tree.find(n);
    if (!i) throw new Error(`Unable to find segment #${n.id} [${n.leftSE.point.x}, ${n.leftSE.point.y}] -> [${n.rightSE.point.x}, ${n.rightSE.point.y}] in SweepLine tree.`);
    let o = i, s = i, l, u;
    for (; l === void 0; )
      o = this.tree.prev(o), o === null ? l = null : o.key.consumedBy === void 0 && (l = o.key);
    for (; u === void 0; )
      s = this.tree.next(s), s === null ? u = null : s.key.consumedBy === void 0 && (u = s.key);
    if (t.isLeft) {
      let a = null;
      if (l) {
        const c = l.getIntersection(n);
        if (c !== null && (n.isAnEndpoint(c) || (a = c), !l.isAnEndpoint(c))) {
          const d = this._splitSafely(l, c);
          for (let h = 0, g = d.length; h < g; h++)
            r.push(d[h]);
        }
      }
      let f = null;
      if (u) {
        const c = u.getIntersection(n);
        if (c !== null && (n.isAnEndpoint(c) || (f = c), !u.isAnEndpoint(c))) {
          const d = this._splitSafely(u, c);
          for (let h = 0, g = d.length; h < g; h++)
            r.push(d[h]);
        }
      }
      if (a !== null || f !== null) {
        let c = null;
        a === null ? c = f : f === null ? c = a : c = Pt.comparePoints(a, f) <= 0 ? a : f, this.queue.remove(n.rightSE), r.push(n.rightSE);
        const d = n.split(c);
        for (let h = 0, g = d.length; h < g; h++)
          r.push(d[h]);
      }
      r.length > 0 ? (this.tree.remove(n), r.push(t)) : (this.segments.push(n), n.prev = l);
    } else {
      if (l && u) {
        const a = l.getIntersection(u);
        if (a !== null) {
          if (!l.isAnEndpoint(a)) {
            const f = this._splitSafely(l, a);
            for (let c = 0, d = f.length; c < d; c++)
              r.push(f[c]);
          }
          if (!u.isAnEndpoint(a)) {
            const f = this._splitSafely(u, a);
            for (let c = 0, d = f.length; c < d; c++)
              r.push(f[c]);
          }
        }
      }
      this.tree.remove(n);
    }
    return r;
  }
  /* Safely split a segment that is currently in the datastructures
   * IE - a segment other than the one that is currently being processed. */
  _splitSafely(t, n) {
    this.tree.remove(t);
    const r = t.rightSE;
    this.queue.remove(r);
    const i = t.split(n);
    return i.push(r), t.consumedBy === void 0 && this.tree.add(t), i;
  }
}
const sf = typeof process < "u" && process.env.POLYGON_CLIPPING_MAX_QUEUE_SIZE || 1e6, fy = typeof process < "u" && process.env.POLYGON_CLIPPING_MAX_SWEEPLINE_SEGMENTS || 1e6;
class dy {
  run(t, n, r) {
    Wt.type = t, _i.reset();
    const i = [new rf(n, !0)];
    for (let c = 0, d = r.length; c < d; c++)
      i.push(new rf(r[c], !1));
    if (Wt.numMultiPolys = i.length, Wt.type === "difference") {
      const c = i[0];
      let d = 1;
      for (; d < i.length; )
        hu(i[d].bbox, c.bbox) !== null ? d++ : i.splice(d, 1);
    }
    if (Wt.type === "intersection")
      for (let c = 0, d = i.length; c < d; c++) {
        const h = i[c];
        for (let g = c + 1, y = i.length; g < y; g++)
          if (hu(h.bbox, i[g].bbox) === null) return [];
      }
    const o = new xa(Pt.compare);
    for (let c = 0, d = i.length; c < d; c++) {
      const h = i[c].getSweepEvents();
      for (let g = 0, y = h.length; g < y; g++)
        if (o.insert(h[g]), o.size > sf)
          throw new Error("Infinite loop when putting segment endpoints in a priority queue (queue size too big).");
    }
    const s = new cy(o);
    let l = o.size, u = o.pop();
    for (; u; ) {
      const c = u.key;
      if (o.size === l) {
        const h = c.segment;
        throw new Error(`Unable to pop() ${c.isLeft ? "left" : "right"} SweepEvent [${c.point.x}, ${c.point.y}] from segment #${h.id} [${h.leftSE.point.x}, ${h.leftSE.point.y}] -> [${h.rightSE.point.x}, ${h.rightSE.point.y}] from queue.`);
      }
      if (o.size > sf)
        throw new Error("Infinite loop when passing sweep line over endpoints (queue size too big).");
      if (s.segments.length > fy)
        throw new Error("Infinite loop when passing sweep line over endpoints (too many sweep line segments).");
      const d = s.process(c);
      for (let h = 0, g = d.length; h < g; h++) {
        const y = d[h];
        y.consumedBy === void 0 && o.insert(y);
      }
      l = o.size, u = o.pop();
    }
    _i.reset();
    const a = ls.factory(s.segments);
    return new ay(a).getGeom();
  }
}
const Wt = new dy(), hy = function(e) {
  for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
    n[r - 1] = arguments[r];
  return Wt.run("union", e, n);
}, my = function(e) {
  for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
    n[r - 1] = arguments[r];
  return Wt.run("intersection", e, n);
}, py = function(e) {
  for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
    n[r - 1] = arguments[r];
  return Wt.run("xor", e, n);
}, gy = function(e) {
  for (var t = arguments.length, n = new Array(t > 1 ? t - 1 : 0), r = 1; r < t; r++)
    n[r - 1] = arguments[r];
  return Wt.run("difference", e, n);
};
var yy = {
  union: hy,
  intersection: my,
  xor: py,
  difference: gy
};
function Ur(e) {
  return e == null ? null : pm(e) || gm(e) || vy(e) ? e : null;
}
function lf(e) {
  return typeof e == "number" && Number.isFinite(e);
}
function bo(e) {
  return Array.isArray(e) && e.length >= 2 && lf(e[0]) && lf(e[1]);
}
function pm(e) {
  return Array.isArray(e) && e.length > 0 && e.every((t) => bo(t));
}
function gm(e) {
  return Array.isArray(e) && e.length > 0 && e.every((t) => pm(t));
}
function vy(e) {
  return Array.isArray(e) && e.length > 0 && e.every((t) => gm(t));
}
function yt(e) {
  if (!Array.isArray(e) || e.length < 3) return [];
  const t = [];
  for (const i of e) {
    if (!Array.isArray(i) || i.length < 2) continue;
    const o = Number(i[0]), s = Number(i[1]);
    if (!Number.isFinite(o) || !Number.isFinite(s)) continue;
    const l = t[t.length - 1];
    l && l[0] === o && l[1] === s || t.push([o, s]);
  }
  if (t.length < 3) return [];
  const n = t[0], r = t[t.length - 1];
  return (n[0] !== r[0] || n[1] !== r[1]) && t.push([n[0], n[1]]), t.length >= 4 ? t : [];
}
function ki(e) {
  if (!Array.isArray(e) || e.length < 4) return 0;
  let t = 0;
  for (let n = 0; n < e.length - 1; n += 1) {
    const r = e[n], i = e[n + 1];
    t += r[0] * i[1] - i[0] * r[1];
  }
  return t * 0.5;
}
function al(e) {
  if (!Array.isArray(e) || e.length === 0) return [];
  const t = [];
  for (const o of e) {
    const s = yt(o);
    s.length >= 4 && t.push(s);
  }
  if (t.length === 0) return [];
  if (t.length === 1) return [t[0]];
  let n = 0, r = 0;
  for (let o = 0; o < t.length; o += 1) {
    const s = Math.abs(ki(t[o]));
    s <= r || (r = s, n = o);
  }
  const i = [t[n]];
  for (let o = 0; o < t.length; o += 1)
    o !== n && i.push(t[o]);
  return i;
}
function ym(e) {
  if (!Array.isArray(e) || e.length === 0) return [];
  const t = e[0];
  if (bo(t)) {
    const i = al([e]);
    return i.length > 0 ? [i] : [];
  }
  if (!Array.isArray(t) || t.length === 0) return [];
  const n = t[0];
  if (bo(n)) {
    const i = al(e);
    return i.length > 0 ? [i] : [];
  }
  if (!Array.isArray(n) || n.length === 0 || !bo(n[0]))
    return [];
  const r = [];
  for (const i of e) {
    const o = al(i);
    o.length > 0 && r.push(o);
  }
  return r;
}
function uf(e, t, n) {
  let r = !1;
  for (let i = 0, o = n.length - 1; i < n.length; o = i, i += 1) {
    const s = n[i][0], l = n[i][1], u = n[o][0], a = n[o][1];
    if (l === a || l > t == a > t) continue;
    e < (u - s) * (t - l) / (a - l) + s && (r = !r);
  }
  return r;
}
function Br(e) {
  const t = [];
  for (const n of e ?? []) {
    const r = ym(n);
    for (const i of r) {
      const o = i[0];
      if (!o || o.length < 4) continue;
      let s = 1 / 0, l = 1 / 0, u = -1 / 0, a = -1 / 0;
      for (const [c, d] of o)
        c < s && (s = c), c > u && (u = c), d < l && (l = d), d > a && (a = d);
      if (!Number.isFinite(s) || !Number.isFinite(l) || !Number.isFinite(u) || !Number.isFinite(a))
        continue;
      let f = Math.abs(ki(o));
      for (let c = 1; c < i.length; c += 1)
        f -= Math.abs(ki(i[c]));
      t.push({
        outer: o,
        holes: i.slice(1),
        minX: s,
        minY: l,
        maxX: u,
        maxY: a,
        area: Math.max(1e-6, f)
      });
    }
  }
  return t;
}
function vm(e, t, n) {
  if (e < n.minX || e > n.maxX || t < n.minY || t > n.maxY || !uf(e, t, n.outer)) return !1;
  for (const r of n.holes)
    if (uf(e, t, r)) return !1;
  return !0;
}
function Ii(e, t, n) {
  for (const r of n)
    if (vm(e, t, r))
      return !0;
  return !1;
}
const Sa = [
  160,
  160,
  160,
  255
];
function U(e, t, n) {
  return Math.max(t, Math.min(n, e));
}
function Ea(e, t, n) {
  const r = Number(e), i = Number(t), o = Number(n);
  return !Number.isFinite(r) || r <= 0 ? 1 : !Number.isFinite(i) || !Number.isFinite(o) ? r : Math.pow(2, i - o) * r;
}
function wy(e, t, n) {
  let i = 100 * Ea(e, t, n);
  if (Number(e)) {
    let o = "μm";
    return i > 1e3 && (i /= 1e3, o = "mm"), `${i.toPrecision(3)} ${o}`;
  }
  return `${Math.round(i * 1e3) / 1e3} pixels`;
}
function Ae() {
  return typeof performance < "u" && typeof performance.now == "function" ? performance.now() : Date.now();
}
function er(e) {
  const t = e.fillModes instanceof Uint8Array ? e.fillModes.length : Number.MAX_SAFE_INTEGER;
  return Math.max(
    0,
    Math.min(
      Math.floor(e.count ?? 0),
      Math.floor((e.positions?.length ?? 0) / 2),
      e.paletteIndices?.length ?? 0,
      t
    )
  );
}
function mu(e, t) {
  return !e && !t ? !0 : !e || !t ? !1 : Math.abs((e.zoom ?? 0) - (t.zoom ?? 0)) < 1e-6 && Math.abs((e.offsetX ?? 0) - (t.offsetX ?? 0)) < 1e-6 && Math.abs((e.offsetY ?? 0) - (t.offsetY ?? 0)) < 1e-6 && Math.abs((e.rotationDeg ?? 0) - (t.rotationDeg ?? 0)) < 1e-6;
}
function xy(e) {
  const t = String(e ?? "").trim();
  if (!t) return "";
  if (/^bearer\s+/i.test(t)) {
    const n = t.replace(/^bearer\s+/i, "").trim();
    return n ? `Bearer ${n}` : "";
  }
  return `Bearer ${t}`;
}
function wm(e) {
  const n = String(e ?? "").trim().match(/^#?([0-9a-fA-F]{6})$/);
  if (!n) return [...Sa];
  const r = Number.parseInt(n[1], 16);
  return [r >> 16 & 255, r >> 8 & 255, r & 255, 255];
}
function xm(e) {
  const t = [
    [...Sa]
  ], n = /* @__PURE__ */ new Map();
  for (const i of e ?? []) {
    const o = String(i?.classId ?? "");
    !o || n.has(o) || (n.set(o, t.length), t.push(wm(i?.classColor)));
  }
  const r = new Uint8Array(t.length * 4);
  for (let i = 0; i < t.length; i += 1)
    r[i * 4] = t[i][0], r[i * 4 + 1] = t[i][1], r[i * 4 + 2] = t[i][2], r[i * 4 + 3] = t[i][3];
  return { colors: r, classToPaletteIndex: n };
}
const Sy = [6, 4, 2], Ey = 64, Cy = 0.04, Ry = 1, Py = 4, us = 1e-6, My = 0.1;
function Ty(e) {
  if (!Array.isArray(e) || e.length === 0) return [];
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n) || n.length < 2) continue;
    const r = Number(n[0]), i = Number(n[1]);
    if (!Number.isFinite(r) || !Number.isFinite(i)) continue;
    const o = t[t.length - 1];
    o && Math.abs(o[0] - r) < 1e-9 && Math.abs(o[1] - i) < 1e-9 || t.push([r, i]);
  }
  return t;
}
function af(e, t, n) {
  if (t <= us || n < 8) return [];
  const r = [];
  for (let i = 0; i <= n; i += 1) {
    const o = i / n * Math.PI * 2;
    r.push([e[0] + Math.cos(o) * t, e[1] + Math.sin(o) * t]);
  }
  return yt(r);
}
function Ay(e, t, n, r) {
  const i = t[0] - e[0], o = t[1] - e[1], s = Math.sqrt(i * i + o * o);
  if (!Number.isFinite(s) || s <= r) return [];
  const l = i / s, a = -(o / s), f = l, c = Math.max(us, n);
  return yt([
    [e[0] + a * c, e[1] + f * c],
    [t[0] + a * c, t[1] + f * c],
    [t[0] - a * c, t[1] - f * c],
    [e[0] - a * c, e[1] - f * c]
  ]);
}
function cf(e, t) {
  if (!e.length) return [];
  let n = 1 / 0, r = 1 / 0, i = -1 / 0, o = -1 / 0;
  for (const [l, u] of e)
    l < n && (n = l), l > i && (i = l), u < r && (r = u), u > o && (o = u);
  if (!Number.isFinite(n) || !Number.isFinite(r)) return [];
  const s = Math.max(t, 1);
  return yt([
    [n - s, r - s],
    [i + s, r - s],
    [i + s, o + s],
    [n - s, o + s]
  ]);
}
function lo(e, t) {
  return yt(
    t ? e.map(([n, r]) => [
      U(n, t[0], t[2]),
      U(r, t[1], t[3])
    ]) : e
  );
}
function ff(e, t) {
  return Number.isFinite(e) ? Number(e.toFixed(t)) : e;
}
function _y(e, t) {
  if (!Array.isArray(e) || e.length === 0) return [];
  const n = [];
  for (const r of e) {
    if (!Array.isArray(r) || r.length < 2) continue;
    const i = ff(Number(r[0]), t), o = ff(Number(r[1]), t);
    if (!Number.isFinite(i) || !Number.isFinite(o)) continue;
    const s = n[n.length - 1];
    (!s || s[0] !== i || s[1] !== o) && n.push([i, o]);
  }
  if (n.length >= 2) {
    const r = n[0], i = n[n.length - 1];
    if (!r || !i) return [];
    (r[0] !== i[0] || r[1] !== i[1]) && n.push([r[0], r[1]]);
  }
  return n.length >= 4 ? n : [];
}
function ky(e, t) {
  if (!Array.isArray(e) || e.length === 0) return [];
  const n = e.map((r) => _y(r, t)).filter((r) => r.length >= 4);
  return n.length > 0 ? n : [];
}
function Iy(e, t) {
  const n = e.map((i) => ky(i, t)).filter((i) => i.length > 0);
  if (n.length === 0) return null;
  let r = [n[0]];
  try {
    for (let i = 1; i < n.length; i += 1)
      if (r = yy.union(r, [n[i]]), !Array.isArray(r) || r.length === 0)
        return null;
  } catch (i) {
    return console.error("buildBrushStrokePolygon union failed", t, i), null;
  }
  return r.length > 0 ? r : null;
}
function by(e) {
  if (e.length === 0) return null;
  for (const t of Sy) {
    const n = Iy(e, t);
    if (n) return n;
  }
  return null;
}
function Ly(e) {
  if (!Array.isArray(e) || e.length === 0) return [];
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n) || n.length < 2) continue;
    const r = Number(n[0]), i = Number(n[1]);
    !Number.isFinite(r) || !Number.isFinite(i) || t.push([r, i]);
  }
  return yt(t);
}
function Fy(e) {
  let t = [], n = 0;
  for (const r of e) {
    if (!Array.isArray(r) || r.length === 0) continue;
    const i = Ly(r[0] ?? []);
    if (i.length < 4) continue;
    const o = Math.abs(ki(i));
    o <= n || (n = o, t = i);
  }
  return t;
}
function Ny(e, t = 1e-9) {
  const n = yt(e);
  if (n.length < 5) return n;
  const r = [n[0]];
  for (let i = 1; i < n.length - 1; i += 1) {
    const o = r[r.length - 1], s = n[i], l = n[i + 1], u = (s[0] - o[0]) * (l[1] - s[1]) - (s[1] - o[1]) * (l[0] - s[0]);
    Math.abs(u) <= t || r.push(s);
  }
  return r.push(r[0]), yt(r);
}
function Dy(e, t, n) {
  const r = n[0] - t[0], i = n[1] - t[1], o = r * r + i * i;
  if (o <= 1e-12) {
    const c = e[0] - t[0], d = e[1] - t[1];
    return c * c + d * d;
  }
  const s = U(
    ((e[0] - t[0]) * r + (e[1] - t[1]) * i) / o,
    0,
    1
  ), l = t[0] + r * s, u = t[1] + i * s, a = e[0] - l, f = e[1] - u;
  return a * a + f * f;
}
function zy(e, t) {
  if (e.length <= 2 || t <= 0) return e.slice();
  const n = new Uint8Array(e.length);
  n[0] = 1, n[e.length - 1] = 1;
  const r = t * t, i = [[0, e.length - 1]];
  for (; i.length > 0; ) {
    const s = i.pop();
    if (!s) break;
    const [l, u] = s;
    if (u - l <= 1) continue;
    let a = 0, f = -1;
    for (let c = l + 1; c < u; c += 1) {
      const d = Dy(e[c], e[l], e[u]);
      d > a && (a = d, f = c);
    }
    f >= 0 && a > r && (n[f] = 1, i.push([l, f], [f, u]));
  }
  const o = [];
  for (let s = 0; s < e.length; s += 1)
    n[s] && o.push(e[s]);
  return o;
}
function Uy(e, t) {
  const n = yt(e);
  if (n.length < 5 || t <= 0) return n;
  const r = n.slice(0, -1), i = zy(r, t);
  return i.length < 3 ? n : yt(i);
}
function By(e, t) {
  let n = yt(e);
  if (t <= 0 || n.length < 5) return n;
  for (let r = 0; r < t; r += 1) {
    const i = n.slice(0, -1);
    if (i.length < 3) break;
    const o = [];
    for (let s = 0; s < i.length; s += 1) {
      const l = i[s], u = i[(s + 1) % i.length];
      o.push(
        [l[0] * 0.75 + u[0] * 0.25, l[1] * 0.75 + u[1] * 0.25],
        [l[0] * 0.25 + u[0] * 0.75, l[1] * 0.25 + u[1] * 0.75]
      );
    }
    n = yt(o);
  }
  return n;
}
function Oy(e, t) {
  const n = Ty(e), r = Math.max(us, Number(t.radius) || 0);
  if (n.length === 0 || !Number.isFinite(r)) return [];
  const i = Math.max(12, Math.floor(t.circleSides || Ey));
  if (n.length === 1)
    return lo(af(n[0], r, i), t.clipBounds);
  const o = [], s = Math.max(us, r * My);
  for (let d = 0; d < n.length; d += 1) {
    const h = n[d], g = af(h, r, i);
    if (g.length >= 4 && o.push([g]), d === 0) continue;
    const y = Ay(n[d - 1], h, r, s);
    y.length >= 4 && o.push([y]);
  }
  const l = by(o), u = l ? Fy(l) : [];
  if (!u.length)
    return lo(cf(n, r), t.clipBounds);
  const a = typeof t.simplifyTolerance == "number" && Number.isFinite(t.simplifyTolerance) ? Math.max(0, t.simplifyTolerance) : Math.max(0.25, r * Cy), f = typeof t.smoothingPasses == "number" && Number.isFinite(t.smoothingPasses) ? Math.round(U(t.smoothingPasses, 0, Py)) : Ry, c = Uy(
    By(
      Ny(u, 1e-9),
      f
    ),
    a
  );
  return c.length < 4 ? lo(cf(n, r), t.clipBounds) : lo(c, t.clipBounds);
}
const Kn = [], df = [], Kt = {
  color: "#ff4d4f",
  width: 2,
  lineDash: Kn,
  lineJoin: "round",
  lineCap: "round",
  shadowColor: "rgba(0, 0, 0, 0)",
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0
}, Sm = {
  color: "#4cc9f0",
  width: 2,
  lineDash: [10, 8],
  lineJoin: "round",
  lineCap: "round",
  shadowColor: "rgba(0, 0, 0, 0)",
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0
}, Em = "rgba(23, 23, 25, 0.1)", Cm = 6, Dt = {
  fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 11,
  fontWeight: 600,
  textColor: "#171719",
  backgroundColor: "#FFCC00",
  borderColor: "rgba(0, 0, 0, 0)",
  borderWidth: 0,
  paddingX: 8,
  paddingY: 4,
  offsetY: 10,
  borderRadius: 4
}, mn = {
  fontFamily: "Pretendard, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  fontSize: 13,
  fontWeight: 500,
  textColor: "#FFFFFF",
  backgroundColor: "rgba(23, 23, 25, 0.5)",
  borderRadius: 4,
  paddingX: 6,
  paddingY: 3
}, hf = {
  x: 16,
  y: -24
}, Wy = 20, mf = 1e-6, pf = "transparent", Yy = 3, Vy = 2, Rm = 96, Xy = 1, gf = 1e3, Pm = 2, Mm = 2, Hy = 4096, Gy = 0.2, $y = 1.12, jy = 0.89, Zy = 32, qy = "#000000", Ky = 0.1, Qy = "#FFCF00", Jy = "#FF0000", e1 = 1.5, yf = [2, 2], t1 = 1, n1 = 0.25, r1 = 4, i1 = 1, o1 = 0, s1 = 4, l1 = 1.5;
function as(e, t, n) {
  return [U(e[0], 0, t), U(e[1], 0, n)];
}
function Ca(e) {
  if (!Array.isArray(e) || e.length < 2) return null;
  const t = Number(e[0]), n = Number(e[1]);
  return !Number.isFinite(t) || !Number.isFinite(n) ? null : [t, n];
}
const Ot = Ca;
function je(e) {
  return yt(e);
}
function Lo(e) {
  return Math.abs(ki(je(e)));
}
function vf(e) {
  if (!Array.isArray(e) || e.length === 0) return [0, 0, 0, 0];
  let t = 1 / 0, n = 1 / 0, r = -1 / 0, i = -1 / 0;
  for (const [o, s] of e)
    o < t && (t = o), o > r && (r = o), s < n && (n = s), s > i && (i = s);
  return [t, n, r, i];
}
function bi(e, t, n = !1) {
  if (t.length !== 0) {
    e.moveTo(t[0][0], t[0][1]);
    for (let r = 1; r < t.length; r += 1)
      e.lineTo(t[r][0], t[r][1]);
    n && e.closePath();
  }
}
function tt(e, t, n, r = !1, i = !1, o = "rgba(255, 77, 79, 0.16)") {
  t.length !== 0 && (e.beginPath(), bi(e, t, r), i && r && (e.fillStyle = o, e.fill()), e.strokeStyle = n.color, e.lineWidth = n.width, e.lineJoin = n.lineJoin, e.lineCap = n.lineCap, e.shadowColor = n.shadowColor, e.shadowBlur = n.shadowBlur, e.shadowOffsetX = n.shadowOffsetX, e.shadowOffsetY = n.shadowOffsetY, e.setLineDash(n.lineDash), e.stroke(), e.setLineDash(Kn), e.shadowColor = "rgba(0, 0, 0, 0)", e.shadowBlur = 0, e.shadowOffsetX = 0, e.shadowOffsetY = 0);
}
function Ra(e) {
  const t = Array.isArray(e?.lineDash) ? e.lineDash.filter((s) => Number.isFinite(s) && s >= 0) : Kn, n = typeof e?.width == "number" && Number.isFinite(e.width) ? Math.max(0, e.width) : Kt.width, r = typeof e?.shadowBlur == "number" && Number.isFinite(e.shadowBlur) ? Math.max(0, e.shadowBlur) : Kt.shadowBlur, i = typeof e?.shadowOffsetX == "number" && Number.isFinite(e.shadowOffsetX) ? e.shadowOffsetX : Kt.shadowOffsetX, o = typeof e?.shadowOffsetY == "number" && Number.isFinite(e.shadowOffsetY) ? e.shadowOffsetY : Kt.shadowOffsetY;
  return {
    color: e?.color || Kt.color,
    width: n,
    lineDash: t.length ? t : Kn,
    lineJoin: e?.lineJoin || Kt.lineJoin,
    lineCap: e?.lineCap || Kt.lineCap,
    shadowColor: e?.shadowColor || Kt.shadowColor,
    shadowBlur: r,
    shadowOffsetX: i,
    shadowOffsetY: o
  };
}
function nn(e, t) {
  return t ? Ra({
    color: t.color ?? e.color,
    width: t.width ?? e.width,
    lineDash: t.lineDash ?? e.lineDash,
    lineJoin: t.lineJoin ?? e.lineJoin,
    lineCap: t.lineCap ?? e.lineCap,
    shadowColor: t.shadowColor ?? e.shadowColor,
    shadowBlur: t.shadowBlur ?? e.shadowBlur,
    shadowOffsetX: t.shadowOffsetX ?? e.shadowOffsetX,
    shadowOffsetY: t.shadowOffsetY ?? e.shadowOffsetY
  }) : e;
}
function cs(e, t) {
  return e == null || t === null || t === void 0 ? !1 : String(e) === String(t);
}
function wf(e) {
  return typeof e == "number" && Number.isFinite(e);
}
function u1(e) {
  return Array.isArray(e) && e.length >= 2 && wf(e[0]) && wf(e[1]);
}
function a1(e) {
  return Array.isArray(e) && e.length >= 2 && e.every((t) => u1(t));
}
function Tm(e, t) {
  if (!(!Array.isArray(e) || e.length === 0)) {
    if (a1(e)) {
      t.push(e.map(([n, r]) => [n, r]));
      return;
    }
    for (const n of e)
      Tm(n, t);
  }
}
function xf(e, t) {
  const n = [];
  Tm(e, n);
  const r = [];
  for (const i of n) {
    if (i.length < 2) continue;
    const o = t ? je(i) : i;
    o.length >= (t ? 4 : 2) && r.push(o);
  }
  return r;
}
function ci(e, t) {
  return typeof e != "number" || !Number.isFinite(e) || e <= 0 ? t : e;
}
function c1(e, t) {
  return typeof e != "number" || !Number.isFinite(e) ? t : U(e, 0, 1);
}
function Am(e, t, n, r, i, o) {
  const s = Math.max(0, Math.min(o, r * 0.5, i * 0.5));
  e.beginPath(), e.moveTo(t + s, n), e.lineTo(t + r - s, n), e.quadraticCurveTo(t + r, n, t + r, n + s), e.lineTo(t + r, n + i - s), e.quadraticCurveTo(t + r, n + i, t + r - s, n + i), e.lineTo(t + s, n + i), e.quadraticCurveTo(t, n + i, t, n + i - s), e.lineTo(t, n + s), e.quadraticCurveTo(t, n, t + s, n), e.closePath();
}
function f1(e) {
  const t = e[0];
  return Array.isArray(t) && Array.isArray(t[0]);
}
function Fr(e, t, n) {
  if (!e || !t) return [];
  if (n) {
    const r = n.worldToScreen(e[0], e[1]), i = n.worldToScreen(t[0], t[1]);
    if (r && i) {
      const o = [
        [r[0], r[1]],
        [i[0], r[1]],
        [i[0], i[1]],
        [r[0], i[1]]
      ], s = [];
      for (const l of o) {
        const u = n.screenToWorld(l);
        if (!u) return Fr(e, t);
        s.push(u);
      }
      return je(s);
    }
  }
  return je([
    [e[0], e[1]],
    [t[0], e[1]],
    [t[0], t[1]],
    [e[0], t[1]]
  ]);
}
function fs(e, t, n = Rm) {
  if (!e || !t) return [];
  const r = (e[0] + t[0]) * 0.5, i = (e[1] + t[1]) * 0.5, o = Math.hypot(t[0] - e[0], t[1] - e[1]) * 0.5;
  if (o < 1) return [];
  const s = [];
  for (let l = 0; l <= n; l += 1) {
    const u = l / n * Math.PI * 2;
    s.push([r + Math.cos(u) * o, i + Math.sin(u) * o]);
  }
  return je(s);
}
function ds(e) {
  const t = ym(Ur(e));
  if (t.length === 0) return [];
  const n = [];
  for (const r of t) {
    const i = r[0];
    if (!i || i.length < 4) continue;
    const o = i.map(([l, u]) => [l, u]), s = [];
    for (let l = 1; l < r.length; l += 1) {
      const u = r[l];
      !u || u.length < 4 || s.push(u.map(([a, f]) => [a, f]));
    }
    n.push({
      outer: o,
      holes: s
    });
  }
  return n;
}
function d1(e) {
  if (!Array.isArray(e)) return yf;
  const t = e.filter((n) => Number.isFinite(n) && n >= 0);
  return t.length > 0 ? t : yf;
}
function h1(e) {
  return typeof e != "number" || !Number.isFinite(e) ? t1 : U(e, n1, r1);
}
function m1(e) {
  return typeof e != "number" || !Number.isFinite(e) ? i1 : Math.round(U(e, o1, s1));
}
function p1(e) {
  const t = ci(e?.radius, Zy), n = ci(e?.cursorLineWidth, e1), r = h1(e?.edgeDetail), i = m1(e?.edgeSmoothing);
  return {
    radius: t,
    edgeDetail: r,
    edgeSmoothing: i,
    clickSelectRoi: e?.clickSelectRoi === !0,
    fillColor: e?.fillColor || qy,
    fillOpacity: c1(e?.fillOpacity, Ky),
    cursorColor: e?.cursorColor || Qy,
    cursorActiveColor: e?.cursorActiveColor || Jy,
    cursorLineWidth: n,
    cursorLineDash: d1(e?.cursorLineDash)
  };
}
function g1(e, t, n) {
  if (!t.isDrawing || t.screenPoints.length === 0) return;
  const r = t.screenPoints;
  if (r.length === 0) return;
  const i = n.radius;
  if (!(!Number.isFinite(i) || i <= 0)) {
    if (e.save(), e.globalAlpha = n.fillOpacity, e.fillStyle = n.fillColor, e.strokeStyle = n.fillColor, e.lineCap = "round", e.lineJoin = "round", e.lineWidth = i * 2, r.length === 1)
      e.beginPath(), e.arc(r[0][0], r[0][1], i, 0, Math.PI * 2), e.fill();
    else {
      e.beginPath(), e.moveTo(r[0][0], r[0][1]);
      for (let o = 1; o < r.length; o += 1)
        e.lineTo(r[o][0], r[o][1]);
      e.stroke();
    }
    e.restore();
  }
}
function y1(e, t, n, r) {
  const i = t.cursor;
  if (!i) return;
  const o = t.cursorScreen ?? Ot(n?.worldToScreen(i[0], i[1]) ?? []);
  if (!o) return;
  const s = r.radius;
  !Number.isFinite(s) || s <= 0 || (e.save(), e.beginPath(), e.arc(o[0], o[1], s, 0, Math.PI * 2), e.strokeStyle = t.isDrawing ? r.cursorActiveColor : r.cursorColor, e.lineWidth = r.cursorLineWidth, e.setLineDash(r.cursorLineDash), e.stroke(), e.setLineDash(Kn), e.restore());
}
const v1 = 0.58, w1 = 4096, x1 = 0.5;
let uo = null;
const ao = /* @__PURE__ */ new Map();
function S1() {
  if (uo) return uo;
  if (typeof document > "u") return null;
  const t = document.createElement("canvas").getContext("2d");
  return t ? (uo = t, uo) : null;
}
function Pa(e, t) {
  const n = `${t.fontWeight}|${t.fontSize}|${t.fontFamily}|${e}`, r = ao.get(n);
  if (r !== void 0) return r;
  const i = e.length * t.fontSize * v1, o = S1();
  let s = i;
  if (o) {
    o.font = `${t.fontWeight} ${t.fontSize}px ${t.fontFamily}`;
    const l = o.measureText(e).width;
    Number.isFinite(l) && l >= 0 && (s = l);
  }
  return ao.size > w1 && ao.clear(), ao.set(n, s), s;
}
function E1(e, t = "top-center") {
  if (!e.length) return null;
  let n = 1 / 0;
  for (const o of e)
    o[1] < n && (n = o[1]);
  if (!Number.isFinite(n)) return null;
  let r = 1 / 0, i = -1 / 0;
  for (const o of e)
    Math.abs(o[1] - n) > x1 || (o[0] < r && (r = o[0]), o[0] > i && (i = o[0]));
  return !Number.isFinite(r) || !Number.isFinite(i) ? null : t === "top-center" ? [(r + i) * 0.5, n] : [r, n];
}
function Ma(e, t = "top-center") {
  let n = null;
  for (const r of e) {
    const i = E1(r.outer, t);
    i && (!n || i[1] < n[1] || i[1] === n[1] && i[0] < n[0]) && (n = i);
  }
  return n;
}
function Ta(e) {
  const t = typeof e?.paddingX == "number" && Number.isFinite(e.paddingX) ? Math.max(0, e.paddingX) : Dt.paddingX, n = typeof e?.paddingY == "number" && Number.isFinite(e.paddingY) ? Math.max(0, e.paddingY) : Dt.paddingY, r = typeof e?.fontSize == "number" && Number.isFinite(e.fontSize) ? Math.max(8, e.fontSize) : Dt.fontSize, i = typeof e?.borderWidth == "number" && Number.isFinite(e.borderWidth) ? Math.max(0, e.borderWidth) : Dt.borderWidth, o = typeof e?.offsetY == "number" && Number.isFinite(e.offsetY) ? e.offsetY : Dt.offsetY, s = typeof e?.borderRadius == "number" && Number.isFinite(e.borderRadius) ? Math.max(0, e.borderRadius) : Dt.borderRadius;
  return {
    fontFamily: e?.fontFamily || Dt.fontFamily,
    fontSize: r,
    fontWeight: e?.fontWeight || Dt.fontWeight,
    textColor: e?.textColor || Dt.textColor,
    backgroundColor: e?.backgroundColor || Dt.backgroundColor,
    borderColor: e?.borderColor || Dt.borderColor,
    borderWidth: i,
    paddingX: t,
    paddingY: n,
    offsetY: o,
    borderRadius: s
  };
}
function Aa(e, t) {
  return t ? Ta({
    fontFamily: t.fontFamily ?? e.fontFamily,
    fontSize: t.fontSize ?? e.fontSize,
    fontWeight: t.fontWeight ?? e.fontWeight,
    textColor: t.textColor ?? e.textColor,
    backgroundColor: t.backgroundColor ?? e.backgroundColor,
    borderColor: t.borderColor ?? e.borderColor,
    borderWidth: t.borderWidth ?? e.borderWidth,
    paddingX: t.paddingX ?? e.paddingX,
    paddingY: t.paddingY ?? e.paddingY,
    offsetY: t.offsetY ?? e.offsetY,
    borderRadius: t.borderRadius ?? e.borderRadius
  }) : e;
}
function _a(e, t, n, r) {
  if (!e || !n) return 0;
  const i = Number(n.minZoom), o = Number(n.maxZoom);
  if (!Number.isFinite(i) || !Number.isFinite(o) || o - i <= mf || !Number.isFinite(t)) return 0;
  let s = o;
  r != null && Number.isFinite(r) && (s = U(r, i, o));
  const l = Math.max(mf, Math.abs(s) * 1e-9);
  return t >= s - l ? Wy : 0;
}
function C1(e) {
  const t = typeof e?.fontSize == "number" && Number.isFinite(e.fontSize) ? Math.max(8, e.fontSize) : mn.fontSize, n = typeof e?.borderRadius == "number" && Number.isFinite(e.borderRadius) ? Math.max(0, e.borderRadius) : mn.borderRadius, r = typeof e?.paddingX == "number" && Number.isFinite(e.paddingX) ? Math.max(0, e.paddingX) : mn.paddingX, i = typeof e?.paddingY == "number" && Number.isFinite(e.paddingY) ? Math.max(0, e.paddingY) : mn.paddingY;
  return {
    fontFamily: e?.fontFamily || mn.fontFamily,
    fontSize: t,
    fontWeight: e?.fontWeight || mn.fontWeight,
    textColor: e?.textColor || mn.textColor,
    backgroundColor: e?.backgroundColor || mn.backgroundColor,
    borderRadius: n,
    paddingX: r,
    paddingY: i
  };
}
function R1(e) {
  const t = typeof e?.x == "number" && Number.isFinite(e.x) ? e.x : hf.x, n = typeof e?.y == "number" && Number.isFinite(e.y) ? e.y : hf.y;
  return { x: t, y: n };
}
function P1(e) {
  return Number.isFinite(e) ? `${Math.max(0, e).toFixed(3)} mm²` : "0.000 mm²";
}
function M1(e) {
  const t = typeof e?.format == "function" ? e.format : P1, n = R1(e?.cursorOffset);
  return {
    enabled: e?.enabled === !0,
    format: t,
    style: C1(e?.style),
    cursorOffsetX: n.x,
    cursorOffsetY: n.y
  };
}
function _m(e, t, n, r, i, o, s = !0) {
  const l = t.trim();
  if (!l) return;
  e.save(), e.font = `${o.fontWeight} ${o.fontSize}px ${o.fontFamily}`, e.textAlign = "center", e.textBaseline = "middle";
  const a = Pa(l, o) + o.paddingX * 2, f = o.fontSize + o.paddingY * 2, c = n[0], d = n[1] - o.offsetY, h = s ? U(c, a * 0.5 + 1, r - a * 0.5 - 1) : c, g = s ? U(d, f * 0.5 + 1, i - f * 0.5 - 1) : d, y = h - a * 0.5, x = g - f * 0.5;
  e.fillStyle = o.backgroundColor, e.strokeStyle = o.borderColor, e.lineWidth = o.borderWidth, Am(e, y, x, a, f, o.borderRadius), e.fill(), o.borderWidth > 0 && e.stroke(), e.fillStyle = o.textColor, e.fillText(l, h, g + 0.5), e.restore();
}
function T1(e, t, n, r, i, o, s, l) {
  const u = t.trim();
  if (!u) return;
  e.save(), e.font = `${o.fontWeight} ${o.fontSize}px ${o.fontFamily}`, e.textAlign = "center", e.textBaseline = "middle";
  const f = Pa(u, o) + o.paddingX * 2, c = o.fontSize + o.paddingY * 2, d = U(n[0] + s, f * 0.5 + 1, r - f * 0.5 - 1), h = U(n[1] + l, c * 0.5 + 1, i - c * 0.5 - 1), g = d - f * 0.5, y = h - c * 0.5;
  e.fillStyle = o.backgroundColor, Am(e, g, y, f, c, o.borderRadius), e.fill(), e.fillStyle = o.textColor, e.fillText(u, d, h + 0.5), e.restore();
}
function A1(e, t, n, r) {
  if (!(t.length < 4 || n.length === 0)) {
    e.save(), e.beginPath(), bi(e, t, !0);
    for (const i of n)
      i.length < 4 || bi(e, i, !0);
    e.fillStyle = r, e.fill("evenodd"), e.restore();
  }
}
function km(e) {
  const { ctx: t, overlayShapes: n, imageOuterRing: r, worldToScreenPoints: i, baseStrokeStyle: o, onInvertedFillDebug: s } = e, l = !!globalThis.__OPEN_PLANT_DEBUG_OVERLAY__;
  for (let u = 0; u < n.length; u += 1) {
    const a = n[u];
    if (!a?.coordinates?.length || a.visible === !1) continue;
    const f = a.closed ?? f1(a.coordinates), c = xf(a.coordinates, f);
    if (a.invertedFill?.fillColor) {
      const h = [], g = xf(a.coordinates, !0);
      for (const y of g) {
        const x = i(y);
        x.length >= 4 && h.push(x);
      }
      l && s && s({
        id: a.id ?? u,
        outerRingPoints: r.length,
        sourceRingCount: g.length,
        holeRingCount: h.length,
        fillColor: a.invertedFill.fillColor
      }), A1(t, r, h, a.invertedFill.fillColor);
    }
    if (c.length === 0) continue;
    const d = nn(o, a.stroke ?? a.strokeStyle);
    for (const h of c) {
      const g = i(h);
      g.length < 2 || tt(t, g, d, f, a.fill ?? !1);
    }
  }
}
function co(e) {
  return typeof e == "string" && (e === "stamp-rectangle" || e === "stamp-circle" || e === "stamp-rectangle-4096px" || e === "stamp-rectangle-2mm2" || e === "stamp-circle-2mm2" || e === "stamp-circle-hpf-0.2mm2");
}
function _1(e) {
  return {
    rectangleAreaMm2: ci(e?.rectangleAreaMm2, Pm),
    circleAreaMm2: ci(e?.circleAreaMm2, Mm),
    rectanglePixelSize: ci(e?.rectanglePixelSize, Hy)
  };
}
const Sf = 1e3;
function k1(e) {
  return e * Sf * Sf;
}
function Ef(e, t, n) {
  if (!e || !Number.isFinite(t) || t <= 0) return [];
  if (n) {
    const r = n.worldToScreen(e[0], e[1]), i = n.worldToScreen(e[0] + t, e[1]);
    if (r && i) {
      const o = Math.hypot(i[0] - r[0], i[1] - r[1]), s = [
        [r[0] - o, r[1] - o],
        [r[0] + o, r[1] - o],
        [r[0] + o, r[1] + o],
        [r[0] - o, r[1] + o]
      ], l = [];
      for (const u of s) {
        const a = n.screenToWorld(u);
        if (!a) throw new Error("Failed to create rectangle");
        l.push(a);
      }
      return je(l);
    }
  }
  return je([
    [e[0] - t, e[1] - t],
    [e[0] + t, e[1] - t],
    [e[0] + t, e[1] + t],
    [e[0] - t, e[1] + t]
  ]);
}
function I1(e, t, n = Rm) {
  if (!e || !Number.isFinite(t) || t <= 0) return [];
  const r = [];
  for (let i = 0; i <= n; i += 1) {
    const o = i / n * Math.PI * 2;
    r.push([e[0] + Math.cos(o) * t, e[1] + Math.sin(o) * t]);
  }
  return je(r);
}
function b1(e) {
  const { stampTool: t, center: n, resolvedStampOptions: r, imageWidth: i, imageHeight: o, micronsToWorldPixels: s, getRectangleProjection: l } = e;
  if (!n) return [];
  if (t === "stamp-rectangle-4096px") {
    const c = r.rectanglePixelSize * 0.5;
    return Ef(n, c, l()).map((d) => as(d, i, o));
  }
  let u = 0;
  if (t === "stamp-rectangle" || t === "stamp-rectangle-2mm2" ? u = t === "stamp-rectangle-2mm2" ? Pm : r.rectangleAreaMm2 : (t === "stamp-circle" || t === "stamp-circle-2mm2" || t === "stamp-circle-hpf-0.2mm2") && (u = t === "stamp-circle-hpf-0.2mm2" ? Gy : t === "stamp-circle-2mm2" ? Mm : r.circleAreaMm2), !Number.isFinite(u) || u <= 0) return [];
  const a = k1(u);
  let f = [];
  if (t === "stamp-rectangle" || t === "stamp-rectangle-2mm2") {
    const c = s(Math.sqrt(a) * 0.5);
    f = Ef(n, c, l());
  } else if (t === "stamp-circle" || t === "stamp-circle-2mm2" || t === "stamp-circle-hpf-0.2mm2") {
    const c = s(Math.sqrt(a / Math.PI));
    f = I1(n, c);
  }
  return f.length ? f.map((c) => as(c, i, o)) : [];
}
function L1(e) {
  return {
    color: Em,
    width: Cm,
    lineDash: Kn,
    lineJoin: e.lineJoin,
    lineCap: e.lineCap,
    shadowColor: "rgba(0, 0, 0, 0)",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0
  };
}
function F1(e) {
  if (typeof e != "string") return pf;
  const t = e.trim();
  return t.length > 0 ? t : pf;
}
function Cf(e) {
  return Array.isArray(e) && e.length >= 4 && Lo(e) > Xy;
}
function Im({
  tool: e,
  imageWidth: t,
  imageHeight: n,
  imageMpp: r,
  imageZoom: i,
  stampOptions: o,
  brushOptions: s,
  projectorRef: l,
  onBrushTap: u,
  onDrawComplete: a,
  onPatchComplete: f,
  enabled: c,
  viewStateSignal: d,
  persistedRegions: h,
  patchRegions: g,
  persistedPolygons: y,
  drawFillColor: x,
  regionStrokeStyle: p,
  regionStrokeHoverStyle: m,
  regionStrokeActiveStyle: v,
  patchStrokeStyle: w,
  resolveRegionStrokeStyle: E,
  resolveRegionLabelStyle: C,
  overlayShapes: A,
  hoveredRegionId: M = null,
  activeRegionId: N = null,
  regionLabelStyle: I,
  drawAreaTooltip: B,
  autoLiftRegionLabelAtMaxZoom: O = !1,
  regionLabelAnchor: L = "top-center",
  clampRegionLabelToViewport: G = !0,
  regionLabelAutoLiftOffsetPx: $,
  invalidateRef: Y,
  className: Q,
  style: _
}) {
  const D = S.useRef(null), q = S.useRef(!1), ne = S.useRef(/* @__PURE__ */ new Map()), le = S.useRef(e), F = S.useRef({
    isDrawing: !1,
    pointerId: null,
    start: null,
    current: null,
    cursor: null,
    cursorScreen: null,
    points: [],
    screenPoints: [],
    stampCenter: null
  }), b = c ?? e !== "cursor", V = S.useMemo(() => h && h.length > 0 ? h : !y || y.length === 0 ? df : y.map((P, T) => ({
    id: T,
    coordinates: P
  })), [h, y]), ue = S.useMemo(() => g ?? df, [g]), re = S.useMemo(() => {
    const P = [];
    for (let T = 0; T < V.length; T += 1) {
      const W = V[T], H = ds(W.coordinates);
      H.length !== 0 && P.push({
        region: W,
        regionIndex: T,
        regionKey: W.id ?? T,
        polygons: H
      });
    }
    return P;
  }, [V]), me = S.useMemo(() => {
    const P = [];
    for (let T = 0; T < ue.length; T += 1) {
      const W = ue[T], H = ds(W.coordinates);
      H.length !== 0 && P.push({
        region: W,
        regionIndex: T,
        regionKey: W.id ?? T,
        polygons: H
      });
    }
    return P;
  }, [ue]), ge = S.useMemo(() => Ra(p), [p]), Se = S.useMemo(() => nn(ge, m), [ge, m]), pe = S.useMemo(() => nn(ge, v), [ge, v]), Re = S.useMemo(() => nn(Sm, w), [w]), de = S.useMemo(() => F1(x), [x]), xe = S.useMemo(() => Ta(I), [I]), J = S.useMemo(() => M1(B), [B]), te = S.useMemo(() => _1(o), [o]), ee = S.useMemo(() => p1(s), [s]), fe = S.useMemo(
    () => ({
      position: "absolute",
      inset: 0,
      zIndex: 2,
      width: "100%",
      height: "100%",
      display: "block",
      touchAction: "none",
      pointerEvents: b ? "auto" : "none",
      cursor: b ? e === "brush" ? "none" : "crosshair" : "default",
      ..._
    }),
    [b, e, _]
  ), oe = S.useCallback(() => {
    const P = D.current;
    if (!P) return;
    const T = P.getBoundingClientRect(), W = Math.max(1, window.devicePixelRatio || 1), H = Math.max(1, Math.round(T.width * W)), ie = Math.max(1, Math.round(T.height * W));
    (P.width !== H || P.height !== ie) && (P.width = H, P.height = ie);
  }, []), ye = S.useCallback(
    (P) => {
      const T = l.current;
      if (!T || P.length === 0) return [];
      const W = new Array(P.length);
      for (let H = 0; H < P.length; H += 1) {
        const ie = Ot(T.worldToScreen(P[H][0], P[H][1]));
        if (!ie) return [];
        W[H] = ie;
      }
      return W;
    },
    [l]
  ), Ie = S.useCallback(
    (P) => {
      const T = l.current, W = D.current;
      if (!T || !W) return null;
      const H = W.getBoundingClientRect(), ie = Ot(T.screenToWorld(H.left + P[0], H.top + P[1]));
      return ie ? as(ie, t, n) : null;
    },
    [l, t, n]
  ), ze = S.useCallback(() => {
    const P = l.current, T = P?.getViewState?.().rotationDeg ?? 0;
    if (!(Math.abs(T % 360) < 0.01 || !P))
      return {
        worldToScreen: (W, H) => Ot(P.worldToScreen(W, H)),
        screenToWorld: Ie
      };
  }, [l, Ie]), Pe = S.useCallback(
    (P) => {
      if (!Number.isFinite(P) || P <= 0) return 0;
      const T = typeof r == "number" && Number.isFinite(r) && r > 0 ? r : 1, W = typeof i == "number" && Number.isFinite(i) ? i : 0, H = l.current?.getViewState?.().zoom, ie = typeof H == "number" && Number.isFinite(H) && H > 0 ? H : 1, Be = W + Math.log2(ie), ve = Math.max(1e-9, Ea(T, W, Be));
      return P / ve / ie;
    },
    [r, i, l]
  ), Me = S.useCallback(
    (P, T) => b1({
      stampTool: P,
      center: T,
      resolvedStampOptions: te,
      imageWidth: t,
      imageHeight: n,
      micronsToWorldPixels: Pe,
      getRectangleProjection: ze
    }),
    [Pe, t, n, te, ze]
  ), Ke = S.useCallback(() => {
    const P = F.current;
    return co(e) ? Me(e, P.stampCenter) : e === "brush" ? [] : P.isDrawing ? e === "freehand" ? P.points : e === "rectangle" ? Fr(P.start, P.current, ze()) : e === "circular" ? fs(P.start, P.current) : [] : [];
  }, [e, Me, ze]), j = S.useCallback(() => {
    oe();
    const P = D.current;
    if (!P) return;
    const T = P.getContext("2d");
    if (!T) return;
    const W = Math.max(1, window.devicePixelRatio || 1), H = P.width / W, ie = P.height / W;
    if (T.setTransform(1, 0, 0, 1, 0, 0), T.clearRect(0, 0, P.width, P.height), T.setTransform(W, 0, 0, W, 0, 0), re.length > 0)
      for (const ve of re) {
        const { region: Ee, polygons: Ne, regionIndex: Oe, regionKey: ct } = ve, Ft = cs(N, ct) ? "active" : cs(M, ct) ? "hover" : "default";
        let dn = Ft === "active" ? pe : Ft === "hover" ? Se : ge;
        if (E) {
          const Vi = E({
            region: Ee,
            regionId: ct,
            regionIndex: Oe,
            state: Ft
          });
          dn = nn(dn, Vi || void 0);
        }
        const Yi = Ft === "default" ? null : L1(dn);
        for (const Vi of Ne) {
          const bs = ye(Vi.outer);
          bs.length >= 4 && (Yi && tt(T, bs, Yi, !0, !1), tt(T, bs, dn, !0, !1));
          for (const dp of Vi.holes) {
            const Ls = ye(dp);
            Ls.length >= 4 && (Yi && tt(T, Ls, Yi, !0, !1), tt(T, Ls, dn, !0, !1));
          }
        }
      }
    if (me.length > 0)
      for (const ve of me)
        for (const Ee of ve.polygons) {
          const Ne = ye(Ee.outer);
          Ne.length >= 4 && tt(T, Ne, Re, !0, !1);
          for (const Oe of Ee.holes) {
            const ct = ye(Oe);
            ct.length >= 4 && tt(T, ct, Re, !0, !1);
          }
        }
    if (Array.isArray(A) && A.length > 0) {
      const ve = ye(
        je([
          [0, 0],
          [t, 0],
          [t, n],
          [0, n]
        ])
      );
      km({
        ctx: T,
        overlayShapes: A,
        imageOuterRing: ve,
        worldToScreenPoints: ye,
        baseStrokeStyle: ge,
        onInvertedFillDebug: globalThis.__OPEN_PLANT_DEBUG_OVERLAY__ ? (Ee) => {
          const Ne = String(Ee.id), Oe = `${Ee.outerRingPoints}|${Ee.sourceRingCount}|${Ee.holeRingCount}|${Ee.fillColor}`;
          ne.current.get(Ne) !== Oe && (ne.current.set(Ne, Oe), console.debug("[open-plant] invertedFill", Ee));
        } : void 0
      });
    }
    const Be = Ke();
    if (b) {
      if (e === "brush")
        g1(T, F.current, ee), y1(T, F.current, l.current, ee);
      else if (Be.length > 0)
        if (e === "freehand") {
          const ve = ye(Be);
          ve.length >= 2 && tt(T, ve, ge, !1, !1), ve.length >= 3 && tt(T, ye(je(Be)), ge, !0, !0, de);
        } else {
          const ve = ye(Be);
          ve.length >= 4 && tt(T, ve, ge, !0, !0, de);
        }
    }
    if (re.length > 0) {
      const ve = Math.max(1e-6, l.current?.getViewState?.().zoom ?? 1), Ee = typeof $ == "number" && Number.isFinite($) ? Math.max(0, $) : _a(
        O,
        ve,
        l.current?.getZoomRange?.(),
        l.current?.getRegionLabelAutoLiftCapZoom?.()
      );
      for (const Ne of re) {
        if (!Ne.region.label) continue;
        const Oe = Ma(Ne.polygons, L);
        if (!Oe) continue;
        const ct = Ot(l.current?.worldToScreen(Oe[0], Oe[1]) ?? []);
        if (!ct) continue;
        let Ft = Aa(
          xe,
          C?.({
            region: Ne.region,
            regionId: Ne.regionKey,
            regionIndex: Ne.regionIndex,
            zoom: ve
          })
        );
        Ee > 0 && (Ft = {
          ...Ft,
          offsetY: Ft.offsetY + Ee
        }), _m(T, Ne.region.label, ct, H, ie, Ft, G);
      }
    }
    if (J.enabled && b && (e === "freehand" || e === "rectangle" || e === "circular")) {
      const ve = F.current;
      if (ve.isDrawing) {
        const Ee = e === "freehand" ? je(Be) : Be;
        if (Ee.length >= 4) {
          const Ne = Lo(Ee), Oe = typeof r == "number" && Number.isFinite(r) && r > 0 ? r : 0, ct = Oe > 0 ? Ne * Oe * Oe / (gf * gf) : 0, Ft = J.format(ct), dn = ve.cursorScreen ?? (ve.current ? Ot(l.current?.worldToScreen(ve.current[0], ve.current[1]) ?? []) : null);
          dn && T1(
            T,
            Ft,
            dn,
            H,
            ie,
            J.style,
            J.cursorOffsetX,
            J.cursorOffsetY
          );
        }
      }
    }
  }, [
    b,
    e,
    Ke,
    oe,
    ye,
    t,
    n,
    l,
    re,
    A,
    M,
    N,
    ge,
    Se,
    pe,
    de,
    me,
    Re,
    E,
    C,
    xe,
    J,
    O,
    L,
    G,
    $,
    r,
    ee
  ]), z = S.useCallback(() => {
    q.current || (q.current = !0, requestAnimationFrame(() => {
      q.current = !1, j();
    }));
  }, [j]), Z = S.useCallback((P = !1) => {
    const T = F.current, W = D.current;
    W && T.pointerId !== null && W.hasPointerCapture(T.pointerId) && W.releasePointerCapture(T.pointerId), T.isDrawing = !1, T.pointerId = null, T.start = null, T.current = null, T.points = [], T.screenPoints = [], T.stampCenter = null, P || (T.cursor = null, T.cursorScreen = null);
  }, []), K = S.useCallback(
    (P) => {
      const T = l.current;
      if (!T || t <= 0 || n <= 0) return null;
      const W = Ot(T.screenToWorld(P.clientX, P.clientY));
      return W ? as(W, t, n) : null;
    },
    [l, t, n]
  ), ae = S.useCallback((P) => {
    const T = D.current;
    if (!T) return null;
    const W = T.getBoundingClientRect(), H = U(P.clientX - W.left, 0, W.width), ie = U(P.clientY - W.top, 0, W.height);
    return !Number.isFinite(H) || !Number.isFinite(ie) ? null : [H, ie];
  }, []), se = S.useCallback(() => {
    const P = F.current;
    if (!P.isDrawing) {
      Z(!0), z();
      return;
    }
    let T = [];
    if (e === "freehand")
      P.points.length >= Yy && (T = je(P.points));
    else if (e === "rectangle")
      T = Fr(P.start, P.current, ze());
    else if (e === "circular")
      T = fs(P.start, P.current);
    else if (e === "brush") {
      const W = P.points[P.points.length - 1] ?? P.current ?? P.start;
      if (ee.clickSelectRoi && W && P.points.length <= 1 && u?.(W)) {
        Z(!0), z();
        return;
      }
      const H = Math.max(0.25, ee.edgeDetail), ie = P.screenPoints.length > 0 ? P.screenPoints : ye(P.points), Be = Math.max(0.5, ee.radius * 0.04 / H), ve = Oy(ie, {
        radius: ee.radius,
        circleSides: Math.max(16, Math.round(32 * H)),
        simplifyTolerance: Be,
        smoothingPasses: ee.edgeSmoothing
      }), Ee = [];
      for (const Ne of ve) {
        const Oe = Ie(Ne);
        Oe && Ee.push(Oe);
      }
      T = je(Ee);
    }
    (e === "freehand" || e === "rectangle" || e === "circular" || e === "brush") && Cf(T) && a && a({
      tool: e,
      intent: e === "brush" ? "brush" : "roi",
      coordinates: T,
      bbox: vf(T),
      areaPx: Lo(T)
    }), Z(!0), z();
  }, [
    e,
    a,
    Z,
    z,
    ye,
    Ie,
    ze,
    ee.radius,
    ee.edgeDetail,
    ee.edgeSmoothing,
    ee.clickSelectRoi,
    u
  ]), Ye = S.useCallback(
    (P, T) => {
      const W = Me(P, T);
      if (!Cf(W)) return;
      const H = P === "stamp-rectangle-4096px" ? "patch" : "roi", ie = {
        tool: P,
        intent: H,
        coordinates: W,
        bbox: vf(W),
        areaPx: Lo(W)
      };
      a?.(ie), H === "patch" && f && f(ie);
    },
    [Me, a, f]
  ), Lt = S.useCallback(
    (P, T, W) => {
      const H = Math.max(l1, ee.radius * 0.1), ie = H * H, Be = P.screenPoints[P.screenPoints.length - 1];
      if (!Be) {
        P.points.push(T), P.screenPoints.push(W), P.current = T;
        return;
      }
      const ve = W[0] - Be[0], Ee = W[1] - Be[1];
      ve * ve + Ee * Ee >= ie ? (P.points.push(T), P.screenPoints.push(W)) : (P.points[P.points.length - 1] = T, P.screenPoints[P.screenPoints.length - 1] = W), P.current = T;
    },
    [ee.radius]
  ), fn = S.useCallback(
    (P) => {
      if (!b || e === "cursor" || P.button !== 0) return;
      const T = K(P);
      if (!T) return;
      const W = ae(P);
      if (!W) return;
      if (P.preventDefault(), P.stopPropagation(), co(e)) {
        const Be = F.current;
        Be.stampCenter = T, Ye(e, T), z();
        return;
      }
      const H = D.current;
      H && H.setPointerCapture(P.pointerId);
      const ie = F.current;
      ie.isDrawing = !0, ie.pointerId = P.pointerId, ie.start = T, ie.current = T, ie.cursor = T, ie.cursorScreen = W, ie.points = e === "freehand" || e === "brush" ? [T] : [], ie.screenPoints = e === "brush" ? [W] : [], z();
    },
    [b, e, K, ae, Ye, z]
  ), Un = S.useCallback(
    (P) => {
      if (!b || e === "cursor") return;
      const T = K(P);
      if (!T) return;
      const W = ae(P);
      if (!W) return;
      const H = F.current;
      if (H.cursor = T, H.cursorScreen = W, co(e)) {
        H.stampCenter = T, P.preventDefault(), P.stopPropagation(), z();
        return;
      }
      if (e === "brush") {
        if (!H.isDrawing || H.pointerId !== P.pointerId) {
          z();
          return;
        }
        P.preventDefault(), P.stopPropagation(), Lt(H, T, W), z();
        return;
      }
      if (!(!H.isDrawing || H.pointerId !== P.pointerId)) {
        if (P.preventDefault(), P.stopPropagation(), e === "freehand") {
          const ie = l.current, Be = Math.max(1e-6, ie?.getViewState?.().zoom ?? 1), ve = Vy / Be, Ee = ve * ve, Ne = H.points[H.points.length - 1];
          if (!Ne)
            H.points.push(T);
          else {
            const Oe = T[0] - Ne[0], ct = T[1] - Ne[1];
            Oe * Oe + ct * ct >= Ee && H.points.push(T);
          }
        } else
          H.current = T;
        z();
      }
    },
    [b, e, K, ae, z, l, Lt]
  ), nr = S.useCallback(
    (P) => {
      const T = F.current;
      if (!T.isDrawing || T.pointerId !== P.pointerId) return;
      P.preventDefault(), P.stopPropagation();
      const W = K(P), H = ae(P);
      W && (T.cursor = W, H && (T.cursorScreen = H), e === "brush" ? H && Lt(T, W, H) : T.current = W);
      const ie = D.current;
      ie && ie.hasPointerCapture(P.pointerId) && ie.releasePointerCapture(P.pointerId), se();
    },
    [se, K, ae, e, Lt]
  ), fp = S.useCallback(() => {
    const P = F.current;
    let T = !1;
    e === "brush" && !P.isDrawing && P.cursor && (P.cursor = null, P.cursorScreen = null, T = !0), co(e) && P.stampCenter && (P.stampCenter = null, T = !0), T && z();
  }, [e, z]);
  return S.useEffect(() => {
    oe(), z();
    const P = D.current;
    if (!P) return;
    const T = new ResizeObserver(() => {
      oe(), z();
    });
    return T.observe(P), () => {
      T.disconnect();
    };
  }, [oe, z]), S.useEffect(() => {
    b || Z(), z();
  }, [b, z, Z]), S.useEffect(() => {
    le.current !== e && (le.current = e, Z(), z());
  }, [e, Z, z]), S.useEffect(() => {
    z();
  }, [d, V, A, z]), S.useEffect(() => {
    if (Y)
      return Y.current = z, () => {
        Y.current === z && (Y.current = null);
      };
  }, [Y, z]), S.useEffect(() => {
    if (!b) return;
    const P = (T) => {
      T.key === "Escape" && (Z(), z());
    };
    return window.addEventListener("keydown", P), () => {
      window.removeEventListener("keydown", P);
    };
  }, [b, Z, z]), /* @__PURE__ */ At.jsx(
    "canvas",
    {
      ref: D,
      className: Q,
      style: fe,
      onPointerDown: fn,
      onPointerMove: Un,
      onPointerUp: nr,
      onPointerCancel: nr,
      onPointerLeave: fp,
      onContextMenu: (P) => {
        b && P.preventDefault();
      },
      onWheel: (P) => {
        if (!b) return;
        const T = D.current, W = l.current;
        if (!T || typeof W?.zoomBy != "function") return;
        P.preventDefault(), P.stopPropagation();
        const H = T.getBoundingClientRect(), ie = P.clientX - H.left, Be = P.clientY - H.top;
        W.zoomBy(P.deltaY < 0 ? $y : jy, ie, Be), z();
      }
    }
  );
}
const bm = S.createContext(null), N1 = bm.Provider;
function tr() {
  const e = S.useContext(bm);
  if (!e)
    throw new Error("useViewerContext must be used within a <WsiViewer>");
  return e;
}
function D1({ tool: e = "cursor", stampOptions: t, brushOptions: n, fillColor: r, areaTooltip: i, onComplete: o, onPatchComplete: s, onBrushTap: l }) {
  const { source: u, rendererRef: a, rendererSerial: f, setInteractionLock: c } = tr(), d = e !== "cursor";
  S.useEffect(() => (c("drawing-layer", d), () => c("drawing-layer", !1)), [d, c]);
  const h = S.useMemo(() => a.current?.getViewState(), [f]);
  return u ? /* @__PURE__ */ At.jsx(
    Im,
    {
      tool: e,
      enabled: d,
      imageWidth: u.width,
      imageHeight: u.height,
      imageMpp: u.mpp,
      imageZoom: u.maxTierZoom,
      stampOptions: t,
      brushOptions: n,
      drawFillColor: r,
      projectorRef: a,
      onBrushTap: l,
      viewStateSignal: h,
      drawAreaTooltip: i,
      onDrawComplete: o,
      onPatchComplete: s
    }
  ) : null;
}
function Rf(e, t, n, r) {
  return [Math.min(e, n), Math.min(t, r), Math.max(e, n), Math.max(t, r)];
}
function Pf(e, t) {
  return !(e[2] < t[0] || e[0] > t[2] || e[3] < t[1] || e[1] > t[3]);
}
class z1 {
  constructor(t = 16) {
    R(this, "targetNodeSize");
    R(this, "items", []);
    R(this, "globalBounds", [0, 0, 0, 0]);
    R(this, "gridSize", 1);
    R(this, "cellWidth", 1);
    R(this, "cellHeight", 1);
    R(this, "buckets", []);
    R(this, "visited", new Uint32Array(0));
    R(this, "querySerial", 1);
    const n = Number.isFinite(t) ? Math.floor(t) : 16;
    this.targetNodeSize = Math.max(1, n);
  }
  load(t) {
    if (!Array.isArray(t) || t.length === 0) {
      this.items = [], this.globalBounds = [0, 0, 0, 0], this.gridSize = 1, this.cellWidth = 1, this.cellHeight = 1, this.buckets = [], this.visited = new Uint32Array(0), this.querySerial = 1;
      return;
    }
    const n = [];
    let r = 1 / 0, i = 1 / 0, o = -1 / 0, s = -1 / 0;
    for (const f of t) {
      if (!f || !Number.isFinite(f.minX) || !Number.isFinite(f.minY) || !Number.isFinite(f.maxX) || !Number.isFinite(f.maxY))
        continue;
      const c = Rf(f.minX, f.minY, f.maxX, f.maxY);
      r = Math.min(r, c[0]), i = Math.min(i, c[1]), o = Math.max(o, c[2]), s = Math.max(s, c[3]), n.push({
        minX: c[0],
        minY: c[1],
        maxX: c[2],
        maxY: c[3],
        value: f.value
      });
    }
    if (this.items = n, this.visited = new Uint32Array(n.length), this.querySerial = 1, n.length === 0 || !Number.isFinite(r) || !Number.isFinite(i) || !Number.isFinite(o) || !Number.isFinite(s)) {
      this.globalBounds = [0, 0, 0, 0], this.gridSize = 1, this.cellWidth = 1, this.cellHeight = 1, this.buckets = [];
      return;
    }
    this.globalBounds = [r, i, o, s], this.gridSize = Math.max(1, Math.ceil(Math.sqrt(n.length / this.targetNodeSize)));
    const l = Math.max(0, o - r), u = Math.max(0, s - i);
    this.cellWidth = l > 0 ? l / this.gridSize : 1, this.cellHeight = u > 0 ? u / this.gridSize : 1;
    const a = this.gridSize * this.gridSize;
    this.buckets = Array.from({ length: a }, () => []);
    for (let f = 0; f < n.length; f += 1) {
      const c = n[f], d = this.toCellX(c.minX), h = this.toCellX(c.maxX), g = this.toCellY(c.minY), y = this.toCellY(c.maxY);
      for (let x = g; x <= y; x += 1)
        for (let p = d; p <= h; p += 1)
          this.buckets[x * this.gridSize + p].push(f);
    }
  }
  search(t) {
    if (this.items.length === 0) return [];
    if (!Array.isArray(t) || t.length < 4) return [];
    const n = Rf(t[0], t[1], t[2], t[3]);
    if (!Pf(n, this.globalBounds)) return [];
    const r = this.toCellX(n[0]), i = this.toCellX(n[2]), o = this.toCellY(n[1]), s = this.toCellY(n[3]), l = this.nextSerial(), u = [];
    for (let a = o; a <= s; a += 1)
      for (let f = r; f <= i; f += 1) {
        const c = this.buckets[a * this.gridSize + f];
        if (!(!c || c.length === 0))
          for (const d of c) {
            if (this.visited[d] === l) continue;
            this.visited[d] = l;
            const h = this.items[d];
            Pf(n, [h.minX, h.minY, h.maxX, h.maxY]) && u.push(h);
          }
      }
    return u;
  }
  nextSerial() {
    return this.querySerial += 1, this.querySerial === 4294967295 && (this.visited.fill(0), this.querySerial = 1), this.querySerial;
  }
  toCellX(t) {
    const n = this.globalBounds[0], r = this.globalBounds[2];
    if (this.gridSize <= 1 || r <= n) return 0;
    const i = (t - n) / this.cellWidth;
    return !Number.isFinite(i) || i <= 0 ? 0 : i >= this.gridSize - 1 ? this.gridSize - 1 : Math.max(0, Math.min(this.gridSize - 1, Math.floor(i)));
  }
  toCellY(t) {
    const n = this.globalBounds[1], r = this.globalBounds[3];
    if (this.gridSize <= 1 || r <= n) return 0;
    const i = (t - n) / this.cellHeight;
    return !Number.isFinite(i) || i <= 0 ? 0 : i >= this.gridSize - 1 ? this.gridSize - 1 : Math.max(0, Math.min(this.gridSize - 1, Math.floor(i)));
  }
}
function Lm(e) {
  return new z1(e);
}
const U1 = `#version 300 es
precision highp float;
in vec2 aCenter;
in float aWeight;
uniform vec2 uResolution;
uniform float uPointSize;
out float vWeight;
void main() {
  vec2 zeroToOne = aCenter / uResolution;
  vec2 clip = vec2(zeroToOne.x * 2.0 - 1.0, 1.0 - zeroToOne.y * 2.0);
  gl_Position = vec4(clip, 0.0, 1.0);
  gl_PointSize = uPointSize;
  vWeight = aWeight;
}`, B1 = `#version 300 es
precision highp float;
in float vWeight;
uniform float uCoreRatio;
uniform float uPointAlpha;
out vec4 outColor;
void main() {
  vec2 pointCoord = gl_PointCoord * 2.0 - 1.0;
  float radius = length(pointCoord);
  if (radius > 1.0) discard;

  float coreRatio = clamp(uCoreRatio, 0.02, 0.98);
  float intensity = 1.0 - smoothstep(coreRatio, 1.0, radius);
  float alpha = intensity * max(0.0, vWeight) * max(0.0, uPointAlpha);
  if (alpha <= 0.0001) discard;
  outColor = vec4(0.0, 0.0, 0.0, alpha);
}`, O1 = `#version 300 es
precision highp float;
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`, W1 = `#version 300 es
precision highp float;
uniform sampler2D uAccumTexture;
uniform sampler2D uGradientTexture;
uniform float uOpacity;
uniform float uCutoff;
uniform float uGain;
uniform float uGamma;
uniform float uBias;
uniform float uStretch;
uniform vec2 uResolution;
out vec4 outColor;
void main() {
  vec2 accumUv = vec2(
    (gl_FragCoord.x - 0.5) / max(1.0, uResolution.x),
    (gl_FragCoord.y - 0.5) / max(1.0, uResolution.y)
  );
  float density = texture(uAccumTexture, accumUv).a;
  if (density <= uCutoff) discard;

  float boosted = 1.0 - exp(-max(0.0, density - uCutoff) * uGain);
  float contrast = clamp(uGamma, 0.35, 6.0);
  float bias = clamp(uBias, 0.0, 0.92);
  float biased = max(0.0, boosted - bias);
  float stretched = pow(
    biased / max(1e-5, 1.0 - bias),
    1.0 / clamp(uStretch, 1.0, 4.0)
  );
  float normalized = pow(stretched, 1.0 / contrast);
  float shoulder = 1.0 - pow(max(0.0, 1.0 - normalized), 1.0 + max(0.0, contrast - 1.0));
  float shoulderBlend = clamp((contrast - 1.0) * 0.32, 0.0, 0.78);
  float gradientT = mix(normalized, shoulder, shoulderBlend);
  vec4 gradientColor = texture(uGradientTexture, vec2(gradientT, 0.5));
  float alpha = gradientColor.a * clamp(uOpacity, 0.0, 1.0);
  if (alpha <= 0.0001) discard;
  outColor = vec4(gradientColor.rgb * alpha, alpha);
}`;
class Y1 {
  constructor() {
    R(this, "canvas");
    R(this, "gl");
    R(this, "accumProgram");
    R(this, "colorProgram");
    R(this, "accumVao");
    R(this, "colorVao");
    R(this, "pointBuffer");
    R(this, "quadBuffer");
    R(this, "accumTexture");
    R(this, "gradientTexture");
    R(this, "framebuffer");
    R(this, "accumInternalFormat");
    R(this, "accumTextureFormat");
    R(this, "accumTextureType");
    R(this, "uAccumResolution");
    R(this, "uAccumPointSize");
    R(this, "uAccumCoreRatio");
    R(this, "uAccumPointAlpha");
    R(this, "uColorAccumTexture");
    R(this, "uColorGradientTexture");
    R(this, "uColorOpacity");
    R(this, "uColorCutoff");
    R(this, "uColorGain");
    R(this, "uColorResolution");
    R(this, "uColorGamma");
    R(this, "uColorBias");
    R(this, "uColorStretch");
    R(this, "pointCapacity", 0);
    R(this, "interleavedCapacity", 0);
    R(this, "interleavedBuffer", null);
    R(this, "gradientKey", "");
    this.canvas = document.createElement("canvas");
    const t = this.canvas.getContext("webgl2", {
      alpha: !0,
      antialias: !1,
      depth: !1,
      stencil: !1,
      preserveDrawingBuffer: !0,
      premultipliedAlpha: !0,
      powerPreference: "high-performance"
    });
    if (!t)
      throw new Error("WebGL2 is not available for heatmap rendering.");
    this.gl = t;
    const r = !!t.getExtension("EXT_color_buffer_float");
    this.accumInternalFormat = r ? t.RGBA16F : t.RGBA8, this.accumTextureFormat = t.RGBA, this.accumTextureType = r ? t.HALF_FLOAT : t.UNSIGNED_BYTE, this.accumProgram = Ai(t, U1, B1), this.colorProgram = Ai(t, O1, W1);
    const i = t.createVertexArray(), o = t.createVertexArray(), s = t.createBuffer(), l = t.createBuffer(), u = t.createTexture(), a = t.createTexture(), f = t.createFramebuffer();
    if (!i || !o || !s || !l || !u || !a || !f)
      throw new Error("Failed to allocate heatmap WebGL resources.");
    this.accumVao = i, this.colorVao = o, this.pointBuffer = s, this.quadBuffer = l, this.accumTexture = u, this.gradientTexture = a, this.framebuffer = f;
    const c = t.getUniformLocation(this.accumProgram, "uResolution"), d = t.getUniformLocation(this.accumProgram, "uPointSize"), h = t.getUniformLocation(this.accumProgram, "uCoreRatio"), g = t.getUniformLocation(this.accumProgram, "uPointAlpha"), y = t.getUniformLocation(this.colorProgram, "uAccumTexture"), x = t.getUniformLocation(this.colorProgram, "uGradientTexture"), p = t.getUniformLocation(this.colorProgram, "uOpacity"), m = t.getUniformLocation(this.colorProgram, "uCutoff"), v = t.getUniformLocation(this.colorProgram, "uGain"), w = t.getUniformLocation(this.colorProgram, "uGamma"), E = t.getUniformLocation(this.colorProgram, "uBias"), C = t.getUniformLocation(this.colorProgram, "uStretch"), A = t.getUniformLocation(this.colorProgram, "uResolution");
    if (!c || !d || !h || !g || !y || !x || !p || !m || !v || !w || !E || !C || !A)
      throw new Error("Failed to resolve heatmap WebGL uniforms.");
    this.uAccumResolution = c, this.uAccumPointSize = d, this.uAccumCoreRatio = h, this.uAccumPointAlpha = g, this.uColorAccumTexture = y, this.uColorGradientTexture = x, this.uColorOpacity = p, this.uColorCutoff = m, this.uColorGain = v, this.uColorGamma = w, this.uColorBias = E, this.uColorStretch = C, this.uColorResolution = A, t.bindVertexArray(this.accumVao), t.bindBuffer(t.ARRAY_BUFFER, this.pointBuffer), t.bufferData(t.ARRAY_BUFFER, 0, t.DYNAMIC_DRAW);
    const M = t.getAttribLocation(this.accumProgram, "aCenter"), N = t.getAttribLocation(this.accumProgram, "aWeight");
    if (M < 0 || N < 0)
      throw new Error("Failed to resolve heatmap WebGL attributes.");
    t.enableVertexAttribArray(M), t.vertexAttribPointer(M, 2, t.FLOAT, !1, 12, 0), t.enableVertexAttribArray(N), t.vertexAttribPointer(N, 1, t.FLOAT, !1, 12, 8), t.bindVertexArray(null), t.bindVertexArray(this.colorVao), t.bindBuffer(t.ARRAY_BUFFER, this.quadBuffer), t.bufferData(t.ARRAY_BUFFER, new Float32Array([
      -1,
      -1,
      1,
      -1,
      -1,
      1,
      1,
      1
    ]), t.STATIC_DRAW);
    const I = t.getAttribLocation(this.colorProgram, "aPosition");
    if (I < 0)
      throw new Error("Failed to resolve heatmap color position attribute.");
    t.enableVertexAttribArray(I), t.vertexAttribPointer(I, 2, t.FLOAT, !1, 8, 0), t.bindVertexArray(null), t.bindBuffer(t.ARRAY_BUFFER, null), t.bindTexture(t.TEXTURE_2D, this.accumTexture), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.bindTexture(t.TEXTURE_2D, null), t.bindTexture(t.TEXTURE_2D, this.gradientTexture), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_S, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_WRAP_T, t.CLAMP_TO_EDGE), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MIN_FILTER, t.LINEAR), t.texParameteri(t.TEXTURE_2D, t.TEXTURE_MAG_FILTER, t.LINEAR), t.bindTexture(t.TEXTURE_2D, null), this.ensureCanvasSize(1, 1);
  }
  render(t) {
    if (t.count <= 0 || t.width <= 0 || t.height <= 0)
      return !1;
    this.ensureCanvasSize(t.width, t.height), this.ensureGradientTexture(t.gradient), this.uploadPointData(t.positions, t.weights, t.count);
    const n = this.gl;
    return n.disable(n.SCISSOR_TEST), n.disable(n.DEPTH_TEST), n.disable(n.CULL_FACE), n.bindFramebuffer(n.FRAMEBUFFER, this.framebuffer), n.viewport(0, 0, t.width, t.height), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), n.useProgram(this.accumProgram), n.bindVertexArray(this.accumVao), n.uniform2f(this.uAccumResolution, t.width, t.height), n.uniform1f(this.uAccumPointSize, Math.max(1, (t.kernelRadiusPx + t.blurRadiusPx) * 2)), n.uniform1f(this.uAccumCoreRatio, t.kernelRadiusPx / Math.max(1e-6, t.kernelRadiusPx + t.blurRadiusPx)), n.uniform1f(this.uAccumPointAlpha, Math.max(0, t.pointAlpha)), n.enable(n.BLEND), n.blendEquation(n.FUNC_ADD), n.blendFuncSeparate(n.ONE, n.ONE, n.ONE, n.ONE), n.drawArrays(n.POINTS, 0, t.count), n.disable(n.BLEND), n.bindVertexArray(null), n.bindFramebuffer(n.FRAMEBUFFER, null), n.viewport(0, 0, t.width, t.height), n.clearColor(0, 0, 0, 0), n.clear(n.COLOR_BUFFER_BIT), n.useProgram(this.colorProgram), n.bindVertexArray(this.colorVao), n.activeTexture(n.TEXTURE0), n.bindTexture(n.TEXTURE_2D, this.accumTexture), n.uniform1i(this.uColorAccumTexture, 0), n.activeTexture(n.TEXTURE1), n.bindTexture(n.TEXTURE_2D, this.gradientTexture), n.uniform1i(this.uColorGradientTexture, 1), n.uniform1f(this.uColorOpacity, t.opacity), n.uniform1f(this.uColorCutoff, t.cutoff ?? 8e-3), n.uniform1f(this.uColorGain, t.gain ?? 2.6), n.uniform1f(this.uColorGamma, t.gamma ?? 1), n.uniform1f(this.uColorBias, t.bias ?? 0), n.uniform1f(this.uColorStretch, t.stretch ?? 1), n.uniform2f(this.uColorResolution, t.width, t.height), n.drawArrays(n.TRIANGLE_STRIP, 0, 4), n.bindVertexArray(null), n.bindTexture(n.TEXTURE_2D, null), n.flush(), !0;
  }
  destroy() {
    const t = this.gl;
    t.deleteTexture(this.accumTexture), t.deleteTexture(this.gradientTexture), t.deleteFramebuffer(this.framebuffer), t.deleteBuffer(this.pointBuffer), t.deleteBuffer(this.quadBuffer), t.deleteVertexArray(this.accumVao), t.deleteVertexArray(this.colorVao), t.deleteProgram(this.accumProgram), t.deleteProgram(this.colorProgram), this.canvas.width = 0, this.canvas.height = 0;
  }
  ensureCanvasSize(t, n) {
    const r = Math.max(1, Math.round(t)), i = Math.max(1, Math.round(n));
    this.canvas.width !== r && (this.canvas.width = r), this.canvas.height !== i && (this.canvas.height = i);
    const o = this.gl;
    o.bindTexture(o.TEXTURE_2D, this.accumTexture), o.texImage2D(
      o.TEXTURE_2D,
      0,
      this.accumInternalFormat,
      r,
      i,
      0,
      this.accumTextureFormat,
      this.accumTextureType,
      null
    ), o.bindFramebuffer(o.FRAMEBUFFER, this.framebuffer), o.framebufferTexture2D(o.FRAMEBUFFER, o.COLOR_ATTACHMENT0, o.TEXTURE_2D, this.accumTexture, 0);
    const s = o.checkFramebufferStatus(o.FRAMEBUFFER);
    if (o.bindFramebuffer(o.FRAMEBUFFER, null), s !== o.FRAMEBUFFER_COMPLETE)
      throw new Error(`Heatmap framebuffer incomplete: ${s}`);
  }
  ensureGradientTexture(t) {
    const n = t.join("|");
    if (this.gradientKey === n) return;
    const r = document.createElement("canvas");
    r.width = 256, r.height = 1;
    const i = r.getContext("2d");
    if (!i)
      throw new Error("Failed to create heatmap gradient canvas.");
    const o = i.createLinearGradient(0, 0, 256, 0), s = t.length > 1 ? t : ["#00000000", "#3876FF", "#4CDDDD", "#FFE75C", "#FF8434", "#FF3434"], l = 1 / Math.max(1, s.length - 1);
    for (let f = 0; f < s.length; f += 1)
      o.addColorStop(f * l, s[f]);
    i.clearRect(0, 0, 256, 1), i.fillStyle = o, i.fillRect(0, 0, 256, 1);
    const u = i.getImageData(0, 0, 256, 1).data, a = this.gl;
    a.bindTexture(a.TEXTURE_2D, this.gradientTexture), a.texImage2D(a.TEXTURE_2D, 0, a.RGBA, 256, 1, 0, a.RGBA, a.UNSIGNED_BYTE, u), a.bindTexture(a.TEXTURE_2D, null), this.gradientKey = n;
  }
  uploadPointData(t, n, r) {
    const i = this.gl, o = r * 3, s = o * 4;
    i.bindBuffer(i.ARRAY_BUFFER, this.pointBuffer), r > this.pointCapacity && (i.bufferData(i.ARRAY_BUFFER, s, i.DYNAMIC_DRAW), this.pointCapacity = r), o > this.interleavedCapacity && (this.interleavedCapacity = o, this.interleavedBuffer = new Float32Array(o));
    const l = this.interleavedBuffer;
    if (!l)
      throw new Error("Failed to allocate heatmap upload buffer.");
    for (let u = 0; u < r; u += 1) {
      const a = u * 2, f = u * 3;
      l[f] = t[a] ?? 0, l[f + 1] = t[a + 1] ?? 0, l[f + 2] = n[u] ?? 0;
    }
    i.bufferSubData(i.ARRAY_BUFFER, 0, l.subarray(0, o)), i.bindBuffer(i.ARRAY_BUFFER, null);
  }
}
const Mf = "__open_plant_heatmap_layer__", V1 = ["#00000000", "#3876FF", "#4CDDDD", "#FFE75C", "#FF8434", "#FF3434"], X1 = 3, H1 = 2, G1 = 0.9, $1 = 52e3, j1 = "screen", Z1 = 2.2, pu = 128, hs = 1600, q1 = 1.9, K1 = 4.2, gu = 3e3, Fm = Math.SQRT2, Q1 = 2048, J1 = 0.9, qt = 16;
function Wi(e, t) {
  return t.maxTierZoom + Math.log2(Math.max(1e-6, e));
}
function ka(e, t) {
  return Math.max(1e-6, 2 ** (e - t.maxTierZoom));
}
function ev(e, t, n) {
  if (!Number.isFinite(n) || Math.abs(n) < 1e-6)
    return Math.max(1e-6, e);
  const r = Wi(e, t) - n;
  return ka(r, t);
}
function tv(e) {
  return !Number.isFinite(e) || Math.abs(e) < 1e-6 ? 0 : Math.round(e * 1.5 / Math.max(1e-6, Math.log2(Fm)));
}
function Nm(e) {
  const t = U(e, 0, qt);
  return U(0.55 + Math.sqrt(Math.max(0, t)) * 0.48, 0.55, 6);
}
function nv(e) {
  const t = Math.max(0, e);
  return t <= 1 ? 0.18 : t <= 2 ? 0.3 : t <= 4 ? 0.48 : t <= 8 ? 0.7 : t <= 16 ? 0.86 : 1;
}
function Dm(e) {
  return 0.022 - U(e, 0, qt) / qt * 0.015;
}
function zm(e) {
  const t = U(e, 0, qt);
  return 0.18 + Math.pow(Math.max(0, t), 0.72) * 0.42 + Math.log2(t + 1) * 0.24;
}
function Um(e) {
  return Nm(e);
}
function Bm(e) {
  const n = U(e, 0, qt) / qt;
  return U(0.46 - n * 0.34, 0.12, 0.46);
}
function Om(e, t, n) {
  const i = U(e, 0, qt) / qt, o = Wi(t, n), s = n.maxTierZoom - 3.2, l = n.maxTierZoom - 1.15, u = U((o - s) / Math.max(1e-6, l - s), 0, 1), a = 1.12 + Math.pow(i, 0.82) * 1.18, f = 1 + u * (0.48 + i * 0.92);
  return a * f;
}
function rv(e, t, n) {
  const r = Math.max(0, e), i = Math.max(1e-6, t), o = Math.log1p(r) / Math.log1p(i);
  return U(o, 0, 1);
}
function iv(e) {
  return J1;
}
function ov(e, t) {
  if (e.length === 0) return 1;
  const n = Math.min(e.length, Q1), r = new Array(n);
  let i = 1;
  for (let f = 0; f < n; f += 1) {
    const c = Math.min(
      e.length - 1,
      Math.floor((f + 0.5) * e.length / n)
    ), d = Math.max(0, e[c]?.weight ?? 0);
    r[f] = d, d > i && (i = d);
  }
  for (let f = 0; f < e.length; f += 1) {
    const c = Math.max(0, e[f]?.weight ?? 0);
    c > i && (i = c);
  }
  r.sort((f, c) => f - c);
  const o = iv(), s = Math.max(0, Math.min(
    r.length - 1,
    Math.floor((r.length - 1) * o)
  )), l = r[s] ?? i;
  return Math.max(1, Math.min(i, Math.max(l * 1.08, i * 0.14)));
}
function Wm(e, t, n) {
  const r = Wi(e, t), i = t.maxTierZoom - 2.45, o = t.maxTierZoom - 1.2, s = r <= i ? 1 : r >= o ? 0 : (() => {
    const l = U((r - i) / Math.max(1e-6, o - i), 0, 1);
    return 1 - l * l * (3 - 2 * l);
  })();
  return U(s, 0, 1);
}
function sv(e) {
  if (e >= 1) return 1;
  const t = 1 / Math.max(e, 1e-6);
  return 1 + Math.log2(t) * 0.28;
}
function lv(e, t, n, r) {
  const i = Math.max(1, e, t), o = typeof window > "u" ? 1 : U(window.devicePixelRatio || 1, 1, 2.4), s = r <= 0.35 ? 1.42 : r <= 0.55 ? 1.26 : r <= 0.8 ? 1.14 : 1, l = n > 16e4 ? 896 : n > 8e4 ? 1152 : n > 3e4 ? 1408 : hs, u = pu / i, a = hs / i;
  return U(l * o * s / i, u, a);
}
function yu(e) {
  const t = e.heatmapScale ?? lv(e.logicalWidth, e.logicalHeight, e.totalPointCount, e.rawZoom), n = Math.max(pu, Math.min(hs, Math.round(e.logicalWidth * t))), r = Math.max(pu, Math.min(hs, Math.round(e.logicalHeight * t))), i = n / Math.max(1, e.logicalWidth), o = r / Math.max(1, e.logicalHeight), s = Math.min(i, o), l = Math.max(1e-6, e.rawZoom), u = Math.max(0.75, e.radius * q1 * s), a = Math.max(0.6, e.blur * K1 * s), f = (u + a) / Math.max(1e-6, l * s), c = Math.max(
    f * 0.4,
    0.62 / Math.max(1e-6, l * s)
  );
  return {
    heatmapScale: t,
    rasterWidth: n,
    rasterHeight: r,
    rasterScaleX: i,
    rasterScaleY: o,
    rawZoom: l,
    kernelRadiusPx: u,
    blurRadiusPx: a,
    outerWorldRadius: f,
    desiredCellWorldSize: c
  };
}
function Ia(e) {
  if (!e) return 0;
  const t = Math.floor(e.positions.length / 2), n = e.weights ? e.weights.length : Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.min(Math.floor(e.count), t, n));
}
function fo(e, t) {
  const n = Number.isFinite(e) ? Math.round(e * 1024) : 0;
  return Math.imul(t ^ n, 73244475) >>> 0;
}
function uv(e, t, n = 2654435769) {
  let r = Math.imul(n ^ (e | 0), 2246822507) >>> 0;
  return r = Math.imul(r ^ (t | 0), 3266489909) >>> 0, r ^= r >>> 16, r >>> 0;
}
function av(e) {
  return (e >>> 0) / 4294967295;
}
function Ym(e) {
  let t = 2166136261;
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n];
    t = Math.imul(t ^ r.outer.length, 16777619) >>> 0;
    for (let i = 0; i < r.outer.length; i += 1) {
      const o = r.outer[i];
      t = fo(o[0], t), t = fo(o[1], t);
    }
    t = Math.imul(t ^ r.holes.length, 16777619) >>> 0;
    for (let i = 0; i < r.holes.length; i += 1) {
      const o = r.holes[i];
      t = Math.imul(t ^ o.length, 16777619) >>> 0;
      for (let s = 0; s < o.length; s += 1) {
        const l = o[s];
        t = fo(l[0], t), t = fo(l[1], t);
      }
    }
  }
  return `${e.length}:${t >>> 0}`;
}
function ba(e, t, n) {
  return e.dataRef === t && e.clipKey === n ? !0 : t ? e.clipKey === n && e.inputCount === Ia(t) && e.positionsRef === t.positions && e.weightsRef === t.weights : !1;
}
function cv(e, t, n, r) {
  const i = Ia(e);
  if (!e || i <= 0)
    return null;
  let o = new Float32Array(i), s = new Float32Array(i), l = new Float32Array(i), u = 0, a = 1 / 0, f = 1 / 0, c = -1 / 0, d = -1 / 0;
  for (let v = 0; v < i; v += 1) {
    const w = e.positions[v * 2], E = e.positions[v * 2 + 1];
    if (!Number.isFinite(w) || !Number.isFinite(E) || t.length > 0 && !Ii(w, E, t)) continue;
    const C = e.weights?.[v], A = typeof C == "number" && Number.isFinite(C) ? Math.max(0, C) : 1;
    A <= 0 || (o[u] = w, s[u] = E, l[u] = A, u += 1, w < a && (a = w), w > c && (c = w), E < f && (f = E), E > d && (d = E));
  }
  if (u === 0 || !Number.isFinite(a) || !Number.isFinite(f) || !Number.isFinite(c) || !Number.isFinite(d))
    return null;
  u < i && (o = o.slice(0, u), s = s.slice(0, u), l = l.slice(0, u));
  const h = [];
  for (let v = 0; v < u; v += 1) {
    const w = o[v], E = s[v];
    h.push({
      minX: w,
      minY: E,
      maxX: w,
      maxY: E,
      value: v
    });
  }
  const g = Lm(64);
  g.load(h);
  const y = Math.max(
    r?.width ?? 0,
    r?.height ?? 0,
    c - a,
    d - f,
    1
  ), x = [];
  let p = 0.5, m = 0;
  for (; p <= y && m < 32; )
    x.push(p), p *= Fm, m += 1;
  return x.length === 0 && x.push(1), {
    dataRef: e,
    sourceRef: r,
    positionsRef: e.positions,
    weightsRef: e.weights,
    inputCount: i,
    clipRef: t,
    clipKey: n,
    pointCount: u,
    xs: o,
    ys: s,
    ws: l,
    pointIndex: g,
    cellSizes: x,
    levels: Array.from({ length: x.length }, () => null)
  };
}
function vu(e, t, n) {
  const r = e.pointIndex.search([
    t[0] - n,
    t[1] - n,
    t[2] + n,
    t[3] + n
  ]), i = new Array(r.length);
  let o = 0;
  for (let s = 0; s < r.length; s += 1) {
    const l = r[s];
    l && (i[o] = l.value, o += 1);
  }
  return i.length = o, i;
}
function Vm(e, t) {
  const n = Math.max(gu, t);
  return e <= n ? 1 : U(n / Math.max(1, e), 1 / 65536, 1);
}
function Xm(e) {
  return e >= 1 ? 1 : Math.max(1, Math.round(1 / Math.max(1e-6, e)));
}
function fv(e, t) {
  if (t >= 1) return !0;
  const n = uv(e, 1374496523, 1757159915);
  return av(n) <= U(t, 0, 1);
}
function Hm(e, t, n, r) {
  const i = Math.max(1, n * r), o = Math.PI * t * t, s = Math.max(1, e) * o / i;
  return U(0.085 / Math.sqrt(Math.max(1, s)), 0.012, 0.075);
}
function Tf(e, t, n, r) {
  if (!Number.isFinite(e) || e <= 0)
    return t;
  const i = t >= e ? n : r;
  return e + (t - e) * U(i, 0, 1);
}
function dv(e) {
  if (e.webgl !== void 0)
    return e.webgl;
  if (typeof document > "u")
    return e.webgl = null, null;
  try {
    e.webgl = new Y1();
  } catch (t) {
    if (!e.webglWarningIssued && typeof console < "u" && typeof console.warn == "function") {
      const n = t instanceof Error ? t.message : String(t);
      console.warn(`[open-plant] HeatmapLayer disabled because WebGL2 heatmap initialization failed: ${n}`), e.webglWarningIssued = !0;
    }
    e.webgl = null;
  }
  return e.webgl;
}
function Af(e, t) {
  const n = [];
  for (let r = 0; r < t.length; r += 1) {
    const i = t[r];
    if (!i) continue;
    const o = e.worldToScreen(i[0], i[1]);
    if (!Array.isArray(o) || o.length < 2) continue;
    const s = Number(o[0]), l = Number(o[1]);
    !Number.isFinite(s) || !Number.isFinite(l) || n.push([s, l]);
  }
  return n;
}
function hv(e, t, n) {
  if (n.length !== 0) {
    e.beginPath();
    for (let r = 0; r < n.length; r += 1) {
      const i = n[r], o = Af(t, i.outer);
      o.length >= 3 && bi(e, o, !0);
      for (let s = 0; s < i.holes.length; s += 1) {
        const l = Af(t, i.holes[s]);
        l.length >= 3 && bi(e, l, !0);
      }
    }
    e.clip("evenodd");
  }
}
function Gm(e, t, n, r, i) {
  const o = e.sourceData;
  return o && o.sourceRef === i && ba(o, t, r) ? o : (e.sourceData = cv(t, n, r, i), e.fixedState = null, e.screenLevelIndex = -1, e.sourceData);
}
function mv(e) {
  const { sourceData: t, renderer: n, source: r, logicalWidth: i, logicalHeight: o, radius: s, blur: l, fixedZoom: u, maxRenderedPoints: a } = e, f = Math.max(1e-6, n.getViewState().zoom), c = u ?? Wi(f, r), d = ka(c, r), h = yu({
    logicalWidth: i,
    logicalHeight: o,
    totalPointCount: t.pointCount,
    rawZoom: d,
    radius: s,
    blur: l
  }), g = n.getViewBounds(), y = vu(t, g, h.outerWorldRadius), x = Vm(y.length, a), p = Xm(x), m = Math.min(h.rasterScaleX, h.rasterScaleY);
  return {
    dataRef: t.dataRef,
    positionsRef: t.positionsRef,
    weightsRef: t.weightsRef,
    inputCount: t.inputCount,
    clipRef: t.clipRef,
    clipKey: t.clipKey,
    referenceZoom: c,
    referenceRawZoom: d,
    heatmapScale: h.heatmapScale,
    kernelWorldRadius: h.kernelRadiusPx / Math.max(1e-6, d * m),
    blurWorldRadius: h.blurRadiusPx / Math.max(1e-6, d * m),
    sampleProbability: x,
    sampleStride: p,
    pointAlpha: Hm(y.length, h.kernelRadiusPx + h.blurRadiusPx, h.rasterWidth, h.rasterHeight)
  };
}
function _f(e) {
  const {
    ctx: t,
    runtime: n,
    renderer: r,
    source: i,
    logicalWidth: o,
    logicalHeight: s,
    frame: l,
    sourceData: u,
    visiblePointIndices: a,
    sampleProbability: f,
    sampleStride: c,
    pointAlpha: d,
    gradient: h,
    opacity: g,
    densityContrast: y,
    backgroundColor: x,
    clipPolygons: p
  } = e, m = dv(n);
  if (!m || a.length === 0)
    return 0;
  const v = Math.min(
    a.length,
    Math.max(64, Math.ceil(a.length * Math.min(1, f * 1.15)))
  );
  v > n.webglCapacity && (n.webglCapacity = v, n.webglPositions = new Float32Array(v * 2), n.webglWeights = new Float32Array(v));
  const w = n.webglPositions, E = n.webglWeights;
  if (!w || !E)
    return 0;
  const C = l.kernelRadiusPx + l.blurRadiusPx, A = sv(f);
  let M = 0;
  for (let I = 0; I < a.length; I += 1) {
    const B = a[I];
    if (!fv(B, f)) continue;
    const O = u.xs[B], L = u.ys[B];
    if (!Number.isFinite(O) || !Number.isFinite(L)) continue;
    const G = r.worldToScreen(O, L);
    if (!Array.isArray(G) || G.length < 2) continue;
    const $ = Number(G[0]), Y = Number(G[1]);
    if (!Number.isFinite($) || !Number.isFinite(Y)) continue;
    const Q = $ * l.rasterScaleX, _ = Y * l.rasterScaleY;
    if (Q < -C || _ < -C || Q > l.rasterWidth + C || _ > l.rasterHeight + C)
      continue;
    const D = M * 2;
    w[D] = Q, w[D + 1] = _, E[M] = Math.max(0, (u.ws[B] ?? 0) * A), M += 1;
  }
  return M <= 0 || !m.render({
    width: l.rasterWidth,
    height: l.rasterHeight,
    positions: w,
    weights: E,
    count: M,
    kernelRadiusPx: l.kernelRadiusPx,
    blurRadiusPx: l.blurRadiusPx,
    pointAlpha: d,
    gradient: h,
    opacity: g,
    cutoff: Dm(y),
    gain: zm(y),
    gamma: Um(y),
    bias: Bm(y),
    stretch: Om(y, l.rawZoom, i)
  }) ? 0 : (t.save(), p.length > 0 && hv(t, r, p), x && (t.fillStyle = x, t.fillRect(0, 0, o, s)), t.globalAlpha = 1, t.imageSmoothingEnabled = !0, t.drawImage(m.canvas, 0, 0, l.rasterWidth, l.rasterHeight, 0, 0, o, s), t.restore(), M);
}
function pv(e) {
  const { ctx: t, runtime: n, renderer: r, source: i, logicalWidth: o, logicalHeight: s, state: l } = e, u = Gm(n, l.data, l.clipPolygons, l.clipKey, i);
  if (!u || u.cellSizes.length === 0 || u.pointCount <= 0)
    return null;
  const a = Math.max(1e-6, r.getViewState().zoom), f = Wm(a, i, l.zoomThreshold), c = r.getViewBounds();
  if (f <= 1e-3)
    return {
      pointCount: u.pointCount,
      renderTimeMs: 0,
      visiblePointCount: 0,
      renderedBinCount: 0,
      sampleStride: 1,
      maxDensity: 0
    };
  if (l.scaleMode !== "fixed-zoom") {
    const p = yu({
      logicalWidth: o,
      logicalHeight: s,
      totalPointCount: u.pointCount,
      rawZoom: a,
      radius: l.radius,
      blur: l.blur
    }), m = vu(u, c, p.outerWorldRadius);
    if (m.length === 0)
      return {
        pointCount: u.pointCount,
        renderTimeMs: 0,
        visiblePointCount: 0,
        renderedBinCount: 0,
        sampleStride: 1,
        maxDensity: 0
      };
    const v = Vm(m.length, l.maxRenderedPoints), w = Xm(v), E = Hm(
      m.length,
      p.kernelRadiusPx + p.blurRadiusPx,
      p.rasterWidth,
      p.rasterHeight
    );
    n.screenLevelIndex = -1, n.screenSecondaryLevelIndex = -1, n.screenSecondaryLevelWeight = 0, n.screenNormalizationMaxWeight = 1, n.screenPointAlpha = Tf(n.screenPointAlpha, E, 0.12, 0.08), n.screenVisibilityStrength = r.isViewAnimating() ? Tf(n.screenVisibilityStrength, f, 0.16, 0.12) : f;
    const C = _f({
      ctx: t,
      runtime: n,
      renderer: r,
      source: i,
      logicalWidth: o,
      logicalHeight: s,
      frame: p,
      sourceData: u,
      visiblePointIndices: m,
      sampleProbability: v,
      sampleStride: w,
      pointAlpha: n.screenPointAlpha * Math.max(0.08, n.screenVisibilityStrength),
      gradient: l.gradient,
      opacity: l.opacity * n.screenVisibilityStrength,
      densityContrast: l.densityContrast,
      backgroundColor: l.backgroundColor,
      clipPolygons: l.clipPolygons
    });
    return {
      pointCount: u.pointCount,
      renderTimeMs: 0,
      visiblePointCount: m.length,
      renderedBinCount: C,
      sampleStride: w,
      maxDensity: Math.round(n.screenPointAlpha * 255)
    };
  }
  const d = n.fixedState;
  if (!d) return null;
  const h = yu({
    logicalWidth: o,
    logicalHeight: s,
    totalPointCount: u.pointCount,
    rawZoom: a,
    radius: l.radius,
    blur: l.blur,
    heatmapScale: d.heatmapScale
  }), g = Math.min(h.rasterScaleX, h.rasterScaleY);
  h.kernelRadiusPx = Math.max(0.75, d.kernelWorldRadius * a * g), h.blurRadiusPx = Math.max(0.6, d.blurWorldRadius * a * g), h.outerWorldRadius = d.kernelWorldRadius + d.blurWorldRadius;
  const y = vu(u, c, h.outerWorldRadius);
  if (y.length === 0)
    return {
      pointCount: u.pointCount,
      renderTimeMs: 0,
      visiblePointCount: 0,
      renderedBinCount: 0,
      sampleStride: 1,
      maxDensity: 0
    };
  n.screenPointAlpha = d.pointAlpha, n.screenVisibilityStrength = f;
  const x = _f({
    ctx: t,
    runtime: n,
    renderer: r,
    source: i,
    logicalWidth: o,
    logicalHeight: s,
    frame: h,
    sourceData: u,
    visiblePointIndices: y,
    sampleProbability: d.sampleProbability,
    sampleStride: d.sampleStride,
    pointAlpha: d.pointAlpha * Math.max(0.08, f),
    gradient: l.gradient,
    opacity: l.opacity * f,
    densityContrast: l.densityContrast,
    backgroundColor: l.backgroundColor,
    clipPolygons: l.clipPolygons
  });
  return {
    pointCount: u.pointCount,
    renderTimeMs: 0,
    visiblePointCount: y.length,
    renderedBinCount: x,
    sampleStride: d.sampleStride,
    maxDensity: Math.round(d.pointAlpha * 255)
  };
}
function gv({
  data: e,
  visible: t = !0,
  opacity: n = G1,
  radius: r = X1,
  blur: i = H1,
  gradient: o = V1,
  backgroundColor: s = null,
  scaleMode: l = j1,
  fixedZoom: u,
  zoomThreshold: a = 0,
  densityContrast: f = Z1,
  clipToRegions: c,
  zIndex: d = 5,
  maxRenderedPoints: h = $1,
  onStats: g
}) {
  const { rendererRef: y, source: x, registerDrawCallback: p, unregisterDrawCallback: m, requestOverlayRedraw: v } = tr(), w = S.useMemo(() => {
    const M = (c ?? []).map((N) => Ur(N?.coordinates)).filter((N) => N != null);
    return Br(M);
  }, [c]), E = S.useMemo(() => Ym(w), [w]), C = S.useRef({
    sourceData: null,
    fixedState: null,
    screenLevelIndex: -1,
    screenSecondaryLevelIndex: -1,
    screenSecondaryLevelWeight: 0,
    screenPointAlpha: 0,
    screenNormalizationMaxWeight: 1,
    screenVisibilityStrength: 1,
    webgl: void 0,
    webglWarningIssued: !1,
    webglPositions: null,
    webglWeights: null,
    webglCapacity: 0
  }), A = S.useRef({
    data: e,
    visible: t,
    opacity: n,
    radius: U(r, 0.05, 128),
    blur: U(i, 0.05, 128),
    gradient: o,
    backgroundColor: s,
    scaleMode: l,
    fixedZoom: u,
    zoomThreshold: a,
    densityContrast: U(f, 0, qt),
    clipPolygons: w,
    clipKey: E,
    maxRenderedPoints: Math.max(gu, Math.floor(h)),
    onStats: g
  });
  return A.current = {
    data: e,
    visible: t,
    opacity: n,
    radius: U(r, 0.05, 128),
    blur: U(i, 0.05, 128),
    gradient: o,
    backgroundColor: s,
    scaleMode: l,
    fixedZoom: u,
    zoomThreshold: a,
    densityContrast: U(f, 0, qt),
    clipPolygons: w,
    clipKey: E,
    maxRenderedPoints: Math.max(gu, Math.floor(h)),
    onStats: g
  }, S.useEffect(() => (p(Mf, d, (N, I, B) => {
    const O = A.current, L = C.current, G = y.current;
    if (!O.visible || !O.data || !G || !x) return;
    const $ = Gm(L, O.data, O.clipPolygons, O.clipKey, x);
    if (!$) return;
    O.scaleMode === "fixed-zoom" && (!L.fixedState || !ba(L.fixedState, O.data, O.clipKey) || O.fixedZoom !== void 0 && Math.abs(L.fixedState.referenceZoom - O.fixedZoom) > 1e-6) ? L.fixedState = mv({
      sourceData: $,
      renderer: G,
      source: x,
      logicalWidth: I,
      logicalHeight: B,
      radius: O.radius,
      blur: O.blur,
      fixedZoom: O.fixedZoom,
      zoomThreshold: O.zoomThreshold,
      densityContrast: O.densityContrast,
      maxRenderedPoints: O.maxRenderedPoints
    }) : O.scaleMode !== "fixed-zoom" && (L.fixedState = null);
    const Q = performance.now(), _ = pv({
      ctx: N,
      runtime: L,
      renderer: G,
      source: x,
      logicalWidth: I,
      logicalHeight: B,
      state: O
    });
    !_ || !O.onStats || O.onStats({
      ..._,
      renderTimeMs: performance.now() - Q
    });
  }), () => {
    m(Mf), C.current.sourceData = null, C.current.fixedState = null, C.current.screenLevelIndex = -1, C.current.screenSecondaryLevelIndex = -1, C.current.screenSecondaryLevelWeight = 0, C.current.screenPointAlpha = 0, C.current.screenNormalizationMaxWeight = 1, C.current.screenVisibilityStrength = 1, C.current.webgl?.destroy(), C.current.webgl = void 0, C.current.webglPositions = null, C.current.webglWeights = null, C.current.webglCapacity = 0;
  }), [p, m, y, x, d]), S.useEffect(() => {
    C.current.sourceData = null, C.current.fixedState = null, C.current.screenLevelIndex = -1, C.current.screenSecondaryLevelIndex = -1, C.current.screenSecondaryLevelWeight = 0, C.current.screenPointAlpha = 0, C.current.screenNormalizationMaxWeight = 1, C.current.screenVisibilityStrength = 1, v();
  }, [e?.positions, e?.weights, e?.count, E, v]), S.useEffect(() => {
    C.current.fixedState = null, C.current.screenSecondaryLevelIndex = -1, C.current.screenSecondaryLevelWeight = 0, C.current.screenPointAlpha = 0, C.current.screenNormalizationMaxWeight = 1, C.current.screenVisibilityStrength = 1, v();
  }, [r, i, l, u, a, f, h, v]), S.useEffect(() => {
    v();
  }, [t, n, o, s, v]), null;
}
const yv = {
  applyZoomThreshold: ev,
  buildClipKey: Ym,
  resolveCellSupportFactor: nv,
  resolveContinuousZoom: Wi,
  resolveDensityCutoff: Dm,
  resolveDensityBias: Bm,
  resolveDensityGain: zm,
  resolveDensityGamma: Um,
  resolveDensityStretch: Om,
  resolveNormalizedDensityWeight: rv,
  resolveNormalizationUpperWeight: ov,
  resolveDensityWeightExponent: Nm,
  resolveRawZoomFromContinuousZoom: ka,
  resolvePointCount: Ia,
  resolveThresholdLevelBias: tv,
  resolveZoomVisibilityStrength: Wm,
  isSameHeatmapInput: ba
}, kf = "__overlay_layer__";
function vv({ shapes: e }) {
  const { rendererRef: t, source: n, registerDrawCallback: r, unregisterDrawCallback: i, requestOverlayRedraw: o } = tr(), s = S.useCallback(
    (u) => {
      const a = t.current;
      if (!a || u.length === 0) return [];
      const f = new Array(u.length);
      for (let c = 0; c < u.length; c += 1) {
        const d = Ot(a.worldToScreen(u[c][0], u[c][1]));
        if (!d) return [];
        f[c] = d;
      }
      return f;
    },
    []
  ), l = S.useRef({ shapes: e, worldToScreenPoints: s, source: n });
  return l.current = { shapes: e, worldToScreenPoints: s, source: n }, S.useEffect(() => (r(kf, 30, (a) => {
    const { shapes: f, worldToScreenPoints: c, source: d } = l.current;
    if (!Array.isArray(f) || f.length === 0 || !d) return;
    const h = c(
      je([
        [0, 0],
        [d.width, 0],
        [d.width, d.height],
        [0, d.height]
      ])
    );
    km({
      ctx: a,
      overlayShapes: f,
      imageOuterRing: h,
      worldToScreenPoints: c,
      baseStrokeStyle: Kt
    });
  }), () => i(kf)), [r, i]), S.useEffect(() => {
    o();
  }, [e, o]), null;
}
function wv(e) {
  return Array.isArray(e?.classes) ? e.classes.map((t) => ({
    classId: String(t?.classId ?? ""),
    className: String(t?.className ?? ""),
    classColor: String(t?.classColor ?? "")
  })) : [];
}
function If(e) {
  return String(e ?? "").replace(/\/+$/, "");
}
function $m(e) {
  const t = String(e ?? "");
  return t.startsWith("/") ? t : `/${t}`;
}
function xv(e) {
  const t = If(e);
  if (!t) return "";
  if (/\/TileGroup\d+$/i.test(t)) return t;
  let n = null;
  try {
    n = new URL(t);
  } catch {
    n = null;
  }
  if (n) {
    const r = `${n.protocol}//${n.host}`, i = If(n.pathname || "");
    return /\/ims$/i.test(i) ? `${r}${i}` : /\/tiles$/i.test(i) ? `${r}${i}` : `${r}${i}/tiles`;
  }
  return /\/ims$/i.test(t) ? "/ims" : /\/tiles$/i.test(t) ? `${t}` : `${t}/tiles`;
}
function Sv(e, t) {
  const n = e?.imsInfo ?? {}, r = !!e?.imsInfo, i = Number(n.width ?? e?.width ?? 0), o = Number(n.height ?? e?.height ?? 0), s = Number(n.tileSize ?? e?.tileSize ?? 0), l = Number(n.zoom ?? e?.zoom ?? 0), u = String(n.path ?? e?.path ?? ""), a = Number(n.mpp ?? e?.mpp ?? 0);
  if (!i || !o || !s || !u)
    throw new Error("Incomplete image metadata: width/height/tileSize/path required");
  const f = $m(u), c = xv(t), d = e?.tileUrlBuilder ?? (r ? (h, g, y) => `${c}${f}/${h}/${y}_${g}.webp` : void 0);
  return {
    id: e?._id || e?.id || "unknown",
    name: e?.name || "unknown",
    width: i,
    height: o,
    mpp: Number.isFinite(a) && a > 0 ? a : void 0,
    tileSize: s,
    maxTierZoom: Number.isFinite(l) ? Math.max(0, Math.floor(l)) : 0,
    tilePath: u,
    tileBaseUrl: t,
    tileUrlBuilder: d
  };
}
function La(e, t, n, r) {
  if (e.tileUrlBuilder)
    return e.tileUrlBuilder(t, n, r, e.tilePath, e.tileBaseUrl);
  const i = $m(e.tilePath);
  return `${e.tileBaseUrl}${i}/${t}/${r}_${n}.webp`;
}
function Ev(e, t) {
  if (!t) return !1;
  const n = new URL(e, typeof window < "u" ? window.location.href : void 0).hostname.toLowerCase();
  return !(n.includes("amazonaws.com") || n.startsWith("s3.") || n.includes(".s3."));
}
const ft = {
  width: 200,
  height: 125,
  margin: 16,
  position: "bottom-right",
  borderRadius: 6,
  borderWidth: 0,
  backgroundColor: "rgba(4, 10, 18, 0.88)",
  borderColor: "rgba(230, 244, 255, 0.35)",
  viewportBorderColor: "rgba(255, 106, 61, 0.95)",
  viewportBorderStyle: "dash",
  viewportFillColor: "transparent",
  interactive: !0,
  showThumbnail: !0,
  maxThumbnailTiles: 16
};
function bf(e, t, n, r) {
  const i = t.length;
  if (!(i < 3)) {
    for (let o = 0; o < i; o += 1) {
      const s = t[o], l = t[(o + 1) % i], u = Math.hypot(l[0] - s[0], l[1] - s[1]);
      if (u < 1e-6) continue;
      const a = Math.max(1, Math.round((u + r) / (n + r))), f = a * n + (a - 1) * r, c = u / Math.max(1e-6, f), d = n * c, h = r * c;
      e.beginPath(), e.moveTo(s[0], s[1]), e.lineTo(l[0], l[1]), e.setLineDash([d, h]), e.lineDashOffset = 0, e.stroke();
    }
    e.setLineDash([]), e.lineDashOffset = 0;
  }
}
function Lf(e, t, n = 1e-4) {
  return Math.abs(e[0] - t[0]) <= n && Math.abs(e[1] - t[1]) <= n;
}
function Ff(e) {
  const t = [];
  for (const n of e) {
    const r = t[t.length - 1];
    (!r || !Lf(r, n)) && t.push(n);
  }
  return t.length > 1 && Lf(t[0], t[t.length - 1]) && t.pop(), t;
}
function Nf(e, t, n) {
  const r = t[0] - e[0];
  if (Math.abs(r) < 1e-6) return [n, e[1]];
  const i = (n - e[0]) / r;
  return [n, e[1] + (t[1] - e[1]) * i];
}
function Df(e, t, n) {
  const r = t[1] - e[1];
  if (Math.abs(r) < 1e-6) return [e[0], n];
  const i = (n - e[1]) / r;
  return [e[0] + (t[0] - e[0]) * i, n];
}
function Cv(e, t, n, r, i) {
  let o = Ff(e);
  if (o.length < 3) return [];
  const s = [
    {
      inside: (l) => l[0] >= t,
      intersect: (l, u) => Nf(l, u, t)
    },
    {
      inside: (l) => l[0] <= r,
      intersect: (l, u) => Nf(l, u, r)
    },
    {
      inside: (l) => l[1] >= n,
      intersect: (l, u) => Df(l, u, n)
    },
    {
      inside: (l) => l[1] <= i,
      intersect: (l, u) => Df(l, u, i)
    }
  ];
  for (const l of s) {
    if (o.length === 0) return [];
    const u = o;
    o = [];
    let a = u[u.length - 1], f = l.inside(a);
    for (const c of u) {
      const d = l.inside(c);
      d ? (f || o.push(l.intersect(a, c)), o.push(c)) : f && o.push(l.intersect(a, c)), a = c, f = d;
    }
    o = Ff(o);
  }
  return o.length >= 3 ? o : [];
}
function or(e, t, n = 1) {
  return typeof e != "number" || !Number.isFinite(e) ? t : Math.max(n, e);
}
function Zr(e) {
  return Array.isArray(e) && e.length === 4 && Number.isFinite(e[0]) && Number.isFinite(e[1]) && Number.isFinite(e[2]) && Number.isFinite(e[3]);
}
const Rv = {
  position: "absolute",
  top: 4,
  right: 4,
  zIndex: 1,
  width: 18,
  height: 18,
  borderRadius: 999,
  border: "1px solid rgba(255,255,255,0.4)",
  background: "rgba(16, 17, 19, 0.85)",
  color: "#fff",
  fontSize: 12,
  lineHeight: 1,
  cursor: "pointer",
  padding: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center"
};
function Pv({ source: e, projectorRef: t, authToken: n = "", options: r, invalidateRef: i, className: o, style: s }) {
  const l = S.useRef(null), u = S.useRef(null), a = S.useRef(null), f = S.useRef({
    active: !1,
    pointerId: null
  }), c = S.useRef(null), d = S.useRef(!1), h = or(r?.width, ft.width, 64), g = or(r?.height, ft.height, 48), y = S.useMemo(() => {
    const F = Math.max(1, e.width), b = Math.max(1, e.height), V = F / b, ue = h / g;
    let re, me;
    return V > ue ? (re = h, me = h / V) : (me = g, re = g * V), {
      x: (h - re) / 2,
      y: (g - me) / 2,
      w: re,
      h: me
    };
  }, [e.width, e.height, h, g]), x = or(r?.margin, ft.margin, 0), p = or(r?.borderRadius, ft.borderRadius, 0), m = or(r?.borderWidth, ft.borderWidth, 0), v = Math.max(1, Math.round(or(r?.maxThumbnailTiles, ft.maxThumbnailTiles, 1))), w = r?.backgroundColor || ft.backgroundColor, E = r?.borderColor || ft.borderColor, C = r?.viewportBorderColor || ft.viewportBorderColor, A = r?.viewportBorderStyle === "stroke" || r?.viewportBorderStyle === "dash" ? r.viewportBorderStyle : ft.viewportBorderStyle, M = r?.viewportFillColor ?? ft.viewportFillColor, N = r?.interactive ?? ft.interactive, I = r?.showThumbnail ?? ft.showThumbnail, B = r?.position || ft.position, O = r?.onClose, L = r?.closeIcon, G = r?.closeButtonStyle, $ = S.useMemo(() => {
    const F = {};
    return B === "top-left" || B === "bottom-left" ? F.left = x : F.right = x, B === "top-left" || B === "top-right" ? F.top = x : F.bottom = x, {
      position: "absolute",
      ...F,
      width: h,
      height: g,
      borderRadius: p,
      overflow: "hidden",
      zIndex: 4,
      pointerEvents: N ? "auto" : "none",
      touchAction: "none",
      boxShadow: "0 10px 22px rgba(0, 0, 0, 0.3)",
      ...s
    };
  }, [x, B, h, g, p, N, s]), Y = S.useCallback(() => {
    const F = l.current;
    if (!F) return;
    const b = F.getContext("2d");
    if (!b) return;
    const V = h, ue = g, re = Math.max(1, window.devicePixelRatio || 1), me = Math.max(1, Math.round(V * re)), ge = Math.max(1, Math.round(ue * re));
    (F.width !== me || F.height !== ge) && (F.width = me, F.height = ge), b.setTransform(1, 0, 0, 1, 0, 0), b.clearRect(0, 0, F.width, F.height), b.setTransform(re, 0, 0, re, 0, 0), b.fillStyle = w, b.fillRect(0, 0, V, ue);
    const { x: Se, y: pe, w: Re, h: de } = y, xe = u.current;
    xe && b.drawImage(xe, Se, pe, Re, de), b.strokeStyle = E, b.lineWidth = m, b.strokeRect(m * 0.5, m * 0.5, V - m, ue - m);
    const J = t.current, te = J?.getViewBounds?.(), ee = J?.getViewCorners?.(), fe = Array.isArray(ee) && ee.length >= 4 && ee.every((K) => Array.isArray(K) && K.length >= 2 && Number.isFinite(K[0]) && Number.isFinite(K[1])) ? ee : null, oe = Zr(te) ? te : Zr(a.current) ? a.current : null;
    Zr(te) && (a.current = te);
    const ye = Re / Math.max(1, e.width), Ie = de / Math.max(1, e.height), ze = A === "dash";
    if (fe) {
      const K = fe.map((se) => [Se + se[0] * ye, pe + se[1] * Ie]), ae = Cv(K, Se, pe, Se + Re, pe + de);
      if (ae.length >= 3) {
        b.beginPath();
        for (let se = 0; se < ae.length; se += 1)
          se === 0 ? b.moveTo(ae[se][0], ae[se][1]) : b.lineTo(ae[se][0], ae[se][1]);
        b.closePath(), b.fillStyle = M, b.fill(), b.strokeStyle = C, b.lineWidth = 2.25, ze ? bf(b, ae, 4, 3) : b.stroke();
        return;
      }
    }
    if (!oe)
      return;
    const Pe = U(Se + oe[0] * ye, Se, Se + Re), Me = U(pe + oe[1] * Ie, pe, pe + de), Ke = U(Se + oe[2] * ye, Se, Se + Re), j = U(pe + oe[3] * Ie, pe, pe + de), z = Math.max(1, Ke - Pe), Z = Math.max(1, j - Me);
    if (b.fillStyle = M, b.fillRect(Pe, Me, z, Z), b.strokeStyle = C, b.lineWidth = 2.25, ze) {
      const K = [
        [Pe + 0.5, Me + 0.5],
        [Pe + 0.5 + Math.max(1, z - 1), Me + 0.5],
        [Pe + 0.5 + Math.max(1, z - 1), Me + 0.5 + Math.max(1, Z - 1)],
        [Pe + 0.5, Me + 0.5 + Math.max(1, Z - 1)]
      ];
      bf(b, K, 4, 3);
    } else
      b.strokeRect(Pe + 0.5, Me + 0.5, Math.max(1, z - 1), Math.max(1, Z - 1));
  }, [h, g, y, w, E, m, t, e.width, e.height, M, C, A]), Q = S.useCallback(() => {
    d.current || (d.current = !0, c.current = requestAnimationFrame(() => {
      d.current = !1, c.current = null, Y();
    }));
  }, [Y]), _ = S.useCallback(
    (F, b) => {
      const V = l.current;
      if (!V) return null;
      const ue = V.getBoundingClientRect();
      if (!ue.width || !ue.height) return null;
      const re = ue.width / h, me = ue.height / g, ge = y.x * re, Se = y.y * me, pe = y.w * re, Re = y.h * me, de = U((F - ue.left - ge) / pe, 0, 1), xe = U((b - ue.top - Se) / Re, 0, 1);
      return [de * e.width, xe * e.height];
    },
    [e.width, e.height, h, g, y]
  ), D = S.useCallback(
    (F, b) => {
      const V = t.current;
      if (!V) return;
      if (V.setViewCenter) {
        V.setViewCenter(F, b), Q();
        return;
      }
      const ue = V.getViewBounds?.(), re = Zr(ue) ? ue : Zr(a.current) ? a.current : null;
      if (!re) return;
      const me = Math.max(1e-6, re[2] - re[0]), ge = Math.max(1e-6, re[3] - re[1]);
      V.setViewState({
        offsetX: F - me * 0.5,
        offsetY: b - ge * 0.5
      }), Q();
    },
    [t, Q]
  ), q = S.useCallback(
    (F) => {
      if (!N || F.button !== 0) return;
      const b = l.current;
      if (!b) return;
      const V = _(F.clientX, F.clientY);
      V && (F.preventDefault(), F.stopPropagation(), b.setPointerCapture(F.pointerId), f.current = { active: !0, pointerId: F.pointerId }, D(V[0], V[1]));
    },
    [N, _, D]
  ), ne = S.useCallback(
    (F) => {
      const b = f.current;
      if (!b.active || b.pointerId !== F.pointerId) return;
      const V = _(F.clientX, F.clientY);
      V && (F.preventDefault(), F.stopPropagation(), D(V[0], V[1]));
    },
    [_, D]
  ), le = S.useCallback(
    (F) => {
      const b = f.current;
      if (!b.active || b.pointerId !== F.pointerId) return;
      const V = l.current;
      if (V && V.hasPointerCapture(F.pointerId))
        try {
          V.releasePointerCapture(F.pointerId);
        } catch {
        }
      f.current = { active: !1, pointerId: null }, Q();
    },
    [Q]
  );
  return S.useEffect(() => {
    let F = !1;
    u.current = null, Q();
    const b = 0, V = 2 ** (e.maxTierZoom - b), ue = Math.ceil(e.width / V), re = Math.ceil(e.height / V), me = Math.max(1, Math.ceil(ue / e.tileSize)), ge = Math.max(1, Math.ceil(re / e.tileSize)), Se = me * ge;
    if (!I || Se > v)
      return;
    const pe = document.createElement("canvas");
    pe.width = Math.max(1, Math.round(y.w)), pe.height = Math.max(1, Math.round(y.h));
    const Re = pe.getContext("2d");
    if (!Re)
      return;
    Re.fillStyle = w, Re.fillRect(0, 0, pe.width, pe.height);
    const de = [];
    for (let xe = 0; xe < ge; xe += 1)
      for (let J = 0; J < me; J += 1) {
        const te = J * e.tileSize * V, ee = xe * e.tileSize * V, fe = Math.min((J + 1) * e.tileSize, ue) * V, oe = Math.min((xe + 1) * e.tileSize, re) * V;
        de.push({
          url: La(e, b, J, xe),
          bounds: [te, ee, fe, oe]
        });
      }
    return Promise.allSettled(
      de.map(async (xe) => {
        const J = Ev(xe.url, n), te = await fetch(xe.url, {
          headers: J ? { Authorization: n } : void 0
        });
        if (!te.ok)
          throw new Error(`HTTP ${te.status}`);
        const ee = await createImageBitmap(await te.blob());
        return { tile: xe, bitmap: ee };
      })
    ).then((xe) => {
      if (F) {
        for (const ee of xe)
          ee.status === "fulfilled" && ee.value.bitmap.close();
        return;
      }
      const J = pe.width / Math.max(1, e.width), te = pe.height / Math.max(1, e.height);
      for (const ee of xe) {
        if (ee.status !== "fulfilled") continue;
        const {
          tile: { bounds: fe },
          bitmap: oe
        } = ee.value, ye = fe[0] * J, Ie = fe[1] * te, ze = Math.max(1, (fe[2] - fe[0]) * J), Pe = Math.max(1, (fe[3] - fe[1]) * te);
        Re.drawImage(oe, ye, Ie, ze, Pe), oe.close();
      }
      u.current = pe, Q();
    }), () => {
      F = !0;
    };
  }, [e, n, y, w, I, v, Q]), S.useEffect(() => {
    Q();
  }, [Q]), S.useEffect(() => {
    if (i)
      return i.current = Q, () => {
        i.current === Q && (i.current = null);
      };
  }, [i, Q]), S.useEffect(
    () => () => {
      f.current = { active: !1, pointerId: null }, c.current !== null && (cancelAnimationFrame(c.current), c.current = null), d.current = !1;
    },
    []
  ), /* @__PURE__ */ At.jsxs("div", { className: o, style: $, children: [
    /* @__PURE__ */ At.jsx(
      "canvas",
      {
        ref: l,
        style: {
          width: "100%",
          height: "100%",
          display: "block",
          borderRadius: "inherit"
        },
        onPointerDown: q,
        onPointerMove: ne,
        onPointerUp: le,
        onPointerCancel: le,
        onContextMenu: (F) => {
          F.preventDefault();
        },
        onWheel: (F) => {
          F.preventDefault(), F.stopPropagation();
        }
      }
    ),
    O && /* @__PURE__ */ At.jsx(
      "button",
      {
        type: "button",
        "aria-label": "Hide overview map",
        onClick: (F) => {
          F.stopPropagation(), O();
        },
        style: G ? { ...G } : { ...Rv },
        children: L ?? "×"
      }
    )
  ] });
}
const zf = "__patch_layer__", Mv = [];
function Tv({ regions: e, strokeStyle: t }) {
  const { rendererRef: n, registerDrawCallback: r, unregisterDrawCallback: i, requestOverlayRedraw: o } = tr(), s = e ?? Mv, l = S.useMemo(() => nn(Sm, t), [t]), u = S.useMemo(() => {
    const c = [];
    for (let d = 0; d < s.length; d += 1) {
      const h = s[d], g = ds(h.coordinates);
      g.length !== 0 && c.push({ region: h, regionIndex: d, regionKey: h.id ?? d, polygons: g });
    }
    return c;
  }, [s]), a = S.useCallback(
    (c) => {
      const d = n.current;
      if (!d || c.length === 0) return [];
      const h = new Array(c.length);
      for (let g = 0; g < c.length; g += 1) {
        const y = Ot(d.worldToScreen(c[g][0], c[g][1]));
        if (!y) return [];
        h[g] = y;
      }
      return h;
    },
    []
  ), f = S.useRef({ prepared: u, resolvedStrokeStyle: l, worldToScreenPoints: a });
  return f.current = { prepared: u, resolvedStrokeStyle: l, worldToScreenPoints: a }, S.useEffect(() => (r(zf, 20, (d) => {
    const { prepared: h, resolvedStrokeStyle: g, worldToScreenPoints: y } = f.current;
    for (const x of h)
      for (const p of x.polygons) {
        const m = y(p.outer);
        m.length >= 4 && tt(d, m, g, !0, !1);
        for (const v of p.holes) {
          const w = y(v);
          w.length >= 4 && tt(d, w, g, !0, !1);
        }
      }
  }), () => i(zf)), [r, i]), S.useEffect(() => {
    o();
  }, [u, l, o]), null;
}
function Li(e, t) {
  if (!e || !e.count || !e.positions || !e.paletteIndices)
    return null;
  const n = Br(t ?? []);
  if (n.length === 0) {
    const g = {
      count: 0,
      positions: new Float32Array(0),
      paletteIndices: new Uint16Array(0)
    };
    return e.fillModes instanceof Uint8Array && (g.fillModes = new Uint8Array(0)), e.ids instanceof Uint32Array && (g.ids = new Uint32Array(0)), g;
  }
  const r = er(e), i = e.positions, o = e.paletteIndices, s = e.fillModes instanceof Uint8Array && e.fillModes.length >= r ? e.fillModes : null, l = e.ids instanceof Uint32Array && e.ids.length >= r ? e.ids : null, u = new Float32Array(r * 2), a = new Uint16Array(r), f = s ? new Uint8Array(r) : null, c = l ? new Uint32Array(r) : null;
  let d = 0;
  for (let g = 0; g < r; g += 1) {
    const y = i[g * 2], x = i[g * 2 + 1];
    Ii(y, x, n) && (u[d * 2] = y, u[d * 2 + 1] = x, a[d] = o[g], f && (f[d] = s[g]), c && (c[d] = l[g]), d += 1);
  }
  const h = {
    count: d,
    positions: u.subarray(0, d * 2),
    paletteIndices: a.subarray(0, d)
  };
  return f && (h.fillModes = f.subarray(0, d)), c && (h.ids = c.subarray(0, d)), h;
}
function jm(e, t) {
  if (!e || !e.count || !e.positions || !e.paletteIndices)
    return new Uint32Array(0);
  const n = Br(t ?? []);
  if (n.length === 0)
    return new Uint32Array(0);
  const r = er(e);
  if (r === 0)
    return new Uint32Array(0);
  const i = e.positions, o = new Uint32Array(r);
  let s = 0;
  for (let l = 0; l < r; l += 1) {
    const u = i[l * 2], a = i[l * 2 + 1];
    Ii(u, a, n) && (o[s] = l, s += 1);
  }
  return o.subarray(0, s);
}
let ho = null;
const Av = `
struct Params {
  pointCount: u32,
  boundsCount: u32,
  _pad0: u32,
  _pad1: u32,
};

@group(0) @binding(0) var<storage, read> positions: array<vec2<f32>>;
@group(0) @binding(1) var<storage, read> bounds: array<vec4<f32>>;
@group(0) @binding(2) var<storage, read_write> outputMask: array<u32>;
@group(0) @binding(3) var<uniform> params: Params;

@compute @workgroup_size(256)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let i = gid.x;
  if (i >= params.pointCount) {
    return;
  }

  let p = positions[i];
  var inside: u32 = 0u;
  for (var bi: u32 = 0u; bi < params.boundsCount; bi = bi + 1u) {
    let b = bounds[bi];
    if (p.x >= b.x && p.x <= b.z && p.y >= b.y && p.y <= b.w) {
      inside = 1u;
      break;
    }
  }
  outputMask[i] = inside;
}
`;
function _v() {
  if (typeof navigator > "u") return !1;
  const e = navigator;
  return typeof e.gpu == "object" && e.gpu !== null;
}
function Zm() {
  if (!_v()) return null;
  const t = navigator.gpu;
  if (!t || typeof t != "object") return null;
  const n = t;
  return typeof n.requestAdapter != "function" ? null : n;
}
const mo = globalThis.GPUShaderStage?.COMPUTE ?? 4, cl = globalThis.GPUBufferUsage?.STORAGE ?? 128, po = globalThis.GPUBufferUsage?.COPY_DST ?? 8, kv = globalThis.GPUBufferUsage?.COPY_SRC ?? 4, Iv = globalThis.GPUBufferUsage?.UNIFORM ?? 64, bv = globalThis.GPUBufferUsage?.MAP_READ ?? 1, Lv = globalThis.GPUMapMode?.READ ?? 1;
async function Fv() {
  const e = Zm();
  if (!e)
    return { supported: !1, features: [] };
  const t = await e.requestAdapter();
  return t ? {
    supported: !0,
    adapterName: t.info?.description ?? t.info?.vendor ?? "unknown",
    features: Array.from(t.features),
    limits: {
      maxStorageBufferBindingSize: Number(
        t.limits.maxStorageBufferBindingSize
      ),
      maxComputeInvocationsPerWorkgroup: Number(
        t.limits.maxComputeInvocationsPerWorkgroup
      ),
      maxComputeWorkgroupSizeX: Number(t.limits.maxComputeWorkgroupSizeX)
    }
  } : { supported: !1, features: [] };
}
async function Nv() {
  return ho || (ho = (async () => {
    const e = Zm();
    if (!e) return null;
    const t = await e.requestAdapter();
    if (!t) return null;
    const n = await t.requestDevice(), r = n.createBindGroupLayout({
      entries: [
        {
          binding: 0,
          visibility: mo,
          buffer: { type: "read-only-storage" }
        },
        {
          binding: 1,
          visibility: mo,
          buffer: { type: "read-only-storage" }
        },
        {
          binding: 2,
          visibility: mo,
          buffer: { type: "storage" }
        },
        {
          binding: 3,
          visibility: mo,
          buffer: { type: "uniform" }
        }
      ]
    }), i = n.createComputePipeline({
      layout: n.createPipelineLayout({ bindGroupLayouts: [r] }),
      compute: {
        module: n.createShaderModule({ code: Av }),
        entryPoint: "main"
      }
    });
    return { device: n, pipeline: i, bindGroupLayout: r };
  })(), ho);
}
function go(e, t) {
  return Math.ceil(e / t) * t;
}
async function qm(e, t, n) {
  const r = await Nv();
  if (!r) return null;
  const i = Math.max(0, Math.floor(t)), o = Math.max(0, Math.floor(n.length / 4));
  if (i === 0 || o === 0)
    return new Uint32Array(0);
  const s = Math.min(i, Math.floor(e.length / 2));
  if (s === 0)
    return new Uint32Array(0);
  const l = s * 2 * Float32Array.BYTES_PER_ELEMENT, u = o * 4 * Float32Array.BYTES_PER_ELEMENT, a = s * Uint32Array.BYTES_PER_ELEMENT, f = Number(r.device.limits.maxStorageBufferBindingSize);
  if (l > f || u > f || a > f)
    return null;
  const c = r.device.createBuffer({
    size: go(l, 4),
    usage: cl | po
  }), d = r.device.createBuffer({
    size: go(u, 4),
    usage: cl | po
  }), h = r.device.createBuffer({
    size: go(a, 4),
    usage: cl | kv
  }), g = r.device.createBuffer({
    size: 16,
    usage: Iv | po
  }), y = r.device.createBuffer({
    size: go(a, 4),
    usage: po | bv
  });
  let x = !1;
  try {
    r.device.queue.writeBuffer(
      c,
      0,
      e.buffer,
      e.byteOffset,
      l
    ), r.device.queue.writeBuffer(
      d,
      0,
      n.buffer,
      n.byteOffset,
      u
    ), r.device.queue.writeBuffer(
      g,
      0,
      new Uint32Array([s, o, 0, 0])
    );
    const p = r.device.createBindGroup({
      layout: r.bindGroupLayout,
      entries: [
        { binding: 0, resource: { buffer: c } },
        { binding: 1, resource: { buffer: d } },
        { binding: 2, resource: { buffer: h } },
        { binding: 3, resource: { buffer: g } }
      ]
    }), m = r.device.createCommandEncoder(), v = m.beginComputePass();
    v.setPipeline(r.pipeline), v.setBindGroup(0, p), v.dispatchWorkgroups(Math.ceil(s / 256)), v.end(), m.copyBufferToBuffer(h, 0, y, 0, a), r.device.queue.submit([m.finish()]), await y.mapAsync(Lv), x = !0;
    const w = y.getMappedRange();
    return new Uint32Array(w.slice(0));
  } finally {
    if (x)
      try {
        y.unmap();
      } catch {
      }
    c.destroy(), d.destroy(), h.destroy(), g.destroy(), y.destroy();
  }
}
async function Km(e, t, n = {}) {
  const r = Ae(), i = n.bridgeToDraw === !0;
  if (!e || !e.count || !e.positions || !e.paletteIndices)
    return {
      data: null,
      meta: {
        mode: "hybrid-webgpu",
        durationMs: Ae() - r,
        usedWebGpu: !1,
        candidateCount: 0,
        bridgedToDraw: !1
      }
    };
  const o = Br(t ?? []);
  if (o.length === 0) {
    const w = {
      count: 0,
      positions: new Float32Array(0),
      paletteIndices: new Uint16Array(0)
    };
    return e.fillModes instanceof Uint8Array && (w.fillModes = new Uint8Array(0)), e.ids instanceof Uint32Array && (w.ids = new Uint32Array(0)), {
      data: w,
      meta: {
        mode: "hybrid-webgpu",
        durationMs: Ae() - r,
        usedWebGpu: !1,
        candidateCount: 0,
        bridgedToDraw: !1
      }
    };
  }
  const s = er(e), l = e.fillModes instanceof Uint8Array && e.fillModes.length >= s ? e.fillModes : null, u = e.ids instanceof Uint32Array && e.ids.length >= s ? e.ids : null;
  if (s === 0) {
    const w = {
      count: 0,
      positions: new Float32Array(0),
      paletteIndices: new Uint16Array(0)
    };
    return l && (w.fillModes = new Uint8Array(0)), u && (w.ids = new Uint32Array(0)), {
      data: w,
      meta: {
        mode: "hybrid-webgpu",
        durationMs: Ae() - r,
        usedWebGpu: !1,
        candidateCount: 0,
        bridgedToDraw: !1
      }
    };
  }
  const a = new Float32Array(o.length * 4);
  for (let w = 0; w < o.length; w += 1) {
    const E = w * 4, C = o[w];
    a[E] = C.minX, a[E + 1] = C.minY, a[E + 2] = C.maxX, a[E + 3] = C.maxY;
  }
  let f = null, c = !1;
  try {
    f = await qm(e.positions, s, a), c = !!f;
  } catch {
    f = null, c = !1;
  }
  if (!f)
    return {
      data: Li(e, t),
      meta: {
        mode: "hybrid-webgpu",
        durationMs: Ae() - r,
        usedWebGpu: !1,
        candidateCount: s,
        bridgedToDraw: !1
      }
    };
  let d = 0;
  for (let w = 0; w < s; w += 1)
    f[w] === 1 && (d += 1);
  const h = new Uint32Array(d);
  if (d > 0) {
    let w = 0;
    for (let E = 0; E < s; E += 1)
      f[E] === 1 && (h[w] = E, w += 1);
  }
  if (d === 0) {
    if (i) {
      const E = {
        count: s,
        positions: e.positions.subarray(0, s * 2),
        paletteIndices: e.paletteIndices.subarray(0, s),
        drawIndices: new Uint32Array(0)
      };
      return l && (E.fillModes = l.subarray(0, s)), u && (E.ids = u.subarray(0, s)), {
        data: E,
        meta: {
          mode: "hybrid-webgpu",
          durationMs: Ae() - r,
          usedWebGpu: !0,
          candidateCount: 0,
          bridgedToDraw: !0
        }
      };
    }
    const w = {
      count: 0,
      positions: new Float32Array(0),
      paletteIndices: new Uint16Array(0)
    };
    return l && (w.fillModes = new Uint8Array(0)), u && (w.ids = new Uint32Array(0)), {
      data: w,
      meta: {
        mode: "hybrid-webgpu",
        durationMs: Ae() - r,
        usedWebGpu: !0,
        candidateCount: 0,
        bridgedToDraw: !1
      }
    };
  }
  if (i) {
    const w = new Uint32Array(d);
    let E = 0;
    for (let A = 0; A < d; A += 1) {
      const M = h[A] ?? 0, N = e.positions[M * 2], I = e.positions[M * 2 + 1];
      Ii(N, I, o) && (w[E] = M, E += 1);
    }
    const C = {
      count: s,
      positions: e.positions.subarray(0, s * 2),
      paletteIndices: e.paletteIndices.subarray(0, s),
      drawIndices: w.subarray(0, E)
    };
    return l && (C.fillModes = l.subarray(0, s)), u && (C.ids = u.subarray(0, s)), {
      data: C,
      meta: {
        mode: "hybrid-webgpu",
        durationMs: Ae() - r,
        usedWebGpu: !0,
        candidateCount: d,
        bridgedToDraw: !0
      }
    };
  }
  const g = new Float32Array(d * 2), y = new Uint16Array(d), x = l ? new Uint8Array(d) : null, p = u ? new Uint32Array(d) : null;
  let m = 0;
  for (let w = 0; w < d; w += 1) {
    const E = h[w] ?? 0, C = e.positions[E * 2], A = e.positions[E * 2 + 1];
    Ii(C, A, o) && (g[m * 2] = C, g[m * 2 + 1] = A, y[m] = e.paletteIndices[E], x && (x[m] = l[E]), p && (p[m] = u[E]), m += 1);
  }
  const v = {
    count: m,
    positions: g.subarray(0, m * 2),
    paletteIndices: y.subarray(0, m)
  };
  return x && (v.fillModes = x.subarray(0, m)), p && (v.ids = p.subarray(0, m)), {
    data: v,
    meta: {
      mode: "hybrid-webgpu",
      durationMs: Ae() - r,
      usedWebGpu: !0,
      candidateCount: d,
      bridgedToDraw: !1
    }
  };
}
class Qm {
  constructor(t, n) {
    R(this, "worker", null);
    R(this, "supported", !0);
    R(this, "requestId", 1);
    R(this, "pendingById", /* @__PURE__ */ new Map());
    R(this, "handleMessage", (t) => {
      const n = t.data;
      if (!n) return;
      const r = this.pendingById.get(n.id);
      r && (this.pendingById.delete(n.id), this.handlers.onResponse(n, r));
    });
    R(this, "handleError", () => {
      this.supported = !1, this.teardownWorker("worker crashed");
    });
    this.createWorker = t, this.handlers = n;
  }
  beginRequest(t) {
    const n = this.getOrCreateWorker();
    if (!n) return null;
    const r = this.requestId++;
    return this.pendingById.set(r, t), { id: r, worker: n };
  }
  cancelRequest(t) {
    const n = this.pendingById.get(t);
    if (n)
      return this.pendingById.delete(t), n;
  }
  terminate(t = "worker terminated") {
    this.teardownWorker(t);
  }
  getOrCreateWorker() {
    if (!this.supported) return null;
    if (this.worker) return this.worker;
    try {
      const t = this.createWorker();
      return t.addEventListener("message", this.handleMessage), t.addEventListener("error", this.handleError), this.worker = t, t;
    } catch {
      return this.supported = !1, null;
    }
  }
  teardownWorker(t) {
    this.worker && (this.worker.removeEventListener("message", this.handleMessage), this.worker.removeEventListener("error", this.handleError), this.worker.terminate(), this.worker = null);
    const n = new Error(t);
    for (const [, r] of this.pendingById)
      this.handlers.rejectPending(r, n);
    this.pendingById.clear();
  }
}
const Fi = new Qm(
  () => new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/roi-clip-worker-CHxxL_lK.js", import.meta.url).href,
    import.meta.url
  ), { type: "module" }),
  {
    onResponse: (e, t) => {
      if (e.type === "roi-clip-failure") {
        t.reject(new Error(e.error || "worker clip failed"));
        return;
      }
      if (e.type === "roi-clip-index-success") {
        if (t.kind !== "index") {
          t.reject(new Error("worker response mismatch: expected point data result"));
          return;
        }
        const u = Math.max(0, Math.floor(e.count)), a = new Uint32Array(e.indices).subarray(0, u);
        t.resolve({
          indices: a,
          meta: {
            mode: "worker",
            durationMs: Number.isFinite(e.durationMs) ? e.durationMs : Ae() - t.startMs
          }
        });
        return;
      }
      if (t.kind !== "data") {
        t.reject(new Error("worker response mismatch: expected index result"));
        return;
      }
      const n = Math.max(0, Math.floor(e.count)), r = new Float32Array(e.positions), i = new Uint16Array(e.paletteIndices), o = e.fillModes ? new Uint8Array(e.fillModes) : null, s = e.ids ? new Uint32Array(e.ids) : null, l = {
        count: n,
        positions: r.subarray(0, n * 2),
        paletteIndices: i.subarray(0, n)
      };
      o && (l.fillModes = o.subarray(0, n)), s && (l.ids = s.subarray(0, n)), t.resolve({
        data: l,
        meta: {
          mode: "worker",
          durationMs: Number.isFinite(e.durationMs) ? e.durationMs : Ae() - t.startMs
        }
      });
    },
    rejectPending: (e, t) => {
      e.reject(t);
    }
  }
);
function Dv() {
  Fi.terminate("worker terminated");
}
async function Jm(e, t) {
  if (!e || !e.count || !e.positions || !e.paletteIndices)
    return {
      data: null,
      meta: { mode: "worker", durationMs: 0 }
    };
  const n = er(e), r = e.positions.slice(0, n * 2), i = e.paletteIndices.slice(0, n), o = e.fillModes instanceof Uint8Array && e.fillModes.length >= n ? e.fillModes.slice(0, n) : null, s = e.ids instanceof Uint32Array && e.ids.length >= n ? e.ids.slice(0, n) : null;
  return new Promise((l, u) => {
    const a = Ae(), f = Fi.beginRequest({
      kind: "data",
      resolve: l,
      reject: u,
      startMs: a
    });
    if (!f) {
      l({
        data: Li(e, t),
        meta: { mode: "sync", durationMs: Ae() - a }
      });
      return;
    }
    const c = {
      type: "roi-clip-request",
      id: f.id,
      count: n,
      positions: r.buffer,
      paletteIndices: i.buffer,
      fillModes: o?.buffer,
      ids: s?.buffer,
      polygons: t ?? []
    }, d = [r.buffer, i.buffer];
    o && d.push(o.buffer), s && d.push(s.buffer);
    try {
      f.worker.postMessage(c, d);
    } catch (h) {
      const g = Fi.cancelRequest(f.id);
      g ? g.reject(h) : u(h);
    }
  });
}
async function zv(e, t) {
  if (!e || !e.count || !e.positions || !e.paletteIndices)
    return {
      indices: new Uint32Array(0),
      meta: { mode: "worker", durationMs: 0 }
    };
  const n = er(e), r = e.positions.slice(0, n * 2);
  return new Promise((i, o) => {
    const s = Ae(), l = Fi.beginRequest({
      kind: "index",
      resolve: i,
      reject: o,
      startMs: s
    });
    if (!l) {
      i({
        indices: jm(e, t),
        meta: { mode: "sync", durationMs: Ae() - s }
      });
      return;
    }
    const u = {
      type: "roi-clip-index-request",
      id: l.id,
      count: n,
      positions: r.buffer,
      polygons: t ?? []
    };
    try {
      l.worker.postMessage(u, [r.buffer]);
    } catch (a) {
      const f = Fi.cancelRequest(l.id);
      f ? f.reject(a) : o(a);
    }
  });
}
const Uv = {
  count: 0,
  positions: new Float32Array(0),
  paletteIndices: new Uint16Array(0)
};
function Bv(e, t, n, r, i) {
  const o = S.useRef(0), [s, l] = S.useState(n), u = S.useMemo(
    () => r.map((a) => Ur(a.coordinates)).filter((a) => a != null),
    [r]
  );
  return S.useEffect(() => {
    const a = ++o.current;
    let f = !1;
    if (!e)
      return l(n), () => {
        f = !0;
      };
    if (!n || !n.count || !n.positions || !n.paletteIndices)
      return l(null), () => {
        f = !0;
      };
    if (u.length === 0)
      return l(Uv), i?.({
        mode: t,
        durationMs: 0,
        inputCount: n.count,
        outputCount: 0,
        polygonCount: 0
      }), () => {
        f = !0;
      };
    const c = (h, g) => {
      if (f || a !== o.current) return;
      const y = n.count, x = h?.drawIndices ? h.drawIndices.length : h?.count ?? 0;
      l(h), i?.({
        mode: g.mode,
        durationMs: g.durationMs,
        inputCount: y,
        outputCount: x,
        polygonCount: u.length,
        usedWebGpu: g.usedWebGpu,
        candidateCount: g.candidateCount,
        bridgedToDraw: g.bridgedToDraw
      });
    };
    return (async () => {
      if (t === "sync") {
        const h = performance.now(), g = Li(n, u);
        c(g, {
          mode: "sync",
          durationMs: performance.now() - h
        });
        return;
      }
      if (t === "hybrid-webgpu") {
        const h = await Km(n, u, { bridgeToDraw: !0 });
        c(h.data, {
          mode: h.meta.mode,
          durationMs: h.meta.durationMs,
          usedWebGpu: h.meta.usedWebGpu,
          candidateCount: h.meta.candidateCount,
          bridgedToDraw: h.meta.bridgedToDraw
        });
        return;
      }
      try {
        const h = await Jm(n, u);
        c(h.data, {
          mode: h.meta.mode,
          durationMs: h.meta.durationMs
        });
      } catch {
        const h = performance.now(), g = Li(n, u);
        c(g, {
          mode: "sync",
          durationMs: performance.now() - h
        });
      }
    })(), () => {
      f = !0;
    };
  }, [e, t, n, u, i]), s;
}
const Ov = 24, Wv = 1024, Yv = 4, Fo = -1;
function ei(e, t, n) {
  return (e * 73856093 ^ t * 19349663) >>> 0 & n;
}
function Vv(e, t, n) {
  if (e <= 0 || t <= 0 || n <= 0) return 256;
  const r = Math.max(1, e * t), o = Math.sqrt(r / Math.max(1, n)) * Yv;
  return Math.max(Ov, Math.min(Wv, o));
}
function Xv(e, t) {
  if (!(e instanceof Uint32Array) || e.length === 0)
    return null;
  let n = !0;
  for (let o = 0; o < e.length; o += 1)
    if (!(e[o] < t)) {
      n = !1;
      break;
    }
  if (n)
    return e;
  const r = new Uint32Array(e.length);
  let i = 0;
  for (let o = 0; o < e.length; o += 1)
    e[o] >= t || (r[i] = e[o], i += 1);
  return i > 0 ? r.subarray(0, i) : null;
}
function Hv(e) {
  const t = Math.max(0, Math.floor(e.count)), n = Math.floor(e.positions.length / 2), r = Math.max(0, Math.min(t, n));
  if (r <= 0)
    return null;
  const i = Xv(e.drawIndices ?? null, r), o = i ? i.length : r;
  if (o === 0)
    return null;
  const s = Vv(e.sourceWidth, e.sourceHeight, o), l = 1 / s, u = new Int32Array(o), a = new Int32Array(o);
  let f = 0;
  if (i)
    for (let L = 0; L < o; L += 1) {
      const G = i[L], $ = e.positions[G * 2], Y = e.positions[G * 2 + 1];
      !Number.isFinite($) || !Number.isFinite(Y) || (u[f] = Math.floor($ * l), a[f] = Math.floor(Y * l), f += 1);
    }
  else
    for (let L = 0; L < r; L += 1) {
      const G = e.positions[L * 2], $ = e.positions[L * 2 + 1];
      !Number.isFinite(G) || !Number.isFinite($) || (u[f] = Math.floor(G * l), a[f] = Math.floor($ * l), f += 1);
    }
  if (f === 0)
    return null;
  let c = Math.min(f, Math.max(64, f >>> 3));
  (!Number.isFinite(c) || c <= 0) && (c = f);
  let d = 1;
  for (; d < c * 2; ) d <<= 1;
  let h = d - 1, g = new Int32Array(d * 2), y = new Int32Array(d);
  g.fill(2147483647);
  let x = 0;
  const p = new Int32Array(f);
  for (let L = 0; L < f; L += 1) {
    const G = u[L], $ = a[L];
    let Y = ei(G, $, h);
    for (; ; ) {
      const Q = g[Y * 2];
      if (Q === 2147483647) {
        if (g[Y * 2] = G, g[Y * 2 + 1] = $, y[Y] = 1, p[L] = Y, x += 1, x * 4 > d * 3) {
          const _ = d;
          d <<= 1, h = d - 1;
          const D = new Int32Array(d * 2), q = new Int32Array(d);
          D.fill(2147483647);
          for (let ne = 0; ne < _; ne += 1) {
            if (g[ne * 2] === 2147483647) continue;
            const le = g[ne * 2], F = g[ne * 2 + 1];
            let b = ei(le, F, h);
            for (; D[b * 2] !== 2147483647; ) b = b + 1 & h;
            D[b * 2] = le, D[b * 2 + 1] = F, q[b] = y[ne];
          }
          for (g = D, y = q, Y = ei(G, $, h); g[Y * 2] !== G || g[Y * 2 + 1] !== $; )
            Y = Y + 1 & h;
          p[L] = Y;
        }
        break;
      }
      if (Q === G && g[Y * 2 + 1] === $) {
        y[Y] += 1, p[L] = Y;
        break;
      }
      Y = Y + 1 & h;
    }
  }
  const m = new Int32Array(x * 2), v = new Uint32Array(x), w = new Uint32Array(x), E = new Int32Array(d);
  E.fill(Fo);
  let C = 0, A = 0;
  for (let L = 0; L < d; L += 1)
    g[L * 2] !== 2147483647 && (m[C * 2] = g[L * 2], m[C * 2 + 1] = g[L * 2 + 1], v[C] = A, w[C] = y[L], E[L] = C, A += y[L], C += 1);
  const M = new Uint32Array(f), N = new Uint32Array(x);
  if (N.set(v), i)
    for (let L = 0; L < f; L += 1) {
      const G = E[p[L]];
      M[N[G]] = i[L], N[G] += 1;
    }
  else {
    let L = 0;
    for (let G = 0; G < r; G += 1) {
      const $ = e.positions[G * 2], Y = e.positions[G * 2 + 1];
      if (!Number.isFinite($) || !Number.isFinite(Y)) continue;
      const Q = E[p[L]];
      M[N[Q]] = G, N[Q] += 1, L += 1;
    }
  }
  let I = 1;
  for (; I < x * 2; ) I <<= 1;
  const B = I - 1, O = new Int32Array(I);
  O.fill(Fo);
  for (let L = 0; L < x; L += 1) {
    const G = m[L * 2], $ = m[L * 2 + 1];
    let Y = ei(G, $, B);
    for (; O[Y] !== Fo; ) Y = Y + 1 & B;
    O[Y] = L;
  }
  return {
    cellSize: s,
    safeCount: r,
    cellCount: x,
    hashCapacity: I,
    hashTable: O,
    cellKeys: m,
    cellOffsets: v,
    cellLengths: w,
    pointIndices: M
  };
}
function ep(e, t, n) {
  const { hashTable: r, cellKeys: i, hashMask: o } = e;
  let s = ei(t, n, o);
  for (; ; ) {
    const l = r[s];
    if (l === Fo) return -1;
    if (i[l * 2] === t && i[l * 2 + 1] === n) return l;
    s = s + 1 & o;
  }
}
function Gv(e, t) {
  if (e.safeCount <= 0 || e.cellCount <= 0) return null;
  const n = e.safeCount;
  return {
    cellSize: e.cellSize,
    safeCount: n,
    positions: t.positions.subarray(0, n * 2),
    ids: t.ids instanceof Uint32Array && t.ids.length >= n ? t.ids.subarray(0, n) : null,
    hashCapacity: e.hashCapacity,
    hashMask: e.hashCapacity - 1,
    hashTable: new Int32Array(e.hashTable),
    cellKeys: new Int32Array(e.cellKeys),
    cellOffsets: new Uint32Array(e.cellOffsets),
    cellLengths: new Uint32Array(e.cellLengths),
    pointIndices: new Uint32Array(e.pointIndices)
  };
}
const wu = new Qm(
  () => new Worker(new URL(
    /* @vite-ignore */
    "" + new URL("assets/point-hit-index-worker-CNFA6pZm.js", import.meta.url).href,
    import.meta.url
  ), {
    type: "module"
  }),
  {
    onResponse: (e, t) => {
      if (e.type === "point-hit-index-failure") {
        t.reject(new Error(e.error || "worker index build failed"));
        return;
      }
      t.resolve(Gv(e, t.pointData));
    },
    rejectPending: (e, t) => {
      e.reject(t);
    }
  }
);
function $v() {
  wu.terminate("worker terminated");
}
function jv(e, t) {
  const n = er(e);
  if (n <= 0) return null;
  const r = e.positions.subarray(0, n * 2), i = Hv({
    count: n,
    positions: r,
    drawIndices: e.drawIndices instanceof Uint32Array ? e.drawIndices : null,
    sourceWidth: t?.width ?? 0,
    sourceHeight: t?.height ?? 0
  });
  return i ? {
    cellSize: i.cellSize,
    safeCount: n,
    positions: r,
    ids: e.ids instanceof Uint32Array && e.ids.length >= n ? e.ids.subarray(0, n) : null,
    hashCapacity: i.hashCapacity,
    hashMask: i.hashCapacity - 1,
    hashTable: i.hashTable,
    cellKeys: i.cellKeys,
    cellOffsets: i.cellOffsets,
    cellLengths: i.cellLengths,
    pointIndices: i.pointIndices
  } : null;
}
async function tp(e, t) {
  if (!e || !e.positions || !e.paletteIndices)
    return null;
  const n = er(e);
  return n <= 0 ? null : new Promise((r, i) => {
    const o = {
      resolve: r,
      reject: i,
      pointData: e
    }, s = wu.beginRequest(o);
    if (!s || !s.worker) {
      r(jv(e, t));
      return;
    }
    const l = e.positions.slice(0, n * 2), u = e.drawIndices instanceof Uint32Array && e.drawIndices.length > 0 ? e.drawIndices.slice() : void 0, a = {
      type: "point-hit-index-request",
      id: s.id,
      count: n,
      positions: l.buffer,
      drawIndices: u?.buffer,
      sourceWidth: t?.width ?? 0,
      sourceHeight: t?.height ?? 0
    }, f = [l.buffer];
    u && f.push(u.buffer);
    try {
      s.worker.postMessage(a, f);
    } catch (c) {
      const d = wu.cancelRequest(s.id);
      d ? d.reject(c) : i(c);
    }
  });
}
const Zv = 0.65, qv = 4;
function Kv(e, t, n, r, i, o, s) {
  const l = !!(n || r || i), [u, a] = S.useState(null), f = S.useRef(null), c = S.useRef(null);
  S.useEffect(() => {
    if (!l || !e) {
      a(null);
      return;
    }
    let y = !1;
    return tp(e, t).then((x) => {
      y || a(x);
    }), () => {
      y = !0;
    };
  }, [l, e, t]);
  const d = S.useCallback(
    (y) => {
      const x = s.current;
      if (!x || !u) return null;
      const p = Number(y[0]), m = Number(y[1]);
      if (!Number.isFinite(p) || !Number.isFinite(m)) return null;
      const v = Math.max(1e-6, x.getViewState().zoom), w = x.getPointSizeByZoom(), C = Math.max(qv, w * Zv) / v;
      if (!Number.isFinite(C) || C <= 0) return null;
      const { cellSize: A, cellOffsets: M, cellLengths: N, pointIndices: I, positions: B, safeCount: O } = u, L = Math.floor(p / A), G = Math.floor(m / A), $ = Math.max(1, Math.ceil(C / A)), Y = C * C;
      let Q = -1, _ = Y, D = 0, q = 0;
      for (let le = L - $; le <= L + $; le += 1)
        for (let F = G - $; F <= G + $; F += 1) {
          const b = ep(u, le, F);
          if (b < 0) continue;
          const V = M[b], ue = V + N[b];
          for (let re = V; re < ue; re += 1) {
            const me = I[re];
            if (me >= O) continue;
            const ge = B[me * 2], Se = B[me * 2 + 1], pe = ge - p, Re = Se - m, de = pe * pe + Re * Re;
            de > _ || (_ = de, Q = me, D = ge, q = Se);
          }
        }
      if (Q < 0) return null;
      const ne = u.ids ? Number(u.ids[Q]) : null;
      return {
        index: Q,
        id: ne,
        coordinate: [p, m],
        pointCoordinate: [D, q]
      };
    },
    [u]
  ), h = S.useCallback(
    (y, x) => {
      if (!n) return;
      const p = y?.index ?? null, m = y?.id ?? null;
      f.current === p && c.current === m || (f.current = p, c.current = m, n({
        index: p,
        id: m,
        coordinate: x,
        pointCoordinate: y?.pointCoordinate ?? null
      }));
    },
    [n]
  ), g = S.useCallback(
    (y, x) => {
      if (!r) return;
      const p = d(y);
      p && r({
        ...p,
        button: x
      });
    },
    [r, d]
  );
  return S.useEffect(() => {
    if (i)
      return i.current = d, () => {
        i.current === d && (i.current = null);
      };
  }, [i, d]), S.useEffect(() => {
    const y = f.current;
    y !== null && (u && y < u.safeCount || (f.current = null, c.current = null, n?.({
      index: null,
      id: null,
      coordinate: null,
      pointCoordinate: null
    })));
  }, [u, n]), S.useEffect(() => {
  }, [o, n]), { getCellByCoordinates: d, emitPointHover: h, emitPointClick: g };
}
const Qv = S.forwardRef(function({
  data: t = null,
  palette: n = null,
  sizeByZoom: r,
  strokeScale: i,
  innerFillOpacity: o,
  clipEnabled: s = !1,
  clipToRegions: l,
  clipMode: u = "worker",
  onClipStats: a,
  onHover: f,
  onClick: c
}, d) {
  const { rendererRef: h, rendererSerial: g, source: y } = tr(), x = S.useRef(null), m = Bv(s, u, t, l ?? Jv, a), { getCellByCoordinates: v } = Kv(
    m,
    y,
    f,
    c,
    x,
    "cursor",
    h
  );
  return S.useImperativeHandle(d, () => ({ queryAt: v }), [v]), S.useEffect(() => {
    const w = h.current;
    !w || !n || w.setPointPalette(n);
  }, [g, n]), S.useEffect(() => {
    const w = h.current;
    !w || r === void 0 || w.setPointSizeByZoom(r);
  }, [g, r]), S.useEffect(() => {
    const w = h.current;
    !w || i === void 0 || w.setPointStrokeScale(i);
  }, [g, i]), S.useEffect(() => {
    const w = h.current;
    !w || o === void 0 || w.setPointInnerFillOpacity(o);
  }, [g, o]), S.useEffect(() => {
    const w = h.current;
    w && w.setPointData(m);
  }, [g, m]), null;
}), Jv = [], ew = 180, Uf = 20;
function tw(e) {
  const t = U(e, 0, 1);
  return t * t * (3 - 2 * t);
}
function nw(e, t, n) {
  const [r, i] = S.useState(0), o = S.useRef(0), s = S.useRef({
    rafId: null,
    startMs: 0,
    from: 0,
    to: 0
  }), l = S.useCallback((c) => {
    const d = U(c, 0, Uf);
    Math.abs(o.current - d) < 1e-4 || (o.current = d, i(d));
  }, []), u = S.useCallback(() => {
    const c = s.current;
    c.rafId !== null && (cancelAnimationFrame(c.rafId), c.rafId = null);
  }, []), a = S.useCallback(
    (c) => {
      const d = U(c, 0, Uf), h = s.current, g = o.current;
      if (Math.abs(g - d) < 1e-4) {
        u(), h.to = d, l(d);
        return;
      }
      u(), h.startMs = performance.now(), h.from = g, h.to = d;
      const y = (x) => {
        const p = s.current, m = Math.max(0, x - p.startMs), v = U(m / ew, 0, 1), w = tw(v), E = p.from + (p.to - p.from) * w;
        if (l(E), n.current?.(), v >= 1) {
          p.rafId = null, l(p.to);
          return;
        }
        p.rafId = requestAnimationFrame(y);
      };
      h.rafId = requestAnimationFrame(y);
    },
    [l, u]
  ), f = S.useCallback(
    (c) => {
      const d = t.current;
      if (!d || typeof c != "number" || !Number.isFinite(c)) {
        a(0);
        return;
      }
      const h = _a(e, c, d.getZoomRange(), d.getRegionLabelAutoLiftCapZoom());
      a(h);
    },
    [e, a]
  );
  return S.useEffect(() => () => {
    u();
  }, [u]), {
    regionLabelAutoLiftOffsetPx: r,
    syncRegionLabelAutoLiftTarget: f,
    cancelRegionLabelAutoLiftAnimation: u,
    applyRegionLabelAutoLiftOffset: l
  };
}
const rw = 6;
function xu(e, t) {
  return e.id ?? t;
}
function iw(e, t, n, r, i, o) {
  const s = i - n, l = o - r, u = s * s + l * l;
  if (u <= 1e-12) {
    const g = e - n, y = t - r;
    return g * g + y * y;
  }
  const a = U(((e - n) * s + (t - r) * l) / u, 0, 1), f = n + s * a, c = r + l * a, d = e - f, h = t - c;
  return d * d + h * h;
}
function Bf(e, t, n, r) {
  for (let i = 1; i < n.length; i += 1) {
    const o = n[i - 1], s = n[i];
    if (iw(e, t, o[0], o[1], s[0], s[1]) <= r)
      return !0;
  }
  return !1;
}
function ow(e, t, n, r) {
  if (e < n.minX - r || e > n.maxX + r || t < n.minY - r || t > n.maxY + r)
    return !1;
  const i = r * r;
  if (Bf(e, t, n.outer, i)) return !0;
  for (const o of n.holes)
    if (Bf(e, t, o, i)) return !0;
  return !1;
}
function sw(e, t, n, r, i, o, s) {
  if (!e.label || !e.labelAnchor) return !1;
  const l = Ca(n.worldToScreen(e.labelAnchor[0], e.labelAnchor[1]));
  if (!l) return !1;
  const a = Pa(e.label, r) + r.paddingX * 2, f = r.fontSize + r.paddingY * 2, c = l[0], d = l[1] - r.offsetY, h = s ? U(c, a * 0.5 + 1, i - a * 0.5 - 1) : c, g = s ? U(d, f * 0.5 + 1, o - f * 0.5 - 1) : d, y = h - a * 0.5, x = h + a * 0.5, p = g - f * 0.5, m = g + f * 0.5;
  return t[0] >= y && t[0] <= x && t[1] >= p && t[1] <= m;
}
function lw(e, t = "top-center") {
  const n = [];
  for (let r = 0; r < e.length; r += 1) {
    const i = e[r], o = Br([Ur(i?.coordinates)]);
    if (o.length === 0) continue;
    const s = typeof i?.label == "string" ? i.label.trim() : "";
    n.push({
      region: i,
      regionIndex: r,
      regionId: xu(i, r),
      polygons: o,
      label: s,
      labelAnchor: s ? Ma(o, t) : null
    });
  }
  return n;
}
function Of(e, t, n, r, i, o, s, l, u, a = !0) {
  const f = e[0], c = e[1], d = Math.max(1e-6, r.getViewState().zoom), h = Math.max(0, s), g = rw / d;
  for (let y = n.length - 1; y >= 0; y -= 1) {
    const x = n[y];
    for (const m of x.polygons)
      if (ow(f, c, m, g))
        return {
          region: x.region,
          regionIndex: x.regionIndex,
          regionId: x.regionId
        };
    let p = Aa(
      i,
      o?.({
        region: x.region,
        regionId: x.regionId,
        regionIndex: x.regionIndex,
        zoom: d
      })
    );
    if (h > 0 && (p = {
      ...p,
      offsetY: p.offsetY + h
    }), !!sw(x, t, r, p, l, u, a))
      return {
        region: x.region,
        regionIndex: x.regionIndex,
        regionId: x.regionId
      };
  }
  return null;
}
const Wf = [], uw = [], Yf = "__region_layer__", Vf = "__region_label__";
function aw(e) {
  return {
    color: Em,
    width: Cm,
    lineDash: Kn,
    lineJoin: e.lineJoin,
    lineCap: e.lineCap,
    shadowColor: "rgba(0, 0, 0, 0)",
    shadowBlur: 0,
    shadowOffsetX: 0,
    shadowOffsetY: 0
  };
}
function cw({
  regions: e,
  polygons: t,
  strokeStyle: n,
  hoverStrokeStyle: r,
  activeStrokeStyle: i,
  resolveStrokeStyle: o,
  labelStyle: s,
  labelAnchor: l = "top-center",
  autoLiftLabelAtMaxZoom: u = !1,
  clampLabelToViewport: a = !0,
  activeRegionId: f,
  onActiveChange: c,
  onHover: d,
  onClick: h
}) {
  const { rendererRef: g, rendererSerial: y, canvasRef: x, containerRef: p, registerDrawCallback: m, unregisterDrawCallback: v, requestOverlayRedraw: w, drawInvalidateRef: E, registerViewStateListener: C, screenToWorld: A, worldToScreen: M, isInteractionLocked: N } = tr(), I = e ?? Wf, B = t ?? uw, O = S.useMemo(() => I.length > 0 ? I : B.length === 0 ? Wf : B.map((J, te) => ({ id: te, coordinates: J })), [I, B]), [L, G] = S.useState(null), [$, Y] = S.useState(() => f ?? null), Q = f !== void 0, _ = Q ? f ?? null : $, D = S.useRef(null);
  S.useEffect(() => {
    Q && Y(f ?? null);
  }, [Q, f]);
  const q = S.useCallback(
    (J) => {
      String(_) !== String(J) && (Q || Y(J), c?.(J));
    },
    [_, Q, c]
  ), { regionLabelAutoLiftOffsetPx: ne, syncRegionLabelAutoLiftTarget: le } = nw(u, g, E), F = S.useMemo(() => Ra(n), [n]), b = S.useMemo(() => nn(F, r), [F, r]), V = S.useMemo(() => nn(F, i), [F, i]), { staticLabelStyle: ue, labelStyleResolver: re } = S.useMemo(() => typeof s == "function" ? { staticLabelStyle: void 0, labelStyleResolver: s } : { staticLabelStyle: s, labelStyleResolver: void 0 }, [s]), me = S.useMemo(() => Ta(ue), [ue]), ge = S.useMemo(() => {
    const J = [];
    for (let te = 0; te < O.length; te += 1) {
      const ee = O[te], fe = ds(ee.coordinates);
      fe.length !== 0 && J.push({ region: ee, regionIndex: te, regionKey: ee.id ?? te, polygons: fe });
    }
    return J;
  }, [O]), Se = S.useMemo(() => lw(O, l), [O, l]);
  S.useEffect(() => {
    const J = g.current;
    if (J)
      return le(J.getViewState().zoom), C((te) => {
        le(te.zoom);
      });
  }, [y, C, le]), S.useEffect(() => {
    !(_ === null ? !0 : O.some((fe, oe) => String(xu(fe, oe)) === String(_))) && _ !== null && q(null);
    const te = D.current;
    !(te === null ? !0 : O.some((fe, oe) => String(xu(fe, oe)) === String(te))) && te !== null && (D.current = null, G(null), d?.({ region: null, regionId: null, regionIndex: -1, coordinate: null }));
  }, [O, _, d, q]);
  const pe = S.useCallback(
    (J) => {
      const te = g.current;
      if (!te || J.length === 0) return [];
      const ee = new Array(J.length);
      for (let fe = 0; fe < J.length; fe += 1) {
        const oe = Ot(te.worldToScreen(J[fe][0], J[fe][1]));
        if (!oe) return [];
        ee[fe] = oe;
      }
      return ee;
    },
    []
  ), Re = S.useRef({
    preparedRegions: ge,
    hoveredRegionId: L,
    activeRegionId: _,
    resolvedStrokeStyle: F,
    resolvedHoverStrokeStyle: b,
    resolvedActiveStrokeStyle: V,
    resolveStrokeStyleProp: o,
    worldToScreenPoints: pe
  });
  Re.current = {
    preparedRegions: ge,
    hoveredRegionId: L,
    activeRegionId: _,
    resolvedStrokeStyle: F,
    resolvedHoverStrokeStyle: b,
    resolvedActiveStrokeStyle: V,
    resolveStrokeStyleProp: o,
    worldToScreenPoints: pe
  }, S.useEffect(() => (m(Yf, 10, (te) => {
    const {
      preparedRegions: ee,
      hoveredRegionId: fe,
      activeRegionId: oe,
      resolvedStrokeStyle: ye,
      resolvedHoverStrokeStyle: Ie,
      resolvedActiveStrokeStyle: ze,
      resolveStrokeStyleProp: Pe,
      worldToScreenPoints: Me
    } = Re.current;
    for (const Ke of ee) {
      const { region: j, polygons: z, regionIndex: Z, regionKey: K } = Ke, ae = cs(oe, K) ? "active" : cs(fe, K) ? "hover" : "default";
      let se = ae === "active" ? ze : ae === "hover" ? Ie : ye;
      if (Pe) {
        const Lt = Pe({ region: j, regionId: K, regionIndex: Z, state: ae });
        se = nn(se, Lt || void 0);
      }
      const Ye = ae === "default" ? null : aw(se);
      for (const Lt of z) {
        const fn = Me(Lt.outer);
        fn.length >= 4 && (Ye && tt(te, fn, Ye, !0, !1), tt(te, fn, se, !0, !1));
        for (const Un of Lt.holes) {
          const nr = Me(Un);
          nr.length >= 4 && (Ye && tt(te, nr, Ye, !0, !1), tt(te, nr, se, !0, !1));
        }
      }
    }
  }), () => v(Yf)), [m, v]);
  const de = S.useRef({
    preparedRegions: ge,
    resolvedLabelStyle: me,
    labelStyleResolver: re,
    labelAnchor: l,
    autoLiftLabelAtMaxZoom: u,
    clampLabelToViewport: a,
    regionLabelAutoLiftOffsetPx: ne,
    rendererRef: g
  });
  de.current = {
    preparedRegions: ge,
    resolvedLabelStyle: me,
    labelStyleResolver: re,
    labelAnchor: l,
    autoLiftLabelAtMaxZoom: u,
    clampLabelToViewport: a,
    regionLabelAutoLiftOffsetPx: ne,
    rendererRef: g
  }, S.useEffect(() => (m(Vf, 50, (te, ee, fe) => {
    const {
      preparedRegions: oe,
      resolvedLabelStyle: ye,
      labelStyleResolver: Ie,
      labelAnchor: ze,
      autoLiftLabelAtMaxZoom: Pe,
      clampLabelToViewport: Me,
      regionLabelAutoLiftOffsetPx: Ke,
      rendererRef: j
    } = de.current;
    if (oe.length === 0) return;
    const z = Math.max(1e-6, j.current?.getViewState?.().zoom ?? 1), Z = typeof Ke == "number" && Number.isFinite(Ke) ? Math.max(0, Ke) : _a(Pe, z, j.current?.getZoomRange?.(), j.current?.getRegionLabelAutoLiftCapZoom?.());
    for (const K of oe) {
      if (!K.region.label) continue;
      const ae = Ma(K.polygons, ze);
      if (!ae) continue;
      const se = Ot(j.current?.worldToScreen(ae[0], ae[1]) ?? []);
      if (!se) continue;
      let Ye = Aa(ye, Ie?.({ region: K.region, regionId: K.regionKey, regionIndex: K.regionIndex, zoom: z }));
      Z > 0 && (Ye = { ...Ye, offsetY: Ye.offsetY + Z }), _m(te, K.region.label, se, ee, fe, Ye, Me);
    }
  }), () => v(Vf)), [m, v]), S.useEffect(() => {
    w();
  }, [ge, L, _, F, me, ne, w]);
  const xe = S.useRef({
    preparedRegionHits: Se,
    resolvedLabelStyle: me,
    labelStyleResolver: re,
    regionLabelAutoLiftOffsetPx: ne,
    clampLabelToViewport: a,
    onHover: d,
    onClick: h,
    commitActive: q
  });
  return xe.current = {
    preparedRegionHits: Se,
    resolvedLabelStyle: me,
    labelStyleResolver: re,
    regionLabelAutoLiftOffsetPx: ne,
    clampLabelToViewport: a,
    onHover: d,
    onClick: h,
    commitActive: q
  }, S.useEffect(() => {
    const J = p.current;
    if (!J) return;
    const te = (oe) => {
      if (N()) return;
      const ye = g.current;
      if (!ye) return;
      const {
        preparedRegionHits: Ie,
        resolvedLabelStyle: ze,
        labelStyleResolver: Pe,
        regionLabelAutoLiftOffsetPx: Me,
        clampLabelToViewport: Ke,
        onHover: j
      } = xe.current, z = A(oe.clientX, oe.clientY);
      if (!z) return;
      let Z = null, K = null;
      if (Ie.length > 0) {
        const se = M(z[0], z[1]);
        if (se) {
          const Ye = x.current?.getBoundingClientRect();
          K = Of(
            z,
            se,
            Ie,
            ye,
            ze,
            Pe,
            typeof Me == "number" ? Me : 0,
            Ye?.width ?? 0,
            Ye?.height ?? 0,
            Ke
          ), Z = K?.regionId ?? null;
        }
      }
      const ae = D.current;
      String(ae) !== String(Z) && (D.current = Z, G(Z), j?.({
        region: K?.region ?? null,
        regionId: Z,
        regionIndex: K?.regionIndex ?? -1,
        coordinate: z
      }), w());
    }, ee = (oe) => {
      if (N()) return;
      const ye = g.current;
      if (!ye) return;
      const {
        preparedRegionHits: Ie,
        resolvedLabelStyle: ze,
        labelStyleResolver: Pe,
        regionLabelAutoLiftOffsetPx: Me,
        clampLabelToViewport: Ke,
        onClick: j,
        commitActive: z
      } = xe.current;
      if (Ie.length === 0) return;
      const Z = A(oe.clientX, oe.clientY);
      if (!Z) return;
      const K = M(Z[0], Z[1]);
      if (!K) return;
      const ae = x.current?.getBoundingClientRect(), se = Of(
        Z,
        K,
        Ie,
        ye,
        ze,
        Pe,
        typeof Me == "number" ? Me : 0,
        ae?.width ?? 0,
        ae?.height ?? 0,
        Ke
      ), Ye = se?.regionId ?? null;
      z(Ye), se && j && j({
        region: se.region,
        regionId: se.regionId,
        regionIndex: se.regionIndex,
        coordinate: Z
      });
    }, fe = () => {
      D.current !== null && (D.current = null, G(null), xe.current.onHover?.({ region: null, regionId: null, regionIndex: -1, coordinate: null }), w());
    };
    return J.addEventListener("pointermove", te), J.addEventListener("click", ee), J.addEventListener("pointerleave", fe), () => {
      J.removeEventListener("pointermove", te), J.removeEventListener("click", ee), J.removeEventListener("pointerleave", fe);
    };
  }, [p, g, x, A, M, N, w]), null;
}
function fw({
  imageWidth: e,
  imageHeight: t,
  tiles: n,
  viewState: r,
  className: i,
  style: o
}) {
  const s = S.useRef(null), l = S.useRef(null), u = S.useMemo(
    () => ({ width: "100%", height: "100%", display: "block", ...o }),
    [o]
  );
  return S.useEffect(() => {
    const a = s.current;
    if (!a)
      return;
    const f = new hm({
      canvas: a,
      imageWidth: e,
      imageHeight: t,
      initialViewState: r
    });
    return l.current = f, f.setTiles(n), () => {
      f.destroy(), l.current = null;
    };
  }, [e, t]), S.useEffect(() => {
    const a = l.current;
    a && a.setTiles(n);
  }, [n]), S.useEffect(() => {
    const a = l.current;
    !a || !r || a.setViewState(r);
  }, [r]), /* @__PURE__ */ At.jsx("canvas", { ref: s, className: i, style: u });
}
function dw(e, t) {
  if (!t) return !1;
  try {
    const r = new URL(e, typeof window < "u" ? window.location.href : void 0).hostname.toLowerCase();
    if (r.includes("amazonaws.com") || r.startsWith("s3.") || r.includes(".s3.")) return !1;
  } catch {
  }
  return !0;
}
class np {
  constructor(t) {
    R(this, "maxConcurrency");
    R(this, "maxRetries");
    R(this, "retryBaseDelayMs");
    R(this, "retryMaxDelayMs");
    R(this, "onTileLoad");
    R(this, "onTileError");
    R(this, "onStateChange");
    R(this, "authToken");
    R(this, "destroyed", !1);
    R(this, "queue", []);
    R(this, "queuedByKey", /* @__PURE__ */ new Map());
    R(this, "inflight", /* @__PURE__ */ new Map());
    R(this, "visibleKeys", /* @__PURE__ */ new Set());
    R(this, "timerId", null);
    R(this, "abortedCount", 0);
    R(this, "retryCount", 0);
    R(this, "failedCount", 0);
    this.maxConcurrency = Math.max(1, Math.floor(t.maxConcurrency ?? 12)), this.maxRetries = Math.max(0, Math.floor(t.maxRetries ?? 2)), this.retryBaseDelayMs = Math.max(
      10,
      Math.floor(t.retryBaseDelayMs ?? 120)
    ), this.retryMaxDelayMs = Math.max(
      this.retryBaseDelayMs,
      Math.floor(t.retryMaxDelayMs ?? 1200)
    ), this.authToken = t.authToken ?? "", this.onTileLoad = t.onTileLoad, this.onTileError = t.onTileError, this.onStateChange = t.onStateChange;
  }
  setAuthToken(t) {
    this.authToken = String(t ?? "");
  }
  schedule(t) {
    if (this.destroyed) return;
    const n = /* @__PURE__ */ new Set();
    for (const r of t)
      n.add(r.key);
    this.visibleKeys = n, this.dropInvisibleQueued(n), this.abortInvisibleInflight(n);
    for (const r of t) {
      if (this.inflight.has(r.key)) {
        const s = this.inflight.get(r.key);
        s && (s.tile = r);
        continue;
      }
      const i = this.queuedByKey.get(r.key);
      if (i) {
        i.tile = r;
        continue;
      }
      const o = {
        tile: r,
        attempt: 0,
        readyAt: Ae()
      };
      this.queue.push(o), this.queuedByKey.set(r.key, o);
    }
    this.sortQueue(), this.pump(), this.emitStateChange();
  }
  clear() {
    this.clearPumpTimer(), this.visibleKeys.clear(), this.queue = [], this.queuedByKey.clear();
    for (const [, t] of this.inflight)
      t.controller.abort();
    this.inflight.clear(), this.emitStateChange();
  }
  destroy() {
    this.destroyed || (this.destroyed = !0, this.clear());
  }
  getInflightCount() {
    return this.inflight.size;
  }
  getSnapshot() {
    return {
      inflight: this.inflight.size,
      queued: this.queue.length,
      aborted: this.abortedCount,
      retries: this.retryCount,
      failed: this.failedCount
    };
  }
  dropInvisibleQueued(t) {
    if (this.queue.length === 0) return;
    const n = [];
    for (const r of this.queue) {
      if (!t.has(r.tile.key)) {
        this.queuedByKey.delete(r.tile.key);
        continue;
      }
      n.push(r);
    }
    this.queue = n;
  }
  abortInvisibleInflight(t) {
    for (const [n, r] of this.inflight)
      t.has(n) || (this.inflight.delete(n), this.abortedCount += 1, r.controller.abort());
  }
  sortQueue() {
    this.queue.sort((t, n) => t.readyAt !== n.readyAt ? t.readyAt - n.readyAt : t.tile.distance2 !== n.tile.distance2 ? t.tile.distance2 - n.tile.distance2 : t.tile.tier !== n.tile.tier ? n.tile.tier - t.tile.tier : t.tile.key.localeCompare(n.tile.key));
  }
  pump() {
    if (this.destroyed) return;
    for (this.clearPumpTimer(); this.inflight.size < this.maxConcurrency; ) {
      const r = this.takeNextReadyQueueItem();
      if (!r) break;
      this.startFetch(r);
    }
    if (this.inflight.size >= this.maxConcurrency || this.queue.length === 0) return;
    const t = this.queue[0]?.readyAt;
    if (typeof t != "number") return;
    const n = Math.max(0, t - Ae());
    this.timerId = globalThis.setTimeout(() => {
      this.timerId = null, this.pump();
    }, n);
  }
  takeNextReadyQueueItem() {
    if (this.queue.length === 0) return null;
    const t = Ae(), n = this.queue[0];
    return !n || n.readyAt > t ? null : (this.queue.shift(), this.queuedByKey.delete(n.tile.key), n);
  }
  startFetch(t) {
    const n = new AbortController(), r = {
      tile: t.tile,
      attempt: t.attempt,
      controller: n
    };
    this.inflight.set(t.tile.key, r), this.emitStateChange();
    const i = dw(t.tile.url, this.authToken);
    fetch(t.tile.url, {
      signal: n.signal,
      headers: i ? { Authorization: this.authToken } : void 0
    }).then((o) => {
      if (!o.ok)
        throw new Error(`HTTP ${o.status}`);
      return o.blob();
    }).then((o) => createImageBitmap(o)).then((o) => {
      if (this.destroyed || n.signal.aborted) {
        o.close();
        return;
      }
      if (!this.visibleKeys.has(t.tile.key)) {
        o.close();
        return;
      }
      this.onTileLoad(t.tile, o);
    }).catch((o) => {
      if (n.signal.aborted || this.destroyed)
        return;
      if (t.attempt < this.maxRetries && this.visibleKeys.has(t.tile.key)) {
        this.retryCount += 1;
        const l = t.attempt + 1, u = this.getRetryDelay(l), a = {
          tile: t.tile,
          attempt: l,
          readyAt: Ae() + u
        }, f = this.queuedByKey.get(t.tile.key);
        f ? (f.tile = a.tile, f.readyAt = Math.min(f.readyAt, a.readyAt), f.attempt = Math.max(f.attempt, a.attempt)) : (this.queue.push(a), this.queuedByKey.set(a.tile.key, a)), this.sortQueue();
        return;
      }
      this.failedCount += 1, this.onTileError?.(t.tile, o, t.attempt + 1);
    }).finally(() => {
      this.inflight.delete(t.tile.key), this.pump(), this.emitStateChange();
    });
  }
  getRetryDelay(t) {
    const n = Math.max(0, t - 1), r = Math.min(
      this.retryMaxDelayMs,
      this.retryBaseDelayMs * 2 ** n
    ), i = 0.85 + Math.random() * 0.3;
    return Math.round(r * i);
  }
  clearPumpTimer() {
    this.timerId !== null && (globalThis.clearTimeout(this.timerId), this.timerId = null);
  }
  emitStateChange() {
    this.onStateChange?.(this.getSnapshot());
  }
}
function hw(e, t) {
  e.addEventListener("pointerdown", t.pointerDown), e.addEventListener("pointermove", t.pointerMove), e.addEventListener("pointerup", t.pointerUp), e.addEventListener("pointercancel", t.pointerUp), e.addEventListener("wheel", t.wheel, { passive: !1 }), e.addEventListener("dblclick", t.doubleClick), e.addEventListener("contextmenu", t.contextMenu), e.addEventListener("webglcontextlost", t.contextLost), e.addEventListener("webglcontextrestored", t.contextRestored);
}
function mw(e, t) {
  e.removeEventListener("pointerdown", t.pointerDown), e.removeEventListener("pointermove", t.pointerMove), e.removeEventListener("pointerup", t.pointerUp), e.removeEventListener("pointercancel", t.pointerUp), e.removeEventListener("wheel", t.wheel), e.removeEventListener("dblclick", t.doubleClick), e.removeEventListener("contextmenu", t.contextMenu), e.removeEventListener("webglcontextlost", t.contextLost), e.removeEventListener("webglcontextrestored", t.contextRestored);
}
function pw(e, t, n) {
  const r = e.getBoundingClientRect(), i = Math.max(1, r.width || e.clientWidth || 1), o = Math.max(1, r.height || e.clientHeight || 1), s = Math.max(1, window.devicePixelRatio || 1), l = Math.max(1, Math.round(i * s)), u = Math.max(1, Math.round(o * s));
  (e.width !== l || e.height !== u) && (e.width = l, e.height = u), n.setViewport(i, o), t.viewport(0, 0, l, u);
}
const Su = 0.35, Eu = 0.5, gw = 256, Cu = [
  { zoom: 1, size: 2.8 },
  { zoom: 2, size: 3.4 },
  { zoom: 3, size: 4.2 },
  { zoom: 4, size: 5.3 },
  { zoom: 5, size: 6.8 },
  { zoom: 6, size: 8.4 },
  { zoom: 7, size: 9.8 },
  { zoom: 8, size: 11.2 },
  { zoom: 9, size: 14 },
  { zoom: 10, size: 17.5 },
  { zoom: 11, size: 22 },
  { zoom: 12, size: 28 }
], yw = 0.1, vw = 5, ww = 0, xw = 1, Sw = -100, Ew = 100, Cw = 2e3;
function Is(e) {
  return e * Math.PI / 180;
}
function yo(e, t) {
  return !e || !t ? e === t : e.buffer === t.buffer && e.byteOffset === t.byteOffset && e.byteLength === t.byteLength;
}
function Ru(e) {
  return e.map((t) => ({ zoom: t.zoom, size: t.size }));
}
function Xf(e) {
  if (!e) return Ru(Cu);
  const t = /* @__PURE__ */ new Map();
  for (const [n, r] of Object.entries(e)) {
    const i = Number(n), o = Number(r);
    !Number.isFinite(i) || !Number.isFinite(o) || o <= 0 || t.set(i, o);
  }
  return t.size === 0 ? Ru(Cu) : Array.from(t.entries()).sort((n, r) => n[0] - r[0]).map(([n, r]) => ({ zoom: n, size: r }));
}
function Rw(e, t) {
  if (e === t) return !0;
  if (e.length !== t.length) return !1;
  for (let n = 0; n < e.length; n += 1)
    if (e[n].zoom !== t[n].zoom || e[n].size !== t[n].size)
      return !1;
  return !0;
}
function Pw(e, t) {
  if (!Number.isFinite(e)) return t[0]?.size ?? Eu;
  if (t.length === 0) return Eu;
  if (t.length === 1 || e <= t[0].zoom) return t[0].size;
  for (let s = 1; s < t.length; s += 1) {
    const l = t[s - 1], u = t[s];
    if (e > u.zoom) continue;
    const a = Math.max(1e-6, u.zoom - l.zoom), f = U((e - l.zoom) / a, 0, 1);
    return l.size + (u.size - l.size) * f;
  }
  const n = t[t.length - 1], r = t[t.length - 2], i = Math.max(1e-6, n.zoom - r.zoom), o = (n.size - r.size) / i;
  return n.size + (e - n.zoom) * o;
}
function Hf(e) {
  return typeof e != "number" || !Number.isFinite(e) ? 1 : U(e, yw, vw);
}
function Gf(e) {
  return typeof e != "number" || !Number.isFinite(e) ? 0 : U(e, ww, xw);
}
function fl(e) {
  return typeof e != "number" || !Number.isFinite(e) ? 0 : U(e, Sw, Ew);
}
function $f(e) {
  const t = fl(e?.brightness), n = fl(e?.contrast), r = fl(e?.saturation);
  return {
    brightness: t / 200,
    contrast: n / 100,
    saturation: r / 100
  };
}
function Fa(e) {
  return e;
}
function dl(e) {
  return typeof e != "number" || !Number.isFinite(e) ? 0 : U(e, 0, Cw);
}
function vo(e) {
  return typeof e != "number" || !Number.isFinite(e) || e <= 0 ? null : Math.max(1e-6, e);
}
function hl(e) {
  return typeof e == "function" ? e : Fa;
}
function rp(e, t, n) {
  const r = e.getBoundingClientRect(), i = t - r.left - r.width * 0.5, o = n - r.top - r.height * 0.5;
  return Math.atan2(o, i);
}
function ip(e, t) {
  if (t.pointerId !== null && e.hasPointerCapture(t.pointerId))
    try {
      e.releasePointerCapture(t.pointerId);
    } catch {
    }
  t.dragging = !1, t.mode = "none", t.rotateLastAngleRad = null, t.pointerId = null, e.classList.remove("dragging");
}
function Mw(e) {
  const { event: t, canvas: n, state: r, config: i, cancelViewAnimation: o } = e, s = i.ctrlDragRotate && (t.ctrlKey || t.metaKey);
  (t.button === 0 || s && t.button === 2) && (o(), s && t.preventDefault(), r.dragging = !0, r.mode = s ? "rotate" : "pan", r.pointerId = t.pointerId, r.lastPointerX = t.clientX, r.lastPointerY = t.clientY, r.rotateLastAngleRad = r.mode === "rotate" ? rp(n, t.clientX, t.clientY) : null, n.classList.add("dragging"), n.setPointerCapture(t.pointerId));
}
function Tw(e) {
  const { event: t, canvas: n, state: r, config: i, camera: o, clampViewState: s, emitViewState: l, requestRender: u } = e;
  if (!r.dragging || t.pointerId !== r.pointerId) return;
  const a = t.clientX - r.lastPointerX, f = t.clientY - r.lastPointerY;
  if (r.lastPointerX = t.clientX, r.lastPointerY = t.clientY, r.mode === "rotate") {
    const c = rp(n, t.clientX, t.clientY), d = r.rotateLastAngleRad;
    if (r.rotateLastAngleRad = c, d !== null) {
      const h = c - d, g = Math.atan2(Math.sin(h), Math.cos(h)), y = i.rotationDragSensitivityDegPerPixel / Su, x = o.getViewState();
      o.setViewState({
        rotationDeg: x.rotationDeg - g * 180 / Math.PI * y
      });
    }
  } else {
    const c = o.getViewState(), d = Math.max(1e-6, c.zoom), h = Is(c.rotationDeg), g = Math.cos(h), y = Math.sin(h), x = (a * g - f * y) / d, p = (a * y + f * g) / d;
    o.setViewState({
      offsetX: c.offsetX - x,
      offsetY: c.offsetY - p
    });
  }
  s(), l(), u();
}
function Aw(e, t, n) {
  e.pointerId === n.pointerId && ip(t, n);
}
function _w(e) {
  const { event: t, canvas: n, onZoomBy: r } = e;
  t.preventDefault();
  const i = n.getBoundingClientRect(), o = t.clientX - i.left, s = t.clientY - i.top, l = t.deltaY < 0 ? 1.12 : 0.89;
  r(l, o, s);
}
const kw = 4;
function Iw(e) {
  const { event: t, canvas: n, snapState: r, onSnapZoom: i } = e;
  t.preventDefault();
  const o = t.deltaY < 0 ? "in" : t.deltaY > 0 ? "out" : null;
  if (o && r.blockedDirection)
    if (o !== r.blockedDirection)
      r.blockedDirection = null, r.accumulatedDelta = 0;
    else
      return;
  if (r.accumulatedDelta !== 0 && t.deltaY !== 0 && Math.sign(r.accumulatedDelta) !== Math.sign(t.deltaY) && (r.accumulatedDelta = 0), r.accumulatedDelta += t.deltaY, Math.abs(r.accumulatedDelta) < kw) return;
  const s = n.getBoundingClientRect(), l = t.clientX - s.left, u = t.clientY - s.top, a = r.accumulatedDelta > 0 ? "out" : "in";
  if (r.accumulatedDelta = 0, !i(a, l, u)) {
    r.blockedDirection = a;
    return;
  }
  r.blockedDirection = null;
}
function bw(e) {
  const { event: t, canvas: n, onZoomBy: r } = e, i = n.getBoundingClientRect(), o = t.clientX - i.left, s = t.clientY - i.top;
  r(t.shiftKey ? 0.8 : 1.25, o, s);
}
function Lw(e, t) {
  (t || e.ctrlKey || e.metaKey) && e.preventDefault();
}
function ms(e) {
  const t = e.getViewCorners();
  let n = 1 / 0, r = 1 / 0, i = -1 / 0, o = -1 / 0;
  for (const [s, l] of t)
    s < n && (n = s), s > i && (i = s), l < r && (r = l), l > o && (o = l);
  return [n, r, i, o];
}
function No(e, t, n = 0.2, r = 0.2) {
  const i = ms(e), o = Math.max(1e-6, i[2] - i[0]), s = Math.max(1e-6, i[3] - i[1]), l = o * n, u = s * r, [a, f] = e.getCenter(), c = o * 0.5, d = s * 0.5, h = c - l, g = t.width - c + l, y = d - u, x = t.height - d + u, p = h <= g ? U(a, h, g) : t.width * 0.5, m = y <= x ? U(f, y, x) : t.height * 0.5;
  e.setCenter(p, m);
}
function Fw(e, t) {
  const n = Math.max(1e-6, e.getViewState().zoom), r = t.maxTierZoom + Math.log2(n);
  return U(Math.floor(r), 0, t.maxTierZoom);
}
function Nw(e, t) {
  return !(e[2] <= t[0] || e[0] >= t[2] || e[3] <= t[1] || e[1] >= t[3]);
}
function op(e, t, n) {
  const r = ms(e), i = Math.pow(2, t.maxTierZoom - n), o = Math.ceil(t.width / i), s = Math.ceil(t.height / i), l = Math.max(1, Math.ceil(o / t.tileSize)), u = Math.max(1, Math.ceil(s / t.tileSize)), a = r[0], f = r[1], c = r[2], d = r[3], h = U(Math.floor(a / i / t.tileSize), 0, l - 1), g = U(Math.floor((c - 1) / i / t.tileSize), 0, l - 1), y = U(Math.floor(f / i / t.tileSize), 0, u - 1), x = U(Math.floor((d - 1) / i / t.tileSize), 0, u - 1);
  if (h > g || y > x)
    return [];
  const p = (a + c) * 0.5 / i / t.tileSize, m = (f + d) * 0.5 / i / t.tileSize, v = [];
  for (let w = y; w <= x; w += 1)
    for (let E = h; E <= g; E += 1) {
      const C = E * t.tileSize * i, A = w * t.tileSize * i, M = Math.min((E + 1) * t.tileSize, o) * i, N = Math.min((w + 1) * t.tileSize, s) * i, I = E - p, B = w - m;
      v.push({
        key: `${n}/${E}/${w}`,
        tier: n,
        x: E,
        y: w,
        bounds: [C, A, M, N],
        distance2: I * I + B * B,
        url: La(t, n, E, w)
      });
    }
  return v.sort((w, E) => w.distance2 - E.distance2), v;
}
function Dw(e, t) {
  const n = Fw(e, t);
  return {
    tier: n,
    visible: op(e, t, n)
  };
}
function zw(e) {
  e.interactionLocked || Mw({
    event: e.event,
    canvas: e.canvas,
    state: e.state,
    config: {
      ctrlDragRotate: e.ctrlDragRotate,
      rotationDragSensitivityDegPerPixel: e.rotationDragSensitivityDegPerPixel
    },
    cancelViewAnimation: e.cancelViewAnimation
  });
}
function Uw(e) {
  e.interactionLocked || Tw({
    event: e.event,
    canvas: e.canvas,
    state: e.state,
    config: {
      ctrlDragRotate: e.ctrlDragRotate,
      rotationDragSensitivityDegPerPixel: e.rotationDragSensitivityDegPerPixel
    },
    camera: e.camera,
    clampViewState: () => No(e.camera, e.source, e.panExtentX, e.panExtentY),
    emitViewState: e.emitViewState,
    requestRender: e.requestRender
  });
}
function Bw(e) {
  e.interactionLocked || Aw(e.event, e.canvas, e.state);
}
function Ow(e) {
  e.interactionLocked || bw({
    event: e.event,
    canvas: e.canvas,
    onZoomBy: e.onZoomBy
  });
}
function Ww(e) {
  Lw(e.event, e.state.dragging);
}
function Yw(e, t) {
  ip(e, t);
}
function Vw(e) {
  return {
    pointerDown: (t) => zw({
      event: t,
      interactionLocked: e.getInteractionLocked(),
      canvas: e.canvas,
      state: e.state,
      ctrlDragRotate: e.getCtrlDragRotate(),
      rotationDragSensitivityDegPerPixel: e.getRotationDragSensitivityDegPerPixel(),
      cancelViewAnimation: e.cancelViewAnimation
    }),
    pointerMove: (t) => Uw({
      event: t,
      interactionLocked: e.getInteractionLocked(),
      canvas: e.canvas,
      state: e.state,
      ctrlDragRotate: e.getCtrlDragRotate(),
      rotationDragSensitivityDegPerPixel: e.getRotationDragSensitivityDegPerPixel(),
      camera: e.camera,
      source: e.source,
      panExtentX: e.getPanExtentX(),
      panExtentY: e.getPanExtentY(),
      emitViewState: e.emitViewState,
      requestRender: e.requestRender
    }),
    pointerUp: (t) => Bw({
      event: t,
      interactionLocked: e.getInteractionLocked(),
      canvas: e.canvas,
      state: e.state
    }),
    wheel: (t) => {
      if (e.getInteractionLocked()) {
        t.preventDefault();
        return;
      }
      if (e.getUseZoomSnaps?.() && e.onSnapZoom && e.zoomSnapState) {
        Iw({
          event: t,
          canvas: e.canvas,
          snapState: e.zoomSnapState,
          onSnapZoom: e.onSnapZoom
        });
        return;
      }
      _w({
        event: t,
        canvas: e.canvas,
        onZoomBy: e.zoomBy
      });
    },
    doubleClick: (t) => Ow({
      event: t,
      interactionLocked: e.getInteractionLocked(),
      canvas: e.canvas,
      onZoomBy: e.zoomBy
    }),
    contextMenu: (t) => Ww({
      event: t,
      canvas: e.canvas,
      state: e.state
    })
  };
}
function Xw(e) {
  const { gl: t, cache: n, maxCacheTiles: r } = e;
  if (n.size <= r) return;
  const i = Math.max(0, Math.floor(r));
  for (; n.size > i; ) {
    let o = null, s = null;
    for (const [l, u] of n)
      (!s || u.lastUsed < s.lastUsed) && (o = l, s = u);
    if (!o || !s) break;
    t.deleteTexture(s.texture), n.delete(o);
  }
}
function Hw(e, t) {
  if (e.isContextLost()) return null;
  const n = e.createTexture();
  return n ? (e.bindTexture(e.TEXTURE_2D, n), e.pixelStorei(e.UNPACK_FLIP_Y_WEBGL, 1), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.LINEAR), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, e.RGBA, e.UNSIGNED_BYTE, t), e.bindTexture(e.TEXTURE_2D, null), n) : null;
}
function Gw(e) {
  const { gl: t, cache: n, tile: r, bitmap: i, frameSerial: o, maxCacheTiles: s, destroyed: l, contextLost: u, requestRender: a } = e;
  if (l || u || t.isContextLost()) {
    i.close();
    return;
  }
  if (n.has(r.key)) {
    i.close();
    return;
  }
  const f = Hw(t, i);
  i.close(), f && (n.set(r.key, {
    key: r.key,
    texture: f,
    bounds: r.bounds,
    tier: r.tier,
    lastUsed: o
  }), Xw({ gl: t, cache: n, maxCacheTiles: s }), a());
}
function $w(e, t) {
  for (const [, n] of t)
    e.deleteTexture(n.texture);
}
function jw(e) {
  const { event: t, destroyed: n, contextLost: r, cancelViewAnimation: i, cancelDrag: o, tileScheduler: s, cache: l, onContextLost: u } = e;
  if (t.preventDefault(), n || r)
    return {
      handled: !1,
      frame: e.frame
    };
  let a = e.frame;
  return a !== null && (cancelAnimationFrame(a), a = null), i(), o(), s.clear(), l.clear(), u?.(), {
    handled: !0,
    frame: a
  };
}
function Zw(e) {
  if (e.destroyed)
    return {
      didDestroy: !1,
      frame: e.frame
    };
  let t = e.frame;
  return t !== null && (cancelAnimationFrame(t), t = null), e.cancelViewAnimation(), e.resizeObserver.disconnect(), e.removeCanvasEventListeners(), e.cancelDrag(), e.tileScheduler.destroy(), !e.contextLost && !e.gl.isContextLost() && ($w(e.gl, e.cache), e.gl.deleteBuffer(e.tileProgram.vbo), e.gl.deleteVertexArray(e.tileProgram.vao), e.gl.deleteProgram(e.tileProgram.program), e.gl.deleteBuffer(e.pointProgram.posBuffer), e.gl.deleteBuffer(e.pointProgram.classBuffer), e.gl.deleteBuffer(e.pointProgram.fillModeBuffer), e.gl.deleteBuffer(e.pointProgram.indexBuffer), e.gl.deleteTexture(e.pointProgram.paletteTexture), e.gl.deleteVertexArray(e.pointProgram.vao), e.gl.deleteProgram(e.pointProgram.program)), e.cache.clear(), {
    didDestroy: !0,
    frame: t
  };
}
function qw(e, t) {
  if (t <= 0 || e.length === 0)
    return new Uint32Array(0);
  let n = e.length;
  for (let o = 0; o < e.length; o += 1)
    e[o] < t || (n -= 1);
  if (n === e.length)
    return e;
  if (n <= 0)
    return new Uint32Array(0);
  const r = new Uint32Array(n);
  let i = 0;
  for (let o = 0; o < e.length; o += 1) {
    const s = e[o];
    s >= t || (r[i] = s, i += 1);
  }
  return r;
}
function Kw(e, t) {
  return t <= 0 ? new Uint8Array(0) : e.length < t ? new Uint8Array(t) : e.subarray(0, t);
}
function Qw(e, t, n, r, i) {
  if (!i || i.length === 0)
    return {
      ...e,
      lastPointPalette: null
    };
  const o = new Uint8Array(i);
  if (r || t.isContextLost())
    return {
      ...e,
      lastPointPalette: o
    };
  const s = Math.max(1, Math.floor(o.length / 4));
  return t.bindTexture(t.TEXTURE_2D, n.paletteTexture), t.texImage2D(t.TEXTURE_2D, 0, t.RGBA, s, 1, 0, t.RGBA, t.UNSIGNED_BYTE, o), t.bindTexture(t.TEXTURE_2D, null), {
    ...e,
    lastPointPalette: o,
    pointPaletteSize: s
  };
}
function Jw(e, t, n, r, i) {
  if (!i || !i.count || !i.positions || !i.paletteIndices)
    return {
      ...e,
      lastPointData: null,
      pointCount: 0,
      usePointIndices: !1
    };
  const o = i.fillModes instanceof Uint8Array ? i.fillModes : null, s = o !== null, l = Math.max(0, Math.min(i.count, Math.floor(i.positions.length / 2), i.paletteIndices.length, s ? o.length : Number.MAX_SAFE_INTEGER)), u = i.positions.subarray(0, l * 2), a = i.paletteIndices.subarray(0, l), f = s ? o.subarray(0, l) : void 0, c = i.drawIndices instanceof Uint32Array, d = c ? qw(i.drawIndices, l) : null, h = e.lastPointData, g = h?.fillModes instanceof Uint8Array, y = e.pointBuffersDirty || !h || h.count !== l || !yo(h.positions, u) || !yo(h.paletteIndices, a) || g !== s || s && (!h?.fillModes || !yo(h.fillModes, f)), x = e.pointBuffersDirty || c && (!h?.drawIndices || !yo(h.drawIndices, d)) || !c && !!h?.drawIndices, p = {
    ...e,
    lastPointData: {
      count: l,
      positions: u,
      paletteIndices: a,
      fillModes: f,
      drawIndices: c ? d ?? void 0 : void 0
    }
  };
  if (r || t.isContextLost())
    return p;
  const m = p.lastPointData;
  if (!m)
    return p;
  if (y) {
    t.bindBuffer(t.ARRAY_BUFFER, n.posBuffer), t.bufferData(t.ARRAY_BUFFER, m.positions, t.STATIC_DRAW), t.bindBuffer(t.ARRAY_BUFFER, n.classBuffer), t.bufferData(t.ARRAY_BUFFER, m.paletteIndices, t.STATIC_DRAW);
    const v = Kw(p.zeroFillModes, l);
    t.bindBuffer(t.ARRAY_BUFFER, n.fillModeBuffer), t.bufferData(t.ARRAY_BUFFER, m.fillModes ?? v, t.STATIC_DRAW), t.bindBuffer(t.ARRAY_BUFFER, null), p.zeroFillModes = v;
  }
  return c && x && (t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, n.indexBuffer), t.bufferData(t.ELEMENT_ARRAY_BUFFER, d ?? new Uint32Array(0), t.DYNAMIC_DRAW), t.bindBuffer(t.ELEMENT_ARRAY_BUFFER, null)), p.usePointIndices = c, p.pointCount = c ? d?.length ?? 0 : m.count, (y || x) && (p.pointBuffersDirty = !1), p;
}
function ex(e) {
  const {
    gl: t,
    camera: n,
    source: r,
    cache: i,
    frameSerial: o,
    tileProgram: s,
    pointProgram: l,
    imageColorSettings: u,
    pointCount: a,
    usePointIndices: f,
    pointPaletteSize: c,
    pointStrokeScale: d,
    pointInnerFillOpacity: h,
    pointSizePx: g,
    tileScheduler: y,
    getVisibleTiles: x,
    getVisibleTilesForTier: p,
    getViewBounds: m,
    intersectsBounds: v
  } = e;
  t.clearColor(0.03, 0.06, 0.1, 1), t.clear(t.COLOR_BUFFER_BIT);
  const { tier: w, visible: E } = x(), C = m(), A = new Set(E.map(($) => $.key));
  t.useProgram(s.program), t.bindVertexArray(s.vao), t.uniformMatrix3fv(s.uCamera, !1, n.getMatrix()), t.uniform1i(s.uTexture, 0), t.uniform1f(s.uBrightness, u.brightness), t.uniform1f(s.uContrast, u.contrast), t.uniform1f(s.uSaturation, u.saturation);
  const M = [];
  for (const [, $] of i)
    A.has($.key) || v($.bounds, C) && M.push($);
  M.sort(($, Y) => $.tier - Y.tier);
  for (const $ of M)
    $.lastUsed = o, t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D, $.texture), t.uniform4f(s.uBounds, $.bounds[0], $.bounds[1], $.bounds[2], $.bounds[3]), t.drawArrays(t.TRIANGLE_STRIP, 0, 4);
  let N = 0;
  const I = [];
  for (const $ of E) {
    const Y = i.get($.key);
    if (!Y) {
      I.push($);
      continue;
    }
    Y.lastUsed = o, t.activeTexture(t.TEXTURE0), t.bindTexture(t.TEXTURE_2D, Y.texture), t.uniform4f(s.uBounds, Y.bounds[0], Y.bounds[1], Y.bounds[2], Y.bounds[3]), t.drawArrays(t.TRIANGLE_STRIP, 0, 4), N += 1;
  }
  const B = I.slice(), O = 1e6, L = [];
  w > 0 && L.push(w - 1), w < r.maxTierZoom && L.push(w + 1);
  for (const $ of L) {
    const Y = p($);
    for (const Q of Y)
      i.has(Q.key) || (Q.distance2 += O, B.push(Q));
  }
  y.schedule(B), t.bindTexture(t.TEXTURE_2D, null), t.bindVertexArray(null);
  let G = 0;
  return a > 0 && (t.enable(t.BLEND), t.blendFunc(t.ONE, t.ONE_MINUS_SRC_ALPHA), t.useProgram(l.program), t.bindVertexArray(l.vao), t.uniformMatrix3fv(l.uCamera, !1, n.getMatrix()), t.uniform1f(l.uPointSize, g), t.uniform1f(l.uPointStrokeScale, d), t.uniform1f(l.uPointInnerFillAlpha, h), t.uniform1f(l.uPaletteSize, c), t.uniform1i(l.uPalette, 1), t.activeTexture(t.TEXTURE1), t.bindTexture(t.TEXTURE_2D, l.paletteTexture), f ? t.drawElements(t.POINTS, a, t.UNSIGNED_INT, 0) : t.drawArrays(t.POINTS, 0, a), t.bindTexture(t.TEXTURE_2D, null), t.bindVertexArray(null), G = a), {
    tier: w,
    visible: E.length,
    rendered: N,
    points: G,
    fallback: M.length,
    cacheHits: N,
    cacheMisses: I.length,
    drawCalls: M.length + N + (G > 0 ? 1 : 0)
  };
}
function jf(e) {
  const r = Ai(e, `#version 300 es
    precision highp float;
    in vec2 aUnit;
    in vec2 aUv;
    uniform mat3 uCamera;
    uniform vec4 uBounds;
    out vec2 vUv;
    void main() {
      vec2 world = vec2(
        mix(uBounds.x, uBounds.z, aUnit.x),
        mix(uBounds.y, uBounds.w, aUnit.y)
      );
      vec3 clip = uCamera * vec3(world, 1.0);
      gl_Position = vec4(clip.xy, 0.0, 1.0);
      vUv = aUv;
    }`, `#version 300 es
    precision highp float;
    in vec2 vUv;
    uniform sampler2D uTexture;
    uniform float uBrightness;
    uniform float uContrast;
    uniform float uSaturation;
    out vec4 outColor;
    void main() {
      vec4 color = texture(uTexture, vUv);

      color.rgb = clamp(
        (uContrast + 1.0) * color.rgb - (uContrast / 2.0),
        vec3(0.0),
        vec3(1.0)
      );

      float saturation = uSaturation + 1.0;
      float sr = (1.0 - saturation) * 0.2126;
      float sg = (1.0 - saturation) * 0.7152;
      float sb = (1.0 - saturation) * 0.0722;
      mat3 saturationMatrix = mat3(
        sr + saturation, sr, sr,
        sg, sg + saturation, sg,
        sb, sb, sb + saturation
      );
      color.rgb = clamp(saturationMatrix * color.rgb, vec3(0.0), vec3(1.0));

      color.rgb = clamp(color.rgb + uBrightness, vec3(0.0), vec3(1.0));
      outColor = color;
    }`), i = st(e, r, "uCamera"), o = st(e, r, "uBounds"), s = st(e, r, "uTexture"), l = st(e, r, "uBrightness"), u = st(e, r, "uContrast"), a = st(e, r, "uSaturation"), f = e.createVertexArray(), c = e.createBuffer();
  if (!f || !c)
    throw new Error("buffer allocation failed");
  e.bindVertexArray(f), e.bindBuffer(e.ARRAY_BUFFER, c), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1, 1, 1, 1, 1]), e.STATIC_DRAW);
  const d = e.getAttribLocation(r, "aUnit"), h = e.getAttribLocation(r, "aUv");
  if (d < 0 || h < 0)
    throw new Error("tile attribute lookup failed");
  return e.enableVertexAttribArray(d), e.enableVertexAttribArray(h), e.vertexAttribPointer(d, 2, e.FLOAT, !1, 16, 0), e.vertexAttribPointer(h, 2, e.FLOAT, !1, 16, 8), e.bindVertexArray(null), e.bindBuffer(e.ARRAY_BUFFER, null), {
    program: r,
    vao: f,
    vbo: c,
    uCamera: i,
    uBounds: o,
    uTexture: s,
    uBrightness: l,
    uContrast: u,
    uSaturation: a
  };
}
function Zf(e) {
  const r = Ai(e, `#version 300 es
    precision highp float;
    in vec2 aPosition;
    in uint aClass;
    in uint aFillMode;
    uniform mat3 uCamera;
    uniform float uPointSize;
    flat out uint vClass;
    flat out uint vFillMode;
    void main() {
      vec3 clip = uCamera * vec3(aPosition, 1.0);
      gl_Position = vec4(clip.xy, 0.0, 1.0);
      gl_PointSize = uPointSize;
      vClass = aClass;
      vFillMode = aFillMode;
    }`, `#version 300 es
    precision highp float;
    flat in uint vClass;
    flat in uint vFillMode;
    uniform sampler2D uPalette;
    uniform float uPaletteSize;
    uniform float uPointSize;
    uniform float uPointStrokeScale;
    uniform float uPointInnerFillAlpha;
    out vec4 outColor;
    void main() {
      vec2 pc = gl_PointCoord * 2.0 - 1.0;
      float r = length(pc);
      if (r > 1.0) discard;

      float idx = clamp(float(vClass), 0.0, max(0.0, uPaletteSize - 1.0));
      vec2 uv = vec2((idx + 0.5) / uPaletteSize, 0.5);
      vec4 color = texture(uPalette, uv);
      if (color.a <= 0.0) discard;

      float aa = 1.5 / max(1.0, uPointSize);
      float outerMask = 1.0 - smoothstep(1.0 - aa, 1.0 + aa, r);
      if (vFillMode != 0u) {
        float alpha = outerMask * color.a;
        if (alpha <= 0.001) discard;
        outColor = vec4(color.rgb * alpha, alpha);
      } else {
        float s = uPointStrokeScale;
        float ringWidth = s * mix(0.18, 0.35, smoothstep(3.0, 16.0, uPointSize));
        float innerRadius = 1.0 - ringWidth;
        float innerMask = smoothstep(innerRadius - aa, innerRadius + aa, r);
        float ringAlpha = outerMask * innerMask * color.a;
        float fillAlpha = outerMask * (1.0 - innerMask) * clamp(uPointInnerFillAlpha, 0.0, 1.0);
        float alpha = ringAlpha + fillAlpha;
        if (alpha <= 0.001) discard;
        // Premultiplied alpha output: inner fill is black, so it only contributes alpha.
        outColor = vec4(color.rgb * ringAlpha, alpha);
      }
    }`), i = st(e, r, "uCamera"), o = st(e, r, "uPointSize"), s = st(e, r, "uPointStrokeScale"), l = st(e, r, "uPointInnerFillAlpha"), u = st(e, r, "uPalette"), a = st(e, r, "uPaletteSize"), f = e.createVertexArray(), c = e.createBuffer(), d = e.createBuffer(), h = e.createBuffer(), g = e.createBuffer(), y = e.createTexture();
  if (!f || !c || !d || !h || !g || !y)
    throw new Error("point buffer allocation failed");
  e.bindVertexArray(f), e.bindBuffer(e.ARRAY_BUFFER, c), e.bufferData(e.ARRAY_BUFFER, 0, e.DYNAMIC_DRAW);
  const x = e.getAttribLocation(r, "aPosition");
  if (x < 0)
    throw new Error("point position attribute not found");
  e.enableVertexAttribArray(x), e.vertexAttribPointer(x, 2, e.FLOAT, !1, 0, 0), e.bindBuffer(e.ARRAY_BUFFER, d), e.bufferData(e.ARRAY_BUFFER, 0, e.DYNAMIC_DRAW);
  const p = e.getAttribLocation(r, "aClass");
  if (p < 0)
    throw new Error("point class attribute not found");
  e.enableVertexAttribArray(p), e.vertexAttribIPointer(p, 1, e.UNSIGNED_SHORT, 0, 0), e.bindBuffer(e.ARRAY_BUFFER, h), e.bufferData(e.ARRAY_BUFFER, 0, e.DYNAMIC_DRAW);
  const m = e.getAttribLocation(r, "aFillMode");
  if (m < 0)
    throw new Error("point fill mode attribute not found");
  return e.enableVertexAttribArray(m), e.vertexAttribIPointer(m, 1, e.UNSIGNED_BYTE, 0, 0), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, g), e.bufferData(e.ELEMENT_ARRAY_BUFFER, 0, e.DYNAMIC_DRAW), e.bindVertexArray(null), e.bindBuffer(e.ARRAY_BUFFER, null), e.bindBuffer(e.ELEMENT_ARRAY_BUFFER, null), e.bindTexture(e.TEXTURE_2D, y), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_S, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_WRAP_T, e.CLAMP_TO_EDGE), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.NEAREST), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MAG_FILTER, e.NEAREST), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, 1, 1, 0, e.RGBA, e.UNSIGNED_BYTE, new Uint8Array([160, 160, 160, 255])), e.bindTexture(e.TEXTURE_2D, null), {
    program: r,
    vao: f,
    posBuffer: c,
    classBuffer: d,
    fillModeBuffer: h,
    indexBuffer: g,
    paletteTexture: y,
    uCamera: i,
    uPointSize: o,
    uPointStrokeScale: s,
    uPointInnerFillAlpha: l,
    uPalette: u,
    uPaletteSize: a
  };
}
function sp(e) {
  e.animation = null, e.frame !== null && (cancelAnimationFrame(e.frame), e.frame = null);
}
function tx(e) {
  const { state: t, camera: n, target: r, durationMs: i, easing: o, onUpdate: s } = e, l = n.getViewState();
  sp(t), t.animation = {
    startMs: Ae(),
    durationMs: Math.max(0, i),
    from: l,
    to: r,
    easing: o
  };
  const u = () => {
    const a = t.animation;
    if (!a) return;
    const f = Math.max(0, Ae() - a.startMs), c = a.durationMs <= 0 ? 1 : U(f / a.durationMs, 0, 1);
    let d = c;
    try {
      d = a.easing(c);
    } catch {
      d = c;
    }
    if (Number.isFinite(d) || (d = c), d = U(d, 0, 1), n.setViewState({
      zoom: a.from.zoom + (a.to.zoom - a.from.zoom) * d,
      offsetX: a.from.offsetX + (a.to.offsetX - a.from.offsetX) * d,
      offsetY: a.from.offsetY + (a.to.offsetY - a.from.offsetY) * d,
      rotationDeg: a.from.rotationDeg + (a.to.rotationDeg - a.from.rotationDeg) * d
    }), s(), c >= 1) {
      t.animation = null, t.frame = null;
      return;
    }
    t.frame = requestAnimationFrame(u);
  };
  t.frame = requestAnimationFrame(u);
}
function nx(e) {
  const t = Math.max(e * 0.5, 1e-6), n = Math.max(1, e * 8);
  return {
    minZoom: t,
    maxZoom: Math.max(t, n)
  };
}
function rx(e, t, n) {
  const r = nx(e);
  let i = t ?? r.minZoom, o = n ?? r.maxZoom;
  return i = Math.max(1e-6, i), o = Math.max(1e-6, o), i > o && (i = o), { minZoom: i, maxZoom: o };
}
function ix(e, t, n, r, i) {
  const o = e.getViewState(), s = {
    zoom: typeof r.zoom == "number" && Number.isFinite(r.zoom) ? U(r.zoom, t, n) : o.zoom,
    offsetX: typeof r.offsetX == "number" && Number.isFinite(r.offsetX) ? r.offsetX : o.offsetX,
    offsetY: typeof r.offsetY == "number" && Number.isFinite(r.offsetY) ? r.offsetY : o.offsetY,
    rotationDeg: typeof r.rotationDeg == "number" && Number.isFinite(r.rotationDeg) ? r.rotationDeg : o.rotationDeg
  };
  e.setViewState(s), i();
  const l = e.getViewState();
  return e.setViewState(o), l;
}
function qf(e, t, n, r, i) {
  const o = Math.min(t / e.width, n / e.height), s = Number.isFinite(o) && o > 0 ? o : 1, l = U(s, r, i), u = t / l, a = n / l;
  return {
    fitZoom: s,
    target: {
      zoom: l,
      offsetX: (e.width - u) * 0.5,
      offsetY: (e.height - a) * 0.5,
      rotationDeg: 0
    }
  };
}
function ox(e, t, n, r, i, o) {
  const s = e.getViewState(), l = U(s.zoom * r, t, n);
  if (l === s.zoom) return null;
  const [u, a] = e.screenToWorld(i, o), f = e.getViewportSize(), c = i - f.width * 0.5, d = o - f.height * 0.5, h = Is(s.rotationDeg), g = Math.cos(h), y = Math.sin(h), x = c / l * g - d / l * y, p = c / l * y + d / l * g, m = u - x, v = a - p;
  return {
    zoom: l,
    offsetX: m - f.width / (2 * l),
    offsetY: v - f.height / (2 * l)
  };
}
function sx(e, t, n, r, i, o) {
  const s = e.getViewState(), l = U(r, t, n);
  if (l === s.zoom) return null;
  const [u, a] = e.screenToWorld(i, o), f = e.getViewportSize(), c = i - f.width * 0.5, d = o - f.height * 0.5, h = Is(s.rotationDeg), g = Math.cos(h), y = Math.sin(h), x = c / l * g - d / l * y, p = c / l * y + d / l * g, m = u - x, v = a - p;
  return {
    zoom: l,
    offsetX: m - f.width / (2 * l),
    offsetY: v - f.height / (2 * l)
  };
}
const lx = 250;
function Kf(e, t) {
  if (!e || e.length === 0) return [];
  if (!t || t <= 0) return [];
  const n = 10 / t;
  return e.map((r) => r / n).filter((r) => Number.isFinite(r) && r > 0).sort((r, i) => r - i);
}
function ux(e, t, n, r) {
  if (e.length === 0) return null;
  const i = Math.max(t * 5e-3, 1e-8);
  if (n === "in") {
    for (const o of e)
      if (o > t + i)
        return { type: "snap", zoom: o };
    return null;
  }
  for (let o = e.length - 1; o >= 0; o--)
    if (e[o] < t - i)
      return { type: "snap", zoom: e[o] };
  return r && t <= e[0] + i ? { type: "fit" } : null;
}
function ax(e, t, n, r, i) {
  const o = e.camera.getViewState(), [s, l] = e.camera.screenToWorld(n, r), u = e.camera.getViewportSize(), a = U(t, e.minZoom, e.maxZoom);
  if (a === o.zoom) return;
  const f = Is(o.rotationDeg), c = Math.cos(f), d = Math.sin(f), h = n - u.width * 0.5, g = r - u.height * 0.5;
  e.cancelViewAnimation();
  const y = (m) => {
    const v = h / m * c - g / m * d, w = h / m * d + g / m * c;
    return {
      offsetX: s - v - u.width / (2 * m),
      offsetY: l - w - u.height / (2 * m)
    };
  }, x = y(a);
  e.viewAnimationState.animation = {
    startMs: Ae(),
    durationMs: Math.max(0, i),
    from: o,
    to: { zoom: a, offsetX: x.offsetX, offsetY: x.offsetY, rotationDeg: o.rotationDeg },
    easing: Fa
  };
  const p = () => {
    const m = e.viewAnimationState.animation;
    if (!m) return;
    const v = Math.max(0, Ae() - m.startMs), w = U(v / i, 0, 1), E = U(w * w * (3 - 2 * w), 0, 1), C = o.zoom + (a - o.zoom) * E, { offsetX: A, offsetY: M } = y(C);
    e.camera.setViewState({ zoom: C, offsetX: A, offsetY: M, rotationDeg: o.rotationDeg });
    const N = w >= 1;
    N && (e.clampViewState(), e.viewAnimationState.animation = null, e.viewAnimationState.frame = null), e.onViewStateChange(e.camera.getViewState()), e.requestRender(), N || (e.viewAnimationState.frame = requestAnimationFrame(p));
  };
  e.viewAnimationState.frame = requestAnimationFrame(p);
}
class lp {
  constructor(t, n, r = {}) {
    R(this, "canvas");
    R(this, "source");
    R(this, "gl");
    R(this, "camera", new dm());
    R(this, "onViewStateChange");
    R(this, "onStats");
    R(this, "onTileError");
    R(this, "onContextLost");
    R(this, "onContextRestored");
    R(this, "resizeObserver");
    R(this, "tileProgram");
    R(this, "pointProgram");
    R(this, "tileScheduler");
    R(this, "authToken");
    R(this, "destroyed", !1);
    R(this, "contextLost", !1);
    R(this, "frame", null);
    R(this, "frameSerial", 0);
    R(this, "interactionState", {
      dragging: !1,
      mode: "none",
      rotateLastAngleRad: null,
      pointerId: null,
      lastPointerX: 0,
      lastPointerY: 0
    });
    R(this, "interactionLocked", !1);
    R(this, "ctrlDragRotate", !0);
    R(this, "rotationDragSensitivityDegPerPixel", Su);
    R(this, "maxCacheTiles");
    R(this, "fitZoom", 1);
    R(this, "minZoom", 1e-6);
    R(this, "maxZoom", 1);
    R(this, "minZoomOverride", null);
    R(this, "maxZoomOverride", null);
    R(this, "viewTransitionDurationMs", 0);
    R(this, "viewTransitionEasing", Fa);
    R(this, "viewAnimationState", {
      animation: null,
      frame: null
    });
    R(this, "pointCount", 0);
    R(this, "usePointIndices", !1);
    R(this, "pointBuffersDirty", !0);
    R(this, "pointPaletteSize", 1);
    R(this, "pointSizeStops", Ru(Cu));
    R(this, "pointStrokeScale", 1);
    R(this, "pointInnerFillOpacity", 0);
    R(this, "imageColorSettings", {
      brightness: 0,
      contrast: 0,
      saturation: 0
    });
    R(this, "lastPointData", null);
    R(this, "lastPointPalette", null);
    R(this, "zeroFillModes", new Uint8Array(0));
    R(this, "cache", /* @__PURE__ */ new Map());
    R(this, "zoomSnaps", []);
    R(this, "zoomSnapFitAsMin", !1);
    R(this, "zoomSnapState", { accumulatedDelta: 0, lastSnapTimeMs: 0, blockedDirection: null });
    R(this, "panExtentX", 0.2);
    R(this, "panExtentY", 0.2);
    R(this, "boundPointerDown");
    R(this, "boundPointerMove");
    R(this, "boundPointerUp");
    R(this, "boundWheel");
    R(this, "boundDoubleClick");
    R(this, "boundContextMenu");
    R(this, "boundContextLost");
    R(this, "boundContextRestored");
    this.canvas = t, this.source = n, this.onViewStateChange = r.onViewStateChange, this.onStats = r.onStats, this.onTileError = r.onTileError, this.onContextLost = r.onContextLost, this.onContextRestored = r.onContextRestored, this.authToken = r.authToken ?? "", this.maxCacheTiles = Math.max(32, Math.floor(r.maxCacheTiles ?? 320)), this.ctrlDragRotate = r.ctrlDragRotate ?? !0, this.rotationDragSensitivityDegPerPixel = typeof r.rotationDragSensitivityDegPerPixel == "number" && Number.isFinite(r.rotationDragSensitivityDegPerPixel) ? Math.max(0, r.rotationDragSensitivityDegPerPixel) : Su, this.pointSizeStops = Xf(r.pointSizeByZoom), this.pointStrokeScale = Hf(r.pointStrokeScale), this.pointInnerFillOpacity = Gf(r.pointInnerFillOpacity), this.imageColorSettings = $f(r.imageColorSettings), this.minZoomOverride = vo(r.minZoom), this.maxZoomOverride = vo(r.maxZoom), this.viewTransitionDurationMs = dl(r.viewTransition?.duration), this.viewTransitionEasing = hl(r.viewTransition?.easing), this.zoomSnaps = Kf(r.zoomSnaps, this.source.mpp), this.zoomSnapFitAsMin = !!r.zoomSnapFitAsMin, this.applyPanExtent(r.panExtent);
    const i = t.getContext("webgl2", {
      alpha: !1,
      antialias: !1,
      depth: !1,
      stencil: !1,
      powerPreference: "high-performance"
    });
    if (!i)
      throw new Error("WebGL2 not supported");
    this.gl = i, this.tileProgram = jf(this.gl), this.pointProgram = Zf(this.gl), this.tileScheduler = new np({
      authToken: this.authToken,
      maxConcurrency: r.tileScheduler?.maxConcurrency ?? 12,
      maxRetries: r.tileScheduler?.maxRetries ?? 2,
      retryBaseDelayMs: r.tileScheduler?.retryBaseDelayMs ?? 120,
      retryMaxDelayMs: r.tileScheduler?.retryMaxDelayMs ?? 1200,
      onTileLoad: (s, l) => Gw({
        gl: this.gl,
        cache: this.cache,
        tile: s,
        bitmap: l,
        frameSerial: this.frameSerial,
        maxCacheTiles: this.maxCacheTiles,
        destroyed: this.destroyed,
        contextLost: this.contextLost,
        requestRender: () => this.requestRender()
      }),
      onTileError: (s, l, u) => {
        this.onTileError?.({ tile: s, error: l, attemptCount: u }), console.warn("tile load failed", s.url, l);
      }
    }), this.resizeObserver = new ResizeObserver(() => this.resize()), this.resizeObserver.observe(t);
    const o = Vw({
      canvas: this.canvas,
      state: this.interactionState,
      getInteractionLocked: () => this.interactionLocked,
      getCtrlDragRotate: () => this.ctrlDragRotate,
      getRotationDragSensitivityDegPerPixel: () => this.rotationDragSensitivityDegPerPixel,
      cancelViewAnimation: () => this.cancelViewAnimation(),
      camera: this.camera,
      source: this.source,
      emitViewState: () => this.onViewStateChange?.(this.camera.getViewState()),
      requestRender: () => this.requestRender(),
      getPanExtentX: () => this.panExtentX,
      getPanExtentY: () => this.panExtentY,
      zoomBy: (s, l, u) => this.zoomBy(s, l, u),
      getUseZoomSnaps: () => this.zoomSnaps.length > 0,
      onSnapZoom: (s, l, u) => this.handleSnapZoom(s, l, u),
      zoomSnapState: this.zoomSnapState
    });
    this.boundPointerDown = o.pointerDown, this.boundPointerMove = o.pointerMove, this.boundPointerUp = o.pointerUp, this.boundWheel = o.wheel, this.boundDoubleClick = o.doubleClick, this.boundContextMenu = o.contextMenu, this.boundContextLost = (s) => this.onWebGlContextLost(s), this.boundContextRestored = (s) => this.onWebGlContextRestored(s), hw(t, this.getCanvasHandlers()), this.fitToImage({ duration: 0 }), this.resize();
  }
  getCanvasHandlers() {
    return {
      pointerDown: this.boundPointerDown,
      pointerMove: this.boundPointerMove,
      pointerUp: this.boundPointerUp,
      wheel: this.boundWheel,
      doubleClick: this.boundDoubleClick,
      contextMenu: this.boundContextMenu,
      contextLost: this.boundContextLost,
      contextRestored: this.boundContextRestored
    };
  }
  applyZoomBounds() {
    const t = rx(this.fitZoom, this.minZoomOverride, this.maxZoomOverride);
    this.minZoom = t.minZoom, this.maxZoom = t.maxZoom;
  }
  resolveTargetViewState(t) {
    return ix(this.camera, this.minZoom, this.maxZoom, t, () => No(this.camera, this.source, this.panExtentX, this.panExtentY));
  }
  cancelViewAnimation() {
    sp(this.viewAnimationState);
  }
  startViewAnimation(t, n, r) {
    tx({
      state: this.viewAnimationState,
      camera: this.camera,
      target: t,
      durationMs: n,
      easing: r,
      onUpdate: () => {
        No(this.camera, this.source, this.panExtentX, this.panExtentY), this.onViewStateChange?.(this.camera.getViewState()), this.requestRender();
      }
    });
  }
  getPointBufferRuntime() {
    return {
      pointCount: this.pointCount,
      usePointIndices: this.usePointIndices,
      pointBuffersDirty: this.pointBuffersDirty,
      lastPointData: this.lastPointData,
      zeroFillModes: this.zeroFillModes,
      lastPointPalette: this.lastPointPalette,
      pointPaletteSize: this.pointPaletteSize
    };
  }
  applyPointBufferRuntime(t) {
    this.pointCount = t.pointCount, this.usePointIndices = t.usePointIndices, this.pointBuffersDirty = t.pointBuffersDirty, this.lastPointData = t.lastPointData, this.zeroFillModes = t.zeroFillModes, this.lastPointPalette = t.lastPointPalette, this.pointPaletteSize = t.pointPaletteSize;
  }
  applyViewStateAndRender(t, n = !0) {
    n && this.cancelViewAnimation(), this.camera.setViewState(t), this.onViewStateChange?.(this.camera.getViewState()), this.requestRender();
  }
  setAuthToken(t) {
    this.authToken = String(t ?? ""), this.tileScheduler.setAuthToken(this.authToken);
  }
  setZoomRange(t, n) {
    const r = vo(t), i = vo(n);
    if (this.minZoomOverride === r && this.maxZoomOverride === i)
      return;
    this.minZoomOverride = r, this.maxZoomOverride = i, this.applyZoomBounds();
    const o = this.resolveTargetViewState({}), s = this.camera.getViewState();
    mu(s, o) || this.applyViewStateAndRender(o);
  }
  setViewTransition(t) {
    this.viewTransitionDurationMs = dl(t?.duration), this.viewTransitionEasing = hl(t?.easing);
  }
  setViewState(t, n) {
    const r = this.resolveTargetViewState(t), i = this.camera.getViewState();
    if (mu(i, r)) return;
    const o = dl(n?.duration ?? this.viewTransitionDurationMs), s = hl(n?.easing ?? this.viewTransitionEasing);
    if (o <= 0) {
      this.applyViewStateAndRender(r);
      return;
    }
    this.startViewAnimation(r, o, s);
  }
  getViewState() {
    return this.camera.getViewState();
  }
  getZoomRange() {
    return { minZoom: this.minZoom, maxZoom: this.maxZoom };
  }
  getRegionLabelAutoLiftCapZoom() {
    const t = this.zoomSnaps.filter((n) => n >= this.minZoom && n <= this.maxZoom);
    return t.length > 0 ? t[t.length - 1] : this.maxZoom;
  }
  isViewAnimating() {
    return this.viewAnimationState.animation !== null;
  }
  setPointPalette(t) {
    const n = Qw(this.getPointBufferRuntime(), this.gl, this.pointProgram, this.contextLost, t);
    this.applyPointBufferRuntime(n), !(!t || t.length === 0) && this.requestRender();
  }
  setPointData(t) {
    const n = Jw(this.getPointBufferRuntime(), this.gl, this.pointProgram, this.contextLost, t);
    this.applyPointBufferRuntime(n), this.requestRender();
  }
  setInteractionLock(t) {
    const n = !!t;
    this.interactionLocked !== n && (this.interactionLocked = n, n && this.cancelDrag());
  }
  setPointSizeByZoom(t) {
    const n = Xf(t);
    Rw(this.pointSizeStops, n) || (this.pointSizeStops = n, this.requestRender());
  }
  setPointStrokeScale(t) {
    const n = Hf(t);
    this.pointStrokeScale !== n && (this.pointStrokeScale = n, this.requestRender());
  }
  setPointInnerFillOpacity(t) {
    const n = Gf(t);
    this.pointInnerFillOpacity !== n && (this.pointInnerFillOpacity = n, this.requestRender());
  }
  setImageColorSettings(t) {
    const n = $f(t), r = this.imageColorSettings;
    r.brightness === n.brightness && r.contrast === n.contrast && r.saturation === n.saturation || (this.imageColorSettings = n, this.requestRender());
  }
  cancelDrag() {
    Yw(this.canvas, this.interactionState);
  }
  screenToWorld(t, n) {
    const r = this.canvas.getBoundingClientRect(), i = t - r.left, o = n - r.top;
    return this.camera.screenToWorld(i, o);
  }
  worldToScreen(t, n) {
    return this.camera.worldToScreen(t, n);
  }
  setViewCenter(t, n, r) {
    if (!Number.isFinite(t) || !Number.isFinite(n)) return;
    const i = this.camera.getViewState(), o = Math.max(1e-6, i.zoom), s = this.camera.getViewportSize();
    this.setViewState(
      {
        offsetX: t - s.width / (2 * o),
        offsetY: n - s.height / (2 * o)
      },
      r
    );
  }
  getViewCorners() {
    return this.camera.getViewCorners();
  }
  getViewBounds() {
    return ms(this.camera);
  }
  resetRotation(t) {
    const n = this.camera.getViewState();
    Math.abs(n.rotationDeg) < 1e-6 || this.setViewState({ rotationDeg: 0 }, t);
  }
  getPointSizeByZoom() {
    const t = Math.max(1e-6, this.camera.getViewState().zoom), n = this.source.maxTierZoom + Math.log2(t), r = Pw(n, this.pointSizeStops);
    return U(r, Eu, gw);
  }
  fitToImage(t) {
    const n = this.canvas.getBoundingClientRect(), r = Math.max(1, n.width || 1), i = Math.max(1, n.height || 1), o = qf(this.source, r, i, this.minZoom, this.maxZoom);
    this.fitZoom = o.fitZoom, this.applyZoomBounds(), this.setViewState(o.target, t);
  }
  zoomBy(t, n, r, i) {
    const o = ox(this.camera, this.minZoom, this.maxZoom, t, n, r);
    o && this.setViewState(o, i);
  }
  zoomTo(t, n, r, i) {
    const o = sx(this.camera, this.minZoom, this.maxZoom, t, n, r);
    o && this.setViewState(o, i);
  }
  setZoomSnaps(t, n) {
    this.zoomSnaps = Kf(t, this.source.mpp), this.zoomSnapFitAsMin = !!n;
  }
  setPanExtent(t) {
    this.applyPanExtent(t);
  }
  applyPanExtent(t) {
    typeof t == "number" && Number.isFinite(t) ? (this.panExtentX = Math.max(0, t), this.panExtentY = Math.max(0, t)) : t != null && typeof t == "object" ? (this.panExtentX = typeof t.x == "number" && Number.isFinite(t.x) ? Math.max(0, t.x) : 0.2, this.panExtentY = typeof t.y == "number" && Number.isFinite(t.y) ? Math.max(0, t.y) : 0.2) : (this.panExtentX = 0.2, this.panExtentY = 0.2);
  }
  getZoomPivotAnimationContext() {
    return {
      camera: this.camera,
      viewAnimationState: this.viewAnimationState,
      minZoom: this.minZoom,
      maxZoom: this.maxZoom,
      cancelViewAnimation: () => this.cancelViewAnimation(),
      clampViewState: () => No(this.camera, this.source, this.panExtentX, this.panExtentY),
      onViewStateChange: (t) => this.onViewStateChange?.(t),
      requestRender: () => this.requestRender()
    };
  }
  handleSnapZoom(t, n, r) {
    const i = this.viewAnimationState.animation, o = i ? i.to.zoom : this.camera.getViewState().zoom, s = this.zoomSnaps.filter((f) => f >= this.minZoom && f <= this.maxZoom), l = ux(s, o, t, this.zoomSnapFitAsMin);
    if (!l) return !1;
    let u;
    if (l.type === "fit") {
      const f = this.canvas.getBoundingClientRect(), c = Math.max(1, f.width || 1), d = Math.max(1, f.height || 1), h = qf(this.source, c, d, this.minZoom, this.maxZoom);
      this.fitZoom = h.fitZoom, this.applyZoomBounds(), u = h.target.zoom;
    } else
      u = l.zoom;
    const a = Math.max(Math.abs(u) * 5e-3, 1e-8);
    if (i) {
      if ((i.to.zoom > i.from.zoom + a ? "in" : i.to.zoom < i.from.zoom - a ? "out" : null) === t && Math.abs(i.to.zoom - u) <= a)
        return !1;
    } else if (Math.abs(o - u) <= a)
      return !1;
    return ax(this.getZoomPivotAnimationContext(), u, n, r, lx), !0;
  }
  render() {
    if (this.destroyed || this.contextLost || this.gl.isContextLost()) return;
    const t = this.onStats ? Ae() : 0;
    this.frameSerial += 1;
    const n = ex({
      gl: this.gl,
      camera: this.camera,
      source: this.source,
      cache: this.cache,
      frameSerial: this.frameSerial,
      tileProgram: this.tileProgram,
      pointProgram: this.pointProgram,
      imageColorSettings: this.imageColorSettings,
      pointCount: this.pointCount,
      usePointIndices: this.usePointIndices,
      pointPaletteSize: this.pointPaletteSize,
      pointStrokeScale: this.pointStrokeScale,
      pointInnerFillOpacity: this.pointInnerFillOpacity,
      pointSizePx: this.getPointSizeByZoom() * Math.max(1, window.devicePixelRatio || 1),
      tileScheduler: this.tileScheduler,
      getVisibleTiles: () => Dw(this.camera, this.source),
      getVisibleTilesForTier: (r) => op(this.camera, this.source, r),
      getViewBounds: () => ms(this.camera),
      intersectsBounds: Nw
    });
    if (this.onStats) {
      const r = this.tileScheduler.getSnapshot();
      this.onStats({
        tier: n.tier,
        visible: n.visible,
        rendered: n.rendered,
        points: n.points,
        fallback: n.fallback,
        cache: this.cache.size,
        inflight: r.inflight,
        queued: r.queued,
        retries: r.retries,
        failed: r.failed,
        aborted: r.aborted,
        cacheHits: n.cacheHits,
        cacheMisses: n.cacheMisses,
        drawCalls: n.drawCalls,
        frameMs: Ae() - t
      });
    }
  }
  requestRender() {
    this.frame !== null || this.destroyed || this.contextLost || this.gl.isContextLost() || (this.frame = requestAnimationFrame(() => {
      this.frame = null, this.render();
    }));
  }
  resize() {
    pw(this.canvas, this.gl, this.camera), this.requestRender();
  }
  onWebGlContextLost(t) {
    const n = jw({
      event: t,
      destroyed: this.destroyed,
      contextLost: this.contextLost,
      frame: this.frame,
      cancelViewAnimation: () => this.cancelViewAnimation(),
      cancelDrag: () => this.cancelDrag(),
      tileScheduler: this.tileScheduler,
      cache: this.cache,
      onContextLost: this.onContextLost
    });
    n.handled && (this.frame = n.frame, this.contextLost = !0, this.pointBuffersDirty = !0);
  }
  onWebGlContextRestored(t) {
    this.destroyed || (this.contextLost = !1, this.cache.clear(), this.tileProgram = jf(this.gl), this.pointProgram = Zf(this.gl), this.pointBuffersDirty = !0, this.lastPointPalette && this.lastPointPalette.length > 0 && this.setPointPalette(this.lastPointPalette), this.lastPointData ? this.setPointData(this.lastPointData) : this.pointCount = 0, this.resize(), this.onContextRestored?.());
  }
  destroy() {
    const t = Zw({
      destroyed: this.destroyed,
      frame: this.frame,
      cancelViewAnimation: () => this.cancelViewAnimation(),
      resizeObserver: this.resizeObserver,
      removeCanvasEventListeners: () => mw(this.canvas, this.getCanvasHandlers()),
      cancelDrag: () => this.cancelDrag(),
      tileScheduler: this.tileScheduler,
      contextLost: this.contextLost,
      gl: this.gl,
      cache: this.cache,
      tileProgram: this.tileProgram,
      pointProgram: this.pointProgram
    });
    t.didDestroy && (this.destroyed = !0, this.frame = t.frame);
  }
}
const cx = [];
function fx({
  source: e,
  viewState: t,
  onViewStateChange: n,
  onStats: r,
  onTileError: i,
  onContextLost: o,
  onContextRestored: s,
  imageColorSettings: l = null,
  fitNonce: u = 0,
  rotationResetNonce: a = 0,
  authToken: f = "",
  ctrlDragRotate: c = !0,
  minZoom: d,
  maxZoom: h,
  viewTransition: g,
  zoomSnaps: y,
  zoomSnapFitAsMin: x,
  panExtent: p,
  onPointerWorldMove: m,
  debugOverlay: v = !1,
  debugOverlayStyle: w,
  className: E,
  style: C,
  children: A
}) {
  const M = S.useRef(null), N = S.useRef(null), I = S.useRef(null), B = S.useRef(null), O = S.useRef(null), L = S.useRef(null), G = S.useRef(cx), $ = S.useRef(!1), Y = S.useRef(/* @__PURE__ */ new Set()), Q = S.useRef(/* @__PURE__ */ new Set()), _ = S.useRef(n), D = S.useRef(r), q = S.useRef(i), ne = S.useRef(o), le = S.useRef(s), [F, b] = S.useState(0), [V, ue] = S.useState(null), re = S.useRef(v);
  S.useEffect(() => {
    _.current = n;
  }, [n]), S.useEffect(() => {
    D.current = r;
  }, [r]), S.useEffect(() => {
    q.current = i;
  }, [i]), S.useEffect(() => {
    ne.current = o;
  }, [o]), S.useEffect(() => {
    le.current = s;
  }, [s]), S.useEffect(() => {
    re.current = v, v || ue(null);
  }, [v]);
  const me = S.useMemo(() => ({ position: "relative", width: "100%", height: "100%", ...C }), [C]), ge = S.useMemo(
    () => ({
      position: "absolute",
      top: 8,
      left: 8,
      zIndex: 7,
      margin: 0,
      padding: "8px 10px",
      maxWidth: "min(420px, 80%)",
      pointerEvents: "none",
      whiteSpace: "pre-wrap",
      lineHeight: 1.35,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
      fontSize: 11,
      color: "#cde6ff",
      background: "rgba(6, 12, 20, 0.82)",
      border: "1px solid rgba(173, 216, 255, 0.28)",
      borderRadius: 8,
      boxShadow: "0 8px 22px rgba(0,0,0,0.35)",
      ...w
    }),
    [w]
  ), Se = S.useCallback((j) => {
    D.current?.(j), re.current && ue(j);
  }, []), pe = S.useMemo(() => V ? [
    `tier ${V.tier} | frame ${V.frameMs?.toFixed(2) ?? "-"} ms | drawCalls ${V.drawCalls ?? "-"}`,
    `tiles visible ${V.visible} | rendered ${V.rendered} | fallback ${V.fallback}`,
    `cache size ${V.cache} | hit ${V.cacheHits ?? "-"} | miss ${V.cacheMisses ?? "-"}`,
    `queue inflight ${V.inflight} | queued ${V.queued ?? "-"} | retries ${V.retries ?? "-"} | failed ${V.failed ?? "-"} | aborted ${V.aborted ?? "-"}`,
    `points ${V.points}`
  ].join(`
`) : "stats: waiting for first frame...", [V]), Re = S.useCallback(() => {
    const j = I.current;
    if (!j) return;
    const z = j.getContext("2d");
    if (!z) return;
    const Z = Math.max(1, window.devicePixelRatio || 1), K = j.getBoundingClientRect(), ae = Math.max(1, Math.round(K.width * Z)), se = Math.max(1, Math.round(K.height * Z));
    (j.width !== ae || j.height !== se) && (j.width = ae, j.height = se);
    const Ye = K.width, Lt = K.height;
    z.setTransform(1, 0, 0, 1, 0, 0), z.clearRect(0, 0, j.width, j.height), z.setTransform(Z, 0, 0, Z, 0, 0);
    const fn = G.current;
    for (let Un = 0; Un < fn.length; Un += 1)
      z.save(), fn[Un].draw(z, Ye, Lt), z.restore();
  }, []), de = S.useCallback(() => {
    $.current || ($.current = !0, requestAnimationFrame(() => {
      $.current = !1, Re();
    }));
  }, [Re]), xe = S.useCallback(
    (j, z, Z) => {
      const K = G.current.filter((ae) => ae.id !== j);
      K.push({ id: j, priority: z, draw: Z }), K.sort((ae, se) => ae.priority - se.priority), G.current = K, de();
    },
    [de]
  ), J = S.useCallback(
    (j) => {
      G.current = G.current.filter((z) => z.id !== j), de();
    },
    [de]
  ), te = S.useCallback((j, z) => {
    z ? Y.current.add(j) : Y.current.delete(j), B.current?.setInteractionLock(Y.current.size > 0);
  }, []), ee = S.useCallback(() => Y.current.size > 0, []), fe = S.useCallback((j, z) => {
    const Z = B.current;
    return Z ? Ca(Z.worldToScreen(j, z)) : null;
  }, []), oe = S.useCallback((j, z) => {
    const Z = B.current;
    if (!Z) return null;
    const K = Z.screenToWorld(j, z);
    if (!Array.isArray(K) || K.length < 2) return null;
    const ae = Number(K[0]), se = Number(K[1]);
    return !Number.isFinite(ae) || !Number.isFinite(se) ? null : [ae, se];
  }, []), ye = S.useCallback((j) => (Q.current.add(j), () => {
    Q.current.delete(j);
  }), []), Ie = S.useCallback(
    (j) => {
      _.current?.(j);
      const z = Q.current;
      if (z.size > 0) {
        const Z = Array.from(z);
        for (let K = 0; K < Z.length; K += 1)
          Z[K](j);
      }
      O.current?.(), L.current?.(), de();
    },
    [de]
  );
  S.useEffect(() => {
    const j = N.current;
    if (!j || !e) return;
    const z = new lp(j, e, {
      onViewStateChange: Ie,
      onStats: Se,
      onTileError: (Z) => {
        q.current?.(Z);
      },
      onContextLost: () => {
        ne.current?.();
      },
      onContextRestored: () => {
        le.current?.();
      },
      authToken: f,
      imageColorSettings: l,
      ctrlDragRotate: c,
      minZoom: d,
      maxZoom: h,
      viewTransition: g,
      zoomSnaps: y,
      zoomSnapFitAsMin: x,
      panExtent: p
    });
    return B.current = z, b((Z) => Z + 1), t && z.setViewState(t), z.setInteractionLock(Y.current.size > 0), () => {
      z.destroy(), B.current = null;
    };
  }, [e, Se, c, Ie]), S.useEffect(() => {
    B.current?.setAuthToken(f);
  }, [f]), S.useEffect(() => {
    const j = B.current;
    !j || !t || j.isViewAnimating() || j.setViewState(t);
  }, [t]), S.useEffect(() => {
    B.current?.fitToImage();
  }, [u]), S.useEffect(() => {
    B.current?.resetRotation();
  }, [a]), S.useEffect(() => {
    B.current?.setZoomRange(d, h);
  }, [d, h]), S.useEffect(() => {
    B.current?.setViewTransition(g);
  }, [g]), S.useEffect(() => {
    B.current?.setZoomSnaps(y, x);
  }, [y, x]), S.useEffect(() => {
    B.current?.setPanExtent(p);
  }, [p]), S.useEffect(() => {
    B.current?.setImageColorSettings(l);
  }, [l]), S.useEffect(() => {
    const j = I.current;
    if (!j) return;
    O.current = de, de();
    const z = new ResizeObserver(() => de());
    return z.observe(j), () => {
      z.disconnect(), O.current === de && (O.current = null);
    };
  }, [de]);
  const ze = S.useMemo(
    () => ({
      source: e,
      rendererRef: B,
      rendererSerial: F,
      canvasRef: N,
      containerRef: M,
      drawInvalidateRef: O,
      overviewInvalidateRef: L,
      worldToScreen: fe,
      screenToWorld: oe,
      registerDrawCallback: xe,
      unregisterDrawCallback: J,
      requestOverlayRedraw: de,
      registerViewStateListener: ye,
      setInteractionLock: te,
      isInteractionLocked: ee
    }),
    [e, F, fe, oe, xe, J, de, ye, te, ee]
  ), Pe = S.useRef(m);
  S.useEffect(() => {
    Pe.current = m;
  }, [m]);
  const Me = S.useCallback(
    (j) => {
      const z = Pe.current;
      if (!z) return;
      const Z = oe(j.clientX, j.clientY), K = !!Z && Z[0] >= 0 && Z[1] >= 0 && !!e && Z[0] <= e.width && Z[1] <= e.height;
      z({ coordinate: Z, clientX: j.clientX, clientY: j.clientY, insideImage: K });
    },
    [oe, e]
  ), Ke = S.useCallback(() => {
    Pe.current?.({ coordinate: null, clientX: -1, clientY: -1, insideImage: !1 });
  }, []);
  return /* @__PURE__ */ At.jsx(N1, { value: ze, children: /* @__PURE__ */ At.jsxs(
    "div",
    {
      ref: M,
      className: E,
      style: me,
      onPointerMove: m ? Me : void 0,
      onPointerLeave: m ? Ke : void 0,
      children: [
        /* @__PURE__ */ At.jsx(
          "canvas",
          {
            ref: N,
            className: "wsi-render-canvas",
            style: {
              position: "absolute",
              inset: 0,
              zIndex: 1,
              width: "100%",
              height: "100%",
              display: "block",
              touchAction: "none"
            }
          }
        ),
        /* @__PURE__ */ At.jsx(
          "canvas",
          {
            ref: I,
            className: "wsi-overlay-canvas",
            style: {
              position: "absolute",
              inset: 0,
              zIndex: 2,
              width: "100%",
              height: "100%",
              display: "block",
              pointerEvents: "none",
              touchAction: "none"
            }
          }
        ),
        A,
        v && /* @__PURE__ */ At.jsx("pre", { "data-open-plant-debug-overlay": !0, style: ge, children: pe })
      ]
    }
  ) });
}
function dx(e) {
  const t = [];
  for (let n = 0; n < e.length; n += 1) {
    const r = e[n], i = Br([Ur(r?.coordinates)]);
    if (i.length === 0) continue;
    let o = 0, s = 1 / 0, l = 1 / 0, u = -1 / 0, a = -1 / 0;
    for (const f of i)
      o += f.area, f.minX < s && (s = f.minX), f.minY < l && (l = f.minY), f.maxX > u && (u = f.maxX), f.maxY > a && (a = f.maxY);
    !Number.isFinite(s) || !Number.isFinite(l) || !Number.isFinite(u) || !Number.isFinite(a) || t.push({
      regionId: r.id ?? n,
      regionIndex: n,
      polygons: i,
      area: Math.max(1e-6, o),
      minX: s,
      minY: l,
      maxX: u,
      maxY: a
    });
  }
  return t;
}
const hx = 128, ml = [];
function wr(e, t, n, r, i) {
  if (i <= 1 || n <= t) return 0;
  const o = (e - t) / r;
  return !Number.isFinite(o) || o <= 0 ? 0 : o >= i - 1 ? i - 1 : Math.floor(o);
}
function mx(e) {
  if (e.length === 0) return null;
  let t = 1 / 0, n = 1 / 0, r = -1 / 0, i = -1 / 0;
  for (const f of e)
    f.minX < t && (t = f.minX), f.minY < n && (n = f.minY), f.maxX > r && (r = f.maxX), f.maxY > i && (i = f.maxY);
  if (!Number.isFinite(t) || !Number.isFinite(n) || !Number.isFinite(r) || !Number.isFinite(i))
    return null;
  const o = Math.ceil(Math.sqrt(e.length * 2)), s = Math.max(1, Math.min(hx, o)), l = r > t ? (r - t) / s : 1, u = i > n ? (i - n) / s : 1, a = Array.from({ length: s * s }, () => []);
  for (let f = 0; f < e.length; f += 1) {
    const c = e[f], d = wr(c.minX, t, r, l, s), h = wr(c.maxX, t, r, l, s), g = wr(c.minY, n, i, u, s), y = wr(c.maxY, n, i, u, s);
    for (let x = g; x <= y; x += 1)
      for (let p = d; p <= h; p += 1)
        a[x * s + p].push(f);
  }
  return {
    minX: t,
    minY: n,
    maxX: r,
    maxY: i,
    gridSize: s,
    cellWidth: l,
    cellHeight: u,
    buckets: a
  };
}
function px(e, t, n) {
  if (!e || t < e.minX || t > e.maxX || n < e.minY || n > e.maxY)
    return ml;
  const r = wr(t, e.minX, e.maxX, e.cellWidth, e.gridSize), i = wr(n, e.minY, e.maxY, e.cellHeight, e.gridSize);
  return e.buckets[i * e.gridSize + r] ?? ml;
}
function gx(e, t) {
  if (Array.isArray(t)) {
    const n = t[e];
    if (typeof n == "string" && n.length > 0) return n;
  }
  if (t instanceof Map) {
    const n = t.get(e);
    if (typeof n == "string" && n.length > 0) return n;
  }
  return String(e);
}
function yx(e, t, n = {}) {
  const r = Math.max(
    0,
    Math.min(
      Math.floor(e?.count ?? 0),
      Math.floor((e?.positions?.length ?? 0) / 2),
      e?.paletteIndices?.length ?? 0,
      e?.fillModes instanceof Uint8Array ? e.fillModes.length : Number.MAX_SAFE_INTEGER
    )
  );
  let i = null;
  if (e?.drawIndices instanceof Uint32Array) {
    const h = e.drawIndices;
    let g = h.length;
    for (let y = 0; y < h.length; y += 1)
      h[y] < r || (g -= 1);
    if (g === h.length)
      i = h;
    else if (g > 0) {
      const y = new Uint32Array(g);
      let x = 0;
      for (let p = 0; p < h.length; p += 1) {
        const m = h[p];
        m >= r || (y[x] = m, x += 1);
      }
      i = y;
    } else
      i = new Uint32Array(0);
  }
  const o = i ? i.length : r, s = dx(t ?? []);
  if (!e || o === 0 || s.length === 0)
    return {
      groups: [],
      inputPointCount: o,
      pointsInsideAnyRegion: 0,
      unmatchedPointCount: o
    };
  const l = /* @__PURE__ */ new Map(), u = /* @__PURE__ */ new Map(), a = mx(s);
  let f = 0;
  for (let h = 0; h < o; h += 1) {
    const g = i ? i[h] : h, y = e.positions[g * 2], x = e.positions[g * 2 + 1];
    if (!Number.isFinite(y) || !Number.isFinite(x)) continue;
    let p = null;
    const m = px(a, y, x);
    if (m.length === 0) continue;
    for (const E of m) {
      const C = s[E];
      let A = !1;
      for (const M of C.polygons)
        if (vm(y, x, M)) {
          A = !0;
          break;
        }
      A && (!p || C.area < p.area) && (p = C);
    }
    if (!p) continue;
    f += 1;
    const v = e.paletteIndices[g] ?? 0, w = l.get(p.regionIndex) ?? /* @__PURE__ */ new Map();
    w.set(v, (w.get(v) ?? 0) + 1), l.set(p.regionIndex, w), u.set(p.regionIndex, (u.get(p.regionIndex) ?? 0) + 1);
  }
  const c = n.includeEmptyRegions ?? !1, d = [];
  for (const h of s) {
    const g = u.get(h.regionIndex) ?? 0;
    if (!c && g <= 0) continue;
    const y = l.get(h.regionIndex) ?? /* @__PURE__ */ new Map(), x = Array.from(y.entries()).map(([p, m]) => ({
      classId: gx(p, n.paletteIndexToClassId),
      paletteIndex: p,
      count: m
    })).sort((p, m) => m.count - p.count || p.paletteIndex - m.paletteIndex);
    d.push({
      regionId: h.regionId,
      regionIndex: h.regionIndex,
      totalCount: g,
      classCounts: x
    });
  }
  return {
    groups: d,
    inputPointCount: o,
    pointsInsideAnyRegion: f,
    unmatchedPointCount: Math.max(0, o - f)
  };
}
function vx(e) {
  return e.replace(/^\s*SRID\s*=\s*\d+\s*;\s*/i, "");
}
function wx(e) {
  return e >= "A" && e <= "Z" || e >= "a" && e <= "z";
}
function xx(e) {
  return e >= "0" && e <= "9";
}
function Qf(e) {
  return e === "+" || e === "-" || e === "." || xx(e);
}
class Sx {
  constructor(t) {
    R(this, "text");
    R(this, "index", 0);
    this.text = vx(t.trim());
  }
  parse() {
    if (!this.text) return null;
    const t = this.readWord();
    if (!t) return null;
    const n = t.toUpperCase();
    if (n !== "POLYGON" && n !== "MULTIPOLYGON")
      return null;
    this.skipWhitespace();
    const r = this.peekWord();
    if (r) {
      const s = r.toUpperCase();
      (s === "Z" || s === "M" || s === "ZM") && (this.readWord(), this.skipWhitespace());
    }
    if (this.consumeWordIf("EMPTY"))
      return this.skipWhitespace(), this.isEof() ? n === "POLYGON" ? { type: "Polygon", coordinates: [] } : { type: "MultiPolygon", coordinates: [] } : null;
    let i;
    try {
      i = this.parseNestedList();
    } catch {
      return null;
    }
    if (this.skipWhitespace(), !this.isEof()) return null;
    if (n === "POLYGON") {
      const s = up(i);
      return s ? {
        type: "Polygon",
        coordinates: s
      } : null;
    }
    const o = Cx(i);
    return o ? {
      type: "MultiPolygon",
      coordinates: o
    } : null;
  }
  isEof() {
    return this.index >= this.text.length;
  }
  currentChar() {
    return this.text[this.index] ?? "";
  }
  skipWhitespace() {
    for (; !this.isEof() && /\s/.test(this.currentChar()); )
      this.index += 1;
  }
  readWord() {
    if (this.skipWhitespace(), this.isEof()) return null;
    const t = this.index;
    for (; !this.isEof() && wx(this.currentChar()); )
      this.index += 1;
    return this.index === t ? null : this.text.slice(t, this.index);
  }
  peekWord() {
    const t = this.index, n = this.readWord();
    return this.index = t, n;
  }
  consumeWordIf(t) {
    const n = this.index, r = this.readWord();
    return !r || r.toUpperCase() !== t.toUpperCase() ? (this.index = n, !1) : !0;
  }
  parseNestedList() {
    if (this.skipWhitespace(), this.currentChar() !== "(")
      throw new Error("Expected '('");
    this.index += 1;
    const t = [];
    for (; ; ) {
      this.skipWhitespace(), this.currentChar() === "(" ? t.push(this.parseNestedList()) : t.push(this.parseCoordinateTuple()), this.skipWhitespace();
      const n = this.currentChar();
      if (n === ",") {
        this.index += 1;
        continue;
      }
      if (n === ")") {
        this.index += 1;
        break;
      }
      throw new Error("Expected ',' or ')'");
    }
    return t;
  }
  parseCoordinateTuple() {
    this.skipWhitespace();
    const t = [];
    for (; ; ) {
      this.skipWhitespace();
      const n = this.currentChar();
      if (!n || !Qf(n)) break;
      const r = this.readNumber();
      if (r === null) break;
      t.push(r), this.skipWhitespace();
      const i = this.currentChar();
      if (!i || i === "," || i === ")") break;
      if (!Qf(i))
        throw new Error("Invalid coordinate");
    }
    if (t.length < 2)
      throw new Error("Coordinate requires at least x y");
    return [t[0], t[1]];
  }
  readNumber() {
    if (this.skipWhitespace(), this.isEof()) return null;
    const n = this.text.slice(this.index).match(/^[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/);
    if (!n) return null;
    const r = Number(n[0]);
    return Number.isFinite(r) ? (this.index += n[0].length, r) : null;
  }
}
function Ex(e) {
  return Array.isArray(e) && e.length >= 2 && typeof e[0] == "number" && Number.isFinite(e[0]) && typeof e[1] == "number" && Number.isFinite(e[1]);
}
function up(e) {
  if (!Array.isArray(e)) return null;
  const t = [];
  for (const n of e) {
    if (!Array.isArray(n)) return null;
    const r = [];
    for (const i of n) {
      if (!Ex(i)) return null;
      r.push([i[0], i[1]]);
    }
    t.push(r);
  }
  return t;
}
function Cx(e) {
  if (!Array.isArray(e)) return null;
  const t = [];
  for (const n of e) {
    const r = up(n);
    if (!r) return null;
    t.push(r);
  }
  return t;
}
function Rx(e) {
  return typeof e != "string" ? null : new Sx(e).parse();
}
const Px = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  DEFAULT_POINT_COLOR: Sa,
  DrawLayer: Im,
  DrawingLayer: D1,
  HeatmapLayer: gv,
  M1TileRenderer: hm,
  OverlayLayer: vv,
  OverviewMap: Pv,
  PatchLayer: Tv,
  PointLayer: Qv,
  RegionLayer: cw,
  TileScheduler: np,
  TileViewerCanvas: fw,
  WsiTileRenderer: lp,
  WsiViewer: fx,
  __heatmapLayerInternals: yv,
  buildClassPalette: xm,
  buildPointSpatialIndexAsync: tp,
  calcScaleLength: wy,
  calcScaleResolution: Ea,
  clamp: U,
  closeRing: je,
  computeRoiPointGroups: yx,
  createCircle: fs,
  createRectangle: Fr,
  createSpatialIndex: Lm,
  filterPointDataByPolygons: Li,
  filterPointDataByPolygonsHybrid: Km,
  filterPointDataByPolygonsInWorker: Jm,
  filterPointIndicesByPolygons: jm,
  filterPointIndicesByPolygonsInWorker: zv,
  getWebGpuCapabilities: Fv,
  hexToRgba: wm,
  isSameViewState: mu,
  lookupCellIndex: ep,
  normalizeImageClasses: wv,
  normalizeImageInfo: Sv,
  parseWkt: Rx,
  prefilterPointsByBoundsWebGpu: qm,
  terminatePointHitIndexWorker: $v,
  terminateRoiClipWorker: Dv,
  toBearerToken: xy,
  toRoiGeometry: Ur,
  toTileUrl: La,
  useViewerContext: tr
}, Symbol.toStringTag, { value: "Module" })), Na = 8192, Da = 6144, vt = 256, ap = 6, cp = 0.25, Jf = /* @__PURE__ */ new Map();
let sr = null, pl = null;
function Mx() {
  if (sr || (sr = document.createElement("canvas"), sr.width = vt, sr.height = vt, pl = sr.getContext("2d")), !pl)
    throw new Error("Canvas 2D context is unavailable.");
  return pl;
}
function Tx(e) {
  let t = e >>> 0;
  return () => (t = t * 1664525 + 1013904223 >>> 0, t / 4294967295);
}
function xr(e, t, n) {
  const r = `${e}/${t}/${n}`, i = Jf.get(r);
  if (i) return i;
  const o = Mx(), s = (e * 41 + t * 23 + n * 31) % 360, l = o.createLinearGradient(0, 0, vt, vt);
  l.addColorStop(0, `hsl(${s}, 54%, 90%)`), l.addColorStop(1, `hsl(${(s + 36) % 360}, 42%, 72%)`), o.fillStyle = l, o.fillRect(0, 0, vt, vt), o.strokeStyle = "rgba(15, 33, 56, 0.18)", o.lineWidth = 1;
  for (let a = 0; a <= vt; a += 32)
    o.beginPath(), o.moveTo(a, 0), o.lineTo(a, vt), o.stroke(), o.beginPath(), o.moveTo(0, a), o.lineTo(vt, a), o.stroke();
  o.fillStyle = "rgba(7, 20, 38, 0.7)", o.font = "600 14px IBM Plex Mono, monospace", o.textAlign = "left", o.textBaseline = "top", o.fillText(`tier ${e}`, 12, 12), o.fillText(`${t}, ${n}`, 12, 32), o.fillStyle = "rgba(255, 255, 255, 0.55)", o.beginPath(), o.arc(200, 56, 26, 0, Math.PI * 2), o.fill(), o.strokeStyle = "rgba(255, 255, 255, 0.72)", o.lineWidth = 3, o.strokeRect(6, 6, vt - 12, vt - 12);
  const u = sr.toDataURL("image/png");
  return Jf.set(r, u), u;
}
function Ax() {
  return [
    { classId: "negative", className: "Negative", classColor: "#2f80ed" },
    { classId: "positive", className: "Positive", classColor: "#e24d3d" },
    { classId: "other", className: "Other", classColor: "#22b573" },
    { classId: "review", className: "Review", classColor: "#f2c94c" }
  ];
}
function _x() {
  return {
    id: "docs-playground",
    name: "Open Plant Docs Playground",
    width: Na,
    height: Da,
    mpp: cp,
    tileSize: vt,
    maxTierZoom: ap,
    tilePath: "/demo-slide",
    tileBaseUrl: "/demo-assets",
    tileUrlBuilder: (e, t, n) => xr(e, t, n)
  };
}
function kx(e) {
  const n = Tx(20260406), r = new Float32Array(2400 * 2), i = new Uint16Array(2400), o = new Uint32Array(2400), s = new Float32Array(2400), l = [
    [1600, 1500],
    [3600, 2200],
    [5600, 1700],
    [4700, 4200]
  ], u = ["negative", "positive", "other", "review"];
  for (let a = 0; a < 2400; a += 1) {
    const f = a % l.length, c = l[f], d = (a * 0.19 + f * 1.7) % (Math.PI * 2), h = 180 + n() * 1120 + (f === 3 ? n() * 640 : 0), g = (n() - 0.5) * 460, y = (n() - 0.5) * 520, x = U(c[0] + Math.cos(d) * h + g, 48, Na - 48), p = U(c[1] + Math.sin(d * 1.22) * h + y, 48, Da - 48);
    r[a * 2] = x, r[a * 2 + 1] = p, i[a] = e.get(u[f]) ?? 0, o[a] = a + 1, s[a] = f === 1 ? 1.1 : f === 3 ? 0.82 : f === 2 ? 0.66 : 0.48;
  }
  return {
    pointData: {
      count: 2400,
      positions: r,
      paletteIndices: i,
      ids: o
    },
    heatmapData: {
      count: 2400,
      positions: r,
      weights: s
    }
  };
}
function Ix() {
  return [
    {
      id: "roi-rect",
      label: "Tumor band",
      coordinates: Fr([960, 920], [2640, 2440])
    },
    {
      id: "roi-circle",
      label: "Positive pocket",
      coordinates: fs([3680, 1560], [4700, 2580])
    },
    {
      id: "roi-manual",
      label: "Review zone",
      coordinates: je([
        [5060, 3340],
        [6280, 3480],
        [6880, 4480],
        [5940, 5200],
        [4700, 4560]
      ])
    }
  ];
}
function bx() {
  return [
    {
      id: "patch-4096",
      label: "Patch 4096",
      coordinates: Fr([5600, 3200], [7040, 4544])
    }
  ];
}
function Lx() {
  return [
    {
      id: "inspection-mask",
      coordinates: [
        [
          [520, 520],
          [2160, 520],
          [2160, 1860],
          [520, 1860],
          [520, 520]
        ]
      ],
      closed: !0,
      invertedFill: { fillColor: "rgba(10, 24, 38, 0.16)" }
    },
    {
      id: "focus-outline",
      coordinates: je([
        [3320, 3120],
        [4700, 3180],
        [4520, 4240],
        [3240, 4120]
      ]),
      closed: !0,
      stroke: {
        color: "rgba(255, 255, 255, 0.72)",
        width: 2,
        lineDash: [10, 8]
      }
    }
  ];
}
function Fx() {
  return [
    { id: "quad-0", url: xr(1, 0, 0), bounds: [0, 0, 4096, 3072] },
    { id: "quad-1", url: xr(1, 1, 0), bounds: [4096, 0, 8192, 3072] },
    { id: "quad-2", url: xr(1, 0, 1), bounds: [0, 3072, 4096, 6144] },
    { id: "quad-3", url: xr(1, 1, 1), bounds: [4096, 3072, 8192, 6144] }
  ];
}
function Nx(e) {
  return {
    id: "docs-playground",
    name: "Open Plant Docs Playground",
    width: Na,
    height: Da,
    tileSize: vt,
    zoom: ap,
    path: "/demo-slide",
    mpp: cp,
    classes: e
  };
}
function Ux(e) {
  let t = 1 / 0, n = 1 / 0, r = -1 / 0, i = -1 / 0;
  const o = (s) => {
    if (!(!Array.isArray(s) || s.length === 0)) {
      if (typeof s[0] == "number" && typeof s[1] == "number") {
        const l = Number(s[0]), u = Number(s[1]);
        if (!Number.isFinite(l) || !Number.isFinite(u)) return;
        t = Math.min(t, l), n = Math.min(n, u), r = Math.max(r, l), i = Math.max(i, u);
        return;
      }
      for (const l of s) o(l);
    }
  };
  return o(e.coordinates), Number.isFinite(t) ? [t, n, r, i] : [0, 0, 0, 0];
}
function Dx() {
  const e = Ax(), t = xm(e), n = /* @__PURE__ */ new Map();
  t.classToPaletteIndex.forEach((u, a) => {
    n.set(u, a);
  });
  const { pointData: r, heatmapData: i } = kx(t.classToPaletteIndex), o = Ix(), s = bx();
  return {
    source: _x(),
    classes: e,
    palette: t.colors,
    paletteIndexToClassId: n,
    pointData: r,
    heatmapData: i,
    initialRegions: o,
    initialPatchRegions: s,
    overlayShapes: Lx(),
    tiles: Fx(),
    rawImagePayload: Nx(e),
    sampleWkt: "POLYGON ((960 920, 2640 920, 2640 2440, 960 2440, 960 920))",
    queryCoordinate: [1860, 1580],
    sampleBounds: [960, 920, 2640, 2440],
    schedulerTile: {
      key: "docs-playground/3/2/1",
      tier: 3,
      x: 2,
      y: 1,
      bounds: [2048, 1024, 3072, 2048],
      distance2: 0,
      url: xr(3, 2, 1)
    }
  };
}
console.error("[open-plant/examples] bundle boot");
window.OPEN_PLANT_DOCS_EXAMPLES = {
  api: Px,
  createDemoDataset: Dx,
  version: "1.4.10"
};
const Pu = Array.from(
  document.querySelectorAll("[data-open-plant-inline-demo]")
);
console.error("[open-plant/examples] placeholders found", {
  count: Pu.length,
  stackblitzSdkLoaded: !!window.StackBlitzSDK,
  demos: Pu.map((e) => e.dataset.openPlantInlineDemo || "")
});
import("./examples-playground-inline-demos-BRHoFDTs.js").then(({ InlineExamplesDemo: e }) => {
  console.error("[open-plant/examples] inline-demos module loaded"), Pu.forEach((t) => {
    const n = t.dataset.openPlantInlineDemo || "", r = t.dataset.openPlantInlineLang === "ko" ? "ko" : "en";
    console.error("[open-plant/examples] mounting demo", { demo: n, lang: r });
    try {
      gl.createRoot(t).render(
        /* @__PURE__ */ At.jsx(e, { lang: r, demo: n })
      );
    } catch (i) {
      console.error("[open-plant/examples] mount failed", { demo: n, lang: r, error: i });
    }
  });
}).catch((e) => {
  console.error("[open-plant/examples] failed to load inline-demos module", e);
});
export {
  Ea as a,
  wy as b,
  Dx as c,
  U as d,
  yx as e,
  $v as f,
  Ux as g,
  tp as h,
  Dv as i,
  At as j,
  Li as k,
  ep as l,
  jm as m,
  Jm as n,
  zv as o,
  Rx as p,
  Km as q,
  S as r,
  Sv as s,
  Ur as t,
  wv as u,
  La as v,
  xy as w,
  Lm as x
};
