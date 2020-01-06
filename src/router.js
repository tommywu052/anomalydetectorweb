import Vue from "vue";
import Router from "vue-router";
import Root from "@/views/Root";
Vue.use(Router);

export default new Router({
  // mode: "history",
  routes: [
    {
      path: "/",
      name: "Root",

      components: {
        root: Root
      },
      children: [
        {
          path: "/",
          name: "datalab",
          component: () => import("./views/Datalab.vue"),
          meta: {
            breadcrumb: [
              { name: "homepage", displayName: "Home" },
              { name: "datalab", displayName: "Algo evaluation" }
            ]
          }
        }
      ]
    }
  ]
});
