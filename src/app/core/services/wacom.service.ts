import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

declare var wgssSignatureSDK: any;
declare var WacomGSS: any;

@Injectable({
    providedIn: 'root'
})
export class WacomService {
    private sigObj: any;
    private sigCtl: any;
    private dynCapt: any;
    private signatureImage$ = new BehaviorSubject<string | null>(null);

    constructor(private ngZone: NgZone) { }

    get signatureImage(): Observable<string | null> {
        return this.signatureImage$.asObservable();
    }

    async captureSignature() {
        if (!environment.wacomLicenseKey) {
            console.error('CRITICAL: Wacom capture blocked - No license key in environment.ts');
            throw new Error('APPLICATION_BLOCKED_NO_LICENSE');
        }
        try {
            if (typeof wgssSignatureSDK !== 'undefined') {
                this.sigCtl = new wgssSignatureSDK.SigCtl(this.onSigCtlConstructor.bind(this));
            } else if (typeof (window as any).ActiveXObject !== 'undefined' || 'ActiveXObject' in window) {
                console.log('wgssSignatureSDK not found, attempting ActiveX fallback');
                this.captureSignatureActiveX();
            } else {
                throw new Error('Wacom SigCaptX SDK not loaded and ActiveX not supported. Please check if SDK scripts are included or use a supported browser.');
            }
        } catch (error) {
            console.error('Wacom capture error:', error);
            throw error;
        }
    }

    /**
     * Captures signature using legacy ActiveX method (Internet Explorer / IE Mode)
     */
    private captureSignatureActiveX() {
        try {
            console.log("Capturing signature via ActiveX...");
            const licenseKey = environment.wacomLicenseKey;
            console.log('Wacom ActiveX - Using License Key:', licenseKey || '(EMPTY)');

            this.sigCtl = new (window as any).ActiveXObject("Florentis.SigCtl");
            this.sigCtl.SetProperty("Licence", licenseKey);

            const dc = new (window as any).ActiveXObject("Florentis.DynamicCapture");
            const rc = dc.Capture(this.sigCtl, "KMC", "KMC");

            if (rc === 0) { // CaptureOK
                console.log("Signature captured successfully via ActiveX");
                // User provided flags: SigObj.outputBase64 | SigObj.color32BPP | SigObj.encodeData (NoWatermark)
                const flags = 0x2000 | 0x80000 | 0x400000;
                // Render with user's specific parameters: Red ink (0xff0000), White bg (0xffffff), 0.5 weight
                const b64 = this.sigCtl.Signature.RenderBitmap("", 300, 150, "image/png", 0.5, 0xff0000, 0xffffff, 0.0, 0.0, flags);

                console.log('Wacom ActiveX Debug - Is Evaluation:', this.sigCtl.Signature.IsEvaluation);

                this.ngZone.run(() => {
                    this.signatureImage$.next("data:image/png;base64," + b64);
                });
            } else {
                console.warn("ActiveX Capture returned code: " + rc);
                this.handleActiveXErrorCode(rc);
            }
        } catch (ex: any) {
            console.error("ActiveX Capture() error: " + ex.message);
            throw ex;
        }
    }

    private handleActiveXErrorCode(rc: number) {
        const errorMessages: { [key: number]: string } = {
            1: "Signature capture cancelled",
            100: "No capture service available",
            101: "Tablet Error",
            102: "The integrity key parameter is invalid",
            103: "No valid Signature Capture license found",
            200: "Error - unable to parse document contents"
        };
        console.error(errorMessages[rc] || "Capture Error " + rc);
    }

    private onSigCtlConstructor(sigCtlV: any, status: number) {
        if (status === wgssSignatureSDK.ResponseStatus.OK) {
            const licenseKey = environment.wacomLicenseKey;
            console.log('Wacom SigCaptX - Using License Key:', licenseKey || '(EMPTY)');
            this.sigCtl.put_Licence(licenseKey, this.onLicenceSet.bind(this));
        } else {
            console.error('SigCtl constructor error - service likely not running:', status);
            // Cleanup to prevent device being locked
            this.sigCtl = null;
            this.ngZone.run(() => {
                this.signatureImage$.next('ERROR:SERVICE_NOT_RUNNING');
            });
        }
    }

    private onLicenceSet(sigCtlV: any, status: number) {
        if (status === wgssSignatureSDK.ResponseStatus.OK) {
            this.dynCapt = new wgssSignatureSDK.DynamicCapture(this.onDynCaptConstructor.bind(this));
        } else {
            console.error('Licence set error (Wacom rejected the key):', status);
            this.ngZone.run(() => {
                this.signatureImage$.next('ERROR:INVALID_LICENSE');
            });
        }
    }

    private onDynCaptConstructor(dynCaptV: any, status: number) {
        if (status === wgssSignatureSDK.ResponseStatus.OK) {
            this.dynCapt.Capture(this.sigCtl, "Who", "Why", null, null, this.onCaptureFinish.bind(this));
        } else {
            console.error('DynamicCapture constructor error:', status);
        }
    }

    private onCaptureFinish(dynCaptV: any, status: number) {
        if (status === wgssSignatureSDK.ResponseStatus.OK) {
            this.sigCtl.get_Signature(this.onGetSignature.bind(this));
        } else if (status === 1) { // Cancelled
            console.log('Signature capture cancelled');
        } else {
            console.error('Capture finish error:', status);
        }
    }

    private onGetSignature(sigCtlV: any, sigObjV: any, status: number) {
        if (status === wgssSignatureSDK.ResponseStatus.OK) {
            this.sigObj = sigObjV;

            // Log evaluation status for transparency
            console.log('Wacom SDK - Is Evaluation:', this.sigObj.isEvaluation());
            if (this.sigObj.isEvaluation()) {
                console.warn('Wacom SDK is in EVALUATION mode (Watermark will be present).');
            } else {
                console.log('Wacom SDK is in PRODUCTION mode (No Watermark).');
            }

            // User provided flags: Base64 | 32BPP | NoWatermark
            const flags = 0x2000 | 0x80000 | 0x400000;

            console.log('Wacom SigCaptX Debug - Rendering with user flags:', flags.toString(16));
            // Render with user's specific parameters: 300x150, 0.5 weight, Red ink, White background
            this.sigObj.RenderBitmap("image/png", 300, 150, 0.5, 0xff0000, 0xffffff, flags, 0.0, 0.0, this.onRenderBitmap.bind(this));
        } else {
            console.error('Get signature error:', status);
        }
    }

    private onRenderBitmap(sigObjV: any, bmpData: string, status: number) {
        if (status === wgssSignatureSDK.ResponseStatus.OK) {
            this.ngZone.run(() => {
                this.signatureImage$.next("data:image/png;base64," + bmpData);
            });
        } else {
            console.error('Render bitmap error:', status);
        }
    }
}
