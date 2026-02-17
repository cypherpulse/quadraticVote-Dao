import { Cl, serializeCVBytes } from "@stacks/transactions";
import { CallFnArgs, DeployContractArgs, TransferSTXArgs, ContractOptions, } from "@stacks/clarinet-sdk-wasm";
import { parseEvents, parseCosts, } from "../../common/src/sdkProxyHelpers.js";
function parseTxResponse(response) {
    return {
        result: Cl.deserialize(response.result),
        events: parseEvents(response.events),
        costs: parseCosts(response.costs),
        performance: response.performance,
    };
}
export function getSessionProxy() {
    return {
        get(session, prop, receiver) {
            // some of the WASM methods are proxied here to:
            // - serialize clarity values input argument
            // - deserialize output into clarity values
            if (prop === "callReadOnlyFn" || prop === "callPublicFn" || prop === "callPrivateFn") {
                const callFn = (contract, method, args, sender) => {
                    const response = session[prop](new CallFnArgs(contract, method, args.map(serializeCVBytes), sender));
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
                        ? new ContractOptions(options.clarityVersion)
                        : new ContractOptions();
                    const response = session.deployContract(new DeployContractArgs(name, content, rustOptions, sender));
                    return parseTxResponse(response);
                };
                return callDeployContract;
            }
            if (prop === "transferSTX") {
                const callTransferSTX = (amount, ...args) => {
                    const response = session.transferSTX(new TransferSTXArgs(BigInt(amount), ...args));
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
                                    args_maps: tx.callPublicFn.args.map(serializeCVBytes),
                                },
                            };
                        }
                        if (tx.callPrivateFn) {
                            return {
                                callPrivateFn: {
                                    ...tx.callPrivateFn,
                                    args_maps: tx.callPrivateFn.args.map(serializeCVBytes),
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
                    const result = Cl.deserialize(response);
                    return result;
                };
                return getDataVar;
            }
            if (prop === "getMapEntry") {
                const getMapEntry = (contract, mapName, mapKey) => {
                    const response = session.getMapEntry(contract, mapName, serializeCVBytes(mapKey));
                    const result = Cl.deserialize(response);
                    return result;
                };
                return getMapEntry;
            }
            return Reflect.get(session, prop, receiver);
        },
    };
}
//# sourceMappingURL=sdkProxy.js.map