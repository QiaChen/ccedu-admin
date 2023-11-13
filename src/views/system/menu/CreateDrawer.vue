<template>
  <n-drawer v-model:show="isDrawer" :width="width" :placement="placement">
    <n-drawer-content :title="title" closable>
      <n-form
        :model="formParams"
        :rules="rules"
        ref="formRef"
        label-placement="left"
        :label-width="100"
      >
        <n-form-item label="上级节点" path="is_menu">
          <span>{{ formParams.is_menu === 1 ? '侧边栏菜单+权限节点' : '权限节点' }}</span>
        </n-form-item>

        

        <n-form-item label="标题" path="title">
          <n-input placeholder="请输入标题" v-model:value="formParams.title" />
        </n-form-item>
        <n-form-item label="节点描述" path="description">
          <n-input placeholder="请输入节点描述" v-model:value="formParams.description" />
        </n-form-item>

        <n-form-item label="是否是菜单" path="is_menu">
          <n-radio-group v-model:value="formParams.is_menu" name="is_menu">
            <n-space>
              <n-radio :value="1">是</n-radio>
              <n-radio :value="0">否</n-radio>
            </n-space>
          </n-radio-group>
        </n-form-item>
        <n-form-item label="路径" path="route" v-if="formParams.is_menu == 1">
          <n-input placeholder="菜单请输入route" v-model:value="formParams.route" />
        </n-form-item>

        
        <n-form-item label="菜单图标" path="icon" v-if="formParams.is_menu == 1">
          <n-input placeholder="轻输入菜单图标" v-model:value="formParams.icon" />
        </n-form-item>

        <n-form-item label="component" path="component" v-if="formParams.is_menu == 1">
          <n-input placeholder="component" v-model:value="formParams.component" />
        </n-form-item>



        <n-form-item label="controller" path="controller">
          <n-input placeholder="controller" v-model:value="formParams.controller" />
        </n-form-item>

        <n-form-item label="action" path="action">
          <n-input placeholder="action" v-model:value="formParams.action" />
        </n-form-item>

      </n-form>

      <template #footer>
        <n-space>
          <n-button type="primary" :loading="subLoading" @click="formSubmit">提交</n-button>
          <n-button @click="handleReset">重置</n-button>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>

<script lang="ts">
  import { defineComponent, reactive, ref, toRefs } from 'vue';
  import { useMessage } from 'naive-ui';
  import { http } from '@/utils/http/axios';
  import {toRaw} from '@vue/reactivity';

  const rules = {
    title: {
      required: true,
      message: '请输入标题',
      trigger: 'blur',
    }
  };
  export default defineComponent({
    name: 'CreateDrawer',
    components: {},
    emits: ['afterAdd'],
    props: {
      title: {
        type: String,
        default: '添加节点',
      },
      width: {
        type: Number,
        default: 450,
      },
      parentid: {
        type: Number,
        default: 0,
      },
    },
    setup(props,ctx) {
     
      const message = useMessage();
      const formRef: any = ref(null);
      const defaultValueRef = () => ({
        parentid:0,
        title: '',
        description: '',
        controller: '',
        action: '',
        icon: '',
        route: '',
        component :'',
        is_menu:0,
      });

      const state = reactive({
        isDrawer: false,
        subLoading: false,
        formParams: defaultValueRef(),
        placement: 'right' as const,
        alertText:
          '等待',
      });

      function openDrawer() {
        state.formParams.parentid = props.parentid;
        state.isDrawer = true;
      }

      function closeDrawer() {
        state.isDrawer = false;
      }

      function formSubmit() {
        formRef.value.validate((errors) => {
          if (!errors) {
            ctx.emit('afterAdd')
            http.request({url: 'admin/node/create', method: 'POST', params:state.formParams});
            message.success('添加成功');
            handleReset();
            closeDrawer();
          } else {
            message.error('请填写完整信息');
          }
        });
      }

      function handleReset() {
        formRef.value.restoreValidation();
        state.formParams = Object.assign(state.formParams, defaultValueRef());
      }

      return {
        ...toRefs(state),
        formRef,
        rules,
        formSubmit,
        handleReset,
        openDrawer,
        closeDrawer,
      };
    },
  });
</script>
