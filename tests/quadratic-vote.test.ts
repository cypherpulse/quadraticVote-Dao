import { describe, expect, it } from "vitest";
import { Cl } from "@stacks/transactions";

declare const simnet: any;

describe("quadratic-vote contract", () => {
  const contractName = "quadratic-vote";

  it("should create a proposal", async () => {
    const accounts = simnet.getAccounts();

    const title = "Test Proposal";
    const description = "This is a test proposal";

    const result = simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8(title), Cl.stringUtf8(description)],
      accounts.get("wallet_1")!.address
    );

    expect(result).toBeOk(Cl.uint(0));
  });

  it("should get proposal count", async () => {
    const accounts = simnet.getAccounts();

    const count = simnet.callReadOnlyFn(
      contractName,
      "get-proposal-count",
      [],
      accounts.get("wallet_1")!.address
    );

    expect(count).toBeUint(0);
  });

  it("should vote on a proposal", async () => {
    const accounts = simnet.getAccounts();

    // Create proposal first
    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Test"), Cl.stringUtf8("Description")],
      accounts.get("wallet_1")!.address
    );

    // Vote with stake 9 (sqrt = 3)
    const result = simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(9)],
      accounts.get("wallet_1")!.address
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should get proposal after voting", async () => {
    const accounts = simnet.getAccounts();

    // Create proposal
    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Test"), Cl.stringUtf8("Description")],
      accounts.get("wallet_1")!.address
    );

    // Vote
    simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(9)],
      accounts.get("wallet_1")!.address
    );

    // Get proposal
    const proposal = simnet.callReadOnlyFn(
      contractName,
      "get-proposal",
      [Cl.uint(0)],
      accounts.get("wallet_1")!.address
    );

    expect(proposal).toBeSome(
      Cl.tuple({
        title: Cl.stringUtf8("Test"),
        description: Cl.stringUtf8("Description"),
        creator: Cl.principal(accounts.get("wallet_1")!.address),
        "created-at": Cl.uint(1), // block height
        "total-vote-weight": Cl.uint(3), // sqrt(9)
      })
    );
  });

  it("should get vote details", async () => {
    const accounts = simnet.getAccounts();

    // Create proposal
    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Test"), Cl.stringUtf8("Description")],
      accounts.get("wallet_1")!.address
    );

    // Vote
    simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(9)],
      accounts.get("wallet_1")!.address
    );

    // Get vote
    const vote = simnet.callReadOnlyFn(
      contractName,
      "get-vote",
      [Cl.uint(0), Cl.principal(accounts.get("wallet_1")!.address)],
      accounts.get("wallet_1")!.address
    );

    expect(vote).toBeSome(
      Cl.tuple({
        stake: Cl.uint(9),
        "vote-weight": Cl.uint(3),
      })
    );
  });

  it("should withdraw vote", async () => {
    const accounts = simnet.getAccounts();

    // Create proposal
    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Test"), Cl.stringUtf8("Description")],
      accounts.get("wallet_1")!.address
    );

    // Vote
    simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(9)],
      accounts.get("wallet_1")!.address
    );

    // Withdraw
    const result = simnet.callPublicFn(
      contractName,
      "withdraw-vote",
      [Cl.uint(0)],
      accounts.get("wallet_1")!.address
    );

    expect(result).toBeOk(Cl.bool(true));
  });

  it("should fail to vote on invalid proposal", async () => {
    const accounts = simnet.getAccounts();

    const result = simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(9)],
      accounts.get("wallet_1")!.address
    );

    expect(result).toBeErr(Cl.uint(101)); // ERR-INVALID-PROPOSAL
  });

  it("should fail to vote with zero stake", async () => {
    const accounts = simnet.getAccounts();

    // Create proposal
    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Test"), Cl.stringUtf8("Description")],
      accounts.get("wallet_1")!.address
    );

    const result = simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(0)],
      accounts.get("wallet_1")!.address
    );

    expect(result).toBeErr(Cl.uint(103)); // ERR-INVALID-AMOUNT
  });

  it("should fail to withdraw non-existent vote", async () => {
    const accounts = simnet.getAccounts();

    // Create proposal
    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Test"), Cl.stringUtf8("Description")],
      accounts.get("wallet_1")!.address
    );

    const result = simnet.callPublicFn(
      contractName,
      "withdraw-vote",
      [Cl.uint(0)],
      accounts.get("wallet_1")!.address
    );

    expect(result).toBeErr(Cl.uint(102)); // ERR-NO-STAKE
  });

  it("should handle multiple votes correctly", async () => {
    const accounts = simnet.getAccounts();

    // Create proposal
    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Test"), Cl.stringUtf8("Description")],
      accounts.get("wallet_1")!.address
    );

    // First vote: stake 4 (sqrt = 2)
    simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(4)],
      accounts.get("wallet_1")!.address
    );

    // Second vote: stake 5 more (total 9, sqrt = 3)
    simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(5)],
      accounts.get("wallet_1")!.address
    );

    // Check proposal weight
    const proposal = simnet.callReadOnlyFn(
      contractName,
      "get-proposal",
      [Cl.uint(0)],
      accounts.get("wallet_1")!.address
    );

    expect(proposal).toBeSome(
      Cl.tuple({
        title: Cl.stringUtf8("Test"),
        description: Cl.stringUtf8("Description"),
        creator: Cl.principal(accounts.get("wallet_1")!.address),
        "created-at": Cl.uint(1),
        "total-vote-weight": Cl.uint(3), // sqrt(9)
      })
    );

    // Check vote
    const vote = simnet.callReadOnlyFn(
      contractName,
      "get-vote",
      [Cl.uint(0), Cl.principal(accounts.get("wallet_1")!.address)],
      accounts.get("wallet_1")!.address
    );

    expect(vote).toBeSome(
      Cl.tuple({
        stake: Cl.uint(9),
        "vote-weight": Cl.uint(3),
      })
    );
  });

  it("should get top proposals", async () => {
    const accounts = simnet.getAccounts();

    // Create two proposals
    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Proposal 1"), Cl.stringUtf8("Description 1")],
      accounts.get("wallet_1")!.address
    );

    simnet.callPublicFn(
      contractName,
      "create-proposal",
      [Cl.stringUtf8("Proposal 2"), Cl.stringUtf8("Description 2")],
      accounts.get("wallet_1")!.address
    );

    // Vote on first proposal
    simnet.callPublicFn(
      contractName,
      "vote",
      [Cl.uint(0), Cl.uint(16)], // sqrt = 4
      accounts.get("wallet_1")!.address
    );

    // Get top proposals
    const top = simnet.callReadOnlyFn(
      contractName,
      "get-top-proposals",
      [],
      accounts.get("wallet_1")!.address
    );

    expect(top).toBeList([Cl.uint(0), Cl.uint(1), Cl.uint(2), Cl.uint(3), Cl.uint(4), Cl.uint(5), Cl.uint(6), Cl.uint(7), Cl.uint(8), Cl.uint(9)]);
  });
});