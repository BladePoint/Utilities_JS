export class AssetLoader extends EventTarget {
    static COMPLETE = 'complete';

    constructor(options) {
        super();
        const {requestLogFunction=null, errorFunction=null, progressFunction=null, completeLogFunction=null} = options;
        this.requestLogFunction = requestLogFunction;
        this.errorFunction = errorFunction;
        this.progressFunction = progressFunction;
        this.completeLogFunction = completeLogFunction;
        this.fileTotal;
        this.fileCount;
        this.headerCount;
        this.areHeadersCounted;
        this.downloadTotal;
        this.progressArray = [];
        this.blobArray = [];
    }
    loadArray(urlArray) {
        this.fileTotal = urlArray.length;
        this.fileCount = 0;
        this.headerCount = 0;
        this.areHeadersCounted = false;
        this.downloadTotal = 0;
        for (let i=0; i<this.fileTotal; i++) {
            const url = urlArray[i];
            if (this.requestLogFunction) this.requestLogFunction(url);
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'blob';
            xhr.onreadystatechange = (evt) => this.sumContentLength(xhr);
            xhr.onerror = () => this.onError(i);
            xhr.onprogress = (evt) => this.calcProgress(i, evt);
            xhr.onload = () => this.onLoad(xhr, i, url);
            xhr.send();
        }
    }
    sumContentLength(xhr) {
        if (xhr.readyState === XMLHttpRequest.HEADERS_RECEIVED) {
            this.headerCount++;
            if (this.headerCount == this.fileTotal) this.areHeadersCounted = true;
            var contentLength = xhr.getResponseHeader('Content-Length');
            if (contentLength !== null) this.downloadTotal += parseInt(contentLength, 10);
            else console.log('Content-Length header not found in response.');
        }
    }
    onError(url) {
        if (this.errorFunction) this.errorFunction(url);
    }
    calcProgress(i, evt) {
        if (this.progressFunction) {
            this.progressArray[i] = evt.loaded;
            if (this.areHeadersCounted) {
                const totalProgress = this.progressArray.reduce((total, loaded) => total + loaded, 0);
                const progress = totalProgress / this.downloadTotal * 100;
                this.progressFunction(progress);
            }
        }
    };
    onLoad (xhr, i, url) {
        if (xhr.status === 200) {
            this.fileCount++;
            const blob = xhr.response;
            this.blobArray[i] = blob;
            this.completeLogFunction(i);
            if (this.fileCount === this.fileTotal) this.dispatchEvent(new Event(AssetLoader.COMPLETE));
        } else this.onError(url);
    };
    dispose() {
        this.blobArray.length = this.progressArray.length = 0;
    }
}