import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        players: [],
        loading: true,
        selected: 0,
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-players-container">
            <div class="page-players">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Player list may be incomplete, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="list-container">
                    <p class="players-label type-label-lg">View Players</p>
                    <div class="players-grid">
                        <button
                            v-for="(player, i) in players"
                            class="player-entry-btn"
                            :class="{ active: selected === i }"
                            @click="selected = i"
                        >
                            <span class="player-entry-rank">#{{ i + 1 }}</span>
                            <span class="player-entry-name type-label-lg">{{ player.user }}</span>
                        </button>
                    </div>
                </div>
                <div class="detail-container">
                    <div class="player">
                        <h1>#{{ selected + 1 }} {{ entry.user }}</h1>
                        <h3>{{ localize(entry.total) }}</h3>

                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="table">
                            <tr v-for="score in entry.verified">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.created.length > 0">Levels Created ({{ entry.created.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.created">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>-</p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.completed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
                        <table class="table">
                            <tr v-for="score in entry.progressed">
                                <td class="rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        entry() {
            return this.players[this.selected] ?? {
                user: '',
                total: 0,
                verified: [],
                completed: [],
                created: [],
                progressed: [],
            };
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.players = leaderboard;
        this.err = err;
        if (this.selected >= this.players.length) {
            this.selected = 0;
        }
        this.loading = false;
    },
    methods: {
        localize,
    },
};
