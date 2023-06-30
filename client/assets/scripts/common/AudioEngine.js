/**
 * @fileoverview 音乐播放器
 * @author meifan@gameley.cn (梅凡)
 */

const GameData = require('GameData');

var AudioEngine = cc.Class({
    extends: cc.Component,

    statics: {
        instance: null,
    },

    properties: {
        musics: {
            type: cc.AudioClip, // use 'type:' to define an array of Texture2D objects
            default: []
        },
        sounds: {
            type: cc.AudioClip, // use 'type:' to define an array of Texture2D objects
            default: []
        },
    },

    init: function () {
        AudioEngine.instance = this;

        // const volume = this.getEffectsVolume();
        // this.setEffectsVolume(0.01);
        // for(var sound of this.sounds) {
        //     cc.audioEngine.playEffect(sound, false);
        // }
        // this.setEffectsVolume(volume);
    },

    playMusic: function (musicID, loop = true) {
        if(GameData.instance._audioOpen) {
            var audioID = cc.audioEngine.playMusic(this.musics[musicID], loop);
            return audioID;
        }
        return -1;
    },

    stopMusic: function () {
        if(GameData.instance._audioOpen) {
            cc.audioEngine.stopMusic();
        }
    },

    playSound: function (musicID, loop = false) {
        if(GameData.instance._audioOpen) {
            var audioID = cc.audioEngine.playEffect(this.sounds[musicID], loop);
            return audioID;
        }
        return -1;
    },

    stopSound: function (audioID) {
        if(GameData.instance._audioOpen) {
            if(audioID) {
                cc.audioEngine.stopEffect(audioID);
            }
        }

    },

    stopAllSound: function () {
        if(GameData.instance._audioOpen) {
            cc.audioEngine.stopAllEffects();
        }
    },

    setEffectsVolume: function (value) {
        cc.audioEngine.setEffectsVolume(value);
    },

    getEffectsVolume: function () {
        return cc.audioEngine.getEffectsVolume();
    }

});