<script lang="ts">
  import ProjectItem from "./ProjectItem.svelte";
</script>

<div class="project-container">
  <ProjectItem 
    title="웹 LMS 플랫폼" 
    desc="Codi AI, ALL THAT CODING"
    tags={["react", "ts", "nextjs", "graphql", "apollo"]}
    images={['codiai1', 'codiai2', 'codiai3', 'allthatcoding']}
  />
  <ProjectItem 
    title="Blockly 기반 블록 코딩 플랫폼" 
    desc="Code Sketch 코딩 화면(scratch), Block+ 코딩 화면 (scratch), 엔트리 커스텀 (?)" 
    tags={["react", "ts", "redux", "graphql", "apollo" ]}
    images={['blockplus', 'codesketch1', 'codesketch2']}
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
    images={[]}
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
  }
</style>