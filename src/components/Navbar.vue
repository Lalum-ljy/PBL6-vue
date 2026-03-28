<template>
  <div class="sidebar" :class="{ collapsed: isCollapsed }">
    <!-- 随机圆形背景 -->
    <div class="circle-container" v-if="!isCollapsed">
      <div 
        v-for="(circle, index) in circles" 
        :key="index" 
        class="circle" 
        :style="circle.style"
      ></div>
    </div>
    <div class="logo">
      <h2 v-if="!isCollapsed">活动管理</h2>
      <div class="user-info" v-if="!isCollapsed">
        欢迎 {{ username }} 登录
      </div>
      <button class="collapse-btn" @click="toggleCollapse">
        {{ isCollapsed ? '→' : '←' }}
      </button>
    </div>

    <nav class="nav-menu">
      <ul>
        <li :class="{ active: activeMenu === 'home' }" @click="navigate('home')">
          <span class="menu-text" v-if="!isCollapsed">主页</span>
        </li>
        <li :class="{ active: activeMenu === 'hot' }" @click="navigate('hot')">
          <span class="menu-text" v-if="!isCollapsed">热门活动</span>
        </li>
        <li :class="{ active: activeMenu === 'my' }" @click="navigate('my')">
          <span class="menu-text" v-if="!isCollapsed">我的活动</span>
        </li>
        <li :class="{ active: activeMenu === 'settings' }" @click="navigate('settings')">
          <span class="menu-text" v-if="!isCollapsed">设置</span>
        </li>
      </ul>

      <div class="logout-container">
        <li class="logout" @click="logout">
          <span class="menu-text" v-if="!isCollapsed">退出登录</span>
        </li>
      </div>
    </nav>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  activeMenu: {
    type: String,
    default: 'home'
  }
});

const router = useRouter();
const username = ref('');
const isCollapsed = ref(false);
const circles = ref([]);

// 生成随机圆形
const generateCircles = () => {
  const circleList = [];
  const totalCircles = 8; // 总圆形数量
  
  // 固定随机种子，确保每次生成的圆形位置和大小都是固定的
  const seed = 55;
  let currentSeed = seed;
  
  // 简单的伪随机数生成函数
  const random = () => {
    currentSeed = (currentSeed * 9301 + 49297) % 233280;
    return currentSeed / 233280;
  };
  
  for (let i = 0; i < totalCircles; i++) {
    // 计算位置，底部到上部逐渐减少
    // 让更多的圆形集中在底部
    const positionFactor = i / totalCircles; // 0 到 1
    // 使用平方关系，让底部的圆形密度更高
const randomY = 1 - random() * (1 - Math.pow(positionFactor, 0.5) * 0.8);// 底部更多，上部更少
    
    // 随机大小
    const size = random() * 80 + 20;
    
    // 随机颜色，使用淡色
    const opacity = random() * 0.15 + 0.05;
    const colors = ['#ffffff', '#f0f0f0', '#e0e0e0', '#d0d0d0'];
    const color = colors[Math.floor(random() * colors.length)];
    
    // 随机水平位置
    const randomX = random() * 80 + 10; // 10% 到 90%
    
    circleList.push({
      style: {
        width: `${size}px`,
        height: `${size}px`,
        left: `${randomX}%`,
        top: `${randomY * 100}%`,
        backgroundColor: color,
        opacity: opacity
      }
    });
  }
  
  circles.value = circleList;
};

onMounted(() => {
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
  
  // 生成圆形
  generateCircles();
});

const toggleCollapse = () => {
  isCollapsed.value = !isCollapsed.value;
};

const navigate = (menu) => {
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

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  router.push('/');
};
</script>

<style scoped>
/* 侧边栏整体 - 渐变活力蓝 */
.sidebar {
  width: 260px;
  background: #6b93c7;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  left: 0;
  top: 0;
  z-index: 100;
  box-shadow: 3px 0 15px rgba(67, 100, 247, 0.15);
  border-radius: 0 16px 16px 0;
  overflow: hidden;
  transition: width 0.3s ease;
}

/* 圆形容器 */
.circle-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}

/* 圆形样式 */
.circle {
  position: absolute;
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition: all 0.3s ease;
}

/* 折叠状态 */
.sidebar.collapsed {
  width: 70px;
  border-radius: 0;
}

/* 折叠按钮 */
.collapse-btn {
  position: absolute;
  top: 20px;
  right: 15px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  z-index: 10;
}

.collapse-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.1);
}

/* LOGO 区域 */
.logo {
  padding: 32px 24px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  position: relative;
  z-index: 10;
}

.logo h2 {
  margin: 0 0 12px 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  transition: opacity 0.3s ease;
}

.user-info {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.85);
  font-weight: 400;
  transition: opacity 0.3s ease;
}

/* 导航菜单 */
.nav-menu {
  flex: 1;
  padding: 20px 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 10;
}

.nav-menu ul {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
}

/* 菜单项 */
.nav-menu li {
  margin: 4px 16px;
  padding: 14px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: all 0.28s ease;
  font-weight: 500;
  justify-content: center;
}

/* 悬浮效果 */
.nav-menu li:hover {
  background-color: rgba(255, 255, 255, 0.15);
  transform: translateX(4px);
}

/* 选中状态 */
.nav-menu li.active {
  background: rgba(255, 255, 255, 0.25);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-weight: 600;
}

.menu-text {
  font-size: 15px;
  letter-spacing: 0.3px;
  transition: opacity 0.3s ease;
}

/* 退出登录 */
.logout-container {
  margin-top: auto;
  padding: 0 16px 24px;
  position: relative;
  z-index: 10;
}

.logout {
  background-color: rgba(255, 67, 54, 0.15);
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}

.logout:hover {
  background-color: #ff4336 !important;
  color: #fff;
  transform: none !important;
  box-shadow: 0 6px 12px rgba(255, 67, 54, 0.25);
}

/* 响应式 */
@media (max-width: 768px) {
  .sidebar {
    width: 70px;
    border-radius: 0;
  }

  .logo h2,
  .user-info,
  .menu-text {
    display: none;
  }

  .nav-menu li {
    padding: 16px 0;
    justify-content: center;
    margin: 4px 8px;
  }
}
</style>