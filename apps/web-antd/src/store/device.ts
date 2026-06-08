import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useDeviceStore = defineStore('app-device', () => {
  const currentEid = ref('');
  const downloadList = ref<any[]>([]);

  function setCurrentEid(eid: string) {
    currentEid.value = eid;
  }

  function setDownloadList(list: any[]) {
    downloadList.value = list;
  }

  function clearDownloadList() {
    downloadList.value = [];
  }

  return {
    currentEid,
    downloadList,
    clearDownloadList,
    setCurrentEid,
    setDownloadList,
  };
});
