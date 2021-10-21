<script lang="ts">
  import ProjectItem from "./ProjectItem.svelte";
</script>

<div class="project-container">
  <div class="project-title">⬇ touch me! ⬇</div>
  <ProjectItem 
    title="웹 LMS 플랫폼" 
    desc="학급 관리, 온라인 강의 등 학습 관리 시스템을 위한 웹 사이트 개발"
    tags={["react", "ts", "nextjs", "graphql", "apollo"]}
    images={['codiai1.png', 'codiai2.png', 'codiai3.png', 'allthatcoding.png']}
  />
  <ProjectItem 
    title="Blockly 기반 블록 코딩 플랫폼" 
    desc="Blockly를 기반으로 한 스크래치, 엔트리 등의 블록 코딩 교육을 위한 웹 사이트 개발" 
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
    desc="일렉트론 기반의 자체 블록 코딩 툴 MODI studio 유지보수 및 모듈 통신을 통한 자가진단 기능 개발" 
    tags={["electronjs", "cordova"]}
    images={['modistudio1.gif', 'modistudio2.png', 'modistudio3.png', 'modistudio4.png']}
  />
</div>

<style lang="scss">
  .project-container {
    position: absolute;
    min-height: 90%;
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