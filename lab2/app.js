const CONTRACT_ADDRESS = "0x7328ac79FbA76F218e959F4962E8972b32652491";
const SEPOLIA_CHAIN_ID = 11155111;

const CONTRACT_ABI = [
    {"constant":false,"inputs":[{"name":"numberToBet","type":"uint256"}],"name":"bet","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},
    {"constant":false,"inputs":[],"name":"withdrawContractFund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},
    {"constant":true,"inputs":[{"name":"player","type":"address"}],"name":"checkPlayerExists","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[],"name":"maxAmountOfBets","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[],"name":"minimumBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[],"name":"numberWinner","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[],"name":"numberOfBets","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},
    {"constant":true,"inputs":[],"name":"totalBet","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},
    {"inputs":[{"name":"_minimumBet","type":"uint256"},{"name":"_maxAmountOfBets","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[{"indexed":false,"name":"player","type":"address"},{"indexed":false,"name":"number","type":"uint256"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"BetPlaced","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"name":"winner","type":"uint256"},{"indexed":false,"name":"pool","type":"uint256"},{"indexed":false,"name":"paid","type":"uint256"},{"indexed":false,"name":"carried","type":"uint256"}],"name":"RoundSettled","type":"event"}
];

let web3;
let casinoContract;
let userAccount = null;
let selectedNumber = null;

const domAccount = document.getElementById("account");
const domNetwork = document.getElementById("networkId");
const domContractAddr = document.getElementById("contractAddr");
const domContractBalance = document.getElementById("contractBalance");
const domMinBet = document.getElementById("minBet");
const domBetCount = document.getElementById("betCount");
const domMaxBet = document.getElementById("maxBet");
const domWinNumber = document.getElementById("winNumber");
const domSelected = document.getElementById("selected");
const domPlaceBet = document.getElementById("placeBet");
const domNumberPanel = document.getElementById("numberPanel");
const domEventLog = document.getElementById("eventLog");

domContractAddr.innerText = CONTRACT_ADDRESS;

function addLog(text) {
    const time = new Date().toLocaleTimeString();
    domEventLog.innerHTML += `[${time}] ${text}<br/>`;
    domEventLog.scrollTop = domEventLog.scrollHeight;
}

function renderNumberButtons() {
    domNumberPanel.innerHTML = "";
    for(let i = 1; i <= 10; i++) {
        const btn = document.createElement("button");
        btn.className = "num-btn";
        btn.innerText = i;
        btn.onclick = ()=>{
            document.querySelectorAll(".num-btn").forEach(b=>b.classList.remove("selected"));
            btn.classList.add("selected");
            selectedNumber = i;
            domSelected.innerText = i;
        };
        domNumberPanel.appendChild(btn);
    }
}

async function refreshGameState(){
    if(!casinoContract) return;
    try{
        const minBetWei = await casinoContract.methods.minimumBet().call();
        const maxBets = await casinoContract.methods.maxAmountOfBets().call();
        const currentBets = await casinoContract.methods.numberOfBets().call();
        const lastWin = await casinoContract.methods.numberWinner().call();
        const balanceWei = await web3.eth.getBalance(CONTRACT_ADDRESS);

        domMinBet.innerText = web3.utils.fromWei(minBetWei,"ether");
        domMaxBet.innerText = maxBets;
        domBetCount.innerText = currentBets;
        domWinNumber.innerText = lastWin || "None";
        domContractBalance.innerText = web3.utils.fromWei(balanceWei,"ether");
    }catch(e){
        console.error("refresh state error:",e);
    }
}

function subscribeContractEvents(){
    casinoContract.events.BetPlaced({},(err,event)=>{
        if(err) return console.error(err);
        addLog(`✅ New Bet! Player:${event.returnValues.player}, Number:${event.returnValues.number}, Amount:${web3.utils.fromWei(event.returnValues.amount,"ether")} ETH`);
        refreshGameState();
    })

    casinoContract.events.RoundSettled({},(err,event)=>{
        if(err) return console.error(err);
        addLog(`🎉 Round Finished! Winner Number: ${event.returnValues.winner}. Pool:${web3.utils.fromWei(event.returnValues.pool,"ether")} ETH`);
        refreshGameState();
    })
}

async function connectMetaMask(){
    if(!window.ethereum){
        alert("MetaMask is required! Please install MetaMask browser extension.");
        return false;
    }
    try{
        web3 = new Web3(window.ethereum);
        const chainIdRaw = await web3.eth.getChainId();
        const chainId = Number(chainIdRaw);
        domNetwork.innerText = chainId;

        if(chainId !== SEPOLIA_CHAIN_ID){
            alert("⚠️ Please switch MetaMask to Sepolia Testnet!");
            addLog("❌ Wrong network, need Sepolia Testnet");
            return false;
        }

        const accounts = await window.ethereum.request({method:"eth_requestAccounts"});
        userAccount = accounts[0];
        domAccount.innerText = userAccount;
        domPlaceBet.disabled = false;

        casinoContract = new web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        addLog("✅ Wallet connected to Sepolia");
        await refreshGameState();
        subscribeContractEvents();
        return true;
    }catch(err){
        addLog(`❌ Connect failed: ${err.message}`);
        console.error(err);
        return false;
    }
}

domPlaceBet.onclick = async function(){
    if(!userAccount) await connectMetaMask();
    if(selectedNumber === null){
        alert("Please select a number between 1‑10 first.");
        return;
    }
    domPlaceBet.disabled = true;
    try{
        addLog(`📤 Sending bet: number ${selectedNumber}, value 0.1 ETH`);
        await casinoContract.methods.bet(selectedNumber).send({
            from: userAccount,
            value: web3.utils.toWei("0.1","ether")
        });
        addLog("✅ Bet transaction submitted");
    }catch(err){
        addLog(`❌ Bet transaction failed: ${err.message}`);
        alert("Bet failed: "+err.message);
    }finally{
        domPlaceBet.disabled = false;
    }
}

if(window.ethereum){
    window.ethereum.on("accountsChanged", async ()=>{
        userAccount = null;
        domAccount.innerText = "Not connected";
        domPlaceBet.disabled = true;
        await connectMetaMask();
    });
    window.ethereum.on("chainChanged", async ()=>{
        await connectMetaMask();
    });
}

window.onload = function(){
    renderNumberButtons();
    connectMetaMask();
};
