import Web3 from "web3";
import abiJson from "./abi.json";

const network = 'https://eth-sepolia.g.alchemy.com/v2/ABRLHWqw7mF6DYgLygNgwsUpMnQ5XGh5';
const web3 = new Web3(new Web3.providers.HttpProvider(network));
const contractAddress = '0xfCb712Ebba5323b0562Ec712452325A4E33863CD';
let contractABI = abiJson.abi;
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);


export {contractInstance, contractAddress, web3};