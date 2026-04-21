<template>
  <div class="myself-page-container">
    <!-- 左侧导航栏 -->
    <Navbar :activeMenu="'my'" />
    
    <!-- 右侧主内容区 -->
    <div class="main-content">
      <div class="myself-header">
        <h2>我的活动</h2>
        <div class="view-toggle">
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'card' }" 
            @click="viewMode = 'card'"
          >
            卡片视图
          </button>
          <button 
            class="toggle-btn" 
            :class="{ active: viewMode === 'list' }" 
            @click="viewMode = 'list'"
          >
            列表视图
          </button>
        </div>
      </div>
      
      <div v-if="loading" class="loading">加载中...</div>
      <div v-else-if="myActivities.length > 0" :class="['activities-container', viewMode]">
        <!-- 卡片视图 -->
        <div v-if="viewMode === 'card'" class="card-view">
          <div 
            class="activity-card" 
            v-for="(activity, index) in myActivities" 
            :key="index" 
            @click="openActivityDetail(activity)"
          >
            <div class="card-image">
              <img :src="activity.coverUrl || defaultImage" :alt="activity.activityName">
            </div>
            <div class="card-content">
              <h3 class="card-name">{{ activity.activityName }}</h3>
              <p class="card-desc">{{ activity.activityDesc }}</p>
              <div class="card-time">
                <span class="time-label">开始时间：</span>
                <span class="time-value">{{ formatTime(activity.startTime) }}</span>
              </div>
              <div class="card-footer">
                <span class="status-badge" :class="getStatusClass(activity.status)">
                  {{ getStatusText(activity.status) }}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 列表视图 -->
        <div v-else class="list-view">
          <div 
            class="list-item" 
            v-for="(activity, index) in myActivities" 
            :key="index" 
            @click="openActivityDetail(activity)"
          >
            <div class="item-image">
              <img :src="activity.coverUrl || defaultImage" :alt="activity.activityName">
            </div>
            <div class="item-content">
              <h3 class="item-name">{{ activity.activityName }}</h3>
              <p class="item-desc">{{ activity.activityDesc }}</p>
              <div class="item-time-row">
                <div class="item-time">
                  <span class="time-label">开始时间：</span>
                  <span class="time-value">{{ formatTime(activity.startTime) }}</span>
                </div>
                <div class="item-time">
                  <span class="time-label">结束时间：</span>
                  <span class="time-value">{{ formatTime(activity.endTime) }}</span>
                </div>
                <div class="item-status">
                  <span class="status-badge" :class="getStatusClass(activity.status)">
                    {{ getStatusText(activity.status) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty">暂无活动</div>
    </div>
    
    <!-- 活动详情弹窗 -->
    <div v-if="showDetailModal" class="modal-overlay active" @click="closeDetailModal">
      <div class="modal-container" @click.stop>
        <button class="modal-close-btn" @click="closeDetailModal">×</button>
        <div class="modal-content">
          <div class="modal-top-section">
            <div class="modal-image" v-if="selectedActivity?.coverUrl || selectedActivity?.image">
              <img :src="selectedActivity?.coverUrl || selectedActivity?.image" :alt="selectedActivity?.activityName || selectedActivity?.title">
            </div>
            <div class="modal-title-section">
              <h2>{{ selectedActivity?.activityName || selectedActivity?.title }}</h2>
              <div class="modal-time">开始时间：{{ formatTime(selectedActivity?.startTime) }}</div>
              <span class="modal-status" :class="getStatusClass(selectedActivity?.status)">
                {{ getStatusText(selectedActivity?.status) }}
              </span>
            </div>
          </div>
          <div class="modal-desc-section">
            <h3>活动描述：</h3>
            <p>{{ selectedActivity?.activityDesc || selectedActivity?.description }}</p>
          </div>
          <div class="modal-info">
            <div class="info-item">
              <label>结束时间：</label>
              <p>{{ formatTime(selectedActivity?.endTime) }}</p>
            </div>
            <div class="info-item">
              <label>创建者：</label>
              <p>{{ selectedActivity?.creator }}</p>
            </div>
            <div class="info-item">
              <label>创建时间：</label>
              <p>{{ formatTime(selectedActivity?.createTime) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { getActivitiesByCreator } from '../api/activity';
import Navbar from './Navbar.vue';

const IMG_DOMAIN = 'http://localhost:8080';
const viewMode = ref('card');
const loading = ref(false);
const myActivities = ref([]);
const defaultImage = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=default%20event%20image&image_size=landscape_4_3';

const showDetailModal = ref(false);
const selectedActivity = ref(null);

const getUsername = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const userObj = JSON.parse(userStr);
      return userObj.username || '用户';
    } catch (e) {
      console.error('解析用户信息失败:', e);
      return '用户';
    }
  }
  return '用户';
};

const fetchMyActivities = async () => {
  loading.value = true;
  try {
    const username = getUsername();
    const response = await getActivitiesByCreator(username);
    if (response.code === 200 && response.data) {
      const responseData = response.data.data || response.data;
      myActivities.value = responseData.map(activity => ({
        ...activity,
        coverUrl: activity.coverUrl ? IMG_DOMAIN + activity.coverUrl : activity.coverUrl
      }));
    }
  } catch (error) {
    console.error('获取我的活动失败:', error);
  } finally {
    loading.value = false;
  }
};

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

const getStatusClass = (status) => {
  switch (status) {
    case 0: return 'upcoming';
    case 1: return 'ongoing';
    case 2: return 'ended';
    default: return 'upcoming';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 0: return '即将开始';
    case 1: return '进行中';
    case 2: return '已结束';
    default: return '即将开始';
  }
};

const openActivityDetail = (activity) => {
  selectedActivity.value = activity;
  showDetailModal.value = true;
};

const closeDetailModal = () => {
  showDetailModal.value = false;
  selectedActivity.value = null;
};

onMounted(() => {
  fetchMyActivities();
});
</script>

<style scoped>
.myself-page-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
  background-color: #f5f5f5;
  height: 100vh;
  box-sizing: border-box;
  width: calc(100% - 260px);
  position: absolute;
  top: 0;
  right: 0;
  margin-left: 260px;
  transition: all 0.3s ease;
}

.myself-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  width: 100%;
}

.myself-header h2 {
  margin: 0;
  color: #333333;
  font-size: 24px;
  font-weight: 600;
}

.view-toggle {
  display: flex;
  gap: 10px;
}

.toggle-btn {
  padding: 8px 16px;
  border: 1px solid #d9d9d9;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #666;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.toggle-btn.active {
  background-color: #1890ff;
  border-color: #1890ff;
  color: white;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666666;
  font-size: 16px;
}

.empty {
  text-align: center;
  padding: 40px;
  color: #999999;
  font-size: 16px;
  width: 100%;
}

.activities-container {
  width: 100%;
}

.card-view {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.activity-card {
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.card-image {
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-name {
  margin: 0;
  color: #333333;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.4;
}

.card-desc {
  margin: 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-time {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #666666;
}

.time-label {
  font-weight: 500;
  color: #999999;
}

.time-value {
  color: #333333;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.list-view {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

.list-item {
  display: flex;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  width: 100%;
  cursor: pointer;
}

.list-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.item-image {
  flex-shrink: 0;
  width: 200px;
  height: 150px;
  overflow: hidden;
  border-radius: 12px 0 0 12px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-content {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-name {
  margin: 0;
  color: #333333;
  font-size: 18px;
  font-weight: 600;
}

.item-desc {
  margin: 0;
  color: #666666;
  font-size: 14px;
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.item-time-row {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: auto;
}

.item-time {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #666666;
}

.item-status {
  margin-left: auto;
}

.status-badge {
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 14px;
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

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
  visibility: visible;
}

.modal-container {
  width: 72%;
  max-width: 1100px;
  height: 75%;
  max-height: 85vh;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.18),
              0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transform: translateY(10px) scale(0.98);
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-overlay.active .modal-container {
  transform: translateY(0) scale(1);
}

.modal-close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.05);
  border: none;
  font-size: 22px;
  color: #555;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  z-index: 10;
}

.modal-close-btn:hover {
  background-color: #ff4757;
  color: white;
  transform: rotate(90deg) scale(1.05);
}

.modal-content {
  padding: 36px 40px;
  overflow-y: auto;
  flex: 1;
  height: 100%;
  scroll-behavior: smooth;
}

.modal-top-section {
  display: flex;
  gap: 36px;
  margin-bottom: 36px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.modal-image {
  width: 320px;
  height: 210px;
  border-radius: 14px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

.modal-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.modal-image:hover img {
  transform: scale(1.03);
}

.modal-title-section {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.modal-title-section h2 {
  margin: 0;
  color: #1a1a1a;
  font-size: 30px;
  font-weight: 600;
  line-height: 1.3;
  letter-spacing: -0.3px;
  text-align: left;
}

.modal-time {
  font-size: 16px;
  color: #666;
  font-weight: 500;
  text-align: left;
}

.modal-status {
  padding: 7px 14px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  align-self: flex-start;
  white-space: nowrap;
}

.modal-status.upcoming {
  background-color: #e6f4ff;
  color: #0b6bc1;
}

.modal-status.ongoing {
  background-color: #e6f7e6;
  color: #2e7d32;
}

.modal-status.ended {
  background-color: #ffebee;
  color: #c62828;
}

.modal-desc-section {
  margin-bottom: 36px;
}

.modal-desc-section h3 {
  margin: 0 0 16px 0;
  color: #222;
  font-size: 21px;
  font-weight: 600;
}

.modal-desc-section p {
  margin: 0;
  color: #555;
  font-size: 16px;
  line-height: 1.65;
  letter-spacing: 0.2px;
}

.modal-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  align-items: start;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item label {
  font-size: 14px;
  color: #999;
  font-weight: 500;
}

.info-item p {
  margin: 0;
  font-size: 16px;
  color: #333;
  font-weight: 500;
}

.activity-card:active,
.list-item:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}

@media (max-width: 768px) {
  .list-item {
    flex-direction: column;
  }
  
  .item-image {
    width: 100%;
    height: 200px;
    border-radius: 12px 12px 0 0;
  }
  
  .item-content {
    padding: 15px;
  }
  
  .item-name {
    font-size: 16px;
  }
  
  .item-desc {
    font-size: 13px;
  }
  
  .card-view {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
}

@media (max-width: 480px) {
  .myself-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
  
  .view-toggle {
    width: 100%;
  }
  
  .toggle-btn {
    flex: 1;
    text-align: center;
  }
  
  .card-view {
    grid-template-columns: 1fr;
  }
  
  .card-image {
    height: 200px;
  }
  
  .card-content {
    padding: 12px;
  }
  
  .card-name {
    font-size: 15px;
  }
  
  .card-desc {
    font-size: 13px;
  }
}
</style>