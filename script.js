

'use strict';

/**
 * This function retrieves an element from the Document Object Model (DOM) using its id.
 * @param {string} id - The id of the element to retrieve.
 * @returns {HTMLElement} The element with the specified id, or null if no such element exists.
 */
const getElement = (id) => document.getElementById(id);

/**
 * Logs an error message to the console.
 * @param {string} message - The error message to log.
 */
const logError = (message) => console.error(message);

/**
 * Assigns an event listener to a specified HTML element. If the element does not exist, logs an error message.
 * @param {HTMLElement} element - The HTML element to assign the event listener to.
 * @param {string} event - The name of the event to listen for.
 * @param {function} callback - The function to execute when the event is triggered.
 */
const assignEventListener = (element, event, callback) =>
    element
        ? element.addEventListener(event, callback)
        : logError(`${element} not found for event: ${event}`);

/**
 * An array to hold the data fetched from the API or local quotes.
 * Initially, it is an empty array.
 * @type {Array}
 */
let data = [];

/**
 * An object that holds references to various HTML elements in the DOM.
 * Each property of the object is a reference to an HTML element, retrieved using the getElement function.
 * @type {Object}
 * @property {HTMLElement} mainContainer - The main container of the app.
 * @property {HTMLElement} quote - The element that displays the quote.
 * @property {HTMLElement} author - The element that displays the author of the quote.
 * @property {HTMLElement} newQuoteBtn - The button that triggers the display of a new quote.
 * @property {HTMLElement} twitterBtn - The button that triggers the sharing of the current quote.
 * @property {HTMLElement} loader - The loading spinner element.
 */
const elements = {
    mainContainer: getElement("main-container"),
    quote: getElement("quote"),
    author: getElement("author"),
    newQuoteBtn: getElement("new-quote"),
    twitterBtn: getElement("twitter"),
    loader: getElement("loader"),
}

/**
 * Shows the loading spinner and hides the main content.
 */
const loading = () => {
    elements.loader.hidden = false;
    elements.mainContainer.hidden = true;
}

/**
 * Hides the loading spinner and shows the main content.
 */
const completeLoading = () => {
    elements.mainContainer.hidden = false;
    elements.loader.hidden = true;
}

/**
 * Shares the current quote and its author on social media.
 * Uses the Web Share API if available to show the native sharing options.
 * If not supported, falls back to sharing via Twitter.
 */
const shareQuote = () => {
    const quote = elements.quote.textContent;
    const author = elements.author.textContent;

    if (!quote || !author) {
        logError("No quote or author to share");
        return;
    }

    const shareText = `${quote} ${author}`;

    if (navigator.share) {
        // Use Web Share API to open native sharing dialog (mobile and some desktop browsers)
        navigator.share({
            title: 'InkSpire Quote',
            text: shareText,
            url: window.location.href,
        }).catch((error) => {
            logError("Error sharing via Web Share API: " + error);
        });
    } else {
        // Fallback: open Twitter intent with the quote
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
    }
}

/**
 * Sets the text content of the quote and author elements in the DOM.
 * If the author is not provided, defaults to "Unknown".
 * Also toggles the "long-quote" class on the quote element based on the length of the quote.
 * @param {Object} quoteObject - The object containing the quote and author text.
 * @param {string} quoteObject.author - The author of the quote.
 * @param {string} quoteObject.text - The quote text.
 */
const setQuote = ({ author: authorText = "Unknown", text: quoteText }) => {
    const { quote, author } = elements;
    quote.textContent = quoteText;
    author.textContent = ` - ${authorText}`;
    quote.classList.toggle("long-quote", quoteText.length > 120);
}

/**
 * Selects a random quote from the data array and sets it as the current quote.
 * If the data array is empty, logs an error message.
 * Uses the setQuote function to set the quote and author text in the DOM.
 */
const newQuote = () => {
    loading();
    if (!data.length) {
        logError("No quotes to display");
        completeLoading();
        return;
    }
    setQuote(data[Math.floor(Math.random() * data.length)]);
    completeLoading();
}

/**
 * Asynchronously fetches quotes from an API and stores them in the data array.
 * If the fetch operation is successful, the function adds the fetched quotes to the data array and displays a new quote.
 * If the fetch operation fails, the function logs an error message, adds the local quotes to the data array, and displays a new quote.
 */
async function getQuotes() {
    loading();
    const apiURL = "https://type.fit/api/quotes";

    try {
        const response = await fetch(apiURL);
        const apiQuotes = await response.json();

        // localQuotes is expected to be defined globally in quotes.js, merged with API quotes here
        data = [...localQuotes, ...apiQuotes];
        newQuote();
    } catch (error) {
        logError("Error fetching quotes: " + error);
        data = [...localQuotes];
        newQuote();
    }
}

// Assign event listeners for buttons
assignEventListener(elements.newQuoteBtn, "click", newQuote);
assignEventListener(elements.twitterBtn, "click", shareQuote);

// Fetch quotes immediately on script load
getQuotes().catch(error => {
    logError("Unhandled error in getQuotes: " + error);
});
