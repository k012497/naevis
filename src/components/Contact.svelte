<script lang="ts">

</script>


<div class="contact floating-object">
   <a href="mailto: kim.sojin.dev@gmail.com">
     <img class="hand" src="./assets/3d-hand.png" alt="3d-hand" />
     <img class="envelope" src="./assets/letter-envelope.png" alt="letter-envelope" />
   </a>
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

    .card {
      background-color: blanchedalmond;
      border-radius: 10px;
      width: 500px;
      height: 300px;
    }
  }
</style>