
<template>
  <div id="app">
    <router-view name="root">
    </router-view>
  </div>
</template>

<script>
/* eslint-disable */
export default {
  components: {},
  data: function() {
    return {
      isShowingOnboardDatafeed: false
    };
  },
  created: function() {
  },
  mounted: function() {
  },
  methods: {
    onSelectMenu: function(name) {
      switch (name) {
        case "onboard":
          this.isShowingOnboardDatafeed = true;
          break;
        case "datafeeds":
          this.$router.push({ name: "datafeeds" });
          break;
      }
    }
  }
};
</script>

<style lang="scss">
$header-height: 40px;
#app {
  font-family: "Segoe UI", "Microsoft YaHei", Arial;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #333333;
}
#nav {
  padding: 30px;
  a {
    font-weight: bold;
    color: #2c3e50;
    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

#adalIdTokenFrame {
  display: none;
}
</style>
<style lang="scss" scoped>
.layout-con {
  height: 100%;
  width: 100%;
}

.header {
  height: 40px;
  text-align: left;
  padding-left: 15px;
}
.menu-item span {
  display: inline-block;
  overflow: hidden;
  width: 69px;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  transition: width 0.2s ease 0.2s;
}
.menu-item i {
  transform: translateX(0px);
  transition: font-size 0.2s ease, transform 0.2s ease;
  vertical-align: middle;
  font-size: 16px;
}
.collapsed-menu span {
  width: 0px;
  transition: width 0.2s ease;
}
.collapsed-menu i {
  transform: translateX(5px);
  transition: font-size 0.2s ease 0.2s, transform 0.2s ease 0.2s;
  vertical-align: middle;
  font-size: 22px;
}
</style>
