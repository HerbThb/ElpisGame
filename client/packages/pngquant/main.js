'use strict';

function onBeforeBuildFinish (options, callback) {
  var utils = require(Editor.url('packages://pngquant/utils/utils'));
  utils.onBeforeBuildFinish(options, callback)
}

module.exports = {
  load() {
    Editor.Builder.on('before-change-files', onBeforeBuildFinish);
  },

  unload() {
    Editor.Builder.removeListener('before-change-files', onBeforeBuildFinish);
  },

  // register your ipc messages here
  messages: {
    open() {
      // open entry panel registered in package.json
      Editor.Panel.open('pngquant');
    },
  },
};