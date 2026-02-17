import { Cl, ClarityValue } from "@stacks/transactions";
import { simnet } from "@stacks/clarinet-sdk";

export function deployContract(contractName: string) {
  const accounts = simnet.getAccounts();

  return { accounts, simnet };
}

export async function callContract(
  simnet: any,
  accounts: Map<string, any>,
  contractName: string,
  functionName: string,
  args: ClarityValue[],
  sender: string
) {
  const result = simnet.callPublicFn(contractName, functionName, args, sender);
  return result;
}

export async function readContract(
  simnet: any,
  accounts: Map<string, any>,
  contractName: string,
  functionName: string,
  args: ClarityValue[],
  sender: string
) {
  const result = simnet.callReadOnlyFn(contractName, functionName, args, sender);
  return result;
}