<script lang="ts">

</script>


<div class="contact">
  <div class="floating-object">
    <a href="mailto: kim.sojin.dev@gmail.com">
      <img class="hand" src="./assets/3d-hand.png" alt="3d-hand" />
      <img class="envelope" src="./assets/letter-envelope.png" alt="letter-envelope" />
    </a>
  </div>
</div>

<style lang="scss">
  .contact {
    img {
      display: inline-block;
      width: 200px;
      height: 200px;
      
      &.hand {
        position: absolute;
        transform: translateX(10px) translateY(-115px) rotate(-128deg);
        z-index: 1;
      }
    }

    .email {
      color: $white;
    }

    svg {
      position: absolute;
      left: 0;
      
      text {
            font-size: 76px;
            font-family: Copperplate, Copperplate Gothic, serif;
            font-weight: bold;
            font-variant: small-caps;
            font-variant-ligatures: none;
            stroke: black;
            stroke-width: 1.5px;
            fill: white;
        }
    }         
  }
  
</style>