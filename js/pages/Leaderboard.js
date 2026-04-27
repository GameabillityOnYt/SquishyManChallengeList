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
                <div class="board-container">
                    <p class="top-players-label type-label-lg">Top 100 players</p>
                    <table class="board">
                        <tr v-for="(ientry, i) in visibleLeaderboard" :class="['board-row', rankTierClass(i + 1)]">
                            <td class="rank">
                                <span :class="['rank-badge', rankBadgeClass(i + 1)]">#{{ i + 1 }}</span>
                            </td>
                            <td class="user">
                                <div :class="['name-pill', rankTierClass(i + 1)]">
                                    <span class="type-label-lg">{{ ientry.user }}</span>
                                </div>
                            </td>
                            <td class="points">
                                <p class="type-label-lg">P {{ localize(ientry.total) }}</p>
                            </td>
                            <td class="levels">
                                <p class="type-label-lg">lvl/s {{ entryLevelCount(ientry) }}/150</p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </main>
    `,
    computed: {
        visibleLeaderboard() {
            return this.leaderboard.slice(0, 100);
        },
    },
    async mounted() {
        const [leaderboard, err] = await fetchLeaderboard();
        this.leaderboard = leaderboard;
        this.err = err;
        this.loading = false;
    },
    methods: {
        localize,
        rankTierClass(rank) {
            if (rank === 1) return 'tier-gold';
            if (rank === 2) return 'tier-silver';
            if (rank === 3) return 'tier-bronze';
            if (rank <= 10) return 'tier-veteran';
            if (rank <= 25) return 'tier-cyan';
            if (rank <= 50) return 'tier-military';
            return 'tier-grey';
        },
        rankBadgeClass(rank) {
            if (rank <= 3) return 'badge-elite';
            if (rank <= 10) return 'badge-strong';
            if (rank <= 25) return 'badge-solid';
            if (rank <= 50) return 'badge-basic';
            return 'badge-minimal';
        },
        entryLevelCount(entry) {
            const rankSet = new Set();
            ['verified', 'completed', 'progressed', 'created'].forEach((key) => {
                (entry[key] ?? []).forEach((item) => {
                    if (item?.rank != null) {
                        rankSet.add(item.rank);
                    }
                });
            });

            return Math.min(rankSet.size, 150);
        },
    },
};
