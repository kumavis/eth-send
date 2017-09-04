const ProviderEngine = require('web3-provider-engine')
const DefaultFixture = require('web3-provider-engine/subproviders/default-fixture.js')
const NonceTrackerSubprovider = require('web3-provider-engine/subproviders/nonce-tracker.js')
const CacheSubprovider = require('web3-provider-engine/subproviders/cache.js')
const FilterSubprovider = require('web3-provider-engine/subproviders/filters.js')
const HookedWalletEthTxSubprovider = require('web3-provider-engine/subproviders/hooked-wallet-ethtx.js')
const RpcSubprovider = require('web3-provider-engine/subproviders/rpc.js')
const ethUtil = require('ethereumjs-util')

module.exports = ZeroClientProvider


function ZeroClientProvider(opts){
  opts = opts || {}

  var engine = new ProviderEngine()

  // static
  var staticSubprovider = new DefaultFixture()
  engine.addProvider(staticSubprovider)

  // nonce tracker
  engine.addProvider(new NonceTrackerSubprovider())

  // cache layer
  var cacheSubprovider = new CacheSubprovider()
  engine.addProvider(cacheSubprovider)

  // filters
  var filterSubprovider = new FilterSubprovider()
  engine.addProvider(filterSubprovider)

  // id mgmt
  var idmgmtSubprovider = new HookedWalletEthTxSubprovider({
    getAccounts: function(cb){
      var addressBuffer = ethUtil.privateToAddress(opts.privateKey)
      var accounts = [ethUtil.bufferToHex(addressBuffer)]
      cb(null, accounts)
    },
    getPrivateKey: function(address, cb){
      cb(null, opts.privateKey)
    },
    // approveTransaction: function(txParams, cb){
    //   console.log('approveTransaction?')
    //   console.log(txParams)
    // },
  })
  engine.addProvider(idmgmtSubprovider)

  // data source
  var rpcSubprovider = new RpcSubprovider({
    rpcUrl: opts.rpcUrl || 'https://testrpc.metamask.io/',
  })
  engine.addProvider(rpcSubprovider)

  // start polling
  engine.start()

  return engine

}