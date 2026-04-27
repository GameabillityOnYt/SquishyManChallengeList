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
                <section class="leaderboard-shell">
                    <header class="leaderboard-header">
                        <p class="top-players-label type-label-lg">Top 100 players</p>
                        <p class="leaderboard-subtitle type-label-sm">Classifica generale con podio, distacco e tier.</p>
                    </header>

                    <div class="podium" v-if="podiumEntries.length > 0">
                        <article
                            v-for="entry in podiumEntries"
                            :key="'podium-' + entry.rank + '-' + entry.user"
                            class="podium-card"
                            :class="'podium-rank-' + entry.rank"
                        >
                            <p class="podium-rank type-label-sm">#{{ entry.rank }}</p>
                            <p class="podium-user type-label-lg">{{ entry.user }}</p>
                            <p class="podium-total type-label-sm">{{ localize(entry.total) }} pts</p>
                            <p v-if="entry.rank > 1" class="podium-gap type-label-sm">
                                Gap: +{{ localize(scoreGap(entry.rank) || 0) }}
                            </p>
                        </article>
                    </div>

                    <div class="board-wrapper">
                        <table class="board">
                            <thead>
                                <tr>
                                    <th>Rank</th>
                                    <th>Player</th>
                                    <th>Points</th>
                                    <th>Gap</th>
                                    <th>Tier</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="entry in restEntries" :key="'row-' + entry.rank + '-' + entry.user">
                                    <td class="rank">
                                        <p class="type-label-lg">#{{ entry.rank }}</p>
                                    </td>
                                    <td class="user">
                                        <p class="type-label-lg">{{ entry.user }}</p>
                                    </td>
                                    <td class="total">
                                        <p class="type-label-lg">{{ localize(entry.total) }}</p>
                                    </td>
                                    <td class="gap">
                                        <p class="type-label-lg">+{{ localize(scoreGap(entry.rank) || 0) }}</p>
                                    </td>
                                    <td class="tier">
                                        <span class="tier-pill type-label-sm" :class="tierClass(entry.rank)">
                                            {{ tierLabel(entry.rank) }}
                                        </span>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>
        </main>
    `,
    computed: {
        visibleLeaderboard() {
            return this.leaderboard;
        },
        podiumEntries() {
            const top = this.visibleLeaderboard.slice(0, 3);
            if (top.length === 3) {
                return [top[1], top[0], top[2]];
            }
            return top;
        },
        restEntries() {
            return this.visibleLeaderboard.slice(3);
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        const source = Array.isArray(leaderboard) ? leaderboard : [];
        this.leaderboard = source.slice(0, 100).map((player, index) => ({
            ...player,
            rank: index + 1,
        }));
        this.err = err;
        this.loading = false;
    },
    methods: {
        localize,
        scoreGap(rank) {
            if (rank <= 1) {
                return null;
            }
            const current = this.visibleLeaderboard[rank - 1];
            const previous = this.visibleLeaderboard[rank - 2];
            if (!current || !previous) {
                return null;
            }
            const currentTotal = Number(current.total) || 0;
            const previousTotal = Number(previous.total) || 0;
            const gap = previousTotal - currentTotal;
            return gap > 0 ? gap : 0;
        },
        tierLabel(rank) {
            if (rank <= 10) {
                return 'Elite';
            }
            if (rank <= 25) {
                return 'Pro';
            }
            if (rank <= 50) {
                return 'Advanced';
            }
            return 'Contender';
        },
        tierClass(rank) {
            if (rank <= 10) {
                return 'tier-elite';
            }
            if (rank <= 25) {
                return 'tier-pro';
            }
            if (rank <= 50) {
                return 'tier-advanced';
            }
            return 'tier-contender';
        },
    },
};
