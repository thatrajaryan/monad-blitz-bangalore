"use client";

import { useEffect, useMemo, useState } from "react";
import { AgentVaultClient } from "@/app/contract/AgentVaultClient";

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_AGENT_VAULT_ADDRESS as `0x${string}`;

const ROOT_PARENT =
  BigInt(
    "115792089237316195423570985008687907853269984665640564039457584007913129639935"
  );

type TreeNode = {
  id: number;
  name: string;
  strict: boolean;
  allocation: bigint;
  parentId: bigint;
  frequency: bigint;
  frequencyLimit: bigint;
  children: TreeNode[];
};

export default function Page() {
  const [root, setRoot] =
    useState<TreeNode | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [selectedId, setSelectedId] =
    useState<number | null>(0);

  const vault = useMemo(
    () =>
      new AgentVaultClient(
        CONTRACT_ADDRESS
      ),
    []
  );

  async function loadTree() {
    try {
      setLoading(true);

      const count =
        Number(
          await vault.getPolicyCount()
        );

      console.log(
        "Policy Count:",
        count
      );

      const nodes =
        new Map<number, TreeNode>();

      for (
        let i = 0;
        i < count;
        i++
      ) {
        const p =
          (await vault.getPolicy(
            BigInt(i)
          )) as any;

        console.log(
          "Policy",
          i,
          p
        );

        nodes.set(i, {
          id: i,
          name: p[0],
          strict: p[1],
          allocation: p[2],
          parentId: p[3],
          frequency: p[5],
          frequencyLimit: p[6],
          children: [],
        });
      }

      let rootNode:
        | TreeNode
        | null = null;

      for (const node of nodes.values()) {
        if (
          node.parentId ===
          ROOT_PARENT
        ) {
          rootNode = node;
          continue;
        }

        const parent =
          nodes.get(
            Number(
              node.parentId
            )
          );

        if (parent) {
          parent.children.push(
            node
          );
        }
      }

      setRoot(rootNode);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTree();
  }, []);

  return (
    <main
      style={{
        padding: "24px",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1>
        AgentVault Policy Tree
      </h1>

      <button
        onClick={loadTree}
      >
        Refresh
      </button>

      <br />
      <br />

      {loading && (
        <div>
          Loading...
        </div>
      )}

      {!loading &&
        root && (
          <TreeNodeView
            node={root}
            selectedId={
              selectedId
            }
            onSelect={
              setSelectedId
            }
          />
        )}

      {!loading &&
        !root && (
          <div>
            No root policy found
          </div>
        )}
    </main>
  );
}

function TreeNodeView({
  node,
  selectedId,
  onSelect,
}: {
  node: TreeNode;
  selectedId:
    | number
    | null;
  onSelect: (
    id: number
  ) => void;
}) {
  const selected =
    node.id === selectedId;

  return (
    <div
      style={{
        marginLeft: "24px",
        borderLeft:
          "2px solid #ddd",
        paddingLeft:
          "12px",
        marginTop: "12px",
      }}
    >
      <div
        onClick={() =>
          onSelect(node.id)
        }
        style={{
          cursor: "pointer",
          padding: "12px",
          borderRadius: "8px",
          border: selected
            ? "2px solid #2563eb"
            : "1px solid #ddd",
          background:
            selected
              ? "gray"
              : "black",
        }}
      >
        <div>
          {selected &&
            "⭐ "}

          <strong>
            {node.name}
          </strong>

          {" "}
          (Policy #
          {node.id})
        </div>

        <div>
          Allocation:
          {" "}
          {node.allocation.toString()}
        </div>

        <div>
          Strict:
          {" "}
          {String(
            node.strict
          )}
        </div>

        <div>
          Frequency:
          {" "}
          {node.frequency.toString()}
        </div>

        <div>
          Children:
          {" "}
          {node.children.length}
        </div>
      </div>

      {node.children.map(
        (child) => (
          <TreeNodeView
            key={child.id}
            node={child}
            selectedId={
              selectedId
            }
            onSelect={
              onSelect
            }
          />
        )
      )}
    </div>
  );
}