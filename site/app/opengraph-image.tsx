import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site";

export const alt = "agent-starter — agent.json, skills, and MCPs for Claude Code, Codex, and Cursor";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0a0a0a",
          color: "#f7f7f7",
          padding: 72,
          fontFamily: "Inter, Arial, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            color: "#a3a3a3",
            fontSize: 28,
            letterSpacing: 0,
          }}
        >
          <div
            style={{
              width: 44,
              height: 44,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: "2px solid #737373",
              borderRadius: 8,
              color: "#ffffff",
              fontSize: 24,
              fontWeight: 700,
            }}
          >
            A
          </div>
          {siteConfig.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div
            style={{
              maxWidth: 900,
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              lineHeight: 0.98,
              fontWeight: 800,
              letterSpacing: 0,
            }}
          >
            <span>One agent.json.</span>
            <span>Three agent targets.</span>
          </div>
          <div
            style={{
              maxWidth: 780,
              color: "#c7c7c7",
              fontSize: 30,
              lineHeight: 1.35,
              letterSpacing: 0,
            }}
          >
            Skills, MCP servers, and stack profiles, synced to Claude Code, Codex, and Cursor.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            color: "#d4d4d4",
            fontSize: 24,
            fontFamily: "monospace",
            letterSpacing: 0,
          }}
        >
          <span>.claude/</span>
          <span>.codex/</span>
          <span>.cursor/rules/</span>
        </div>
      </div>
    ),
    size,
  );
}
