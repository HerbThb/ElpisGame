/**
 * @fileoverview PlaySoundByOwner
 * @author meifan@gameley.cn (梅凡)
 */

const AudioEngine = require('AudioEngine');
const SoundID = require('Types').SoundID;

const PlaySoundByOwner = cc.Class({
    extends: cc.Component,

    properties: {
        player: null,
        _isDefence: true,
        audioID: null,
    },

    init: function (entityPlayer) {
        this.player = entityPlayer;
    },

    update: function (dt) {
        if(this.player.isDead) {
            if(this._isDefence) {
                this._isDefence = false;
                AudioEngine.instance.stopSound(this.audioID);
                this.audioID = null;
            }
            return;
        }

        if(this._isDefence !== this.player.isDefence) {
            this._isDefence = this.player.isDefence;
            
            if(this._isDefence) {
                this.audioID = AudioEngine.instance.playSound(SoundID.Spin, true);
            } else {
                AudioEngine.instance.stopSound(this.audioID);
                this.audioID = null;
            }
        }
    }

});