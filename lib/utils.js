'use strict'

const execFile = require('child_process').execFile

exports.sleep = (timeout) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, timeout)
  })
}

exports.execFile = (file, args, options) => {
  return new Promise((resolve, reject) => {
    execFile(file, args, options, (error, stdout, stderr) => {
      if (error) {
        reject(error)
        return
      }

      resolve({
        stdout: stdout,
        stderr: stderr
      })
    })
  })
}
