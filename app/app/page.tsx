"use client";

import { useState } from "react";
import { AgentVaultClient } from "@/app/contract/AgentVaultClient";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_VAULT_ADDRESS as `0x${string}`;


export default function Page() {
  const [text, setText] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [apiresponse, setapiResponse] = useState<any>(null);

  const vault = new AgentVaultClient(CONTRACT_ADDRESS);

  async function handleCreateRootPolicy(body: any) {
  try {
    setLoading(true);

    // const body =
    //   JSON.parse(json_body);

    const txHash =
      await vault.createRootPolicy(
        body.name,
        BigInt(body.allocation)
      );

    setapiResponse({
    //   success: true,
      msg: txHash,
    });
  } catch (err: any) {
    setapiResponse({
    //   success: false,
      msg:
        err?.shortMessage ??
        err?.message,
    });
  } finally {
    setLoading(false);
  }
}

  async function handleCreatePolicy(body: any) {
    try {
      setLoading(true);
    //   const body = JSON.parse(json_body);

      const txHash = await vault.createPolicy(
        BigInt(body.parentId),
        body.name,
        BigInt(body.allocation),
        body.strict,
        body.frequency,
        BigInt(body.frequencyLimit),
        body.recipients || []
      );

      setapiResponse({ msg: txHash });
    } catch (err: any) {
      setapiResponse({
        // success: false,
        msg: err?.shortMessage ?? err?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleAddRecipient(body: any) {
    try {
      setLoading(true);
    //   const body = JSON.parse(json_body);

      const txHash = await vault.addRecipient(
        BigInt(body.policyId),
        body.recipient
      );

      setapiResponse({ msg: txHash });
    } catch (err: any) {
      setapiResponse({
        // success: false,
        msg: err?.shortMessage ?? err?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleSpend(body: any) {
    try {
      setLoading(true);
    //   const body = JSON.parse(json_body);

      const txHash = await vault.executeSpend(
        BigInt(body.policyId),
        body.recipient,
        BigInt(body.amount)
      );

      setapiResponse({ msg: txHash });
    } catch (err: any) {
      setapiResponse({
        // success: false,
        msg: err?.shortMessage ?? err?.message,
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async () => {
    if (!text.trim()) return;

    setLoading(true);
    setResponse("");

    try {
        
      const res = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY}`,
          },
          body: JSON.stringify({
            model: process.env.NEXT_PUBLIC_OPENROUTER_MODEL,
            messages: [
                {
                role: "system",
                content: `
            You are an API intent parser for a smart wallet.

            Your job is to convert the user's natural language request into exactly one of the following API calls:

            - CreateRootPolicy
            - CreatePolicy
            - CreateRecipient
            - SendMoney

            The response MUST be valid JSON only.

            Response format:

            {
            "typeOfApi": "CreateRootPolicy" | "CreatePolicy" | "CreateRecipient" | "SendMoney",
            "body": {}
            }

            Definitions:

            enum Frequency {
            NONE = 0,
            DAILY = 1,
            WEEKLY = 2,
            MONTHLY = 3,
            YEARLY = 4
            }

            CreateRootPolicyRequest:
            {
            "name": string,
            "allocation": string
            }

            CreatePolicyRequest:
            {
            "parentId": number,
            "name": string,
            "allocation": string,
            "strict": boolean,
            "frequency": Frequency,
            "frequencyLimit": string,
            "recipients": string[]
            }

            AddRecipientRequest:
            {
            "policyId": number,
            "recipient": string
            }

            ExecuteSpendRequest:
            {
            "policyId": number,
            "recipient": string,
            "amount": string
            }

            Rules:

            1. Infer the correct API type from the user's request.
            2. Return ONLY JSON.
            3. Do not include explanations.
            4. Amounts and allocations must be strings.
            5. Frequency must be one of:
            NONE=0
            DAILY=1
            WEEKLY=2
            MONTHLY=3
            YEARLY=4
            6. If a required field is missing, set it to null.
            7. For CreateRecipient use the AddRecipientRequest format.
            8. For SendMoney use the ExecuteSpendRequest format.

            Examples:

            User:
            Create a root policy called Family with allocation 1000

            Response:
            {
            "typeOfApi": "CreateRootPolicy",
            "body": {
                "name": "Family",
                "allocation": "1000"
            }
            }

            User:
            Create a child policy called Groceries under policy 1 with allocation 500, strict mode enabled, monthly limit 500 and recipients 0x123,0x456

            Response:
            {
            "typeOfApi": "CreatePolicy",
            "body": {
                "parentId": 1,
                "name": "Groceries",
                "allocation": "500",
                "strict": true,
                "frequency": 3,
                "frequencyLimit": "500",
                "recipients": ["0x123","0x456"]
            }
            }

            User:
            Add recipient 0x123 to policy 2

            Response:
            {
            "typeOfApi": "CreateRecipient",
            "body": {
                "policyId": 2,
                "recipient": "0x123"
            }
            }

            User:
            Send 50 to 0x123 from policy 2

            Response:
            {
            "typeOfApi": "SendMoney",
            "body": {
                "policyId": 2,
                "recipient": "0x123",
                "amount": "50"
            }
            }
                `,
                },
                {
                role: "user",
                content: text,
                },
            ],
            }),
        }
      );

      const data = await res.json();
      const jsoncontent = data.choices[0].message.content;
      const content = JSON.parse(jsoncontent);
    //   console.log(JSON.parse(content));
    if(content["typeOfApi"] == "CreateRootPolicy") {
        handleCreateRootPolicy(content["body"]);
    } else if(content["typeOfApi"] == "CreatePolicy") {
        handleCreatePolicy(content["body"]);
    } else if(content["typeOfApi"] == "CreateRecipient") {
        handleAddRecipient(content["body"]);
    } else if(content["typeOfApi"] == "SendMoney") {
        handleSpend(content["body"]);
    } else {
        alert("Invalid message");
    }
    console.log(content);
      setResponse(
        data.choices?.[0]?.message?.content ?? "No response received"
      );
    } catch (error) {
      console.error(error);
      setResponse("Failed to call OpenRouter");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Chatter Box</h1>

      <textarea
        className="w-full border rounded p-3 min-h-[250px]"
        placeholder="Enter text..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="mt-4 px-4 py-2 border rounded"
      >
        {loading ? "Sending..." : "Submit"}
      </button>

      {response && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">Response</h2>
          <pre className="whitespace-pre-wrap border rounded p-3">
            {response}
          </pre>
        </div>
      )}

      {!loading && apiresponse && (
        <div className="mt-6">
          <h2 className="font-semibold mb-2">API Response</h2>
          <pre className="whitespace-pre-wrap border rounded p-3">
            {apiresponse.msg}
          </pre>
        </div>
      )}
    </main>
  );
}