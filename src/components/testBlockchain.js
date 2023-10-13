import Web3 from 'web3';
import abiJson from '../abi.json' assert { type: 'json' };
const network = 'https://eth-sepolia.g.alchemy.com/v2/ABRLHWqw7mF6DYgLygNgwsUpMnQ5XGh5';
const web3 = new Web3(new Web3.providers.HttpProvider(network));
const contractAddress = '0x72C08dC1d6499e1235323B781A2Dc5C650EDf9F6';
let contractABI = abiJson.abi;
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
const accountAddress = '0xec21c4104eca69655f7d5e959df27489382d0447';  // Your Ethereum account address


const functionCallData = contractInstance.methods.openPack().encodeABI();
const transactionObject = {
    to: contractAddress,
    data: functionCallData,
    value: web3.utils.toWei('0.01', 'ether'),
    gas: web3.utils.toHex(21064),
    gasPrice: web3.utils.toHex(web3.utils.toWei('10', 'gwei')),
    from: accountAddress
};
const signedTx = await web3.eth.accounts.signTransaction(transactionObject, '947727c5c4f19411fbaae0bbe96ea0811d3d2729175cfa9a8287e92ad9686c06');
const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
console.log('Transaction receipt:', receipt);
