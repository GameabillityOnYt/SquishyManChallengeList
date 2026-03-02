import routes from './routes.js';

export const store = Vue.reactive({
    dark: JSON.parse(localStorage.getItem('dark')) || false,
    listView: ['list', 'grid'].includes(localStorage.getItem('listView'))
        ? localStorage.getItem('listView')
        : 'list',
    listSection: ['main', 'legacy'].includes(localStorage.getItem('listSection'))
        ? localStorage.getItem('listSection')
        : 'main',

    toggleDark() {
        this.dark = !this.dark;
        localStorage.setItem('dark', JSON.stringify(this.dark));

        if (this.dark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    },

    setListView(mode) {
        if (mode !== 'list' && mode !== 'grid') {
            return;
        }
        this.listView = mode;
        localStorage.setItem('listView', mode);
    },

    setListSection(mode) {
        if (mode !== 'main' && mode !== 'legacy') {
            return;
        }
        this.listSection = mode;
        localStorage.setItem('listSection', mode);
    },

    toggleLegacyListSection() {
        this.setListSection(this.listSection === 'legacy' ? 'main' : 'legacy');
    },
});

if (store.dark) {
    document.documentElement.classList.add('dark');
}

const app = Vue.createApp({
    data: () => ({ store }),
});

const router = VueRouter.createRouter({
    history: VueRouter.createWebHashHistory(),
    routes,
});

app.use(router);
app.mount('#app');
