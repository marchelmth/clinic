const timeFormatter = (isoString) => {
    const date = new Date(isoString);

    return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    }).format(date);
};

export { timeFormatter };