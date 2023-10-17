import Web3 from "web3";
import abiJson from "./abi.json";

const network = 'https://eth-sepolia.g.alchemy.com/v2/ABRLHWqw7mF6DYgLygNgwsUpMnQ5XGh5';
const web3 = new Web3(new Web3.providers.HttpProvider(network));
const contractAddress = '0x72840AB60269A8b336695cB3759A97a15Bc08E7b';
let contractABI = abiJson.abi;
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
const accountAddress = '0xec21c4104eca69655f7d5e959df27489382d0447';

export {contractInstance, accountAddress, contractAddress, web3};