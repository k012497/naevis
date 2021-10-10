<script lang="ts">
  import { onMount, onDestroy } from 'svelte';

  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  let universeSurface: HTMLDivElement;
  export let goToContactSection;
  export let goToProjectSection;

  const onMouseMove = (e: MouseEvent) => {
    if(universeSurface) {
      const moveX = (screenWidth / 2 - e.clientX);
      const moveY = (screenHeight / 2 - e.clientY);

      const degX = moveY / 30;
      const degY = moveX / 30;
      
      universeSurface.style.transform = `rotateX(${degX}deg) rotateY(${degY}deg)`;
    }
  };

  function bindEvents() {
    document.addEventListener('mousemove', onMouseMove);
  }

  function unbindEvents() {
    document.removeEventListener('mousemove', onMouseMove);
  }

  onMount(async () => {
    universeSurface = document.querySelector('.universe-surface') as HTMLDivElement;
  
    bindEvents();
  });

  onDestroy(async () => {
    unbindEvents();
  })
</script>

<section>
  <div class="universe-container">
    <div class="universe-surface">
      <a href="https://www.github.com/k012497" target="blank">
        <figure class="floating-object title">
          <div>WWW</div>
        </figure>
      </a>
      <figure class="floating-object person" on:click={goToContactSection}>
        <span>contact</span>
        <img src="./assets/person.png" alt="person">
      </figure>
      <figure class="floating-object star" on:click={() => {console.log('star')}}>
        <img src="./assets/star.png" alt="star">
      </figure>
      <figure class="floating-object plant" on:click={() => {console.log('plant')}}>
        <img src="./assets/plant.png" alt="plant">
      </figure>
      <figure class="floating-object computer" on:click={goToProjectSection}>
        <img src="./assets/computer.png" alt="computer">
          <span>project</span>
      </figure>
    </div>
  </div>
</section>

<style lang="scss">
  .universe-container {
    position: fixed;
    width: 100%;
    height: 100%;
    perspective: 1000px;
    display: flex;
    align-items: center;
    justify-content: center;

    @keyframes bubble-anim {
      0% {
        -webkit-transform: scale(1);
        transform: scale(1); }

      20% {
        -webkit-transform: scaleY(0.95) scaleX(1.05);
        transform: scaleY(0.95) scaleX(1.05); }

      48% {
        -webkit-transform: scaleY(1.1) scaleX(0.9);
        transform: scaleY(1.1) scaleX(0.9); }

      68% {
        -webkit-transform: scaleY(0.98) scaleX(1.02);
        transform: scaleY(0.98) scaleX(1.02); }

      80% {
        -webkit-transform: scaleY(1.02) scaleX(0.98);
        transform: scaleY(1.02) scaleX(0.98); }

      97%, 100% {
        -webkit-transform: scale(1);
        transform: scale(1); 
      }
    }

    .universe-surface {
      width: 90vmin;
      height: 90vmin;
      transform-style: preserve-3d;
      border-radius: 50%;

      .floating-object {
        position: absolute;
        width: 40%;
        transition: transform .8s ease-in-out;
        transform: translateZ(100px);
          text-shadow: 0 1px 0 #ccc,
            0 2px 0 #c9c9c9,
            0 3px 0 #bbb,
            0 4px 0 #b9b9b9,
            0 5px 0 #aaa,
            0 6px 1px rgba(0,0,0,.1),
            0 0 5px rgba(0,0,0,.1),
            0 1px 3px rgba(0,0,0,.3),
            0 3px 5px rgba(0,0,0,.2),
            0 5px 10px rgba(0,0,0,.25),
            0 10px 10px rgba(0,0,0,.2),
            0 20px 20px rgba(0,0,0,.15);
        
        &:hover {
          animation: unset;
          transform: translateZ(150px);
          /* animation: bubble-anim 1.5s ease-in-out infinite alternate; */

          img {
            filter: drop-shadow(0 0 1rem #a7a689);
            -webkit-filter: drop-shadow(0 0 1rem #a7a689);
          }
          
          span {
            display: block;
          }
        }
  
        img {
          max-width: 100%;
        }

        span {
          position: absolute;
          display: none;
          top: 40%;
          z-index: 2;
          color: $white;
          font-size: 5rem;
          font-weight: bold;
          text-align: center;
        }

        &.title {
          top: 35%;
          left: 45%;
          font-size: 8rem;
          font-family: serif;
          font-weight: 900;
          color: $white;

            &:hover {
              visibility: hidden;
  
              &::after {
                content:'github'; 
                visibility: visible;
                display: block;
                position: absolute;
                font-size: 6rem;
                background-color: red;
                font-family: 'Roboto Slab', serif;
                border-radius: 1rem;
                padding: 0.5rem 1.5rem 1.5rem 1.5rem;
                top: 2px;
                box-shadow: inset -5px -12px 0.5rem rgba(48, 48, 48, 0.445);
              }
            }
          }


        &.star {
          width: 20%;
          top: 20%;
          right: 10%;
        }
  
        &.person {
          animation-delay: 400ms;
          width: 35%;
          top: 30%;
          left: 5%;
        }

        &.plant {
          animation-delay: 400ms;
          bottom: 5%;
          right: -10%;
        }

          
        &.computer {
          animation-direction: alternate-reverse;
          animation-delay: 200ms;
          width: 35%;
          top: 5%;
          right: 15%;
        }
      }
    }
  }
</style>