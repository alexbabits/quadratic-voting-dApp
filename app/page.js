"use client"

import React, { useState, useEffect } from 'react';
import VoteTokenABI from "../artifacts/contracts/VoteToken.sol/VoteToken.json";
import { ethers } from 'ethers';

export default function Home() {

  // ==========================
  // STATE VARIABLES & HOOKS
  // ==========================
  const addressVoteToken = '0xcb76a79aE432a579c80be9674ce1Ab4a5A5E6f0D'
  const abiVoteToken = VoteTokenABI.abi

  const [votes, setVotes] = useState({ candidateOne: 0, candidateTwo: 0 });
  const [votingData, setVotingData] = useState([]);
  const [currentAccount, setCurrentAccount] = useState('');
  const [voteTokensHeld, setVoteTokensHeld] = useState(0); 

  useEffect(() => {
    checkWalletConnection();
    fetchVotingData();
  }, []);

  useEffect(() => {
      if (currentAccount) {
          fetchVoteTokenAmount();
      }
  }, [currentAccount]);

  // ==========================
  // WEB2 FUNCTIONS
  // ==========================

  // Updates `votes` state variable when the user inputs a vote for a candidate
  const handleVoteChange = (candidate, voteCount) => {
    setVotes(prev => ({ ...prev, [candidate]: voteCount }));
  };

  // Fetches all data from database through API route handler.
  const fetchVotingData = async () => {
    try {
        console.log('Grabbing voting data from database...');
        const response = await fetch('/api/routeone');
        const data = await response.json();
        setVotingData(data);
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
  };

  // Checks voter eligibility before proceeding in `submitVote`.
  const checkVoterEligibility = () => {

    // Check if voter has a connected account.
    if (!currentAccount) {
      console.error("No MetaMask account connected. Cannot submit vote.");
      return false;
    }

    // Check if voter has already voted.
    if (votingData.some(entry => entry.account === currentAccount)) {
      console.error("This MetaMask account has already voted.");
      return false;
    }

    // LOGIC INCORRECT, DOES NOT YET INCORPORATE SUM OF TOKENS CURRENTLY VOTING WITH TO CHECK AGAINST
    if (voteTokensHeld >= 0) {
      console.error("Not enough Vote Tokens in account for that sum.");
      return false;
    }

    return true;
}

  // Sends POST request to backend to save the user's votes in the database.
  const submitVote = async () => {
    try {
      
      if (!checkVoterEligibility()) return;

      const response = await fetch('/api/routeone', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ votesArray: Object.values(votes), account: currentAccount })
      });

      const data = await response.json();
      console.log(`data.success: ${data.success}. Votes saved: ${JSON.stringify(votes)}. Voted by: ${currentAccount}`);

    } catch (error) {
      console.log("There was an error processing the vote: ", error);
    }
  };


  // ==========================
  // WEB3 FUNCTIONS
  // ==========================

  // Checks if there is a metamask account connected.
	const checkWalletConnection = async () => {
		try {
      // Attempt to define `ethereum` property (MetaMask) in the context of browser `window` object.
			const { ethereum } = window;
      if (!ethereum) {
				console.log('MetaMask not deteceted. Please install MetaMask to login with Web3.');
        return;
			}

			const accounts = await ethereum.request({ method: 'eth_accounts'});

      // If an account is found in accounts, set it as currentAccount.
			if (accounts.length > 0) {
				const account = accounts[0];
        setCurrentAccount(account);
				console.log(`MetaMask connection found with: '${account}'`);
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
      // Attempt to define `ethereum` property (MetaMask) in the context of browser `window` object.
			const { ethereum } = window;
      if (!ethereum) {
				console.log('MetaMask not deteceted. Please install MetaMask to login with Web3.');
        return;
			}

      // If an account is currently connected...
      if (currentAccount) {
        console.log(`Account already connected: ${currentAccount}.\nTo change accounts, manually disconnect the current account from this dApp inside MetaMask's 'connected sites' option.`);
        return;
      } else {
        // Prompts user to connect their account to dApp, if they do it returns array of their accounts.
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];
        // Setter function updating the state of the current user account to their first account in metamask.
        setCurrentAccount(account);
        console.log(`Account set to: '${account}'`);
      }

		} catch (error) {
			console.log(error);
		}
	};

  // Disconnects an account within the dApp. The chain based MetaMask connection persists.
	const disconnectWallet = () => {
		try {
      if (currentAccount) {
        setCurrentAccount(null);
        setVoteTokensHeld(0);
        console.log(`Disconnected account: '${currentAccount}'`);
      } else {
        console.log(`No account to disconnect.`);
      }
		} catch (error) {
			console.log(error);
		}
	};

  // Fetches the amount of vote tokens held by an account.
  const fetchVoteTokenAmount = async () => {
    try {
      // Attempt to define `ethereum` property (MetaMask) in the context of browser `window` object.
      const { ethereum } = window;
      if (!ethereum) {
        console.log('MetaMask not deteceted. Please install MetaMask to login with Web3.');
        return;
      }

      // If an account is currently connected...
      if (currentAccount) {
      const provider = new ethers.BrowserProvider(ethereum, 'any');
      const contract = new ethers.Contract(addressVoteToken, abiVoteToken, provider);
      
      // Call `balanceOf` to fetch currently connected acconut's balance.
      const balance = await contract.balanceOf(currentAccount);
      const readableBalance = ethers.formatUnits(balance);
      setVoteTokensHeld(readableBalance);
      console.log(`Balance of account '${currentAccount}': ${readableBalance} VTKN`);
      } else {
        console.log('No MetaMask account connection found.');
      }
    } catch (error) {
      console.log('error: ', error);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 font-mono text-center">
        <h1 className="text-2xl">Cast Your Votes</h1>
        {Object.entries(votes).map(([candidate, voteCount], idx) => (
          <div key={idx}>
            <label>{`${candidate} `}</label>
            <input 
              type="number"
              step="1"
              min="0"
              max="20"
              value={voteCount}
              onChange={event => handleVoteChange(candidate, parseInt(event.target.value))}
              className="p-2 border rounded mt-2"
            />
          </div>
        ))}
        <button onClick={submitVote} className="p-2 mt-2 bg-blue-500 text-white rounded">Submit</button>
        <button onClick={connectWallet} className="p-2 mt-2 bg-blue-500 text-white rounded">Connect your wallet</button>
        <button onClick={disconnectWallet} className="p-2 mt-2 bg-blue-500 text-white rounded">Disconnect</button>
        <div className="mt-4">
          <h2>Voting with Wallet: {currentAccount}</h2>
          <h2>VTKN Balance: {voteTokensHeld}</h2>
        </div>
        <div className="mt-4">
          <h2>Past Votes</h2>
          <ul>
            {votingData.map((entry, idx) => (
              <li key={idx}>
                {`Wallet: '${entry.account}' Votes: ${entry.votesArray.map((vote, i) => `Candidate ${i+1}: ${vote} votes`).join(', ')}`}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}