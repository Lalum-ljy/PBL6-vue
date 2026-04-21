# 这是第五次提交 4.21
### 这是PBL6项目的前端部分，母项目：https://github.com/Lalum-ljy/PBL6-7
### 关于本次提交
- 完成了我的活动页面的编辑和删除功能（刚才忘做了）




# 这是第四次提交 4.21
### 这是PBL6项目的前端部分，母项目：https://github.com/Lalum-ljy/PBL6-7
### 关于本次提交
- **新增了myself.vue和setting.vue页面**
- myself.vue(我的活动页面)
  - 通过调用/api/activity/creator接口，展示当前用户创建的活动，可以用列表和卡片两种方式展示
- setting.vue（设置页面）
  - 创建了一个基础的设置页面，实现了日期格式函数设置，时区设置；图片上传大小和格式限制，图片压缩设置，黑夜模式等
  - **注意：功能均未经过测试（Not only that 黑夜模式因为盒模型层级问题时有问题的，记得修复）**
- **至此，普通用户界面的前端demo功能已经完善**后续更新计划请查看主项目分支中的后续任务




# 这是第三次提交 4.1
### 这是PBL6项目的前端部分，母项目：https://github.com/Lalum-ljy/PBL6-7
### 关于本次提交
- 导航栏增加了ai助手按钮，可以打开ai助手对话框
  - 对话框可以自由拖动
  - 适配了接口api/chat



# 这是第三次提交 4.1
### 这是PBL6项目的前端部分，母项目：https://github.com/Lalum-ljy/PBL6-7
### 关于本次提交
- 导航栏增加了ai助手按钮，可以打开ai助手对话框
  - 对话框可以自由拖动
  - 适配了接口api/chat



# 这是第二次提交 3.28
### 这是PBL6项目的前端部分，母项目：https://github.com/Lalum-ljy/PBL6-7
### 关于本次提交
- 小改登录页面（增加了背景的淡色圆形，小改不加图）
- 彻底优化了导航栏样式
   - 发现原本的导航栏竟然不是组件，现在的ai降智真的有点严重了
   - 增加了导航栏折叠功能（折叠后样式待优化）
- index页面增加了公告显示
  <img width="50%" height="50%" alt="image" src="https://github.com/user-attachments/assets/4f8ad010-e8aa-4774-903d-835dc689d869" />
- 增加了活动二级页面显示（样式待优化）
- 增加了创建活动二级页面显示（样式待优化）




# 这是第一次提交 3.24
### 这是PBL6项目的前端部分，母项目：https://github.com/Lalum-ljy/PBL6-7
### 关于本次提交
**这是前端的第一个版本，本次提交实现了三个页面**
- 登录注册页面
  - 登录&注册
    - 响应式布局
    - 登录时小人的眼部和组成是小人的手部会跟随鼠标小范围移动，提供情绪价值（mousemove监听）
    - transform状态切换动画
<img width="50%" height="50%" alt="image" src="https://github.com/user-attachments/assets/e7d5e122-3126-43ea-9838-c94420d4c999" />
<img width="50%" height="50%" alt="image" src="https://github.com/user-attachments/assets/9c57d88a-01e4-40c2-8f25-f06f8dabffe0" />

- 主页面
  - 如图所示，标准的vue布局，暂未做特殊优化
<img width="50%" height="50%" alt="image" src="https://github.com/user-attachments/assets/538be0bc-72ea-4a50-8252-14c8a0bb01e2" />

- 热门活动页面
  - 依旧如图所示，常规，无聊，无趣，呆板，空洞乏味，毫无灵魂，生硬刻板，索然无味，千篇一律，味同嚼蜡，平庸至极，毫无温度，敷衍了事，毫无亮点，死气沉沉，毫无共情，毫无思考，毫无质感，毫无惊喜，毫无格调；没有优化的，缺乏新意的，匮乏灵感的，缺少人文关怀的，犹如AI生成的，好似复制粘贴的，如同冰冷模板堆砌的。
<img width="50%" height="50%" alt="image" src="https://github.com/user-attachments/assets/02fe0c95-3ff0-4376-a82d-5dc6374a4b0b" />
