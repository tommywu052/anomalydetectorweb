import axios from "axios";
import CONFIG from "@/config/config.js";
/* eslint-disable */
let https = require("https");

class NetworkRequesterWrapper {
  fireGetequest(
    token,
    url,
    credential = false,
    business = null,
    customer = null
  ) {
    let headers = {
      "Content-type": "application/json"
    };

    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    if(CONFIG.OcpApimSubscriptionKey){
      headers["Ocp-Apim-Subscription-Key"] = CONFIG.OcpApimSubscriptionKey;
    }

    if (business) {
      headers["Business"] = business;
    }

    if (customer) {
      headers["Customer"] = customer;
    }

    if (credential) {
      // headers['Access-Control-Allow-Credentials'] = true;
      axios.defaults.withCredentials = true;
    } else {
      axios.defaults.withCredentials = false;
    }

    return axios
      .get(url, {
        headers: headers
      })
      .then(response => {
        return response;
      })
      .catch(function(error) {
        return Promise.reject(error.response.data);
      });
  }

  httpGet(url, credential = false, business = null, customer = null) {
    let auth = window["Authentication"];
    var self = this;
    if (auth != null) {
      return new Promise(function(resolve, reject) {
        auth.RunIfAuthenticatedAsync((user, token) => {
          resolve(
            self.fireGetequest(token, url, credential, business, customer)
          );
        });
      });
    } else {
      return this.fireGetequest(null, url, credential, business, customer);
      // callback('Cannot get as kensho authentication is empty.');
    }
  }

  firePostRequest(
    token,
    url,
    postData,
    credential = false,
    business = null,
    customer = null, 
    key = null
  ) {
    let headers = {
      "Content-type": "application/json"
    };

    if (token) {
      headers["Authorization"] = "Bearer " + token;
    }

    if(CONFIG.OcpApimSubscriptionKey){
      headers["Ocp-Apim-Subscription-Key"] = CONFIG.OcpApimSubscriptionKey;
    }

    if (key) {
      headers["Ocp-Apim-Subscription-Key"] = key;
    }

    if (business) {
      headers["Business"] = business;
    }

    if (customer) {
      headers["Customer"] = customer;
    }

    if (credential) {
      // headers['Access-Control-Allow-Credentials'] = true;
      axios.defaults.withCredentials = true;
    } else {
      axios.defaults.withCredentials = false;
    }

    return axios
      .post(url, postData, {
        headers: headers,
        httpAgent: new https.Agent({
          rejectUnauthorized: false
        })
      })
      .then(response => {
        return response;
      })
      .catch(error => {
        console.log(error);
        return Promise.reject(error.response.data);
      });
  }

  httpPost(
    url,
    postData,
    credential = false,
    business = null,
    customer = null, 
    key = null
  ) {
    let auth = window["Authentication"];
    let self = this;
    if (auth != null) {
      return new Promise(function(resolve, reject) {
        auth.RunIfAuthenticatedAsync((user, token) => {
          resolve(
            self.firePostRequest(
              token,
              url,
              postData,
              credential,
              business,
              customer
            )
          );
        });
      });
    } else {
      return this.firePostRequest(
        null,
        url,
        postData,
        credential,
        business,
        customer, 
        key
      );
      // callback('Cannot post as kensho authentication is empty.');
    }
  }

  httpPut(
    url,
    putData,
    callback,
    credential = false,
    business = null,
    customer = null
  ) {
    let auth = window["Authentication"];
    if (auth != null) {
      auth.RunIfAuthenticatedAsync((user, token) => {
        let headers = {
          "Content-type": "application/json",
          Authorization: "Bearer " + token
        };

        if (business) {
          headers["Business"] = business;
        }

        if (customer) {
          headers["Customer"] = customer;
        }

        if (credential) {
          // headers['Access-Control-Allow-Credentials'] = true;
          axios.defaults.withCredentials = true;
        } else {
          axios.defaults.withCredentials = false;
        }

        axios
          .put(url, putData, {
            headers: headers,
            httpAgent: new https.Agent({
              rejectUnauthorized: false
            })
          })
          .then(response => {
            callback(response);
          })
          .catch(function(error) {
            callback(error);
          });
      });
    } else {
      callback("Cannot put as kensho authentication is empty.");
    }
  }
}

const NetworkRequester = new NetworkRequesterWrapper();
export default NetworkRequester;
