# **ERC-1155 NFT Project Template for Polygon**, by [Mas](https://github.com/Masangri/)

## A sample deployment of this project can be referenced in the following links:
- [Verified contract on Polygonscan (Mumbai Testnet)](https://mumbai.polygonscan.com/address/0x41f459c8149A04Da83Ad9530F92986783Ef1b73A#code)
- [Collection listed on OpenSea (Mumbai Testnet)](https://testnets.opensea.io/collection/blender-frens)
- [Github repository](https://github.com/Masangri/erc-1155-nft-project-template-for-polygon)
<br/><br/>

## Supported Token Standards:
- [**ERC-165**](https://eips.ethereum.org/EIPS/eip-165)   Standard Interface Detection
- [**ERC-1155**](https://eips.ethereum.org/EIPS/eip-1155)  Multi Token Standard
- [**ERC-2981**](https://eips.ethereum.org/EIPS/eip-2981)  NFT Royalty Standard

## Features & Extensions:
- Tokens are **Burnable** by their repspective owners (both individually and by batch).
- Transactions on the contract are **Pausable** by the contract owner, if needed.
- **Supply** and **Metadata URI** are set unqiuely and permanently per token ID by the contract owner.<br/>
  This is to alloweditions for new token IDs to be minted in the future, free of the ERC1155.url/{tokenId} restriction<br/>
  (useful for metadata on decentralized storage where maintaining a folder/file structure is difficult).
- Marketplace support for universal **Royalty** standards (ERC-2981).

## Third-Party Support:
- Gasless transactions on [**Polygon**](https://polygon.technology/) (via [*meta-transactions*](https://docs.opensea.io/docs/polygon-basic-integration))
- Compatable with [**Opensea**'s ERC-1155 metadata standards](https://docs.opensea.io/docs/metadata-standards)
  (uri() function differs slightly from the ERC-1155 standard).

## Instructions:

1. ### If you haven't done so already, install the following:
   - [ ] [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
   - [ ] [nodeJS/npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
   - [ ] [yarn](https://classic.yarnpkg.com/lang/en/docs/install)
     (optional; you can also just use `npm`/`npx` if you prefer, but all steaps below will be using `yarn`)
   - [ ] [VSCode](https://code.visualstudio.com/) (optional, but recommended for the extensions)
   - [ ] [Metamask](https://metamask.io/) (or similar wallet pletform, preferably with hardware wallet support, for connecting to dApps)
<br/><br/>

1. ### Clone the project:
   ```
   git clone https://github.com/Masangri/erc-1155-nft-project-template-for-polygon.git
   cd erc-1155-nft-project-template-for-polygon
   yarn install
   ```

1. ### Create free accounts and set up API keys for the Polygon and Mumbai (testnet) networks on the following the following platforms:
   - [ ] [Alchemy](https://www.alchemy.com/) or [Infura](https://infura.io/)
     (Polygon RPC node services)
   - [ ] [Polygonscan](https://polygonscan.com/)
     (for veriying your contract after deploying)
<br/><br/>

1. ### Copy the `env` file and rename it to `.env`:
   ```
   cp env .env
   ```

1. ### Set the following environment variables by editing the following fields in the `.env` file:
   - [ ] `ALCHEMY_API_KEY` and/or `INFURA_API_KEY`
     (API key token for your [Alchemy](https://www.alchemy.com/) and/or [Infura](https://infura.io/) accounts, respectively)
   - [ ] `POLYGONSCAN_API_KEY`
     (API key token for your [Polygonscan](https://polygonscan.com/) account)
   - [ ] `OWNER_PRIVATE_KEY`
     (account to deploy the contract from - **never** reveal your seed phrase and/or private key(s) for your account(s)) 
   - [ ] `PROJECT_NAME`
     (the human-readable name of your project)
   - [ ] `PROJECT_SYMBOL`
     (the ticker symbol for your project (limiting it to 3-4 characters is recommended))
   - [ ] `ROYALTY_FRACTION`
     (the default royalty in basis points (1% = 100 *bips*) for secondary sales (you can always update this after deploying the contract))
<br/><br/>

1. ### Upload metadata content:
   - [ ] For most NFT projects, it is preferrable to use decentralized storage options like [IPFS](https://ipfs.io/) and [Arweave](https://www.arweave.org/),
  as opposed to centralized and self-hosted options.<br/>
  Platforms like [Pinata](https://www.pinata.cloud/) & [NFT.STORAGE](https://nft.storage/), and [ardrive](https://ardrive.io/) are solid code-free options for IPFS and Arweave, repectively.
   - [ ] Upload the metadata files.
     (JSON metadata & media content files - see [OpenSea's metadata standards](https://docs.opensea.io/docs/metadata-standards)
     and the many NFT tutorials online for more info).
   - [ ] Optional: Upload a properly formatted JSON file if you are implementing **OpenSea**'s contract-level storefront metadata
     (see contractURI() in the [Technical Notes](#technical-notes) [Contract](#contract) section).
<br/><br/>

1. ### Edit the following file names and hard-coded values in `contracts/`:
   - [ ] Rename `ERC1155TestProject.sol` to the same value set for `<PROJECT_NAME>` in **Step 5** above.
   - [ ] In the newly renamed `<PROJECT_NAME>.sol` contract, change the following:
     - On lines 20 and 122, replace `ERC1155TestProject` with `<PROJECT_NAME>`
     - If you uploaded contract-level storefront metadata in **Step 6**, edit line 71 to return the URI string to your contract-level metadata
       (see contractURI() in the [Technical Notes](#technical-notes) [Contract](#contract) section).
     - If not, you can comment out or remove the contractURI() function altogether (lines 61-73).
<br/><br/>

1. ### Fund your Polygon account(s):
   - [ ] **Testnet:** Obtain $MATIC on the Polygon Mumbai testnet from a free faucet site:
     - [faucet.polygon.technology](https://faucet.polygon.technology/)
     - [mumbaifaucet.com](https://mumbaifaucet.com/) (you can get bonus $MATIC if you sign in with your Alchemy account)
   - [ ] **Mainnet:** Obtain $MATIC on the Polygon POS chain. **DYOR**, but here are some options:
     - directly from your cryptocurrency exchange, if they support it.
     - the [Polygon PoS chain bridge](https://wallet.polygon.technology/).
     - cross-chain bridges like [Across](https://across.to/) and [Hop](https://app.hop.exchange/).
<br/><br/>

1. ### Run the unittests on the default local Hardhat network successfully.
   ```
   yarn hardhat test
   ```

1. ### Compile and deploy to the Polygon Mumbai testnet:
   - [ ] Clean the cache and compile the contract.<br/>
     - `yarn hardhat clean && yarn hardhat compile`
   - [ ] Run the deploy.js script to deploy the contract.<br/>
     - `yarn hardhat run scripts/deploy.js --network polygonMumbai`
     - Copy the contract's deploy address from the console output. It will be needed to verify and interact with the contract. 👇
   - [ ] Verify the contract on [Polygonscan](https://mumbai.polygonscan.com).<br/>
     - Run the following code, replacing `<CONTRACT_ADDRESS>` with the address of your contract copied above:
     - `yarn hardhat verify --constructor-args arguments.js --network polygonMumbai <CONTRACT_ADDRESS>`
   - [ ] Once verified, interact with your contract on Polygonscan.<br/>
     - In a web browser, go to [Polygonscan](https://mumbai.polygonscan.com) and search for your contract,
       or go directly to `https://mumbai.polygonscan.com/address/<CONTRACT_ADDRESS>`.
     - Under the Contract tab (which should have a green checkmark), connect Metamask and interact with your contract (mint tokens, edit royalties, etc.).<br/>
       You can also use [**Remix**](https://remix.ethereum.org/) to easily interact with our contract, if your prefer.
   - [ ] Get your collection listed on OpenSea (testnet).
     - In a web browser, go to [OpenSea's Get Listed page](https://testnets.opensea.io/get-listed) and select the ***Live on a testnet*** option,
       select ***Mumbai***, and submit your contract address (it will require that at least one token has been minted on the contract).
     - If you implemented OpenSea's contract-level storefront metadata in **Step 6**, your OpenSea Storefront info will be automatically populated.<br/>
       If not, you will need to sert it up manually.<br/>
       Note that OpenSea does not natively support the ERC-2981 like other marketplaces, so you may need to set royalties manually.
<br/><br/>

1. ### Upon successful completion of **Step 10**, we're ready to compile and deploy to the Polygon mainnet:
   - [ ] Double-check that all your settings are functioning as required on testnet on Polygonscan and OpenSea before proceeding.<br/>
         Make any necessary updates to environment variables for the mainnet contract, such as private key values.
         
   - **Method 1** - VSCode & Hardhat - *easier but arguably less secure*:<br/>
     Deploy using the same method as *Step 10*, except on mainnet instead of testnet.
     - [ ] Deploy the contract using the deploy.js script to the **Polygon** network.
       - `yarn hardhat run scripts/deploy.js `**`--network polygon`**<br/><br/>

   - **Method 2** - VSCode, Hardhat, Remix IDE/Remixd Plug-In, and Injected Web3 (i.e. Metamask) - *extra setup, but reployment requires explicit, secure approval*:<br/>
     Deploy by connecting Hardhat to the Remix IDE, which features wallet support for contreact deployment.
     - [ ] Start the Remixd daemon by running `yarn remixd -u https://remix.ethereum.org`.
     - [ ] Go to [remix.ethereum.org](https://remix.ethereum.org/) and click ***Connect to Localhost***.
       You should see your directory appear as a workspace in the *FILE EXPLORERS* secion. Select `contracts/<PROJECT_NAME>.sol`.
     - [ ] In the *SOLIDITY COMPILER* section, check *Enable Hardhat Compilation* and select the Solidity compiler version set in your hardhat.config.js file (0.8.4).<br/>
       Click the 🔁*Compile* button (the *remix-compiler.config.js* file be created and/or updated).
     - [ ] *Optional*: To test Hardhat and Remix on with your local HJarhat network:
       - [ ] In a separate terminal, start a local Hardhat node by running `yarn hardhat node`.
       - [ ] In the *DEPLOY & RUN TRANSACTIONS* section, set the *ENVIRONMENT* to *Hardhart Provider*,
         select `<PROJECT_NAME>.sol` under *Contracts*, enter the constructor arguments, and click *Deploy*.
       - [ ] Once deployed, you can interact with the contract through the UI (toggle accounts under *ACCOUNTS*).
     - [ ] In the *DEPLOY & RUN TRANSACTIONS* section, set the *ENVIRONMENT* to either:
       - *Injected Web3* for browser-based wallets like *Metamask*.
       - *Wallet Connect* for mobile wallets like *Trust*.<br/>
       ...and connect the account you intend to deploy the contract with.<br/>
       Select `<PROJECT_NAME>.sol` under *Contracts*, enter the `<PROJECT_NAME>`,  constructor arguments (<PROJECT_NAME>), and click *Deploy*.
     - [ ] Approve the transaction to deploy the contract in your connected wallet (no environment variable or hardcoded private key necessary 😎).<br/><br/>

   - Once deployed successfully, verify your contract and get it listed on OpenSea just like we did on testnet, but with the following adjustments noted in **bold**.<br/>
     - [ ] Verify the contract on Polygonscan on the **Polygon** mainnet.
       - `yarn hardhat verify --constructor-args arguments.js `**`--network polygon`**` <CONTRACT_ADDRESS>`
       - Use [Polygonscan](https://polygonscan.com) on mainnet and search for your contract,
       or go directly to `https://`**`polygonscan.com`**`/address/<CONTRACT_ADDRESS>`.
     - [ ] Go to [OpenSea's Get Listed page](https://opensea.io/get-listed) and select the ***Live on a mainnet*** option and select ***Polygon***.

## Technical Notes:

### Development:
- [**Hardhat**](https://hardhat.org/) Ethereum development environment is used for debugging, testing, and deploying contracts.<br/>
  Run `yarn hardhat help` for information on specific ommands.
- [**Chai**](https://www.chaijs.com/) TDD/BDD library is used for running unittests.
- [**Visual Studio Code**]() IDE can be used for development locally and deploying contracts.
- [**Remix IDE**](https://remix.ethereum.org/) browser-based IDE can be used for development online and deploying contracts.
  - [**Remixd**](https://remix-ide.readthedocs.io/en/latest/remixd.html) plug-in can be used to connect VSCode to the Remix IDE web app
    (Hardhat will be listening on port 65522).<br/>
    [Further details on working with Hardhat and Remix together](https://remix-ide.readthedocs.io/en/latest/hardhat.html)
  - When using Remix IDE, you may need to manually activate the *REMIXD* and/or *WALLET CONNECT* plug-ins manually in the *PLUGINS MANAGER*.

### Network Settings:
- [Directions for connecting your wallet to Polygon Mainnet and Polygon Mumbai Testnet](https://docs.polygon.technology/docs/develop/metamask/config-polygon-on-metamask/).
### Contract:
- `contractURI()` function is used for implementing [**OpenSea**'s contract-level metadata](https://docs.opensea.io/docs/contract-level-metadata ).
- `PermanentURI()` event is used for [**OpenSea**'s permanent URI recommendation](https://opensea.io/blog/announcements/decentralizing-nft-metadata-on-opensea/}).
- `isApprovedForAll()` and `setApprovalForAll` are overridden to support [**OpenSea**'s Polygon integration](https://docs.opensea.io/docs/polygon-basic-integration)
  and enable cost-free transactions for all users by approved operators.<br/>
  **OpenSea**'s ERC-1155 proxy address `(0x207Fa8Df3a17D96Ca7EA4f2893fcdCb78a304101)` is set in the contract constructor.
- `msgSender()` is overridden to support [**OpenSea**'s Polygon integration](https://docs.opensea.io/docs/polygon-basic-integration) and enable *meta-transactions*.
