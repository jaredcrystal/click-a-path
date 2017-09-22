'use babel'

import path from "path"
import fs from "fs"

module.exports = {
  activate() {
    require("atom-package-deps").install("path-hyperclick")
  },
  getProvider() {
    return {
      wordRegExp: /\.{0,2}\/[A-Za-z0-9\-_\/.][A-Za-z0-9\-_\/. ]*/g,
      providerName: "path-hyperclick",
      /**
       * textEditor {atom$TextEditor}
       * path {string}
       * range {atom$Range}
       */
      getSuggestionForWord(textEditor, _path, range){
        let dir = path.dirname(atom.workspace.getActiveTextEditor().getPath())
        _path = path.join(dir, _path)
        return {
          range,
          callback() {
            if (_path === undefined || _path.length === 0) { return }
            fs.exists(_path, (exists) => {
              if (exists) {
                fs.lstat(_path, (_, stats) => {
                  if (stats && stats.isDirectory()) {
                    fs.exists(_path + '/presenter.js', (exists) => {
                      if (exists) {
                        atom.workspace.open(_path + '/presenter.js')
                        return
                      } else {
                        fs.exists(_path + '/index.js', (exists) => {
                          if (exists) {
                            atom.workspace.open(_path + '/index.js')
                            return
                          } else {
                            atom.notifications.addError("Cannot open directory")
                            return
                          }
                        })
                      }
                    })
                  } else { // not a directory, but does exist
                    atom.workspace.open(_path)
                    return
                  }
                })
              } else { // doesn't exist, try with .js
                fs.exists(_path + '.js', (exists) => {
                  if (exists) {
                    atom.workspace.open(_path + '.js')
                    return
                  } else {
                    atom.notifications.addError("File doesn't exist")
                    return
                  }
                })
              }
            })

          }
        }
      }
    }
  }
}
