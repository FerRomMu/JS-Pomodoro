const clock = document.querySelector(".display");
const startButton = document.querySelector(".start_btn");
const resetButton = document.querySelector(".reset_btn");
const workTimeInput = document.getElementById("input_work");
const restTimeInput = document.getElementById("input_rest");
const longRestTimeInput = document.getElementById("input_longRest");
const setInput = document.getElementById("input_sets");
const statusTitle = document.querySelector(".status")
const setTitle = document.querySelector(".set")
const autoCheckbox = document.getElementById("auto")
const progressBar = document.querySelector('.progress-bar')

//Se inicializa cycleDone en dos para que empiece en el "set 1" en vez del "set 0"
let cyclesDone = 2
let onCycle = false
let totalSets = () => parseInt(setInput.value) * 2
let intervalId
let isAutoMode = () => autoCheckbox.checked

//Pomodoro States
//Parecido a un patron state voy a usar estos 3 objetos para saber el estado actual del pomodoro
const work = { time: () => workTimeInput.value , status: "Working", message: "Time to work!", next: null }
const rest = { time: () => restTimeInput.value, status: "Resting", message: "Start rest", next: () => work }
const longRest = Object.assign({}, rest)

longRest.time = () => longRestTimeInput.value
work.next = () => cyclesDone == totalSets() ? longRest : rest

let state = work

//Detiene un cyclo
const stopCycle = () => {
  document.title = "Pomodoro"
  clearInterval(intervalId)
  onCycle = false
  clock.textContent = "00:00"
  
  progressBar.style.background = "#d81818"
  progressBar.style.width = (cyclesDone * 100 / totalSets()) + "vw"
}

//Función que pasa al siguiente estado
const next = () => {
  state = state.next()
  startButton.textContent = state.message
  if (cyclesDone > totalSets()) {
    cyclesDone = 2
  } else {
    cyclesDone++
  }
}

//Función que inicializa un ciclo con el tiempo correspondiente al estado actual del pomodoro.
const startCycle = () => {

  
  if(!onCycle) {
    onCycle = true
    progressBar.style.background = "#4A98F7"

    console.log(state.status)
    statusTitle.textContent = state.status
    startButton.textContent = state.status
    setTitle.textContent = "Set " + Math.floor(cyclesDone / 2)
    
    let time = parseFloat(state.time()) * 60;
    console.log(state.message)

    intervalId = setInterval( () => {
      time--;

      console.log(time)
      let minutes = Math.floor(time / 60);
      let seconds = time % 60;

      let timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      clock.textContent = timeString
      document.title = timeString + " Pomodoro"

      progressBar.style.width = 100 - time * 100 / (parseFloat(state.time())*60) + "vw"

      if (time <= 0) {
        doBips()
        stopCycle()
        next()
        if(isAutoMode()) { startCycle() }
      }
    }, 1000)
  }
}

startButton.addEventListener("click", startCycle)

resetButton.addEventListener("click", () => {
  cyclesDone = 2
  stopCycle()
  state = work
  statusTitle.textContent = "To be started"
  progressBar.style.width = 0
  setTitle.textContent = "Set 0"
})


function doBips() {
  
  let oscillator = bip()
  oscillator.start();

  // Primer bip
  setTimeout(function() {
    oscillator.stop();
  }, 800);

  // Segundo bip
  setTimeout(function() {
    oscillator = bip()
    oscillator.start();
  }, 1500);

  // Tercer bip
  setTimeout(function() {
    oscillator.stop();
  }, 2000);
}

let audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function bip() {
  let oscillator = audioCtx.createOscillator();

  oscillator.type = 'sine';
  oscillator.frequency.value = 440;

  oscillator.connect(audioCtx.destination);
  return oscillator
}