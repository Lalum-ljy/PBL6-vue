<template>
  <div class="index-container">
    <!-- 左侧导航栏 -->
    <div class="sidebar">
      <div class="logo">
        <h2>活动管理</h2>
        <div class="user-info">
          欢迎{{ username }}登录
        </div>
      </div>
      <nav class="nav-menu">
        <ul>
          <li :class="{ active: activeMenu === 'home' }" @click="navigate('home')">
            <span class="menu-text">主页</span>
          </li>
          <li :class="{ active: activeMenu === 'hot' }" @click="navigate('hot')">
            <span class="menu-text">热门活动</span>
          </li>
          <li :class="{ active: activeMenu === 'my' }" @click="navigate('my')">
            <span class="menu-text">我的活动</span>
          </li>
          <li :class="{ active: activeMenu === 'settings' }" @click="navigate('settings')">
            <span class="menu-text">设置</span>
          </li>
        </ul>
        <div class="logout-container">
          <li class="logout" @click="logout">
            <span class="menu-text">退出登录</span>
          </li>
        </div>
      </nav>
    </div>
    
    <!-- 右侧主内容区 -->
    <div class="main-content">
      <!-- 顶部搜索栏和筛选 -->
      <div class="search-bar">
        <div class="search-input-container">
          <input type="text" v-model="searchKeyword" placeholder="搜索活动..." @keyup.enter="handleSearch">
          <button v-if="searchKeyword" class="clear-button" @click="clearSearch">×</button>
        </div>
        <button class="search-button" @click="handleSearch">搜索</button>
        <div class="filter-container">
          <select v-model="statusFilter" class="filter-select" @change="handleStatusChange">
            <option value="-1">全部状态</option>
            <option value="0">即将开始</option>
            <option value="1">进行中</option>
            <option value="2">已结束</option>
          </select>
          <button class="filter-button" @click="showDateFilter = !showDateFilter">时间筛选</button>
          <div v-if="showDateFilter" class="date-filter">
            <input type="datetime-local" v-model="startDate" class="date-input">
            <span>至</span>
            <input type="datetime-local" v-model="endDate" class="date-input">
            <button class="apply-button" @click="applyDateFilter">应用</button>
          </div>
        </div>
        <button class="publish-button">+发布活动</button>
      </div>
      
      <!-- 图片轮播区域 -->
      <div v-if="!isSearching" class="carousel">
        <div class="carousel-container" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div class="carousel-slide" v-for="(slide, index) in carouselSlides" :key="index">
            <img :src="slide.image" :alt="slide.title">
            <div class="carousel-caption">
              <h3>{{ slide.title }}</h3>
              <p>{{ slide.description }}</p>
            </div>
          </div>
        </div>
        <div class="carousel-indicators">
          <span 
            v-for="(slide, index) in carouselSlides" 
            :key="index"
            :class="{ active: currentSlide === index }"
            @click="currentSlide = index"
          ></span>
        </div>
      </div>
      
      <!-- 热门活动 -->
      <div v-if="!isSearching" class="hot-activities">
        <div class="hot-activities-header">
          <h2>热门活动</h2>
          <router-link to="/hot" class="view-more">查看更多</router-link>
        </div>
        <div class="hot-activity-cards">
          <div class="hot-activity-card" v-for="(activity, index) in hotActivities" :key="index">
            <div class="hot-card-image">
              <img :src="activity.image" :alt="activity.title">
            </div>
            <div class="hot-card-content">
              <h3>{{ activity.title }}</h3>
              <p class="hot-card-description">{{ activity.description }}</p>
              <div class="hot-card-footer">
                <span class="activity-date">{{ activity.date }}</span>
                <span class="activity-status" :class="activity.status">{{ activity.statusText }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 活动列表 -->
      <div class="activity-list-section">
        <div class="activity-list-header">
          <h2>所有活动</h2>
        </div>
        <div class="activity-table">
          <div class="table-header">
            <span class="col-name">活动名称</span>
            <span class="col-desc">活动描述</span>
            <span class="col-time">开始时间</span>
            <span class="col-status">状态</span>
            <span class="col-creator">创建者</span>
          </div>
          <div class="table-row" v-for="(activity, index) in paginatedActivities" :key="index">
            <span class="col-name">{{ activity.activityName }}</span>
            <span class="col-desc">{{ activity.activityDesc }}</span>
            <span class="col-time">{{ formatTime(activity.startTime) }}</span>
            <span class="col-status">
              <span class="status-badge" :class="getStatusClass(activity.status)">{{ getStatusText(activity.status) }}</span>
            </span>
            <span class="col-creator">{{ activity.creator }}</span>
          </div>
        </div>
        <!-- 分页 -->
        <div class="pagination" v-if="allActivities.length > 0">
          <button class="page-btn" :disabled="currentPage === 1" @click="currentPage--">上一页</button>
          <span class="page-info">第 {{ currentPage }} 页 / 共 {{ totalPages }} 页</span>
          <button class="page-btn" :disabled="currentPage >= totalPages" @click="currentPage++">下一页</button>
        </div>
        <div v-if="loading" class="loading">加载中...</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { getAllActivities, getHotActivities, getActivitiesByStatus, getActivitiesByTimeRange, searchActivities } from '../api/activity';

// 导航菜单状态
const activeMenu = ref('home');

// 搜索关键词
const searchKeyword = ref('');

// 用户名
const username = ref('');

// 路由
const router = useRouter();

// 加载状态
const loading = ref(false);

// 筛选相关状态
const statusFilter = ref('-1');
const showDateFilter = ref(false);
const startDate = ref('');
const endDate = ref('');

// 搜索和筛选状态
const isSearching = ref(false);

// 轮播图数据
const currentSlide = ref(0);
const carouselSlides = ref([
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=colorful%20event%20banner%20with%20people%20celebrating&image_size=landscape_16_9',
    title: '夏季音乐节',
    description: '一场视听盛宴，不容错过！'
  },
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=tech%20conference%20with%20speakers%20and%20audience&image_size=landscape_16_9',
    title: '科技创新峰会',
    description: '探索未来科技趋势'
  },
  {
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sports%20event%20with%20athletes%20competing&image_size=landscape_16_9',
    title: '城市马拉松',
    description: '挑战自我，超越极限'
  }
]);

// 热门活动数据（从接口获取前4个）
const hotActivities = ref([]);

// 所有活动数据（从接口获取）
const allActivities = ref([]);

// 分页相关
const currentPage = ref(1);
const pageSize = 15;

// 计算当前页的活动数据
const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  const end = start + pageSize;
  return allActivities.value.slice(start, end);
});

// 计算总页数
const totalPages = computed(() => {
  return Math.ceil(allActivities.value.length / pageSize);
});

// 格式化时间
const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// 获取状态样式类
const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'upcoming';
    case 1: return 'ongoing';
    case 2: return 'ended';
    default: return 'upcoming';
  }
};

// 获取状态文本
const getStatusText = (status) => {
  switch (status) {
    case 0: return '即将开始';
    case 1: return '进行中';
    case 2: return '已结束';
    default: return '即将开始';
  }
};

// 导航方法
const navigate = (menu) => {
  activeMenu.value = menu;
  switch (menu) {
    case 'home':
      router.push('/index');
      break;
    case 'hot':
      router.push('/hot');
      break;
    case 'my':
      router.push('/my');
      break;
    case 'settings':
      router.push('/settings');
      break;
  }
};

// 退出登录
const logout = () => {
  // 清除本地存储
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // 跳转到登录页面
  router.push('/');
};

// 获取活动列表
const fetchActivities = async (status = -1, startTime = null, endTime = null) => {
  loading.value = true;
  try {
    let allResponse;
    if (status !== -1) {
      allResponse = await getActivitiesByStatus(status);
    } else if (startTime && endTime) {
      allResponse = await getActivitiesByTimeRange(startTime, endTime);
    } else {
      allResponse = await getAllActivities();
    }
    
    const hotResponse = await getHotActivities();
    
    if ((allResponse.code === 200 || allResponse.code === 0) && allResponse.data) {
      allActivities.value = allResponse.data;
    }
    
    if ((hotResponse.code === 200 || hotResponse.code === 0) && hotResponse.data) {
      hotActivities.value = hotResponse.data.map(item => ({
        image: item.coverUrl || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20event%20image&image_size=landscape_4_3',
        title: item.activityName,
        description: item.activityDesc,
        date: formatTime(item.startTime),
        status: getStatusClass(item.status),
        statusText: getStatusText(item.status)
      }));
    }
  } catch (error) {
    console.error('获取活动列表失败:', error);
  } finally {
    loading.value = false;
  }
};

// 搜索活动
const handleSearch = async () => {
  const keyword = (searchKeyword.value || '').trim();

  // 清空搜索：恢复默认列表
  if (!keyword) {
    isSearching.value = false;
    currentPage.value = 1;
    statusFilter.value = '-1';
    showDateFilter.value = false;
    startDate.value = '';
    endDate.value = '';
    await fetchActivities();
    return;
  }

  isSearching.value = true;
  loading.value = true;
  try {
    const res = await searchActivities(keyword);
    if ((res.code === 200 || res.code === 0) && res.data) {
      allActivities.value = res.data;
      currentPage.value = 1;
      statusFilter.value = '-1';
      showDateFilter.value = false;
      startDate.value = '';
      endDate.value = '';
    } else {
      allActivities.value = [];
      currentPage.value = 1;
    }
  } catch (error) {
    console.error('搜索活动失败:', error);
  } finally {
    loading.value = false;
  }
};

// 清空搜索
const clearSearch = async () => {
  searchKeyword.value = '';
  isSearching.value = false;
  currentPage.value = 1;
  statusFilter.value = '-1';
  showDateFilter.value = false;
  startDate.value = '';
  endDate.value = '';
  await fetchActivities();
};

// 应用时间筛选
const applyDateFilter = () => {
  if (startDate.value && endDate.value) {
    // 转换为 ISO 格式的时间字符串
    const startTime = new Date(startDate.value).toISOString();
    const endTime = new Date(endDate.value).toISOString();
    isSearching.value = true;
    currentPage.value = 1;
    fetchActivities(-1, startTime, endTime);
  }
  showDateFilter.value = false;
};

// 监听状态筛选变化
const handleStatusChange = () => {
  isSearching.value = statusFilter.value !== '-1';
  currentPage.value = 1;
  fetchActivities(parseInt(statusFilter.value));
};

// 自动轮播
onMounted(() => {
  // 从本地存储获取用户信息
  const user = localStorage.getItem('user');
  if (user) {
    try {
      const userObj = JSON.parse(user);
      username.value = userObj.username || '用户';
    } catch (error) {
      console.error('解析用户信息失败:', error);
      username.value = '用户';
    }
  } else {
    username.value = '用户';
  }
  
  // 获取活动列表
  fetchActivities();
  
  // 启动轮播
  setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselSlides.value.length;
  }, 3000);
});
</script>

<style scoped>
.index-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

/* 左侧导航栏 */
.sidebar {
  width: 250px;
  background-color: #2c3e50;
  color: white;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
}

.logo {
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo h2 {
  margin: 0 0 10px 0;
  font-size: 20px;
  font-weight: 600;
}

.user-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  margin-top: 10px;
}

.logout {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.logout:hover {
  background-color: #e74c3c !important;
}

.nav-menu {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

.logout-container {
  margin-top: auto;
  width: 100%;
}

.nav-menu li {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.nav-menu li:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-menu li.active {
  background-color: #3498db;
}

.menu-text {
  font-size: 16px;
}

/* 右侧主内容区 */
.main-content {
  flex: 1;
  margin-left: 250px;
  padding: 20px 20px 20px 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
  height: 100vh;
  box-sizing: border-box;
  width: calc(100% - 250px);
  position: absolute;
  top: 0;
  right: 0;
}

/* 热门活动 */
.hot-activities {
  margin-bottom: 30px;
  width: 100%;
}

.hot-activities-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.hot-activities h2 {
  margin: 0;
  color: #333333;
  font-size: 20px;
}

.view-more {
  color: #4299e1;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s ease;
}

.view-more:hover {
  color: #3182ce;
  text-decoration: underline;
}

.hot-activity-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
  width: 100%;
}

.hot-activity-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.hot-activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.hot-card-image {
  height: 120px;
  overflow: hidden;
}

.hot-card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hot-card-content {
  padding: 12px;
}

.hot-card-content h3 {
  margin: 0 0 8px 0;
  color: #333333;
  font-size: 14px;
}

.hot-card-description {
  margin: 0 0 10px 0;
  color: #666666;
  font-size: 12px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.hot-card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #999999;
}

/* 活动列表区域 */
.activity-list-section {
  margin-bottom: 30px;
  width: 100%;
}

.activity-list-header {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 20px;
}

.activity-list-section h2 {
  margin: 0;
  color: #333333;
  font-size: 20px;
}

.activity-table {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 1fr;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
}

.table-row {
  display: grid;
  grid-template-columns: 2fr 3fr 2fr 1fr 1fr;
  padding: 15px 20px;
  border-bottom: 1px solid #e9ecef;
  transition: background-color 0.3s ease;
  font-size: 14px;
  color: #333333;
}

.table-row:hover {
  background-color: #f8f9fa;
}

.table-row:last-child {
  border-bottom: none;
}

.col-name {
  font-weight: 500;
  color: #333333;
}

.col-desc {
  color: #666666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.col-time {
  color: #666666;
}

.col-status {
  display: flex;
  align-items: center;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.status-badge.upcoming {
  background-color: #e3f2fd;
  color: #1976d2;
}

.status-badge.ongoing {
  background-color: #e8f5e8;
  color: #388e3c;
}

.status-badge.ended {
  background-color: #ffebee;
  color: #d32f2f;
}

.col-creator {
  color: #666666;
}

/* 分页 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin-top: 20px;
  padding: 15px;
}

.page-btn {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #2980b9;
}

.page-btn:disabled {
  background-color: #bdc3c7;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666666;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666666;
  font-size: 14px;
}

/* 搜索栏 */
.search-bar {
  display: flex;
  margin-bottom: 20px;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  align-items: center;
  flex-wrap: wrap;
}

.search-input-container {
  position: relative;
  flex: 1;
}

.search-input-container input {
  width: 100%;
  padding: 12px 16px;
  padding-right: 40px;
  border: 1px solid #dddddd;
  border-radius: 6px;
  font-size: 16px;
  box-sizing: border-box;
}

.clear-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 20px;
  color: #999;
  cursor: pointer;
  padding: 0 5px;
  line-height: 1;
  transition: color 0.3s ease;
}

.clear-button:hover {
  color: #333;
}

.search-button {
  padding: 12px 24px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-sizing: border-box;
}

.search-button:hover {
  background-color: #2980b9;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
}

.filter-select {
  padding: 12px 16px;
  border: 1px solid #dddddd;
  border-radius: 6px;
  font-size: 16px;
  outline: none;
  cursor: pointer;
  transition: border-color 0.3s ease;
  box-sizing: border-box;
}

.filter-select:focus {
  border-color: #3498db;
}

.filter-button {
  padding: 12px 24px;
  background-color: #95a5a6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-sizing: border-box;
}

.filter-button:hover {
  background-color: #7f8c8d;
}

.date-filter {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  padding: 15px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
}

.date-input {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s ease;
}

.date-input:focus {
  border-color: #3498db;
}

.apply-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s ease;
}

.apply-button:hover {
  background-color: #2980b9;
}

.publish-button {
  padding: 12px 24px;
  background-color: #27ae60;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-sizing: border-box;
}

.publish-button:hover {
  background-color: #219a52;
}

/* 轮播图 */
.carousel {
  position: relative;
  width: 100%;
  height: 300px;
  overflow: hidden;
  border-radius: 12px;
  margin-bottom: 30px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  box-sizing: border-box;
}

.carousel-container {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease;
}

.carousel-slide {
  flex: 0 0 100%;
  position: relative;
  height: 100%;
}

.carousel-slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.7), transparent);
  color: white;
  padding: 30px;
}

.carousel-caption h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.carousel-caption p {
  margin: 0;
  font-size: 16px;
  opacity: 0.9;
}

.carousel-indicators {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

.carousel-indicators span {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.carousel-indicators span.active {
  background-color: white;
  width: 30px;
  border-radius: 6px;
}

/* 活动列表 */
.activity-list {
  margin-bottom: 30px;
}

.activity-list h2 {
  margin-bottom: 20px;
  color: #333333;
  font-size: 20px;
}

.activity-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.activity-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.card-image {
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.activity-card:hover .card-image img {
  transform: scale(1.05);
}

.card-content {
  padding: 15px;
}

.card-content h3 {
  margin: 0 0 10px 0;
  color: #333333;
  font-size: 18px;
}

.card-description {
  margin: 0 0 15px 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12px;
  color: #999999;
}

.activity-status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.activity-status.upcoming {
  background-color: #e3f2fd;
  color: #1976d2;
}

.activity-status.ongoing {
  background-color: #e8f5e8;
  color: #388e3c;
}

.activity-status.ended {
  background-color: #ffebee;
  color: #d32f2f;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .sidebar {
    width: 200px;
  }
  
  .main-content {
    margin-left: 200px;
    padding: 15px;
  }
  
  .carousel {
    height: 200px;
  }
  
  .activity-cards {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .sidebar {
    width: 100%;
    height: auto;
    position: relative;
  }
  
  .main-content {
    margin-left: 0;
    height: calc(100vh - 120px);
  }
  
  .index-container {
    flex-direction: column;
  }
  
  .nav-menu ul {
    display: flex;
    overflow-x: auto;
  }
  
  .nav-menu li {
    white-space: nowrap;
    border-right: 1px solid rgba(255, 255, 255, 0.1);
  }
}
</style>