import { fetchLeaderboard, fetchList } from '../content.js';
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
        levels: [],
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
                        <h2 v-if="entry.verified.length > 0">Verified ({{ entry.verified.length }})</h2>
                        <div class="players-levels" v-if="entry.verified.length > 0">
                            <a
                                v-for="level in entry.verified"
                                :key="'verified-' + level.rank + '-' + level.level"
                                class="players-level-pill type-label-lg"
                                :class="{
                                    'is-top75': level.rank <= 75,
                                    'is-bottom': level.rank > 75,
                                    'is-legacy': level.rank > 150,
                                }"
                                target="_blank"
                                :href="level.link"
                            >
                                {{ level.level }}
                            </a>
                        </div>

                        <h2 v-if="entry.created.length > 0">Created ({{ entry.created.length }})</h2>
                        <div class="players-levels" v-if="entry.created.length > 0">
                            <a
                                v-for="level in entry.created"
                                :key="'created-' + level.rank + '-' + level.level"
                                class="players-level-pill type-label-lg"
                                :class="{
                                    'is-top75': level.rank <= 75,
                                    'is-bottom': level.rank > 75,
                                    'is-legacy': level.rank > 150,
                                }"
                                target="_blank"
                                :href="level.link"
                            >
                                {{ level.level }}
                            </a>
                        </div>

                        <h2 v-if="levels.length > 0">Completed ({{ entry.completed.length }})</h2>
                        <p class="players-section-meta" v-if="levels.length > 0">
                            {{ entry.completed.length }} / {{ levels.length }}
                        </p>
                        <div class="players-levels" v-if="levels.length > 0">
                            <a
                                v-for="level in levels"
                                :key="'completed-' + level.rank + '-' + level.name"
                                class="players-level-pill type-label-lg"
                                :class="{
                                    'is-top75': level.rank <= 75,
                                    'is-bottom': level.rank > 75,
                                    'is-unbeaten': !completedLookup[level.name.toLowerCase()],
                                    'is-legacy': level.rank > 150,
                                }"
                                target="_blank"
                                :href="level.link"
                            >
                                {{ level.name }}
                            </a>
                        </div>
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
        completedLookup() {
            const lookup = {};
            this.entry.completed.forEach((score) => {
                lookup[score.level.toLowerCase()] = true;
            });
            this.entry.verified.forEach((score) => {
                lookup[score.level.toLowerCase()] = true;
            });
            return lookup;
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        const list = await fetchList();
        this.players = leaderboard.map((player, index) => ({
            ...player,
            rank: index + 1,
        }));
        if (Array.isArray(list)) {
            this.levels = list
                .map(([level], index) =>
                    level
                        ? {
                              name: level.name,
                              link: level.verification,
                              rank: index + 1,
                          }
                        : null,
                )
                .filter(Boolean);
        }
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
