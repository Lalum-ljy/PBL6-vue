import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Index from '../components/Index.vue';
import Hot from '../components/Hot.vue';
import Myself from '../components/Myself.vue';
import Settings from '../components/Settings.vue';

const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login
  },
  {
    path: '/index',
    name: 'Index',
    component: Index
  },
  {
    path: '/hot',
    name: 'Hot',
    component: Hot
  },
  {
    path: '/myself',
    name: 'Myself',
    component: Myself
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;