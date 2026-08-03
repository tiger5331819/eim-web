<script setup lang="ts">
import type {
  EimTenantAddBo,
  EimTenantEditBo,
} from '#/api/system/tenant/model';

import { computed, h, ref } from 'vue';
import { useRouter } from 'vue-router';

import { useVbenDrawer } from '@vben/common-ui';
import { cloneDeep } from '@vben/utils';

import { Button, Skeleton } from 'antdv-next';
import dayjs from 'dayjs';

import { useVbenForm } from '#/adapter/form';
import {
  eimTenantAdd,
  eimTenantInfo,
  eimTenantUpdate,
} from '#/api/system/tenant';
import { packageSelectList } from '#/api/system/tenant-package';
import { useTenantStore } from '#/store/tenant';
import { defaultFormValueGetter, useBeforeCloseDiff } from '#/utils/popup';

import { drawerSchema } from './data';

const emit = defineEmits<{ reload: [] }>();

const isUpdate = ref(false);
const title = computed(() => {
  return isUpdate.value ? '编辑租户' : '新增租户';
});

const [BasicForm, formApi] = useVbenForm({
  commonConfig: {
    formItemClass: 'col-span-2',
    labelWidth: 110,
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
              router.push('/platform_manage/tenantPackage');
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
    value: String(item.packageId),
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

function mapRecordToForm(record: Record<string, any>) {
  const formData = { ...record };
  if (record.id != null) {
    formData.id = String(record.id);
  }
  if (record.packageId != null) {
    formData.packageId = String(record.packageId);
  }
  if (record.accountCount === -1) {
    formData.accountLimitType = 'unlimited';
    delete formData.accountCount;
  } else {
    formData.accountLimitType = 'limited';
  }
  formData.expireTime = record.expireTime
    ? dayjs(record.expireTime).format('YYYY-MM-DD')
    : undefined;
  return formData;
}

function mapFormToSubmit(data: Record<string, any>) {
  const payload = cloneDeep(data);
  if (payload.id != null) {
    payload.id = String(payload.id);
  }
  if (payload.packageId != null) {
    payload.packageId = String(payload.packageId);
  }
  payload.accountCount =
    payload.accountLimitType === 'unlimited' ? -1 : payload.accountCount;
  delete payload.accountLimitType;
  delete payload.adminAccount;
  if (payload.expireTime) {
    payload.expireTime = dayjs(payload.expireTime).format(
      'YYYY-MM-DD 23:59:59',
    );
  }
  return payload;
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
        eimTenantInfo(String(id)),
        setupPackageSelect(),
      ]);
      await formApi.setValues(mapRecordToForm(record));
    } else {
      await setupPackageSelect();
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
    console.log('values', await formApi.getValues());
    const data = mapFormToSubmit(await formApi.getValues());
    if (isUpdate.value) {
      await eimTenantUpdate(data as EimTenantEditBo);
      window.message.success('编辑租户成功');
    } else {
      await eimTenantAdd(data as EimTenantAddBo);
      window.message.success('新增租户成功');
    }
    resetInitialized();
    emit('reload');
    drawerApi.close();
    tenantStore.initTenant();
  } catch (error) {
    console.error(error);
  } finally {
    drawerApi.lock(false);
  }
}

async function handleClosed() {
  await formApi.resetForm();
  resetInitialized();
}
</script>

<template>
  <BasicDrawer :title="title" class="w-[600px]">
    <Skeleton v-if="loading" active />
    <BasicForm v-show="!loading" />
  </BasicDrawer>
</template>
