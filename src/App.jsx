import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const contractAddress = "0x39407cFDF8eC35b4FbdD65d5d80D78C5FD0BaC5b";
  const contractABI = abi.abi;

  const [allWaves, setAllWaves] = useState([]);
  
  const checkIfWalletIsConnected = async () => {
  try 
  {
    //chequeamos si nuestra metamask esta conectada o no.
    const { ethereum } = window;
  
    if (!ethereum)
    {
      console.log("No estas conectado a metamask");
    }
    else
    {
      console.log("Estas conectado a metamask, objeto:", ethereum);
    }


    const accounts = await ethereum.request({ method: "eth_accounts"});

    if (accounts.length !== 0)
    {
      const account = accounts[0];
      console.log("Encontre una cuenta", account);
      setCurrentAccount(account);
      getAllWaves();
    }
    else
    {
      console.log("Cuenta no autorizada");
    }
  } catch (error){
    console.log(error);
  }   
}

  //Implemento la autorizacion de mi metamask
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum)
      {
        alert("Baja metamask pa");
        return;
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error){
      console.log(error);
    }
  }

  const wave = async () => {
    try {
      const { ethereum } = window;

      if (ethereum)
      {
        //ethers es una libreria que ayuda al frontend a comunicarse con el contrato. Es fundamental tener su "import { ethers } from "ethers";"

        //provider permite utilizar los nodos de metamask para enviar y recibir data de nuestro contrato desplegado.
        const provider = new ethers.providers.Web3Provider(ethereum);

        const signer = provider.getSigner();

        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());

        const waveTxn = await wavePortalContract.wave("este es un mensaje", { gasLimit: 300000 });
        console.log("mining...", waveTxn.hash);

        await waveTxn.wait();
        console.log("mined --", waveTxn.hash);
        
        count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count...", count.toNumber());
      }
      else 
      {
        console.log("ethereum object doesnt exist");
      }
    } catch (error)
    {
      console.log(error);
    }
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;

      if (ethereum)
      {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        setAllWaves(wavesCleaned);
      } 
      else
      {
        console.log("ethereum object doesnt exist");
      }
    } catch (error)
    {
      console.log(error);
    }
  };

  //esto corre nuestra funcion cuando carga la pagina.
 useEffect(() => {
   checkIfWalletIsConnected();
  let wavePortalContract;

  const onNewWave = (from, timestamp, message) => {
    console.log("NewWave", from, timestamp, message);
    setAllWaves(prevState => [...prevState, {
      address: from,
      timestamp: new Date(timestamp * 1000),
      message: message,
    },
    ]);
  };

   if (window.ethereum){
     const provider = new ethers.providers.Web3Provider(window.ethereum);
     const signer = provider.getSigner();

     wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
     wavePortalContract.on("newWave", onNewWave);
   }

   return () => {
     if (wavePortalContract){
       wavePortalContract.off("newWave", onNewWave);
     }
   };
  }, []);

  // useEffect(() => {
  //   checkIfWalletIsConnected();<
  // }, [])
  
  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">
        👋 Hey there!
        </div>

        <div className="bio">
        I am Michael
        </div>

        <button className="waveButton" onClick={wave}>
          Wave at me
        </button>
        
        {!currentAccount && (
        <button className="waveButton" onClick={connectWallet}>
          Connect wallet
        </button>
      )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style= {{backgroundColor: "oldLace", marginTop: "16px", padding: "8px"}}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>
          )
        })}
        
      </div>
    </div>
  );
}

export default App
