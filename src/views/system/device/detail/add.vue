<template>
  <div class="detail">
    <el-page-header @back="goBack" :content="`添加${type}号`" />
    <el-form :rules="rules" :model="form" style="margin-top: 20px" ref="form">
      <!-- <h2>添加业务号</h2> -->
      <el-row v-if="type == '业务'">
        <el-col :span="12">
          <el-form-item label="运营商所属地" prop="providerLocal">
            <el-select v-model="form.providerLocal" @change="handleSelect" style="width: 300px">
              <el-option v-for="item in localList" :key="item.local" :label="item.local"
                :value="item.local"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="运营商" prop="provider">
            <el-select v-model="form.provider" style="width: 300px" value-key="name">
              <el-option v-for="item in providerList" :key="item.id" :label="item.name" :value="item"></el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row v-else>
        <el-col :span="12">
          <el-form-item label="运营商" prop="provider">
            <el-select style="width: 300px" v-model="form.provider" filterable remote placeholder="请输入关键词"
              :remote-method="remoteMethod" :loading="loading" value-key="name">
              <el-option v-for="item in options" :key="item.id" :label="item.name" :value="item">
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12" v-if="type == '种子'">
          <el-form-item label="数量" prop="size">
            <el-input v-model="form.size" placeholder="请输入" style="width: 300px" />
          </el-form-item>
        </el-col>
      </el-row>
      <el-button type="primary" @click="search" size="small">{{
        `查询${type}资源`
      }}</el-button>
      <el-divider></el-divider>
      <div class="search">
        <span v-if="searchResult.length == 0">{{
          `查询结果：当前无可用的${type}号资源`
        }}</span>
        <span v-else>{{ `查询结果：以下为预分配的${type}号资源` }}</span>
        <el-table :data="searchResult" style="width: 40%; margin-top: 20px" v-if="searchResult.length > 0">
          <el-table-column label="序号" type="index" />
          <el-table-column prop="providerName" label="运营商" />
          <el-table-column prop="iccid" label="ICCID" />
        </el-table>
        <el-button type="primary" @click="handleAdd" size="small" style="margin-top: 20px"
          v-if="searchResult.length > 0">{{ `确认使用该${type}号资源` }}</el-button>
      </div>
    </el-form>
  </div>
</template>
<script>
import {
  profileList,
  seedList,
  addProfile,
  addSeed,
  getResponse,
} from "@/api/configuration/equipments";
import {
  getProviderDict,
  getLocalDict,
  getAllProvider,
} from "@/api/configuration/operator";
export default {
  dicts: ["connected_type", "online"],
  data () {
    return {
      loading: false,
      form: {},
      rules: {
        provider: [
          { required: true, message: "请选择运营商", trigger: "blur" },
        ],
        providerLocal: [
          { required: true, message: "请选择运营商所属地", trigger: "blur" },
        ],
        size: [
          { required: true, message: "请输入数量", trigger: "blur" },
          {
            pattern: /^\d*\.?\d*$/,
            message: "请输入正确的数量",
            trigger: "change",
          },
        ],
      },
      searchResult: [],
      type: "种子",
      providerList: [],
      localList: [],
      options: [],
      result: null, //轮询结果
      allProvider: [],
    };
  },
  created () {
    // 获取运营所属地
    getLocalDict().then((res) => {
      this.localList = res.data;
    });
    if (this.$route.query.type == 1) {
      this.type = "种子";
    } else {
      this.type = "业务";
    }
    // 获取所有运营商
    getAllProvider().then((res) => {
      this.allProvider = res.data;
    });
  },

  methods: {
    goBack () {
      this.$router.push({
        path: "/equipments/detail",
        query: {
          id: this.$route.query.id,
        },
      });
    },
    // 选择运营商操作
    handleSelect (val) {
      getProviderDict(val).then((res) => {
        this.providerList = res.data;
      });
    },
    // 查询列表
    search () {
      console.log(this.form);
      this.$refs["form"].validate((valid) => {
        if (valid) {
          if (this.type == "种子") {
            seedList({
              providerId: this.form.provider.id,
              size: this.form.size,
            }).then((res) => {
              this.searchResult = res.data;
            });
          } else {
            profileList({ providerId: this.form.provider.id }).then((res) => {
              this.searchResult = res.data;
            });
          }
        }
      });
    },
    // 轮询结果
    pollResult (code, msg) {
      console.log(this.result, code);
      let countdown;
      var timer = setInterval(() => {
        console.log("11", this.result);
        if (!this.result) {
          getResponse(code).then((res) => {
            if (res.code == 200) {
              if (res.data.result) {
                this.result = res.data.result;
                this.$alert(`${this.result}`, `${msg}成功`, {
                  type: "success",
                  confirmButtonText: "确定",
                }).then(() => {
                  this.goBack();
                });
                clearInterval(timer);
                clearInterval(countdown);
              }
            } else {
              this.$alert(`${res.msg}`, `${msg}失败`, {
                type: "error",
                confirmButtonText: "确定",
              });
              clearInterval(timer);
            }
          });
        }
      }, 1000);
      countdown = setTimeout(() => {
        // 五分钟后清除定时器，提示失败
        clearInterval(timer);
        this.$alert(`${msg}失败`, {
          type: "error",
          confirmButtonText: "确定",
        });
      }, 5 * 60 * 1000);
    },
    // 确认添加
    handleAdd () {
      this.result = null;
      if (this.type == "种子") {
        const iccidList = this.searchResult.map((item) => item.iccid);
        const param = {
          providerId: this.form.provider.id,
          providerName: this.form.provider.name,
          providerLocal: this.form.provider.local,
          iccidList,
        };
        addSeed(this.$route.query.id, param)
          .then((res) => {
            if (res.code == 200) {
              // 轮询查询设备响应结果
              this.pollResult(res.data.code, "添加");
              console.log(this.result);
            }
          })
          .catch((error) => {
            this.$alert(`${error}`, "添加失败", {
              type: "error",
              confirmButtonText: "确定",
            });
          });
      } else {
        const param = {
          iccid: this.searchResult[0].iccid,
          providerId: this.form.provider.id,
          providerName: this.form.provider.name,
          providerLocal: this.form.providerLocal,
        };
        addProfile(this.$route.query.id, param)
          .then((res) => {
            if (res.code == 200) {
              // 轮询查询设备响应结果
              this.pollResult(res.data.code, "添加");
              console.log(this.result);
            }
          })
          .catch((error) => {
            this.$alert(`${error}`, "添加失败", {
              type: "error",
              confirmButtonText: "确定",
            });
          });
      }
    },
    // 筛选运营商
    remoteMethod (query) {
      console.log(query)
      if (query !== "") {
        this.loading = true;
        setTimeout(() => {
          this.loading = false;
          this.options = this.allProvider.filter((item) => {
            return item.keyName.toLowerCase().indexOf(query.toLowerCase()) > -1;
          });
        }, 200);
      } else {
        this.options = [];
      }
    },
  },
};
</script>
<style scoped>
.detail {
  padding: 20px;
}

.title {
  display: inline-block;
  border-left: 2px solid #46a6ff;
  margin-right: 20px;
  padding-left: 10px;
}

.tip {
  display: inline-block;
  color: #46a6ff;
  font-size: 12px;
  margin-right: 20px;
}

.footer {
  margin: 30px 20px;
  float: right;
}

.el-menu-item {
  margin: 0 20px;
}

.search span {
  font-size: 14px;
}

.el-form-item .el-form-item__error {
  left: 50px !important;
}
</style>
