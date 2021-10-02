<header>
    <nav>
      <ul>
        <li>
          <a href="/naevis">home</a>
        </li>
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

    > .title {
      font-size: 90px;
      font-family: 'Limelight', cursive;
      -webkit-text-stroke: 2px #56a072;
      font-style: italic;
    }

    > nav {
      width: 100%;

      > ul {
        width: 100%;
        list-style: none;
        text-align: center;
        font-size: 26px;
        font-family: 'Limelight', cursive;

        > li {
          display: inline-block;
          color: transparent;
          -webkit-text-stroke: 1px #fff9c6;
          margin-right: 15px;
          color: navy;
        }
      }
    }
  }
</style>