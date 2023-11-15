<template>
  <div>
     <n-card :title="route.meta.title">
        <template #header>
            <n-space>
                <n-button 
            v-for="item in parentRoute.children" 
            :key="item.name" @click="clickNav(item)" 
            :type="route.name === item.name?'info':'default'"  
            :quaternary="route.name === item.name?false:true"  
            :secondary="route.name === item.name?true:false" > {{ item.meta.title }}</n-button>
            </n-space>
        </template>
            <MainView />
    </n-card>
  </div>
</template>
<script lang="ts" setup>
  import { ref } from 'vue';
  import { useRoute, useRouter} from 'vue-router';
  import { MainView } from '@/layout/components/Main';
  const thisRoute = ref({});
  const route = useRoute();
  const router = useRouter();
  const parentRoute = route.matched[route.matched.length-2];

  function clickNav(r){
    thisRoute.value = r;
    router.push(r.path);
  }
</script>
<style lang="less" scoped>
  .nav_card_content {
    padding-top:20px;

  }
</style>
