// You can change the default songs by :- Download the song -> move the song to "songs" folder -> edit the name of the song in the audio url after songs folder ("./songs/{name of the song file}")
var neutralSong = new Audio("./public/songs/Lag Jaa Gale.mp3");
var happySong = new Audio("./public/songs/Badtameez Dil.mp3");
var angrySong = new Audio("./public/songs/Bekhayali.mp3");
var sadSong = new Audio("./public/songs/Tum Hi Ho.mp3");

function handleNeutral() {
  const fileInput = document.getElementById("inputNeutral");
  const file = fileInput.files[0];
  const objectURL = URL.createObjectURL(file);
  neutralSong.src = objectURL;
  document.getElementById("neutralTitle").innerHTML = `Neutral : ${file.name}`;
}
function handleHappy() {
  const fileInput = document.getElementById("inputHappy");
  const file = fileInput.files[0];
  const objectURL = URL.createObjectURL(file);
  happySong.src = objectURL;
  document.getElementById("happyTitle").innerHTML = `Happy : ${file.name}`;
}
function handleAngry() {
  const fileInput = document.getElementById("inputAngry");
  const file = fileInput.files[0];
  const objectURL = URL.createObjectURL(file);
  angrySong.src = objectURL;
  document.getElementById("angryTitle").innerHTML = `Angry : ${file.name}`;
}
function handleSad() {
  const fileInput = document.getElementById("inputSad");
  const file = fileInput.files[0];
  const objectURL = URL.createObjectURL(file);
  sadSong.src = objectURL;
  document.getElementById("sadTitle").innerHTML = `Sad : ${file.name}`;
}

var isStartVideoRunning = false;
function startVideo() {
  if (isStartVideoRunning) {
    console.log("Function is already running.");
    return;
  }
  isStartVideoRunning = true;
  document.getElementById("videoStart").style.borderColor="skyblue"
  const video = document.getElementById("video");

  Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.faceExpressionNet.loadFromUri("/models"),
  ]).then(startVideo);

  function startVideo() {
    navigator.getUserMedia(
      { video: {} },
      (stream) => (video.srcObject = stream),
      (err) => console.error(err)
    );
  }


  var prevKey = 0;
  video.addEventListener("play", () => {
    //
    const canvas = faceapi.createCanvasFromMedia(video);
    document.querySelector("main").append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions();

      var maxValue = 0;
      var maxKey = "none";
      for (var key in detections[0].expressions) {
        if (key === "asSortedArray") {
          continue;
        }
        if (detections[0].expressions[key] > maxValue) {
          maxValue = detections[0].expressions[key];
          maxKey = `${key}`;
        }
      }

      if (prevKey != maxKey) {
        switch (prevKey) {
          case "sad":
            sadSong.pause();
            break;
          case "happy":
            happySong.pause();
            break;
          case "neutral":
            neutralSong.pause();
            break;
          case "angry":
            angrySong.pause();
            break;
          case "surprised":
            if (!angrySong.paused) {
              angrySong.pause();
            } else if (!happySong.paused) {
              happySong.pause();
            } else if (!sadSong.paused) {
              sadSong.pause();
            } else if (!neutralSong.paused) {
              neutralSong.pause();
            }
            break;
          default:
        }
      }
      switch (maxKey) {
        case "sad":
          sadSong.play();
          break;
        case "happy":
          happySong.play();
          break;
        case "neutral":
          neutralSong.play();
          break;
        case "angry":
          angrySong.play();
          break;
        case "surprised":
          if (!angrySong.paused) {
            angrySong.pause();
          } else if (!happySong.paused) {
            happySong.pause();
          } else if (!sadSong.paused) {
            sadSong.pause();
          } else if (!neutralSong.paused) {
            neutralSong.pause();
          }
          break;
        default:
      }
      prevKey = maxKey;

      const resizedDetections = faceapi.resizeResults(detections, displaySize);
      canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

      // This shows the Square around the face (Face detector with accuracy)
      faceapi.draw.drawDetections(canvas, resizedDetections);

      // This shows the facial marks
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);

      // This shows the emotion below the face
      faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

      // This number indicates the interval of the program on detect the emotion (in miliseconds [100ms = 0.1s])
    }, 100);
  });
}
