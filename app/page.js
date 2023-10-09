"use client"

import React, { useState, useEffect } from 'react';

export default function Home() {

  const [currentValue, setValue] = useState(0);
  const [numbers, setNumbers] = useState([]);

  const onValueChange = event => {setValue(event.target.value)};

  const submitValue = async () => {
    try {
      const response = await fetch('/api/routeone', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ number: currentValue })
      });

      const data = await response.json();
      console.log(`data.success: ${data.success}. Number saved: ${currentValue}`);

    } catch (error) {
      console.log("There was some kind of error: ", error);
    }
  };


  useEffect(() => {
    // Fetch all numbers from our API when the component mounts
    const fetchNumbers = async () => {
      try {
        const response = await fetch('/api/routeone');
        const data = await response.json();
        setNumbers(data.map(item => item.number)); // Store just the numbers in our state

      } catch (error) {
        console.error("Failed to fetch numbers:", error);
      }
    };

    fetchNumbers();
  }, []);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="space-y-4 font-mono text-center">
        <h1 className="text-2xl">Hello World</h1>
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
        <button onClick={submitValue} className="p-2 mt-2 bg-blue-500 text-white rounded">Submit</button>
        <div className="mt-4">
          <h2>Stored Numbers:</h2>
          <ul>
            {numbers.map((num, idx) => (
              <li key={idx}>{num}</li>  // Display each number
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}