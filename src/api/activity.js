import service from './axios';

// 获取所有活动列表
export const getAllActivities = (page = 1, size = 10) => {
  return service.get('/activity', {
    params: {
      page,
      size
    }
  });
};

// 搜索活动（关键词）
export const searchActivities = (keyword) => {
  return service.get('/activity/search', {
    params: { keyword }
  });
};

// 获取热门活动列表
export const getHotActivities = () => {
  return service.get('/activity/hot');
};

// 按状态获取活动
export const getActivitiesByStatus = (status) => {
  return service.get(`/activity/status/${status}`);
};

// 按时间范围获取活动
export const getActivitiesByTimeRange = (startTime, endTime) => {
  return service.get('/activity/time-range', {
    params: {
      startTime,
      endTime
    }
  });
};

// 获取活动详情
export const getActivityDetail = (id) => {
  return service.get(`/activity/${id}`);
};

// 获取公告列表
export const getNotices = () => {
  return service.get('/notice');
};

// 创建活动
export const createActivity = (data) => {
  return service.post('/activity', data);
};

// 更新活动
export const updateActivity = (id, data) => {
  return service.put(`/activity/${id}`, data);
};

// 删除活动
export const deleteActivity = (id) => {
  return service.delete(`/activity/${id}`);
};
