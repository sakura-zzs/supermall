<template>
  <div id="app">
    <!-- 添加keep-alive保留home状态，防止重复渲染 -->
    <keep-alive>
      <router-view />
    </keep-alive>
    <main-tab-bar></main-tab-bar>
  </div>
</template>
<script>
import MainTabBar from "./components/content/tabbar/MainTabBar";
export default {
  name: "app",
  components: {
    MainTabBar,
  },
};
</script>
<style>
@import "./assets/css/base.css";
</style>
