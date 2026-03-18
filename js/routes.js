import List from './pages/List.js';
import Leaderboard from './pages/Leaderboard.js';
import Players from './pages/Players.js';
import Roulette from './pages/Roulette.js';

export default [
    { path: '/', component: List },
    { path: '/leaderboard', component: Leaderboard },
    { path: '/players', component: Players },
    { path: '/roulette', component: Roulette },
];
