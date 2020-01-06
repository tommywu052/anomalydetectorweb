import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import iView from "iview";
import "iview/dist/styles/iview.css";
import "./assets/main.scss";
import "./assets/mdl2.css";
import "./assets/homepage/style.css";
import 'intro.js/introjs.css';
import locale from "iview/dist/locale/en-US";
import CONFIG from "./config/config";
import axios from "axios";
//import AriaLogger from "./common/AriaLogger";
import {
  Table,
  TableColumn,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  Popover,
  Scrollbar
} from "element-ui";
import ellang from "element-ui/lib/locale/lang/en";
import ellocale from "element-ui/lib/locale";
import AsyncComputed from "vue-async-computed";
import VueClipboard from "vue-clipboard2";
import moment from "moment";
import GLOBAL from "./common/Global.js";
import DimensionFilter from "./common/plugins/DimensionFilter";
import "./common/plugins/filters";
Vue.config.productionTip = false;
Vue.use(iView, {
  locale
});
Vue.use(Table);
Vue.use(TableColumn);
Vue.use(Dropdown);
Vue.use(DropdownMenu);
Vue.use(DropdownItem);
Vue.use(Popover);
Vue.use(AsyncComputed);
Vue.use(VueClipboard);
Vue.use(Scrollbar);
Vue.use(DimensionFilter);
Vue.prototype.GLOBAL = GLOBAL;
ellocale.use(ellang);
window._ = require("lodash");


// call before communicate with backend

Vue.filter("timeFormatter", function (value) {
  let test = moment;
  return moment(value)
    .utc()
    .format();
});

Vue.filter("predictionStatusFilter", function (value) {
  switch (value) {
    case 'NotEnoughData':
      return 'Not enough data';
    case 'WaitForSchedule':
      return 'Wait for schedule';
    case 'NotEnabled':
      return 'Not enabled';
    default:
      return value;
  }
});

new Vue({
  router,
  store,
  render: h => h(App),
  created: function () {
    let self = this;
    axios.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        self.$Message.destroy();
        self.$Notice.destroy();
        if (error.response) {
          if (_.isObject(error.response.data)) {} else {
            self.$Notice.error({
              title: "error",
              desc: error.response.data
            });
          }

          
          return Promise.reject(error);
        }else{
          self.$Notice.error({
            title: "error",
            desc: `There is no reponse from the server. Please try again later. If the issue persists, please contact kenshoteam with your onboarding parameters.`
          });
        }
        
      }

    );
  }
}).$mount("#app");