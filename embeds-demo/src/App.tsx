import { useState } from "react";
import {
  LightTheme,
  PassportScoreWidget,
  usePassportScore,
} from "@passportxyz/passport-embed";
import { Buffer } from "buffer";
import "./App.css";
import { ethers } from 'ethers';
// const provider = new ethers.BrowserProvider(window.lukso);

// const accounts = await provider.send('eth_requestAccounts', []);



const PASSPORT_API_KEY = import.meta.env.VITE_SCORER_ID || "DEMO.API_KEY";
const PASSPORT_SCORER_ID = import.meta.env.VITE_API_KEY || "335"; // TODO: use DEMO after fix

const passportEmbedParams = {
  apiKey: PASSPORT_API_KEY,
  scorerId: PASSPORT_SCORER_ID,
  // overrideEmbedServiceUrl: "https://embed.staging.passport.xyz",
};

const connectWallet = async () => {
  // Check if MetaMask is installed
  if (typeof window.lukso === "undefined") {
    alert("Please install MetaMask!");
    return;
  }
  const provider = new ethers.BrowserProvider(window.lukso);
  

  try {
    // Request account access
  const accounts = await provider.send('eth_requestAccounts', []);
  // const accounts = await window.lukso.request({
  //     method: "eth_requestAccounts",
  //   });

    // Get the connected account
    return accounts[0];
  } catch (error) {
    console.error(error);
    alert("Failed to connect to wallet");
  }
};

const generateSignature = async (message: string) => {
  try {
    // Check if MetaMask is installed
    if (typeof window.lukso === "undefined") {
      alert("Please install MetaMask!");
      return;
    }

    // Request account access if not already connected
    const accounts = await window.lukso.request({
      method: "eth_requestAccounts",
    });

    const signerAddress = accounts[0];

    const stringToSign = `0x${Buffer.from(message, "utf8").toString("hex")}`;
    // Sign the message
    const signature = await window.lukso.request({
      method: "personal_sign",
      params: [stringToSign, signerAddress],
    });

    return signature ? signature : "";
  } catch (error) {
    console.error("Error signing message:", error);
    alert("Failed to sign message");
    throw error;
  }
};

const DirectPassportDataAccess = ({ address }: { address?: string }) => {
  const { data, isError, error } = usePassportScore({
    ...passportEmbedParams,
    address: address,
  });

  return (
    <div style={{ textAlign: "left" }}>
      <h1>This is an app element!</h1>
      <ul>
        <li>Passport Score: {data?.score}</li>
        <li>Passport Threshold: {data?.threshold}</li>
        <li>Is passing threshold: {data?.passingScore ? "True" : "False"}</li>
        <li>
          What stamps?
          <pre>{JSON.stringify(data?.stamps, undefined, 2)}</pre>
        </li>
        {isError && <li>Error: {(error as Error)?.message}</li>}
      </ul>
    </div>
  );
};

function App() {
  const [address, setAddress] = useState<string | undefined>();

  return (
    <div className="container">
      <div className="demo-sample">
        <PassportScoreWidget
          {...passportEmbedParams}
          address={address}
          connectWalletCallback={async () => {
            const address = await connectWallet();
            setAddress(address);
          }}
          generateSignatureCallback={generateSignature}
          collapseMode={"off"} // off | shift | overlay
          theme={LightTheme}
        />
      </div>
    </div>
  );
}

export default App;
