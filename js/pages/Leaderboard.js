import { fetchLeaderboard } from '../content.js';
import { localize } from '../util.js';

import Spinner from '../components/Spinner.js';

export default {
    components: {
        Spinner,
    },
    data: () => ({
        leaderboard: [],
        loading: true,
        selected: null,
        closing: false,
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-leaderboard-container">
            <div class="page-leaderboard">
                <div class="error-container">
                    <p class="error" v-if="err.length > 0">
                        Leaderboard may be incorrect, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>

                <div class="board-container">
                    <div class="board-header">
                        <p class="top-players-label type-label-lg">Top 10 players</p>
                    </div>

                    <div class="board" role="list">
                        <button
                            v-for="(ientry, i) in visibleLeaderboard"
                            :key="ientry.user"
                            class="board-row"
                            :class="[getRowClass(i), { active: selected === i }]"
                            type="button"
                            @click="selectPlayer(i)"
                        >
                            <span class="board-rank">#{{ i + 1 }}</span>
                            <span class="board-name type-label-lg">{{ ientry.user }}</span>
                            <span class="board-total">{{ localize(ientry.total) }}</span>
                        </button>
                    </div>
                </div>

                <div class="player-container" :class="{ 'is-open': selected !== null, 'is-closing': closing }" v-if="selected !== null || closing">
                    <button class="close-player" type="button" aria-label="Close player details" @click="closePlayer">×</button>
                    <div class="player">
                        <div class="player-header">
                            <span class="player-chip">#{{ selected + 1 }}</span>
                            <h1>{{ entry.user }}</h1>
                            <p class="player-total-summary">{{ localize(entry.total) }} total</p>
                        </div>

                        <section v-if="entry.verified.length > 0" class="player-section">
                            <h2>Verified ({{ entry.verified.length }})</h2>
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
                        </section>

                        <section v-if="entry.created.length > 0" class="player-section">
                            <h2>Levels Created ({{ entry.created.length }})</h2>
                            <table class="table">
                                <tr v-for="score in entry.created">
                                    <td class="rank">
                                        <p>#{{ score.rank }}</p>
                                    </td>
                                    <td class="level">
                                        <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                    </td>
                                </tr>
                            </table>
                        </section>

                        <section v-if="entry.completed.length > 0" class="player-section">
                            <h2>Completed ({{ entry.completed.length }})</h2>
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
                        </section>

                        <section v-if="entry.progressed.length > 0" class="player-section">
                            <h2>Progressed ({{ entry.progressed.length }})</h2>
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
                        </section>
                    </div>
                </div>
            </div>
        </main>
    `,
    computed: {
        visibleLeaderboard() {
            return this.leaderboard.slice(0, 10);
        },
        entry() {
            if (this.selected === null || this.selected >= this.visibleLeaderboard.length) {
                return {
                    user: '',
                    total: 0,
                    verified: [],
                    completed: [],
                    created: [],
                    progressed: [],
                };
            }

            return this.visibleLeaderboard[this.selected] ?? {
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
        this.leaderboard = leaderboard;
        this.err = err;
        this.selected = null;
        this.loading = false;
    },
    methods: {
        localize,
        getRowClass(index) {
            if (index === 0) return 'board-row--gold';
            if (index === 1) return 'board-row--silver';
            if (index === 2) return 'board-row--bronze';
            if (index < 5) return 'board-row--elite';
            return 'board-row--regular';
        },
        selectPlayer(index) {
            this.closing = false;
            this.selected = index;
        },
        closePlayer() {
            this.closing = true;
            setTimeout(() => {
                this.selected = null;
                this.closing = false;
            }, 220);
        },
    },
};
