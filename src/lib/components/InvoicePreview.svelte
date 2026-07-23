<script>
  import VanillaTemplate from '../templates/VanillaTemplate.svelte';
  import { onMount } from 'svelte';

  export let invoice;
  export let settings;

  let containerEl;
  let scale = 1;

  // A4 at 96 dpi: 210mm = 793.7px, 297mm = 1122.5px
  const A4_W = 794;
  const A4_H = 1123;

  function computeScale() {
    if (!containerEl) return;
    const available = containerEl.clientWidth - 16; // 8px padding each side
    scale = available < A4_W ? available / A4_W : 1;
  }

  onMount(() => {
    computeScale();
    const ro = new ResizeObserver(computeScale);
    ro.observe(containerEl);
    return () => ro.disconnect();
  });
</script>

<div class="preview-outer" bind:this={containerEl}>
  <!--
    The wrapper div is sized to the SCALED dimensions so it takes up
    the correct space in layout (no blank gap, no overflow).
    The scaler inside uses transform-origin: top left and is positioned
    absolute within the wrapper — fitting exactly.
  -->
  <div
    class="preview-scale-wrapper"
    style="width: {A4_W * scale}px; height: {A4_H * scale}px;"
  >
    <div
      class="preview-scaler"
      style="transform: scale({scale}); transform-origin: top left; width: {A4_W}px;"
    >
      <VanillaTemplate {invoice} {settings} />
    </div>
  </div>
</div>

<style>
  .preview-outer {
    width: 100%;
    display: flex;
    justify-content: center;
  }

  /* The wrapper clips to the scaled size so layout is correct */
  .preview-scale-wrapper {
    position: relative;
    overflow: visible;
    flex-shrink: 0;
  }

  /* Scaler sits at top-left of wrapper, scales from that corner */
  .preview-scaler {
    position: absolute;
    top: 0;
    left: 0;
  }

  @media (min-width: 769px) {
    /* Desktop: no scaling, normal flow */
    .preview-outer {
      display: block;
    }

    .preview-scale-wrapper {
      width: 100% !important;
      height: auto !important;
      max-width: 850px;
      margin: 0 auto;
      position: static;
    }

    .preview-scaler {
      position: static;
      transform: none !important;
      width: 100% !important;
    }
  }
</style>
