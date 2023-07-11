const cors = require('cors');
const audioUtils = require('audio-utils');

const express = require('express');
const app = express();
app.use(cors())
app.use(express.json())

// Endpoint for receiving audio and converting it to text
app.post('/convert-audio', async (req, res) => {

  const { audioData } = req.body
  const fs = require('fs');


// Convert base64 to binary buffer
const audioBuffer = Buffer.from(audioData, 'base64');

// Async function to save audio buffer to a file
async function saveAudioToFile(audioBuffer, filePath) {
  return new Promise((resolve, reject) => {
    const writeStream = fs.createWriteStream(filePath, { encoding: 'base64' });
    writeStream.on('finish', resolve);
    writeStream.on('error', reject);
    writeStream.write(audioBuffer);
    writeStream.end();
  });
}

// File path to save the audio
const audioFilePath = "./audio.wav"; // Replace with your desired file path and extension

// Save audio buffer to file
saveAudioToFile(audioBuffer, audioFilePath)
  .then(async() => {
    console.log('Audio file saved successfully!');

    const speech = require('@google-cloud/speech');

// Creates a client
const client = new speech.SpeechClient();
let transcription;
  try {
// The audio file's encoding, sample rate in hertz, and BCP-47 language code
const filename = "./audio.wav";
const file = fs.readFileSync(filename);
const audioData = file.toString('base64')
const audio = {
    content: audioData
  };
  const config = {
    encoding: 'FLAC',
    sampleRateHertz: 16000,
    languageCode: 'en-US',
    

  };
  const request = {
    audio: audio,
    config: config,
  };

  // Detects speech in the audio file
  const [response] = await client.recognize(request);
  console.log(response);
      transcription = response.results
    .map(result => result.alternatives[0].transcript)
    .join('');
    console.log(transcription);
    // Send the transcription as the response
  }
  catch (error){
    console.error("error", error);
    res.status(500).json({
      error: "Google API error"
    });
  }
  })
  .catch((error) => {
    console.error('Error saving audio file:', error);
  });

});

// Start the server
const port = 8081; // You can change the port number if needed
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
