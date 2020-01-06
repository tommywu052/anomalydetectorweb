/* eslint-disable */
//import AuthenticationContext from "./libs/adal-angular.js";
//var auth = require("./libs/adal.js");
//import { AuthenticationContext } from "vue-adal";
export class Authentication {
  user = {
    authenticated: false,
    profile: null
  };
  thread = null;
  remainCheckCount = 5;
  token = null;
  audience = null;
  ADAL = null;
  vueInstance = null;
  constructor(authConfig, audience) {
    this.audience = audience;
    this.ADAL = new AuthenticationContext(authConfig);
    //this.ADAL = new auth.AuthenticationContext(authConfig);
    this.ADAL.handleWindowCallback();
    if (this.ADAL.getLoginError()) {
      console.log(this.ADAL.getLoginError());
    }
  }

  getUser() {
    return this.user;
  }

  handleAcquireTokenResult(err, token, successCallback) {
    if (!err && token != null) {
      // console.log('token acquired: ' + token)
      this.user = this.ADAL.getCachedUser();
      this.token = token;
      if (this.thread != null) {
        clearInterval(this.thread);
      }
      if (successCallback != null) {
        successCallback(this.user, this.token);
      } else {
        console.log("WARNING: token acquired but no callback to handle it.");
      }
    } else {
      console.log("error: " + err);
      if (!this.accquiring) {
        if (this.vueInstance) {
          const msg = this.vueInstance.$Message.loading({
            content: "Logging in...",
            duration: 5
          });
          //msg();
        }
        this.failCallback(successCallback);
        this.accquiring = true;
      }
    }
  }

  intervalProc(successCallback) {
    if (this.remainCheckCount--) {
      if (this.ADAL.getCachedUser()) {
        this.accquireToken(successCallback);
      }
    } else {
      clearInterval(this.thread);
    }
  }

  successCallback(user, token) {
    // console.log('user logged in')
    this.user = user;
    this.token = token;
    if (this.thread != null) {
      clearInterval(this.thread);
    }
  }

  failCallback(successCallback) {
    this.ADAL.login();
    let tempThis = this;
    this.thread = setInterval(() => {
      tempThis.intervalProc(successCallback);
    }, 2000);
  }

  RunIfAuthenticatedAsync(callback) {
    // check 5 times maximum

    this.remainCheckCount = 5;
    this.accquiring = false;
    this.accquireToken(callback);
  }

  accquireToken(successCallback) {
    let tempThis = this;
    this.ADAL.acquireToken(this.audience, (err, token) => {
      tempThis.handleAcquireTokenResult(err, token, successCallback);
    });
  }
}
