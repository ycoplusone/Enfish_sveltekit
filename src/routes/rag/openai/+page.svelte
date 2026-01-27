<script>
  import { onMount, tick, onDestroy } from 'svelte';
  import fastapi from "$lib/api.js";

  let input = '';
  let listEl;
  let isLoading = false;

  // ✅ 소요시간 상태
  let startedAt = 0;
  let elapsedMs = 0;
  let timerId = null;

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
        id: crypto.randomUUID() ,
        role ,
        content: String(content ?? '') ,
        createdAt: Date.now()
      }
    ];
  }

  async function scrollToBottom() {
    await tick();
    if (listEl) listEl.scrollTop = listEl.scrollHeight;
  }

  function extractAnswer(payload) {
    if (payload == null) return '';
    if (typeof payload === 'string') return payload;

    const keys = ['answer', 'result', 'output', 'message', 'text', 'content'];
    for (const k of keys) {
      if (typeof payload[k] === 'string' && payload[k].trim()) return payload[k];
    }

    try {
      return JSON.stringify(payload, null, 2);
    } catch {
      return String(payload);
    }
  }

  // ✅ ms → 사람이 읽기 좋은 형태
  function formatMs(ms) {
    const sec = Math.floor(ms / 1000);
    const tenth = Math.floor((ms % 1000) / 100);
    const min = Math.floor(sec / 60);
    const s = sec % 60;
    return min > 0 ? `${min}m ${s}.${tenth}s` : `${s}.${tenth}s`;
  }

  function startTimer() {
    startedAt = performance.now();
    elapsedMs = 0;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(() => {
      elapsedMs = performance.now() - startedAt;
    }, 100);
  }

  function stopTimer() {
    if (timerId) clearInterval(timerId);
    timerId = null;
    elapsedMs = performance.now() - startedAt;
  }

  async function send() {
    const q = input.trim();
    if (!q || isLoading) return;

    addMessage('user', q);
    input = '';
    isLoading = true;

    startTimer();
    await tick();           // ✅ 로딩 UI 반영 보장
    await scrollToBottom();

    try {
      await new Promise((resolve, reject) => {
        fastapi('post', '/ai/openai/?query=' + encodeURIComponent(q), {}, (json) => {
          stopTimer();

          addMessage('assistant' , extractAnswer(json)+' ['+formatMs(elapsedMs)+']' );
          //addMessage('assistant', `처리 시간: ${formatMs(elapsedMs)}`);
          console.log( '시간 : ', formatMs(elapsedMs) )

          isLoading = false;
          resolve(json);
        });
      });
    } catch (e) {
      stopTimer();

      const detail = e?.data ? extractAnswer(e.data) : (e?.message || String(e));
      addMessage('assistant', `오류: ${detail}`);
      //addMessage('assistant', `처리 시간(오류): ${formatMs(elapsedMs)}`);

      isLoading = false;
    } finally {
      await scrollToBottom();
    }
  }

  function onKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  onMount(scrollToBottom);
  onDestroy(() => {
    if (timerId) clearInterval(timerId);
  });
</script>

<div class="page">
  <header class="header">
    <div class="title">OpenAI RAG</div>
  </header>

  {#if isLoading}
    <div class="top-progress" aria-hidden="true">
      <div class="top-progress__bar"></div>
    </div>
  {/if}

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
            <!-- ✅ 로딩 중 경과 시간 표시 -->
            <div class="typing">응답 생성 중... {formatMs(elapsedMs)}</div>
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

  /* ✅ 상단 인디터미넌트 프로그레스 바 */
  .top-progress {
    height: 3px;
    background: rgba(255, 255, 255, 0.06);
    overflow: hidden;
    border-bottom: 1px solid #1e232b;
  }

  .top-progress__bar {
    height: 100%;
    width: 35%;
    background: rgba(232, 232, 234, 0.85);
    transform: translateX(-120%);
    animation: top-progress-move 1.05s ease-in-out infinite;
  }

  @keyframes top-progress-move {
    0%   { transform: translateX(-120%); }
    50%  { transform: translateX(60%); }
    100% { transform: translateX(240%); }
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
