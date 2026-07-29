<script>
  import { useRegisterSW } from 'virtual:pwa-register/svelte';

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegistered(r) {
      console.log('SW Registered:', r);
    },
    onRegisterError(error) {
      console.error('SW Registration error:', error);
    }
  });

  function close() {
    needRefresh.set(false);
  }
</script>

{#if $needRefresh}
  <div class="pwa-toast" role="alert" aria-live="polite">
    <div class="message">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
        <path d="M3 3v5h5"/>
        <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
        <path d="M16 16h5v5"/>
      </svg>
      <span>New update available!</span>
    </div>
    <div class="actions">
      <button class="reload-btn" on:click={() => updateServiceWorker(true)}>
        Reload
      </button>
      <button class="close-btn" on:click={close}>
        Dismiss
      </button>
    </div>
  </div>
{/if}

<style>
  .pwa-toast {
    position: fixed;
    right: 20px;
    bottom: 20px;
    margin: 16px;
    padding: 12px 18px;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 12px;
    z-index: 9999;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(12px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
    color: #f8fafc;
    display: flex;
    align-items: center;
    gap: 16px;
    font-family: inherit;
    font-size: 14px;
  }

  .message {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #818cf8;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .reload-btn {
    background: #4f46e5;
    color: #ffffff;
    border: none;
    padding: 6px 14px;
    border-radius: 6px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
  }

  .reload-btn:hover {
    background: #4338ca;
  }

  .close-btn {
    background: transparent;
    color: #94a3b8;
    border: 1px solid rgba(255, 255, 255, 0.1);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
  }

  .close-btn:hover {
    color: #f1f5f9;
  }
</style>
