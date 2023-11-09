import { h } from 'vue';
import { NTag } from 'naive-ui';

export const columns = [
  {
    title: 'rid',
    key: 'rid',
  },
  {
    title: '角色名称',
    key: 'name',
  },
  {
    title: '说明',
    key: 'description',
  },
  {
    title: '是否默认角色',
    key: 'isDefault',
    render(row) {
      return h(
        NTag,
        {
          type: row.rid == 0 ? 'success' : 'error',
        },
        {
          default: () => (row.rid == 0 ? '是' : '否'),
        }
      );
    },
  },
  {
    title: '创建时间',
    key: 'created_at',
  },
];
