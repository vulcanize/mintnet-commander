class Node {
  constructor (name) {
    this.name = name
    this.data = {}
  }

  getData (key) {
    return this.data[key]
  }

  setData (key, value) {
    this.data[key] = value
  }
}

module.exports = Node
