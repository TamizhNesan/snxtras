document.addEventListener('DOMContentLoaded', () => {
    const instanceSelect = document.getElementById('instance-select');
    const switchInstanceBtn = document.getElementById('switch-instance');
    const cancelTranxBtn = document.getElementById('cancel-tranx');
    const impersonateBtn = document.getElementById('impersonate');
    const openOptionsBtn = document.getElementById('open-options');

    chrome.storage.sync.get('instances', (data) => {
        const instances = data.instances || [];
        instanceSelect.innerHTML = instances.map(instance => 
            `<option value="${instance.name}">${instance.displayName}</option>`
        ).join('');
    });

    const isServiceNowPage = (url) => {
        return url && url.hostname.endsWith('service-now.com');
    };

    const redirectUrl = (url, openInNewTab) => {
        if (url && url.startsWith('https://')) {
            try {
                if (openInNewTab) {
                    chrome.tabs.create({ url: url });
                } else {
                    chrome.tabs.update({ url: url });
                }
            } catch (error) {
                alert(`Error: ${error.message}`);
            }
        } else {
            alert('Invalid URL');
        }
    };

    const getCurrentTabUrl = (callback) => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const currentTab = tabs[0];
            if (currentTab && currentTab.url) {
                callback(new URL(currentTab.url));
            } else {
                alert('Could not retrieve the current tab URL.');
            }
        });
    };

    const handleServiceNowAction = (action) => {
        getCurrentTabUrl((currentUrl) => {
            if (!isServiceNowPage(currentUrl)) {
                alert('This action only works on ServiceNow pages.');
                return;
            }
            action(currentUrl);
            window.close(); // Close the popup after the action
        });
    };

    switchInstanceBtn.addEventListener('click', () => {
        handleServiceNowAction((currentUrl) => {
            const instanceName = instanceSelect.value;
            if (!instanceName) {
                alert('Please select an instance.');
                return;
            }
            const newUrl = currentUrl.href.replace(/^https:\/\/[a-zA-Z0-9\-]+\.service-now\.com/, `https://${instanceName}.service-now.com`);

            redirectUrl(newUrl, true); // Open in new tab
        });
    });

    cancelTranxBtn.addEventListener('click', () => {
        handleServiceNowAction((currentUrl) => {
            const newUrl = `${currentUrl.origin}/cancel_my_transactions.do`;

            redirectUrl(newUrl, false); // Open in the same tab
        });
    });

    impersonateBtn.addEventListener('click', () => {
        handleServiceNowAction((currentUrl) => {
            const newUrl = `${currentUrl.origin}/impersonate_dialog.do`;

            redirectUrl(newUrl, false); // Open in the same tab
        });
    });

    openOptionsBtn.addEventListener('click', () => {
        chrome.runtime.openOptionsPage();
        window.close(); // Close the popup after opening options page
    });
});
