// https://stackoverflow.com/questions/3452546/how-do-i-get-the-youtube-video-id-from-a-url
export function getYoutubeIdFromUrl(url) {
    const match = url.match(/.*(?:youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/);
    return (match && match[1]) ? match[1] : '';
}

export function embed(video) {
    const id = getYoutubeIdFromUrl(video);
    return 'https://www.youtube.com' + id;
}

export function localize(num) {
    return num.toLocaleString(undefined, { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    });
}

export function getThumbnailFromId(id) {
    return 'https://img.youtube.com' + id + '/mqdefault.jpg';
}

export function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex],
            array[currentIndex],
        ];
    }
    return array;
}
