<template>
  <div>
    <n-grid class="mt-4" cols="1 s:1 m:1 l:3 xl:3 2xl:3" responsive="screen" :x-gap="12">
      <n-gi span="1">
        <n-card :segmented="{ content: true }" :bordered="false" size="small">
          <template #header>
            <n-space>
              <n-dropdown trigger="hover" @select="selectAddMenu" :options="addMenuOptions">
                <n-button type="info" ghost icon-placement="right">
                  添加菜单
                  <template #icon>
                    <div class="flex items-center">
                      <n-icon size="14">
                        <DownOutlined />
                      </n-icon>
                    </div>
                  </template>
                </n-button>
              </n-dropdown>
              <n-button type="info" ghost icon-placement="left" @click="packHandle">
                全部{{ expandedKeys.length ? '收起' : '展开' }}
                <template #icon>
                  <div class="flex items-center">
                    <n-icon size="14">
                      <AlignLeftOutlined />
                    </n-icon>
                  </div>
                </template>
              </n-button>
            </n-space>
          </template>
          <div class="w-full menu">
            <n-input type="input" v-model:value="pattern" placeholder="输入菜单名称搜索">
              <template #suffix>
                <n-icon size="18" class="cursor-pointer">
                  <SearchOutlined />
                </n-icon>
              </template>
            </n-input>
            <div class="py-3 menu-list">
              <template v-if="loading">
                <div class="flex items-center justify-center py-4">
                  <n-spin size="medium" />
                </div>
              </template>
              <template v-else>
                <n-tree
                  block-line
                  cascade
                  :virtual-scroll="true"
                  :pattern="pattern"
                  :data="treeData"
                  label-field="title"
                  key-field="nid"
                  :expandedKeys="expandedKeys"
                  style="max-height: 650px; overflow: hidden"
                  @update:selected-keys="selectedTree"
                  @update:expanded-keys="onExpandedKeys"
                />
              </template>
            </div>
          </div>
        </n-card>
      </n-gi>
      <n-gi span="2">
        <n-card :segmented="{ content: true }" :bordered="false" size="small">
          <template #header>
            <n-space>
              <n-icon size="18">
                <FormOutlined />
              </n-icon>
              <span>编辑菜单{{ treeItemTitle ? `：${treeItemTitle}` : '' }}</span>
            </n-space>
          </template>
          <n-alert v-if="!isEditMenu" type="info" closable> 从菜单列表选择一项后，进行编辑</n-alert>
          <n-form
            :model="formParams"
            :rules="rules"
            ref="formRef"
            label-placement="left"
            :label-width="100"
            v-if="isEditMenu"
            class="py-4"
          >
            
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

            <n-form-item path="auth" style="margin-left: 100px">
              <n-space>
                <n-button type="primary" :loading="subLoading" @click="formSubmit"
                  >保存修改</n-button
                >
                <n-button @click="handleReset">重置</n-button>
                <n-button @click="handleDel">删除</n-button>
              </n-space>
            </n-form-item>
          </n-form>
        </n-card>
      </n-gi>
    </n-grid>
    <CreateDrawer @after-add="getMenus" ref="createDrawerRef" :title="drawerTitle" :parentid="formParams.nid" />
  </div>
</template>
<script lang="ts" setup>
  import { ref, unref, reactive, onMounted, computed } from 'vue';
  import { useDialog, useMessage } from 'naive-ui';
  import { DownOutlined, AlignLeftOutlined, SearchOutlined, FormOutlined } from '@vicons/antd';
  import { getMenuList } from '@/api/system/menu';
  import { getTreeItem } from '@/utils';
  import { http } from '@/utils/http/axios';
  import CreateDrawer from './CreateDrawer.vue';

  const rules = {
    label: {
      required: true,
      message: '请输入标题',
      trigger: 'blur',
    },
    path: {
      required: true,
      message: '请输入路径',
      trigger: 'blur',
    },
  };

  const formRef: any = ref(null);
  const createDrawerRef = ref();
  const message = useMessage();
  const dialog = useDialog();

  let treeItemKey = ref([]);

  let expandedKeys = ref([]);

  const treeData = ref([]);

  const loading = ref(true);
  const subLoading = ref(false);
  const isEditMenu = ref(false);
  const treeItemTitle = ref('');
  const pattern = ref('');
  const drawerTitle = ref('');
  const treeMenuList =  ref([]);
  const isAddSon = computed(() => {
    return !treeItemKey.value.length;
  });

  const addMenuOptions = ref([
    {
      label: '添加顶级菜单',
      key: 'home',
      disabled: false,
    },
    {
      label: '添加子菜单',
      key: 'son',
      disabled: isAddSon,
    },
  ]);

  const formParams = reactive({
    title: '',
    description: '',
    controller: '',
    action: '',
    icon: '',
    route: '',
    component:'',
    is_menu:0,
  });

  function selectAddMenu(key: string) {
    drawerTitle.value = key === 'home' ? '添加顶栏菜单' : `添加子菜单：${treeItemTitle.value}`;
    openCreateDrawer();
  }

  function openCreateDrawer() {
    const { openDrawer } = createDrawerRef.value;
    openDrawer();
  }

  function selectedTree(keys) {
    if (keys.length) {
      const treeItem = getTreeItem(unref(treeData), keys[0], 'nid');
      treeItemKey.value = keys;
      treeItemTitle.value = treeItem.title;
      Object.assign(formParams, treeItem);
      isEditMenu.value = true;
    } else {
      isEditMenu.value = false;
      treeItemKey.value = [];
      treeItemTitle.value = '';
    }
  }

  function handleDel() {
    dialog.info({
      title: '提示',
      content: `您确定想删除此权限吗?`,
      positiveText: '确定',
      negativeText: '取消',
      onPositiveClick: () => {
         http.request({url: 'admin/node/delete', method: 'get', params: {nid:formParams.nid}}).then(res => {
            getMenus();
            message.success('删除成功');
         })
        

      },
      onNegativeClick: () => {
        message.error('已取消');
      },
    });
  }

  function handleReset() {
    const treeItem = getTreeItem(unref(treeData), treeItemKey.value[0]);
    Object.assign(formParams, treeItem);
  }

  function formSubmit() {
    formRef.value.validate((errors: boolean) => {
      if (!errors) {
          http.request({url: 'admin/node/update', method: 'post', params: {
          nid: formParams.nid,
          title: formParams.title,
          description: formParams.description,
          controller: formParams.controller,
          action: formParams.action,
          icon: formParams.icon,
          route: formParams.route,
          component: formParams.component,
          is_menu:formParams.is_menu,
        }}).then(res => {
          getMenus();
          message.success('修改成功');
        });
      } else {
        message.error('请填写完整信息');
      }
    });
  }

  function packHandle() {
    if (expandedKeys.value.length) {
      expandedKeys.value = [];
    } else {
      expandedKeys.value = unref(treeData).map((item: any) => item.nid as string) as [];
    }
  }

  function getMenus(){
     http.request({url: 'admin/node/list', method: 'get'}).then(res => {
        treeMenuList.value = res;
        const keys =  treeMenuList.value.map((item) => item.nid);
        Object.assign(formParams, keys.value);
        treeData.value = treeMenuList.value;
        loading.value = false;
     });
  }

  onMounted(async () => {
    getMenus();
  });

  function onExpandedKeys(keys) {
    expandedKeys.value = keys;
  }
</script>
