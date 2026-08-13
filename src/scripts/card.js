import { putLike, deleteLike, deleteCard as deleteCardApi } from "./api.js";
import { openModalWindow, closeModalWindow } from "./modal.js";

const cardTemplate = document.querySelector("#card-template").content;

const deleteCardPopup = document.querySelector(".popup_type_remove_card");
const deleteCardBtn = deleteCardPopup.querySelector(".popup__button");

export const createCardElement = (
  card,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onInfoClick, currentUser }
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

  if (onDeleteCard) {
    cardDeleteBtn.addEventListener("click", () => onDeleteCard(card));
  }

  if (onLikeIcon) {
    likeBtn.addEventListener("click", () =>
      onLikeIcon(likeBtn, card, likeCounter)
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

  if (currentUser && card.owner && card.owner._id !== currentUser._id) {
    cardDeleteBtn.remove();
  }

  if (
    currentUser &&
    card.likes &&
    card.likes.some((like) => like._id === currentUser._id)
  ) {
    likeBtn.classList.add("card__like-button_is-active");
  }

  return cardElement;
};

deleteCardPopup.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const cardId = deleteCardPopup.dataset.cardId;

  deleteCardBtn.textContent = "Удаление...";

  deleteCardApi(cardId)
    .then(() => {
      document.getElementById(cardId).remove();
      deleteCardPopup.dataset.cardId = "";
      closeModalWindow(deleteCardPopup);
    })
    .catch((err) => console.error(`Ошибка удаления карточки ${err}`))
    .finally(() => (deleteCardBtn.textContent = "Да"));
});

export const deleteCard = (card) => {
  openModalWindow(deleteCardPopup);
  deleteCardPopup.dataset.cardId = card._id;
};

export const toggleLike = (likeBtn, card, likeCounter) => {
  const isLiked = likeBtn.classList.contains("card__like-button_is-active");

  if (isLiked) {
    deleteLike(card._id)
      .then((res) => {
        likeBtn.classList.remove("card__like-button_is-active");
        likeCounter.textContent = res.likes.length;
        card.likes = res.likes;
      })
      .catch((err) => console.error(`Ошибка удаления лайка карточки ${err}`));
  } else {
    putLike(card._id)
      .then((res) => {
        likeBtn.classList.add("card__like-button_is-active");
        likeCounter.textContent = res.likes.length;
        card.likes = res.likes;
      })
      .catch((err) => console.error(`Ошибка лайка карточки ${err}`));
  }
};