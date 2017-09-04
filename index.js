#!/usr/bin/env node
const argv = require('yargs').argv
const Transaction = require('ethereumjs-tx')
const ethUtil = require('ethereumjs-util')
const BN = ethUtil.BN
const ZeroClient = require('./provider')
const EthQuery = require('eth-query')

var privateKey = ethUtil.toBuffer(ethUtil.addHexPrefix(argv.privateKey))
var toAddress = ethUtil.addHexPrefix(argv.to)
console.log('privateKey', privateKey)
console.log('toAddress', toAddress)


var sender = ethUtil.bufferToHex(ethUtil.privateToAddress(privateKey))
var provider = ZeroClient({
  // rpcUrl: 'https://morden.infura.io/',
  rpcUrl: 'https://mainnet.infura.io/',
  privateKey: privateKey,
})
var eth = new EthQuery(provider)

// log new blocks
provider.on('block', function(block){
  console.log('BLOCK CHANGED:', '#'+block.number.toString('hex'), '0x'+block.hash.toString('hex'))
})

eth.getBalance(sender, function(err, balance){
  if (err) throw err

  console.log(balance)
  var amount = new BN(ethUtil.toBuffer(balance))
  // tx base fee * hard coded gasPrice
  var txBaseGas = new BN(21000)
  var gasPrice = new BN(0x4a817c800)
  var thisTxFee = txBaseGas.mul(gasPrice)
  amount.isub(thisTxFee)

  var txParams = {
    from: sender,
    to: toAddress,
    // value: 1,
    value: bnToHex(amount),
    gasPrice: bnToHex(gasPrice),
    gas: bnToHex(txBaseGas),
  }
  console.log('sendTransaction', txParams)
  eth.sendTransaction(txParams, function(err, txHash){
    provider.stop()
    if (err) console.log(err)
    if (err) throw err
    console.log('tx hash:', txHash)
    console.log(`https://etherscan.io/tx/${txHash}`)
  })

})

function bnToHex(bn){
  return ethUtil.bufferToHex(bn.toBuffer())
}