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

  const initialCandidatesState = {candidate1: 0, candidate2: 0, candidate3: 0, candidate4: 0, candidate5: 0};
  const [votes, setVotes] = useState({...initialCandidatesState});
  const [voteSums, setVoteSums] = useState({ ...initialCandidatesState });
  const [voteTokensRequired, setVoteTokensRequired] = useState({...initialCandidatesState});
  const [totalVoteTokensRequired, setTotalVoteTokensRequired] = useState(0);
  const [votingData, setVotingData] = useState([]);
  const [voteTokensHeld, setVoteTokensHeld] = useState(0); 
  const [currentAccount, setCurrentAccount] = useState('');

  useEffect(() => {
    const tempVoteSums = { ...initialCandidatesState };

    votingData.forEach(entry => {
      entry.votesArray.forEach((vote, i) => {
        const candidateKey = `candidate${i + 1}`;
        tempVoteSums[candidateKey] += vote;
      });
    });

    setVoteSums(tempVoteSums);
  }, [votingData]);


  useEffect(() => {
    checkWalletConnection();
    fetchVotingData();
  }, []);

  useEffect(() => {
      if (currentAccount) {
          fetchVoteTokensHeld();
      }
  }, [currentAccount]);

  // ==========================
  // WEB2 FUNCTIONS
  // ==========================

  // Helper function to calculate total Vote Tokens needed for n votes cast on a candidate.
  const quadraticVotingCost = n => (n * (n + 1)) / 2;

  // Updates current votes, tokens used, and total tokens used when the user inputs a vote for a candidate.
  const handleVoteChange = (candidate, voteCount) => {

    // Update votes for a candidate
    const updatedVotes = { ...votes, [candidate]: voteCount };
    setVotes(updatedVotes);
  
    // Calculate tokens used for each candidate and set the tokens used.
    const updatedTokensRequired = Object.keys(initialCandidatesState).reduce((acc, currCandidate) => {
      acc[currCandidate] = quadraticVotingCost(updatedVotes[currCandidate]);
      return acc;
    }, {});
    setVoteTokensRequired(updatedTokensRequired);
  
    // Calculate total tokens required and set total tokens.
    const totalTokens = Object.values(updatedTokensRequired).reduce((a, b) => a + b, 0);
    setTotalVoteTokensRequired(totalTokens);
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

  // Checks voter eligibility before proceeding in `submitBallot`.
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

    // Check if voter has sufficient vote tokens to cast ballot.
    if (voteTokensHeld < totalVoteTokensRequired) {
      console.error(`You have ${voteTokensHeld} VTKN but are trying to submit a ballot using ${totalVoteTokensRequired}.`);
      return false;
    }

    return true;
}

  // Sends POST request to backend to save the user's votes in the database.
  const submitBallot = async () => {
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
  const fetchVoteTokensHeld = async () => {
    try {
      // Attempt to define `ethereum` property (MetaMask) in the context of browser `window` object.
      const { ethereum } = window;
      if (!ethereum) {
        console.log('MetaMask not deteceted. Please install MetaMask to login with Web3.');
        return;
      }

      // If an account is currently connected...
      if (currentAccount) {
      // Instantiate VTKN contract with user's metamask.
      const provider = new ethers.BrowserProvider(ethereum, 'any');
      const contract = new ethers.Contract(addressVoteToken, abiVoteToken, provider);
      
      // Call `balanceOf` from smart contract to fetch currently connected acconut's VTKN balance.
      const balance = await contract.balanceOf(currentAccount);
      const formattedBalance = ethers.formatUnits(balance);
      setVoteTokensHeld(formattedBalance);
      console.log(`Balance of account '${currentAccount}': ${formattedBalance} VTKN`);
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
        <h1 className="text-2xl">Cast Your (Quadratic) Votes</h1>
        <h2>Total VTKN Required: {totalVoteTokensRequired}</h2>
        {Object.entries(votes).map(([candidate, voteCount], idx) => (
          <div key={idx}>
            <label>{`${candidate} `}</label>
            <input 
              type="number"
              step="1"
              min="0"
              max="100"
              value={voteCount}
              onChange={event => handleVoteChange(candidate, parseInt(event.target.value))}
              className="p-2 border rounded mt-2"
            />
            <span className="ml-4">{`VTKN Required: ${voteTokensRequired[candidate]}`}</span>
          </div>
        ))}
        <button onClick={submitBallot} className="p-2 mt-2 bg-blue-500 text-white rounded">Submit Ballot</button>
        <button onClick={connectWallet} className="p-2 mt-2 bg-blue-500 text-white rounded">Connect your wallet</button>
        <button onClick={disconnectWallet} className="p-2 mt-2 bg-blue-500 text-white rounded">Disconnect</button>
        <div className="mt-4">
          <h2>Voting with Wallet: {currentAccount}</h2>
          <h2>VTKN Balance: {voteTokensHeld}</h2>
        </div>
        <div className="mt-4">
          <h2>Past Votes:</h2>
          <ul>
            {votingData.map((entry, idx) => (
              <li key={idx}>
                {`Wallet: '${entry.account}' Votes: ${entry.votesArray.map((vote, i) => `Candidate ${i+1}: ${vote} votes`).join(', ')}`}
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-4">
          <h2>Vote Summary:</h2>
          <ul>
            {Object.entries(voteSums).map(([candidate, votes]) => (
              <li key={candidate}>
                {`${candidate.charAt(0).toUpperCase() + candidate.slice(1)}: ${votes} votes`}
              </li>
            ))}
          </ul>
          <p>Number of Unique Voters: {votingData.length}</p>
        </div>
      </div>
    </main>
  );
}