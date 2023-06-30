/**
 * @fileoverview ListItemBase
 * @author <liqing@gameley.cn> (李清)
 */

const Tools = require('Tools');

/**
 * ListItemBase 列表项基类
 */
const ListItemBase = cc.Class({
    extends: cc.Component,

    properties: {
        /** 列表项按钮，可为null */
        button: cc.Button,
        /** 用于添加删除等检查的flag */
        checkFlag: {
            default: false,
            visible: false,
        },
    },

    /**
     * 创建按钮点击handler
     * @param  {cc.Node} target 目标节点
     * @param  {String} component 目标组件名
     * @param  {String} handlerFuncName 响应事件函数名
     * @param  {String} customEventData 自定义事件数据
     */
    createItemClickHander: function (target, component, handlerFuncName, customEventData) {
        const handler = new cc.Component.EventHandler();
        handler.target = target;
        handler.component = component;
        handler.handler = handlerFuncName;
        handler.customEventData = customEventData;
        return handler;
    },

    /**
     * 设置列表项点击handler
     * @param  {cc.Component} handlerComponent 目标组件
     * @param  {String} customEventData 自定义事件数据
     * @param  {String} [handlerFuncName] 响应事件函数名，默认为onItemClick
     */
    setOnItemClick: function (handlerComponent, customEventData, handlerFuncName = 'onItemClick') {
        this.setOnBtnClick(this.button, handlerComponent, customEventData, handlerFuncName);
    },

    /**
     * 设置按钮点击handler
     * @param  {cc.Button} btn 按钮
     * @param  {cc.Component} handlerComponent 目标组件
     * @param  {String} customEventData 自定义事件数据
     * @param  {String} [handlerFuncName] 响应事件函数名，默认为onItemClick
     */
    setOnBtnClick: function (btn, handlerComponent, customEventData, handlerFuncName = 'onItemClick') {
        if (btn) {
            const handler = this.createItemClickHander(handlerComponent.node, cc.js.getClassName(handlerComponent), handlerFuncName, customEventData);
            btn.clickEvents = [handler];
        }
    },

    /**
     * 设置列表项是否可见，用于ScrollView裁剪
     * @param {boolean} isVisible 
     */
    setVisible: function (isVisible) {
        if (this.node) {
            Tools.setNodeVisible(this.node, isVisible);
        }
    },
});