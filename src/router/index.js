import { createRouter, createWebHistory } from 'vue-router';
import Login from '../components/Login.vue';
import Index from '../components/Index.vue';
import Hot from '../components/Hot.vue';

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
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;