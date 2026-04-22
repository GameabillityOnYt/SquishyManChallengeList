// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    return url.match(
        /.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/,
    )?.[1] ?? '';
}

export function embed(video) {
    return `https://www.youtube-nocookie.com/embed/${getYoutubeIdFromUrl(video)}`;
}

export function localize(num) {
    return num.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    });
}

export function getThumbnailFromId(id) {
    return `https://img.youtube.com/vi/${id}/mqdefault.jpg`;
}

export function parseRecordPercent(value) {
    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : null;
    }

    const raw = String(value ?? '').trim();
    if (!raw) {
        return null;
    }

    const runMatch = raw.match(
        /^(-?\d+(?:\.\d+)?)\s*(?:-|\u2013|\u2014)\s*(-?\d+(?:\.\d+)?)%?$/,
    );
    if (runMatch) {
        const start = Number(runMatch[1]);
        const end = Number(runMatch[2]);
        if (!Number.isFinite(start) || !Number.isFinite(end)) {
            return null;
        }
        return Math.max(0, end - start);
    }

    const normalized = Number(raw.replace('%', '').trim());
    return Number.isFinite(normalized) ? normalized : null;
}

// https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
export function shuffle(array) {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
        // Pick a remaining element.
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }

    return array;
}
