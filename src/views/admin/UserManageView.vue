<template>
  <div id="userManageView">
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="账号">
        <a-input v-model:value="searchParams.userAccount" placeholder="输入账号" />
      </a-form-item>
      <a-form-item label="用户名">
        <a-input v-model:value="searchParams.userName" placeholder="输入用户名" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>

    <a-table
      :columns="columns"
      :data-source="dataList"
      :pagination="pagination"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'userAvatar'">
<!--          <a-image :src="record.userAvatar" :width="120" />-->
          <Avatar
            :avatar-src="loginUserStore.loginUser.userAvatar"
            :display-name="loginUserStore.loginUser.userName"
            :shape="'square'"
          />
        </template>
        <template v-else-if="column.dataIndex === 'userRole'">
          <div v-if="record.userRole === 'admin'">
            <a-tag color="green">管理员</a-tag>
          </div>
          <div v-else>
            <a-tag color="blue">普通用户</a-tag>
          </div>
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm:ss') }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button danger @click="handleDelete(record.id)" :loading="deleteLoading === record.id">
            删除
          </a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { deleteUserUsingPost, getUserListUsingPost } from '@/api/userController.ts'
import dayjs from 'dayjs'
import { useLoginUserStore } from '@/stores/useLoginUserStore.ts'
import Avatar from '@/components/user/Avatar.vue'

const columns = [
  {
    title: 'id',
    dataIndex: 'id',
  },
  {
    title: '账号',
    dataIndex: 'userAccount',
  },
  {
    title: '用户名',
    dataIndex: 'userName',
  },
  {
    title: '头像',
    dataIndex: 'userAvatar',
  },
  {
    title: '简介',
    dataIndex: 'userProfile',
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
  },
  {
    title: '操作',
    key: 'action',
  },
]

// 数据
const dataList = ref<any>([])
const total = ref(0)

// 搜索条件
const searchParams = reactive<API.UserQueryRequest>({
  current: 1,
  pageSize: 10,
})

const loginUserStore = useLoginUserStore()
// 获取数据
const fetchData = async () => {
  const res = await getUserListUsingPost(
    {
      ...searchParams,
    },
    {
      headers: {
        Authorization: `${loginUserStore.token}`, // 添加 token 到请求头
      },
    },
  )
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})

// 分页参数
const pagination = computed(() => {
  return {
    current: searchParams.current ?? 1,
    pageSize: searchParams.pageSize ?? 10,
    total: total.value,
    showSizeChanger: true,
    showTotal: (total: any) => `共 ${total} 条`,
  }
})

// 表格变化处理
const doTableChange = (page: any) => {
  searchParams.current = page.current
  searchParams.pageSize = page.pageSize
  fetchData()
}

// 获取数据
const doSearch = () => {
  // 重置页码
  searchParams.current = 1
  fetchData()
}

// 删除用户
const deleteLoading = ref<any>(null) // 用于记录正在删除的用户ID
const handleDelete = async (userId: number) => {
  try {
    // 不能删除自己
    if (userId === loginUserStore.loginUser.id) {
      message.error('无权删除当前账户')
      return
    }

    // 显示确认对话框
    const confirmed = await new Promise((resolve) => {
      Modal.confirm({
        title: '确认删除',
        content: '确定要删除该用户吗？此操作不可撤销',
        okText: '确认',
        cancelText: '取消',
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })

    if (!confirmed) return

    deleteLoading.value = userId // 显示加载状态

    // 管理员：调用删除API
    const res = await deleteUserUsingPost(
      { id: userId },
      {
        headers: {
          Authorization: `${loginUserStore.token}`, // 添加 token 到请求头
        },
      },
    )
    if (res.data.data) {
      message.success('删除成功')
    } else {
      message.error('删除失败，' + res.data.message)
    }

    // 刷新表格数据（根据实际项目调整）
    await fetchData()
  } catch (error: any) {
    message.error('删除失败: ' + error.message)
  } finally {
    deleteLoading.value = null
  }
}
</script>

<style scoped></style>
