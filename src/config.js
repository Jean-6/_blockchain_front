import Web3 from "web3";
import abiJson from "./abi.json";

const network = 'https://eth-sepolia.g.alchemy.com/v2/ABRLHWqw7mF6DYgLygNgwsUpMnQ5XGh5';
const web3 = new Web3(new Web3.providers.HttpProvider(network));
const contractAddress = '0xfCb712Ebba5323b0562Ec712452325A4E33863CD';
let contractABI = abiJson.abi;
const contractInstance = new web3.eth.Contract(contractABI, contractAddress);
/*const accountAddress = '0x85487A17c47e08A0480E38B6C8306001Ed810dC0';*/
const accountAddress = '0xec21c4104eca69655f7d5e959df27489382d0447';

/*const privateKey = "b0ad02b7d3204c9c65b7d4b18e1b59c1f0db21f79448c38d39625d6d1ab020bd"*/
const privateKey = "947727c5c4f19411fbaae0bbe96ea0811d3d2729175cfa9a8287e92ad9686c06"

export {contractInstance, accountAddress, contractAddress, web3, privateKey};