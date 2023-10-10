"use client"

import React, { useState, useEffect } from 'react';

export default function Home() {

  const [currentValue, setValue] = useState(0);
  const [numbers, setNumbers] = useState([]);
  const [voters, setVoters] = useState([]);
  const [currentAccount, setCurrentAccount] = useState('');

  const onValueChange = event => {setValue(event.target.value)};

  // Checks voter eligibility before proceeding in `submitVote`.
  const voterEligibilityCheck = () => {
    // Check if voter has a connected account, and if voter has already voted.
    if (!currentAccount) {
        console.error("No MetaMask account connected. Cannot submit vote.");
        return false;
    }
    if (voters.includes(currentAccount)) {
        console.error("This MetaMask account has already voted.");
        return false;
    }
    return true;
}

  // Submits votes to backend for database
  const submitVote = async () => {
    try {
      
      if (!voterEligibilityCheck()) {
        return;
      }

      // Writes data to API which saves data to database.
      const response = await fetch('/api/routeone', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ number: currentValue, account: currentAccount })
      });

      const data = await response.json();
      console.log(`data.success: ${data.success}. Number saved: ${currentValue}. Voted by: ${currentAccount}`);

    } catch (error) {
      console.log("There was an error processing the vote: ", error);
    }
  };

  // Checks if there is a metamask account connected.
	const checkWalletConnection = async () => {
		try {

			const { ethereum } = window;
      if (!ethereum) {
				console.log('MetaMask not deteceted. Please install MetaMask to login with Web3.');
        return;
			}
			const accounts = await ethereum.request({ method: 'eth_accounts'});

			if (accounts.length > 0) {
				const account = accounts[0];
        setCurrentAccount(account);
				console.log(`wallet is connected at: ${account}`);
			} else {
				console.log('No MetaMask account connection found.');
			}
		} catch (error) {
			console.log('error: ', error);
		}
	};

  // Connects metamask wallet to dApp.
	const connectWallet = async () => {
		try {

			const { ethereum } = window;
      if (!ethereum) {
				console.log('MetaMask not deteceted. Please install MetaMask to login with Web3.');
        return;
			}

      if (currentAccount) {
        console.log(`Account already connected: ${currentAccount}.\nTo change accounts, manually disconnect the current account from this dApp inside MetaMask's 'connected sites' option.`);
        return;
      } else {
        // Prompts user to connect their account to dApp, if they do it returns array of their accounts.
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];
        // Setter function updating the state of the current user account to their first account in metamask.
        setCurrentAccount(account);
        console.log(`Account set to: ${account}`);
      }

		} catch (error) {
			console.log(error);
		}
	};

  // Disconnects wallet (kind of)
	const disconnectWallet = () => {
		try {
      // Sets address to null within dApp, but doesn't actually cut off Metamask connection. 
      if (currentAccount) {
        setCurrentAccount(null);
        console.log('Disconnected account:', currentAccount);
      } else {
        console.log(`No account to disconnect.`);
      }
		} catch (error) {
			console.log(error);
		}
	};

  // Fetches voters and their votes from API
  const fetchData = async () => {
    try {
        // `fetch` defaults to using GET request.
        console.log('Grabbing data from database');
        const response = await fetch('/api/routeone');
        const data = await response.json();
        
        setNumbers(data.map(item => item.number));
        setVoters(data.map(item => item.account));

    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
  };

  useEffect(() => {
    checkWalletConnection();
    fetchData();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 font-mono text-center">
        <h1 className="text-2xl">Cast Your Votes</h1>
        <label>Enter a number:</label>
        <input 
          type="number"
          step="1"
          min="0"
          max="100"
          value={currentValue}
          onChange={onValueChange}
          className="p-2 border rounded mt-2"
        />
        <button onClick={submitVote} className="p-2 mt-2 bg-blue-500 text-white rounded">Submit</button>
        <button onClick={connectWallet} className="p-2 mt-2 bg-blue-500 text-white rounded">Connect your wallet</button>
        <button onClick={disconnectWallet} className="p-2 mt-2 bg-blue-500 text-white rounded">Disconnect</button>
        <div className="mt-4">
          <h2>Current Wallet: {currentAccount}</h2>
          <h2>Stored Votes:</h2>
          <ul>
            {numbers.map((num, idx) => (
              <li key={idx}>{num}</li> 
            ))}
          </ul>
          <ul>
            {voters.map((num, idx) => (
              <li key={idx}>{num}</li> 
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}