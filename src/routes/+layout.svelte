<script>
  import Navigation  from "$lib/components/Nav.svelte";

  import 'bootstrap/dist/css/bootstrap.min.css';

  if (typeof window !== 'undefined') {
    import('bootstrap/dist/js/bootstrap.min.js');
  }
</script>

<!---->
<Navigation />
<slot/>
<!---->



