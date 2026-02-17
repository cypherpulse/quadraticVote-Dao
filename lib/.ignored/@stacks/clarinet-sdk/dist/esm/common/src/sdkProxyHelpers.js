import { Cl } from "@stacks/transactions";
export const tx = {
    callPublicFn: (contract, method, args, sender) => ({
        callPublicFn: { contract, method, args, sender },
    }),
    callPrivateFn: (contract, method, args, sender) => ({
        callPrivateFn: { contract, method, args, sender },
    }),
    deployContract: (name, content, options, sender) => ({
        deployContract: { name, content, options, sender },
    }),
    transferSTX: (amount, recipient, sender) => ({
        transferSTX: { amount, recipient, sender },
    }),
};
export function parseEvents(events) {
    try {
        // @todo: improve type safety
        return JSON.parse(events).map((e) => {
            const { event, data } = JSON.parse(e);
            if ("raw_value" in data) {
                data.value = Cl.deserialize(data.raw_value);
            }
            return {
                event: event,
                data: data,
            };
        });
    }
    catch (e) {
        console.error(`Fail to parse events: ${e}`);
        return [];
    }
}
export function parseCosts(costs) {
    try {
        let { memory, memory_limit, total, limit } = JSON.parse(costs);
        return {
            memory: memory,
            memory_limit: memory_limit,
            total: {
                writeLength: total.write_length,
                writeCount: total.write_count,
                readLength: total.read_length,
                readCount: total.read_count,
                runtime: total.runtime,
            },
            limit: {
                writeLength: limit.write_length,
                writeCount: limit.write_count,
                readLength: limit.read_length,
                readCount: limit.read_count,
                runtime: limit.runtime,
            },
        };
    }
    catch (_e) {
        return null;
    }
}
//# sourceMappingURL=sdkProxyHelpers.js.map