<script lang="ts">
  import Contact from './Contact.svelte';
  import Header from './Header.svelte';
  import Home from './Home.svelte'
  import Project from './Project.svelte';
  import Footer from './Footer.svelte';
  import { onMount, onDestroy } from 'svelte';

  let containerElem: HTMLElement;

  const goToContactSection = () => {
    containerElem.style.transform = 'translateX(100%) rotate(-30deg)';
  }

  const goToProjectSection = () => {
    containerElem.style.transform = 'translateX(-100%) rotate(30deg)';
  }

  const goToHomeSection = () => {
    containerElem.style.transform = 'translateX(0) rotate(0)';
  }

  onMount(async () => {
    containerElem = document.querySelector('.container');
  })
</script>

<Header goToHomeSection={goToHomeSection}/>
<main>
  <div class="container">
    <section class="section project">
      <Project />
    </section>
    <section class="section home">
      <Home 
        goToProjectSection={goToProjectSection}
        goToContactSection={goToContactSection}
      />
    </section>
    <section class="section contact">
      <Contact />
    </section>
  </div>
</main>
<Footer />

<style lang="scss">
	main {
		overflow: hidden;
	}

  .container {
    position: relative;
    transform-origin: top center;
    height: 100%;
    transition-property: transform, left;
    transition-duration: 1s;
    transition-timing-function: ease-in-out;
  }

  .section {
    width: 100vw;
    height: 100vh;
    position: absolute;

    &.project, &.contact {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100%;
    }
    
    &.project {
      top: -40%;
      left: 95%;
      transform-origin: top left;
      transform: rotate(-30deg);
      overflow-y: auto;
    }
  
    &.contact {
      top: -40%;
      left: -95%;
      transform-origin: top right;
      transform: rotate(30deg);
    }
  }
</style>