const timeFormatter = (isoString) => {
    let formattedString = isoString;

    if (typeof isoString === 'string' && isoString.includes(' ') && !isoString.includes('T')) {
        formattedString = isoString.replace(' ', 'T') + 'Z';
    }

    const date = new Date(formattedString);

    return new Intl.DateTimeFormat('id-ID', {
        dateStyle: 'medium',
        timeStyle: 'short',
        timeZone: 'Asia/Makassar'
    }).format(date);
};

export { timeFormatter };