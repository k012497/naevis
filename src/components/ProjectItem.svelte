<script lang="ts">
  export let title: string;
  export let desc: string;
  export let tags: Array<string>;
  export let images: Array<string>;

</script>

<div class="project-item">
  <div class="title">{title}</div>
  <!-- <div class="desc">{desc}</div> -->
  <div class="image">
    {#each images as image}
    <img src={`./assets/projects/${image}`} alt={image}/>
    {/each}
  </div>
  {#each tags as tag}
  <div class="tag">{tag}</div>
  {/each}
</div>

<style lang="scss">
  .project-item {
    width: 60vw;
    min-height: 10rem;
    border: 1px solid $white;
    margin: 1rem;
    padding: 1rem;
    overflow: hidden;
    
    .title {
      font-size: 2rem;
    }
    
    .image {
      max-height: 0;
      overflow-y: auto;
      margin-top: 1rem;
      transition: max-height 0.5s ease-in-out;
      
      img {
        width: 100%;
        height: 100%;
        margin-bottom: 10px;
      }
    }
    
    &:hover .image{
      max-height: 60vh;
      transition: max-height 0.5s ease-in-out;
      padding-bottom: 1rem;

    }

    .tag {
      display: inline-block;
      padding: 0.5rem;
      margin-right: 1rem;
      user-select: none;
    }
  }
</style>