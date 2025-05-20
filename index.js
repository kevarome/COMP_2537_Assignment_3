// Global variables ---
let firstCard = null;
let secondCard = null;
let isFlipping = false;
let matches = 0;
let totalPairs = 3;
let clicks = 0;
let timer = 30; 
let timerInterval;

//Pokemon APIfunctions
async function fetchPokemonList() {
  const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=1010");
  const data = await response.json();
  return data.results;
}

function getRandomPairs(arr, pairCount) {
  let indices = [];
  while (indices.length < pairCount) {
    let idx = Math.floor(Math.random() * arr.length);
    if (!indices.includes(idx)) indices.push(idx);
  }
  let allIndices = indices.concat(indices);
  for (let i = allIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [allIndices[i], allIndices[j]] = [allIndices[j], allIndices[i]];
  }
  return allIndices;
}

function getPokemonIdFromUrl(url) {
  const parts = url.split("/");
  return parts[parts.length - 2];
}

async function setRandomPokemonImages(pairCount) {
  const pokemonList = await fetchPokemonList();
  const randomIndices = getRandomPairs(pokemonList, pairCount);
  const $fronts = $(".card:not(.d-none) .front_face");
  $fronts.each(function(i) {
    const poke = pokemonList[randomIndices[i]];
    const pokeId = getPokemonIdFromUrl(poke.url);
    const imgUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png`;
    $(this).attr("src", imgUrl);
    $(this).attr("data-pokemon-id", pokeId);
  });
}

// --- Difficulty levels: easy, medium, hard ---
// Easy: 3 pairs, 30 seconds
// Medium: 6 pairs, 45 seconds
// Hard: 9 pairs, 60 seconds
function setDifficulty(level) {
  $(".card").removeClass("easy medium hard");
  if (level === "easy") {
    totalPairs = 3;
    timer = 30;
    $(".card").addClass("d-none");
    $(".card").slice(0, 6).removeClass("d-none").addClass("easy");
  } else if (level === "medium") {
    totalPairs = 6;
    timer = 45;
    $(".card").addClass("d-none");
    $(".card").slice(0, 12).removeClass("d-none").addClass("medium");
  } else if (level === "hard") {
    totalPairs = 9;
    timer = 60;
    $(".card").removeClass("d-none").addClass("hard");
  }
}

function updateHeader() {
  $("#clicks").text(`Clicks: ${clicks}`);
  $("#pairs").text(`Pairs matched: ${matches} / ${totalPairs}`);
  $("#timer").text(`Time: ${timer}`);
}


function showMessage(msg, color="green") {
  $("#game_message").text(msg).css("color", color);
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timer--;
    updateHeader();
    if (timer <= 0) {
      clearInterval(timerInterval);
      showMessage("Oh no, time's up!Game Over.", "red");
      $(".card").off("click");
    }
  }, 1000);
}

// --- Reset game function ---
async function resetGame() {
  firstCard = undefined;
  secondCard = undefined;
  isFlipping = false;
  matches = 0;
  clicks = 0;
  const level = $("#difficulty").val();
  setDifficulty(level);
  clearInterval(timerInterval);
  $(".card").removeClass("flip").off("click");
  await setRandomPokemonImages(totalPairs);
  updateHeader();
  showMessage("");
}

// --- Start game function ---
function startGame() {
  resetGame().then(() => {
    $(".card:not(.d-none)").on("click", cardClickHandler);
    startTimer();
  });
}

// --- Card click handler ---
function cardClickHandler() {
  if ($(this).hasClass("flip")) return;
  if (isFlipping) return;

  $(this).toggleClass("flip");
  clicks++;
  updateHeader();

  if (!firstCard) {
    firstCard = $(this);
  } else {
    secondCard = $(this);
    isFlipping = true;

    const firstImg = firstCard.find(".front_face").attr("src");
    const secondImg = secondCard.find(".front_face").attr("src");

    if (firstImg === secondImg) {
      firstCard.off("click");
      secondCard.off("click");
      matches++;
      updateHeader();

      // --- Power Up: Flip all unflipped cards at 3 (medium) or 5 (hard) matches ---
      const level = $("#difficulty").val();
      if (
        (level === "medium" && matches === 3) ||
        (level === "hard" && matches === 5)
      ) {
        setTimeout(() => {
          const $unflipped = $(".card:not(.d-none):not(.flip)");
          $unflipped.addClass("flip");
          setTimeout(() => {
            $unflipped.removeClass("flip");
            resetCards();
            isFlipping = false;
          }, 1000);
        }, 300);
        return;
      }
      // --- End Power Up ---

      resetCards();
      if (matches === totalPairs) {
        clearInterval(timerInterval);
        showMessage("Congratulations! You matched all pairs!");
      }
    } else {
      setTimeout(() => {
        firstCard.removeClass("flip");
        secondCard.removeClass("flip");
        resetCards();
      }, 1000);
    }
  }
}

// --- Reset cards function ---
function resetCards() {
  firstCard = undefined;
  secondCard = undefined;
  isFlipping = false;
}

//DOM Attach handlers and set initial state 
$(document).ready(function() {
  $("#reset_btn").off("click").on("click", resetGame);
  $("#start_btn").off("click").on("click", startGame);
  $("#difficulty").off("change").on("change", function() {
    setDifficulty($(this).val());
    resetGame();
  });
  $("#dark_mode_btn").on("click", function () {
    $("body").toggleClass("dark-mode");
    if ($("body").hasClass("dark-mode")) {
      $(this).text("Light Mode");
    } else {
      $(this).text("Dark Mode");
    }
  });

  // Wait for Start button for timer
  updateHeader();

});
