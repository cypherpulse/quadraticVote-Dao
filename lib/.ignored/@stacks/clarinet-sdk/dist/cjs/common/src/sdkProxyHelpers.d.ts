import { ClarityValue } from "@stacks/transactions";
export type ClarityEvent = {
    event: string;
    data: {
        raw_value?: string;
        value?: ClarityValue;
        [key: string]: any;
    };
};
export type ExecutionCost = {
    writeLength: number;
    writeCount: number;
    readLength: number;
    readCount: number;
    runtime: number;
};
export type ClarityCosts = {
    total: ExecutionCost;
    limit: ExecutionCost;
    memory: number;
    memory_limit: number;
};
export type ParsedTransactionResult = {
    result: ClarityValue;
    events: ClarityEvent[];
    costs: ClarityCosts | null;
    performance: string | undefined;
};
export type CallFn = (contract: string, method: string, args: ClarityValue[], sender: string) => ParsedTransactionResult;
export type DeployContractOptions = {
    clarityVersion: 1 | 2 | 3 | 4;
};
export type DeployContract = (name: string, content: string, options: DeployContractOptions | null, sender: string) => ParsedTransactionResult;
export type TransferSTX = (amount: number | bigint, recipient: string, sender: string) => ParsedTransactionResult;
export type Tx = {
    callPublicFn: {
        contract: string;
        method: string;
        args: ClarityValue[];
        sender: string;
    };
    callPrivateFn?: never;
    deployContract?: never;
    transferSTX?: never;
} | {
    callPublicFn?: never;
    callPrivateFn: {
        contract: string;
        method: string;
        args: ClarityValue[];
        sender: string;
    };
    deployContract?: never;
    transferSTX?: never;
} | {
    callPublicFn?: never;
    callPrivateFn?: never;
    deployContract: {
        name: string;
        content: string;
        options: DeployContractOptions | null;
        sender: string;
    };
    transferSTX?: never;
} | {
    callPublicFn?: never;
    callPrivateFn?: never;
    deployContract?: never;
    transferSTX: {
        amount: number;
        recipient: string;
        sender: string;
    };
};
export declare const tx: {
    callPublicFn: (contract: string, method: string, args: ClarityValue[], sender: string) => Tx;
    callPrivateFn: (contract: string, method: string, args: ClarityValue[], sender: string) => Tx;
    deployContract: (name: string, content: string, options: DeployContractOptions | null, sender: string) => Tx;
    transferSTX: (amount: number, recipient: string, sender: string) => Tx;
};
export declare function parseEvents(events: string): ClarityEvent[];
export declare function parseCosts(costs: string): ClarityCosts | null;
export type MineBlock = (txs: Array<Tx>) => ParsedTransactionResult[];
export type Execute = (snippet: string) => ParsedTransactionResult;
export type GetDataVar = (contract: string, dataVar: string) => ClarityValue;
export type GetMapEntry = (contract: string, mapName: string, mapKey: ClarityValue) => ClarityValue;
