//让子节点以父节点为中心居中
const NodeEvent = cc.Node.EventType;
cc.Class({
    extends: cc.Component,

    editor: CC_EDITOR && {
        menu: 'i18n:MAIN_MENU.component.ui/Centered',
        executeInEditMode: true,
    },

    properties: {
        interval: 5,
        widthMax: 0,
    },


    onEnable: function () {
        this._addEventListeners();
        this._doLayoutDirty();
    },

    onDisable: function () {
        this._removeEventListeners();
    },

    _doLayoutDirty: function () {
        this._layoutDirty = true;
    },


    _addEventListeners: function () {
        cc.director.on(cc.Director.EVENT_AFTER_UPDATE, this.updateLayout, this);
        this.node.on(NodeEvent.SIZE_CHANGED, this._doLayoutDirty, this);
        this.node.on(NodeEvent.ANCHOR_CHANGED, this._doLayoutDirty, this);
        this.node.on(NodeEvent.CHILD_ADDED, this._childAdded, this);
        this.node.on(NodeEvent.CHILD_REMOVED, this._childRemoved, this);
        this.node.on(NodeEvent.CHILD_REORDER, this._doLayoutDirty, this);
        this._addChildrenEventListeners();
    },

    _removeEventListeners: function () {
        cc.director.off(cc.Director.EVENT_AFTER_UPDATE, this.updateLayout, this);
        this.node.off(NodeEvent.SIZE_CHANGED, this._doLayoutDirty, this);
        this.node.off(NodeEvent.ANCHOR_CHANGED, this._doLayoutDirty, this);
        this.node.off(NodeEvent.CHILD_ADDED, this._childAdded, this);
        this.node.off(NodeEvent.CHILD_REMOVED, this._childRemoved, this);
        this.node.off(NodeEvent.CHILD_REORDER, this._doLayoutDirty, this);
        this._removeChildrenEventListeners();
    },

    _addChildrenEventListeners: function () {
        var children = this.node.children;
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            child.on(NodeEvent.SCALE_CHANGED, this._doLayoutDirty, this);
            child.on(NodeEvent.SIZE_CHANGED, this._doLayoutDirty, this);
            child.on(NodeEvent.POSITION_CHANGED, this._doLayoutDirty, this);
            child.on(NodeEvent.ANCHOR_CHANGED, this._doLayoutDirty, this);
            child.on('active-in-hierarchy-changed', this._doLayoutDirty, this);
        }
    },

    _removeChildrenEventListeners: function () {
        var children = this.node.children;
        for (var i = 0; i < children.length; ++i) {
            var child = children[i];
            child.off(NodeEvent.SCALE_CHANGED, this._doLayoutDirty, this);
            child.off(NodeEvent.SIZE_CHANGED, this._doLayoutDirty, this);
            child.off(NodeEvent.POSITION_CHANGED, this._doLayoutDirty, this);
            child.off(NodeEvent.ANCHOR_CHANGED, this._doLayoutDirty, this);
            child.off('active-in-hierarchy-changed', this._doLayoutDirty, this);
        }
    },

    _childAdded: function (child) {
        child.on(NodeEvent.SCALE_CHANGED, this._doLayoutDirty, this);
        child.on(NodeEvent.SIZE_CHANGED, this._doLayoutDirty, this);
        child.on(NodeEvent.POSITION_CHANGED, this._doLayoutDirty, this);
        child.on(NodeEvent.ANCHOR_CHANGED, this._doLayoutDirty, this);
        child.on('active-in-hierarchy-changed', this._doLayoutDirty, this);

        this._doLayoutDirty();
    },

    _childRemoved: function (child) {
        child.off(NodeEvent.SCALE_CHANGED, this._doLayoutDirty, this);
        child.off(NodeEvent.SIZE_CHANGED, this._doLayoutDirty, this);
        child.off(NodeEvent.POSITION_CHANGED, this._doLayoutDirty, this);
        child.off(NodeEvent.ANCHOR_CHANGED, this._doLayoutDirty, this);
        child.off('active-in-hierarchy-changed', this._doLayoutDirty, this);

        this._doLayoutDirty();
    },


    updateLayout(dt) {
        if (!this._layoutDirty) return
        this._layoutDirty = false;

        this.widthMax = 0;
        for (const node of this.node.children) {
            if (node.active) {
                this.widthMax += node.width + this.interval;
            }
        }
        this.widthMax -= this.interval;

        var posX = -this.widthMax / 2;
        for (const node of this.node.children) {
            if (node.active) {
                node.x = posX + node.width / 2;
                posX += node.width + this.interval;
            }
        }
    },
});