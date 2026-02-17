export { tx, type ClarityEvent, type ParsedTransactionResult, type DeployContractOptions, type Tx, type TransferSTX, } from "../../common/src/sdkProxyHelpers.js";
import { Simnet } from "./sdkProxy.js";
export { type Simnet } from "./sdkProxy.js";
type Options = {
    trackCosts: boolean;
    trackCoverage: boolean;
    trackPerformance?: boolean;
};
export declare function getSDK(options?: Options): Promise<Simnet>;
export declare function generateDeployement(manifestPath?: string): Promise<boolean>;
export declare const initSimnet: (manifestPath?: string, noCache?: boolean, options?: {
    trackCosts: boolean;
    trackCoverage: boolean;
    trackPerformance?: boolean;
    performanceCostField?: string;
}) => Promise<Simnet>;
