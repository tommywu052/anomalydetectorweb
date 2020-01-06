import Vue from "vue";
import Vuex from "vuex";
Vue.use(Vuex);

const state = {
  activeRoute: ""
};
const mutations = {
  setActiveRoute: (state, payload) => {
    state.activeRoute = payload;
  }
};
const getters = {
  activeRoute: state => {
    return state.activeRoute;
  }
};

export default new Vuex.Store({
  state,
  getters,
  mutations,
  actions: {},
  modules: {
  },
});
