const API_KEY = "2727c46961eeecc1fdeb56b0357fd8e2",
  MOVIE_DB_IMAGE_ENDPOINT = "https://image.tmdb.org/t/p/w500",
  url ="https://api.themoviedb.org/3/search/movie?api_key=2727c46961eeecc1fdeb56b0357fd8e2";
  form = document.querySelector(".form"),
  serchContainer = document.querySelector(".search-result");

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const value = form.inputValue.value,
    serchUrl = url + "&query=" + value;

  if (value) {
    fetch(serchUrl)
      .then((response) => response.json())
      .then((data) => {
        renderSearchResults(data.results);
      })
      .catch((error) => console.error(error))
      .finally(() => {
        form.inputValue.value = "";
      });
  }
});

function renderSearchResults(value) {
  serchContainer.innerHTML = "";
  const html = `
        <div class="search-wrapper">
            <p class="title">Search result:</p>
            <img src="icons/photo-close.svg" class="close">
        </div>
        <div class="movies">
            ${getMovies(value)}
        </div>
    `;

  serchContainer.innerHTML = html;

  const moviesWrapper = document.querySelector(".movies");

  if (value.length) {
    moviesWrapper.style.display = "grid";
  } else {
    moviesWrapper.style.display = "block";
  }

  makeOverview(".movies .movie-block");
  addTriggersModal(".movies .movie-block");

  document.querySelector(".close").addEventListener("click", () => {
    serchContainer.innerHTML = "";
  });
}

function getMovies(arr) {
  if (arr.length) {
    return arr
      .map((movie) => {
        if (movie.poster_path) {
          return `
                <div 
                  class="movie-block" 
                  data-title="${movie.original_title}" 
                  data-backdrop="${movie.backdrop_path}" 
                  data-release="${movie.release_date}" 
                  data-rate="${movie.vote_average}"
                  data-overview="${screeningQuotes(movie.overview)}" 
                  data-id=${movie.id}"
                >
                  <img src=${MOVIE_DB_IMAGE_ENDPOINT + movie.poster_path} ">
                  <p class="overview">
                      <span class="overview-title">
                        Overwiew
                      </span>
                      <span class="overview-text">
                          ${movie.overview}
                      </span>
                  </p>
                </div>
                `;
        }
      })
      .join("");
  } else {
    return '<span class="message">No results found</span>';
  }
}

function screeningQuotes(str) {
  let newStr = str.replace(/"/g, "&#34;");
  newStr = newStr.replace(/'/g, "&#39;");

  return newStr;
}

function makeOverview(selector) {
  const blocks = document.querySelectorAll(selector);

  blocks.forEach((block) => {
    block.addEventListener("mouseover", (e) => {
      let target = e.currentTarget.querySelector(".overview");

      target.classList.add("overview-active");
    });

    block.addEventListener("mouseleave", (e) => {
      let target = e.currentTarget.querySelector(".overview");

      target.classList.remove("overview-active");
    });
  });

  blocks.forEach((block) => {
    const textBlock = block.querySelector(".overview-text");

    const arr = textBlock.textContent.trim().split(" ");

    if (arr.length > 26) {
      const cuttedArr = arr.slice(0, 26);
      textBlock.textContent = cuttedArr.join(" ") + "...";
    }
  });
}

function addTriggersModal(triggerSelector) {
  const triggers = document.querySelectorAll(triggerSelector);

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", renderModal);
  });
}

function renderModal(e) {
  const target = e.currentTarget;
  const overlay = document.createElement("div");
  overlay.className = "overlay";
  overlay.innerHTML = `
    <div class="overlay">
        <div class="modal">
            <img src="icons/close.svg" class="modal__close">
            <div class="modal__background-img"><div class="modal__background-img-black"></div></div>
            <header class="modal__header">
                <img src="/icons/preloader.gif" class="modal__poster">
                <div class="modal__info-wrapper">
                    <p class="modal__title">${target.dataset.title}</p>
                    <span class="modal__date">Release Date: ${target.dataset.release}</span>
                    <span class="modal__rate">Rate: ${target.dataset.rate}/10</span>
                </div>
            </header>
            <div class="modal__overview">
                <p class="modal__subtitle">Overview</p>
                <p class="modal__descr">
                    ${target.dataset.overview}
                </p>
            </div>
            <div class="modal__videos-block"></div>
        </div>
    </div>
    `;

  disableScroll();
  document.body.append(overlay);

  document.querySelector(".modal__poster").src = target.querySelector("img").src;

  if (target.dataset.backdrop !== "null") {
    const backgroundImg = document.querySelector(".modal__background-img");

    backgroundImg.style.background = `url(${
      MOVIE_DB_IMAGE_ENDPOINT + target.dataset.backdrop
    }) center center/cover no-repeat`;
  }

  overlay.addEventListener("click", removeModal);

  fetch(
    `https://api.themoviedb.org/3/movie/${target.dataset.id}/videos?api_key=2727c46961eeecc1fdeb56b0357fd8e2`
  )
    .then((response) => response.json())
    .then((data) => {
      getVideo(data.results);
    })
    .catch((error) => console.error(error));
}

function removeModal(e) {
  if (
    e.target.classList.contains("overlay") ||
    e.target.classList.contains("modal__close")
  ) {
    const closeButton = document.querySelector(".modal__close");

    closeButton.removeEventListener("click", removeModal);
    document.querySelector(".overlay").remove();
    enableScroll();
  }
}

function getVideo(arr) {
  if (arr.length === 0) {
    return;
  }

  const keys = [];

  if (arr.length === 1) {
    keys.push(arr[0].key);
  } else if (arr.length > 1 && arr.length >= 3) {
    for (let i = 0; i < 2; i++) {
      keys.push(arr[i].key);
    }
  }

  const html = keys.map((key) => {
    return `
          <iframe 
            class="modal__video"  
            src="https://www.youtube.com/embed/${key}"
          >
          </iframe>
        `;
  });

  document.querySelector(".modal__videos-block").innerHTML = `
        <p class="modal__title modal__title-video">Video</p>
        ${html};
    `;
  setTimeout(() => {
    console.clear();
  }, 10000);
}

function disableScroll() {
  let pagePosition = window.scrollY;
  document.body.classList.add("disable-scroll");
  document.body.dataset.position = pagePosition;
  document.body.style.top = -pagePosition + "px";
}

function enableScroll() {
  let pagePosition = parseInt(document.body.dataset.position, 10);
  document.body.style.top = "auto";
  document.body.classList.remove("disable-scroll");
  window.scroll({ top: pagePosition, left: 0 });
  document.body.removeAttribute("data-position");
}

function getStaticMovies(path, sliderBlockSelector) {
  fetch(
    `https://api.themoviedb.org/3/movie/${path}?api_key=2727c46961eeecc1fdeb56b0357fd8e2`
  )
    .then((response) => response.json())
    .then((data) => {
      document.querySelector(`${sliderBlockSelector} .slider`).innerHTML = getMovies(data.results);
      createSlider(`${sliderBlockSelector} .slider`);
      makeOverview(`${sliderBlockSelector} .slider .movie-block`);
      addTriggersModal(`${sliderBlockSelector} .slider .movie-block`);
    })
    .catch(
      (error) =>
        (document.querySelector(
          `${sliderBlockSelector} .slider-wrapper`
        ).innerHTML =
          '<span class="message message-slider">Something went wrong</span>'
        )
    );
}

function createSlider(sliderSelector) {
  const slider = document.querySelector(sliderSelector),
        elements = slider.querySelectorAll(".movie-block"),
        elementsWidth = parseInt(getComputedStyle(elements[0]).width);
        arrows = slider.parentElement.querySelectorAll(".arrow");

  let position = 0;
  let elementsToShow = 4;

  function updateElementsToShow() {
    const screenWidth = window.innerWidth;

    if (screenWidth < 650) {
      elementsToShow = 1;
    } else if (screenWidth < 1050) {
      elementsToShow = 2;
    } else if (screenWidth < 1200) {
      elementsToShow = 3;
    } else {
      elementsToShow = 4;
    }
  }

  window.addEventListener("resize", updateElementsToShow);

  updateElementsToShow();

  arrows.forEach((arrow) => {
    arrow.addEventListener("click", () => {
      position += arrow.id == "left" ? -elementsWidth : elementsWidth;

      if (position < 0) {
        position = elementsWidth * (elements.length - elementsToShow);
      } else if (
        position >
        elementsWidth * (elements.length - elementsToShow)
      ) {
        position = 0;
      }

      elements.forEach((element) => {
        element.style.transform = `translateX(${-position}px)`;
      });
    });
  });
}

getStaticMovies("upcoming", ".upcoming-movies");
getStaticMovies("top_rated", ".top-movies");
getStaticMovies("popular", ".popular-movies");
