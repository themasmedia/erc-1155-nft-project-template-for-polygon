# **ERC-1155 NFT Project Template for Polygon**, by [Mas](https://github.com/Masangri/)

## Supported Token Standards:
- [**ERC-165**](https://eips.ethereum.org/EIPS/eip-165)   Standard Interface Detection
- [**ERC-1155**](https://eips.ethereum.org/EIPS/eip-1155)  Multi Token Standard
- [**ERC-2981**](https://eips.ethereum.org/EIPS/eip-2981)  NFT Royalty Standard

## Features & Extensions:
- Tokens are **Burnable** by their repspective owners (both individually and by batch).
- Transactions on the contract are **Pausable** by the contract owner, if needed.
- **Supply** and **Metadata URI** are set unqiuely and permanently per token ID by the contract owner.<br/>
  This is to allow for NFTs for new token IDs to be minted in the future, free of the ERC1155.url/{tokenId} restriction<br/>
  (useful for metadata on decentralized storage).
- Marketplace support for universal **Royalty** standards (ERC-2981).

## Third-Party Support:
- Gasless transactions on Polygon (via *meta-transactions*)
- Compatable with Opensea's ERC-1155 metadata standards (uri() function differs slightly from the ERC1155 standard).

## Instructions:

1. If you haven't done so already, install the following:
   - [ ] [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
   - [ ] [nodeJS/npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
   - [ ] [yarn](https://classic.yarnpkg.com/lang/en/docs/install)
    (optional; you can also just use `npm`/`npx` if you prefer, but all steaps below will be using `yarn`)
<br/><br/>

2. Clone the project:
   ```
   git clone https://github.com/Masangri/erc-1155-nft-project-template-for-polygon.git
   cd erc-1155-nft-project-template-for-polygon
   yarn install
   ```

3. Create free accounts and set up API keys for the following the following platforms:
   - [ ] [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
    (Polygon RPC node services)
   - [ ] [Polygonscan](https://polygonscan.com/)
    (for veriying your contract after deploying)
<br/><br/>

4. Copy the `env` file and rename it to `.env`:
   ```
   cp env .env
   ```

5. Set the following environment variables by editing the following fields in the `.env` file:
   - [ ] `ALCHEMY_API_KEY` and/or `INFURA_API_KEY`
    (API key token for your [Alchemy](https://www.alchemy.com/) and/or [Infura](https://infura.io/) accounts, respectively)
   - [ ] `POLYGONSCAN_API_KEY`
    (API key token for your [Polygonscan](https://polygonscan.com/) account)
   - [ ] `OWNER_PRIVATE_KEY`
    (account to deploy the contract from - **never** reveal your seed phrase and/or private key(s) for your account(s)) 
   - [ ] `GUEST_PRIVATE_KEY`
    (optional; used for testing on live networks)
   - [ ] `PROJECT_NAME`
    (the human-readable name of your project)
   - [ ] `PROJECT_SYMBOL`
    (the ticker symbol for your project (limiting it to 3-4 characters is recommended))
   - [ ] `ROYALTY_FRACTION`
    (the default royalty in basis points (bips) for secondary sales (you can always update this after deploying the contract))
<br/><br/>

6. Upload metadata content:
- For most NFT projects, it is preferrable to use decentralized storage options like [IPFS](https://ipfs.io/) and [Arweave](https://www.arweave.org/),
  as opposed to centralized and self-hosted options.<br/>
  Platforms like [Pinata](https://www.pinata.cloud/) & [NFT.STORAGE](https://nft.storage/), and [ardrive](https://ardrive.io/) are solid code-free options for IPFS and Arweave, repectively.
- Upload the metadata files
  (JSON metadata & media content files - see [OpenSea's metadata standards](https://docs.opensea.io/docs/metadata-standards)
  and the many NFT tutorials online for more info).
- Optional: Upload a properly formatted JSON file you are implementing OpenSea's contract-level storefront metadata
  (see contractURI() in the [Technical Notes](#technical-notes) section).
<br/><br/>

7. Edit the following file names and hard-coded values in `contracts/`:
   - [ ] Rename `ERC1155TestProject.sol` to the same value set for `PROJECT_NAME` in Step 5 above.
   - [ ] In the newly renamed `[PROJECT_NAME].sol` contract, change the following:
     - On lines 20 and 122, replace `ERC1155TestProject` with `[PROJECT_NAME]`
     - If you uploaded contract-level storefront metadata in Step 6:<br/>
       On line 71, return the URI string to your contract-level metadata (see contractURI() in the [Technical Notes](#technical-notes) section).
     - If not, you can comment out or remove the contractURI() function (lines 61-73)
<br/><br/>

8. Fund your Polygon account(s):
   - [ ] **Testnet:** Obtain $MATIC on the Polygon Mumbai testnet from a free faucet site:
     - [faucet.polygon.technology](https://faucet.polygon.technology/)
     - [mumbaifaucet.com](https://mumbaifaucet.com/) (get bonus $MATIC if you sign in with your Alchemy account)
   - [ ] **Mainnet:** Obtain $MATIC on the Polygon POS chain. **DYOR** but here are some options:
     - directly from your cryptocurrency exchange, if they support it.
     - the [Polygon PoS chain bridge](https://wallet.polygon.technology/).
     - cross-chain bridges like [Across](https://across.to/) and [Hop](https://app.hop.exchange/).
<br/><br/>

1. Run the unittests on the default local Hardhat network successfully.
   ```
   yarn hardhat test
   ```

### **TODO**
10. Compile and deploy to the Polygon Mumbai testnet:
- [ ] Verify contract on Polygonscan
- [ ] Check OpenSea

### **TODO**
## Technical Notes:
- The Hardhat Ethereum development environment is used for debugging, testing, and deploying contracts.
  More information is available on the Hardhat [website](https://hardhat.org/)
- Chai testing
  https://docs.opensea.io/docs/contract-level-metadata contractURI()
  https://opensea.io/blog/announcements/decentralizing-nft-metadata-on-opensea/} PermanentURI()
  https://docs.opensea.io/docs/polygon-basic-integration isApprovedForAll() override & msgSender() override meta-transactions 


```
yarn hardhat help
```
