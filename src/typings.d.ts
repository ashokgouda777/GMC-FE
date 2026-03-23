declare var Fingerprint: any;
declare var wgssSignatureSDK: any;
declare var WacomGSS: any;

declare module "*.wasm" {
    const content: Uint8Array;
    export default content;
}
