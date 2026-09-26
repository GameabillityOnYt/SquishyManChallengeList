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
        openFolder: null,
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
                            :class="[{ active: selected === i }, 'rank-' + (i + 1)]"
                            type="button"
                            @click="selectPlayer(i)"
                        >
                            <span class="board-rank" :class="'rank-' + (i + 1)">#{{ i + 1 }}</span>
                            <span class="board-name type-label-lg">{{ ientry.user }}</span>
                            <span class="board-total">{{ localize(ientry.total) }}</span>
                        </button>
                    </div>
                </div>

                <div class="player-container" :class="{ 'is-open': selected !== null, 'is-closing': closing }" v-if="selected !== null || closing" @animationend="finishClosing">
                    <button class="close-player" type="button" aria-label="Close player details" @click="closePlayer">×</button>
                    <div class="player">
                        <div class="player-header">
                            <div class="player-name-row">
                                <span class="player-rank-wrap" :class="'rank-' + (selected + 1)">
                                    <span class="player-rank-title">{{ rankTitle(selected + 1) }}</span>
                                    <span class="player-rank-emblem" :class="'rank-' + (selected + 1)" :aria-label="'Rank ' + (selected + 1) + ' player'">
                                        <strong>#{{ selected + 1 }}</strong>
                                    </span>
                                </span>
                                <h1>{{ entry.user }}</h1>
                            </div>
                            <p class="player-total-summary">{{ localize(entry.total) }} points</p>
                        </div>

                        <section class="player-folder folder-verified" :class="{ 'is-open': openFolder === 'verified' }">
                            <button class="player-folder-toggle" type="button" :aria-expanded="openFolder === 'verified'" @click="toggleFolder('verified')">
                                <span>Verified levels</span>
                                <span class="player-folder-count">{{ entry.verified.length }}</span>
                            </button>
                            <transition name="folder">
                                <div v-show="openFolder === 'verified'" class="player-folder-content">
                                <table v-if="entry.verified.length > 0" class="table">
                                    <tr v-for="score in entry.verified">
                                        <td class="rank"><p>#{{ score.rank }}</p></td>
                                        <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                        <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                    </tr>
                                </table>
                                <p v-else class="player-folder-empty">No verified levels.</p>
                                </div>
                            </transition>
                        </section>

                        <section class="player-folder folder-completed" :class="{ 'is-open': openFolder === 'completed' }">
                            <button class="player-folder-toggle" type="button" :aria-expanded="openFolder === 'completed'" @click="toggleFolder('completed')">
                                <span>Completed levels</span>
                                <span class="player-folder-count">{{ entry.completed.length }}</span>
                            </button>
                            <transition name="folder">
                                <div v-show="openFolder === 'completed'" class="player-folder-content">
                                <table v-if="entry.completed.length > 0" class="table">
                                    <tr v-for="score in entry.completed">
                                        <td class="rank"><p>#{{ score.rank }}</p></td>
                                        <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                        <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                    </tr>
                                </table>
                                <p v-else class="player-folder-empty">No completed levels.</p>
                                </div>
                            </transition>
                        </section>

                        <section class="player-folder folder-created" :class="{ 'is-open': openFolder === 'other' }">
                            <button class="player-folder-toggle" type="button" :aria-expanded="openFolder === 'other'" @click="toggleFolder('other')">
                                <span>Created levels</span>
                                <span class="player-folder-count">{{ entry.created.length + entry.progressed.length }}</span>
                            </button>
                            <transition name="folder">
                                <div v-show="openFolder === 'other'" class="player-folder-content">
                                <div v-if="entry.created.length > 0" class="player-subsection">
                                    <h2>Levels created ({{ entry.created.length }})</h2>
                                    <table class="table">
                                        <tr v-for="score in entry.created">
                                            <td class="rank"><p>#{{ score.rank }}</p></td>
                                            <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a></td>
                                        </tr>
                                    </table>
                                </div>
                                <div v-if="entry.progressed.length > 0" class="player-subsection">
                                    <h2>Progressed ({{ entry.progressed.length }})</h2>
                                    <table class="table">
                                        <tr v-for="score in entry.progressed">
                                            <td class="rank"><p>#{{ score.rank }}</p></td>
                                            <td class="level"><a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a></td>
                                            <td class="score"><p>+{{ localize(score.score) }}</p></td>
                                        </tr>
                                    </table>
                                </div>
                                <p v-if="entry.created.length === 0 && entry.progressed.length === 0" class="player-folder-empty">No other levels.</p>
                                </div>
                            </transition>
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
        rankTitle(rank) {
            const titles = {
                1: 'Unbeatable',
                2: 'Champion',
                3: 'Elite',
                4: 'Crystal',
                5: 'Unfallen',
                6: 'Verdant',
                7: 'Verdant',
                8: 'Verdant',
                9: 'Verdant',
                10: 'Verdant',
            };

            return titles[rank] ?? 'Rank';
        },
        selectPlayer(index) {
            this.closing = false;
            this.selected = index;
        },
        toggleFolder(folder) {
            this.openFolder = this.openFolder === folder ? null : folder;
        },
        closePlayer() {
            this.closing = true;
        },
        finishClosing(event) {
            if (!this.closing || event.animationName !== 'leaderboardSlideOut') {
                return;
            }

            this.selected = null;
            this.closing = false;
        },
    },
};
