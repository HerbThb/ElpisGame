const Languages = ['en-us', 'japan', 'korea', 'de', 'ru', 'twn', 'es', 'fr', 'pt']
const Tools = require('Tools');
const LanguageMgr = cc.Class({
    statics: {
        curLang: 'en-us',
        curIndex: 0,
        setLang(index) {
            if (Languages[index]) {
                Tools.setItem('curLanguage', index);
                LanguageMgr.curIndex = index;
                LanguageMgr.curLang = Languages[index];
            }
        }
    }
});