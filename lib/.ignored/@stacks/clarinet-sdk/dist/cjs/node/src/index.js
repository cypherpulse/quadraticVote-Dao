"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSimnet = exports.tx = void 0;
exports.getSDK = getSDK;
exports.generateDeployement = generateDeployement;
var sdkProxyHelpers_js_1 = require("../../common/src/sdkProxyHelpers.js");
Object.defineProperty(exports, "tx", { enumerable: true, get: function () { return sdkProxyHelpers_js_1.tx; } });
const vfs_js_1 = require("./vfs.js");
const sdkProxy_js_1 = require("./sdkProxy.js");
const wasmModule = Promise.resolve().then(() => __importStar(require("@stacks/clarinet-sdk-wasm")));
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// @ts-ignore
BigInt.prototype.toJSON = function () {
    return this.toString();
};
async function getSDK(options) {
    const module = await wasmModule;
    let sdkOptions = new module.SDKOptions(!!options?.trackCosts, !!options?.trackCoverage, !!options?.trackPerformance);
    const simnet = new Proxy(new module.SDK(vfs_js_1.vfs, sdkOptions), (0, sdkProxy_js_1.getSessionProxy)());
    return simnet;
}
// wrapper around `simnet.generateDeploymentPlan()` that loads wasm and pass process.cwd()
async function generateDeployement(manifestPath = "./Clarinet.toml") {
    const simnet = await getSDK();
    try {
        await simnet.generateDeploymentPlan(process.cwd(), manifestPath);
        return true;
    }
    catch (e) {
        console.warn(e);
        return false;
    }
}
// load wasm only once and memoize it
function memoizedInit() {
    let simnet = null;
    return async (manifestPath = "./Clarinet.toml", noCache = false, options) => {
        if (noCache || !simnet) {
            simnet = await getSDK(options);
        }
        // start a new simnet session
        await simnet.initSession(process.cwd(), manifestPath);
        return simnet;
    };
}
exports.initSimnet = memoizedInit();
//# sourceMappingURL=index.js.map