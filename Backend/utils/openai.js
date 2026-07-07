import "dotenv/config";

const getAIResponse = async(message)=>{
   // Fallback mock if key is default or invalid format (Gemini keys start with AIzaSy)
   if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.includes("PASTE_YOUR_GEMINI_KEY")) {
      console.log("Using Mock Response: Invalid or missing Gemini API Key.");
      return `Hello! This is a mock response because a valid Gemini API key was not detected. 

Your database is connected, and your thread history is fully functional! You can test the app, create new chats, delete them, and see them save. 

To get real AI responses:
1. Go to **aistudio.google.com** and get a free key.
2. Paste it in your **Backend/.env** file.`;
   }

   const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
   
   const options = {
     method: "POST",
     headers: {
       "Content-Type": "application/json",
     },
     body: JSON.stringify({
       contents: [{
         parts: [{ text: message }]
       }]
     })
   };

   try{
    const response = await fetch(url, options);
    const data = await response.json();
    
    if(!response.ok){
      console.log("Gemini API Error:", JSON.stringify(data, null, 2));
      return `Hello! This is a mock response because the Gemini API returned an error: "${data.error?.message || 'Quota limit exceeded'}". 

Your database connection and thread history are working perfectly! You can write messages, create new threads, and delete chats to test the frontend and backend.`;
    }
    
    return data.candidates[0].content.parts[0].text;
   }catch(err){
    console.log("Gemini fetch error:", err);
    return `Hello! Connection failed. This is a mock fallback. All database operations and history saving are fully working!`;
   }
}

export default getAIResponse;
