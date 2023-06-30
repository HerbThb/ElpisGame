
const HeroCollisionWallListener = cc.Class({
    extends: cc.Component,

    properties: {
        collider: cc.CircleCollider,
        _wallCollisionCount: 0,
    },

    onLoad: function () {
        this.collider = this.node.getComponent(cc.CircleCollider);
        this.node.on('radiusChange', this.radiusChange, this)
    },

    radiusChange: function (detail) {
        this.collider.radius = detail;
    },

    onCollisionEnter: function (){
        if(this._wallCollisionCount === 0) {
            this.noticeWallCollision(true);
        }
        this._wallCollisionCount ++;
    },

    onCollisionExit: function () {
        this._wallCollisionCount --;
        if(this._wallCollisionCount === 0) {
            this.noticeWallCollision(false);
        }
    },
    
    noticeWallCollision: function (isCollision) {
        this.node.emit('wallCollision', isCollision);
    }
});