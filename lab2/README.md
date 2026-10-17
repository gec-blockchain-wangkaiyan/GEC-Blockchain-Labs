 # Ethereum course — Assignment / Lab 2

Casino DApp for SWUFE / GEC Academy's Introduction to Ethereum and Cloud Blockchain Solutions Engineering.

The final implementation uses React, Babel, webpack, Web3.js and MetaMask on Sepolia. The Solidity contract is adapted from the Casino tutorial and includes settlement corrections.

## Final deployment and observed results

- Network: Sepolia, chain ID 11155111.
- Contract: `0xa21408BdCcBf43b5767159Aeb2BE0E24f4F91eE8`.
- Deployment transaction: `0x03ad41652e65079580a0846e54e00515d7dc5bf7f89ed9ee26ef4078f9b73d3f`.
- Successful React bet: `0xa28e71afabc8dcf2f62305720dd6e760e487a522039c1df65700bf8e9dce2df4`.
- Test account: `0xf022a488D7730A66D9Aa986077162425CA910200`.
- Bet: number 5, 0.1 Sepolia ETH. Receipt status was 0x1 and the revised contract emitted BetPlaced.
- Public website: [https://2603e5ea.pinit.eth.limo](https://2603e5ea.pinit.eth.limo)
- Source revision: [https://github.com/zhuxuanze/ethereum-course/commit/a07abc7](https://github.com/zhuxuanze/ethereum-course/commit/a07abc7)
