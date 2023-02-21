import request from '@/utils/request'

export function fetchTeacherList(query) {
  return request({
    url: 'http://localhost:8001/edu/management/teacher/queryByPage',
    method: 'put',
    data: query.eduTeacherQuery,
    params: {
      currentPage: query.currentPage,
      rows: query.rows
    }
  })
}

export function fetchList(query) {
  return request({
    url: '/vue-element-admin/article/list',
    method: 'get',
    params: query
  })
}

export function fetchArticle(id) {
  return request({
    url: '/vue-element-admin/article/detail',
    method: 'get',
    params: { id }
  })
}

export function fetchPv(pv) {
  return request({
    url: '/vue-element-admin/article/pv',
    method: 'get',
    params: { pv }
  })
}

export function addTeacher(data) {
  return request({
    url: 'http://localhost:8001/edu/management/teacher/add',
    method: 'post',
    data
  })
}

export function updateTeacher(data) {
  return request({
    url: 'http://localhost:8001/edu/management/teacher/update',
    method: 'post',
    data
  })
}

export function removeTeacher(id) {
  return request({
    url: `http://localhost:8001/edu/management/teacher/delete/${id}`,
    method: 'get'
  })
}

