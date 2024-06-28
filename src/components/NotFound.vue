<template>
  <div class="not-found">
    <img :src="notFoundIcon" alt="" />
    <div>页面未找到</div>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
  data () {
    return {
      notFoundIcon: require('@/assets/images/404.png')
    }
  },

  components: {},

  computed: {},

  mounted () {
    if (this.$route.query.path) {
      this.$router.replace(this.$route.query.path)
    }
  },

  methods: {}
}
</script>
<style lang="less" scoped>
.not-found {
  width: 400px;
  height: 300px;
  margin: 0 atuo;
  text-align: center;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  > div {
    width: 100%;
    text-align: center;
    font-size: 22px;
    margin-top: 20px;
  }
}
</style>
