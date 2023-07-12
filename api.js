const express = require('express');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const multer = require('multer');
const axios = require('axios')
const cors = require('cors');
const app = express()
app.use(cors());
app.use(fileUpload({}));

const upload = multer({
  limits: {
    fileSize: 2 * 1024 *1024,
    files: 1
  }
})
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/index.html");
});
app.post("/convert-audio", upload.single("myfile"), (req, res) => {
  let upFile = req.files.myfile;
  let buffer = upFile.data;
  async function saveAudioToFile(buffer, filePath) {
    return new Promise((resolve, reject) => {
      const writeStream = fs.createWriteStream(filePath, { encoding: 'base64' });
      writeStream.on('finish', resolve);
      writeStream.on('error', reject);
      writeStream.write(buffer);
      writeStream.end();
    });
  }
  
  // File path to save the audio
  const audioFilePath = "./audio.wav"; // Replace with your desired file path and extension
  saveAudioToFile(buffer, audioFilePath)
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
        sampleRateHertz: 48000,
        languageCode: 'en-US',
      };
      const request = {
        audio: audio,
        config: config,
      };

      // Detects speech in the audio file
      const [response] = await client.recognize(request);
          transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('');
        // Send the transcription as the response
        res.status(200).json({
          transcription:transcription
        })
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
  })

app.listen(8081, () => {
  console.log("Server is listening on 8081")
})