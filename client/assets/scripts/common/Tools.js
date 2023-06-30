import {
    stringify
} from "querystring";

// const PlatformType = require('PlatformEnum').PlatformType;
// const OUT_VIEW_POS = cc.vec2(99999,99999);

var getTime = null;
let WX_GAME_ENV = false;
let QQ_GAME_ENV = false;
let WX_GAME_DEVTOOLS = false;
var POINT_EPSILON = parseFloat('1.192092896e-07F');
const OUT_OF_VIEW_POS = cc.v2(10000, 10000);

// Array.prototype.getItemOrFinalItem = function (index) {
//     if (index < this.length) {
//         return this[index];
//     } else {
//         return this[this.length - 1];
//     }
// }

// Array.prototype.getItemById = function (id) {
//     for (const item of this) {
//         if (item.id === id) {
//             return item;
//         }
//     }
// }



const Tools = cc.Class({
    statics: {
        // platformType: PlatformType,
        systemInfo: null,
        isH5: false,

        init: function (platformType, systemInfo) {
            if (cc.sys.platform === cc.sys.WECHAT_GAME) {
                getTime = null;
                WX_GAME_ENV = true;
                if (systemInfo) {
                    Tools.systemInfo = systemInfo;
                    WX_GAME_DEVTOOLS = Tools.systemInfo.platform == "devtools";
                }
            } else if (cc.sys.platform === cc.sys.QQ_PLAY) {
                QQ_GAME_ENV = true;
            }
        },
        // init: function (platformType, systemInfo) {
        //     Tools.platformType = platformType;
        //     if (Tools.platformType == PlatformType.WECHAT) {
        //         getTime = null;
        //         WX_GAME_ENV = true;
        //         if (systemInfo) {
        //             Tools.systemInfo = systemInfo;
        //             WX_GAME_DEVTOOLS = Tools.systemInfo.platform == "devtools";
        //         }
        //     } else if (Tools.platformType == PlatformType.QQ) {
        //         QQ_GAME_ENV = true;
        //     }

        //     // 华为内置浏览器不支持fill函数
        //     if (!Array.prototype.fill) {
        //         Object.defineProperty(Array.prototype, 'fill', {
        //             value: function (value) {

        //                 // Steps 1-2.
        //                 if (this == null) {
        //                     throw new TypeError('this is null or not defined');
        //                 }

        //                 var O = Object(this);

        //                 // Steps 3-5.
        //                 var len = O.length >>> 0;

        //                 // Steps 6-7.
        //                 var start = arguments[1];
        //                 var relativeStart = start >> 0;

        //                 // Step 8.
        //                 var k = relativeStart < 0 ?
        //                     Math.max(len + relativeStart, 0) :
        //                     Math.min(relativeStart, len);

        //                 // Steps 9-10.
        //                 var end = arguments[2];
        //                 var relativeEnd = end === undefined ?
        //                     len : end >> 0;

        //                 // Step 11.
        //                 var final = relativeEnd < 0 ?
        //                     Math.max(len + relativeEnd, 0) :
        //                     Math.min(relativeEnd, len);

        //                 // Step 12.
        //                 while (k < final) {
        //                     O[k] = value;
        //                     k++;
        //                 }

        //                 // Step 13.
        //                 return O;
        //             }
        //         });
        //     }
        // },

        cleanUp: function (obj) {
            if (obj) {
                if (obj.node) {
                    if (cc.game.isPersistRootNode(obj.node)) {
                        cc.game.removePersistRootNode(obj.node);
                    }
                    obj.node.destroy();
                }
            }
        },

        setNodeVisible: function (node, visible) { //, log) {

            if (node) {
                node._customInvisibleFlag = !visible;
                // node.active = visible ? true : false;
                // node.active = visible ? true : false;
                // node.group = visible ? 'default' : 'invisible';
                // if (log !== false) {
                //     cc.warn('setNodeVisible, node:' + node.name + ' visible:' + visible);
                // }

                /** sgNode */
                // if (node._sgNode && node._sgNode.visible !== visible) {
                //     node._sgNode.visible = visible;
                // }
                // var children = node.children;
                // if (children && children.length > 0) {
                //     for (let index = 0; index < children.length; index++) {
                //         const child = children[index];
                //         Tools.setNodeVisible(child, visible);
                //     }
                // }

                /** opacity */


                /** transform */
                // node.position = visible ? cc.Vec2.ZERO : cc.v2(99999,99999);
            }
        },

        setNodeColor: function (node, color) {
            if (node) {
                node.color = color;
                const particleSystem = node.getComponent(cc.ParticleSystem);
                if (particleSystem) {
                    particleSystem.startColor = color;
                    particleSystem.endColor = color;
                }

                var children = node.children;
                if (children && children.length > 0) {
                    for (let index = 0; index < children.length; index++) {
                        const child = children[index];
                        Tools.setNodeColor(child, color);
                    }
                }
            }
        },

        setNodeOpacity: function (node, opacity) {
            if (node) node.opacity = opacity;
        },

        isNodeVisible: function (node) {
            return node && node.opacity > 0 && node._customInvisibleFlag !== true;
        },

        getNodeToCameraPoint(node, position, camera) {
            var worldPos = (node && node.parent) ? node.parent.convertToWorldSpaceAR(position) : position;
            var point = camera.getWorldToCameraPoint(worldPos);
            return point;
        },

        isEmptyObject: function (obj) {
            return obj !== null && Object.keys(obj).length === 0 && obj.constructor === Object;
        },

        getUuid: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0,
                    v = c == 'x' ? r : (r & 0x3 | 0x8);
                if(v){
                    console.error("Tool.getUuid empty")
                    return ""
                }
                return v.toString(16);
            });
        },

        getMd5Url: function (url) {
            if (cc.loader.md5Pipe) {
                url = cc.loader.md5Pipe.transformURL(url);
            }
            return url;
        },

        getRawUrl: function (resUrl) {
            var url = cc.url.raw(resUrl);
            return Tools.getMd5Url(url);
        },

        getRemoteRawUrl: function (resUrl) {
            if (!resUrl) {
                return '';
            }
            var str = '';
            if (Tools.isH5) {
                str = Tools.getUrlWithoutQueryString();
                str = str.substring(0, str.lastIndexOf('/') + 1);
                str += Tools.getRawUrl(resUrl);
            } else if (QQ_GAME_ENV) {
                str = qqPlayDownloader.REMOTE_SERVER_ROOT + '/' + Tools.getRawUrl(resUrl);
            } else if (WX_GAME_ENV) {
                str = wxDownloader.REMOTE_SERVER_ROOT + '/' + Tools.getRawUrl(resUrl);
            }
            // console.log('getRemoteRawUrl:' + str);
            return str;
        },

        /**
         * 获取构造函数
         * @param  {String|Function} typeOrClassName
         * @returns  {Function} 构造函数
         */
        getConstructor: function (typeOrClassName) {
            if (!typeOrClassName) {
                cc.errorID(3804);
                return null;
            }
            if (typeof typeOrClassName === 'string') {
                return cc.js.getClassByName(typeOrClassName);
            }

            return typeOrClassName;
        },

        getOrAddComponent: function (node, comp) {
            if (node && comp) {
                var ret = node.getComponent(comp);
                if (!ret) {
                    ret = node.addComponent(comp);
                }
                return ret;
            } else {
                return null;
            }
        },

        getMilliTime: function () {
            if (getTime === null) {
                if (window.performance.now) {
                    if (CC_DEBUG) {
                        cc.log("Using high performance timer");
                    }
                    if (WX_GAME_ENV) {
                        if (WX_GAME_DEVTOOLS) {
                            getTime = function () {
                                return wx.getPerformance().now();
                            }
                        } else {
                            getTime = function () {
                                return wx.getPerformance().now() / 1000;
                            }
                        }
                    } else {
                        getTime = function () {
                            return window.performance.now();
                        }
                    }
                } else {
                    if (window.performance.webkitNow) {
                        if (CC_DEBUG) {
                            cc.log("Using webkit high performance timer");
                        }
                        getTime = function () {
                            return window.performance.webkitNow();
                        };
                    } else {
                        if (CC_DEBUG) {
                            cc.log("Using low performance timer");
                        }
                        getTime = function () {
                            return new Date().getTime();
                        };
                    }
                }
            }
            return getTime();
        },

        /**
         * 获取当前时间戳，单位毫秒
         * @returns  {number} 时间戳，单位毫秒
         */
        getTimestampMS: function () {
            return Math.floor(Date.now());
        },

        /**
         * 获取当前时间戳，单位秒
         * @returns  {number} 时间戳，单位秒
         */
        getTimestampS: function () {
            return Math.floor(Tools.getTimestampMS() / 1000);
        },

        /**
         * 获取最近的已过去的某个时刻的时间戳，主要用于每周数据清除
         * 例如排行榜每周一零点清除，需要获取周一零点的时间戳进行比较
         * @param  {number} _day 星期中的第几天(0-6,0为星期天)
         * @param  {number} _hours 小时(0-23)
         * @param  {Date} date=null Date对象,主要用于单元测试
         */
        getNearestPastWeeklyTimestamp: function (_day, _hours, date = null) {
            if (date == null) {
                date = new Date();
            } else {
                date = new Date(date);
            }
            // console.log('getWeeklyTimestamp _day:' + _day + ' _hours:' + _hours + ' date:' + date);

            var day = date.getDay();
            var hours = date.getHours();
            var minutes = date.getMinutes();
            var seconds = date.getSeconds();
            var milliseconds = date.getMilliseconds();
            var diffMilliseconds = 0;
            // console.log('day:' + day + ' hours:' + hours + ' minutes:' + minutes + ' seconds:' + seconds + ' ms:' + milliseconds);
            if (day > _day || (day === _day && hours >= _hours)) {
                diffMilliseconds = milliseconds + (seconds + minutes * 60 + (hours - _hours) * 60 * 60 + (day - _day) * 24 * 60 * 60) * 1000;
            } else {
                var tmpMilliseconds = milliseconds + (seconds + minutes * 60 + hours * 60 * 60 + day * 24 * 60 * 60) * 1000;
                diffMilliseconds = tmpMilliseconds - _hours * 60 * 60 * 1000;
                if (day !== _day) {
                    diffMilliseconds -= (_day - day) * 24 * 60 * 60 * 1000;
                }
                diffMilliseconds += 6 * 24 * 60 * 60 * 1000;
            }

            var time = date.getTime();
            time -= diffMilliseconds;
            // var retDate = new Date(time);
            // console.log(retDate);
            return time;
        },

        isBetweenRange(count, arr) {
            return count >= arr[0] && count <= arr[1];
        },

        /**
         * 获取范围内随机整数
         * @param  {number} min 最小值，结果包含该值
         * @param  {number} max 最大值，结果不包含该值
         * @returns  {number} 随机整数
         */
        getRandomInt: function (min, max) {
            min = Math.ceil(min);
            max = Math.floor(max);
            return Math.floor(Math.random() * (max - min)) + min; //The maximum is exclusive and the minimum is inclusive
        },

        /**
         * 获取范围内随机整数
         * @param  {float} min 最小值，结果包含该值
         * @param  {float} max 最大值，结果不包含该值
         * @returns  {float} 随机整数
         */
        getRandomFloat: function (min, max) {
            return Math.random() * (max - min) + min; //The maximum is exclusive and the minimum is inclusive
        },

        /**
         * 获取随机bool值
         */
        getRandomBool: function () {
            return Tools.getRandomInt(0, 100) % 2 === 0;
        },

        /**
         * 获取数组随机索引
         * @param  {Array} array
         * @returns  {number} 随机索引
         */
        getRandomIndex: function (array) {
            return Tools.getRandomInt(0, array.length);
        },

        /**
         * 获取数组随机元素
         * @param  {Array} array
         * @returns  {any} 随机元素
         */
        getRandomItem: function (array) {
            if (array && array.length > 0) {
                return array[Tools.getRandomIndex(array)];
            } else {
                return null;
            }
        },


        /**
         * 获取数组元素,如果获取不到就获取最后一个元素
         * @param  {Array} array
         * @returns  {any} 元素
         */
        getItemOrFinalItem: function (array, index) {
            if (array[index]) {
                return array[index]
            } else {
                return array[array.length - 1]
            }
        },

        getItemById: function (array, id) {
            // if (array[id]) {
            //     return array[id];
            // }
            for (const item of array) {
                if (item.id === id) {
                    return item;
                }
            }
        },

        compareVec2: function (v1, v2, threshold = 0.01) {
            return v1.sub(v2).magSqr() < threshold;
        },

        compareVec2Float: function (v1, v2) {
            return v1.x == v2.x && v1.y == v2.y;
        },

        isFloatEqual: function (f1, f2) {
            return Math.abs(f1 - f2) < 0.01;
        },

        inverseLerp: function (a, b, value) {
            if (a !== b) {
                var ret = (value - a) / (b - a);
                return ret;
            } else {
                return 1;
            }
        },

        setAccDivFunc: function () {
            Number.prototype.div = function (arg) {
                return Tools.accDiv(this, arg);
            };
        },

        accDiv: function (arg1, arg2) {
            var t1 = 0,
                t2 = 0,
                r1, r2;
            try {
                t1 = arg1.toString().split(".")[1].length;
            } catch (e) {}
            try {
                t2 = arg2.toString().split(".")[1].length;
            } catch (e) {}

            r1 = Number(arg1.toString().replace(".", ""));
            r2 = Number(arg2.toString().replace(".", ""));
            return (r1 / r2) * Math.pow(10, t2 - t1);

        },

        /**
         * 平滑阻尼，搬自unity的Mathf.SmoothDamp，返回实际值与修改后的当前速率的数组
         * @param  {number} current 当前值
         * @param  {number} target 目标值
         * @param  {number} currentVelocity 当前速率，速率修改后返回
         * @param  {number} smoothTime 平滑时间
         * @param  {number} maxSpeed 最大速率
         * @param  {number} deltaTime 时间间隔
         */
        smoothDamp: function (current, target, currentVelocity, smoothTime, maxSpeed, deltaTime) {
            smoothTime = Math.max(0.0001, smoothTime);
            var num = 2 / smoothTime;
            var num2 = num * deltaTime;
            var num3 = 1 / (1 + num2 + 0.48 * num2 * num2 + 0.235 * num2 * num2 * num2);
            var num4 = current - target;
            var num5 = target;
            var num6 = maxSpeed * smoothTime;
            num4 = Tools.clamp(num4, -num6, num6);
            target = current - num4;
            var num7 = (currentVelocity + num * num4) * deltaTime;
            currentVelocity = (currentVelocity - num * num7) * num3;
            var num8 = target + (num4 + num7) * num3;
            if (num5 - current > 0 == num8 > num5) {
                num8 = num5;
                currentVelocity = (num8 - num5) / deltaTime;
            }
            return [num8, currentVelocity];
        },

        /**
         * 拆分string为数值数组
         * @param  {string} str
         * @param  {string} char
         */
        splitToNumList: function (str, char = ',') {
            const strs = str.split(char);
            const nums = [];
            for (var i = 0; i < strs.length; i++) {
                if (strs[i].length > 0) {
                    nums.push(Number(strs[i]));
                }
            }
            return nums;
        },

        getVec2MagSqr: function (vec2) {
            return vec2.x * vec2.x + vec2.y * vec2.y;
        },

        getStrLength: function (str) {
            var realLength = 0,
                len = str.length,
                charCode = -1;
            for (var i = 0; i < len; i++) {
                charCode = str.charCodeAt(i);
                if (charCode >= 0 && charCode <= 128) realLength += 1;
                else realLength += 2;
            }
            return realLength;
        },

        subStrByCharacter: function (str, length) {
            // var len = this.getStrLength(str);
            var index = 0;
            var codeCount = 0;
            var charCode = -1;
            // if (len > length) {
            for (var i = 0; i < str.length; i++) {
                charCode = str.charCodeAt(i);
                if (charCode >= 0 && charCode <= 128) {
                    codeCount += 1;
                } else {
                    codeCount += 2;
                }
                if (codeCount > length) {
                    break;
                }
                index += 1;
            }
            // }
            return str.substring(0, index);
        },

        getUrlWithoutQueryString: function () {
            const url = [location.protocol, '//', location.host, location.pathname].join('');
            return url;
        },

        getQueryString: function (name, url) {
            if (!url) url = location.href;
            name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
            var regexS = "[\\?&]" + name + "=([^&#]*)";
            var regex = new RegExp(regexS);
            var results = regex.exec(url);
            return results == null ? null : results[1];
        },

        webCopyString: function (str) {
            var input = str;
            const el = document.createElement('textarea');
            el.value = input;
            el.setAttribute('readonly', '');
            el.style.contain = 'strict';
            el.style.position = 'absolute';
            el.style.left = '-9999px';
            el.style.fontSize = '12pt'; // Prevent zooming on iOS

            const selection = getSelection();
            var originalRange = false;
            if (selection.rangeCount > 0) {
                originalRange = selection.getRangeAt(0);
            }
            document.body.appendChild(el);
            el.select();
            el.selectionStart = 0;
            el.selectionEnd = input.length;

            var success = false;
            try {
                success = document.execCommand('copy');
            } catch (err) {}

            document.body.removeChild(el);

            if (originalRange) {
                selection.removeAllRanges();
                selection.addRange(originalRange);
            }

            return success;
        },

        getMd5: function (s) {
            function L(k, d) {
                return (k << d) | (k >>> (32 - d))
            }

            function K(G, k) {
                var I, d, F, H, x;
                F = (G & 2147483648);
                H = (k & 2147483648);
                I = (G & 1073741824);
                d = (k & 1073741824);
                x = (G & 1073741823) + (k & 1073741823);
                if (I & d) {
                    return (x ^ 2147483648 ^ F ^ H)
                }
                if (I | d) {
                    if (x & 1073741824) {
                        return (x ^ 3221225472 ^ F ^ H)
                    } else {
                        return (x ^ 1073741824 ^ F ^ H)
                    }
                } else {
                    return (x ^ F ^ H)
                }
            }

            function r(d, F, k) {
                return (d & F) | ((~d) & k)
            }

            function q(d, F, k) {
                return (d & k) | (F & (~k))
            }

            function p(d, F, k) {
                return (d ^ F ^ k)
            }

            function n(d, F, k) {
                return (F ^ (d | (~k)))
            }

            function u(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(r(F, aa, Z), k), I));
                return K(L(G, H), F)
            }

            function f(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(q(F, aa, Z), k), I));
                return K(L(G, H), F)
            }

            function D(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(p(F, aa, Z), k), I));
                return K(L(G, H), F)
            }

            function t(G, F, aa, Z, k, H, I) {
                G = K(G, K(K(n(F, aa, Z), k), I));
                return K(L(G, H), F)
            }

            function e(G) {
                var Z;
                var F = G.length;
                var x = F + 8;
                var k = (x - (x % 64)) / 64;
                var I = (k + 1) * 16;
                var aa = Array(I - 1);
                var d = 0;
                var H = 0;
                while (H < F) {
                    Z = (H - (H % 4)) / 4;
                    d = (H % 4) * 8;
                    aa[Z] = (aa[Z] | (G.charCodeAt(H) << d));
                    H++
                }
                Z = (H - (H % 4)) / 4;
                d = (H % 4) * 8;
                aa[Z] = aa[Z] | (128 << d);
                aa[I - 2] = F << 3;
                aa[I - 1] = F >>> 29;
                return aa
            }

            function B(x) {
                var k = "",
                    F = "",
                    G, d;
                for (d = 0; d <= 3; d++) {
                    G = (x >>> (d * 8)) & 255;
                    F = "0" + G.toString(16);
                    k = k + F.substr(F.length - 2, 2)
                }
                return k
            }

            function J(k) {
                k = k.replace(/rn/g, "n");
                var d = "";
                for (var F = 0; F < k.length; F++) {
                    var x = k.charCodeAt(F);
                    if (x < 128) {
                        d += String.fromCharCode(x)
                    } else {
                        if ((x > 127) && (x < 2048)) {
                            d += String.fromCharCode((x >> 6) | 192);
                            d += String.fromCharCode((x & 63) | 128)
                        } else {
                            d += String.fromCharCode((x >> 12) | 224);
                            d += String.fromCharCode(((x >> 6) & 63) | 128);
                            d += String.fromCharCode((x & 63) | 128)
                        }
                    }
                }
                return d
            }
            var C = Array();
            var P, h, E, v, g, Y, X, W, V;
            var S = 7,
                Q = 12,
                N = 17,
                M = 22;
            var A = 5,
                z = 9,
                y = 14,
                w = 20;
            var o = 4,
                m = 11,
                l = 16,
                j = 23;
            var U = 6,
                T = 10,
                R = 15,
                O = 21;
            s = J(s);
            C = e(s);
            Y = 1732584193;
            X = 4023233417;
            W = 2562383102;
            V = 271733878;
            for (P = 0; P < C.length; P += 16) {
                h = Y;
                E = X;
                v = W;
                g = V;
                Y = u(Y, X, W, V, C[P + 0], S, 3614090360);
                V = u(V, Y, X, W, C[P + 1], Q, 3905402710);
                W = u(W, V, Y, X, C[P + 2], N, 606105819);
                X = u(X, W, V, Y, C[P + 3], M, 3250441966);
                Y = u(Y, X, W, V, C[P + 4], S, 4118548399);
                V = u(V, Y, X, W, C[P + 5], Q, 1200080426);
                W = u(W, V, Y, X, C[P + 6], N, 2821735955);
                X = u(X, W, V, Y, C[P + 7], M, 4249261313);
                Y = u(Y, X, W, V, C[P + 8], S, 1770035416);
                V = u(V, Y, X, W, C[P + 9], Q, 2336552879);
                W = u(W, V, Y, X, C[P + 10], N, 4294925233);
                X = u(X, W, V, Y, C[P + 11], M, 2304563134);
                Y = u(Y, X, W, V, C[P + 12], S, 1804603682);
                V = u(V, Y, X, W, C[P + 13], Q, 4254626195);
                W = u(W, V, Y, X, C[P + 14], N, 2792965006);
                X = u(X, W, V, Y, C[P + 15], M, 1236535329);
                Y = f(Y, X, W, V, C[P + 1], A, 4129170786);
                V = f(V, Y, X, W, C[P + 6], z, 3225465664);
                W = f(W, V, Y, X, C[P + 11], y, 643717713);
                X = f(X, W, V, Y, C[P + 0], w, 3921069994);
                Y = f(Y, X, W, V, C[P + 5], A, 3593408605);
                V = f(V, Y, X, W, C[P + 10], z, 38016083);
                W = f(W, V, Y, X, C[P + 15], y, 3634488961);
                X = f(X, W, V, Y, C[P + 4], w, 3889429448);
                Y = f(Y, X, W, V, C[P + 9], A, 568446438);
                V = f(V, Y, X, W, C[P + 14], z, 3275163606);
                W = f(W, V, Y, X, C[P + 3], y, 4107603335);
                X = f(X, W, V, Y, C[P + 8], w, 1163531501);
                Y = f(Y, X, W, V, C[P + 13], A, 2850285829);
                V = f(V, Y, X, W, C[P + 2], z, 4243563512);
                W = f(W, V, Y, X, C[P + 7], y, 1735328473);
                X = f(X, W, V, Y, C[P + 12], w, 2368359562);
                Y = D(Y, X, W, V, C[P + 5], o, 4294588738);
                V = D(V, Y, X, W, C[P + 8], m, 2272392833);
                W = D(W, V, Y, X, C[P + 11], l, 1839030562);
                X = D(X, W, V, Y, C[P + 14], j, 4259657740);
                Y = D(Y, X, W, V, C[P + 1], o, 2763975236);
                V = D(V, Y, X, W, C[P + 4], m, 1272893353);
                W = D(W, V, Y, X, C[P + 7], l, 4139469664);
                X = D(X, W, V, Y, C[P + 10], j, 3200236656);
                Y = D(Y, X, W, V, C[P + 13], o, 681279174);
                V = D(V, Y, X, W, C[P + 0], m, 3936430074);
                W = D(W, V, Y, X, C[P + 3], l, 3572445317);
                X = D(X, W, V, Y, C[P + 6], j, 76029189);
                Y = D(Y, X, W, V, C[P + 9], o, 3654602809);
                V = D(V, Y, X, W, C[P + 12], m, 3873151461);
                W = D(W, V, Y, X, C[P + 15], l, 530742520);
                X = D(X, W, V, Y, C[P + 2], j, 3299628645);
                Y = t(Y, X, W, V, C[P + 0], U, 4096336452);
                V = t(V, Y, X, W, C[P + 7], T, 1126891415);
                W = t(W, V, Y, X, C[P + 14], R, 2878612391);
                X = t(X, W, V, Y, C[P + 5], O, 4237533241);
                Y = t(Y, X, W, V, C[P + 12], U, 1700485571);
                V = t(V, Y, X, W, C[P + 3], T, 2399980690);
                W = t(W, V, Y, X, C[P + 10], R, 4293915773);
                X = t(X, W, V, Y, C[P + 1], O, 2240044497);
                Y = t(Y, X, W, V, C[P + 8], U, 1873313359);
                V = t(V, Y, X, W, C[P + 15], T, 4264355552);
                W = t(W, V, Y, X, C[P + 6], R, 2734768916);
                X = t(X, W, V, Y, C[P + 13], O, 1309151649);
                Y = t(Y, X, W, V, C[P + 4], U, 4149444226);
                V = t(V, Y, X, W, C[P + 11], T, 3174756917);
                W = t(W, V, Y, X, C[P + 2], R, 718787259);
                X = t(X, W, V, Y, C[P + 9], O, 3951481745);
                Y = K(Y, h);
                X = K(X, E);
                W = K(W, v);
                V = K(V, g)
            }
            var i = B(Y) + B(X) + B(W) + B(V);
            return i.toLowerCase()
        },

        // #region 地图坐标与世界坐标转化
        // getTiledObjWorldPos: function(obj, tiledMap) {
        //     var pos = cc.v2(obj._properties.x, obj._properties.y).add(tiledMap.node.position);
        //     pos = cc.v2(pos.x, -pos.y)
        //     return pos;
        // },

        // changeWorldPosToTilePos: function(pos, tiledMap) {
        //     var _pos = cc.v2(pos.x, -pos.y);
        //     _pos = _pos.sub(tiledMap.node.position);
        //     return _pos;
        // },
        //#endregion

        /**
         * @param  {number} min clamp的最小值
         * @param  {number} max clamp的最大值
         * @param  {number} n 实际值
         */
        clamp: function (min, max, n) {
            return Math.max(min, Math.min(max, n))
        },

        isOutOfScreen: function (pos) {
            var size = cc.winSize;
            return Math.abs(pos.x) > size.width / 2 || Math.abs(pos.y) > size.height / 2;
        },

        isStringInteger: function (str) {
            return /^\+?(0|[1-9]\d*)$/.test(str);
        },

        /**
         * 比较版本字符串
         * @param  {string} a
         * @param  {string} b
         * @returns  {number} 1 if a > b; -1 if a < b; 0 if a == b
         */
        compareVersionStr: function (a, b) {
            if (a === b) {
                return 0;
            }

            var a_components = a.split(".");
            var b_components = b.split(".");

            var len = Math.min(a_components.length, b_components.length);

            // loop while the components are equal
            for (var i = 0; i < len; i++) {
                // A bigger than B
                if (parseInt(a_components[i]) > parseInt(b_components[i])) {
                    return 1;
                }

                // B bigger than A
                if (parseInt(a_components[i]) < parseInt(b_components[i])) {
                    return -1;
                }
            }

            // If one's a prefix of the other, the longer one is greater.
            if (a_components.length > b_components.length) {
                return 1;
            }

            if (a_components.length < b_components.length) {
                return -1;
            }

            // Otherwise they are the same.
            return 0;
        },

        getShowNickName: function (nickName, length = 12) {
            if (Tools.getStrLength(nickName) > length) {
                return Tools.subStrByCharacter(nickName, length) + "...";
            }
            return nickName;
        },

        /**
         * @param {string} str 需格式的字符
         * @returns {Number or Object} 需要替换的信息
         */
        getStringByFormat: function (str, args) {
            var result = str;
            // console.log("参数长度 :" + arguments.length);
            if (arguments.length > 0) {
                if (arguments.length === 2 && typeof (args) == "object") {
                    for (var key in args) {
                        if (args[key] !== undefined) {
                            var reg = new RegExp("({" + key + "})", "g");
                            result = result.replace(reg, args[key]);
                        }
                    }
                } else {
                    for (var i = 1; i < arguments.length; i++) {
                        if (arguments[i] !== undefined) {
                            //var reg = new RegExp("({[" + i + "]})", "g");//这个在索引大于9时会有问题
                            var reg2 = new RegExp("({)" + i + "(})", "g");
                            result = result.replace(reg2, arguments[i]);
                        }
                    }
                }
            }
            return result;

        },

        /**
         * 将代表方向的Vector转换成与UP方向向量(0,1)的弧度
         * @param {cc.Vec2} vector 方向向量
         * @returns {Number} 与UP方向向量的弧度*1000后四舍五入的整数值,范围(0, 6283]
         */
        rotationVectorToInt: function (vector) {
            var ret = 0;
            if (vector) {
                if (this.compareVec2(vector, cc.Vec2.ZERO)) {
                    ret = 0;
                } else {
                    ret = Tools.vec2SignAngle(cc.Vec2.UP, vector);
                    if (ret <= 0.0005) {
                        ret += Math.PI * 2;
                    }
                    ret = Math.round(ret * 1000);
                }
            }
            return ret;
        },

        /**
         * 将与UP方向向量间的弧度值(float弧度值*10后四舍五入的int类型数值)转换成代表方向的Vector
         * @param {Number} 与UP方向向量的弧度*10后四舍五入的整数值,范围(0, 6283]
         * @returns {cc.Vec2} 方向向量
         */
        rotationIntToVector: function (intAngle) {
            if (intAngle === 0) {
                return cc.Vec2.ZERO;
            } else {
                const angle = intAngle / 1000.0;
                return cc.Vec2.UP.rotate(-angle);
            }
        },

        getDigitFactor: function (digit, isDivide) {
            if (digit === null || digit === undefined || digit <= 0) {
                return 1;
            } else if (digit == 1) {
                return isDivide ? 0.1 : 10;
            } else {
                return Math.pow(isDivide ? 0.1 : 10, digit);
            }
        },

        getIntVec2: function (joVec, digit) {
            const ret = cc.v2();
            ret.set(joVec);
            const factor = this.getDigitFactor(digit, true);
            if (factor < 1) {
                ret.mulSelf(factor);
            }
            return ret;
        },

        getFloatParsedByInt: function (intValue, digit) {
            const factor = this.getDigitFactor(digit, true);
            return intValue * factor;
        },

        checkDownKillWeaponType: function (weaponId) {
            if (weaponId >= 0) {
                return 0; //武器
            } else if (weaponId > -1000) {
                return 1; //场景
            } else {
                return 2; //技能
            }
        },

        //获得两个时间戳之间相差的时间
        getTimeCount: function (curTime, endTime) {
            this.timeCount = {};

            const nTime = (endTime - curTime) / 1000;
            this.timeCount.day = Math.floor(nTime / 86400);
            this.timeCount.hour = Math.floor(nTime % 86400 / 3600);
            this.timeCount.minute = Math.floor(nTime % 86400 % 3600 / 60);
            this.timeCount.second = Math.floor(nTime % 86400 % 3600 % 60);
            // cc.log(this.timeCount.hour + 'hour')
            // cc.log(this.timeCount.minute + 'min')
            // cc.log(this.timeCount.second + 'second')
            return this.timeCount;
        },

        /**
         * 得到俩时间戳相差的天数,向上取整
         */
        getDayTimeCount: function (curTime, endTime) {
            let nTime = (endTime - curTime) / 1000;
            let dayCount = Math.ceil(nTime / 86400);
            return dayCount;
        },


        getRealDayTimeCount: function (curTime, endTime) {
            const start = new Date(new Date(new Date(curTime).toLocaleDateString()).getTime());
            const startTime = start.getTime();
            let nTime = (endTime - startTime) / 1000;
            let dayCount = Math.ceil(nTime / 86400);
            return dayCount;
        },
        /**
         * 获取剩余时间普通文本
         */
        getRemainTimeStr: function (curTime, endTime) {
            const timeCount = this.getTimeCount(curTime, endTime);
            return Tools.getNumStr(timeCount.day * 24 + timeCount.hour) + ':' + Tools.getNumStr(timeCount.minute) + ':' + Tools.getNumStr(timeCount.second)
        },

        getNumStr: function (num) {
            return num < 0 ? 0 : (num < 10 ? '0' + num : num);
        },
        /**
         * 获取剩余时间长文本
         */
        getRemainTimeLongStr: function (curTime, endTime) {
            const timeCount = this.getTimeCount(curTime, endTime);
            if (timeCount.day > 0) {
                return timeCount.day + "天" + timeCount.hour + '小时';
            } else if (timeCount.hour > 0) {
                return timeCount.hour + "小时" + timeCount.minute + '分钟';
            } else if (timeCount.minute > 0) {
                return timeCount.minute + "分" + timeCount.second + '秒';
            } else {
                return '0分0秒'
            }
        },

        /**
         * 获取剩余时间短文本
         */
        getRemainTimeShortStr: function (curTime, endTime) {
            const timeCount = this.getTimeCount(curTime, endTime);
            if (timeCount.day > 0) {
                return (timeCount.day + 1) + "天";
            } else if (timeCount.hour > 0) {
                return (timeCount.hour + 1) + "小时";
            } else if (timeCount.minute > 0) {
                return (timeCount.minute + 1) + "分";
            } else if (timeCount.second > 0) {
                return timeCount.second + "秒";
            } else {
                return '0秒'
            }
        },

        /**
         * 时间戳转成时间格式
         */
        timestampToTime: function (timestamp) {
            var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
            var Y = date.getFullYear() + '-';
            var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
            var D = date.getDate();
            return Y + M + D;
        },

        /**
         * 时间戳转成时间格式
         */
         timestampToMD: function (timestamp) {
            var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
            var Y = date.getFullYear() + '-';
            var M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-';
            var D = (date.getDate() + 1 <= 10 ? '0' + (date.getDate()) : date.getDate());
            return M + D;
        },


        timestampToSecond: function (timestamp) {
            var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
            var H = date.getHours() + '-';
            var M = date.getMinutes() + '-';
            var S = date.getSeconds();
            return H + M + S;
        },

        isAfterOtherTime: function (otherTime, curTimeStamp) {
            var endTimeStamp = Tools.getTimeStampByTimeStr(otherTime);
            return curTimeStamp > endTimeStamp;
        },

        isBeforeOtherTime: function (otherTime, curTimeStamp) {
            var endTimeStamp = Tools.getTimeStampByTimeStr(otherTime);
            return curTimeStamp < endTimeStamp;
        },

        isAfterCheckTime: function (curTimeStamp) {
            var date = new Date(curTimeStamp);
            console.log('当前时间', date)
            date.setHours(0);
            date.setMinutes(2);
            date.setSeconds(0);
            console.log('检查点', date)
            var result = this.isAfterOtherTime(date, curTimeStamp);
            console.log('结果', result)
            return result
        },

        isBetweenTwoTime: function (startTime, endTime, curTimeStamp) {
            var startTimeStamp = Tools.getTimeStampByTimeStr(startTime);
            var endTimeStamp = Tools.getTimeStampByTimeStr(endTime);
            // cc.log('startTimeStamp:' + startTimeStamp + "  endTimeStamp:" + endTimeStamp + "  curTimeStamp:" + curTimeStamp);
            return curTimeStamp > startTimeStamp && curTimeStamp < endTimeStamp;
        },

        // isDuringDuanWuFestival: function (curTimeStamp) {
        //     // return true;
        //     return Tools.isBetweenTwoTime('2019-06-07 00:00:00', '2019-06-10 00:00:00', curTimeStamp)
        // },

        // isAfterDuanWuFestival: function (curTimeStamp) {
        //     // return true;
        //     var endTimeStamp = Tools.getTimeStampByTimeStr('2019-06-10 00:00:00');
        //     return curTimeStamp > endTimeStamp;
        // },

        filterDataByTime: function (datas, ownArr, curTimeStamp, gameData, hideSpecialSkin, isIosPlatfrom, isAndroidApp) {
            for (let i = datas.length - 1; i >= 0; i--) {
                let data = datas[i];

                var isBefore_2 = data.startDate_2 && Tools.isBeforeOtherTime(data.startDate_2, curTimeStamp)
                var isAfter_2 = data.endDate_2 && Tools.isAfterOtherTime(data.endDate_2, curTimeStamp)

                if (data.startDate_2 && (!(isBefore_2 || isAfter_2))) {
                    data.getWay = 0;
                    data.introduce = data.introduce_2;
                }

                if (ownArr.indexOf(data.id) === -1) {
                    var isBefore = data.startDate && Tools.isBeforeOtherTime(data.startDate, curTimeStamp)
                    var isAfter = data.endDate && Tools.isAfterOtherTime(data.endDate, curTimeStamp)

                    if ((isBefore || isAfter) && (isBefore_2 || isAfter_2)) {
                        datas.splice(i, 1)
                    } else if ((gameData.isInReview || hideSpecialSkin) && data.isHideInReview) {
                        datas.splice(i, 1)
                    } else if (isIosPlatfrom && data.isHideInIOS) {
                        datas.splice(i, 1)
                    } else if (isAndroidApp && data.isHideInAndroidApp) {
                        datas.splice(i, 1)
                    }
                }
            }
        },

        /**
         * 是不是在所给时间范围之间
         * @param {string} 时间范围字符串
         * @param {number} 时间偏移量
         */
        isBetweenTimeRange: function (ranges, curTime) {
            if (!ranges) return false;
            const strArr = ranges.split(';');
            var rangesArr = [];
            for (const str of strArr) {
                const param = this.splitToNumList(str)
                var range = {};
                range.startHour = param[0];
                range.endHour = param[1];
                if (range.endHour < 0) {
                    range.endHour = 0;
                }
                rangesArr.push(range);
            }
            var date = new Date(curTime);
            var hour = date.getHours();
            for (const range of rangesArr) {
                if (hour >= range.startHour && hour < range.endHour) {
                    return true;
                }
            }
            return false;
        },

        /**
         * 是不是在所给数字范围之间
         * @param {string} 范围字符串:'1,2;3,6;8,10'
         * @param {number} 次数
         */
        isBetweenCountRange: function (ranges, count) {
            if (!ranges) return false;
            const strArr = ranges.split(';');
            var rangesArr = [];
            for (const str of strArr) {
                const param = this.splitToNumList(str)
                var range = {};
                range.min = param[0];
                range.nax = param[1];
                rangesArr.push(range);
            }
            for (const range of rangesArr) {
                if (count >= range.min && count <= range.nax) {
                    return true;
                }
            }
            return false;
        },

        //是否不是同一天，0点跨天，单位毫秒,减60000是为了延迟一分钟刷新
        isDaySpan: function (lastTime, curTime) {
            return Tools.timestampToTime(lastTime) != Tools.timestampToTime(curTime)
        },

        //是否不是同一小时，0点跨天，单位毫秒,减60000是为了延迟一分钟刷新
        isHourSpan: function (lastTime, curTime, configHours) {
            var lastHour = new Date(lastTime).getHours();
            var curHour = new Date(curTime).getHours();
            if (lastHour !== curHour) {
                for (let hour of configHours) {
                    if (lastHour < hour && curHour >= hour) {
                        return true
                    }
                }
            }
            return false;
        },

        //处于配置的小时
        isInConfigHours: function (curTime, configHours) {
            var hour = new Date(curTime).getHours();
            return this.arrContains(configHours, hour);
        },

        // 通过配置时间，比如2018-10-08 03:00:00，转化得到时间戳
        getTimeStampByTimeStr: function (timeStr) {
            timeStr += '';
            if (cc.sys.os == cc.sys.OS_IOS || QQ_GAME_ENV) {
                return new Date(timeStr.replace(/-/g, "/")).getTime();
            } else {
                return new Date(timeStr).getTime();
            }
        },

        arrContains: function (arr, checkItem) {
            if (arr) {
                for (let index = 0; index < arr.length; index++) {
                    const item = arr[index];
                    if (item === checkItem) {
                        return true;
                    }
                }
            }
            return false;
        },

        arrRemove: function (arr, removeItem) {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i] === removeItem) {
                    arr.splice(i, 1);
                    return true;
                }
            }
            return false;
        },

        createQueryString: function (queryObject) {
            let queryString = ''
            let flag = true;
            for (var key in queryObject) {
                if (queryObject.hasOwnProperty(key)) {
                    const paramStr = `${key}=${queryObject[key]}`;
                    if (flag) {
                        flag = false;
                        queryString = paramStr;
                    } else {
                        queryString += `&${paramStr}`;
                    }
                }
            }
            console.log('query:' + queryString);
            return queryString;
        },

        hexToColor: function (hex) {
            return new cc.Color().fromHEX(hex);
        },


        /* 获得当前时间与开始时间的实际跨天次数,如从昨日23点到今天零点过一秒也为一天*/
        getRealTimeCount: function (startTime, endTime) {
            let realStartTime = new Date(startTime);
            //设为当天0点0分0秒0毫秒。
            realStartTime.setHours(0, 0, 0, 0);
            return Tools.getTimeCount(parseInt(realStartTime.getTime()), endTime);
        },

        /* 获得当前时间距离今天24：00的倒计时*/
        getCountDownTimeByZero: function (curTime) {
            let realStartTime = new Date(curTime);
            //设为当天0点0分0秒0毫秒。
            realStartTime.setHours(0, 0, 0, 0);
            var time = Tools.getTimeCount(parseInt(realStartTime.getTime()), curTime);
            time.hour = 23 - time.hour;
            time.minute = 59 - time.minute;
            time.second = 60 - time.second;

            if (time.hour < 10) {
                time.hour = '0' + time.hour;
            }
            if (time.minute < 10) {
                time.minute = '0' + time.minute;
            }
            if (time.second < 10) {
                time.second = '0' + time.second;
            }
            return time;
        },

        getCountDownTime(timestamp) {
            timestamp = timestamp / 1000;
            var time = {};
            time.hour = Math.floor(timestamp % 86400 / 3600);
            time.minute = Math.floor(timestamp % 86400 % 3600 / 60);
            time.second = Math.floor(timestamp % 86400 % 3600 % 60);
            if (time.hour < 10) {
                time.hour = '0' + time.hour;
            }
            if (time.minute < 10) {
                time.minute = '0' + time.minute;
            }
            if (time.second < 10) {
                time.second = '0' + time.second;
            }
            return time;
        },

        /**
         * !#en TODO
         * !#zh 返回两个向量之间带正负号的弧度。
         * @method pAngleSigned
         * @param {Vec2} a
         * @param {Vec2} b
         * @return {Number} the signed angle in radians between two vector directions
         */
        pAngleSigned: function (a, b) {
            var a2 = a.normalize();
            var b2 = b.normalize();
            var angle = Math.atan2(a2.x * b2.y - a2.y * b2.x, a2.dot(b2));
            if (Math.abs(angle) < POINT_EPSILON)
                return 0.0;
            return angle;
        },

        /**
         * !#en Get angle in radian between this and vector with direction.
         * !#zh 带方向的夹角的弧度。
         * @method signAngle
         * @param {Vec2} v1
         * @param {Vec2} v2
         * @return {number} from -MathPI to Math.PI
         */
        vec2SignAngle: function (v1, v2) {
            return Math.atan2(v1.y, v1.x) - Math.atan2(v2.y, v2.x);
        },

        /**
         * !#en ccpSegmentIntersect return YES if Segment A-B intersects with segment C-D.
         * !#zh 返回线段 A - B 和线段 C - D 是否相交。
         * @method pSegmentIntersect
         * @param {Vec2} A
         * @param {Vec2} B
         * @param {Vec2} C
         * @param {Vec2} D
         * @return {Boolean}
         */
        pSegmentIntersect: function (A, B, C, D) {
            var retP = cc.v2(0, 0);
            if (Tools.pLineIntersect(A, B, C, D, retP))
                if (retP.x >= 0.0 && retP.x <= 1.0 && retP.y >= 0.0 && retP.y <= 1.0)
                    return true;
            return false;
        },

        /**
         * !#en
         * A general line-line intersection test
         * indicating successful intersection of a line<br />
         * note that to truly test intersection for segments we have to make<br />
         * sure that s & t lie within [0..1] and for rays, make sure s & t > 0<br />
         * the hit point is        p3 + t * (p4 - p3);<br />
         * the hit point also is    p1 + s * (p2 - p1);
         * !#zh
         * 返回 A 为起点 B 为终点线段 1 所在直线和 C 为起点 D 为终点线段 2 所在的直线是否相交，<br />
         * 如果相交返回 true，反之则为 false，参数 retP 是返回交点在线段 1、线段 2 上的比例。
         * @method pLineIntersect
         * @param {Vec2} A - A is the startpoint for the first line P1 = (p1 - p2).
         * @param {Vec2} B - B is the endpoint for the first line P1 = (p1 - p2).
         * @param {Vec2} C - C is the startpoint for the second line P2 = (p3 - p4).
         * @param {Vec2} D - D is the endpoint for the second line P2 = (p3 - p4).
         * @param {Vec2} retP - retP.x is the range for a hitpoint in P1 (pa = p1 + s*(p2 - p1)), <br />
         * retP.y is the range for a hitpoint in P3 (pa = p2 + t*(p4 - p3)).
         * @return {Boolean}
         */
        pLineIntersect: function (A, B, C, D, retP) {
            if ((A.x === B.x && A.y === B.y) || (C.x === D.x && C.y === D.y)) {
                return false;
            }
            var BAx = B.x - A.x;
            var BAy = B.y - A.y;
            var DCx = D.x - C.x;
            var DCy = D.y - C.y;
            var ACx = A.x - C.x;
            var ACy = A.y - C.y;

            var denom = DCy * BAx - DCx * BAy;

            retP.x = DCx * ACy - DCy * ACx;
            retP.y = BAx * ACy - BAy * ACx;

            if (denom === 0) {
                if (retP.x === 0 || retP.y === 0) {
                    // Lines incident
                    return true;
                }
                // Lines parallel and not incident
                return false;
            }

            retP.x = retP.x / denom;
            retP.y = retP.y / denom;

            return true;
        },

        setLargeItem: function (key, item) {
            if (QQ_GAME_ENV && !Tools.isH5) {
                try {
                    // console.log('setLargeItem key:' + key);
                    // console.log('setLargeItem item:' + item);
                    var path = 'GameSandBox://localStorage/' + key;
                    if (BK.FileUtil.isFileExist(path)) {
                        BK.FileUtil.deleteFile(path);
                    }
                    BK.FileUtil.writeFile(path, item);
                    // console.log('setLargeItem writeFile finish, path:' + path + ' isFileExist:' + BK.FileUtil.isFileExist(path));
                } catch (e) {
                    console.log('getLargeItem exception:' + e);
                }
            } else {
                Tools.setItem(key, item);
            }
        },

        getLargeItem: function (key) {
            if (QQ_GAME_ENV && !Tools.isH5) {
                try {
                    // console.log('getLargeItem key:' + key);
                    var path = 'GameSandBox://localStorage/' + key;
                    // console.log('getLargeItem, path:' + path + ' isFileExist:' + BK.FileUtil.isFileExist(path));
                    if (BK.FileUtil.isFileExist(path)) {
                        var str = BK.FileUtil.readFile(path).readAsString(true);
                        // console.log('getLargeItem value:' + str);
                        return str;
                    }
                } catch (e) {
                    console.log('getLargeItem exception:' + e);
                }
                return null;
            } else {
                return Tools.getItem(key);
            }
        },

        setItem: function (key, item) {
            if (item === null || item === undefined) {
                console.log('setItem error, item is null or undefined, key:' + key);
                return;
            }
            if (typeof item !== 'string') {
                // console.log('key:' + key + ' type:' + (typeof item));
                item = item.toString();
                // console.log('item.toString():' + item);
            }
            if (WX_GAME_ENV) {
                wx.setStorage({
                    key: key,
                    data: item,
                });
                // } else if (QQ_GAME_ENV && BK.localStorage) {
                //     BK.localStorage.setItem(key, item);
            } else {
                try {
                    cc.sys.localStorage.setItem(key, item);
                } catch (e) {
                    console.log('setItem exception:' + e + ' key:' + key);
                    // console.log('item:' + item);
                }
            }
        },

        getItem: function (key) {
            if (WX_GAME_ENV) {
                try {
                    return wx.getStorageSync(key);
                } catch (e) {
                    console.log(e);
                    return null;
                }
                // } else if (QQ_GAME_ENV && BK.localStorage) {
                //     return BK.localStorage.getItem(key);
            } else {
                return cc.sys.localStorage.getItem(key);
            }
        },

        removeItem: function (key) {
            // if (QQ_GAME_ENV && BK.localStorage) {
            //     BK.localStorage.removeItem(key);
            // } else {
            //     cc.sys.localStorage.removeItem(key);
            // }
            cc.sys.localStorage.removeItem(key);
        },

        log: function (str) {
            if (QQ_GAME_ENV) {
                BK.Script.log(1, 1, str);
            }
            console.log(str);
        },

        /**
         * 先显示，等一帧待renderData更新后隐藏节点
         * 此方法是专门针对QQ玩一玩的优化，该平台更新renderData时底层gl接口decodeTexture等操作耗时较高，需要提前进行
         * @param  {cc.Component} comp 执行schedule的组件
         * @param  {cc.Node} 需要操作的节点
         * @param  {function} callback 隐藏时的回调
         */
        setInvisibleAfterUpdateRenderData: function (comp, node, callback = null) {
            if (!comp || !node) return;

            const originPos = cc.v2(node.position);
            node.position = OUT_OF_VIEW_POS;
            node.active = true;
            Tools.setNodeVisible(node, true);

            const scheduleFunc = function () {
                Tools.setNodeVisible(node, false);
                node.position = originPos;
                if (callback) callback();
            };

            comp.scheduleOnce(scheduleFunc, 2.0 / cc.game.getFrameRate());
        },

        getRadiusByKnifeCount: function (count) {
            var firstRadius = 200;
            var radius = this.getRadioByCount(count) * firstRadius;
            return radius;
        },

        getRadioByCount: function (count) {
            var newCount = count < 8 ? 0 : (count > 20 ? 12 : count - 8);
            return (newCount / 12) + 1;
        },

        getIntervalByCount: function (count) {
            return count < 50 ? 10 : 500 / count;
        },


        isInMyView: function (self, other, worldRect, width, height, camera) {
            var localPos = self.node.position.sub(camera.node.position);
            var pos = other.node.parent.convertToWorldSpaceAR(other.node.position);
            var finalPos = self.node.parent.convertToNodeSpaceAR(pos);
            var otherPos = finalPos.sub(camera.node.position);

            worldRect.width = width / camera.zoomRatio;
            worldRect.height = height / camera.zoomRatio;
            worldRect.center = localPos;
            // console.log(worldRect.center, worldRect.width, worldRect.height)
            var otherRect = other.defenceRect.getRect();
            otherRect.center = otherPos;

            // if (log) console.log(otherPos, otherRect.width, otherRect.height);

            return worldRect.intersects(otherRect);

        },

        compareVersion: function (v1, v2) {
            v1 = v1.split('.');
            v2 = v2.split('.');
            const len = Math.max(v1.length, v2.length);

            while (v1.length < len) {
                v1.push('0');
            }
            while (v2.length < len) {
                v2.push('0');
            }

            for (let i = 0; i < len; i++) {
                const num1 = parseInt(v1[i])
                const num2 = parseInt(v2[i])

                if (num1 > num2) {
                    return 1;
                } else if (num1 < num2) {
                    return -1;
                }
            }

            return 0;
        },


        getPositiveOrNegative: function () {
            var arr = [1, -1];
            var index = Math.floor(Math.random() * 2)
            return arr[index];
        },

        // 获得两圈碰撞的相交点和垂直平分线的角度
        getCenterParam: function (detail) {
            var worldPos1 = detail[0].parent.convertToWorldSpaceAR(detail[0].position);
            var worldPos2 = detail[1].parent.convertToWorldSpaceAR(detail[1].position);
            var centerPos = cc.v2((worldPos1.x + worldPos2.x) / 2, (worldPos1.y + worldPos2.y) / 2);
            var offset = Math.PI / 36 - Math.random() * (Math.PI / 18); //-5~5度的方向偏移
            var dir = worldPos1.sub(worldPos2).rotate(Math.PI / 2 + offset);


            var rotation = this.getRotationByDir(dir);
            return [centerPos, rotation];
        },

        getRotationByDir: function (dir) {
            var rotate = dir.angle(cc.v2(-1, 0)) * (180 / Math.PI);
            if (dir.y < 0) {
                rotate = -rotate;
            }
            // console.log(dir, rotate);
            return rotate;
        },


        getGoldStr: function (count) {
            return count;
            var str = '';
            if (count > 1000000) {
                str = Math.floor(count * 10 / 1000000) / 10 + 'M';
            } else if (count > 1000) {
                str = Math.floor(count * 10 / 1000) / 10 + 'K';
            } else {
                str = Math.floor(count * 10) / 10
            }
            return str;
        },

        //三个阶段，0：free，1：share，2：adver

        getCurStage: function (playCount, limits, stagePrecents) {

            var stage = 0;
            for (const limit of limits) {
                if (playCount < limit) {
                    break;
                } else {
                    stage++;
                }
            }

            if (stage === 0) {
                return 0
            } else {
                var int = this.getRandomInt(0, 100);
                if (int < stagePrecents[stage]) {
                    return 1
                } else {
                    return 2
                }
            }

        },

        jsonToArray: function (jsonObj) {
            let ret = [];
            for (let key in jsonObj) {
                ret[key] = jsonObj[key];
                if (Tools.isJson(ret[key])) {
                    ret[key] = Tools.jsonToArray(ret[key]);
                }
            }
            // for (var i = 0; i < jsonObj.length; i++) {
            //     ret[i] = jsonObj[i];
            // }
            return ret;
        },

        //判断obj是否为json对象
        isJson: function (obj) {
            var isjson = typeof (obj) == "object" && Object.prototype.toString.call(obj).toLowerCase() == "[object object]" && !obj.length;
            return isjson;
        },


        //根据权重获取数组元素
        getRandomItemByWeight: function (datas) {
            var limitWeights = [];
            var totalWeight = 0;
            for (let i = 0; i < datas.length; i++) {
                limitWeights[i] = totalWeight + datas[i].weight;
                totalWeight += datas[i].weight;
            }

            var random = Tools.getRandomInt(0, totalWeight);
            // console.log('权重区间:', JSON.stringify(limitWeights))
            // console.log('本次随机:', random, '/', totalWeight)
            for (let i = 0; i < limitWeights.length; i++) {
                var data = datas[i];
                if (random < limitWeights[i]) {
                    return data;
                }
            }


            return null;
        },


        /**
         * 创建按钮点击handler
         * @param  {cc.Node} target 目标节点
         * @param  {String} component 目标组件名
         * @param  {String} handlerFuncName 响应事件函数名
         * @param  {String} customEventData 自定义事件数据
         */
        createEventHandler: function (target, component, handlerFuncName, customEventData) {
            const handler = new cc.Component.EventHandler();
            handler.target = target;
            handler.component = component;
            handler.handler = handlerFuncName;
            handler.customEventData = customEventData;
            return handler;
        },

        //对对象进行浅拷贝
        copyObj: function (obj) {
            if (!obj) return
            var a = {};
            for (let key in obj) {
                a[key] = obj[key];
            }
            return a;
        },


        getStrlen: function (str) {
            var len = 0;
            for (var i = 0; i < str.length; i++) {
                if (str.charCodeAt(i) > 127 || str.charCodeAt(i) == 94) {
                    len += 2;
                } else {
                    len++;
                }
            }
            return len;
        }
    }
});