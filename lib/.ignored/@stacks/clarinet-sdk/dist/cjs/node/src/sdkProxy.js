"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionProxy = getSessionProxy;
const transactions_1 = require("@stacks/transactions");
const clarinet_sdk_wasm_1 = require("@stacks/clarinet-sdk-wasm");
const sdkProxyHelpers_js_1 = require("../../common/src/sdkProxyHelpers.js");
function parseTxResponse(response) {
    return {
        result: transactions_1.Cl.deserialize(response.result),
        events: (0, sdkProxyHelpers_js_1.parseEvents)(response.events),
        costs: (0, sdkProxyHelpers_js_1.parseCosts)(response.costs),
        performance: response.performance,
    };
}
function getSessionProxy() {
    return {
        get(session, prop, receiver) {
            // some of the WASM methods are proxied here to:
            // - serialize clarity values input argument
            // - deserialize output into clarity values
            if (prop === "callReadOnlyFn" || prop === "callPublicFn" || prop === "callPrivateFn") {
                const callFn = (contract, method, args, sender) => {
                    const response = session[prop](new clarinet_sdk_wasm_1.CallFnArgs(contract, method, args.map(transactions_1.serializeCVBytes), sender));
                    return parseTxResponse(response);
                };
                return callFn;
            }
            if (prop === "execute") {
                const execute = (snippet) => {
                    const response = session.execute(snippet);
                    return parseTxResponse(response);
                };
                return execute;
            }
            if (prop === "deployContract") {
                const callDeployContract = (name, content, options, sender) => {
                    const rustOptions = options
                        ? new clarinet_sdk_wasm_1.ContractOptions(options.clarityVersion)
                        : new clarinet_sdk_wasm_1.ContractOptions();
                    const response = session.deployContract(new clarinet_sdk_wasm_1.DeployContractArgs(name, content, rustOptions, sender));
                    return parseTxResponse(response);
                };
                return callDeployContract;
            }
            if (prop === "transferSTX") {
                const callTransferSTX = (amount, ...args) => {
                    const response = session.transferSTX(new clarinet_sdk_wasm_1.TransferSTXArgs(BigInt(amount), ...args));
                    return parseTxResponse(response);
                };
                return callTransferSTX;
            }
            if (prop === "mineBlock") {
                const callMineBlock = (txs) => {
                    const serializedTxs = txs.map((tx) => {
                        if (tx.callPublicFn) {
                            return {
                                callPublicFn: {
                                    ...tx.callPublicFn,
                                    args_maps: tx.callPublicFn.args.map(transactions_1.serializeCVBytes),
                                },
                            };
                        }
                        if (tx.callPrivateFn) {
                            return {
                                callPrivateFn: {
                                    ...tx.callPrivateFn,
                                    args_maps: tx.callPrivateFn.args.map(transactions_1.serializeCVBytes),
                                },
                            };
                        }
                        if (tx.deployContract) {
                            return {
                                deployContract: {
                                    ...tx.deployContract,
                                },
                            };
                        }
                        return tx;
                    });
                    const responses = session.mineBlock(serializedTxs);
                    return responses.map(parseTxResponse);
                };
                return callMineBlock;
            }
            if (prop === "getDataVar") {
                const getDataVar = (...args) => {
                    const response = session.getDataVar(...args);
                    const result = transactions_1.Cl.deserialize(response);
                    return result;
                };
                return getDataVar;
            }
            if (prop === "getMapEntry") {
                const getMapEntry = (contract, mapName, mapKey) => {
                    const response = session.getMapEntry(contract, mapName, (0, transactions_1.serializeCVBytes)(mapKey));
                    const result = transactions_1.Cl.deserialize(response);
                    return result;
                };
                return getMapEntry;
            }
            return Reflect.get(session, prop, receiver);
        },
    };
}
//# sourceMappingURL=sdkProxy.js.map