<template>
  <div id="home">
    <nav-bar class="home-nav">
      <div slot="center">购物街</div>
    </nav-bar>
    <!-- 做停留效果的tabControl -->
    <tabControl
      @tabClick="tabClick"
      :titles="['流行', '新款', '精选']"
      class="tabcontrol"
      ref="tabControl1"
      v-show="isFixed"
    />
    <scroll
      class="content"
      :probeType="3"
      :click="true"
      :pull-up-load="true"
      ref="scroll"
      @scroll="contentScroll"
      @pullingUp="loadMore"
    >
      <home-swiper @imageLoad="imageLoad" :banners="banners" />
      <recommend-view :recommends="recommends" />
      <feature-view />
      <tabControl
        @tabClick="tabClick"
        :titles="['流行', '新款', '精选']"
        class="tabcontrol"
        ref="tabControl2"
      />
      <goods-list :goods="showGoods"></goods-list>
    </scroll>
    <!-- vue组件想要触发原生js的点击事件需要使用修饰符.native -->
    <back-top @click.native="backtopClick" v-show="isShowBackTop" />
  </div>
</template>
<script>
import HomeSwiper from "./childCompts/HomeSwiper";
import RecommendView from "./childCompts/RecommendView";
import FeatureView from "./childCompts/FeatureView";
// 将引入文件分类，方便查找
import NavBar from "../../components/common/navbar/NavBar";
import Scroll from "../../components/common/scroll/Scroll";

import TabControl from "../../components/content/tabControl/TabControl";
import GoodsList from "../../components/content/goods/GoodsList";
import BackTop from "../../components/content/backtop/BackTop";

import { getMultidata, getProductData } from "../../network/home";

export default {
  name: "Home",
  components: {
    HomeSwiper,
    RecommendView,
    FeatureView,
    NavBar,
    Scroll,
    TabControl,
    GoodsList,
    BackTop,
  },
  data() {
    return {
      banners: null,
      recommends: null,
      // 商品数据,有三种商品数据,默认获取第一页数据
      goods: {
        pop: { page: 0, list: [] },
        new: { page: 0, list: [] },
        sell: { page: 0, list: [] },
      },
      // 当前所要请求的商品数据类型
      currentType: "pop",
      // 显示隐藏置顶按钮
      isShowBackTop: false,
      // tabControl的offsetTop值
      tabOffSetTop: 0,
      // 决定tabControl是否显示
      isFixed: false,
      // 用户上一次浏览当前页时所处页面位置
      saveY: 0,
    };
  },
  async created() {
    this.getMultiData();
    this.getProductData("new");
    this.getProductData("pop");
    this.getProductData("sell");
  },
  computed: {
    showGoods() {
      return this.goods[this.currentType].list;
    },
  },
  mounted() {
    // // 将this.$refs.scroll.refresh传入防抖函数生成新的refresh函数解决refresh方法频繁调用的问题
    const refresh = this.debounce(this.$refs.scroll.refresh, 20);
    // 在mounted下使用this.$refs.scroll.refresh()，防止scroll实例未被挂载就使用的情况
    // 监听其他组件通过事件中心发送出来的事件，监听goodsListItem的每一张图片加载完成
    this.$bus.$on("imgLoad", () => {
      // scroll.scrollerHeight：better-scroll插件会依次遍历在它里面的标签计算总的高度，即页面可滚动高度
      // 图片未加载完成时，则不会将其高度计入scrollerHeight中，这样就会导致滚动效果失效
      // 使用refresh()方法在每张图片加载完成时重新计算高度解决问题
      // 每当一张图片加载完成时重新计算scroll.scrollerHeight（页面可滚动高度）的值
      refresh();
    });
  },
  methods: {
    // 点击tab按钮切换商品数据类型
    tabClick(index) {
      switch (index) {
        case 0:
          this.currentType = "pop";
          break;
        case 1:
          this.currentType = "new";
          break;
        case 2:
          this.currentType = "sell";
      }
      // 让做停留效果的tabControl和better-scroll里的tabControl被点击时同步切换商品类型
      this.$refs.tabControl1.currentIndex = index;
      this.$refs.tabControl2.currentIndex = index;
    },
    // 点击置顶
    backtopClick() {
      // 通过引用对象获取到better-scroll实例对象并使用其方法
      this.$refs.scroll.scrollTo(0, 0, 500);
    },
    contentScroll(position) {
      // 当前滚动位置大于1000时显示置顶按钮
      this.isShowBackTop = -position.y > 1000;
      // 当前滚动位置大于tabControl2的offsetTop值时让tabControl1显示，
      // 由于better-scroll的滚动效果，所以tabControl并不能固定在屏幕上（即使设置了定位），而是会跟随一起滚动
      // 所以可以在新增一个tabControl在better-scroll上方，当用户滚动到指定位置时，让这个tabControl显示就能达到
      // tabControl吸顶效果（滚动超过指定位置时停留在屏幕上方）
      this.isFixed = -position.y > this.tabOffSetTop;
    },
    loadMore() {
      // 上拉加载下一页数据
      this.getProductData(this.currentType);
    },
    // 封装防抖函数（也可以叫节流函数），处理this.$refs.scroll.refresh频繁调用的问题,使refresh方法不被频繁调用
    // 当一张图片加载完成时，调用新的refresh方法触发debounce返回的函数
    // 开启一个定时器延时执行this.$refs.scroll.refresh，当下一张图片很快被加载完成，就又会调用debounce，而上一次延时还没结束
    // 清除上一次的定时器又开启一个定时器执行this.$refs.scroll.refresh，如果下一张图片又很快加载完成，那么下一次调用debounce又会
    // 取消上一次的定时器，开启自己的定时器（开关了这么多次定时器，但是并没有执行this.$refs.scroll.refresh，因为图片加载
    //速度过快，取消了执行它的定时器，而图片已经加载了很多张，而this.$refs.scroll.refresh却并没有执行一次，直到最后一张图片被加载
    // 又开启定时器执行this.$refs.scroll.refresh，由于所有图片加载完毕，并没有下一张图片加载过快导致关闭了上一次的定时器，
    // 所以最后只执行了一次this.$refs.scroll.refresh，而不是像之前每次图片加载完成时都调用一次）
    debounce(func, delay) {
      let timer = null;
      return function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
          func();
        }, delay);
      };
    },
    // 获取tabControl组件offsetTop(距文档顶部距离)，因为offsetTop不会将未加载的图片高度计入其中，
    // 所以需要在图片加载完成后获取offsetTop值，图片加载速度很快，所以只需要监听一次轮播图加载完成就能获取到正确的offsetTop值
    // 监听轮播图加载完成
    imageLoad() {
      // $el获取组件元素
      // 保存offsetTop，保存之前先判断tabControl里的元素是否加载完毕
      this.tabOffSetTop = this.$refs.tabControl1.$el
        ? this.$refs.tabControl2.$el.offsetTop
        : 0;
    },
    async getMultiData() {
      const { data: res } = await getMultidata();
      this.banners = res.data.banner.list;
      this.recommends = res.data.recommend.list;
    },
    async getProductData(type) {
      const page = this.goods[type].page + 1;
      const { data: res } = await getProductData(type, page);
      // 每次请求将数据追加保存
      this.goods[type].list.push(...res.data.list);
      // 请求一页数据后，页码加一，下一次请求的就是下一页的数据
      this.goods[type].page += 1;
      // 结束下拉加载事件，以便触发下次下拉加载事件
      this.$refs.scroll.finishPullUp();
    },
  },
  // activated和deactivated两个函数只有在当前组件使用了keep-alive保存状态时才生效
  // 监听当前页处于活跃状态时
  // 由于better-scroll内部问题，keep-alive会失效，所以得手动保存用户浏览当前页时得状态
  activated() {
    // 当前组件处于活跃状态时根据上一次用户滚动的距离还原上一次的访问状态（手动滚动到上一次访问的位置）
    this.$refs.scroll.scrollTo(0, this.saveY, 0);
  },
  // 监听当前页不处于活跃状态后
  deactivated() {
    // 离开当前页时获取滚动组件滚动的距离
    this.saveY = this.$refs.scroll.getScrollY();
  },
};
</script>
<style scoped>
#home {
  height: 100vh;
  position: relative;
}
/* 使用css变量 */
.home-nav {
  background-color: var(--color-tint);
  color: #fff;
  position: relative;
  z-index: 9;
}
.tabcontrol {
  position: relative;
  z-index: 9;
}
.content {
  position: absolute;
  top: 44px;
  bottom: 49px;
  left: 0;
  right: 0;
}
</style>