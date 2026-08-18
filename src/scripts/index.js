import {
  getAboutMe,
  getInitialCards,
  patchProfile,
  postNewCard,
  patchAvatar,
  deleteCard as deleteCardApi,
  putLike,
  deleteLike,
} from "./api.js";
import { createCardElement, handleLikeClick, handleDeleteClick } from "./card.js";
import {
  openModalWindow,
  closeModalWindow,
  setCloseModalWindowEventListeners,
} from "./modal.js";
import { clearValidation, enableValidation } from "./validation.js";

const placesList = document.querySelector(".places__list");

const avatarEditBtn = document.querySelector(".profile__avatar-button");
const avatarEditPopup = document.querySelector(".popup_type_edit_avatar");
const avatarEditForm = document.forms["edit-avatar"];
const avatarLinkInput = avatarEditForm.elements.link;
const avatarSubmitBtn = avatarEditPopup.querySelector(".popup__button");

const profileEditBtn = document.querySelector(".profile__edit-button");
const editProfilePopup = document.querySelector(".popup_type_edit");
const editProfileForm = document.forms["edit-profile"];
const nameInput = editProfileForm.elements.name;
const descriptionInput = editProfileForm.elements.description;
const editProfileSubmitBtn = editProfilePopup.querySelector(".popup__button");
const profileTitle = document.querySelector(".profile__title");
const profileDescription = document.querySelector(".profile__description");
const profileImage = document.querySelector(".profile__image");

const cardAddBtn = document.querySelector(".profile__add-button");
const newCardPopup = document.querySelector(".popup_type_new-card");
const newCardForm = document.forms["new-place"];
const placeNameInput = newCardForm.elements["place-name"];
const imageSrcInput = newCardForm.elements.link;
const newCardSubmitBtn = newCardPopup.querySelector(".popup__button");

const imagePopup = document.querySelector(".popup_type_image");
const image = imagePopup.querySelector(".popup__image");
const caption = imagePopup.querySelector(".popup__caption");

const cardInfoPopup = document.querySelector(".popup_type_card-info");
const cardInfoList = cardInfoPopup.querySelector("#card-info-list");
const cardInfoLikesList = cardInfoPopup.querySelector("#card-info-likes-list");

const deleteCardPopup = document.querySelector(".popup_type_remove_card");
const deleteCardBtn = deleteCardPopup.querySelector(".popup__button");

const popups = document.querySelectorAll(".popup");

const validationConfig = {
  formSelector: ".popup__form",
  inputSelector: ".popup__input",
  submitButtonSelector: ".popup__button",
  inactiveButtonClass: "popup__button_disabled",
  inputErrorClass: "popup__input_type_error",
  errorClass: "popup__error_visible",
};

enableValidation(validationConfig);

const formatDate = (date) =>
  date.toLocaleDateString('ru-RU', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

const createInfoString = (label, value) => {
  const li = document.createElement('li');
  li.className = 'popup__info-item';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'popup__info-label';
  labelSpan.textContent = label;

  const valueSpan = document.createElement('span');
  valueSpan.className = 'popup__info-value';
  valueSpan.textContent = value;

  li.appendChild(labelSpan);
  li.appendChild(valueSpan);

  return li;
}

const createLikesList = (likes, likesList) => {
  const createLike = (textContent) => {
    const li = document.createElement('li');
    li.className = 'popup__info-likes-item';
    li.textContent = textContent;
    likesList.appendChild(li);
  };

  if (!likes || likes.length === 0) {
    createLike('Пока никто не лайкнул');
  } else {
    likes.forEach(like => createLike(like.name));
  }
}

const viewCardInfo = (card) => {
  cardInfoList.innerHTML = '';

  cardInfoList.appendChild(
    createInfoString('Описание:', card.name)
  );

  const createdAt = card.createdAt ? new Date(card.createdAt) : new Date();
  cardInfoList.appendChild(
    createInfoString('Дата создания:', formatDate(createdAt))
  );

  cardInfoList.appendChild(
    createInfoString('Владелец:', card.owner ? card.owner.name || 'Неизвестно' : 'Неизвестно')
  );

  const likesCount = card.likes ? card.likes.length : 0;
  cardInfoList.appendChild(
    createInfoString('Количество лайков:', likesCount.toString())
  );

  cardInfoLikesList.innerHTML = '';
  createLikesList(card.likes, cardInfoLikesList);

  openModalWindow(cardInfoPopup);
}

const handlePreviewPicture = ({ name, link }) => {
  image.src = link;
  image.alt = name;
  caption.textContent = name;
  openModalWindow(imagePopup);
}

let cardToDelete = null;

const fetchLike = (likeBtn, card, likeCounter) => {
  const isLiked = likeBtn.classList.contains("card__like-button_is-active");
  const likeMethod = isLiked ? deleteLike : putLike;

  likeMethod(card._id)
    .then((res) => {
      handleLikeClick(likeBtn, likeCounter, res.likes.length);
      card.likes = res.likes;
    })
    .catch((err) => console.error(`Ошибка ${isLiked ? 'удаления' : ''} лайка карточки ${err}`));
};

const requestDelete = (card, cardElement) => {
  cardToDelete = cardElement;
  deleteCardPopup.dataset.cardId = card._id;
  openModalWindow(deleteCardPopup);
};

deleteCardPopup.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const cardId = deleteCardPopup.dataset.cardId;

  deleteCardBtn.textContent = "Удаление...";

  deleteCardApi(cardId)
    .then(() => {
      handleDeleteClick(cardToDelete);
      cardToDelete = null;
      deleteCardPopup.dataset.cardId = "";
      closeModalWindow(deleteCardPopup);
    })
    .catch((err) => console.error(`Ошибка удаления карточки ${err}`))
    .finally(() => (deleteCardBtn.textContent = "Да"));
});

avatarEditBtn.addEventListener("click", () => {
  avatarEditForm.reset();
  openModalWindow(avatarEditPopup);
  clearValidation(avatarEditForm, validationConfig);
});

avatarEditForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  const imgUrl = avatarLinkInput.value;

  avatarSubmitBtn.textContent = "Сохранение...";

  patchAvatar(imgUrl)
    .then((res) => {
      profileImage.style.backgroundImage = `url("${res.avatar}")`;
      closeModalWindow(avatarEditPopup);
    })
    .catch((err) => console.error(err))
    .finally(() => {
      avatarSubmitBtn.textContent = "Сохранить";
    });
});

profileEditBtn.addEventListener("click", () => {
  nameInput.value = profileTitle.textContent;
  descriptionInput.value = profileDescription.textContent;
  openModalWindow(editProfilePopup);
  clearValidation(editProfileForm, validationConfig);
});

editProfileForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  editProfileSubmitBtn.textContent = "Сохранение...";

  patchProfile(nameInput.value, descriptionInput.value)
    .then((res) => {
      profileTitle.textContent = res.name;
      profileDescription.textContent = res.about;
      closeModalWindow(editProfilePopup);
    })
    .catch((err) => console.error(err))
    .finally(() => {
      editProfileSubmitBtn.textContent = "Сохранить";
    });
});

cardAddBtn.addEventListener("click", () => {
  openModalWindow(newCardPopup);
  clearValidation(newCardForm, validationConfig);
});

newCardForm.addEventListener("submit", (evt) => {
  evt.preventDefault();

  newCardSubmitBtn.textContent = "Сохранение...";

  postNewCard(placeNameInput.value, imageSrcInput.value)
    .then((res) => {
      placesList.prepend(
        createCardElement(res, {
          onPreviewPicture: handlePreviewPicture,
          onLikeClick: fetchLike,
          onDeleteClick: requestDelete,
          onInfoClick: viewCardInfo,
          currentUser: res.owner,
        })
      );
      newCardForm.reset();
      closeModalWindow(newCardPopup);
    })
    .catch((err) => console.error(err))
    .finally(() => {
      newCardSubmitBtn.textContent = "Сохранить";
    });
});

popups.forEach((popup) => {
  setCloseModalWindowEventListeners(popup);
});

Promise.all([getAboutMe(), getInitialCards()])
  .then(([user, cards]) => {
    profileTitle.textContent = user.name;
    profileDescription.textContent = user.about;
    profileImage.style.backgroundImage = `url("${user.avatar}")`;

    cards.forEach((card) => {
      placesList.append(
        createCardElement(card, {
          onPreviewPicture: handlePreviewPicture,
          onLikeClick: fetchLike,
          onDeleteClick: requestDelete,
          onInfoClick: viewCardInfo,
          currentUser: user,
        })
      );
    });
  })
  .catch((err) => {
    console.error("Ошибка получения данных пользователя и карточек:", err);
  });