.page-leaderboard-container {
    display: block;
    height: 100vh;
    overflow: hidden;
}
.page-leaderboard {
    display: grid;
    grid-template-columns: minmax(24rem, 2fr) 3fr;
    grid-template-rows: max-content 1fr;
    column-gap: 2rem;
    max-width: 80rem;
    margin: 0 auto;
    height: 100%;
    align-items: start;
    padding-top: 2rem;
    padding-bottom: 2rem;
}

.page-leaderboard .board-container,
.page-leaderboard .player-container{
    grid-row:2;
    overflow-y:auto;
    overflow-x:auto;
    max-height: calc(100vh - 8rem);
    min-width:0;
    background-color: var(--color-background);
    z-index: 1;
    box-shadow: 0 6px 18px rgba(0,0,0,0.04);
}
.page-leaderboard .error-container {
    grid-row: 1;
    grid-column: 1 / span 2;
}
.page-leaderboard .error-container .error {
    padding: 1rem;
    background-color: var(--color-error);
    color: var(--color-on-error);
}
.page-leaderboard .board-container {
    padding-inline: 1rem;
    padding-block: 2rem;
}
.page-leaderboard .board {
    table-layout: auto;
    display: block;
    width: 100%;
}
.page-leaderboard .board .rank {
     padding-block: 1rem;
    text-align: end;
    color: #FFA500; 
    font-weight: bold;
    text-shadow: 0 0 10px rgba(255, 165, 0, 0.5); 
}
.page-leaderboard .board .total {
    padding: 1rem;
    text-align: end;
}
.page-leaderboard .board .user {
    width: 100%;
}
.page-leaderboard .board .user button {
    background-color: var(--color-background);
    color: var(--color-on-background);
    border: none;
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: start;
    word-break: normal;
    overflow-wrap: anywhere;
    white-space: normal; /* prevent forced single-line clipping */
}
.page-leaderboard .board .user button:hover {
    background-color: var(--color-background-hover);
    color: var(--color-on-background-hover);
    cursor: pointer;
}
.page-leaderboard .board .user.active button {
    background-color: var(--color-primary);
    color: var(--color-on-primary);
}
.page-leaderboard .player {
    display: flex;
    flex-direction: column;
    gap: 2rem;
    padding-right: 2rem;
}
.page-leaderboard .player .table {
    table-layout: fixed;
}
.page-leaderboard .player .table tr td:not(:last-child) {
    padding-right: 2rem;
}
.page-leaderboard .player .table p,
.page-leaderboard .player .table a {
    padding-block: 1rem;
}
.page-leaderboard .player .table .rank p,
.page-leaderboard .player .table .score p {
    text-align: end;
}
.page-leaderboard .player .table .level {
    width: 100%;
}
.page-leaderboard .player .table a:hover {
    text-decoration: underline;
}
.special-text {
    background-color: DeepSkyBlue;
    color: black;
    font-weight: bold;
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    display: inline-block; 
    margin-top: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 0 10px rgba(0, 191, 255,0.6);
    width: fit-content;
    max-width: 100%;
    word-wrap: break-word;
}
.champion-text { 
    background-color: rgba(255, 0, 0, 1);
    color: black;
    font-weight: bold;
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    display: inline-block; 
    margin-top: 1rem;
    margin-bottom: 1rem;
    box-shadow: 0 0 10px rgba(255, 0, 0, 0.6);
    width: fit-content;
    max-width: 100%;
    word-wrap: break-word;
}
.CCWinner1-text { 
    background-color: rgba(255, 220, 0, 1);
    color: black;
    font-weight: bold;
    font-size: 1.2rem;
    padding: 0.4rem 0.8rem;
    border-radius: 0.5rem;
    display: inline-block; 
    margin-top: 1rem;
    margin-bottom: 1rem;
    box-shadow: 10 0 10px rgba(255, 220, 0, 0.6);
    width: fit-content;
    max-width: 100%;
    word-wrap: break-word;
}

@keyframes pulse {
    0% { box-shadow: 0 0 10px rgba(0, 191, 255, 0.6); }
    50% { box-shadow: 0 0 20px rgba(0, 191, 255, 1); }
    100% { box-shadow: 0 0 10px rgba(0, 191, 255, 0.6); }
}
@keyframes pulse-red {
    0% { box-shadow: 0 0 10px rgba(130, 0, 0, 0.5); }
    50% { box-shadow: 0 0 20px rgba(130, 0, 130, 1); }
    100% { box-shadow: 0 0 10px rgba(130, 0, 0, 0.5); }
}
@keyframes pulse-CC1 { 
    0% { box-shadow: 10 0 10px rgba(255, 255, 0, 0.5); }
    50% { box-shadow: 10 0 20px rgba(255, 255, 130, 1); }
    100% { box-shadow: 10 0 10px rgba(255, 255, 0, 0.5); }
}

.special-text { animation: pulse 2s infinite; }
.very-special-text { animation: pulse-red 1s infinite; }
.CCWinner1-text { animation: pulse-CC1 2s infinite; }

.page-leaderboard .board tr {
    position: relative;
    border: none;
}

.page-leaderboard .board tr::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background: linear-gradient(to right, transparent, rgba(128, 128, 128, 0.3), transparent);
}

.page-leaderboard .board tr:last-child::after {
    display: none;
}

.page-leaderboard .player{
gap:.5rem!important;
}

.page-leaderboard .player .table p,
.page-leaderboard .player .table a{
padding-block:.35rem!important;
}
