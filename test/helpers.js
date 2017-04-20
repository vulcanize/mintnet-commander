const path = require('path')
const root = path.join(__dirname, '..')

exports.getPath = (relativePath) => {
  return path.join(root, relativePath)
}
