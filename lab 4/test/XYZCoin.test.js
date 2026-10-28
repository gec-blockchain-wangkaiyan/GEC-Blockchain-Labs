const XYZCoin = artifacts.require("XYZCoin");
const truffleAssert = require('truffle-assertions');

contract("XYZCoin", async accounts => {
  const owner = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  it("should set the token name correctly", async () => {
    let xyzCoinInstance = await XYZCoin.deployed();
    assert.equal(await xyzCoinInstance.name(), "XYZCoin");
  });

  it("creator initial balance equals total supply", async () => {
    let instance = await XYZCoin.deployed();
    const supply = await instance.totalSupply();
    const ownerBal = await instance.balanceOf(owner);
    assert.equal(supply.toNumber(), ownerBal.toNumber());
  });

  it("can transfer tokens via transfer()", async () => {
    let instance = await XYZCoin.deployed();
    await instance.transfer(user1, 100, {from: owner});
    const bal = await instance.balanceOf(user1);
    assert.equal(bal.toNumber(),100);
  });

  it("allowance can be set and read", async () => {
    let instance = await XYZCoin.deployed();
    await instance.approve(user1, 50, {from: owner});
    const allowance = await instance.allowance(owner, user1);
    assert.equal(allowance.toNumber(),50);
  });

  it("can transferFrom on behalf of another account", async () => {
    let instance = await XYZCoin.deployed();
    await instance.approve(user1, 50, {from: owner});
    await instance.transferFrom(owner, user2, 50, {from: user1});
    const bal = await instance.balanceOf(user2);
    assert.equal(bal.toNumber(),50);
  });

  // Advanced truffle-assertion tests
  it("transfer reverts when insufficient balance", async () => {
    let instance = await XYZCoin.deployed();
    await truffleAssert.reverts(
      instance.transfer(owner, 99999, {from: user1}),
      "Insufficient balance"
    );
  });

  it("transferFrom reverts without approval", async () => {
    let instance = await XYZCoin.deployed();
    await truffleAssert.reverts(
      instance.transferFrom(user1, user2, 10, {from: user2}),
      "Allowance exceeded"
    );
  });

  it("transfer emits Transfer event", async () => {
    let instance = await XYZCoin.deployed();
    let tx = await instance.transfer(user1, 0, {from: owner});
    truffleAssert.eventEmitted(tx, "Transfer");
  });

  it("transferFrom emits Transfer event", async () => {
    let instance = await XYZCoin.deployed();
    await instance.approve(user1, 10, {from: owner});
    let tx = await instance.transferFrom(owner, user2, 0, {from: user1});
    truffleAssert.eventEmitted(tx, "Transfer");
  });

  it("approve emits Approval event", async () => {
    let instance = await XYZCoin.deployed();
    let tx = await instance.approve(user1, 20, {from: owner});
    truffleAssert.eventEmitted(tx, "Approval");
  });
});
