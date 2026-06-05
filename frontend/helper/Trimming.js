export default function trimValue(value) {
    if (value === undefined || value === null) {
        return "0.00";
    }

    return Number(value).toFixed(0);
}