<script>
  import VanillaTemplate from '../templates/VanillaTemplate.svelte';

  export let invoice;
  export let settings;
</script>

<div class="preview-wrapper">
  <VanillaTemplate {invoice} {settings} />
</div>

<style>
  .preview-wrapper {
    width: 100%;
    max-width: 850px;
    margin: 0 auto;
  }
</style>
