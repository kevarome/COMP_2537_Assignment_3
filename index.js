function setup () {
  let firstCard = undefined
  let secondCard = undefined
  let isFlipping = false

  $(".card").on("click", function () {
    // Edge case 1: Ignore clicks on already flipped cards
    if ($(this).hasClass("flip")) return

    // Edge case 2: Ignore clicks during flip animation
    if (isFlipping) return

    $(this).toggleClass("flip")

    if (!firstCard) {
      firstCard = $(this).find(".front_face")[0]
    } else {
      secondCard = $(this).find(".front_face")[0]
      isFlipping = true

      if (firstCard.src === secondCard.src) {
        // Match found
        $(`#${firstCard.id}`).parent().off("click")
        $(`#${secondCard.id}`).parent().off("click")
        resetCards()
      } else {
        // No match, flip back after delay
        setTimeout(() => {
          $(`#${firstCard.id}`).parent().toggleClass("flip")
          $(`#${secondCard.id}`).parent().toggleClass("flip")
          resetCards()
        }, 1000)
      }
    }
  })

  function resetCards() {
    firstCard = undefined
    secondCard = undefined
    isFlipping = false
  }
}

$(document).ready(setup)