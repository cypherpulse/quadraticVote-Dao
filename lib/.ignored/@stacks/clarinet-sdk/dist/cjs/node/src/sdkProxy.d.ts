import { type SDK } from "@stacks/clarinet-sdk-wasm";
import { type CallFn, type DeployContract, type GetDataVar, type GetMapEntry, type MineBlock, type Execute, type TransferSTX } from "../../common/src/sdkProxyHelpers.js";
/** @deprecated use `simnet.execute(command)` instead */
type RunSnippet = SDK["runSnippet"];
export type Simnet = {
    [K in keyof SDK]: K extends "callReadOnlyFn" | "callPublicFn" | "callPrivateFn" ? CallFn : K extends "execute" ? Execute : K extends "runSnippet" ? RunSnippet : K extends "deployContract" ? DeployContract : K extends "transferSTX" ? TransferSTX : K extends "mineBlock" ? MineBlock : K extends "getDataVar" ? GetDataVar : K extends "getMapEntry" ? GetMapEntry : SDK[K];
};
export declare function getSessionProxy(): {
    get(session: SDK, prop: keyof SDK, receiver: any): string | number | CallFn | DeployContract | TransferSTX | MineBlock | GetMapEntry | ((cwd: string, manifest_path: string) => Promise<void>) | ((include_boot_contracts: boolean, boot_contracts_path: string) => import("@stacks/clarinet-sdk-wasm").SessionReport) | ((count?: number | null) => number) | ((cost_field: string) => void) | ((addresses: string[]) => void) | ((token: string, recipient: string, amount: bigint) => string) | ((recipient: string, amount: bigint) => string);
};
export {};
