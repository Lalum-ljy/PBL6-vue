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
        <li class="ai-assistant" @click="openAIDialog">
          <span class="menu-text" v-if="!isCollapsed">AI 助手</span>
        </li>
      </ul>

      <div class="logout-container">
        <li class="logout" @click="logout">
          <span class="menu-text" v-if="!isCollapsed">退出登录</span>
        </li>
      </div>
    </nav>

    <!-- AI 助手对话框 -->
    <div class="ai-dialog" v-if="showAIDialog" :style="{ left: dialogPosition.x + 'px', top: dialogPosition.y + 'px' }">
      <div class="ai-dialog-header" @mousedown="startDrag" @mousemove="drag" @mouseup="endDrag" @mouseleave="endDrag">
        <h3>AI 助手</h3>
        <button class="close-btn" @click="closeAIDialog">&times;</button>
      </div>
      <div class="ai-dialog-body">
        <div class="chat-messages">
          <div class="message" v-for="(msg, index) in chatMessages" :key="index" :class="{ 'ai-message': msg.sender === 'ai', 'user-message': msg.sender === 'user' }">
            <div class="message-content">{{ msg.content }}</div>
          </div>
        </div>
        <div class="chat-input">
          <input type="text" v-model="userInput" @keyup.enter="sendMessage" placeholder="输入您的问题...">
          <button @click="sendMessage">发送</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { chat } from '../api/activity';

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

// AI 助手相关
const showAIDialog = ref(false);
const userInput = ref('');
const chatMessages = ref([
  { sender: 'ai', content: '你好，我是 AI 助手，有什么可以帮助你的吗？' }
]);

// 拖动相关
const dialogPosition = ref({ x: 0, y: 0 });
const isDragging = ref(false);
const dragStart = ref({ x: 0, y: 0 });

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
      router.push('/myself');
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

// AI 助手相关方法
const openAIDialog = () => {
  // 重置对话框位置到屏幕中央
  dialogPosition.value = {
    x: window.innerWidth / 2 - 200, // 200 是对话框宽度的一半
    y: window.innerHeight / 2 - 200 // 200 是对话框高度的一半
  };
  showAIDialog.value = true;
};

const closeAIDialog = () => {
  showAIDialog.value = false;
};

const sendMessage = async () => {
  if (!userInput.value.trim()) return;
  
  // 添加用户消息
  chatMessages.value.push({ sender: 'user', content: userInput.value });
  const input = userInput.value;
  userInput.value = '';
  
  try {
    // 调用聊天接口
    const response = await chat(input);
    if (response.code === 200 || response.code === 0) {
      // 添加 AI 回复
      chatMessages.value.push({ sender: 'ai', content: response.data });
    } else {
      chatMessages.value.push({ sender: 'ai', content: '抱歉，我暂时无法回答你的问题，请稍后再试。' });
    }
  } catch (error) {
    console.error('聊天接口调用失败:', error);
    chatMessages.value.push({ sender: 'ai', content: '抱歉，我暂时无法回答你的问题，请稍后再试。' });
  }
};

// 拖动相关方法
const startDrag = (event) => {
  isDragging.value = true;
  dragStart.value = {
    x: event.clientX - dialogPosition.value.x,
    y: event.clientY - dialogPosition.value.y
  };
};

const drag = (event) => {
  if (isDragging.value) {
    dialogPosition.value = {
      x: event.clientX - dragStart.value.x,
      y: event.clientY - dragStart.value.y
    };
  }
};

const endDrag = () => {
  isDragging.value = false;
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

.ai-assistant {
  background-color: rgba(76, 175, 80, 0.3);
  border-radius: 10px;
  text-align: center;
  font-weight: 600;
}

.ai-assistant:hover {
  background-color: #4caf50 !important;
  color: #fff;
  transform: none !important;
  box-shadow: 0 6px 12px rgba(76, 175, 80, 0.25);
}

.logout {
  background-color: rgba(255, 67, 54, 0.3);
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

/* AI 助手对话框 */
.ai-dialog {
  position: fixed;
  left: 50%;
  top: 50%;
  width: 400px;
  max-width: 90vw;
  max-height: 80vh;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  overflow: hidden;
  color: #333;
  cursor: move;
}

.ai-dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  background: #f5f5f5;
}

.ai-dialog-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #e0e0e0;
  color: #333;
}

.ai-dialog-body {
  display: flex;
  flex-direction: column;
  height: 400px;
  max-height: 70vh;
}

.chat-messages {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.message {
  max-width: 80%;
  padding: 10px 14px;
  border-radius: 18px;
  word-wrap: break-word;
}

.ai-message {
  align-self: flex-start;
  background: #f0f0f0;
  color: #333;
  border-bottom-left-radius: 4px;
}

.user-message {
  align-self: flex-end;
  background: #4caf50;
  color: white;
  border-bottom-right-radius: 4px;
}

.chat-input {
  display: flex;
  padding: 16px 20px;
  border-top: 1px solid #e0e0e0;
  gap: 10px;
  background: #f5f5f5;
}

.chat-input input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  font-size: 14px;
  outline: none;
  transition: all 0.2s ease;
}

.chat-input input:focus {
  border-color: #4caf50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.chat-input button {
  padding: 0 20px;
  background: #4caf50;
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chat-input button:hover {
  background: #45a049;
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(76, 175, 80, 0.2);
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
  
  .ai-dialog {
    width: 95vw;
    max-width: 95vw;
    max-height: 85vh;
  }
  
  .ai-dialog-body {
    height: 300px;
  }
  
  .chat-input input {
    padding: 8px 12px;
  }
  
  .chat-input button {
    padding: 0 16px;
  }
}
</style>