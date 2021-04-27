<template>
  <div class="wrapper" ref="wrapper">
    <div>
      <slot></slot>
    </div>
  </div>
</template>
<script>
import BScroll from "better-scroll";
export default {
  name: "Scroll",
  props: {
    probeType: {
      type: Number,
      default: 0,
    },
    click: {
      type: Boolean,
      default: true,
    },
    pullUpLoad: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      scroll: null,
      name: 4545,
    };
  },
  // 页面渲染完毕，可以在这里使用一些第三方插件
  mounted() {
    this.initScroll();
    // 获取当前滚动的位置
    this.scroll.on("scroll", (position) => {
      this.$emit("scroll", position);
    });
    // 上拉加载时，上拉加载事件只会触发一次
    this.scroll.on("pullingUp", () => {
      this.$emit("pullingUp");
    });
  },
  methods: {
    initScroll() {
      // 创建better-scroll
      this.scroll = new BScroll(this.$refs.wrapper, {
        // probeType:是否开启监听页面滚动，默认不监听
        // 值为0/1时不监听，为2时监听手指滚动页面的过程，不监听手指离开页面后惯性带来的滚动
        // 为3时，只要是滚动就会监听
        probeType: this.probeType,
        // 是否让better-scroll内的点击事件生效，对button按钮的点击行为不生效
        click: this.click,
        // 是否开启上拉加载功能
        pullUpLoad: this.pullUpLoad,
      });
    },
    // 页面滚动到指定位置，time为执行滚动的时间
    scrollTo(x, y, time = 300) {
      // 使用scroll实例的方法之前，先判断一下scroll实例是否已被挂载，防止监听图片加载触发refresh方法时，
      // 图片加载速度比scroll实例挂载速度更快的情况出现，导致图片加载完就调用scroll实例方法而scroll实例还未被挂载而报错
      this.scroll && this.scroll.scrollTo(x, y, time);
    },
    // 结束上拉加载事件，使得可以进行下一次下拉加载事件
    finishPullUp() {
      this.scroll && this.scroll.finishPullUp();
    },
    // 重新计算scorllerHeight属性（页面可滚动高度），使滚动效果保持正常
    refresh() {
      this.scroll && this.scroll.refresh();
    },
    getScrollY() {
      // 获取组件滚动距离
      return this.scroll ? this.scroll.y : 0;
    },
  },
};
</script>
<style scoped>
.wrapper {
  /* height: 1000px; */
  overflow: hidden;
}
</style>