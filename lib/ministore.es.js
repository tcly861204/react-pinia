var __defProp = Object.defineProperty;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __publicField = (obj, key, value) => {
  __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
  return value;
};
import require$$0, { useRef, useState, useCallback, createContext, useContext, useEffect } from "react";
function depsAreSame(oldDeps, deps) {
  if (oldDeps === deps)
    return true;
  for (var i = 0; i < oldDeps.length; i++) {
    if (!Object.is(oldDeps[i], deps[i]))
      return false;
  }
  return true;
}
function useCreation(factory, deps) {
  var current = useRef({
    deps,
    obj: void 0,
    initialized: false
  }).current;
  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps;
    current.obj = factory();
    current.initialized = true;
  }
  return current.obj;
}
var __read = globalThis && globalThis.__read || function(o, n2) {
  var m2 = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m2)
    return o;
  var i = m2.call(o), r, ar = [], e;
  try {
    while ((n2 === void 0 || n2-- > 0) && !(r = i.next()).done) {
      ar.push(r.value);
    }
  } catch (error) {
    e = {
      error
    };
  } finally {
    try {
      if (r && !r.done && (m2 = i["return"]))
        m2.call(i);
    } finally {
      if (e)
        throw e.error;
    }
  }
  return ar;
};
var useUpdate = function useUpdate2() {
  var _a = __read(useState({}), 2), setState = _a[1];
  return useCallback(function() {
    return setState({});
  }, []);
};
var useUpdate$1 = useUpdate;
const isObject = (value) => value !== null && typeof value === "object";
class Event {
  constructor() {
    __publicField(this, "events");
    this.events = {};
  }
  on(type, callback) {
    (this.events[type] || (this.events[type] = [])).push({ listener: callback });
  }
  emit(type, args) {
    this.events[type].forEach((element) => {
      element.listener(args);
      if (type === "once") {
        this.off(type, element.listener);
      }
    });
  }
  once(type, listener) {
    this.events[type] = this.events[type] || [];
    this.events[type].push({ listener, once: true });
  }
  off(type, callback) {
    if (this.events[type]) {
      this.events[type] = this.events[type].filter((item) => item.listener !== callback);
    }
  }
}
var jsxRuntime = { exports: {} };
var reactJsxRuntime_production_min = {};
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;
function toObject(val) {
  if (val === null || val === void 0) {
    throw new TypeError("Object.assign cannot be called with null or undefined");
  }
  return Object(val);
}
function shouldUseNative() {
  try {
    if (!Object.assign) {
      return false;
    }
    var test1 = new String("abc");
    test1[5] = "de";
    if (Object.getOwnPropertyNames(test1)[0] === "5") {
      return false;
    }
    var test2 = {};
    for (var i = 0; i < 10; i++) {
      test2["_" + String.fromCharCode(i)] = i;
    }
    var order2 = Object.getOwnPropertyNames(test2).map(function(n2) {
      return test2[n2];
    });
    if (order2.join("") !== "0123456789") {
      return false;
    }
    var test3 = {};
    "abcdefghijklmnopqrst".split("").forEach(function(letter) {
      test3[letter] = letter;
    });
    if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
      return false;
    }
    return true;
  } catch (err) {
    return false;
  }
}
shouldUseNative() ? Object.assign : function(target, source) {
  var from;
  var to = toObject(target);
  var symbols;
  for (var s = 1; s < arguments.length; s++) {
    from = Object(arguments[s]);
    for (var key in from) {
      if (hasOwnProperty.call(from, key)) {
        to[key] = from[key];
      }
    }
    if (getOwnPropertySymbols) {
      symbols = getOwnPropertySymbols(from);
      for (var i = 0; i < symbols.length; i++) {
        if (propIsEnumerable.call(from, symbols[i])) {
          to[symbols[i]] = from[symbols[i]];
        }
      }
    }
  }
  return to;
};
/** @license React v17.0.2
 * react-jsx-runtime.production.min.js
 *
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
var f = require$$0, g = 60103;
reactJsxRuntime_production_min.Fragment = 60107;
if ("function" === typeof Symbol && Symbol.for) {
  var h = Symbol.for;
  g = h("react.element");
  reactJsxRuntime_production_min.Fragment = h("react.fragment");
}
var m = f.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED.ReactCurrentOwner, n = Object.prototype.hasOwnProperty, p = { key: true, ref: true, __self: true, __source: true };
function q(c, a, k) {
  var b, d = {}, e = null, l = null;
  void 0 !== k && (e = "" + k);
  void 0 !== a.key && (e = "" + a.key);
  void 0 !== a.ref && (l = a.ref);
  for (b in a)
    n.call(a, b) && !p.hasOwnProperty(b) && (d[b] = a[b]);
  if (c && c.defaultProps)
    for (b in a = c.defaultProps, a)
      void 0 === d[b] && (d[b] = a[b]);
  return { $$typeof: g, type: c, key: e, ref: l, props: d, _owner: m.current };
}
reactJsxRuntime_production_min.jsx = q;
reactJsxRuntime_production_min.jsxs = q;
{
  jsxRuntime.exports = reactJsxRuntime_production_min;
}
const jsx = jsxRuntime.exports.jsx;
const Context = createContext({});
const evt = new Event();
const proxyMap = /* @__PURE__ */ new WeakMap();
const rawMap = /* @__PURE__ */ new WeakMap();
function observer(storeKey, initialVal, cb) {
  const existingProxy = proxyMap.get(initialVal);
  if (existingProxy) {
    return existingProxy;
  }
  if (rawMap.has(initialVal)) {
    return initialVal;
  }
  const proxy = new Proxy(initialVal, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver);
      return isObject(res) ? observer(storeKey, res, cb) : Reflect.get(target, key);
    },
    set(target, key, val) {
      const ret = Reflect.set(target, key, val);
      cb(storeKey);
      return ret;
    },
    deleteProperty(target, key) {
      const ret = Reflect.deleteProperty(target, key);
      cb(storeKey);
      return ret;
    }
  });
  proxyMap.set(initialVal, proxy);
  rawMap.set(proxy, initialVal);
  return proxy;
}
const Provider = ({
  store,
  children
}) => {
  const update = useUpdate$1();
  const stateRef = useRef(store);
  const state = useCreation(() => {
    const callback = (key) => {
      update();
      evt.emit("update", {
        key
      });
    };
    Object.keys(stateRef.current).map((key) => {
      stateRef.current[key] = observer(key, stateRef.current[key], callback);
    });
    return stateRef.current;
  }, []);
  return /* @__PURE__ */ jsx(Context.Provider, {
    value: state,
    children
  });
};
const createStore = (storeKey) => {
  const update = useUpdate$1();
  const store = useContext(Context);
  useEffect(() => {
    if (storeKey) {
      evt.once("update", ({
        key
      }) => {
        if (storeKey === key) {
          update();
        }
      });
    } else {
      evt.once("update", update);
    }
    return () => {
      evt.off("update", update);
    };
  }, []);
  return store;
};
export { Provider, createStore };
