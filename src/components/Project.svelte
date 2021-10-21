<script lang="ts">
  import ProjectItem from "./ProjectItem.svelte";
</script>

<div class="project-container">
  <div class="project-title">⬇ touch me! ⬇ </div>
  <ProjectItem 
    title="웹 LMS 플랫폼" 
    desc="Codi AI, ALL THAT CODING"
    tags={["react", "ts", "nextjs", "graphql", "apollo"]}
    images={['codiai1.png', 'codiai2.png', 'codiai3.png', 'allthatcoding.png']}
  />
  <ProjectItem 
    title="Blockly 기반 블록 코딩 플랫폼" 
    desc="Code Sketch 코딩 화면(scratch), Block+ 코딩 화면 (scratch), 엔트리 커스텀 (?)" 
    tags={["react", "ts", "redux", "graphql", "apollo" ]}
    images={['blockplus.png', 'codesketch1.png', 'codesketch2.png']}
  />
  <!-- <ProjectItem 
    title="디자인 시스템" 
    desc="React+" 
    tags={["react", "ts", "nextjs",]}
    images={['blockplus', 'allthatcoding', 'codiai1', 'codiai2', 'codiai3']}
  /> -->
  <ProjectItem 
    title="블록 코딩 응용 프로그램" 
    desc="MODI studio 유지보수 및 모듈 통신을 통한 모듈 진단" 
    tags={["electronjs", "cordova"]}
    images={['modistudio1.gif', 'modistudio2.png', 'modistudio3.png', 'modistudio4.png']}
  />
</div>

<style lang="scss">
  .project-container {
    position: absolute;
    height: 90%;
    top: 4rem;
    overflow-y: auto;
    scroll-behavior: smooth;
    color: $white;
    display: flex;
    flex-direction: column;
    justify-content: center;

    > .project-title {
      text-align: center;
      margin: 1rem;
    }
  }
</style>