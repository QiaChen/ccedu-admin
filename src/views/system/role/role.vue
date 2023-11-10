<template>
  <div>
    <div class="n-layout-page-header">
      <n-card :bordered="false" title="角色权限管理"> 添加或者删除角色 </n-card>
    </div>
    <n-card :bordered="false" class="mt-4 proCard">
      <BasicTable
        :columns="columns"
        :request="loadDataTable"
        :row-key="(row) => row.rid"
        ref="actionRef"
        :actionColumn="actionColumn"
        @update:checked-row-keys="onCheckedRow"
      >
        <template #tableTitle>
          <n-button type="primary" @click="openDrawer">
            <template #icon>
              <n-icon>
                <PlusOutlined />
              </n-icon>
            </template>
            添加角色
          </n-button>
        </template>

        <template #action>
          <TableAction />
        </template>
      </BasicTable>
    </n-card>

    <n-modal v-model:show="showModal" :show-icon="false" preset="dialog" :title="editRoleTitle">
      <div class="py-3 menu-list">
        <n-tree
          block-line
          checkable
          :virtual-scroll="true"
          :data="treeData"
          label-field="title"
          key-field="nid"
          :expandedKeys="expandedKeys"
          :checked-keys="checkedKeys"
          style="max-height: 950px; overflow: hidden"
          @update:checked-keys="checkedTree"
          @update:expanded-keys="onExpandedKeys"
        />
      </div>
      <template #action>
        <n-space>
          <n-button type="info" ghost icon-placement="left" @click="packHandle">
            全部{{ expandedKeys.length ? '收起' : '展开' }}
          </n-button>

          <n-button type="info" ghost icon-placement="left" @click="checkedAllHandle">
            全部{{ checkedAll ? '取消' : '选择' }}
          </n-button>
          <n-button type="primary" :loading="formBtnLoading" @click="confirmForm">提交</n-button>
        </n-space>
      </template>
    </n-modal>

    <n-drawer v-model:show="showDrawer" :width="400" placement="right">
      <n-drawer-content :title="formParams.rid ? `编辑角色` : '添加角色'" :closable="true">
        <n-form
          :model="formParams"
          :rules="rules"
          ref="formRef"
          label-placement="top"
          size="large"
          :label-width="100"
        >
          <n-form-item label="角色名称" path="name">
            <n-input placeholder="角色名称" v-model:value="formParams.name" />
          </n-form-item>

          <n-form-item label="角色描述" path="description">
            <n-input placeholder="请输入角色描述" v-model:value="formParams.description" />
          </n-form-item>
        </n-form>

        <template #footer>
          <n-space>
            <n-button type="primary" :loading="onCreating" @click="createRole">提交</n-button>
            <n-button @click="handleReset">重置</n-button>
          </n-space>
        </template>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref, unref, h, onMounted } from 'vue';
import { useDialog, useMessage } from 'naive-ui';
import { BasicTable, TableAction } from '@/components/Table';
import { getRoleList } from '@/api/system/role';
import { getMenuList } from '@/api/system/menu';
import { columns } from './columns';
import { PlusOutlined } from '@vicons/antd';
import { getTreeAll } from '@/utils';
import { useRouter } from 'vue-router';
import { http } from '@/utils/http/axios';
const router = useRouter();
const message = useMessage();
const dialog = useDialog();
const actionRef = ref();
const formRef = ref();
const editRoleId = ref(0);
const showModal = ref(false);
const showDrawer = ref(false);
const formBtnLoading = ref(false);
const checkedAll = ref(false);
const editRoleTitle = ref('');
const treeData = ref([]);
const expandedKeys = ref([]);
const checkedKeys = ref([]);
const onCreating = ref(false);
const params = reactive({
  pageSize: 5,
  name: 'xiaoMa',
});

const rules = ref({
  name: {
    required: true,
    message: '请输入角色名称',
    trigger: 'blur',
  },
});

const formParams = ref({});
const formParamsHis = ref({});

const actionColumn = reactive({
  width: 250,
  title: '操作',
  key: 'action',
  fixed: 'right',
  render(record) {
    return h(TableAction, {
      style: 'button',
      actions: [
        {
          label: '菜单权限',
          onClick: handleMenuAuth.bind(null, record),
          // 根据业务控制是否显示 isShow 和 auth 是并且关系
          ifShow: () => {
            if (record.rid == 0) return false;
            return true;
          },
        },
        {
          label: '编辑',
          onClick: handleEdit.bind(null, record),
          ifShow: () => {
            if (record.rid == 0) return false;
            return true;
          },
        },
        {
          label: '删除',
          onClick: handleDelete.bind(null, record),
          // 根据业务控制是否显示 isShow 和 auth 是并且关系
          ifShow: () => {
            if (record.rid == 0) return false;
            return true;
          },
        },
      ],
    });
  },
});

const loadDataTable = async (res: any) => {
  return await http.request({
    url: 'admin/role/list',
    method: 'GET',
  });
};

function onCheckedRow(rowKeys: any[]) {
  console.log(rowKeys);
}

function reloadTable() {
  actionRef.value.reload();
}

function openDrawer() {
  formParams.value = {};
  formParamsHis.value = {};
  showDrawer.value = true;
}

function createRole() {
  formRef.value.validate((errors) => {
    if (!errors) {
      let url = 'rid' in formParams.value ? 'admin/role/update' : (onCreating.value = true);
      http
        .request({ url: url, method: 'post', params: formParams.value })
        .then((res) => {
          reloadTable();
          onCreating.value = false;
          showDrawer.value = false;
          message.success('操作成功');
        })
        .catch((err) => {
          onCreating.value = false;
        });
    } else {
      message.error('请填写完整信息');
    }
  });
}

function handleReset() {
  Object.assign(formParams.value, formParamsHis.value);
}

function confirmForm(e: any) {
  console.log(checkedKeys.value);
  e.preventDefault();
  formBtnLoading.value = true;
  http
    .request({
      url: 'admin/role/updateNodes',
      method: 'post',
      params: { rid: editRoleId.value, nodes: checkedKeys.value.join(',') },
    })
    .then((res) => {
      reloadTable();
      formBtnLoading.value = false;
      message.success('操作成功');
    })
    .catch((err) => {
      formBtnLoading.value = false;
    });
}

function handleEdit(record: Recordable) {
  formParams.value = {
    rid: record.rid,
    name: record.name,
    description: record.name,
  };
  formParamsHis.value = {
    rid: record.rid,
    name: record.name,
    description: record.name,
  };
  showDrawer.value = true;
}

function handleDelete(record: Recordable) {
  dialog.info({
    title: '提示',
    content: `您确定想删除此角色吗?`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: () => {
      http
        .request({ url: 'admin/role/delete', method: 'get', params: { rid: record.rid } })
        .then((res) => {
          reloadTable();
          message.success('删除成功');
        });
    },
    onNegativeClick: () => {},
  });
}

function handleMenuAuth(record: Recordable) {
  editRoleTitle.value = `分配 ${record.name} 的菜单权限`;
  editRoleId.value = record.rid;
  checkedKeys.value = record.nodes.split(',').map(function (str) {
    return parseInt(str);
  });
  showModal.value = true;
}

function checkedTree(keys) {
  checkedKeys.value = keys;
}

function onExpandedKeys(keys) {
  expandedKeys.value = keys;
}

function packHandle() {
  if (expandedKeys.value.length) {
    expandedKeys.value = [];
  } else {
    expandedKeys.value = treeData.value.map((item: any) => item.nid) as [];
  }
}

function checkedAllHandle() {
  if (!checkedAll.value) {
    checkedKeys.value = getTreeAll(treeData.value, 'nid');
    checkedAll.value = true;
  } else {
    checkedKeys.value = [];
    checkedAll.value = false;
  }
}

onMounted(async () => {
  const treeMenuList = await http.request({ url: 'admin/node/list', method: 'get' });
  //const treeMenuList = {list:[]};
  expandedKeys.value = treeMenuList.map((item) => item.nid);
  treeData.value = treeMenuList;
});
</script>

<style lang="less" scoped></style>
