import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getLoginUserUsingGet } from '@/api/userController.ts'

/**
 * 存储登录用户信息的状态
 */
export const useLoginUserStore = defineStore('loginUser', () => {
  const loginUser = ref<API.LoginUserVO>({
    userName: '未登录',
  })

  // 从本地存储初始化 token
  const token = ref(localStorage.getItem('token') || '')

  /**
   * 远程获取登录用户信息
   */
  async function fetchLoginUser() {
    try {
      const res = await getLoginUserUsingGet({
        headers: {
          Authorization: `${token.value}`, // 添加 token 到请求头
        },
      })

      if (res.data.code === 0 && res.data.data) {
        loginUser.value = res.data.data
      } else if (res.data.code === 401) {
        // token 无效或过期
        clearLoginState()
        // 可以在这里添加重定向到登录页的逻辑
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      // 处理网络错误等情况
    }
  }

  // async function fetchLoginUser() {
  //   const res = await getLoginUserUsingGet()
  //   console.log(res.data)
  //   if (res.data.code === 0 && res.data.data) {
  //     loginUser.value = res.data.data
  //   }
  // }

  function setToken(newToken: string) {
    token.value = newToken;
    // 将token保存到本地存储
    localStorage.setItem('token', newToken);
  }

  function clearLoginState() {
    loginUser.value = { userName: "未登录" };
    token.value = '';
    localStorage.removeItem('token');
    // 可以在这里添加清除其他相关状态的逻辑
  }

  function setLoginUser(newLoginUser: any) {
    loginUser.value = newLoginUser
  }

  return { loginUser, token, setLoginUser, setToken, clearLoginState, fetchLoginUser }
})
