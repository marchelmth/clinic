function timeAgo(isoString) {
    const utc8 = (new Date().getTime() - 8 * 60 * 60 * 1000);
    const now = new Date(utc8);
    const past = new Date(isoString);

    const diffMs = (past - now);
    const diffSecs = Math.round(diffMs / 1000);
    const diffMins = Math.round(diffSecs / 60);
    const diffHours = Math.round(diffMins / 60);
    const diffDays = Math.round(diffHours / 24);

    const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' });

    if (Math.abs(diffSecs) < 60) {
        return rtf.format(diffSecs, 'second');
    } else if (Math.abs(diffMins) < 60) {
        return rtf.format(diffMins, 'minute');
    } else if (Math.abs(diffHours) < 24) {
        return rtf.format(diffHours, 'hour');
    } else {
        return rtf.format(diffDays, 'day');
    }
}

export default timeAgo;