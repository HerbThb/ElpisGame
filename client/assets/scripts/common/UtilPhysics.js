var GameData = require("GameData");
const Tools = require('Tools');

var UtilPhysics = cc.Class({
    statics: {
        /**
         * 判断点和两点表示的线关系
         * @param p1 线段点1
         * @param p2 线段点2
         * @return 0点在线上，大于0点在线左侧，小于0点在线右侧
         */
        checkPointLine: function (x, y, p1, p2) {
            var r = ((x - p1.x) * (p2.y - p1.y) - (y - p1.y) * (p2.x - p1.x))
            if (r === 0) {
                return 0;
            } else if (r > 0) {
                return 1;
            } else {
                return -1;
            }
        },

        /**
         * 判断两点表示的线段是否和矩形碰撞
         * @param p1 线段点1
         * @param p2 线段点2
         * @param r 矩形
         */
        isCollidingLineRect: function (p1, p2, r) {
            // 判断2点是否和矩形碰撞
            if (r.contains(p1) || r.contains(p2)) {
                return true
            }

            // 判断矩形的4个顶点是否都在线段的同侧，如果是则无碰撞，反之有碰撞
            var left = 0;
            var right = 0;
            var wd2 = r.width / 2;
            var hd2 = r.height / 2;
            for (var i = 0; i < 4; i++) {
                var w = 0
                var h = 0
                switch (i) {
                    case 0: {
                        w = -wd2;
                        h = hd2;
                        break;
                    }
                    case 1: {
                        w = -wd2;
                        h = -hd2;
                        break;
                    }
                    case 2: {
                        w = wd2;
                        h = -hd2;
                        break;
                    }
                    case 3: {
                        w = wd2;
                        h = hd2;
                        break;
                    }
                }
                var x = r.x + w;
                var y = r.y + h;
                switch (UtilPhysics.checkPointLine(x, y, p1, p2)) {
                    case 0:
                        return true
                    case 1:
                        if (right > 0) {
                            return true;
                        } else {
                            left++
                        }
                        break;
                    case -1:
                        if (left > 0) {
                            return true;
                        } else {
                            right++
                        }
                        break;
                }
            }
            return false
        },

        isCollidingRectRect: function(r1, r2){
            return Math.abs(r2.x - r1.x) * 2 <= r1.width + r2.width 
            && Math.abs(r2.y - r1.y) * 2 <= r1.height + r2.height;
        },

        isCollidingRectPoint: function(rect, point) {
            if (point.x >= rect.xMin && point.x <= rect.xMax && point.y >= rect.yMin && point.y <= rect.yMax) {
                if (point.x === rect.xMin || point.x === rect.xMax || point.y === rect.yMin || point.y === rect.yMax) {
                    return 0;
                } else {
                    return 1;
                }
            } else {
                return -1;
            }
        },

        // 检查移动点和矩形的碰撞,返回[是否碰撞,碰撞的点]
        checkMovePointCollideRectReturnHitPos: function(pointPos, dir, rect, isKeepOutOfRect) {
            var startPos = pointPos;
            var endPos = pointPos.add(dir);
            var isContainsStart = UtilPhysics.isCollidingRectPoint(rect, startPos);
            var isContainsEnd = UtilPhysics.isCollidingRectPoint(rect, endPos);
            if ((isKeepOutOfRect && isContainsEnd >= 0) || (!isKeepOutOfRect && isContainsEnd <= 0)) {
                // cc.log("rect:" + rect + " origin:" + rect.origin + " size:" + rect.size);
                // cc.log("start:" + startPos + " end:" + endPos);
                // cc.log("isContains:" + isContainsStart + "|" + isContainsEnd + " isKeepOutOfRect:" + isKeepOutOfRect);
                var l = rect.x;
                var r = rect.x + rect.width;
                var u = rect.y + rect.height;
                var d = rect.y;
                var lu = cc.v2(l, u);
                var ru = cc.v2(r, u);
                var ld = cc.v2(l, d);
                var rd = cc.v2(r, d);
                var retP = cc.Vec2.ZERO;
                var isHit = false;
                // 上
                if (startPos.y > d && ((startPos.y >= u && dir.y < 0) || (startPos.y <= u && dir.y > 0))) {
                    isHit = Tools.pSegmentIntersect(startPos, endPos, lu, ru);
                    if (isHit) {
                        Tools.pLineIntersect(startPos, endPos, lu, ru, retP);
                    }
                }
                // 下
                if (!isHit && startPos.y < u && ((startPos.y <= d && dir.y > 0) || (startPos.y >= d && dir.y < 0))) {
                    isHit = Tools.pSegmentIntersect(startPos, endPos, ld, rd);
                    if (isHit) {
                        Tools.pLineIntersect(startPos, endPos, ld, rd, retP);
                    }
                }
                // 左
                if (!isHit && startPos.x < r && ((startPos.x <= l && dir.x > 0) || (startPos.x >= l && dir.x < 0))) {
                    isHit = Tools.pSegmentIntersect(startPos, endPos, lu, ld);
                    if (isHit) {
                        Tools.pLineIntersect(startPos, endPos, lu, ld, retP);
                    }
                }
                // 右
                if (!isHit && startPos.x > l && ((startPos.x >= r && dir.x < 0) || (startPos.x <= r && dir.x > 0))) {
                    isHit = Tools.pSegmentIntersect(startPos, endPos, ru, rd);
                    if (isHit) {
                        Tools.pLineIntersect(startPos, endPos, ru, rd, retP);
                    }
                }
                if (isHit) {
                    retP = startPos.add(dir.mul(retP.x));
                    // cc.log("hit:" + retP);
                    return [true, retP];
                }
            }
            return [false, null];
        },

        // 检查移动矩形和矩形的碰撞,返回[是否碰撞,移动矩形发生碰撞时的位置]
        checkMoveRectCollideRectReturnHitPos: function(moveRect, dir, rect, isKeepOutOfRect) {
            rect = cc.rect(rect.x - moveRect.width/2, rect.y - moveRect.height/2, rect.width + moveRect.width, rect.height + moveRect.height);
            return UtilPhysics.checkMovePointCollideRectReturnHitPos(moveRect.center, dir, rect, isKeepOutOfRect);
        },
        
        // 检查移动点和矩形的碰撞,返回[是否碰撞,沿着矩形边缘滑动后的点]
        checkMovePointCollideRectReturnSlidePos: function(pointPos, dir, rect, isKeepOutOfRect) {
            var startPos = pointPos;
            var endPos = pointPos.add(dir);
            var isContainsEnd = UtilPhysics.isCollidingRectPoint(rect, endPos);
            if (!isKeepOutOfRect) {
                if (isContainsEnd < 0) {
                    endPos.x = cc.clampf(endPos.x, rect.xMin, rect.xMax);
                    endPos.y = cc.clampf(endPos.y, rect.yMin, rect.yMax);
                    return [true, endPos];
                }
            } else {
                if (isContainsEnd >= 0) {
                    var l = rect.x;
                    var r = rect.x + rect.width;
                    var u = rect.y + rect.height;
                    var d = rect.y;
                    var center = rect.center;
                    var isHit = false;
                    
                    // cc.log("rect:" + rect + " origin:" + rect.origin + " size:" + rect.size);
                    // cc.log("start:" + startPos + " end:" + endPos);
                    // cc.log("Math.abs(dir.x / dir.y):" + Math.abs(dir.x / dir.y) + " | " + UtilPhysics.vertexDirScaleAbs(l, u, startPos))

                    // 判断prevPos时所处的和wall的位置区域，根据不同区域判断出来要碰撞wall的哪面边，从而来修正位置
                    // 左
                    if (startPos.x <= l && startPos.y < u && startPos.y > d) {
                        isHit = true;
                        endPos.x = l;
                    }
                    // 右
                    if (startPos.x >= r && startPos.y < u && startPos.y > d) {
                        isHit = true;
                        endPos.x = r;
                    }
                    // 上
                    if (startPos.y >= u && startPos.x < r && startPos.x > l) {
                        isHit = true;
                        endPos.y = u;
                    }
                    // 下
                    if (startPos.y <= d && startPos.x < r && startPos.x > l) {
                        isHit = true;
                        endPos.y = d;
                    }
                    // 左上
                    if (startPos.x <= l && startPos.y >= u) {
                        isHit = true;
                        if (dir.y !== 0 && startPos.y !== u && Math.abs(dir.x / dir.y) >= UtilPhysics.vertexDirScaleAbs(l, u, startPos)) {
                            // 上
                            endPos.y = u;
                        } else {
                            // 左
                            endPos.x = l;
                        }
                    }
                    // 右上
                    if (startPos.x >= r && startPos.y >= u) {
                        isHit = true;
                        if (dir.y !== 0 && startPos.y !== u && Math.abs(dir.x / dir.y) >= UtilPhysics.vertexDirScaleAbs(r, u, startPos)) {
                            // 上
                            endPos.y = u;
                        } else {
                            // 右
                            endPos.x = r;
                        }
                    }
                    // 左下
                    if (startPos.x <= l && startPos.y <= d) {
                        isHit = true;
                        if (dir.y !== 0 && startPos.y !== d && Math.abs(dir.x / dir.y) >= UtilPhysics.vertexDirScaleAbs(l, d, startPos)) {
                            // 下
                            endPos.y = d;
                        } else {
                            // 左
                            endPos.x = l;
                        }
                    }
                    // 右下
                    if (startPos.x >= r && startPos.y <= d) {
                        isHit = true;
                        if (dir.y !== 0 && startPos.y !== d && Math.abs(dir.x / dir.y) >= UtilPhysics.vertexDirScaleAbs(r, d, startPos)) {
                            // 下
                            endPos.y = d;
                        } else {
                            // 右
                            endPos.x = r;
                        }
                    }
                    if (isHit) {
                        // cc.log("hit:" + endPos);
                        return [true, endPos];
                    }
                }
            }
            return [false, null];
        },
        
        // 检查移动矩形和矩形的碰撞,返回[是否碰撞,移动矩形沿着固定矩形滑动后的位置]
        checkMoveRectCollideRectReturnSlidePos: function(moveRect, dir, rect, isKeepOutOfRect) {
            rect = cc.rect(rect.x - moveRect.width/2, rect.y - moveRect.height/2, rect.width + moveRect.width, rect.height + moveRect.height);
            return UtilPhysics.checkMovePointCollideRectReturnSlidePos(moveRect.center, dir, rect, isKeepOutOfRect);
        },
        
        vertexDirScaleAbs: function (x, y, pos) {
            var ret = Math.abs((x - pos.x) / (y - pos.y));
            return ret;
        },

        test: function() {
            var rect = cc.rect(-320, -320, 640, 640);
            var pointPos = cc.v2(310, 310);
            var dir = cc.v2(0, 20);

            var moveRect = cc.rect(310, 310, 20, 20);
            dir = cc.v2(10, 10);
            UtilPhysics.checkMoveRectCollideRectReturnSlidePos(moveRect, dir, rect, false);

            // UtilPhysics.checkMovePointCollideRectReturnHitPos(pointPos, dir, rect);
            // dir = cc.v2(20, 0);
            // UtilPhysics.checkMovePointCollideRectReturnHitPos(pointPos, dir, rect);

            // pointPos = cc.v2(-310, -310);
            // dir = cc.v2(0, -20);
            // UtilPhysics.checkMovePointCollideRectReturnHitPos(pointPos, dir, rect);
            // dir = cc.v2(-20, 0);
            // UtilPhysics.checkMovePointCollideRectReturnHitPos(pointPos, dir, rect);

            // pointPos = cc.v2(0, 330);
            // dir = cc.v2(0, -1000);
            // UtilPhysics.checkMovePointCollideRectReturnHitPos(pointPos, dir, rect);
            
            // pointPos = cc.v2(0, -330);
            // dir = cc.v2(0, 1000);
            // UtilPhysics.checkMovePointCollideRectReturnHitPos(pointPos, dir, rect);

            // pointPos = cc.v2(-330, 0);
            // dir = cc.v2(1000, 0);
            // UtilPhysics.checkMovePointCollideRectReturnHitPos(pointPos, dir, rect);
            
            // pointPos = cc.v2(0, -330);
            // dir = cc.v2(0, -1000);
            // UtilPhysics.checkMovePointCollideRectReturnHitPos(pointPos, dir, rect);

            // var moveRect = cc.rect(-5, -5, 10, 10);
            // var dir = cc.v2(6, 6);
            // var rect = cc.rect(10, 10, 20, 20);
            // UtilPhysics.checkMoveRectCollideRectReturnSlidePos(moveRect, dir, rect);

            // dir = cc.v2(6, 0);
            // UtilPhysics.checkMoveRectCollideRectReturnSlidePos(moveRect, dir, rect);
        }
    }
})