cc.Class({
    extends: cc.Component,

    onLoad: function () {
        this._moveL = false;
        this._moveU = false;
        this._moveR = false;
        this._moveD = false;

        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onDestroy: function () {
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
    },

    onKeyDown: function (event) {
        // 有按键按下时，判断是否是我们指定的方向控制键，并设置向对应方向加速
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this._moveL = true;
                break;
            case cc.macro.KEY.w:
                this._moveU = true;
                break;
            case cc.macro.KEY.d:
                this._moveR = true;
                break;
            case cc.macro.KEY.s:
                this._moveD = true;
                break;
            case cc.macro.KEY.j:
                this.node.emit('onHoldAttackTrigger');
                break;
        }
    },
    
    onKeyUp: function (event) {
        // 松开按键时，停止向该方向的加速
        var needStop = false;
        switch (event.keyCode) {
            case cc.macro.KEY.a:
                this._moveL = false;
                // this.node.emit('onStopMoving');
                needStop = true;
                break;
            case cc.macro.KEY.w:
                this._moveU = false;
                // this.node.emit('onStopMoving');
                needStop = true;
                break;
            case cc.macro.KEY.d:
                this._moveR = false;
                // this.node.emit('onStopMoving');
                needStop = true;
                break;
            case cc.macro.KEY.s:
                this._moveD = false;
                // this.node.emit('onStopMoving');
                needStop = true;
                break;
            case cc.macro.KEY.j:
                this.node.emit('onReleaseAttackTrigger');
                break;
        }

        if (needStop) {
            if (!this._moveL && !this._moveU && !this._moveR && !this._moveD) {
                this.node.emit('onStopMoving');
            }
        }
    },

    // cal the pos move by keyboard 
    cycleMoveByKeyboard() {
        if (this._moveL || this._moveU || this._moveR || this._moveD) {

            var curPos = cc.v2(0, 0);
            if (this._moveL) {
                curPos = curPos.add(cc.v2(-1, 0));
            }
            if (this._moveU) {
                curPos = curPos.add(cc.v2(0, 1));
            }
            if (this._moveR) {
                curPos = curPos.add(cc.v2(1, 0));
            }
            if (this._moveD) {
                curPos = curPos.add(cc.v2(0, -1));
            }
            this.node.emit('onMoveBy', {
                dPos: curPos
            });
        }
    },

    // called every frame, uncomment this function to activate update callback
    update: function (dt) {
        this.cycleMoveByKeyboard();
    },
});
