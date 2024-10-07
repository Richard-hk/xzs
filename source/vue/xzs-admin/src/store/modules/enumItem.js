// initial state
const state = {
  user: {
    sexEnum: [{ key: 1, value: '男' }, { key: 2, value: '女' }],
    statusEnum: [{ key: 1, value: '启用' }, { key: 2, value: '禁用' }],
    levelEnum: [{ key: 1, value: '初级' }, { key: 2, value: '中级' }, { key: 3, value: '高级' }],
    roleEnum: [{ key: 1, value: '学生' }, { key: 2, value: '教师' }, { key: 3, value: '管理员' }],
    statusTag: [{ key: 1, value: 'success' }, { key: 2, value: 'danger' }],
    statusBtn: [{ key: 1, value: '禁用' }, { key: 2, value: '启用' }]
  },
  exam: {
    examPaper: {
      paperTypeEnum: [{ key: 1, value: '固定试卷' }, { key: 4, value: '时段试卷' }, { key: 6, value: '任务试卷' }]
    },
    question: {
      typeEnum: [{ key: 10, value: '最佳选择题' }, { key: 11, value: '配伍选择题' }, { key: 12, value: '综合分析选择题' }, { key: 20, value: '多项选择题' }],
      editUrlEnum: [{ key: 10, value: '/exam/question/edit/singleChoice', name: '最佳选择题' },
        { key: 11, value: '/exam/question/edit/singleChoice', name: '配伍选择题' },
        { key: 12, value: '/exam/question/edit/singleChoice', name: '综合分析选择题' },
        { key: 20, value: '/exam/question/edit/multipleChoice', name: '多项选择题' }]
    }
  }
}

// getters
const getters = {
  enumFormat: (state) => (arrary, key) => {
    return format(arrary, key)
  }
}

// actions
const actions = {}

// mutations
const mutations = {}

const format = function (array, key) {
  for (let item of array) {
    if (item.key === key) {
      return item.value
    }
  }
  return null
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
