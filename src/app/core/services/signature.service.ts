import { Injectable } from '@angular/core';
import SigSDK from '@wacom/signature-sdk';
import wasmBinaryData from '../../../../node_modules/@wacom/signature-sdk/signature-sdk.wasm';

import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SignatureService {
    private sigSDK: any;

    /**
     * Initializes the Wacom Signature SDK with the WASM binary.
     */
    async init() {
        if (this.sigSDK) return;
        try {
            this.sigSDK = await SigSDK({ wasmBinary: wasmBinaryData });
            console.log('Wacom Signature SDK initialized');
        } catch (error) {
            console.error('Failed to initialize Wacom SDK:', error);
            throw error;
        }
    }

    /**
     * Captures a signature from a connected Wacom STU device.
     * @param licenseKey The Wacom license key.
     * @param licenseSecret The Wacom license secret.
     * @returns A Promise that resolves to a base64 string of the signature bitmap.
     */
    async captureFromSTU(
        licenseKey: string | undefined = environment.wacomLicenseKey,
        licenseSecret: string | undefined = environment.wacomLicenseSecret
    ): Promise<string> {
        if (!licenseKey) {
            console.error('CRITICAL: Wacom WASM capture blocked - No license key');
            throw new Error('APPLICATION_BLOCKED_NO_LICENSE');
        }
        await this.init();

        const sigObj = new this.sigSDK.SigObj();

        console.log('Wacom WASM - Using License Key:', licenseKey || '(EMPTY)');
        console.log('Wacom WASM - Using License Secret Provided:', !!licenseSecret);

        // Always pass two arguments to setLicence to avoid BindingError
        await sigObj.setLicence(licenseKey || "", licenseSecret || "");

        const isEval = sigObj.isEvaluation();
        console.log('Wacom WASM - Licence Status - Is Evaluation:', isEval);

        if (isEval && licenseKey) {
            console.warn('Wacom WASM - LICENSE_VALIDATION_FAILED: A key was provided but the SDK is still in Evaluation Mode. The key may be invalid or for a different SDK version.');
        } else if (isEval) {
            console.warn('Wacom WASM - SDK is running in EVALUATION mode (No key provided). A watermark will be present.');
        } else {
            console.log('Wacom WASM - SDK is running in PRODUCTION mode.');
        }




        const devices = await this.sigSDK.STUDevice.requestDevices();
        console.log('Wacom STU - Devices found:', devices.length);
        if (devices.length === 0) {
            console.error('Wacom STU - No devices visible to WASM SDK');
            throw new Error("No STU device found. Please ensure the device is connected.");
        }

        const device = new this.sigSDK.STUDevice(devices[0]);
        const config = new this.sigSDK.Config();
        const dialog = new this.sigSDK.StuCaptDialog(device, config);

        return new Promise((resolve, reject) => {
            dialog.addEventListener(this.sigSDK.EventType.OK, async () => {
                try {
                    // Render bitmap with parameters matching user's provided Capture() function
                    // flags = 0x2000 | 0x80000 | 0x400000 (Base64 | 32BPP | NoWatermark)
                    const flags = 0x2000 | 0x80000 | 0x400000;

                    // Arg order: width, height, type, inkWeight, inkColor, backgroundColor, flags, padX, padY
                    const image = await sigObj.renderBitmap(300, 150, "image/png", 0.5, "#ff0000", "#ffffff", flags, 0.0, 0.0);

                    console.log('Wacom Debug - Custom Bitmap rendered with flags:', flags.toString(16));
                    device.delete();
                    resolve(image);
                } catch (e) {
                    device.delete();
                    reject(e);
                }
            });

            dialog.addEventListener(this.sigSDK.EventType.CANCEL, () => {
                device.delete();
                reject("Cancelled");
            });

            dialog.open(sigObj, "Signatory", "Reason", null, this.sigSDK.KeyType.SHA512, null);
        });
    }
}
