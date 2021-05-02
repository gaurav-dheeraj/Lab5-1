// script.js

const img = new Image(); // used to load image from <input> and draw to canvas

const ctx = document.querySelector("canvas");
const canvas = ctx.getContext("2d");
var imageInput = document.getElementById("image-input");

var voices = [];
var voiceSelect = document.querySelector('select');
document.querySelector('option').remove();
var synth = window.speechSynthesis;

function populateVoiceList() {
  voiceSelect.disabled = false;
  voices = synth.getVoices();
  var selectedIndex = voiceSelect.selectedIndex < 0 ? 0 : voiceSelect.selectedIndex;
  voiceSelect.innerHTML = '';
  for(let i = 0; i < voices.length ; i++) {
    var option = document.createElement('option');
    option.textContent = voices[i].name + ' (' + voices[i].lang + ')';
    
    if(voices[i].default) {
      option.textContent += ' -- DEFAULT';
    }

    option.setAttribute('data-lang', voices[i].lang);
    option.setAttribute('data-name', voices[i].name);
    voiceSelect.appendChild(option);
  }
  voiceSelect.selectedIndex = selectedIndex;
}
populateVoiceList();
if (speechSynthesis.onvoiceschanged !== undefined) {
  speechSynthesis.onvoiceschanged = populateVoiceList;
}

function toggleButtons(){
  var buttons = document.querySelectorAll("button");
  console.log(buttons[0].disabled);
  for(let i = 0; i < buttons.length; i++){ // toggle relevant buttons
    if(buttons[i].disabled == true){
      buttons[i].disabled = false;
    }
    else {
      buttons[i].disabled = true;
    }
  }
  console.log(buttons[0].disabled);
}


imageInput.addEventListener('change', () => {
  img.alt = document.getElementById("image-input").value.split('\\').pop().split('/').pop();
  img.src = URL.createObjectURL(document.getElementById("image-input").files[0]);
});

// Fires whenever the img object loads a new image (such as with img.src =)
img.addEventListener('load', () => {
  canvas.clearRect(0, 0, canvas.width, canvas.height); //clearing the canvas context
  toggleButtons();
  canvas.fillStyle = 'black';                            // this line is actually superfluous, because 'black' is default
  canvas.fillRect(0, 0, ctx.width, ctx.height);
  var dimensions = getDimmensions(ctx.width, ctx.height, img.width, img.height);
  canvas.drawImage(img, dimensions.startX, dimensions.startY, dimensions.width, dimensions.height);

  // Some helpful tips:
  // - Fill the whole Canvas with black first to add borders on non-square images, then draw on top
  // - Clear the form when a new image is selected
  // - If you draw the image to canvas here, it will update as soon as a new image is selected
});

var formSubmit = document.getElementById("generate-meme");
formSubmit.addEventListener('submit', function(event) {
  event.preventDefault(); 
  var textTop = document.getElementById("text-top").value;
  var textBot = document.getElementById("text-bottom").value;
  console.log(textTop); 
  console.log(textBot);
  
  canvas.fillText(textTop, 300, 100, 400);
  toggleButtons();
});

var buttonClear = document.querySelector("[type = 'reset']");
buttonClear.addEventListener('click', function() {
  toggleButtons();
  canvas.clearRect(0, 0, canvas.width, canvas.height); //i think this clears both image and text present
});

var buttonReadText = document.querySelector("[type = 'button']");
buttonReadText.addEventListener('click', () => {
  if (synth.speaking) {
    console.error('speechSynthesis.speaking');
    return;
  }
  if (textTop.value !== '') {
    var utterThis = new SpeechSynthesisUtterance(textTop.value);
    utterThis.onend = function (event) {
      console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis.onerror = function (event) {
      console.error('SpeechSynthesisUtterance.onerror');
    }
    var selectedOption = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for(let i = 0; i < voices.length ; i++) {
      if(voices[i].name === selectedOption) {
        utterThis.voice = voices[i];
        break;
      }
    }
  }
  synth.speak(utterThis);

  if (textBot.value !== '') {
    var utterThis2 = new SpeechSynthesisUtterance(textBot.value);
    utterThis2.onend = function (event) {
      console.log('SpeechSynthesisUtterance.onend');
    }
    utterThis2.onerror = function (event) {
      console.error('SpeechSynthesisUtterance.onerror');
    }
    var selectedOption2 = voiceSelect.selectedOptions[0].getAttribute('data-name');
    for(let j = 0; j < voices.length ; j++) {
      if(voices[j].name === selectedOption2) {
        utterThis2.voice = voices[j];
        break;
      }
    }
  }
  synth.speak(utterThis2);
});
// const input = document.querySelector('input');
// const imgFile = document.getElementById('image-input');

// img.addEventListener('change', () => {



// });
/**
 * Takes in the dimensions of the canvas and the new image, then calculates the new
 * dimensions of the image so that it fits perfectly into the Canvas and maintains aspect ratio
 * @param {number} canvasWidth Width of the canvas element to insert image into
 * @param {number} canvasHeight Height of the canvas element to insert image into
 * @param {number} imageWidth Width of the new user submitted image
 * @param {number} imageHeight Height of the new user submitted image
 * @returns {Object} An object containing four properties: The newly calculated width and height,
 * and also the starting X and starting Y coordinate to be used when you draw the new image to the
 * Canvas. These coordinates align with the top left of the image.
 */
function getDimmensions(canvasWidth, canvasHeight, imageWidth, imageHeight) {
  let aspectRatio, height, width, startX, startY;

  // Get the aspect ratio, used so the picture always fits inside the canvas
  aspectRatio = imageWidth / imageHeight;

  // If the apsect ratio is less than 1 it's a verical image
  if (aspectRatio < 1) {
    // Height is the max possible given the canvas
    height = canvasHeight;
    // Width is then proportional given the height and aspect ratio
    width = canvasHeight * aspectRatio;
    // Start the Y at the top since it's max height, but center the width
    startY = 0;
    startX = (canvasWidth - width) / 2;
    // This is for horizontal images now
  } else {
    // Width is the maximum width possible given the canvas
    width = canvasWidth;
    // Height is then proportional given the width and aspect ratio
    height = canvasWidth / aspectRatio;
    // Start the X at the very left since it's max width, but center the height
    startX = 0;
    startY = (canvasHeight - height) / 2;
  }

  return { 'width': width, 'height': height, 'startX': startX, 'startY': startY }
}
