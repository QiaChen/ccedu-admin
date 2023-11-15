<template>
  <n-grid cols="2 s:2 m:2 l:3 xl:3 2xl:3" responsive="screen">
    <n-grid-item>
      <n-form :label-width="80" :model="formValue" :rules="rules" ref="formRef">
        <n-form-item label="网站名称" path="name">
          <n-input v-model:value="formValue.site_name" placeholder="请输入网站名称" />
        </n-form-item>

        <div>
          <n-space>
            <n-button type="primary" :loading="loading" @click="formSubmit">更新基本信息</n-button>
          </n-space>
        </div>
      </n-form>
    </n-grid-item>
  </n-grid>
</template>

<script lang="ts">
import { defineComponent, reactive, ref, toRefs, onMounted } from 'vue';
import { useMessage } from 'naive-ui';
import { http } from '@/utils/http/axios';

const rules = {
  site_name: {
    required: true,
    message: '请输入网站名称',
    trigger: 'blur',
  },
};

export default defineComponent({
  setup() {
    const formRef: any = ref(null);
    const message = useMessage();
    const loading = ref(false);
    const state = reactive({
      formValue: {
        site_name: '',
      },
    });
    function formSubmit() {
      formRef.value.validate((errors) => {
        if (!errors) {
          loading.value = true;
          http
            .request({
              url: 'admin/config/update',
              method: 'post',
              params: state.formValue,
            })
            .then(() => {
              getConfigs();
              message.success('操作成功');
              loading.value = false;
            })
            .catch(() => {
              loading.value = false;
            });
        } else {
          message.error('验证失败，请填写完整信息');
        }
      });
    }

    function getConfigs(){
      http.request({url: 'admin/config/list',method: 'get'}).then((res)=>{
        state.formValue = res;
      })
    }

    onMounted(() => { getConfigs()})

    return {
      formRef,
      ...toRefs(state),
      rules,
      formSubmit,
      loading
    };
  },
});
</script>
