import {
  getAboutMe,
  getInitialCards,
  patchProfile,
  postNewCard,
  patchAvatar,
} from "./api.js";
import { createCardElement, deleteCard, toggleLike } from "./card.js";
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
const cardInfoDescription = cardInfoPopup.querySelector("#card-info-description");
const cardInfoList = cardInfoPopup.querySelector("#card-info-list");

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

const createLikesList = (likes) => {
  const likesList = document.createElement('ul');
  likesList.className = 'popup__info-likes-list';

  if (!likes || likes.length === 0) {
    const li = document.createElement('li');
    li.className = 'popup__info-likes-item';
    li.textContent = 'Пока никто не лайкнул';
    likesList.appendChild(li);
  } else {
    likes.forEach(like => {
      const li = document.createElement('li');
      li.className = 'popup__info-likes-item';
      li.textContent = like.name || 'Анонимный пользователь';
      likesList.appendChild(li);
    });
  }

  return likesList;
}

const viewCardInfo = (card) => {
  cardInfoDescription.textContent = `Описание: ${card.name}`;
  cardInfoList.innerHTML = '';

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

  const likesItem = document.createElement('li');
  likesItem.className = 'popup__info-item';

  const labelSpan = document.createElement('span');
  labelSpan.className = 'popup__info-label';
  labelSpan.textContent = 'Лайкнули:';
  likesItem.appendChild(labelSpan);

  const valueDiv = document.createElement('div');
  valueDiv.className = 'popup__info-value';
  valueDiv.appendChild(createLikesList(card.likes));
  likesItem.appendChild(valueDiv);

  cardInfoList.appendChild(likesItem);

  openModalWindow(cardInfoPopup);
}

const handlePreviewPicture = ({ name, link }) => {
  image.src = link;
  image.alt = name;
  caption.textContent = name;
  openModalWindow(imagePopup);
}

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
          onLikeIcon: toggleLike,
          onDeleteCard: deleteCard,
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
          onLikeIcon: toggleLike,
          onDeleteCard: deleteCard,
          onInfoClick: viewCardInfo,
          currentUser: user,
        })
      );
    });
  })
  .catch((err) => {
    console.error("Ошибка получения данных пользователя и карточек:", err);
  });