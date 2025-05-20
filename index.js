function setup () {
  let firstCard = undefined
  let secondCard = undefined
  let isFlipping = false
  let matches = 0
  let totalPairs = 3
  let clicks = 0
  let timer = 30 // seconds
  let timerInterval

  //sets the difficulty level and the timer
  function setDifficulty(level) {
    $(".card").removeClass("easy medium hard");
    if (level === "easy") {
      totalPairs = 3
      timer = 30
      $(".card").addClass("d-none");
      $(".card").slice(0, 6).removeClass("d-none").addClass("easy");
    } else if (level === "medium") {
      totalPairs = 6
      timer = 45
      $(".card").addClass("d-none");
      $(".card").slice(0, 12).removeClass("d-none").addClass("medium");
    } else if (level === "hard") {
      totalPairs = 9
      timer = 60
      $(".card").removeClass("d-none").addClass("hard");
    }
  }

  //updates the header with the current clicks, pairs matched and timer
  function updateHeader() {
    $("#clicks").text(`Clicks: ${clicks}`)
    $("#pairs").text(`Pairs matched: ${matches} / ${totalPairs}`)
    $("#timer").text(`Time: ${timer}`)
  }
 
  //shows the winning message in the header
  function showMessage(msg, color="green") {
    $("#game_message").text(msg).css("color", color)
  }

  //starts the timer and updates the header every second
  function startTimer() {
    clearInterval(timerInterval)
    timerInterval = setInterval(() => {
      timer--
      updateHeader()
      if (timer <= 0) {
        clearInterval(timerInterval)
        showMessage("Oh no, time's up!Game Over.", "red")
        $(".card").off("click")
      }
    }, 1000)
  }

  //resets the game by resetting all variables and cards
  function resetGame() {
    // Reset all variables
    firstCard = undefined
    secondCard = undefined
    isFlipping = false
    matches = 0
    clicks = 0
    // Set timer based on difficulty
    const level = $("#difficulty").val()
    setDifficulty(level)
    clearInterval(timerInterval)
    // Reset cards
    $(".card").removeClass("flip").on("click", cardClickHandler)
    updateHeader()
    showMessage("")
  }

  function startGame() {
    resetGame()
    startTimer()
  }

  //function to handle the card click event
  function cardClickHandler() {
    if ($(this).hasClass("flip")) return
    if (isFlipping) return

    $(this).toggleClass("flip")
    clicks++
    updateHeader()

    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0]
    } else {
      secondCard = $(this).find(".front_face")[0]
      isFlipping = true

      if (firstCard.src === secondCard.src) {
        $(`#${firstCard.id}`).parent().off("click")
        $(`#${secondCard.id}`).parent().off("click")
        matches++
        updateHeader()
        resetCards()
        if (matches === totalPairs) {
          clearInterval(timerInterval)
          showMessage("Congratulations! You matched all pairs!")
        }
      } else {
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip")
          $(`#${secondCard.id}`).parent().toggleClass("flip")
          resetCards()
        }, 1000)
      }
    }
  }

  //resets the cards after a match or a timeout
  function resetCards() {
    firstCard = undefined
    secondCard = undefined
    isFlipping = false
  }

  //Button handlers
  //Clicking on the card
  $(".card").on("click", cardClickHandler)
  //Clicking on the reset button
  $("#reset_btn").off("click").on("click", resetGame)
  //Clicking on the start button
  $("#start_btn").off("click").on("click", startGame)
  //Clicking on the difficulty dropdown 
  $("#difficulty").off("change").on("change", function() {
    setDifficulty($(this).val())
    resetGame()
  })
  //Clicking on the dark mode button
  $("#dark_mode_btn").on("click", function () {
    $("body").toggleClass("dark-mode");
    if ($("body").hasClass("dark-mode")) {
      $(this).text("Light Mode");
    } else {
      $(this).text("Dark Mode");
    }
  });

  //this function is called when the page is loaded, it sets the default difficulty
  // and hides the cards
  updateHeader()
  // Do not start timer automatically; wait for Start button
}

//this function is called when the page is loaded, it sets the default difficulty
// and hides the cards
$(document).ready(setup)
