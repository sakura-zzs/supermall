<template>
  <div></div>
</template>
<script>
export default {
  name: "Detail",
  data() {
    return {
      iid: null,
    };
  },
  created() {
    // 通过当前组件对应的路由对象获取到携带在请求参数中的iid
    this.iid = this.$route.params.iid;
    console.log(this.iid);
  },
};
</script>