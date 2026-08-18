const cardTemplate = document.querySelector("#card-template").content;

export const createCardElement = (
  card,
  { onPreviewPicture, onLikeClick, onDeleteClick, onInfoClick, currentUser }
) => {
  const cardElement = cardTemplate.querySelector(".card").cloneNode(true);
  const cardImg = cardElement.querySelector(".card__image");
  const cardDeleteBtn = cardElement.querySelector(".card__delete-button");
  const likeBtn = cardElement.querySelector(".card__like-button");
  const likeCounter = cardElement.querySelector(".card__like-counter");
  const infoBtn = cardElement.querySelector(".card__info-button");

  cardElement.id = card._id;

  cardImg.src = card.link;
  cardImg.alt = card.name;
  cardElement.querySelector(".card__title").textContent = card.name;

  if (onDeleteClick) {
    cardDeleteBtn.addEventListener("click", () => onDeleteClick(card, cardElement));
  }

  if (onLikeClick) {
    likeBtn.addEventListener("click", () =>
      onLikeClick(likeBtn, card, likeCounter)
    );
  }

  if (onInfoClick) {
    infoBtn.addEventListener("click", (evt) => {
      evt.stopPropagation();
      onInfoClick(card);
    });
  }

  if (onPreviewPicture) {
    cardImg.addEventListener("click", () =>
      onPreviewPicture({ name: card.name, link: card.link })
    );
  }

  likeCounter.textContent = card.likes ? card.likes.length : 0;

  if (card.owner._id !== currentUser._id) {
    cardDeleteBtn.remove();
  }

  if (card.likes.some((like) => like._id === currentUser._id)) {
    likeBtn.classList.add("card__like-button_is-active");
  }

  return cardElement;
};

export const handleLikeClick = (likeBtn, likeCounter, likesCount) => {
  likeBtn.classList.toggle("card__like-button_is-active");
  likeCounter.textContent = likesCount;
};

export const handleDeleteClick = (cardElement) => {
  cardElement.remove();
};