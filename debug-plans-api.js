const debugPlansAPI = async () => {
  const baseURL = 'http://localhost:3002';
  
  console.log('🔍 Debugging Plans API Response\n');
  
  try {
    const response = await fetch(`${baseURL}/api/plans`);
    console.log('Status:', response.status);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.text();
    console.log('Raw Response:', data);
    
    try {
      const jsonData = JSON.parse(data);
      console.log('Parsed JSON:', JSON.stringify(jsonData, null, 2));
      console.log('Type:', typeof jsonData);
      console.log('Is Array:', Array.isArray(jsonData));
    } catch (e) {
      console.log('JSON Parse Error:', e.message);
    }
    
  } catch (error) {
    console.log('Fetch Error:', error.message);
  }
};

debugPlansAPI();
