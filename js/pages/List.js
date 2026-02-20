import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>

        <main v-else class="page-list-custom" :class="{ dark: store.dark }">
            <div class="central-container">

                <div v-for="([level, err], i) in list" class="level-card" :key="i">

                    <div class="level-video-side">
                        <iframe :src="embed(level.verification)" frameborder="0" allowfullscreen></iframe>
                    </div>

                    <div class="level-details-side">

                        <div class="level-title-info">
                            <span class="level-rank">#{{ i + 1 }}</span>
                            <h2>{{ level?.name || 'Error' }}</h2>
                        </div>

                        <div class="authors-box">
                            <div class="author-item">
                                <span class="stat-label">Creators</span>
                                <span class="stat-value">{{ level.creators.join(', ') }}</span>
                            </div>
                            <div class="author-item">
                                <span class="stat-label">Verifier</span>
                                <span class="stat-value">{{ level.verifier }}</span>
                            </div>
                            <div class="author-item">
                                <span class="stat-label">Publisher</span>
                                <span class="stat-value">{{ level.publisher || level.author }}</span>
                            </div>
                        </div>

                        <div class="stats-middle-grid">

                            <div class="stat-card">
                                <span class="stat-label">ID</span>
                                <div class="id-copy-box">
                                    <span class="stat-value">{{ level.id }}</span>
                                    <button class="copy-id" onclick="navigator.clipboard.writeText('{{id}}')">
<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24" fill="currentColor">
<path d="M16 1H4C2.9 1 2 1.9 2 3V15H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"/>
</svg>
</button>
                                </div>
                            </div>

                            <div class="stat-card">
                                <span class="stat-label">Points</span>
                                <span class="stat-value">{{ score(i + 1, 100, level.percentToQualify) }}</span>
                            </div>

                            <div class="stat-card">
                                <span class="stat-label">Password</span>
                                <span class="stat-value">{{ level.password || 'Free' }}</span>
                            </div>

                        </div>

                        <button class="show-records-btn" @click="toggleRecords(i)">
                            {{ isOpen(i) ? 'Hide Records' : 'Show Records' }}
                        </button>

                        <transition name="slide">
                            <div v-if="isOpen(i)" class="records-panel">
                                <table class="records">
                                    <tr v-for="record in level.records" class="record">
                                        <td class="percent"><p>{{ record.percent }}%</p></td>
                                        <td class="user">
                                            <a :href="record.link" target="_blank">{{ record.user }}</a>
                                        </td>
                                        <td class="hz"><p>{{ record.hz }}Hz</p></td>
                                    </tr>
                                </table>
                            </div>
                        </transition>

                    </div>
                </div>
            </div>

            <div class="meta-container">
                <div class="meta">
                    <h3>List Editors.</h3>
                    <ol class="editors">
                        <li v-for="editor in editors">
                            <img :src="'/assets/' + roleIconMap[editor.role] + (store.dark ? '-dark' : '') + '.svg'" :alt="editor.role">
                            <a v-if="editor.link" class="type-label-lg link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                            <p v-else>{{ editor.name }}</p>
                        </li>
                    </ol>

                    <h3>Submission Requirements</h3>
                    <p>Achieved the record without using hacks (however, FPS bypass is allowed, up to 360fps)</p>
                    <p>Achieved the record on the level that is listed on the site.</p>
                    <p>Have either source audio or clicks/taps in the video.</p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        toggledRecords: {},
        roleIconMap,
        store
    }),
    async mounted() {
        this.list = await fetchList();
        this.editors = await fetchEditors();
        this.loading = false;
    },
    methods: {
        embed,
        score,
        isOpen(index) {
            return this.toggledRecords[index] === true;
        },
        toggleRecords(index) {
            this.toggledRecords = {
                [index]: !this.toggledRecords[index]
            };
        },
        copyID(id) {
            navigator.clipboard.writeText(id);
        }
    }
};
