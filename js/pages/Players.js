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
        selectedUser: '',
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

                <section class="players-grid-panel">
                    <header class="players-grid-header">
                        <div>
                            <p class="players-label type-label-lg">View Players</p>
                            <p class="players-subtitle">{{ filteredPlayers.length }} players</p>
                        </div>
                    </header>
                    <div class="players-grid">
                        <button
                            v-for="player in filteredPlayers"
                            class="player-card"
                            :class="{ active: entry.user.toLowerCase() === player.user.toLowerCase() }"
                            @click="selectedUser = player.user"
                        >
                            <span class="player-card-rank">#{{ player.rank }}</span>
                            <span class="player-card-name type-label-lg">{{ player.user }}</span>
                            <span class="player-card-total">{{ localize(player.total) }}</span>
                        </button>
                    </div>
                </section>

                <aside class="player-drawer" :class="{ open: entry.user !== '' }">
                    <div class="player-drawer-inner">
                        <div class="player-drawer-header">
                            <div>
                                <p class="player-drawer-rank type-label-lg">#{{ entry.rank }}</p>
                                <h1 class="player-drawer-name">{{ entry.user }}</h1>
                            </div>
                            <p class="player-drawer-total type-label-lg">{{ localize(entry.total) }}</p>
                        </div>

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
                </aside>
            </div>
        </main>
    `,
    computed: {
        filteredPlayers() {
            return this.players;
        },
        entry() {
            const list = this.filteredPlayers;
            if (list.length === 0) {
                return {
                    user: 'No results',
                    rank: '-',
                    total: 0,
                    verified: [],
                    completed: [],
                    created: [],
                    progressed: [],
                };
            }
            const selected = list.find(
                (player) =>
                    this.selectedUser &&
                    player.user.toLowerCase() === this.selectedUser.toLowerCase(),
            );
            return selected ?? list[0] ?? {
                user: '',
                rank: '-',
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
        this.players = leaderboard.map((player, index) => ({
            ...player,
            rank: index + 1,
        }));
        this.err = err;
        if (this.players.length > 0) {
            this.selectedUser = this.players[0].user;
        }
        this.loading = false;
    },
    methods: {
        localize,
    },
};
