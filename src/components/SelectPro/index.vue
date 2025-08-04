<template>
  <el-select v-model="modelValue" v-bind="$attrs" @change="handleChange">
    <el-option v-for="item in state" :key="item[valueKey]" :label="item[labelKey]" :value="item[valueKey]" />
  </el-select>
</template>

<script setup lang="ts">
const props = withDefaults(defineProps<{ modelValue: any; request: Function; valueKey?: string; labelKey?: string }>(), {
  valueKey: 'value',
  labelKey: 'label'
});

const emit = defineEmits(['update:modelValue', 'change']);

const modelValue = useVModel(props, 'modelValue', emit, {
  passive: true
});

const { state, isLoading } = useAsyncState(async () => {
  const { rows, data } = await props.request();
  console.log('rows---', rows);
   console.log('data---', data);
  return rows || data;
}, []);
// const getFn = async () => {
//   console.log('props.request---',props.request)
//   const { rows } = await props.request();
//   console.log('rows---', rows);
// };
// getFn();
const handleChange = (value: any) => {
  let obj: any = {};
  state.value.forEach((item: any) => {
    if (item[props.valueKey] == value) {
      obj = item;
    }
  });
  emit('change', obj);
};
</script>
