<script setup lang="ts">
import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useVbenDrawer } from '@vben/common-ui';
import { $t } from '@vben/locales';
import { cloneDeep } from '@vben/utils';

import { Button, Skeleton } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  eimTenantAdd,
  eimTenantInfo,
  eimTenantUpdate,
} from '#/api/system/tenant';
import type {
  EimTenantAddBo,
  EimTenantEditBo,
} from '#/api/system/tenant/model';
import { packageSelectList } from '#/api/system/tenant-package';
import { useTenantStore } from '#/store/tenant';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
/** 用户是否手动改过用户账号，改过则不再被企业名称联动覆盖 */
const userTouched = ref(false);
const title = computed(() => {
  return isUpdate.value ? $t('pages.common.edit') : $t('pages.common.add');
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    labelWidth: 100,
    componentProps: {
      class: 'w-full',
    },
  },
  schema: drawerSchema(),
  showDefaultActions: false,
  wrapperClass: 'grid-cols-2',
});

const router = useRouter();
async function setupPackageSelect() {
  const tenantPackageList = await packageSelectList();
  if (tenantPackageList.length === 0) {
    const closeMessage = window.message.error(
      h('span', {}, [
        '请先配置租户套餐',
        h(
          Button,
          {
            onClick: () => {
              router.push('/tenant/tenantPackage');
              closeMessage();
            },
            type: 'link',
            size: 'small',
          },
          '前往配置',
        ),
      ]),
    );
    throw new Error('请先配置租户套餐');
  }

  const options = tenantPackageList.map((item) => ({
    label: item.packageName,
    value: item.packageId,
  }));
  formApi.updateSchema([
    {
      componentProps: {
        optionFilterProp: 'label',
        optionLabelProp: 'label',
        options,
        showSearch: true,
      },
      fieldName: 'packageId',
    },
  ]);
}

/** 监听企业名称变化：新增模式下，未手动编辑账号时自动预填同名 */
function bindUsernameAutoFill() {
  if (isUpdate.value) return;
  formApi.updateSchema([
    {
      fieldName: 'username',
      componentProps: {
        onChange: () => {
          userTouched.value = true;
        },
      },
    },
    {
      fieldName: 'companyName',
      componentProps: {
        onChange: (e: any) => {
          if (userTouched.value) return;
          const val = typeof e === 'string' ? e : e?.target?.value;
          if (val) formApi.setFieldValue('username', val);
        },
      },
    },
  ]);
}

const { onBeforeClose, markInitialized, resetInitialized } = useBeforeCloseDiff(
  {
    initializedGetter: defaultFormValueGetter(formApi),
    currentGetter: defaultFormValueGetter(formApi),
  },
);

const loading = ref(false);
const [BasicDrawer, drawerApi] = useVbenDrawer({
  onBeforeClose,
  onClosed: handleClosed,
  onConfirm: handleConfirm,
  async onOpenChange(isOpen) {
    if (!isOpen) {
      return null;
    }
    drawerApi.drawerLoading(true);
    loading.value = true;

    const { id } = drawerApi.getData() as { id?: number | string };
    isUpdate.value = !!id;

    if (isUpdate.value && id) {
      const [record] = await Promise.all([
        eimTenantInfo(id),
        setupPackageSelect(),
      ]);
      // 编辑模式 username 字段隐藏，锁定标志位避免误触发
      userTouched.value = true;
      record.expireTime = record.expireTime
        ? (dayjs(record.expireTime) as any)
        : undefined;
      await formApi.setValues(record);
    } else {
      await setupPackageSelect();
      bindUsernameAutoFill();
    }

    await markInitialized();

    drawerApi.drawerLoading(false);
    loading.value = false;
  },
});

const tenantStore = useTenantStore();
async function handleConfirm() {
  try {
    drawerApi.lock(true);
    const { valid } = await formApi.validate();
    if (!valid) {
      return;
    }
    const data = cloneDeep(await formApi.getValues());
    // dayjs转string
    if (data.expireTime) {
      data.expireTime = dayjs(data.expireTime).format('YYYY-MM-DD HH:mm:ss');
    }
    if (isUpdate.value) {
      await eimTenantUpdate(data as EimTenantEditBo);
    } else {
      await eimTenantAdd(data as EimTenantAddBo);
    }
    resetInitialized();
    emit('reload');
    drawerApi.close();
    // 重新加载租户信息
    tenantStore.initTenant();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  userTouched.value = false;
  resetInitialized();
}
</script>

<template>
  <BasicDrawer :title="title" class="w-[600px]">
    <Skeleton v-if="loading" active />
    <BasicForm v-show="!loading" />
  </BasicDrawer>
</template>

<style lang="scss" scoped>
:deep(.ant-divider) {
  margin: 8px 0;
}
</style>
