export { tx, } from "../../common/src/sdkProxyHelpers.js";
import { vfs } from "./vfs.js";
import { getSessionProxy } from "./sdkProxy.js";
const wasmModule = import("@stacks/clarinet-sdk-wasm");
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
// @ts-ignore
BigInt.prototype.toJSON = function () {
    return this.toString();
};
export async function getSDK(options) {
    const module = await wasmModule;
    let sdkOptions = new module.SDKOptions(!!options?.trackCosts, !!options?.trackCoverage, !!options?.trackPerformance);
    const simnet = new Proxy(new module.SDK(vfs, sdkOptions), getSessionProxy());
    return simnet;
}
// wrapper around `simnet.generateDeploymentPlan()` that loads wasm and pass process.cwd()
export async function generateDeployement(manifestPath = "./Clarinet.toml") {
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
export const initSimnet = memoizedInit();
//# sourceMappingURL=index.js.map