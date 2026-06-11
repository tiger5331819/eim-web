# P2 — APN 优化 实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 扩展 APN 模型与列表（运营商、是否默认、状态、来源），新增"设为默认"操作和按运营商查询 API，提供供 P4 复用的"APN 同步确认 Modal"公共组件。视觉上用彩色 Tag、运营商图标、行高亮区分默认 APN。

**Architecture:** 在现有 `views/system/apn/` 目录内做增量改造，不新建顶级目录。新增公共组件放在 `views/system/apn/components/`。后端接口已就绪（含 2 个新接口 `setDefaultApn` 和 `apnByCarrier`）。所有改动向后兼容 — 现有 APN 数据缺少新字段时显示"--"，不阻断渲染。

**Tech Stack:** Vue 3 + TypeScript + Vben Admin 5 + Ant Design Vue (antdv-next) + Tailwind CSS + Alova + vxe-table

---

## 文件结构

### 新建文件

```
apps/web-antd/src/views/system/apn/components/
└── apn-sync-confirm-modal.vue       # APN 同步确认弹窗（P4 也会复用）
```

### 修改文件

```
apps/web-antd/src/api/system/apn/index.ts        # 新增 2 个 API 函数
apps/web-antd/src/api/system/apn/model.d.ts      # 扩展类型字段
apps/web-antd/src/views/system/apn/data.ts       # 新增搜索字段、列、表单字段
apps/web-antd/src/views/system/apn/index.vue     # 行内"设为默认"操作 + 状态 Switch + 行高亮
apps/web-antd/src/views/system/apn/apn-modal.vue # 表单新增运营商/默认/状态字段
```

### 字典依赖

| code | 用途 |
|---|---|
| `eim_apn_source` | APN 来源（MANUAL/DP_PLUS）— 可选，缺失时直接显示英文 |

---

## Task 1：扩展 API 层

**Files:**
- Modify: `apps/web-antd/src/api/system/apn/model.d.ts`
- Modify: `apps/web-antd/src/api/system/apn/index.ts`

- [ ] **Step 1.1：扩展类型定义**

**完全替换** `apps/web-antd/src/api/system/apn/model.d.ts` 内容为：

```ts
export interface ApnVO {
  id: string | number;
  name: string;
  apn: string;
  local: string;
  providerId?: number;        // 新增：供应商ID
  carrierCode?: string;       // 新增：运营商编码
  carrierName?: string;       // 新增：运营商名称
  isDefault?: '0' | '1';      // 新增：是否默认 APN
  status?: '0' | '1';         // 新增：状态（0 正常 1 停用）
  sourceType?: string;        // 新增：来源（MANUAL/DP_PLUS）
  creationTime: string;
  updateTime?: string;
}

export interface ApnForm {
  id?: string | number;
  name?: string;
  apn?: string;
  local?: string;
  providerId?: number;
  carrierCode?: string;
  carrierName?: string;
  isDefault?: '0' | '1';
  status?: '0' | '1';
  sourceType?: string;
  sourceRef?: string;
}

export interface ApnQuery {
  pageNum?: number;
  pageSize?: number;
  name?: string;
  apn?: string;
  carrierCode?: string;
  isDefault?: string;
  status?: string;
}
```

- [ ] **Step 1.2：新增 2 个 API 函数**

修改 `apps/web-antd/src/api/system/apn/index.ts`，**完全替换**为：

```ts
import type { ApnForm, ApnVO } from './model';
import type { ID, PageQuery, PageResult } from '#/api/common';

import { commonExport } from '#/api/helper';
import { alovaInstance } from '#/utils/http';

enum Api {
  root = '/manager/apn',
  apnList = '/manager/apn/list',
  apnExport = '/manager/apn/export',
  byCarrier = '/manager/apn/by-carrier',
}

export function listApn(params?: PageQuery) {
  return alovaInstance.get<PageResult<ApnVO>>(Api.apnList, { params });
}

export function getApn(id: ID) {
  return alovaInstance.get<ApnVO>(`${Api.root}/${id}`);
}

export function addApn(data: ApnForm) {
  return alovaInstance.postWithMsg<void>(Api.root, data);
}

export function updateApn(data: ApnForm) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${data.id}`, data);
}

export function delApn(id: ID) {
  return alovaInstance.deleteWithMsg<void>(`${Api.root}/${id}`);
}

/** 设置默认 APN（同运营商唯一默认） */
export function setDefaultApn(id: ID) {
  return alovaInstance.patchWithMsg<void>(`${Api.root}/${id}/default`);
}

/** 按运营商编码查询 APN 列表（供下号/启用流程使用） */
export function apnByCarrier(carrierCode: string) {
  return alovaInstance.get<ApnVO[]>(`${Api.byCarrier}/${carrierCode}`);
}

export function apnExport(data: Record<string, any>) {
  return commonExport(Api.apnExport, data);
}
```

- [ ] **Step 1.3：提交**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/api/system/apn/
git commit -m "feat(apn): extend api with setDefault and byCarrier endpoints"
```

---

## Task 2：扩展 data.ts（搜索/列/表单 schema）

**Files:**
- Modify: `apps/web-antd/src/views/system/apn/data.ts`

- [ ] **Step 2.1：完整替换 data.ts**

**完全替换** `apps/web-antd/src/views/system/apn/data.ts` 内容为：

```ts
import type { FormSchemaGetter } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

/** APN 来源映射 — 与后端 sourceType 字段值对齐 */
const SOURCE_TYPE_MAP: Record<string, { color: string; text: string }> = {
  MANUAL:   { color: 'blue',   text: '手动录入' },
  DP_PLUS:  { color: 'purple', text: 'DP+ 同步' },
};

export function getSourceTypeMeta(type?: string) {
  if (!type) return { color: 'default', text: '--' };
  return SOURCE_TYPE_MAP[type] ?? { color: 'default', text: type };
}

export const SOURCE_TYPE_OPTIONS = Object.entries(SOURCE_TYPE_MAP).map(
  ([value, { text }]) => ({ value, label: text }),
);

/** 是否默认 APN 选项 */
export const IS_DEFAULT_OPTIONS = [
  { value: '1', label: '是' },
  { value: '0', label: '否' },
];

/** 状态选项 */
export const STATUS_OPTIONS = [
  { value: '0', label: '正常' },
  { value: '1', label: '停用' },
];

export const querySchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
  },
  {
    component: 'Input',
    fieldName: 'apn',
    label: 'APN',
  },
  {
    component: 'Input',
    fieldName: 'carrierCode',
    label: '运营商编码',
    componentProps: {
      placeholder: '如 CMCC / CUCC / CTCC',
    },
  },
  {
    component: 'Select',
    fieldName: 'isDefault',
    label: '是否默认',
    componentProps: {
      allowClear: true,
      options: IS_DEFAULT_OPTIONS,
      placeholder: '请选择',
    },
  },
  {
    component: 'Select',
    fieldName: 'status',
    label: '状态',
    componentProps: {
      allowClear: true,
      options: STATUS_OPTIONS,
      placeholder: '请选择',
    },
  },
];

export const columns: VxeGridProps['columns'] = [
  { type: 'checkbox', width: 60 },
  { title: 'APN ID', field: 'id', width: 100 },
  { title: '名称', field: 'name', minWidth: 120 },
  { title: 'APN', field: 'apn', minWidth: 120 },
  { title: '适用地区', field: 'local', width: 120 },
  {
    title: '运营商',
    field: 'carrierName',
    width: 140,
    formatter: ({ row }) => {
      const code = row.carrierCode ? `（${row.carrierCode}）` : '';
      return row.carrierName ? `${row.carrierName}${code}` : '--';
    },
  },
  {
    title: '是否默认',
    field: 'isDefault',
    width: 100,
    slots: { default: 'isDefault' },
  },
  {
    title: '状态',
    field: 'status',
    width: 100,
    slots: { default: 'status' },
  },
  {
    title: '来源',
    field: 'sourceType',
    width: 110,
    slots: { default: 'sourceType' },
  },
  { title: '创建时间', field: 'creationTime', width: 170 },
  {
    field: 'action',
    fixed: 'right',
    slots: { default: 'action' },
    title: '操作',
    resizable: false,
    width: 200,
  },
];

export const modalSchema: FormSchemaGetter = () => [
  {
    component: 'Input',
    dependencies: {
      show(values) {
        return !values?.id;
      },
      triggerFields: ['id'],
    },
    fieldName: 'id',
    label: 'APN ID',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'name',
    label: '名称',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'apn',
    label: 'APN',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'local',
    label: '适用地区',
    rules: 'required',
  },
  {
    component: 'Input',
    fieldName: 'carrierCode',
    label: '运营商编码',
    componentProps: {
      placeholder: '如 CMCC / CUCC / CTCC',
    },
  },
  {
    component: 'Input',
    fieldName: 'carrierName',
    label: '运营商名称',
    componentProps: {
      placeholder: '如 中国移动 / 中国联通 / 中国电信',
    },
  },
  {
    component: 'Switch',
    fieldName: 'isDefault',
    label: '设为默认',
    defaultValue: '0',
    componentProps: {
      checkedChildren: '是',
      unCheckedChildren: '否',
      checkedValue: '1',
      unCheckedValue: '0',
    },
    help: '同一运营商只能有一个默认 APN，设置时会自动替换原默认',
  },
  {
    component: 'Switch',
    fieldName: 'status',
    label: '状态',
    defaultValue: '0',
    componentProps: {
      checkedChildren: '正常',
      unCheckedChildren: '停用',
      checkedValue: '0',
      unCheckedValue: '1',
    },
  },
];
```

- [ ] **Step 2.2：暂不提交（与 Task 3 一起提交）**

---

## Task 3：升级 APN 列表页（行内"设为默认" + 彩色 Tag + 行高亮）

**Files:**
- Modify: `apps/web-antd/src/views/system/apn/index.vue`

视觉重点：
- 默认 APN 整行加左侧蓝色 4px 边框 + 浅蓝背景
- 是否默认 / 状态 / 来源 → 彩色 Tag
- 行内新增"设为默认"按钮（仅 `isDefault !== '1'` 时显示）

- [ ] **Step 3.1：完整替换 index.vue**

**完全替换** `apps/web-antd/src/views/system/apn/index.vue` 内容为：

```vue
<script setup lang="ts">
import type { VbenFormProps } from '@vben/common-ui';
import type { VxeGridProps } from '#/adapter/vxe-table';
import type { ApnVO } from '#/api/system/apn/model';

import { Page, useVbenModal } from '@vben/common-ui';

import { Popconfirm, Space, Tag } from 'antdv-next';

import { useVbenVxeGrid, vxeCheckboxChecked } from '#/adapter/vxe-table';
import { apnExport, delApn, listApn, setDefaultApn } from '#/api/system/apn';
import { useBlobExport } from '#/utils/file/export';

import ApnModal from './apn-modal.vue';
import { columns, getSourceTypeMeta, querySchema } from './data';

const formOptions: VbenFormProps = {
  commonConfig: {
    labelWidth: 80,
    componentProps: {
      allowClear: true,
    },
  },
  schema: querySchema(),
  wrapperClass: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
};

const gridOptions: VxeGridProps = {
  checkboxConfig: {
    highlight: true,
    reserve: true,
  },
  columns,
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues = {}) => {
        return await listApn({
          pageNum: page.currentPage,
          pageSize: page.pageSize,
          ...formValues,
        });
      },
    },
  },
  rowConfig: {
    keyField: 'id',
  },
  // 默认 APN 行加高亮 class
  rowClassName: ({ row }) => (row.isDefault === '1' ? 'apn-default-row' : ''),
  id: 'system-apn-index',
};

const [BasicTable, tableApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
});
const [ApnModalComp, modalApi] = useVbenModal({
  connectedComponent: ApnModal,
});

function handleAdd() {
  modalApi.setData({});
  modalApi.open();
}

async function handleEdit(record: ApnVO) {
  modalApi.setData({ id: record.id });
  modalApi.open();
}

async function handleDelete(row: ApnVO) {
  await delApn(row.id);
  await tableApi.query();
}

function handleMultiDelete() {
  const rows = tableApi.grid.getCheckboxRecords();
  const ids = rows.map((row: ApnVO) => row.id);
  window.modal.confirm({
    title: '提示',
    okType: 'danger',
    content: `确认删除选中的${ids.length}条记录吗？`,
    onOk: async () => {
      for (const id of ids) {
        await delApn(id);
      }
      await tableApi.query();
    },
  });
}

async function handleSetDefault(row: ApnVO) {
  const carrier = row.carrierName || row.carrierCode || '当前运营商';
  window.modal.confirm({
    title: '设为默认 APN',
    content: `确认将「${row.name}」设为 ${carrier} 的默认 APN？同运营商下的其他默认 APN 将被自动取消。`,
    onOk: async () => {
      await setDefaultApn(row.id);
      await tableApi.query();
    },
  });
}

const { exportBlob, exportLoading, buildExportFileName } = useBlobExport(apnExport);
async function handleExport() {
  const formValues = await tableApi.formApi.getValues();
  const fileName = buildExportFileName('APN列表');
  exportBlob({ data: formValues, fileName });
}
</script>

<template>
  <Page :auto-content-height="true">
    <BasicTable table-title="APN列表">
      <template #toolbar-tools>
        <Space>
          <a-button
            :loading="exportLoading"
            :disabled="exportLoading"
            @click="handleExport"
          >
            {{ $t('pages.common.export') }}
          </a-button>
          <a-button
            :disabled="!vxeCheckboxChecked(tableApi)"
            danger
            type="primary"
            @click="handleMultiDelete"
          >
            {{ $t('pages.common.delete') }}
          </a-button>
          <a-button type="primary" @click="handleAdd">
            {{ $t('pages.common.add') }}
          </a-button>
        </Space>
      </template>

      <!-- 是否默认 -->
      <template #isDefault="{ row }">
        <Tag v-if="row.isDefault === '1'" color="gold">
          <template #icon>⭐</template>
          默认
        </Tag>
        <span v-else class="text-gray-400">--</span>
      </template>

      <!-- 状态 -->
      <template #status="{ row }">
        <Tag v-if="row.status === '0'" color="green">正常</Tag>
        <Tag v-else-if="row.status === '1'" color="red">停用</Tag>
        <span v-else class="text-gray-400">--</span>
      </template>

      <!-- 来源 -->
      <template #sourceType="{ row }">
        <Tag :color="getSourceTypeMeta(row.sourceType).color">
          {{ getSourceTypeMeta(row.sourceType).text }}
        </Tag>
      </template>

      <!-- 行操作 -->
      <template #action="{ row }">
        <Space>
          <action-button
            v-if="row.isDefault !== '1' && row.carrierCode"
            variant="link"
            color="gold"
            @click.stop="handleSetDefault(row)"
          >
            设为默认
          </action-button>
          <action-button @click.stop="handleEdit(row)">
            {{ $t('pages.common.edit') }}
          </action-button>
          <Popconfirm
            placement="left"
            title="确认删除？"
            @confirm="handleDelete(row)"
          >
            <action-button danger @click.stop="">
              {{ $t('pages.common.delete') }}
            </action-button>
          </Popconfirm>
        </Space>
      </template>
    </BasicTable>
    <ApnModalComp @reload="tableApi.query()" />
  </Page>
</template>

<style scoped>
/* 默认 APN 行高亮：左侧蓝色边框 + 浅蓝背景 */
:deep(.apn-default-row) {
  background: linear-gradient(
    90deg,
    rgba(250, 173, 20, 0.08) 0%,
    transparent 30%
  );
  border-left: 4px solid #faad14;
}
:deep(.apn-default-row td:first-child) {
  border-left: none;
}
</style>
```

- [ ] **Step 3.2：提交 Task 2 + Task 3**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/views/system/apn/data.ts \
        apps/web-antd/src/views/system/apn/index.vue
git commit -m "feat(apn): add carrier/default/status columns and set-default action with row highlight"
```

---

## Task 4：升级 APN 弹窗（运营商 / 默认 / 状态字段）

**Files:**
- Modify: `apps/web-antd/src/views/system/apn/apn-modal.vue`

现有 `apn-modal.vue` 已正确读取 `modalSchema()`，Task 2 已扩展了 schema，因此 modal 自动获得新字段。需要做的：
1. 编辑模式下回填 `getApn` 已包含新字段（API 层 Task 1 已支持）
2. 调宽 Modal 以容纳新字段
3. 视觉调整：编辑时展示"默认 APN"标识

- [ ] **Step 4.1：完整替换 apn-modal.vue**

**完全替换** `apps/web-antd/src/views/system/apn/apn-modal.vue` 内容为：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { Tag } from 'antdv-next';

import { useVbenForm } from '#/adapter/form';
import { addApn, getApn, updateApn } from '#/api/system/apn';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { modalSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const isDefault = ref<'0' | '1' | undefined>(undefined);

const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    labelWidth: 100,
  },
  schema: modalSchema(),
  showDefaultActions: false,
});

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  onOpenChange: async (isOpen) => {
    if (!isOpen) {
      return null;
    }
    modalApi.modalLoading(true);

    const { id } = modalApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const record = await getApn(id);
      isDefault.value = record.isDefault;
      await formApi.setValues(record);
    } else {
      // 新增默认值
      isDefault.value = '0';
      await formApi.setValues({
        isDefault: '0',
        status: '0',
      });
    }
    await markInitialized();

    modalApi.modalLoading(false);
  },
});

async function handleConfirm() {
  try {
    modalApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    await (isUpdate.value ? updateApn(data) : addApn(data));
    resetInitialized();
    emit('reload');
    modalApi.close();
  } catch (error) {
    console.error(error);
  } finally {
    modalApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  isDefault.value = undefined;
  resetInitialized();
}
</script>

<template>
  <BasicModal :title="title" class="w-[620px]">
    <div
      v-if="isUpdate && isDefault === '1'"
      class="mb-3 flex items-center gap-2 rounded bg-amber-50 px-3 py-2 text-xs dark:bg-amber-900/30"
    >
      <Tag color="gold" class="!mr-0">⭐ 默认</Tag>
      <span class="text-amber-700 dark:text-amber-300">
        当前 APN 是该运营商的默认 APN
      </span>
    </div>
    <BasicForm />
  </BasicModal>
</template>
```

- [ ] **Step 4.2：提交**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/views/system/apn/apn-modal.vue
git commit -m "feat(apn): upgrade modal with carrier/default/status fields and default banner"
```

---

## Task 5：APN 同步确认 Modal（公共组件 — P4 也会使用）

**Files:**
- Create: `apps/web-antd/src/views/system/apn/components/apn-sync-confirm-modal.vue`

这是个**通用确认弹窗**，使用方式：
- 由父页面 (如 P4 设备详情) 在切换 / 启用码号成功后调用 `apnSyncConfirmApi.setData({ carrierCode, defaultApnId, defaultApnName }).open()`
- 弹窗内拉取该运营商所有 APN 供选择
- 用户选定 APN + 是否同步开关后，emit `confirm` 事件
- 父页面收到事件后调用相应的"更新 profile APN"接口

- [ ] **Step 5.1：创建公共组件**

创建 `apps/web-antd/src/views/system/apn/components/apn-sync-confirm-modal.vue`：

```vue
<script setup lang="ts">
import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Checkbox, Select, Tag } from 'antdv-next';

import { apnByCarrier } from '#/api/system/apn';
import type { ApnVO } from '#/api/system/apn/model';

interface SyncConfirmData {
  /** 运营商编码（必填，用于拉取 APN 列表） */
  carrierCode: string;
  /** 运营商名称（仅用于展示，可选） */
  carrierName?: string;
  /** 默认 APN ID（可选，用作初始选中值） */
  defaultApnId?: string;
  /** 默认 APN 显示名（可选，用作头部展示） */
  defaultApnName?: string;
  /** 头部业务提示（如 "ICCID xxxxx 已启用"） */
  bizHint?: string;
}

const emit = defineEmits<{
  /** 用户确认：apnId 为选中的 APN ID；sync 表示是否同步下发到设备 */
  confirm: [payload: { apnId: string; sync: boolean }];
}>();

const data = ref<SyncConfirmData | null>(null);
const apnList = ref<ApnVO[]>([]);
const loading = ref(false);
const selectedApnId = ref<string>('');
const syncToDevice = ref<boolean>(true);

const apnOptions = computed(() =>
  apnList.value.map((a) => ({
    label: `${a.name}（${a.apn}）${a.isDefault === '1' ? ' ⭐默认' : ''}`,
    value: String(a.id),
  })),
);

const selectedApn = computed(() =>
  apnList.value.find((a) => String(a.id) === selectedApnId.value),
);

async function loadApnList() {
  if (!data.value?.carrierCode) return;
  loading.value = true;
  try {
    apnList.value = await apnByCarrier(data.value.carrierCode);
    // 默认选中：优先 setData 传入的 defaultApnId，否则取列表中的默认 APN，否则第一个
    if (
      data.value.defaultApnId &&
      apnList.value.some((a) => String(a.id) === String(data.value!.defaultApnId))
    ) {
      selectedApnId.value = String(data.value.defaultApnId);
    } else {
      const defaultOne = apnList.value.find((a) => a.isDefault === '1');
      selectedApnId.value = String(
        defaultOne?.id ?? apnList.value[0]?.id ?? '',
      );
    }
  } catch (error) {
    console.error(error);
    apnList.value = [];
    selectedApnId.value = '';
  } finally {
    loading.value = false;
  }
}

const [BasicModal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm: handleConfirm,
  onClosed: () => {
    apnList.value = [];
    selectedApnId.value = '';
    syncToDevice.value = true;
    data.value = null;
  },
  onOpenChange: async (isOpen) => {
    if (!isOpen) return;
    data.value = modalApi.getData() as SyncConfirmData;
    syncToDevice.value = true;
    await loadApnList();
  },
});

function handleConfirm() {
  if (!selectedApnId.value) {
    window.message.warning('请选择 APN');
    return;
  }
  emit('confirm', {
    apnId: selectedApnId.value,
    sync: syncToDevice.value,
  });
  modalApi.close();
}
</script>

<template>
  <BasicModal title="确认 APN 配置" class="w-[520px]">
    <div class="space-y-4">
      <!-- 业务提示横幅 -->
      <div
        v-if="data?.bizHint"
        class="rounded bg-blue-50 px-3 py-2 text-xs text-blue-600 dark:bg-blue-900/30 dark:text-blue-300"
      >
        {{ data.bizHint }}
      </div>

      <!-- 当前运营商信息 -->
      <div class="rounded border border-gray-200 p-3 dark:border-gray-700">
        <div class="mb-2 flex items-center gap-2 text-sm text-gray-500">
          <span>运营商：</span>
          <Tag color="blue">
            {{ data?.carrierName || data?.carrierCode || '--' }}
          </Tag>
        </div>
        <div class="text-xs text-gray-500">
          系统默认 APN：
          <span class="font-medium text-gray-700 dark:text-gray-200">
            {{ data?.defaultApnName || '尚未配置' }}
          </span>
        </div>
      </div>

      <!-- APN 选择 -->
      <div>
        <div class="mb-2 text-sm font-medium">选择要使用的 APN</div>
        <Select
          v-model:value="selectedApnId"
          :options="apnOptions"
          :loading="loading"
          placeholder="请选择 APN"
          style="width: 100%"
        />
        <div
          v-if="selectedApn"
          class="mt-2 rounded bg-gray-50 px-2 py-1 text-xs text-gray-600 dark:bg-gray-800/40"
        >
          {{ selectedApn.name }} · {{ selectedApn.apn }} ·
          适用地区 {{ selectedApn.local }}
        </div>
      </div>

      <!-- 是否同步开关 -->
      <div class="rounded bg-amber-50 px-3 py-2 dark:bg-amber-900/20">
        <Checkbox v-model:checked="syncToDevice">
          <span class="text-sm">同步下发到设备</span>
        </Checkbox>
        <div class="mt-1 pl-6 text-xs text-amber-700 dark:text-amber-300">
          勾选后将向设备下发更换 APN 指令，由设备侧切换预置 APN
        </div>
      </div>
    </div>
  </BasicModal>
</template>
```

- [ ] **Step 5.2：提交**

```bash
cd d:/Project/esim.eim.web
git add apps/web-antd/src/views/system/apn/components/
git commit -m "feat(apn): add reusable apn-sync-confirm-modal for P4 integration"
```

---

## Task 6：端到端冒烟验证

- [ ] **Step 6.1：拉起开发服务**

```bash
cd d:/Project/esim.eim.web && pnpm dev:antd
```

- [ ] **Step 6.2：访问 APN 列表（系统管理→APN列表）**

验证清单：
- [ ] 搜索表单出现 5 个字段（名称、APN、运营商编码、是否默认、状态）
- [ ] 表格列出现「运营商、是否默认、状态、来源」4 个新列
- [ ] 已配置的默认 APN 行：左侧金黄色边框 + 渐变背景
- [ ] "是否默认"列：默认显示金黄色 ⭐Tag，否则灰色 "--"
- [ ] "状态"列：正常=绿色 Tag，停用=红色 Tag
- [ ] "来源"列：手动=蓝色 Tag，DP+=紫色 Tag

- [ ] **Step 6.3：操作验证**

- [ ] 点击"新增"：表单出现运营商编码、运营商名称、默认 Switch、状态 Switch
- [ ] 新增一条带 `carrierCode=CMCC, isDefault=否` 的 APN，保存成功
- [ ] 点击该行"设为默认"：弹确认 → 确认 → 行高亮变蓝 + ⭐ Tag 出现
- [ ] 编辑默认 APN：Modal 顶部出现金黄色"⭐ 默认"提示横幅
- [ ] 同运营商再设另一条为默认：原默认自动取消

- [ ] **Step 6.4：APN 同步确认 Modal 单测**

由于 P2 阶段没有真实调用方，需要临时验证组件可被打开。在浏览器 DevTools Console 注入临时调用，或保留到 P4 集成时一并验证。本阶段只需通过 typecheck 即可。

- [ ] **Step 6.5：lint / typecheck**

```bash
cd d:/Project/esim.eim.web && pnpm -F @vben/web-antd run typecheck 2>&1 | tail -30
```

Expected：无 APN 相关错误。

```bash
cd d:/Project/esim.eim.web && pnpm lint 2>&1 | tail -30
```

Expected：无 APN 相关错误。

> 注：若环境缺 `vue-tsc` / `vsh`，跳过此步，留给用户在自己环境验证。

---

## 完成标准

- [ ] API 层新增 `setDefaultApn` 和 `apnByCarrier`
- [ ] 列表新增 4 列、5 个搜索字段、行内"设为默认"操作
- [ ] 默认 APN 行视觉高亮（边框+渐变背景）
- [ ] APN 弹窗支持新字段，编辑默认 APN 时顶部提示
- [ ] 公共组件 `apn-sync-confirm-modal.vue` 可独立工作
- [ ] 现有 APN 数据缺少新字段时显示 "--"，不破坏渲染

---

## 后续依赖

P2 完成后请用户验收：
1. APN 列表视觉效果是否满意（默认行高亮、彩色 Tag）
2. 同步确认弹窗交互是否合理（提示文案、选项默认值）
3. 是否需要 `eim_apn_source` 字典 SQL 入库

确认后再进入 P3（码号资源池管理）。
