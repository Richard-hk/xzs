<template>
  <div style="line-height:1.8">
    <div v-if="qType==10 || qType==11 || qType==12" v-loading="qLoading">
      <div class="q-title" v-html="question.title"/>
      <div class="q-content">
        <span :key="item.id" v-for="item in question.items" class="q-item-contain" style="display: block;">
          <span class="q-item-prefix">{{item.prefix}}</span>
          <span v-html="item.content" class="q-item-content"></span>
        </span>
      </div>
    </div>
    <div v-else-if="qType==20" v-loading="qLoading">
      <div class="q-title" v-html="question.title"/>
      <div class="q-content">
        <p>
          <span :key="item.id" v-for="item in question.items" class="q-item-contain" style="display: block;">
            <span class="q-item-prefix">{{item.prefix}}</span>
            <span v-html="item.content" class="q-item-content"></span>
          </span>
          </p>
          <br/>
      </div>
    </div>
    <div v-else-if="qType==30" v-loading="qLoading">
      <div class="q-title" v-html="question.title" style="display: inline;margin-right: 10px"/>
      <span>（</span>
      <span :key="item.id" v-for="item in question.items">
        <span v-html="item.content" class="q-item-content"></span>
       </span>
      <span>）</span>
    </div>
    <div v-else-if="qType==40" v-loading="qLoading">
      <div class="q-title" v-html="question.title"/>
    </div>
    <div v-else-if="qType==50" v-loading="qLoading">
      <div class="q-title" v-html="question.title"/>
    </div>
    <div v-else>
    </div>
  </div>

</template>

<script>
export default {
  name: 'QuestionShow',
  props: {
    question: {
      type: Object,
      default: function () {
        return {}
      }
    },
    qLoading: {
      type: Boolean,
      default: false
    },
    qType: {
      type: Number,
      default: 0
    }
  },
  methods: {}
}
</script>
