const chai = require('chai')
const Web3 = require('web3')

const IP = `http://localhost:4001`
const provider = new Web3.providers.HttpProvider(IP)
const web3 = new Web3(provider)

describe('web3.personal', () => {
  describe('newAccount', () => {
    console.log(web3.personal.listAccounts)

    it('should list 5 accounts', (cb) => {
      let accounts = web3.personal.listAccounts

      if (accounts.length != 5)
        return cb('Accounts count is ', accounts.length)

      cb()
    })

    it('should fail', (cb) => {
      cb('Failed')
    })

    it('should success', (cb) => {
      cb()
    })
  })
})
