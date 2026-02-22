import { round, score } from './score.js';

/**
 * Path to directory containing `_list.json` and all levels
 */
const dir = '/data';

const cache = {
    list: { data: null, promise: null },
    editors: { data: null, promise: null },
    newTags: { data: null, promise: null },
    leaderboard: { data: null, promise: null },
};

async function getCached(key, loader, shouldPersist = (value) => value != null) {
    const entry = cache[key];
    if (entry.data != null) {
        return entry.data;
    }
    if (entry.promise) {
        return entry.promise;
    }

    entry.promise = loader()
        .then((value) => {
            if (shouldPersist(value)) {
                entry.data = value;
            }
            entry.promise = null;
            return value;
        })
        .catch((err) => {
            entry.promise = null;
            throw err;
        });

    return entry.promise;
}

export async function fetchList() {
    return getCached('list', async () => {
        const listResult = await fetch(`${dir}/_list.json`);
        try {
            const list = await listResult.json();
            return await Promise.all(
                list.map(async (path, rank) => {
                    const levelResult = await fetch(`${dir}/${path}.json`);
                    try {
                        const level = await levelResult.json();
                        return [
                            {
                                ...level,
                                path,
                                records: level.records.sort(
                                    (a, b) => b.percent - a.percent,
                                ),
                            },
                            null,
                        ];
                    } catch {
                        console.error(`Failed to load level #${rank + 1} ${path}.`);
                        return [null, path];
                    }
                }),
            );
        } catch {
            console.error(`Failed to load list.`);
            return null;
        }
    });
}

export async function fetchEditors() {
    return getCached('editors', async () => {
        try {
            const editorsResults = await fetch(`${dir}/_editors.json`);
            const editors = await editorsResults.json();
            return editors;
        } catch {
            return null;
        }
    });
}

export async function fetchNewTags() {
    return getCached('newTags', async () => {
        try {
            const tagsResult = await fetch(`${dir}/NEWtag.json`);
            const tags = await tagsResult.json();
            return tags && typeof tags === 'object' ? tags : {};
        } catch {
            return {};
        }
    });
}

export async function fetchLeaderboard() {
    return getCached('leaderboard', async () => {
        const list = await fetchList();
        if (!Array.isArray(list)) {
            return [[], ['list']];
        }

        const scoreMap = {};
        const errs = [];
        list.forEach(([level, err], rank) => {
            if (err) {
                errs.push(err);
                return;
            }

            // Verification
            const verifier = Object.keys(scoreMap).find(
                (u) => u.toLowerCase() === level.verifier.toLowerCase(),
            ) || level.verifier;
            scoreMap[verifier] ??= {
                verified: [],
                completed: [],
                progressed: [],
            };
            const { verified } = scoreMap[verifier];
            verified.push({
                rank: rank + 1,
                level: level.name,
                score: score(rank + 1, 100, level.percentToQualify),
                link: level.verification,
            });

            // Records
            level.records.forEach((record) => {
                const user = Object.keys(scoreMap).find(
                    (u) => u.toLowerCase() === record.user.toLowerCase(),
                ) || record.user;
                scoreMap[user] ??= {
                    verified: [],
                    completed: [],
                    progressed: [],
                };
                const { completed, progressed } = scoreMap[user];
                if (record.percent === 100) {
                    completed.push({
                        rank: rank + 1,
                        level: level.name,
                        score: score(rank + 1, 100, level.percentToQualify),
                        link: record.link,
                    });
                    return;
                }

                progressed.push({
                    rank: rank + 1,
                    level: level.name,
                    percent: record.percent,
                    score: score(rank + 1, record.percent, level.percentToQualify),
                    link: record.link,
                });
            });
        });

        // Wrap in extra Object containing the user and total score
        const res = Object.entries(scoreMap).map(([user, scores]) => {
            const { verified, completed, progressed } = scores;
            const total = [verified, completed, progressed]
                .flat()
                .reduce((prev, cur) => prev + cur.score, 0);

            return {
                user,
                total: round(total),
                ...scores,
            };
        });

        // Sort by total score
        return [res.sort((a, b) => b.total - a.total), errs];
    });
}
