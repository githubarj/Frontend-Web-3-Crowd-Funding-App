import { abi, contractAddress } from "./constants.js";
import { ethers } from "./ethers-5.6.esm.min.js";

const connectBtn = document.getElementById("connectButton");
const fundBtn = document.getElementById("fund");
const amount = document.getElementById("ethAmount");
const contractBalance = document.getElementById("balanceButton");
const withdrawBtn = document.getElementById("withdrawButton");

connectBtn.addEventListener("click", async () => {
  if (typeof window.ethereum !== "undefined") {
    console.log("I see a metamask!");
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Connected!");
    connectBtn.innerHTML = "Connected";
  } else {
    alert("Please Install Metamask");
  }
});

fundBtn.addEventListener("click", async () => {
  const ethAmount = amount.value;
  console.log(`Funding with ${ethAmount}...`);
  if (typeof window.ethereum !== "undefined") {
    // to send a transaction we need:
    //provider / connection to the blockchain
    //signer / wallet / someone with some gas
    // contract that we  are interacting with
    //^ABI and address
    const provider = new ethers.providers.Web3Provider(window.ethereum); //connection to metamask
    const signer = provider.getSigner(); //signer
    console.log(signer);
    const fundMeContract = new ethers.Contract(contractAddress, abi, signer); //our contract

    try {
      const transactionResponse = await fundMeContract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      await listenForTransactionMine(transactionResponse, provider);
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }

  contractBalance.addEventListener("click", async function () {
    if (typeof window.ethereum != "undefined") {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance));
    }
  });

  withdrawBtn.addEventListener("click", async function () {
    if (typeof window.ethereum != "undefined") {
      console.log("Withdrawing...");
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const fundMeContract = new ethers.Contract(contractAddress, abi, signer);

      try {
        const transactionResponse = await fundMeContract.withdraw();
        await listenForTransactionMine(transactionResponse, provider);
        console.log("Done!");
      } catch (error) {
        console.log(error);
      }
    }
  });

  function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}`);

    return new Promise((resolve, reject) => {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations`
        );
        resolve();
      });
    });
  }
});
