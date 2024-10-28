async function askAssistant() {
    const question = document.getElementById('inputText').value;
  
    if (!question) {
      alert('Please enter a question.');
      return;
    }
  
    try {
      const response = await fetch('/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });
  
      const data = await response.json();
  
      if (response.ok) {
        document.getElementById('output').innerText = data.response_format;
      } else {
        alert(data.error || 'An error occurred while processing your request.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred. Please try again later.');
    }
  }
  
  // Attach event listener to the button
  document.getElementById('submitBtn').addEventListener('click', askAssistant);
  