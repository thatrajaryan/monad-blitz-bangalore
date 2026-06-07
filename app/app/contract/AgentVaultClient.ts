import {
  createPublicClient,
  createWalletClient,
  custom,
  http,
  type Address,
} from "viem";

import AgentVaultAbi from "./abi/AgentVaultV1.json";

import { defineChain } from "viem";

export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    name: "MON",
    symbol: "MON",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz"],
    },
  },
});

declare global {
  interface Window {
    ethereum?: any;
  }
}

export class AgentVaultClient {
  constructor(
    private readonly contractAddress: Address
  ) {
    this.publicClient = createPublicClient({
      transport: http("https://testnet-rpc.monad.xyz"),
    });
  }

  private readonly publicClient;

  private async getWalletClient() {
    if (!window.ethereum) {
      throw new Error(
        "MetaMask not installed"
      );
    }

    await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    return createWalletClient({
      chain: monadTestnet,
      transport: custom(
        window.ethereum
      ),
    });
  }

  private async getAccount() {
    const walletClient =
      await this.getWalletClient();

    const [account] =
      await walletClient.getAddresses();

    return {
      walletClient,
      account,
    };
  }

  /* =====================
          READS
     ===================== */

  async getPolicy(
    policyId: bigint
  ) {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: AgentVaultAbi,
      functionName: "getPolicy",
      args: [policyId],
    });
  }

  async getChildren(
    policyId: bigint
  ) {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: AgentVaultAbi,
      functionName: "getChildren",
      args: [policyId],
    });
  }

  async getUsage(
    policyId: bigint
  ) {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: AgentVaultAbi,
      functionName: "getUsage",
      args: [policyId],
    });
  }

  async getPolicyCount() {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: AgentVaultAbi,
      functionName: "getPolicyCount",
    });
  }

  async isRecipientAllowed(
    policyId: bigint,
    recipient: Address
  ) {
    return this.publicClient.readContract({
      address: this.contractAddress,
      abi: AgentVaultAbi,
      functionName:
        "isRecipientAllowed",
      args: [
        policyId,
        recipient,
      ],
    });
  }

  /* =====================
          WRITES
     ===================== */

  async createRootPolicy(
    name: string,
    allocation: bigint
  ) {
    const {
      walletClient,
      account,
    } = await this.getAccount();

    return walletClient.writeContract({
      account,
      address:
        this.contractAddress,
      abi: AgentVaultAbi,
      functionName:
        "createRootPolicy",
      args: [
        name,
        allocation,
      ],
    });
  }

  async createPolicy(
    parentId: bigint,
    name: string,
    allocation: bigint,
    strict: boolean,
    frequency: number,
    frequencyLimit: bigint,
    recipients: Address[]
  ) {
    const {
      walletClient,
      account,
    } = await this.getAccount();

    return walletClient.writeContract({
      account,
      address:
        this.contractAddress,
      abi: AgentVaultAbi,
      functionName:
        "createPolicy",
      args: [
        parentId,
        name,
        allocation,
        strict,
        frequency,
        frequencyLimit,
        recipients,
      ],
    });
  }

  async addRecipient(
    policyId: bigint,
    recipient: Address
  ) {
    const {
      walletClient,
      account,
    } = await this.getAccount();

    return walletClient.writeContract({
      account,
      address:
        this.contractAddress,
      abi: AgentVaultAbi,
      functionName:
        "addRecipient",
      args: [
        policyId,
        recipient,
      ],
    });
  }

  async setAllocation(
    policyId: bigint,
    allocation: bigint
  ) {
    const {
      walletClient,
      account,
    } = await this.getAccount();

    return walletClient.writeContract({
      account,
      address:
        this.contractAddress,
      abi: AgentVaultAbi,
      functionName:
        "setAllocation",
      args: [
        policyId,
        allocation,
      ],
    });
  }

  async setAgent(
    agent: Address
  ) {
    const {
      walletClient,
      account,
    } = await this.getAccount();

    return walletClient.writeContract({
      account,
      address:
        this.contractAddress,
      abi: AgentVaultAbi,
      functionName:
        "setAgent",
      args: [agent],
    });
  }

  async executeSpend(
    policyId: bigint,
    recipient: Address,
    amount: bigint
  ) {
    const {
      walletClient,
      account,
    } = await this.getAccount();

    return walletClient.writeContract({
      account,
      address:
        this.contractAddress,
      abi: AgentVaultAbi,
      functionName:
        "executeSpend",
      args: [
        policyId,
        recipient,
        amount,
      ],
    });
  }

  async getAgent() {
  return this.publicClient.readContract({
    address: this.contractAddress,
    abi: AgentVaultAbi,
    functionName: "agent",
  });
}
}
