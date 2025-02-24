let refreshIntervalId;
let currentTabId;

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log('Background script received message:', message); 

    if (message.action === 'startSearch') {
        console.log('Starting search for:', message.term); 
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            currentTabId = tabs[0].id;
            const searchUrl = `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(message.term)}&_sop=10`;

            // Injecting the content script
            chrome.scripting.executeScript({
                target: { tabId: currentTabId },
                files: ['contentScript.js']
            }, (injectionResults) => {
                if (chrome.runtime.lastError) {
                    console.error('Content script injection failed:', chrome.runtime.lastError); 
                } else {
                    console.log('Content script injected successfully:', injectionResults);
                }
            });

            // Navigate to the eBay search URL
            chrome.tabs.update(currentTabId, { url: searchUrl }, () => {
                console.log('Navigated to eBay search page.'); 
                refreshIntervalId = setInterval(() => {
                    console.log('Refreshing page...');
                    chrome.tabs.reload(currentTabId, {}, () => {
                        chrome.scripting.executeScript({
                            target: { tabId: currentTabId },
                            files: ['contentScript.js']
                        });
                    });
                }, 10000);
            });
        });
    }

    if (message.action === 'stopSearch') {
        console.log('Stopping search.'); 
        clearInterval(refreshIntervalId);
    }
});