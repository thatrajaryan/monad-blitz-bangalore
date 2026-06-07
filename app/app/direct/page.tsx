"use client";

import { useState } from "react";
import { AgentVaultClient } from "@/app/contract/AgentVaultClient";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_VAULT_ADDRESS as `0x${string}`;

export default function Home() {
  const [policyJson, setPolicyJson] = useState("");
  const [recipientJson, setRecipientJson] = useState("");
  const [spendJson, setSpendJson] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [rootPolicyJson, setRootPolicyJson] = useState("");

  const vault = new AgentVaultClient(CONTRACT_ADDRESS);

  async function handleCreateRootPolicy() {
  try {
    setLoading(true);

    const body =
      JSON.parse(rootPolicyJson);

    const txHash =
      await vault.createRootPolicy(
        body.name,
        BigInt(body.allocation)
      );

    setResponse({
      success: true,
      txHash,
    });
  } catch (err: any) {
    setResponse({
      success: false,
      error:
        err?.shortMessage ??
        err?.message,
    });
  } finally {
    setLoading(false);
  }
}

  async function handleCreatePolicy() {
    try {
      setLoading(true);
      const body = JSON.parse(policyJson);

      const txHash = await vault.createPolicy(
        BigInt(body.parentId),
        body.name,
        BigInt(body.allocation),
        body.strict,
        body.frequency,
        BigInt(body.frequencyLimit),
        body.recipients || []
      );

      setResponse({ success: true, txHash });
    } catch (err: any) {
      setResponse({
        success: false,
        error: err?.shortMessage ?? err?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRecipient() {
    try {
      setLoading(true);
      const body = JSON.parse(recipientJson);

      const txHash = await vault.addRecipient(
        BigInt(body.policyId),
        body.recipient
      );

      setResponse({ success: true, txHash });
    } catch (err: any) {
      setResponse({
        success: false,
        error: err?.shortMessage ?? err?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSpend() {
    try {
      setLoading(true);
      const body = JSON.parse(spendJson);

      const txHash = await vault.executeSpend(
        BigInt(body.policyId),
        body.recipient,
        BigInt(body.amount)
      );

      setResponse({ success: true, txHash });
    } catch (err: any) {
      setResponse({
        success: false,
        error: err?.shortMessage ?? err?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "24px" }}>
      <h1>AgentVault</h1>

      <h2>Create Root Policy</h2>

      <textarea
        rows={6}
        style={{ width: "100%" }}
        value={rootPolicyJson}
        onChange={(e) =>
          setRootPolicyJson(
            e.target.value
          )
        }
        placeholder={`{
        "name": "Family Budget",
        "allocation": "100000"
      }`}
      />

      <br />
      <br />

      <button
        disabled={loading}
        onClick={
          handleCreateRootPolicy
        }
         style={{ cursor: "pointer" }}
      >
        Create Root Policy
      </button>

      <hr />

      <h2>Create Policy</h2>
      <textarea
        rows={10}
        style={{ width: "100%" }}
        value={policyJson}
        onChange={(e) => setPolicyJson(e.target.value)}
      />
      <br /><br />
      <button disabled={loading} onClick={handleCreatePolicy} style={{ cursor: "pointer" }}>
        Create Policy
      </button>

      <hr />

      <h2>Add Recipient</h2>
      <textarea
        rows={6}
        style={{ width: "100%" }}
        value={recipientJson}
        onChange={(e) => setRecipientJson(e.target.value)}
      />
      <br /><br />
      <button disabled={loading} onClick={handleAddRecipient} style={{ cursor: "pointer" }}>
        Add Recipient
      </button>

      <hr />

      <h2>Send Money</h2>
      <textarea
        rows={8}
        style={{ width: "100%" }}
        value={spendJson}
        onChange={(e) => setSpendJson(e.target.value)}
      />
      <br /><br />
      <button disabled={loading} onClick={handleSpend}  style={{ cursor: "pointer" }}>
        Send Money
      </button>

      <hr />

      <h2>Response</h2>
      <pre
        style={{
          background: "#111",
          color: "#0f0",
          padding: "12px",
          overflowX: "auto",
        }}
      >
        {JSON.stringify(response, null, 2)}
      </pre>
    </main>
  );
}
