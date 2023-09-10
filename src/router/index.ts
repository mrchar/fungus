import { createRouter, createWebHashHistory } from "vue-router";
import Home from "../views/Home.vue";
import Login from "../views/Login.vue";
import Game from "../views/Game.vue";
import About from "../views/About.vue";

const routes = [
  { path: "/", component: Home },
  { path: "/login", component: Login },
  { path: "/game", component: Game },
  { path: "/about", component: About },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

export default router;
