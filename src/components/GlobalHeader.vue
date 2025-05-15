<template>
  <div id="globalHeader">
    <a-row :wrap="false">
      <a-col flex="200px">
        <RouterLink to="/">
          <div class="title-bar">
            <img class="logo" src="../assets/logo.svg" alt="logo" />
            <div class="title">TestX</div>
          </div>
        </RouterLink>
      </a-col>
      <a-col flex="auto">
        <a-menu
          v-model:selectedKeys="current"
          mode="horizontal"
          :items="items"
          @click="doMenuClick"
        />
      </a-col>
      <!-- 用户信息栏展示 -->
      <a-col flex="120px">
        <div class="user-login-status">
          <div v-if="loginUserStore.loginUser.id">
            <a-dropdown>
              <ASpace>
                <!--                <a-avatar :src="loginUserStore.loginUser.userAvatar" />-->
<!--                <a-avatar :src="loginUserStore.loginUser.userAvatar">-->
<!--                  <template v-if="!loginUserStore.loginUser.userAvatar" #default>-->
<!--                    {{ (loginUserStore.loginUser.userName?.charAt(0) || 'A').toUpperCase() }}-->
<!--                  </template>-->
<!--                </a-avatar>-->
                <Avatar
                  :avatar-src="loginUserStore.loginUser.userAvatar"
                  :display-name="loginUserStore.loginUser.userName"
                />
                {{ loginUserStore.loginUser.userName }}
              </ASpace>
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="doLogout">
                    <LogoutOutlined />
                    退出登录
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </div>
          <div v-else>
            <a-button type="primary" href="/user/login">登录</a-button>
          </div>
        </div>
      </a-col>
    </a-row>
  </div>
</template>

<script lang="ts" setup>
import { computed, h, onMounted, ref } from 'vue'
import { HomeOutlined } from '@ant-design/icons-vue'
import { type MenuProps, message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import { userLogoutUsingPost } from '@/api/userController.ts'
import { LogoutOutlined } from '@ant-design/icons-vue'
import Avatar from '@/components/user/Avatar.vue'

const loginUserStore = useLoginUserStore()

const items = computed<MenuProps['items']>(() => {
  const baseItems = [
    {
      key: '/',
      icon: () => h(HomeOutlined),
      label: '主页',
      title: '主页',
    },
    {
      key: '/about',
      label: '关于',
      title: '关于',
    }
  ];

  // 当用户是管理员时插入用户管理菜单
  if (loginUserStore.loginUser?.userRole === 'admin') {
    baseItems.splice(1, 0, { // 在主页和关于之间插入
      key: '/admin/userManage',
      label: '用户管理',
      title: '用户管理',
    });
  }

  return baseItems;
});



const router = useRouter()
// 路由跳转事件
const doMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}

// 当前选中菜单
const current = ref<string[]>([])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, next) => {
  current.value = [to.path]
})

// 用户注销
const doLogout = async () => {
  const res = await userLogoutUsingPost({
    headers: {
      Authorization: `${loginUserStore.token}`, // 添加 token 到请求头
    },
  })
  console.log(res)
  if (res.data.code === 0) {
    loginUserStore.clearLoginState()
    // loginUserStore.setLoginUser({
    //   userName: '未登录',
    // })
    message.success('退出登录成功')
    await router.push('/user/login')
  } else {
    message.error('退出登录失败，' + res.data.message)
  }
}
</script>

<style scoped>
#globalHeader .title-bar {
  display: flex;
  align-items: center;
}

#globalHeader .title {
  color: black;
  font-size: 18px;
  margin-left: 16px;
}

#globalHeader .logo {
  height: 48px;
}
</style>
