<template>
  <div class="login-container">
    <!-- 随机圆形背景 -->
    <div class="circle" v-for="n in 15" :key="n" :style="getCircleStyle(n)"></div>
    <div class="login-box" :class="{ 'active': isRegister }">
      <div class="left-box">
        <!-- 登录状态显示普通笑脸 -->
        <div v-if="!isRegister" class="face">
          <div class="eye left-eye">
            <div class="pupil"></div>
          </div>
          <div class="eye right-eye">
            <div class="pupil"></div>
          </div>
          <div class="mouth"></div>
        </div>
        
        <!-- 注册状态显示捂眼笑脸 -->
        <div v-else class="face">
          <div class="eye left-eye closed"></div>
          <div class="eye right-eye closed"></div>
          <div class="hand">✋</div>
          <div class="mouth"></div>
        </div>
      </div>
      <div class="right-box">
        <div class="form-container">
          <!-- 登录表单 -->
          <div v-if="!isRegister" class="form-content">
            <h2>登录</h2>
            <form class="login-form" @submit="handleLogin">
              <!-- 错误信息显示 -->
              <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
              
              <div class="form-group">
                <label for="login-username">账号</label>
                <input type="text" id="login-username" v-model="loginForm.username" placeholder="请输入账号" required>
              </div>
              <div class="form-group">
                <label for="login-password">密码</label>
                <input type="password" id="login-password" v-model="loginForm.password" placeholder="请输入密码" required>
              </div>
              <div class="form-actions">
                <div class="remember-me">
                  <input type="checkbox" id="remember" v-model="loginForm.rememberMe">
                  <label for="remember">记住密码</label>
                </div>
                <a href="#" class="register-link" @click.prevent="toggleForm">注册账号</a>
              </div>
              <button type="submit" class="login-button" :disabled="loading">
                {{ loading ? '登录中...' : '登录' }}
              </button>
            </form>
          </div>
          
          <!-- 注册表单 -->
          <div v-else class="form-content">
            <h2>注册</h2>
            <form class="login-form" @submit="handleRegister">
              <!-- 错误信息显示 -->
              <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
              
              <div class="form-group">
                <label for="register-username">账号</label>
                <input type="text" id="register-username" v-model="registerForm.username" placeholder="请输入账号" required>
              </div>
              <div class="form-group">
                <label for="register-password">密码</label>
                <input type="password" id="register-password" v-model="registerForm.password" placeholder="请输入密码" required>
              </div>
              <div class="form-actions">
                <div class="remember-me">
                  <a href="#" class="login-options">更多注册方式</a>
                </div>
                <a href="#" class="register-link" @click.prevent="toggleForm">返回登录</a>
              </div>
              <button type="submit" class="login-button" :disabled="loading">
                {{ loading ? '注册中...' : '注册' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { login, register } from '../api/user';

const router = useRouter();

// 生成随机圆形样式
const getCircleStyle = (index) => {
  // 固定种子，保证刷新页面位置不变
  const seed = index * 12345 + 6789;

  // 随机大小 50-200px
  const size = 50 + (seed % 150);

  // ✅ 关键：用不同的哈希算法，让 left / top 完全独立、真随机分布
  const hashLeft = x => {
    let h = x * 371 + 123;
    h ^= h << 17;
    h ^= h >> 13;
    h ^= h << 5;
    return (h & 0x7fffffff) % 100; // 0~99
  };

  const hashTop = x => {
    let h = x * 211 + 456;
    h ^= h << 15;
    h ^= h >> 11;
    h ^= h << 3;
    return (h & 0x7fffffff) % 100;
  };

  // 随机位置（全屏均匀分布）
  const left = hashLeft(seed);
  const top = hashTop(seed);

  // 淡色系随机颜色
  const hue = (seed * 137) % 360;
  const saturation = 30 + (seed % 20);
  const lightness = 80 + (seed % 10);
  const color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${left}%`,
    top: `${top}%`,
    backgroundColor: color,
    position: 'absolute',
    borderRadius: '50%',
  };
};

// 状态管理
const isRegister = ref(false);

// 登录表单数据
const loginForm = ref({
  username: '',
  password: '',
  rememberMe: false
});

// 注册表单数据
const registerForm = ref({
  username: '',
  password: ''
});

// 加载状态
const loading = ref(false);

// 错误信息
const errorMessage = ref('');

// 切换登录/注册表单
const toggleForm = () => {
  isRegister.value = !isRegister.value;
  errorMessage.value = ''; // 切换时清除错误信息
};

// 登录方法
const handleLogin = async (e) => {
  e.preventDefault();
  loading.value = true;
  errorMessage.value = '';
  
  try {
    console.log('开始登录');
    const response = await login({
      username: loginForm.value.username,
      password: loginForm.value.password
    });
    
    console.log('登录响应:', response);
    
    // 登录成功，保存 token 和用户信息
    if (response.code === 200 && response.data) {
      console.log('登录成功，保存 token');
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // 跳转到首页或其他页面
      console.log('跳转到首页');
      setTimeout(() => {
        router.push('/index');
      }, 100);
    } else {
      console.log('登录失败，响应:', response);
      throw new Error(response.message || '登录失败');
    }
  } catch (error) {
    console.error('登录失败:', error);
    errorMessage.value = error.response?.data?.message || error.message || '登录失败，请检查账号和密码';
  } finally {
    loading.value = false;
  }
};

// 注册方法
const handleRegister = async (e) => {
  e.preventDefault();
  loading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await register({
      userType: 0, // 默认用户类型
      username: registerForm.value.username,
      password: registerForm.value.password,
      realName: '',
      gender: 0,
      phone: '',
      email: '',
      schoolId: 0,
      college: '',
      major: '',
      grade: '',
      className: ''
    });
    
    if (response.code === 200) {
      console.log('注册成功:', response);
      alert('注册成功，请登录！');
      toggleForm(); // 切换到登录表单
    } else {
      throw new Error(response.message || '注册失败');
    }
  } catch (error) {
    console.error('注册失败:', error);
    errorMessage.value = error.response?.data?.message || error.message || '注册失败，请稍后重试';
  } finally {
    loading.value = false;
  }
};

// 实现眼球跟随鼠标移动的效果

onMounted(() => {
  const handleMouseMove = (e) => {
    // 处理眼球跟随鼠标移动
    const pupils = document.querySelectorAll('.pupil');
    if (pupils.length > 0) {
      const x = e.clientX;
      const y = e.clientY;
      
      pupils.forEach(pupil => {
        const eyeX = (x - window.innerWidth / 2) / 30;
        const eyeY = (y - window.innerHeight / 2) / 30;
        
        const maxMove = 10;
        const limitedX = Math.min(maxMove, Math.max(-maxMove, eyeX));
        const limitedY = Math.min(maxMove, Math.max(-maxMove, eyeY));
        
        pupil.style.transform = `translate(calc(-50% + ${limitedX}px), calc(-50% + ${limitedY}px))`;
      });
    }
    
    // 处理手跟随鼠标移动
    const hand = document.querySelector('.hand');
    if (hand) {
      const x = (e.clientX - window.innerWidth / 2) / 25;
      const y = (e.clientY - window.innerHeight / 2) / 25;
      
      const limit = 20;
      const moveX = Math.max(-limit, Math.min(limit, x));
      const moveY = Math.max(-limit, Math.min(limit, y));
      
      hand.style.transform = `translate(calc(-50% + ${moveX}px), ${moveY}px) rotate(45deg)`;
    }
  };
  
  document.addEventListener('mousemove', handleMouseMove);
  
  // 清理事件监听器
  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMouseMove);
  });
});
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  background-color: #e4ebfa;
  position: relative;
  overflow: hidden; 
  margin: 0;
}

/* 随机圆形样式 */
.circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.7;
  z-index: 0;
}

.login-box {
  position: relative;
  display: flex;
  width: 800px;
  height: 450px;
  background-color: #ffffff;
  border: 1px solid #dddddd;
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin: 20px;
  z-index: 1;
}

.left-box {
  position: absolute;
  top: 0;
  left: 0;
  width: 50%;
  height: 100%;
  background-image: url('../img/login.jpg');
  background-size: cover;
  background-position: center;
  z-index: 1;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 笑脸脸部 */
.face {
  width: 200px;
  height: 200px;
  background: #ffd700;
  border-radius: 50%;
  position: relative;
  box-shadow: 0 0 20px rgba(0,0,0,0.2);
}

/* 眼睛容器 - 普通眼睛 */
.eye {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 50%;
  position: absolute;
  top: 60px;
  overflow: hidden;
}

/* 闭合的眼睛 */
.eye.closed {
  width: 40px;
  height: 10px;
  background: transparent;
  border-top: 5px solid #2c3e50;
  border-radius: 50%;
  top: 70px;
}

/* 左眼位置 */
.left-eye {
  left: 40px;
}

/* 右眼位置 */
.right-eye {
  right: 40px;
}

/* 眼球 —— 会跟随鼠标 */
.pupil {
  width: 15px;
  height: 15px;
  background: #2c3e50;
  border-radius: 50%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

/* 嘴巴 */
.mouth {
  width: 80px;
  height: 40px;
  border-bottom: 8px solid #2c3e50;
  border-radius: 0 0 80px 80px;
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
}

/* 手：emoji ✋ */
.hand {
  position: absolute;
  top: 20px;
  left: 50%;
  font-size: 120px;
  z-index: 10;
  line-height: 1;
  transform-origin: center;
  transform: translateX(-50%) rotate(45deg);
}

.right-box {
  position: absolute;
  top: 0;
  right: 0;
  width: 50%;
  height: 100%;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  z-index: 2;
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  transform: translateX(0);
  box-sizing: border-box;
}

/* 切换动画 */
.login-box.active .left-box {
  z-index: 2;
  transform: translateX(100%);
}

.login-box.active .right-box {
  z-index: 1;
  transform: translateX(-100%);
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

.form-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  width: 100%;
  box-sizing: border-box;
}

h2 {
  margin-bottom: 20px;
  color: #333333;
  font-size: 24px;
  text-align: center;
  flex-shrink: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
  justify-content: center;
  box-sizing: border-box;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  color: #666666;
  font-size: 14px;
}

.form-group input {
  padding: 12px 16px;
  border: 1px solid #dddddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.1);
}

.login-options {
  font-size: 12px;
  color: #4299e1;
  text-decoration: none;
  transition: color 0.3s ease;
}

.login-options:hover {
  color: #3182ce;
  text-decoration: underline;
}

.error-message {
  color: #e53e3e;
  font-size: 14px;
  margin-bottom: 16px;
  padding: 8px 12px;
  background-color: #fed7d7;
  border-radius: 4px;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 8px;
}

.remember-me label {
  color: #666666;
  font-size: 14px;
  cursor: pointer;
}

.register-link {
  color: #4299e1;
  font-size: 14px;
  text-decoration: none;
  transition: color 0.3s ease;
  cursor: pointer;
}

.register-link:hover {
  color: #3182ce;
  text-decoration: underline;
}

.login-button {
  margin-top: 20px;
  padding: 14px;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.login-button:hover {
  background-color: #3182ce;
}

.login-button:active {
  transform: translateY(1px);
}

@media (max-width: 768px) {
  .login-box {
    width: 90%;
    height: auto;
    flex-direction: column;
  }
  
  .login-box.active {
    flex-direction: column;
  }
  
  .left-box {
    display: none;
  }
  
  .right-box {
    padding: 40px 30px;
  }
}
</style>