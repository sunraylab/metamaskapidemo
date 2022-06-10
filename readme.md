# Metamask API demo

Simple frontend page to demonstrate use of Metamask API

Metamask extends browser with web3 wallet capabilities. Metamask storage is decentralized, only users have access to their keys on their browser.

Metamask provides basic features expected for a secured wallet:

- management of keys (public crypto addresses and private keys)
- display balance of a wallet
- send coin and token transactions
- signature of messages

In addition Metamask makes cryptographic keys available to users, websites can use these signatures for:

- Authenticating websites
- signing off-chain messages for an on-chain protocol

Metamask offers some web3 APIs allowing web3 DApp to relay on it for interacting with. [See Full metamask docs](https://docs.metamask.io/guide/). This API allows:

- Make requests to an Ethereum node (or a compatible network) to read data from the blockchain
- Request permission to 1 or more Ethereum accounts
- Ask the user (if given permission previously) to sign / submit a transaction
- Ask the user (if given permission previously) to sign a message
  
## Use this demo

Simply run liverserver.

In January of 2021, Metamask made a number of breaking changes to their API and removed the injected window.web3.

metamask APIs works also the same way with the Brave wallet.

For a good description of the provider apis, I recommend [Ethereum Provider API](https://github.com/brave/brave-browser/wiki/Ethereum-Provider-API) at brave repo

For a good list of supported EVM compatible chains that can be added on metamak see [chainlist on defillama](https://github.com/DefiLlama/chainlist) or https://chainlist.wtf/ that seem to be used by metamask to make consistent check.

One usefull crypto/token logo database: https://cryptologos.cc

## Some references

- [Metamask Doc](https://docs.metamask.io/guide/)
- [EIP-1193: Ethereum Provider JavaScript API](https://eips.ethereum.org/EIPS/eip-1193)
- [live-server configuration](https://github.com/ritwickdey/vscode-live-server/blob/HEAD/docs/settings.md)

In January of 2021, Metamask made a number of breaking changes to their API and removed the injected window.web3.

## Licence 

[MIT Licence](LICENSE)

(c) 2022 lolorenzo777 <lolorenzo777@sunraylab.net>
