(function () {
  "use strict";

  const styles = `
    :host{--chat:#1f6f5f;--chat-dark:#164f44;font:14px/1.45 system-ui,-apple-system,sans-serif}
    *{box-sizing:border-box}.toggle{position:fixed;right:20px;bottom:20px;width:58px;height:58px;border:0;border-radius:50%;background:var(--chat);color:white;font-size:25px;box-shadow:0 8px 28px #0003;cursor:pointer}
    .panel{position:fixed;right:20px;bottom:90px;width:min(380px,calc(100vw - 24px));height:min(560px,calc(100vh - 120px));display:none;flex-direction:column;background:white;border:1px solid #dce3e1;border-radius:18px;box-shadow:0 16px 48px #0003;overflow:hidden}.panel.open{display:flex}
    header{padding:16px 18px;background:var(--chat);color:white;font-weight:700;font-size:16px}.messages{flex:1;overflow:auto;padding:16px;background:#f7faf9}.msg{max-width:85%;margin:0 0 12px;padding:10px 12px;border-radius:14px;white-space:pre-wrap;overflow-wrap:anywhere}.bot{background:white;border:1px solid #e3e9e7}.user{margin-left:auto;background:var(--chat);color:white}.error{color:#8a1c1c}
    form{display:flex;gap:8px;padding:12px;border-top:1px solid #e3e9e7}input{min-width:0;flex:1;padding:11px 12px;border:1px solid #bdc9c6;border-radius:10px;font:inherit}input:focus{outline:2px solid #84bbae;border-color:transparent}button.send{border:0;border-radius:10px;padding:0 16px;background:var(--chat);color:white;font-weight:700;cursor:pointer}button:disabled{opacity:.6;cursor:wait}
  `;

  class StoreChat extends HTMLElement {
    constructor() {
      super();
      this.history = [];
      const root = this.attachShadow({ mode: "closed" });
      root.innerHTML = `<style>${styles}</style><button class="toggle" aria-label="Open store assistant" aria-expanded="false">💬</button><section class="panel" aria-label="Store assistant"><header>Store assistant</header><div class="messages" aria-live="polite"><div class="msg bot">Hi! I can help with products, recommendations, store policies, and your cart.</div></div><form><input name="message" maxlength="500" autocomplete="off" placeholder="Ask about a product…" aria-label="Message"><button class="send">Send</button></form>`;
      this.ui = {
        toggle: root.querySelector(".toggle"), panel: root.querySelector(".panel"),
        form: root.querySelector("form"), input: root.querySelector("input"), messages: root.querySelector(".messages"),
      };
    }

    connectedCallback() {
      this.ui.toggle.addEventListener("click", () => {
        const open = this.ui.panel.classList.toggle("open");
        this.ui.toggle.setAttribute("aria-expanded", String(open));
        if (open) this.ui.input.focus();
      });
      this.ui.form.addEventListener("submit", (event) => this.send(event));
    }

    addMessage(text, kind) {
      const node = document.createElement("div");
      node.className = `msg ${kind}`;
      node.textContent = text;
      this.ui.messages.append(node);
      this.ui.messages.scrollTop = this.ui.messages.scrollHeight;
      return node;
    }

    async request(message, token) {
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      const base = (this.getAttribute("api-base") || "").replace(/\/$/, "");
      return fetch(`${base}/api/chat/message/stream`, {
        method: "POST", headers, body: JSON.stringify({ message, history: this.history }), credentials: "same-origin",
      });
    }

    async consumeStream(response, node) {
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.message || "The assistant is unavailable.");
      }
      if (!response.body) throw new Error("Streaming is not supported by this browser.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let answer = "";
      let showingTool = false;

      const processEvent = (block) => {
        const data = block.split("\n").filter((line) => line.startsWith("data:"))
          .map((line) => line.slice(5).trimStart()).join("\n");
        if (!data) return;
        const event = JSON.parse(data);
        if (event.type === "tool" && !answer) {
          showingTool = true;
          node.textContent = "Checking the latest store information…";
        } else if (event.type === "delta") {
          if (showingTool) { node.textContent = ""; showingTool = false; }
          answer += event.text;
          node.textContent = answer;
          this.ui.messages.scrollTop = this.ui.messages.scrollHeight;
        } else if (event.type === "done") {
          answer = event.answer || answer;
          node.textContent = answer;
        } else if (event.type === "error") {
          throw new Error(event.message || "The assistant is unavailable.");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        buffer += decoder.decode(value || new Uint8Array(), { stream: !done }).replace(/\r\n/g, "\n");
        let boundary;
        while ((boundary = buffer.indexOf("\n\n")) !== -1) {
          processEvent(buffer.slice(0, boundary));
          buffer = buffer.slice(boundary + 2);
        }
        if (done) break;
      }
      if (buffer.trim()) processEvent(buffer);
      if (!answer) throw new Error("The assistant returned an empty response.");
      return answer;
    }

    async send(event) {
      event.preventDefault();
      const message = this.ui.input.value.trim();
      if (!message) return;
      this.addMessage(message, "user");
      this.ui.input.value = "";
      this.ui.input.disabled = true;
      this.ui.form.querySelector("button").disabled = true;
      try {
        let token = null;
        if (typeof window.StoreChatGetAccessToken === "function") {
          try { token = await window.StoreChatGetAccessToken(); } catch { /* Continue as a guest. */ }
        }

        let response = await this.request(message, token);
        // A stale login must not block public store questions. The anonymous retry
        // still cannot access carts because the API protects cart requests.
        if (token && response.status === 401) response = await this.request(message, null);
        const botMessage = this.addMessage("Thinking…", "bot");
        const answer = await this.consumeStream(response, botMessage);
        this.history.push({ role: "user", content: message }, { role: "model", content: answer });
        this.history = this.history.slice(-12);
      } catch (error) {
        this.addMessage(error instanceof Error ? error.message : "The assistant is unavailable.", "bot error");
      } finally {
        this.ui.input.disabled = false;
        this.ui.form.querySelector("button").disabled = false;
        this.ui.input.focus();
      }
    }
  }

  if (!customElements.get("store-chat")) customElements.define("store-chat", StoreChat);
})();
