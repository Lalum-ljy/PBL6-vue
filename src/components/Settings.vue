<template>
  <div class="settings-page-container">
    <!-- 左侧导航栏 -->
    <Navbar :activeMenu="'settings'" />
    
    <!-- 右侧主内容区 -->
    <div class="main-content">
      <div class="settings-header">
        <h2>系统设置</h2>
      </div>
      
      <div class="settings-container">
        <!-- 基本设置 -->
        <div class="settings-section">
          <h3 class="section-title">基本设置</h3>
          <div class="settings-card">
            <!-- 日期时间格式 -->
            <div class="setting-item">
              <label class="setting-label">日期时间格式</label>
              <div class="setting-control">
                <select v-model="settings.dateTimeFormat" class="form-select">
                  <option value="YYYY-MM-DD HH:mm:ss">YYYY-MM-DD HH:mm:ss</option>
                  <option value="DD/MM/YYYY HH:mm:ss">DD/MM/YYYY HH:mm:ss</option>
                  <option value="MM/DD/YYYY HH:mm:ss">MM/DD/YYYY HH:mm:ss</option>
                  <option value="YYYY年MM月DD日 HH时mm分ss秒">YYYY年MM月DD日 HH时mm分ss秒</option>
                </select>
              </div>
            </div>
            
            <!-- 默认时区 -->
            <div class="setting-item">
              <label class="setting-label">默认时区</label>
              <div class="setting-control">
                <select v-model="settings.timeZone" class="form-select">
                  <option value="Asia/Shanghai">中国标准时间 (UTC+8)</option>
                  <option value="America/New_York">美国东部时间 (UTC-5)</option>
                  <option value="Europe/London">英国标准时间 (UTC+0)</option>
                  <option value="Asia/Tokyo">日本标准时间 (UTC+9)</option>
                  <option value="Australia/Sydney">澳大利亚东部时间 (UTC+10)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 上传设置 -->
        <div class="settings-section">
          <h3 class="section-title">上传设置</h3>
          <div class="settings-card">
            <!-- 图片大小限制 -->
            <div class="setting-item">
              <label class="setting-label">图片大小限制 (MB)</label>
              <div class="setting-control">
                <input 
                  type="number" 
                  v-model.number="settings.imageSizeLimit" 
                  class="form-input" 
                  min="1" 
                  max="50"
                  step="1"
                >
              </div>
            </div>
            
            <!-- 允许的图片格式 -->
            <div class="setting-item">
              <label class="setting-label">允许的图片格式</label>
              <div class="setting-control">
                <div class="checkbox-group">
                  <label class="checkbox-item" v-for="format in imageFormats" :key="format.value">
                    <input 
                      type="checkbox" 
                      :value="format.value" 
                      v-model="settings.allowedImageFormats"
                    >
                    {{ format.label }}
                  </label>
                </div>
              </div>
            </div>
            
            <!-- 图片压缩配置 -->
            <div class="setting-item">
              <label class="setting-label">图片压缩质量</label>
              <div class="setting-control">
                <input 
                  type="range" 
                  v-model.number="settings.imageCompressionQuality" 
                  class="form-range" 
                  min="10" 
                  max="100"
                  step="5"
                >
                <span class="range-value">{{ settings.imageCompressionQuality }}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 外观设置 -->
        <div class="settings-section">
          <h3 class="section-title">外观设置</h3>
          <div class="settings-card">
            <!-- 黑夜模式 -->
            <div class="setting-item">
              <label class="setting-label">黑夜模式</label>
              <div class="setting-control">
                <label class="switch">
                  <input type="checkbox" v-model="settings.darkMode" @change="toggleDarkMode">
                  <span class="slider"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 操作按钮 -->
        <div class="settings-actions">
          <button class="btn save-btn" @click="saveSettings">保存设置</button>
          <button class="btn reset-btn" @click="resetSettings">恢复默认</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import Navbar from './Navbar.vue';

const settings = ref({
  dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
  timeZone: 'Asia/Shanghai',
  imageSizeLimit: 5,
  allowedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  imageCompressionQuality: 80,
  darkMode: false
});

const imageFormats = [
  { value: 'jpg', label: 'JPG' },
  { value: 'jpeg', label: 'JPEG' },
  { value: 'png', label: 'PNG' },
  { value: 'gif', label: 'GIF' },
  { value: 'webp', label: 'WebP' },
  { value: 'svg', label: 'SVG' }
];

const loadSettings = () => {
  const savedSettings = localStorage.getItem('appSettings');
  if (savedSettings) {
    try {
      const parsedSettings = JSON.parse(savedSettings);
      settings.value = { ...settings.value, ...parsedSettings };
      // 应用黑夜模式
      applyDarkMode(settings.value.darkMode);
    } catch (error) {
      console.error('解析设置失败:', error);
    }
  }
};

const saveSettings = () => {
  localStorage.setItem('appSettings', JSON.stringify(settings.value));
  showNotification('设置已保存');
};

const resetSettings = () => {
  settings.value = {
    dateTimeFormat: 'YYYY-MM-DD HH:mm:ss',
    timeZone: 'Asia/Shanghai',
    imageSizeLimit: 5,
    allowedImageFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    imageCompressionQuality: 80,
    darkMode: false
  };
  localStorage.removeItem('appSettings');
  applyDarkMode(false);
  showNotification('设置已恢复默认');
};

const toggleDarkMode = () => {
  applyDarkMode(settings.value.darkMode);
};

const applyDarkMode = (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
};

const showNotification = (message) => {
  // 创建通知元素
  const notification = document.createElement('div');
  notification.className = 'settings-notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  // 显示通知
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  // 3秒后隐藏通知
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
};

onMounted(() => {
  loadSettings();
});
</script>

<style scoped>
.settings-page-container {
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

/* 当导航栏折叠时 */
.sidebar.collapsed + .main-content {
  margin-left: 70px;
  width: calc(100% - 70px);
}

.settings-header {
  margin-bottom: 30px;
  width: 100%;
}

.settings-header h2 {
  margin: 0;
  color: #333333;
  font-size: 24px;
  font-weight: 600;
}

.settings-container {
  width: 100%;
}

.settings-section {
  margin-bottom: 30px;
}

.section-title {
  margin: 0 0 15px 0;
  color: #333333;
  font-size: 18px;
  font-weight: 600;
  padding-bottom: 8px;
  border-bottom: 2px solid #e0e0e0;
}

.settings-card {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.setting-item {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.setting-item:last-child {
  margin-bottom: 0;
  padding-bottom: 0;
  border-bottom: none;
}

.setting-label {
  flex: 0 0 200px;
  font-size: 15px;
  font-weight: 500;
  color: #333333;
}

.setting-control {
  flex: 1;
  display: flex;
  align-items: center;
}

.form-select {
  width: 100%;
  max-width: 300px;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.form-select:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.form-input {
  width: 100%;
  max-width: 100px;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  color: #333333;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.checkbox-group {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
}

.checkbox-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.form-range {
  flex: 1;
  max-width: 300px;
  margin-right: 15px;
  cursor: pointer;
}

.range-value {
  font-size: 14px;
  color: #1890ff;
  font-weight: 600;
  min-width: 50px;
}

.switch {
  position: relative;
  display: inline-block;
  width: 60px;
  height: 34px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 26px;
  width: 26px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #1890ff;
}

input:checked + .slider:before {
  transform: translateX(26px);
}

.settings-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn {
  padding: 10px 24px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn {
  background-color: #1890ff;
  color: white;
}

.save-btn:hover {
  background-color: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.reset-btn {
  background-color: #f5f5f5;
  color: #333333;
  border: 1px solid #d9d9d9;
}

.reset-btn:hover {
  background-color: #e6f7ff;
  border-color: #91d5ff;
  color: #1890ff;
  transform: translateY(-2px);
}

.settings-notification {
  position: fixed;
  top: 20px;
  right: 20px;
  background-color: #52c41a;
  color: white;
  padding: 12px 24px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
  transform: translateX(100%);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 3000;
}

.settings-notification.show {
  transform: translateX(0);
  opacity: 1;
}

@media (max-width: 768px) {
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .setting-label {
    flex: none;
    width: 100%;
  }
  
  .setting-control {
    width: 100%;
  }
  
  .form-select,
  .form-input {
    max-width: 100%;
  }
  
  .checkbox-group {
    justify-content: flex-start;
  }
  
  .settings-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
}

@media (max-width: 480px) {
  .settings-card {
    padding: 16px;
  }
  
  .setting-item {
    margin-bottom: 16px;
    padding-bottom: 16px;
  }
  
  .settings-actions {
    margin-top: 20px;
  }
}

/* 黑夜模式样式 */
:global(.dark-mode) .main-content {
  background-color: #1f1f1f;
  color: #e0e0e0;
}

:global(.dark-mode) .settings-header h2,
:global(.dark-mode) .section-title,
:global(.dark-mode) .setting-label,
:global(.dark-mode) .checkbox-item {
  color: #e0e0e0;
}

:global(.dark-mode) .settings-card {
  background-color: #2d2d2d;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

:global(.dark-mode) .setting-item {
  border-bottom: 1px solid #404040;
}

:global(.dark-mode) .form-select,
:global(.dark-mode) .form-input {
  background-color: #3d3d3d;
  border-color: #555;
  color: #e0e0e0;
}

:global(.dark-mode) .form-select:focus,
:global(.dark-mode) .form-input:focus {
  border-color: #40a9ff;
  box-shadow: 0 0 0 2px rgba(64, 169, 255, 0.3);
}

:global(.dark-mode) .reset-btn {
  background-color: #3d3d3d;
  border-color: #555;
  color: #e0e0e0;
}

:global(.dark-mode) .reset-btn:hover {
  background-color: #1f1f1f;
  border-color: #40a9ff;
  color: #40a9ff;
}
</style>