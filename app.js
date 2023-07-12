const submitButton = document.querySelector("#submit-btn");
const  audio = document.querySelector("#audio");
const submitAnswerBtn = document.querySelector("#submit-answer")
const headerParent = document.querySelector("#header-parent")
const recordingStartedElement = document.createElement("p")
const interviewStartedElement = document.createElement("p")
const transcribeButton = document.querySelector("#transcribe-btn")
const downloadLink = document.querySelector("#download-link")
let audioFIle;
let audioInBase64;
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
    "What is the difference between Var, let and const in Javascript"
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
                const audioData = new Blob(userMediaData, {
                  type: "audio/wav; codecs=opus"
                });
                audioFIle = audioData
                audio.src = window.URL.createObjectURL(audioData);
                downloadLink.href = window.URL.createObjectURL(audioData)
                downloadLink.download = "audio.wav"
                downloadLink.innerHTML = downloadLink.download
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

const submitClickHandler = (e) => {
  e.preventDefault()

  speak();
  isStarted = true
};
const transcribeAudio = async (e) => {
  e.preventDefault()
  const formData = new FormData();
  formData.append('myfile', audioFIle)
   
   const  params = {
      method: "POST",
      body: formData
    }
    const url = "http://localhost:8081/convert-audio"
  
    fetch(url, params).then((result) => result.json()).then((data) => console.log(data)).catch((err) => console.log(err))
  
  
}
submitButton.addEventListener("click", submitClickHandler);
transcribeButton.addEventListener("click", transcribeAudio)



