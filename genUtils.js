export function loadLocalStorage(localStorageKey, defaultObject) {
    if (testLocalStorage()) {
        const storedJson = localStorage.getItem(localStorageKey);
        if (storedJson) {
            const storedObject = JSON.parse(storedJson);
            for (const property in defaultObject) {
                if (storedObject.hasOwnProperty(property)) {
                    const defaultValue = defaultObject[property];
                    const storedValue = storedObject[property];
                    if (typeof defaultValue !== typeof storedValue) {
                        if (typeof defaultValue === 'number') {
                            defaultObject[property] = parseFloat(storedValue);
                        } else if (typeof defaultValue === 'boolean') {
                            defaultObject[property] = storedValue === 'true';
                        }
                    } else defaultObject[property] = storedObject[property];
                }
            }
        }
    }
    return defaultObject;
}
export function saveLocalStorage(localStorageKey, settingsObject) {
    if (testLocalStorage()) localStorage.setItem(localStorageKey, JSON.stringify(settingsObject));
}
function testLocalStorage() {
    try {
        localStorage.setItem("testKey", "testValue");
        localStorage.removeItem("testKey");
        return true;
    } catch (error) {
        return false;
    }
}
