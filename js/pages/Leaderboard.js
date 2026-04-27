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
        selected: 0,
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
                <h1 class="title">Top 100 Players</h1>
                <div class="player-card"
                     v-for="(ientry, i) in visibleLeaderboard"
                     :key="i"
                     :class="{ 'active': selected == i, 'rank-1': i === 0, 'rank-2': i === 1, 'rank-3': i === 2 }"
                     @click="selected = i">
                    <span class="rank">#{{ i + 1 }}</span>
                    <div class="player-info">
                        <span class="player-name">{{ ientry.user }}</span>
                        <span class="player-levels">{{ getTotalLevels(ientry) }} livelli</span>
                    </div>
                    <span class="player-score">{{ localize(ientry.total) }} punti</span>
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
        getTotalLevels(entry) {
            const verified = entry.verified?.length || 0;
            const completed = entry.completed?.length || 0;
            return verified + completed;
        },
    },
};
