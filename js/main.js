
import routes from './routes.js';
import { store } from './store.js';

const app = Vue.createApp({
    data: () => ({ store }),
});

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);
app.mount('#app');
