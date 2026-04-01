"use client";

import { useEffect, useState } from "react";

export default function ApiTest() {
  const [apiKey, setApiKey] = useState<string>("");
  const [testResult, setTestResult] = useState<string>("");

  useEffect(() => {
    // Check if API key is available
    const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    setApiKey(key || "NOT FOUND");
    
    // Test API call
    if (key) {
      fetch(`https://api.themoviedb.org/3/search/movie?api_key=${key}&query=batman&include_adult=false&language=en-US&page=1`)
        .then(response => response.json())
        .then(data => {
          setTestResult(`Success: Found ${data.results?.length || 0} movies`);
        })
        .catch(error => {
          setTestResult(`Error: ${error.message}`);
        });
    } else {
      setTestResult("No API key found");
    }
  }, []);

  return (
    <div className="p-4 bg-black/50 text-white rounded-lg">
      <h3 className="text-lg font-bold mb-2">TMDB API Test</h3>
      <p>API Key: {apiKey?.substring(0, 10)}...</p>
      <p>Result: {testResult}</p>
    </div>
  );
}
