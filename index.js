// (c) 2022 lolorenzo777 <lolorenzo777@sunraylab.net>
"use strict";

import {detectBrowser} from './detectbrowser.js'

let web3ext = undefined;
let gaccounts, gchainid;

// this metamask function must be call at the begining of each function to ensure the web3ext has been initialized
async function metamask() {
    if (!web3ext) {
        await queryMetamaskStatus();
    }
    return web3ext
}

// GetMetamaskStatus check that the metamask extension is installed then call the detectEthereumProvider API
// register event handler if extension is enabled
// return {statustype, status}
async function queryMetamaskStatus() {
  let status, statustype;
  web3ext = undefined;

  if (typeof window !== "undefined" && typeof window.ethereum !== 'undefined') {
    // able to access window.ethereum
    // checking the provider
    const provider = await detectEthereumProvider();
    if (provider) {
        // If the provider returned by detectEthereumProvider is not the same as
        // window.ethereum, something is overwriting it, perhaps another wallet.
        if (provider !== window.ethereum) {
          status = 'Do you have multiple wallets installed?';
          statustype = 'alert-danger'     
        } else {
          statustype = 'alert-success';
          web3ext = window.ethereum
          if (window.ethereum.isMetaMask) {
            status = "MetaMask extension is enabled!"
          } else {
            status = "Compatible MetaMask extension is enabled!"
          }
        }
      } else {
        status = 'Unable to detect Ethereum Provider';
        statustype = 'alert-danger'     
    }
  } else {
    // unable to access window.ethereum
    // display message to propose to install metamask if browser is compatible
    let browser = detectBrowser();
    if (browser === "Chrome") {
      status = "MetaMask is not installed or it's disabled!<hr>"
      status += "<a href='https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn'>Install it</a> or check extension settings to enable it."
      statustype = 'alert-warning'
    } else if (browser === "Firefox") {
      status = "MetaMask is not installed or it's disabled!<hr>"
      status += "<a href='https://addons.mozilla.org/fr/firefox/addon/ether-metamask'>Install it</a>  or check extension settings to enable it."
      statustype = 'alert-warning'
    } else {
      status = "MetaMask is not installed!<hr>"
      status += "It seem your're using "+ browser +" browser. Metamask extension exists only for Chrome and Firefox browser."
      statustype = 'alert-danger'
    }
  }

  return { statustype, status };
}

/**************************************
* button click Handlers
*   clickCheckMetamaskStatus
*   clickCheckConnection
*   clickRequestAccounts
*   clickAddChain
*/

document.querySelector('#btncheckmetakaskstatus').addEventListener('click', clickCheckMetamaskStatus);
async function clickCheckMetamaskStatus() {
  showAlert("web3infobox", "alert-primary", "checking metamask status");
  let ms = await queryMetamaskStatus()
  showAlert("web3infobox", ms.statustype, ms.status);
  updateUI();
}

document.querySelector('#btnisconnected').addEventListener('click', clickCheckConnection);
async function clickCheckConnection() {
  await metamask();
  updateUI();
}

document.querySelector('#btnrequestaccounts').addEventListener('click', clickRequestAccounts);
async function clickRequestAccounts() {
  await metamask();
  if (!web3ext) return

  showAlert("web3infobox", "alert-primary", "requesting access to metamask accounts in progress");
  document.getElementById("btnrequestaccounts").disabled = true;

  // we need first to request the permission to get access to connected accounts
  web3ext
  .request({
    method: 'wallet_requestPermissions',
    params: [{ eth_accounts: {} }],
  })
  .then((permissions) => {
    const accountsPermission = permissions.find(
      (permission) => permission.parentCapability === 'eth_accounts'
    );
    if (accountsPermission) {
      console.log('eth_accounts permission successful');

      // then we can get the list of accounts
      web3ext
        .request({ method: 'eth_requestAccounts' })
        .then(onSuccessfulRequestAccounts)
        .catch((err) => {
          console.error(err);
          showAlert("web3infobox", "alert-danger", "error requesting accounts<br />" + err.message);
          document.getElementById("btnrequestaccounts").disabled = false;
          updateUI()
        });
    }
  })
  .catch((err) => {
    gaccounts = undefined;
    gchainid = undefined;

    console.error(err);
    showAlert("web3infobox", "alert-danger", "error requesting permissions<br />" + err.message);
    document.getElementById("btnrequestaccounts").disabled = false;
    updateUI();
  });
}

// for the purpose of the demo AddChain will requesting addin binance chain
// for a good list of supported EVM compatible chains that can be added on metamak see https://github.com/DefiLlama/chainlist
document.querySelector('#btnaddchain').addEventListener('click', clickAddChain);
async function clickAddChain() {
  await metamask();
  if (!web3ext) return

  showAlert("web3infobox", "alert-primary", "adding new chain in progress");
  document.getElementById("btnaddchain").disabled = true;

  // warning: metamask check that chain info are consistent in regards of their file (https://chainlist.wtf/) 
  // user receives a warning if discrepencies found, for example the token symbol with the 
  const params = [
    {
      chainId: '0x38', // 56 in base 10
      blockExplorerUrls: ['https://bscscan.com'],
      chainName: 'Binance Smart Chain Mainnet',
      iconUrls: ['https://defillama.com/chain-icons/rsz_binance.jpg'],
      nativeCurrency: {
        name: 'Binance Smart Chain',
        symbol: 'BNB',
        decimals: 18,
      },
      rpcUrls: ['https://bsc-dataseed4.binance.org'],
    },
  ];

  // if the chain is not in metamask, then open metamask and ask (1) to add the chain, (2) to switch to the chain
  // if the chain is already in metamask but not selected, then open metamask and ask to switch to the chain
  // if the chain is already selected, then call onSuccessfulAddChain without UI interactions
  // a success trigger the chainChanged event
  web3ext
    .request({ method: 'wallet_addEthereumChain', params})
    .then(onSuccessfulAddChain)
    .catch((err) => {
      console.error(err);
      showAlert("web3infobox", "alert-danger", err.message);
      // clean button state and refresh UI
      document.getElementById("btnaddchain").disabled = false;
      updateUI()
    });

}


/**************************************
* Event Handlers
*/

function onSuccessfulRequestAccounts(accounts) {
  console.log("request accounts");
  gaccounts = accounts
  // gchainid = web3ext.chainId;
  showAlert("web3infobox", "alert-primary", "requested web3 accounts: " + accounts.length);
  document.getElementById("btnrequestaccounts").disabled = false;
  updateUI()
}

function onSuccessfulAddChain(data) {
  console.log("chain added");
  console.log(data);
  showAlert("web3infobox", "alert-primary", "chain added");
  document.getElementById("btnaddchain").disabled = false;
  updateUI()
}

function onAccountsChanged(accounts) {
  console.log("accounts changed event");
  let msg, alerttype;
  if (accounts.length > 0) {
    alerttype = 'alert-primary'
    msg = "web3 accounts changed.<br />Accounts: " + accounts.length;
  } else {
    alerttype = 'alert-danger'
    msg = "no more web3 accounts connected";
    gchainid = undefined;
  }
  showAlert("web3infobox", alerttype, msg);
  gaccounts = accounts;
  updateUI()
}

function onChainChanged(chainid){
  console.log("chain changed event");
  showAlert("web3infobox", 'alert-primary', "web3 chain changed to " + chainid);
  gchainid = chainid;
  updateUI()
}

function onDisconnect() {
  console.log("diconnect event");
  showAlert("web3infobox", 'alert-danger', "web3 disconnected");
  gchainid = undefined;
  gaccounts = undefined;
  updateUI()
}

function onConnect(connectinfo) {
  console.log("connect event");
  gchainid = connectinfo.chainId
  showAlert("web3infobox", 'alert-success', "web3 connected");
  updateUI()
}


/**************************************
* UI
*/

// helper to display the message box
function showAlert(eltid, alerttype, msg) {
  document.getElementById(eltid).classList.remove('alert-primary', 'alert-success', 'alert-danger')
  document.getElementById(eltid).classList.add(alerttype)
  document.getElementById(eltid+"msg").innerHTML = msg
  document.getElementById(eltid).classList.add('show') 
}

// update information at the bottom of the page
function updateUI() {
  // used browser
  document.getElementById("detectedbrowser").innerHTML="This page is loaded on <strong>"+ detectBrowser() +"</strong> browser."; 

  // connected
  if (!web3ext) {
    document.getElementById("web3infobox_connected").innerHTML = "undefined connection status" 
  } else if (web3ext.isConnected) {
    document.getElementById("web3infobox_connected").innerHTML = "Connected to this website"; 
  } else {
    document.getElementById("web3infobox_connected").innerHTML = "Not connected to this website."       
  }

  // accounts
  if (gaccounts && gaccounts.length > 0) {
    let html = "web3 public addresses:<br/>";
    for (let i = 0; i < gaccounts.length; i++) {
      if (i == 0) { html += " <strong>" }
      html += i + ": " + gaccounts[i] 
      html += "<br />"
      if (i == 0) { html += "</strong>" }
    }
    document.getElementById("web3infobox_accounts").innerHTML = html;
  } else {
    document.getElementById("web3infobox_accounts").innerHTML = "no web3 public address"
  }

  // chain
  if (gchainid && gchainid.length>0) {
    document.getElementById("web3infobox_chain").innerHTML = "chain id: " + gchainid
  } else {
    document.getElementById("web3infobox_chain").innerHTML = "no chain information"
  }
}

// connect event is raised during ethereum injection at page load
// the only way to capture this first fired event is here, at page load
if (window && window.ethereum) {
  window.ethereum.on('connect', onConnect);
  window.ethereum.on('accountsChanged', onAccountsChanged);
  window.ethereum.on('chainChanged', onChainChanged);
  window.ethereum.on("disconnect", onDisconnect);
}
