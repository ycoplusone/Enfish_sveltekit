<script>
  import { onMount, tick } from 'svelte';  
  import fastapi                          from "$lib/api.js";             // api 호출 모듈

  let input = '';
  let isLoading = false;
  let listEl;

  let messages = [
    {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: '질문을 입력하면 RAG API로 요청을 보내고 응답을 채팅처럼 표시합니다.',
      createdAt: Date.now()
    }
  ];

  function addMessage(role, content) {
    messages = [
      ...messages,
      {
        id: crypto.randomUUID(),
        role,
        content: String(content ?? ''),
        createdAt: Date.now()
      }
    ];
  }

  async function scrollToBottom() {
    await tick();
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
  }

  function extractAnswer(payload) {
    // 백엔드 응답 필드가 확정되지 않았으므로 안전하게 처리
    if (payload == null) return '';
    if (typeof payload === 'string') return payload;

    const keys = ['answer', 'result', 'output', 'message', 'text', 'content'];
    for (const k of keys) {
      if (typeof payload[k] === 'string' && payload[k].trim()) return payload[k];
    }

    // 없으면 JSON pretty
    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  }

  async function send() {
    const q = input.trim();
    if (!q || isLoading) return;
    //console.log('send query:', q);

    addMessage('user', q);
    input = '';
    isLoading = true;
    await scrollToBottom();
    let params = {             query : q,               }



    try {
      await fastapi('post', '/ai/ollamarag/?query='+q, {} , (json) => {
        addMessage('assistant', extractAnswer(json));
      });
    } catch (e) {
      const detail = e?.data ? extractAnswer(e.data) : (e?.message || String(e));
      addMessage('assistant', `오류: ${detail}`);
    } finally {
      isLoading = false;
      await scrollToBottom();
    }
  }

  function onKeyDown(e) {
    // Enter 전송, Shift+Enter 줄바꿈
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  onMount(scrollToBottom);
</script>

<div class="page">
  <header class="header">
    <div class="title">Ollama RAG Chat</div>
  </header>

  <main class="chat">
    <div class="messages" bind:this={listEl} aria-live="polite">
      {#each messages as m (m.id)}
        <div class="row {m.role}">
          <div class="bubble">
            <div class="role">{m.role === 'user' ? 'You' : 'Assistant'}</div>
            <pre class="content">{m.content}</pre>
          </div>
        </div>
      {/each}

      {#if isLoading}
        <div class="row assistant">
          <div class="bubble">
            <div class="role">Assistant</div>
            <div class="typing">응답 생성 중...</div>
          </div>
        </div>
      {/if}
    </div>

    <form class="composer" on:submit|preventDefault={send}>
      <textarea
        class="input"
        rows="2"
        placeholder="질문을 입력하세요 (Enter 전송, Shift+Enter 줄바꿈)"
        bind:value={input}
        on:keydown={onKeyDown}
        disabled={isLoading}
      ></textarea>
      <button class="send" type="submit" disabled={isLoading || !input.trim()}>
        전송
      </button>
    </form>
  </main>
</div>

<style>
  .page {
    height: 90vh;
    display: flex;
    flex-direction: column;
    background: #0b0d10;
    color: #e8e8ea;
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  }

  .header {
    padding: 16px 16px 10px;
    border-bottom: 1px solid #1e232b;
  }

  .title {
    font-size: 18px;
    font-weight: 700;
  }

  .subtitle {
    margin-top: 4px;
    font-size: 12px;
    color: #a7adbb;
  }

  .chat {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }

  .messages {
    flex: 1;
    overflow: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .row {
    display: flex;
  }

  .row.user {
    justify-content: flex-end;
  }

  .row.assistant {
    justify-content: flex-start;
  }

  .bubble {
    max-width: min(600px, 92%);
    border: 1px solid #1e232b;
    border-radius: 14px;
    padding: 10px 12px;
    background: #0f1319;
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
  }

  .row.user .bubble {
    background: #121a2a;
    border-color: #24314d;
  }

  .role {
    font-size: 11px;
    color: #a7adbb;
    margin-bottom: 6px;
  }

  .content {
    margin: 0;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 14px;
    line-height: 1.45;
  }

  .typing {
    font-size: 13px;
    color: #c8ccda;
  }

  .composer {
    border-top: 1px solid #1e232b;
    padding: 12px;
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 10px;
  }

  .input {
    width: 100%;
    resize: none;
    border-radius: 12px;
    border: 1px solid #1e232b;
    background: #0f1319;
    color: #e8e8ea;
    padding: 10px 12px;
    outline: none;
    font-size: 14px;
    line-height: 1.4;
  }

  .send {
    border-radius: 12px;
    border: 1px solid #1e232b;
    background: #1b2332;
    color: #e8e8ea;
    padding: 10px 14px;
    font-weight: 600;
    cursor: pointer;
  }

  .send:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
