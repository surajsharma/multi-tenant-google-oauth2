import axios from "axios";

export const parseJwt = (token: any) => {
  var base64Url = token.split('.')[1];
  var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));

  return JSON.parse(jsonPayload);
}

export const getUserEmailbyId = async (id: string) => {
  try {
    let res = await axios.get("/api/user", {
      params: {
        userid: id
      }
    });
    return res.data;
  } catch (err) {
    console.log(err);
    return -1;
  }
};

export const getUserByEmail = async (email: string) => {

  try {
    let res = await axios.get("/api/user", {
      params: {
        email: email
      }
    });
    return res.data;
  } catch (err) {
    console.log(err);
    return -1;
  }

}


