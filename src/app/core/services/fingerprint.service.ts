import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FingerprintService {
    private sdk: any;
    public onSamplesAcquired = new Subject<any>();
    public onDeviceConnected = new Subject<any>();
    public onDeviceDisconnected = new Subject<any>();
    public onCommunicationFailed = new Subject<any>();

    constructor(private ngZone: NgZone) {
        // Initialize the SDK if Fingerprint is available
        if (typeof Fingerprint !== 'undefined') {
            this.sdk = new Fingerprint.WebApi();

            this.sdk.onSamplesAcquired = (s: any) => {
                this.ngZone.run(() => this.onSamplesAcquired.next(s));
            };
            this.sdk.onDeviceConnected = (e: any) => {
                this.ngZone.run(() => this.onDeviceConnected.next(e));
            };
            this.sdk.onDeviceDisconnected = (e: any) => {
                this.ngZone.run(() => this.onDeviceDisconnected.next(e));
            };
            this.sdk.onCommunicationFailed = (e: any) => {
                this.ngZone.run(() => this.onCommunicationFailed.next(e));
            };
        } else {
            console.warn('Fingerprint SDK not loaded. Ensure scripts are correctly added to angular.json');
        }
    }

    getReaders(): Promise<string[]> {
        if (!this.sdk) return Promise.resolve([]);
        return this.sdk.enumerateDevices();
    }

    startCapture(readerId: string): Promise<void> {
        if (!this.sdk) return Promise.reject('SDK not initialized');
        // @ts-ignore
        const format = Fingerprint.SampleFormat.PngImage;
        return this.sdk.startAcquisition(format, readerId);
    }

    stopCapture(): Promise<void> {
        if (!this.sdk) return Promise.reject('SDK not initialized');
        return this.sdk.stopAcquisition();
    }
}
