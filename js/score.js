/**
 * Numbers of decimal digits to round to
 */
const scale = 0;

/**
 * Calculate the score awarded when having a certain percentage on a list level
 * @param {Number} rank Position on the list
 * @param {Number} percent Percentage of completion
 * @param {Number} minPercent Minimum percentage required
 * @returns {Number}
 */
export function score(rank, percent, minPercent) {
    if (rank > 150) {
        return 0;
    }
    if (rank > 75 && percent < 100) {
        return 0;
    }

    // New formula
    let score = (-24.9975*Math.pow(rank-1, 0.4) + 200) *
        ((percent - (minPercent - 1)) / (100 - (minPercent - 1)));

    score = Math.max(0, score);

    if (percent != 100) {
        return round(score - score / 3);
    }

    return Math.max(round(score), 0);
}

export function round(num) {
    // This rounds to the nearest integer:
    // .500 and above goes UP (e.g., 174.650 -> 175)
    // Below .500 goes DOWN (e.g., 183.382 -> 183)
    return Math.round(num);
}
