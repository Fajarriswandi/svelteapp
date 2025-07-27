// src/global.d.ts

// Mendeklarasikan modul ini sebagai "any" untuk memberitahu TypeScript agar tidak memperingatkan
// tentang kurangnya definisi tipe.
declare module 'bootstrap/dist/js/bootstrap.bundle.min.js' {
    const value: any;
    export default value;
}