export const getStoicQuote = async () => {
    const res = await fetch("https://stoic.tekloon.net/stoic-quote")
    return res.json();
}