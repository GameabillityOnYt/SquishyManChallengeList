import { store } from "../main.js";
import { embed } from "../util.js";
import { score } from "../score.js";
import { fetchEditors, fetchList } from "../content.js";

import Spinner from "../components/Spinner.js";
import LevelAuthors from "../components/List/LevelAuthors.js";

const roleIconMap = {
    owner: "crown",
    admin: "user-gear",
    helper: "user-shield",
    dev: "code",
    trial: "user-lock",
};

export default {
    components: { Spinner, LevelAuthors },
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-list-original">
            <div class="central-container">
                <div v-for="([level, err], i) in list" class="level-row" :key="i">
                    <div class="level-header">
                        <span class="rank-badge">#{{ i + 1 }}</span>
                        <h1 class="level-name">{{ level?.name || 'Error' }}</h1>
                    </div>
                    
                    <div class="level-content">
                        <div class="level-video-preview">
                            <iframe :src="embed(level.verification)" frameborder="0" allowfullscreen></iframe>
                        </div>
                        
                        <div class="level-info">
                            <LevelAuthors :author="level.author" :creators="level.creators" :verifier="level.verifier"></LevelAuthors>
                            <div class="level-stats-grid">
                                <div class="stat-item">
                                    <span class="stat-label">ID</span>
                                    <span class="stat-value">{{ level.id }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Points</span>
                                    <span class="stat-value">{{ score(i + 1, 100, level.percentToQualify) }}</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Pass</span>
                                    <span class="stat-value">{{ level.password || 'Free' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button class="victors-toggle" @click="toggledRecords[i] = !toggledRecords[i]">
                        {{ toggledRecords[i] ? 'Nascondi Records' : 'Mostra Records' }}
                    </button>

                    <div v-if="toggledRecords[i]" class="records-expanded">
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
                </div>
            </div>

            <div class="meta-container">
                <div class="meta">
                    <h3>List Editors.</h3>
                    <ol class="editors">
                        <li v-for="editor in editors">
                            <img :src="\`/assets/\${roleIconMap[editor.role]}\${store.dark ? '-dark' : ''}.svg\`" :alt="editor.role">
                            <a v-if="editor.link" class="link" target="_blank" :href="editor.link">{{ editor.name }}</a>
                            <p v-else>{{ editor.name }}</p>
                        </li>
                    </ol>
                    <h3>Submission Requirements</h3>
                    <p>Achieved the record without using hacks (FPS bypass allowed up to 360fps).</p>
                    <p>Achieved the record on the level listed on the site.</p>
                </div>
            </div>
        </main>
    `,
    data: () => ({
        list: [],
        editors: [],
        loading: true,
        errors: [],
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
    },
};
