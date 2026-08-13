const config = {
  baseURL: "https://mesto.nomoreparties.co/v1/apf-cohort-203",
  headers: {
    authorization: "cac78223-4399-4cf3-a979-c6acb1db52a2",
    "Content-Type": "application/json",
  },
};

const getAboutMe = () => {
  return fetch(`${config.baseURL}/users/me`, {
    headers: config.headers,
  })
  .then((res) => getResponseData(res));
}

const getInitialCards = () => {
  return fetch(`${config.baseURL}/cards`, {
    headers: config.headers,
  })
  .then((res) => getResponseData(res));
}

const patchProfile = (name, description) => {
  return fetch(`${config.baseURL}/users/me`, {
    headers: config.headers,
    method: "PATCH",
    body: JSON.stringify({
      name: name,
      about: description,
    }),
  })
  .then((res) => getResponseData(res));
}

const postNewCard = (name, link) => {
  return fetch(`${config.baseURL}/cards`, {
    headers: config.headers,
    method: "POST",
    body: JSON.stringify({
      name: name,
      link: link,
    }),
  })
  .then((res) => getResponseData(res));
}

const deleteCard = (cardId) => {
  return fetch(`${config.baseURL}/cards/${cardId}`, {
    headers: config.headers,
    method: "DELETE",
  })
  .then((res) => getResponseData(res));
}

const putLike = (cardId) => {
  return fetch(`${config.baseURL}/cards/likes/${cardId}`, {
    headers: config.headers,
    method: "PUT",
  })
  .then((res) => getResponseData(res));
}

const deleteLike = (cardId) => {
  return fetch(`${config.baseURL}/cards/likes/${cardId}`, {
    headers: config.headers,
    method: "DELETE",
  })
  .then((res) => getResponseData(res));
}

const patchAvatar = (link) => {
  return fetch(`${config.baseURL}/users/me/avatar`, {
    headers: config.headers,
    method: "PATCH",
    body: JSON.stringify({
      avatar: link,
    }),
  })
  .then((res) => getResponseData(res));
}

const getResponseData = (res) => {
  if (!res.ok) {
    return Promise.reject(`Ошибка: ${res.status}`); 
  }
  return res.json();
}

export {
  getAboutMe,
  getInitialCards,
  patchProfile,
  postNewCard,
  deleteCard,
  putLike,
  deleteLike,
  patchAvatar,
};