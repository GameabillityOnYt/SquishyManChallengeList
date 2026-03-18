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
        searchQuery: '',
        err: [],
    }),
    template: `
        <main v-if="loading">
            <Spinner></Spinner>
        </main>
        <main v-else class="page-players-container">
            <div class="page-players">
                <div class="players-error">
                    <p class="error" v-if="err.length > 0">
                        Player list may be incomplete, as the following levels could not be loaded: {{ err.join(', ') }}
                    </p>
                </div>
                <div class="players-board-container">
                    <div class="players-scroll players-board-scroll">
                        <div class="players-search">
                            <label class="type-label-sm" for="players-search">Search nickname</label>
                            <input
                                id="players-search"
                                type="search"
                                v-model.trim="searchQuery"
                                placeholder="Type a nickname"
                                autocomplete="off"
                            />
                        </div>
                        <p class="players-title type-label-lg">All Players</p>
                        <table class="players-board">
                            <tr v-for="player in filteredPlayers">
                                <td class="players-rank">
                                    <p class="type-label-lg">#{{ player.rank }}</p>
                                </td>
                                <td class="players-total">
                                    <p class="type-label-lg">{{ localize(player.total) }}</p>
                                </td>
                                <td class="players-user" :class="{ 'active': entry.user.toLowerCase() === player.user.toLowerCase() }">
                                    <button @click="selectedUser = player.user">
                                        <span class="type-label-lg">{{ player.user }}</span>
                                    </button>
                                </td>
                            </tr>
                        </table>
                    </div>
                </div>
                <div class="players-detail-container" v-if="hasResults">
                    <div class="players-scroll players-detail-scroll players-detail">
                        <h1>#{{ entry.rank }} {{ entry.user }}</h1>
                        <h3>{{ localize(entry.total) }}</h3>

                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length}})</h2>
                        <table class="players-table">
                            <tr v-for="score in entry.verified">
                                <td class="players-rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="players-level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="players-score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.created.length > 0">Levels Created ({{ entry.created.length }})</h2>
                        <table class="players-table">
                            <tr v-for="score in entry.created">
                                <td class="players-rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="players-level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="players-score">
                                    <p>-</p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.completed.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <table class="players-table">
                            <tr v-for="score in entry.completed">
                                <td class="players-rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="players-level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.level }}</a>
                                </td>
                                <td class="players-score">
                                    <p>+{{ localize(score.score) }}</p>
                                </td>
                            </tr>
                        </table>

                        <h2 v-if="entry.progressed.length > 0">Progressed ({{ entry.progressed.length }})</h2>
                        <table class="players-table">
                            <tr v-for="score in entry.progressed">
                                <td class="players-rank">
                                    <p>#{{ score.rank }}</p>
                                </td>
                                <td class="players-level">
                                    <a class="type-label-lg" target="_blank" :href="score.link">{{ score.percent }}% {{ score.level }}</a>
                                </td>
                                <td class="players-score">
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
        filteredPlayers() {
            const query = this.searchQuery.trim().toLowerCase();
            if (!query) {
                return this.players;
            }
            return this.players.filter((player) =>
                player.user.toLowerCase().includes(query),
            );
        },
        hasResults() {
            return this.filteredPlayers.length > 0;
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
