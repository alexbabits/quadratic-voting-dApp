"use client"

import React, { useState, useEffect } from 'react';
import VoteTokenABI from "../artifacts/contracts/VoteToken.sol/VoteToken.json";
import { ethers } from 'ethers';
import Toastify  from 'toastify-js'
import "toastify-js/src/toastify.css"

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
    updateVoteSums();
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
  // Web2 FUNCTIONS 
  // ==========================

  // Helper function for Toastify pop-ups
  function showToast(message, duration, color) {
    Toastify({text: message, duration: duration, close: true, gravity: 'top', position: 'left', style: {background: color}}).showToast();
  }

  // Helper function to format displayed 0x addresses.
  function truncateAddress(address) {
    if (!address) return "";
    const prefix = address.slice(0, 6);
    const suffix = address.slice(-4);
    return `${prefix}...${suffix}`;
  }

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
        console.log('Successfully fetched and set voting data.')
    } catch (error) {
        console.error("Failed to fetch data:", error);
    }
  };

  // Calculates vote totals for each candidate.
  const updateVoteSums = () => {
    const candidateVotes = { ...initialCandidatesState };

    votingData.forEach(entry => {
      entry.votesArray.forEach((vote, i) => {
        // key based on `initialCandidatesState` naming convention.
        const candidateKey = `candidate${i + 1}`;
        candidateVotes[candidateKey] += vote;
      });
    });
    setVoteSums(candidateVotes);
  };

  // Checks voter eligibility before proceeding in `submitBallot`.
  const checkVoterEligibility = () => {

    // Check if voter has a connected account.
    if (!currentAccount) {
      const message = "No MetaMask account connected. Cannot submit vote."
      console.error(message);
      showToast(message, 2000, "red");
      return false;
    }

    // Check if voter has already voted.
    if (votingData.some(entry => entry.account === currentAccount)) {
      const message = "This MetaMask account has already voted."
      console.error(message);
      showToast(message, 2000, "red");
      return false;
    }

    // Check if voter has sufficient vote tokens to cast ballot.
    if (voteTokensHeld < totalVoteTokensRequired) {
      const message = `You have ${voteTokensHeld} VTKN but are trying to submit a ballot using ${totalVoteTokensRequired}.`
      console.error(message);
      showToast(message, 2000, "red");
      return false;
    }
    return true;
}

  // Sends POST request to backend to save the user's votes in the database.
  const submitBallot = async () => {
    try {

      // Makes sure user is eligible to vote.
      if (!checkVoterEligibility()) return;

      // Sends POST request to api route for database
      const response = await fetch('/api/routeone', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ votesArray: Object.values(votes), account: currentAccount })
      });

      // Logs the response data. Calls `fetchVotingData` to immediately update page with the db vote data. 
      const data = await response.json();
      console.log(`data.success: ${data.success}. Votes saved: ${JSON.stringify(votes)}. Voted by: ${currentAccount}`);
      fetchVotingData();
      showToast("Vote Success!", 2000, "green");
    } catch (error) {
      console.error("There was an error processing the vote: ", error);
      showToast("Vote Failed.", 2000, "red");
    }
  };


  // ==========================
  // Web3 FUNCTIONS
  // ==========================

  // Helper function to get MetaMask Object.
  const getEthereumObject = () => {
    // Attempt to define `ethereum` property (MetaMask) in the context of browser `window` object.
    const { ethereum } = window;
    if (!ethereum) {
      const message = 'MetaMask not detected. Please install MetaMask to login with Web3.'
      console.log(message);
      showToast(message, 2000, "red");
      return null;
    }
    return ethereum;
  };

  // Checks if there is a metamask account connected.
	const checkWalletConnection = async () => {
		try {
      const ethereum = getEthereumObject();
      if (!ethereum) return;
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
      const ethereum = getEthereumObject();
      if (!ethereum) return;

      // If an account is currently connected...
      if (currentAccount) {
        const message = `Account '${currentAccount}' already connected.  To change accounts, manually disconnect the current account from this dApp inside MetaMask's 'connected sites' option.`
        console.log(message);
        showToast(message, 5000, "blue");
        return;
      } else {
        // Prompts user to connect their account to dApp, if they do it returns array of their accounts.
        const accounts = await ethereum.request({method: 'eth_requestAccounts'});
        const account = accounts[0];
        // Setter function updating the state of the current user account to their first account in metamask.
        setCurrentAccount(account);
        const message = `Account set to: '${account}'`
        console.log(message);
        showToast(message, 2000, "green");
      }
		} catch (error) {
			console.log(error);
      showToast(error, 2000, "red");
		}
	};

  // Disconnects an account within the dApp. The chain based MetaMask connection persists.
	const disconnectWallet = () => {
		try {
      if (currentAccount) {
        setCurrentAccount(null);
        setVoteTokensHeld(0);
        const message = `Disconnected '${currentAccount}'`
        console.log(message);
        showToast(message, 2000, "red");
      } else {
        const message = "No account to disconnect."
        console.log(message);
        showToast(message, 2000, "red");
      }
		} catch (error) {
			console.log(error);
		}
	};

  // Fetches the amount of vote tokens held by an account.
  const fetchVoteTokensHeld = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) return;

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
    <main className="min-h-screen bg-gray-950 px-4 text-white">
      <div className="grid font-mono grid-cols-3 gap-10 w-full h-screen">
  
        {/* Recent Voters Section */}
        <div className="flex flex-col items-center justify-center h-full border-2">
          <div className="space-y-4">
            <h1 className="text-2xl text-center">Recent Voters</h1>
            <ul className="space-y-4">
              {votingData.map((entry, idx) => (
                <li key={idx} className="p-4 rounded bg-blue-900">
                  <ul className="pl-4 mt-1 space-y-1">
                    Account: {truncateAddress(entry.account)}
                    {entry.votesArray.map((vote, i) => (
                      <li key={i}>
                        {`Candidate ${i+1}: ${vote} votes`}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        </div>
  
        {/* Ballot and Current Standings*/}
        <div className="flex items-center justify-center h-full border-2">
          <div className="flex flex-col items-center space-y-4">
            
            {/* Ballot */}
            <h1 className="text-2xl text-center mb-8">Cast Your (Quadratic) Votes</h1>
            {Object.entries(votes).map(([candidate, voteCount], idx) => (
              <div key={idx}>
                <label>{`Candidate ${(idx+1)} `}</label>
                <input 
                  type="number"
                  step="1"
                  min="0"
                  max="100"
                  value={voteCount}
                  onChange={event => handleVoteChange(candidate, parseInt(event.target.value))}
                  className="p-2 border rounded mt-2 bg-black"
                />
                <span className="ml-4">{`VTKN Required: ${voteTokensRequired[candidate]}`}</span>
              </div>
            ))}
            <h2>Total VTKN Required: {totalVoteTokensRequired}</h2>
            <h2>VTKN Balance: {voteTokensHeld}</h2>
            <div><button onClick={submitBallot} className="p-2 mb-16 bg-purple-900">Submit Ballot</button></div>
    
            {/* Current Standings */}
            <div className="mt-4 text-center rounded p-2 bg-blue-900">
              <strong className="text-lg">Current Standings</strong>
              <ul>
                {Object.entries(voteSums).map(([candidate, votes]) => {
                  const formattedCandidate = candidate.replace(/(\d+)/g, ' $1');
                  return (
                    <li key={candidate}>
                      {`${formattedCandidate.charAt(0).toUpperCase() + formattedCandidate.slice(1)}: ${votes} votes`}
                    </li>
                  );
                })}
              </ul>
              <p>Number of Unique Voters: {votingData.length}</p>
            </div>
            
          </div>
        </div>
  
        {/* Connect and Disconnect Buttons */}
        <div className="flex flex-col items-end justify-start h-full">
          <div className="flex space-x-4 mt-4">
            <button onClick={connectWallet} className="p-2 bg-green-500">Connect Wallet</button>
            <button onClick={disconnectWallet} className="p-2 bg-red-500">Disconnect</button>
          </div>
          <div className="flex space-x-4 mt-2">{truncateAddress(currentAccount)}</div>
        </div>
        
      </div>
    </main>
  );
}