const PlatformMgr = require('PlatformMgr');
const PlatformType = require('Types').PlatformType;
const PlayerData = require('PlayerData');
var UIUtil = cc.Class({
    extends: cc.Component,
    statics: {
        loadResSprite: function (sprite, url) {
            cc.loader.loadRes(url, cc.SpriteFrame, (error, resource) => {
                if (error) {
                    cc.error(error);
                } else if (resource) {
                    sprite.spriteFrame = resource;
                }
            })
        },

        loadFriendPortrait: function (sprite, url) {
            if (!url) return;
            if (Number(url)) {
                var newUrl = "texture/defaultPortrait/avatar-player-0" + url;
                cc.loader.loadRes(newUrl, cc.SpriteFrame, (error, resource) => {
                    if (error) {
                        cc.error(error);
                    } else if (resource) {
                        if (sprite.iconUrl === url) {
                            sprite.spriteFrame = resource;
                        }
                    }
                })
            } else {
                cc.loader.load({
                    url: url,
                    type: 'jpg',
                }, (error, resource) => {
                    if (error) {
                        cc.error(error);
                    } else if (resource) {
                        if (sprite.iconUrl === url) {
                            sprite.spriteFrame = new cc.SpriteFrame(resource);
                        }
                    }
                });
            }
        },

        /**
         * @param  {} sprite
         * @param  {} player
         * @param  {} needCheck 需要检测加载好的是不是当前需要显示的头像
         */
        loadResPortrait: function (sprite, player) {
            if (player.isLocal) {
                var url = PlayerData.instance.iconUrl;
                if (Number(url)) {
                    var newUrl = "texture/defaultPortrait/avatar-player-0" + url;
                    cc.loader.loadRes(newUrl, cc.SpriteFrame, (error, resource) => {
                        if (error) {
                            cc.error(error);
                        } else if (resource) {
                            if (!sprite.iconUrl || sprite.iconUrl === url) {
                                sprite.spriteFrame = resource;
                            }
                        }
                    })
                } else {
                    if (PlatformMgr.platformType === PlatformType.WECHAT) {
                        var newUrl = '';
                        if (url.includes('?')) {
                            newUrl = url + '&t=' + Math.random();
                        } else {
                            newUrl = url + '?t=' + Math.random();
                        }
                        cc.loader.load({
                            url: newUrl,
                            type: 'jpg',
                        }, (error, resource) => {
                            if (error) {
                                cc.error(error);
                            } else if (resource) {
                                if (!sprite.iconUrl || sprite.iconUrl === url) {
                                    sprite.spriteFrame = new cc.SpriteFrame(resource);
                                }
                            }
                        });
                    }
                }
            } else {
                var newUrl = "texture/portrait/pic" + player.iconUrl;
                cc.loader.loadRes(newUrl, cc.SpriteFrame, (error, resource) => {
                    if (error) {
                        cc.error(error);
                    } else if (resource) {
                        if (!sprite.iconUrl || sprite.iconUrl === player.iconUrl) {
                            sprite.spriteFrame = resource;
                        }
                    }
                })
            }
        },


        loadAIPortrait: function (sprite, url) {
            var newUrl = "texture/portrait/pic" + url;
            cc.loader.loadRes(newUrl, cc.SpriteFrame, (error, resource) => {
                if (error) {
                    cc.error(error);
                } else if (resource) {
                    if (sprite.iconUrl === url) {
                        sprite.spriteFrame = resource;
                    }
                }
            })
        },


        loadResFlag: function (sprite, url) {
            var newUrl = "texture/flag/flag-US";
            if (url) {
                newUrl = "texture/flag/flag-" + url;
            }
            if(!cc.loader._getResUuid(newUrl, cc.SpriteFrame)) {
                newUrl = "texture/flag/flag-unknown";
            }

            UIUtil.loadResSprite(sprite, newUrl);
        },



        loadUIPrefab: function (prefabPath, callback) {
            cc.loader.loadRes(prefabPath, cc.Prefab, (error, resource) => {
                if (error) {
                    cc.error(error);
                    if (callback) {
                        callback(null);
                    }
                } else {
                    if (resource) {
                        if (callback) {
                            callback(cc.instantiate(resource));
                        }
                    }
                }
            });
        }
    },

    // update (dt) {},
});