const submitButton = document.querySelector("#submit-btn");
const audio = document.querySelector("#audio");
const submitAnswerBtn = document.querySelector("#submit-answer")
const headerParent = document.querySelector("#header-parent")
const recordingStartedElement = document.createElement("p")
const interviewStartedElement = document.createElement("p")
const transcribeButton = document.querySelector("#transcribe-btn")
let audioFIle;
headerParent.appendChild(interviewStartedElement)
let recordingTime = 0;
let recordingTimeId;
let isStarted = false
const synth = window.speechSynthesis;
let voices = [];
let audioCtx = new AudioContext();
let recording = false;

//voice list available from speech API
const voiceList = () => {
  voices = synth.getVoices().sort(function (a, b) {
    const firstVoice = a.name.toUpperCase();
    const secondVoice = b.name.toUpperCase();

    if (firstVoice < secondVoice) {
      return -1;
    } else if (firstVoice === secondVoice) {
      return 0;
    } else {
      return +1;
    }
  });
};
voiceList();
const data = {
  question:
    "What"
};
//function to handle speak
const speak = () => {
  if (synth.speaking) {
    console.log("synth is speaking");
    return;
  }
  if (data.question !== "") {
    interviewStartedElement.innerHTML = "Interview Has Started"
    const utterThis = new SpeechSynthesisUtterance(data.question);
    utterThis.voice = voices[1];
    utterThis.rate = 0.8;
    utterThis.pitch = 1;
    synth.speak(utterThis);
    utterThis.onend = () => {
      if(!synth.speaking && isStarted){
        if (navigator.mediaDevices) {
          navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then((mediaData) => {
              const mediaRecord = new MediaRecorder(mediaData);
              let userMediaData = [];
              mediaRecord.ondataavailable = (e) => {
                userMediaData.push(e.data);
              };
              mediaRecord.onstop = (e) => {
                console.log(userMediaData)
                const audioData = new Blob(userMediaData, {
                  type: "audio/wav; codecs=opus"
                });
                audioFIle = userMediaData
                audio.src = window.URL.createObjectURL(audioData);
                userMediaData = [];
              };
              if (!recording) {
                
                mediaRecord.start();
                  recording = true;
                  recordingTimeId = setInterval(() => {
                    recordingTime += 1
                    recordingStartedElement.innerHTML = `Recording started ${recordingTime}`

                  }, 1000)
                  headerParent.appendChild(recordingStartedElement)
                  
              }
                submitAnswerBtn.addEventListener("click", () => {
                  if (recording) {
                    mediaRecord.stop();
                    recording = false;
                    recordingStartedElement.innerHTML = `Recording Stopped ${recordingTime}`
                    clearInterval(recordingTimeId)
                  }
                })
            
            })
            .catch((error) => {
              console.log("There is a error" + error);
            });
        } else {
          alert("Your browser doesn't support this feature");
        }
      }
    }
  }
};

const submitClickHandler = () => {
  speak();
  isStarted = true
};
const transcribeAudio = async () => {
  // const audioData = document.querySelector("#audio").files[0]
  // console.log(audioData);

  const file = new File(audioFIle, "audio.wav", {
    type: "audio/wav"
  })
  console.log(file.type)
  const token = "BHJESKMNQM2YFO2A2FRMMZFWQZ3P4D3D"
 const result = await fetch("https://api.wit.ai/speech?v=20230215", {
    method: "POST",
    headers: {
      "authorization": "Bearer " + token,
      "Content-Type": "audio/wav",
      "Transfer-encoding": "chunked"

    },
    body: file,
  })
console.log(await result.json())
}
submitButton.addEventListener("click", submitClickHandler);
transcribeButton.addEventListener("click", transcribeAudio)

// https://api.wit.ai/dictation
//"Authorization: Bearer $TOKEN" \
// -H "Content-Type: audio/wav" \