<script lang="ts">
  export let goToHomeSection;
</script>

<header>
    <nav>
      <ul>
        <li on:click={goToHomeSection}>🏠</li>
      </ul>
    </nav>
</header>

<style lang="scss">
  header {
    position: fixed;
    width: 100%;
    min-height: 100px;
    padding: 2rem;
    z-index: 9999;

    > nav {
      width: 100%;

      > ul {
        width: 100%;
        list-style: none;
        text-align: center;
        font-size: 26px;

        > li {
          display: inline-block;
          color: transparent;
          -webkit-text-stroke: 1px #fff9c6;
          margin-right: 15px;
          cursor: pointer;
        }
      }
    }
  }
</style>