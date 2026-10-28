const Web3 = require('web3');
const INFURA_URL = "https://mainnet.infura.io/v3/YOUR_INFURA_API_KEY";
const web3 = new Web3(new Web3.providers.HttpProvider(INFURA_URL));

async function findFirstContractCreationTx() {
  const latestBlock = await web3.eth.getBlockNumber();
  // Contract creation tx: to = null
  for(let blockNum = 0; blockNum <= latestBlock; blockNum++){
    const block = await web3.eth.getBlock(blockNum, true);
    for(const tx of block.transactions){
      if(tx.to === null){
        console.log("First contract creation block number: ", blockNum);
        console.log("Transaction hash: ", tx.hash);
        return;
      }
    }
    console.log("Scanning block: ", blockNum);
  }
}
findFirstContractCreationTx();
