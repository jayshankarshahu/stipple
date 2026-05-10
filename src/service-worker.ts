const OPEN_PREFERENCE_KEY = 'openPreference';

const applyOpenPreference = async (preference: 'popup' | 'sidepanel' | undefined) => {
    const isPopup = preference === 'popup';

    await chrome.sidePanel
        .setPanelBehavior({ openPanelOnActionClick: !isPopup })
        .catch((error) => console.error('Failed to set side panel behavior:', error));

    await chrome.action
        .setPopup({ popup: isPopup ? 'index.html' : '' })
        .catch((error) => console.error('Failed to set action popup:', error));
};

const openEditorInMode = async (mode: 'popup' | 'sidepanel') => {
    if (mode === 'popup') {
        const openPopup = (chrome.action as any).openPopup;
        if (typeof openPopup === 'function') {
            await openPopup().catch((error: Error) => console.error('Failed to open popup:', error));
            return;
        }

        await chrome.windows
            .create({ url: chrome.runtime.getURL('index.html'), type: 'popup', width: 400, height: 700 })
            .catch((error) => console.error('Failed to open popup window:', error));
    } else {
        const openSidePanel = (chrome.sidePanel as any).open;
        if (typeof openSidePanel === 'function') {
            await openSidePanel().catch((error: Error) => console.error('Failed to open side panel:', error));
            return;
        }

        console.warn('Side panel open API is not available.');
    }
};

chrome.storage.local.get(OPEN_PREFERENCE_KEY, (result) => {
    applyOpenPreference(result[OPEN_PREFERENCE_KEY] as 'popup' | 'sidepanel' | undefined);
});

chrome.storage.onChanged.addListener((changes) => {
    if (changes[OPEN_PREFERENCE_KEY]) {
        const newMode = changes[OPEN_PREFERENCE_KEY].newValue as 'popup' | 'sidepanel' | undefined;
        applyOpenPreference(newMode)
            .then(() => {
                if (newMode) {
                    openEditorInMode(newMode)
                        .catch((error) => console.error('Failed to open editor after mode change:', error));
                }
            })
            .catch((error) => console.error('Failed to apply open preference:', error));
    }
});
