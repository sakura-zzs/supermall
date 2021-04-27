<template>
  <div>
    <swiper>
      <swiper-item v-for="(item, index) in banners" :key="index">
        <a :href="item.link">
          <!-- 监听轮播图片加载完成 -->
          <img @load="imageLoad" :src="item.image" alt="" />
        </a>
      </swiper-item>
    </swiper>
  </div>
</template>
<script>
import { Swiper, SwiperItem } from "../../../components/common/swiper";
export default {
  name: "HomeSwiper",
  props: {
    banners: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  components: {
    Swiper,
    SwiperItem,
  },
  data() {
    return {
      isLoad: false,
    };
  },
  methods: {
    imageLoad() {
      // 在轮播图加载完成时将事件发送出去
      if (!this.isLoad) {
        // 只需要监听一张轮播图的加载，所以只需要发送一次事件
        // 通过isLoad限制发送事件次数
        this.$emit("imageLoad");
        this.isLoad = true;
      }
    },
  },
};
</script>
<style scoped>
</style>