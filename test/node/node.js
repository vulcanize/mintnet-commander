/* eslint-env mocha */

const helpers = require('../helpers')
const Node = require(helpers.getPath('lib/node/node'))
const expect = require('chai').expect

describe('Abstract Node', () => {
  it('should have name and data', () => {
    let name = 'name'
    let node = new Node(name)

    expect(node.name).to.equal(name)
    expect(node.data).to.be.instanceof(Object)
  })

  it('should set data', () => {
    let node = new Node('')
    let data = [ 'key', 'value' ]

    node.setData(data[0], data[1])

    let getData = node.getData(data[0])

    expect(data[1]).to.equal(getData)
  })
})
